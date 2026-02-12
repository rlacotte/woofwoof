from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofID"])


# ---- Schemas ----

class TagCreate(BaseModel):
    dog_id: int
    tag_type: str = "qr"


class LostPetCreate(BaseModel):
    dog_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_seen_address: Optional[str] = None
    description: Optional[str] = None
    contact_phone: Optional[str] = None


class LostPetStatusUpdate(BaseModel):
    status: str  # found, closed


class SightingCreate(BaseModel):
    alert_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None


# ---- Pet Tags ----

@router.post("/id/tags")
def create_tag(
    data: TagCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == data.dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouve")

    tag_code = uuid.uuid4().hex[:12].upper()

    tag = models.PetTag(
        dog_id=data.dog_id,
        tag_code=tag_code,
        tag_type=data.tag_type,
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return {
        "id": tag.id, "dog_id": tag.dog_id, "tag_code": tag.tag_code,
        "tag_type": tag.tag_type, "is_active": tag.is_active,
        "scans_count": tag.scans_count, "created_at": str(tag.created_at),
    }


@router.get("/id/tags/dog/{dog_id}")
def get_tags_for_dog(
    dog_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouve")

    tags = db.query(models.PetTag).filter(models.PetTag.dog_id == dog_id).all()
    return [
        {
            "id": t.id, "dog_id": t.dog_id, "tag_code": t.tag_code,
            "tag_type": t.tag_type, "is_active": t.is_active,
            "scans_count": t.scans_count, "created_at": str(t.created_at),
        }
        for t in tags
    ]


@router.get("/id/tags/scan/{tag_code}")
def scan_tag(
    tag_code: str,
    db: Session = Depends(get_db),
):
    """Public endpoint - no auth required. Scan a tag and return dog info."""
    tag = db.query(models.PetTag).filter(
        models.PetTag.tag_code == tag_code,
        models.PetTag.is_active == True,
    ).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag non trouve ou desactive")

    tag.scans_count = (tag.scans_count or 0) + 1
    db.commit()

    dog = db.query(models.Dog).filter(models.Dog.id == tag.dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouve")

    owner = db.query(models.User).filter(models.User.id == dog.owner_id).first()

    return {
        "tag_code": tag.tag_code,
        "scans_count": tag.scans_count,
        "dog": {
            "name": dog.name,
            "breed": dog.breed,
            "photo_url": dog.photo_url_1,
        },
        "owner_contact": {
            "name": owner.full_name if owner else None,
            "phone": owner.phone if owner else None,
        },
    }


@router.delete("/id/tags/{tag_id}")
def deactivate_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tag = db.query(models.PetTag).filter(models.PetTag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag non trouve")

    dog = db.query(models.Dog).filter(
        models.Dog.id == tag.dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=403, detail="Acces refuse")

    tag.is_active = False
    db.commit()
    return {"status": "deactivated"}


# ---- Lost Pet Alerts ----

@router.post("/id/lost")
def report_lost_pet(
    data: LostPetCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == data.dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouve")

    alert = models.LostPetAlert(
        dog_id=data.dog_id,
        user_id=current_user.id,
        latitude=data.latitude,
        longitude=data.longitude,
        last_seen_address=data.last_seen_address,
        description=data.description,
        photo_url=dog.photo_url_1,
        contact_phone=data.contact_phone,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {
        "id": alert.id, "dog_id": alert.dog_id, "user_id": alert.user_id,
        "latitude": alert.latitude, "longitude": alert.longitude,
        "last_seen_address": alert.last_seen_address,
        "description": alert.description, "photo_url": alert.photo_url,
        "status": alert.status, "contact_phone": alert.contact_phone,
        "created_at": str(alert.created_at),
    }


@router.get("/id/lost")
def list_lost_alerts(
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.LostPetAlert).filter(models.LostPetAlert.status == "active")

    if city:
        query = query.filter(models.LostPetAlert.last_seen_address.ilike(f"%{city}%"))

    alerts = query.order_by(models.LostPetAlert.created_at.desc()).all()
    return [
        {
            "id": a.id, "dog_id": a.dog_id, "user_id": a.user_id,
            "latitude": a.latitude, "longitude": a.longitude,
            "last_seen_address": a.last_seen_address,
            "description": a.description, "photo_url": a.photo_url,
            "status": a.status, "contact_phone": a.contact_phone,
            "created_at": str(a.created_at),
        }
        for a in alerts
    ]


@router.get("/id/lost/{alert_id}")
def get_lost_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    alert = db.query(models.LostPetAlert).filter(models.LostPetAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerte non trouvee")

    sightings = (
        db.query(models.LostPetSighting)
        .filter(models.LostPetSighting.alert_id == alert_id)
        .order_by(models.LostPetSighting.created_at.desc())
        .all()
    )
    return {
        "id": alert.id, "dog_id": alert.dog_id, "user_id": alert.user_id,
        "latitude": alert.latitude, "longitude": alert.longitude,
        "last_seen_address": alert.last_seen_address,
        "description": alert.description, "photo_url": alert.photo_url,
        "status": alert.status, "contact_phone": alert.contact_phone,
        "created_at": str(alert.created_at),
        "sightings": [
            {
                "id": s.id, "alert_id": s.alert_id, "user_id": s.user_id,
                "latitude": s.latitude, "longitude": s.longitude,
                "description": s.description, "photo_url": s.photo_url,
                "created_at": str(s.created_at),
            }
            for s in sightings
        ],
    }


@router.put("/id/lost/{alert_id}/status")
def update_alert_status(
    alert_id: int,
    data: LostPetStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    alert = db.query(models.LostPetAlert).filter(
        models.LostPetAlert.id == alert_id,
        models.LostPetAlert.user_id == current_user.id,
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerte non trouvee")

    if data.status not in ("found", "closed"):
        raise HTTPException(status_code=400, detail="Statut invalide. Utilisez 'found' ou 'closed'")

    alert.status = data.status
    db.commit()
    db.refresh(alert)
    return {
        "id": alert.id, "dog_id": alert.dog_id, "status": alert.status,
    }


# ---- Lost Pet Sightings ----

@router.post("/id/sightings")
def report_sighting(
    data: SightingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    alert = db.query(models.LostPetAlert).filter(
        models.LostPetAlert.id == data.alert_id,
        models.LostPetAlert.status == "active",
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerte non trouvee ou inactive")

    sighting = models.LostPetSighting(
        alert_id=data.alert_id,
        user_id=current_user.id,
        latitude=data.latitude,
        longitude=data.longitude,
        description=data.description,
        photo_url=data.photo_url,
    )
    db.add(sighting)
    db.commit()
    db.refresh(sighting)
    return {
        "id": sighting.id, "alert_id": sighting.alert_id,
        "user_id": sighting.user_id, "latitude": sighting.latitude,
        "longitude": sighting.longitude, "description": sighting.description,
        "photo_url": sighting.photo_url, "created_at": str(sighting.created_at),
    }
