from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofTravel"])


# ---- Schemas ----

class PlaceCreate(BaseModel):
    name: str
    place_type: str
    city: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    amenities: Optional[str] = None
    photo_url: Optional[str] = None
    website: Optional[str] = None


class ChecklistCreate(BaseModel):
    dog_id: int
    destination: str
    departure_date: Optional[datetime] = None
    items_json: Optional[str] = None
    notes: Optional[str] = None


class ChecklistUpdate(BaseModel):
    items_json: Optional[str] = None
    notes: Optional[str] = None


# ---- Pet-Friendly Places ----

@router.get("/travel/places")
def list_places(
    place_type: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.PetFriendlyPlace)
    if place_type:
        query = query.filter(models.PetFriendlyPlace.place_type == place_type)
    if city:
        query = query.filter(models.PetFriendlyPlace.city.ilike(f"%{city}%"))
    if search:
        query = query.filter(
            models.PetFriendlyPlace.name.ilike(f"%{search}%")
            | models.PetFriendlyPlace.description.ilike(f"%{search}%")
        )
    places = query.order_by(models.PetFriendlyPlace.rating.desc()).all()
    return [
        {
            "id": p.id, "name": p.name, "place_type": p.place_type,
            "city": p.city, "address": p.address, "latitude": p.latitude,
            "longitude": p.longitude, "rating": p.rating,
            "description": p.description, "amenities": p.amenities,
            "photo_url": p.photo_url, "website": p.website,
            "added_by": p.added_by, "created_at": str(p.created_at),
        }
        for p in places
    ]


@router.get("/travel/places/{place_id}")
def get_place(
    place_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    place = db.query(models.PetFriendlyPlace).filter(models.PetFriendlyPlace.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Lieu non trouve")
    return {
        "id": place.id, "name": place.name, "place_type": place.place_type,
        "city": place.city, "address": place.address, "latitude": place.latitude,
        "longitude": place.longitude, "rating": place.rating,
        "description": place.description, "amenities": place.amenities,
        "photo_url": place.photo_url, "website": place.website,
        "added_by": place.added_by, "created_at": str(place.created_at),
    }


@router.post("/travel/places")
def create_place(
    data: PlaceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    place = models.PetFriendlyPlace(
        name=data.name,
        place_type=data.place_type,
        city=data.city,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude,
        description=data.description,
        amenities=data.amenities,
        photo_url=data.photo_url,
        website=data.website,
        added_by=current_user.id,
    )
    db.add(place)
    db.commit()
    db.refresh(place)
    return {
        "id": place.id, "name": place.name, "place_type": place.place_type,
        "city": place.city, "address": place.address, "latitude": place.latitude,
        "longitude": place.longitude, "rating": place.rating,
        "description": place.description, "amenities": place.amenities,
        "photo_url": place.photo_url, "website": place.website,
        "added_by": place.added_by, "created_at": str(place.created_at),
    }


# ---- Travel Checklists ----

@router.get("/travel/checklists")
def list_checklists(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    checklists = (
        db.query(models.TravelChecklist)
        .filter(models.TravelChecklist.user_id == current_user.id)
        .order_by(models.TravelChecklist.created_at.desc())
        .all()
    )
    return [
        {
            "id": c.id, "user_id": c.user_id, "dog_id": c.dog_id,
            "destination": c.destination,
            "departure_date": str(c.departure_date) if c.departure_date else None,
            "items_json": c.items_json, "notes": c.notes,
            "created_at": str(c.created_at),
        }
        for c in checklists
    ]


@router.get("/travel/checklists/{checklist_id}")
def get_checklist(
    checklist_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    checklist = (
        db.query(models.TravelChecklist)
        .filter(
            models.TravelChecklist.id == checklist_id,
            models.TravelChecklist.user_id == current_user.id,
        )
        .first()
    )
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist non trouvee")
    return {
        "id": checklist.id, "user_id": checklist.user_id, "dog_id": checklist.dog_id,
        "destination": checklist.destination,
        "departure_date": str(checklist.departure_date) if checklist.departure_date else None,
        "items_json": checklist.items_json, "notes": checklist.notes,
        "created_at": str(checklist.created_at),
    }


@router.post("/travel/checklists")
def create_checklist(
    data: ChecklistCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == data.dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouve")

    checklist = models.TravelChecklist(
        user_id=current_user.id,
        dog_id=data.dog_id,
        destination=data.destination,
        departure_date=data.departure_date,
        items_json=data.items_json,
        notes=data.notes,
    )
    db.add(checklist)
    db.commit()
    db.refresh(checklist)
    return {
        "id": checklist.id, "user_id": checklist.user_id, "dog_id": checklist.dog_id,
        "destination": checklist.destination,
        "departure_date": str(checklist.departure_date) if checklist.departure_date else None,
        "items_json": checklist.items_json, "notes": checklist.notes,
        "created_at": str(checklist.created_at),
    }


@router.put("/travel/checklists/{checklist_id}")
def update_checklist(
    checklist_id: int,
    data: ChecklistUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    checklist = (
        db.query(models.TravelChecklist)
        .filter(
            models.TravelChecklist.id == checklist_id,
            models.TravelChecklist.user_id == current_user.id,
        )
        .first()
    )
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist non trouvee")

    if data.items_json is not None:
        checklist.items_json = data.items_json
    if data.notes is not None:
        checklist.notes = data.notes

    db.commit()
    db.refresh(checklist)
    return {
        "id": checklist.id, "user_id": checklist.user_id, "dog_id": checklist.dog_id,
        "destination": checklist.destination,
        "departure_date": str(checklist.departure_date) if checklist.departure_date else None,
        "items_json": checklist.items_json, "notes": checklist.notes,
        "created_at": str(checklist.created_at),
    }


@router.delete("/travel/checklists/{checklist_id}")
def delete_checklist(
    checklist_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    checklist = (
        db.query(models.TravelChecklist)
        .filter(
            models.TravelChecklist.id == checklist_id,
            models.TravelChecklist.user_id == current_user.id,
        )
        .first()
    )
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist non trouvee")

    db.delete(checklist)
    db.commit()
    return {"status": "deleted"}
