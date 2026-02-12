from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofBreed"])


# ---- Schemas ----

class BreederProfileCreate(BaseModel):
    kennel_name: str
    breeds: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    experience_years: int = 0
    website: Optional[str] = None
    phone: Optional[str] = None


class BreederProfileUpdate(BaseModel):
    kennel_name: Optional[str] = None
    breeds: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    experience_years: Optional[int] = None
    website: Optional[str] = None
    phone: Optional[str] = None


class LitterCreate(BaseModel):
    sire_name: Optional[str] = None
    sire_breed: Optional[str] = None
    dam_name: Optional[str] = None
    dam_breed: Optional[str] = None
    breed: str
    birth_date: Optional[datetime] = None
    puppy_count: int = 0
    available_count: int = 0
    price: Optional[float] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None


class LitterUpdate(BaseModel):
    sire_name: Optional[str] = None
    sire_breed: Optional[str] = None
    dam_name: Optional[str] = None
    dam_breed: Optional[str] = None
    breed: Optional[str] = None
    birth_date: Optional[datetime] = None
    puppy_count: Optional[int] = None
    available_count: Optional[int] = None
    price: Optional[float] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    status: Optional[str] = None


class PedigreeEntryCreate(BaseModel):
    dog_id: int
    generation: int
    position: str
    ancestor_name: str
    ancestor_breed: Optional[str] = None
    titles: Optional[str] = None


# ---- Breeders ----

@router.get("/breed/breeders")
def list_breeders(
    breed: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.BreederProfile)
    if breed:
        query = query.filter(models.BreederProfile.breeds.ilike(f"%{breed}%"))
    if city:
        query = query.filter(models.BreederProfile.city.ilike(f"%{city}%"))
    breeders = query.order_by(models.BreederProfile.rating.desc()).all()
    return [
        {
            "id": b.id, "user_id": b.user_id, "kennel_name": b.kennel_name,
            "breeds": b.breeds, "city": b.city, "description": b.description,
            "experience_years": b.experience_years, "website": b.website,
            "phone": b.phone, "verified": b.verified, "rating": b.rating,
            "photo_url": b.photo_url, "created_at": str(b.created_at),
        }
        for b in breeders
    ]


@router.get("/breed/breeders/{breeder_id}")
def get_breeder(
    breeder_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    breeder = db.query(models.BreederProfile).filter(models.BreederProfile.id == breeder_id).first()
    if not breeder:
        raise HTTPException(status_code=404, detail="Eleveur non trouve")

    litters = (
        db.query(models.Litter)
        .filter(models.Litter.breeder_id == breeder_id)
        .order_by(models.Litter.created_at.desc())
        .all()
    )
    return {
        "id": breeder.id, "user_id": breeder.user_id,
        "kennel_name": breeder.kennel_name, "breeds": breeder.breeds,
        "city": breeder.city, "description": breeder.description,
        "experience_years": breeder.experience_years, "website": breeder.website,
        "phone": breeder.phone, "verified": breeder.verified,
        "rating": breeder.rating, "photo_url": breeder.photo_url,
        "created_at": str(breeder.created_at),
        "litters": [
            {
                "id": l.id, "breed": l.breed,
                "birth_date": str(l.birth_date) if l.birth_date else None,
                "puppy_count": l.puppy_count, "available_count": l.available_count,
                "price": l.price, "status": l.status,
                "photo_url": l.photo_url,
            }
            for l in litters
        ],
    }


@router.post("/breed/breeders/profile")
def create_breeder_profile(
    data: BreederProfileCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.BreederProfile).filter(
        models.BreederProfile.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profil eleveur deja existant")

    profile = models.BreederProfile(
        user_id=current_user.id,
        kennel_name=data.kennel_name,
        breeds=data.breeds,
        city=data.city,
        description=data.description,
        experience_years=data.experience_years,
        website=data.website,
        phone=data.phone,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return {
        "id": profile.id, "user_id": profile.user_id,
        "kennel_name": profile.kennel_name, "breeds": profile.breeds,
        "city": profile.city, "description": profile.description,
        "experience_years": profile.experience_years, "website": profile.website,
        "phone": profile.phone, "verified": profile.verified,
        "rating": profile.rating, "photo_url": profile.photo_url,
        "created_at": str(profile.created_at),
    }


@router.put("/breed/breeders/profile")
def update_breeder_profile(
    data: BreederProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = db.query(models.BreederProfile).filter(
        models.BreederProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil eleveur non trouve")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return {
        "id": profile.id, "user_id": profile.user_id,
        "kennel_name": profile.kennel_name, "breeds": profile.breeds,
        "city": profile.city, "description": profile.description,
        "experience_years": profile.experience_years, "website": profile.website,
        "phone": profile.phone, "verified": profile.verified,
        "rating": profile.rating, "photo_url": profile.photo_url,
        "created_at": str(profile.created_at),
    }


# ---- Litters ----

@router.get("/breed/litters")
def list_litters(
    breed: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Litter)
    if breed:
        query = query.filter(models.Litter.breed.ilike(f"%{breed}%"))
    litters = query.order_by(models.Litter.created_at.desc()).all()
    return [
        {
            "id": l.id, "breeder_id": l.breeder_id,
            "sire_name": l.sire_name, "sire_breed": l.sire_breed,
            "dam_name": l.dam_name, "dam_breed": l.dam_breed,
            "breed": l.breed,
            "birth_date": str(l.birth_date) if l.birth_date else None,
            "puppy_count": l.puppy_count, "available_count": l.available_count,
            "price": l.price, "description": l.description,
            "photo_url": l.photo_url, "status": l.status,
            "created_at": str(l.created_at),
        }
        for l in litters
    ]


@router.get("/breed/litters/{litter_id}")
def get_litter(
    litter_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    litter = db.query(models.Litter).filter(models.Litter.id == litter_id).first()
    if not litter:
        raise HTTPException(status_code=404, detail="Portee non trouvee")
    return {
        "id": litter.id, "breeder_id": litter.breeder_id,
        "sire_name": litter.sire_name, "sire_breed": litter.sire_breed,
        "dam_name": litter.dam_name, "dam_breed": litter.dam_breed,
        "breed": litter.breed,
        "birth_date": str(litter.birth_date) if litter.birth_date else None,
        "puppy_count": litter.puppy_count, "available_count": litter.available_count,
        "price": litter.price, "description": litter.description,
        "photo_url": litter.photo_url, "status": litter.status,
        "created_at": str(litter.created_at),
    }


@router.post("/breed/litters")
def create_litter(
    data: LitterCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    breeder = db.query(models.BreederProfile).filter(
        models.BreederProfile.user_id == current_user.id
    ).first()
    if not breeder:
        raise HTTPException(status_code=403, detail="Vous devez etre eleveur pour declarer une portee")

    litter = models.Litter(
        breeder_id=breeder.id,
        sire_name=data.sire_name,
        sire_breed=data.sire_breed,
        dam_name=data.dam_name,
        dam_breed=data.dam_breed,
        breed=data.breed,
        birth_date=data.birth_date,
        puppy_count=data.puppy_count,
        available_count=data.available_count,
        price=data.price,
        description=data.description,
        photo_url=data.photo_url,
    )
    db.add(litter)
    db.commit()
    db.refresh(litter)
    return {
        "id": litter.id, "breeder_id": litter.breeder_id,
        "sire_name": litter.sire_name, "sire_breed": litter.sire_breed,
        "dam_name": litter.dam_name, "dam_breed": litter.dam_breed,
        "breed": litter.breed,
        "birth_date": str(litter.birth_date) if litter.birth_date else None,
        "puppy_count": litter.puppy_count, "available_count": litter.available_count,
        "price": litter.price, "description": litter.description,
        "photo_url": litter.photo_url, "status": litter.status,
        "created_at": str(litter.created_at),
    }


@router.put("/breed/litters/{litter_id}")
def update_litter(
    litter_id: int,
    data: LitterUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    breeder = db.query(models.BreederProfile).filter(
        models.BreederProfile.user_id == current_user.id
    ).first()
    if not breeder:
        raise HTTPException(status_code=403, detail="Acces refuse")

    litter = db.query(models.Litter).filter(
        models.Litter.id == litter_id,
        models.Litter.breeder_id == breeder.id,
    ).first()
    if not litter:
        raise HTTPException(status_code=404, detail="Portee non trouvee")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(litter, key, value)

    db.commit()
    db.refresh(litter)
    return {
        "id": litter.id, "breeder_id": litter.breeder_id,
        "sire_name": litter.sire_name, "sire_breed": litter.sire_breed,
        "dam_name": litter.dam_name, "dam_breed": litter.dam_breed,
        "breed": litter.breed,
        "birth_date": str(litter.birth_date) if litter.birth_date else None,
        "puppy_count": litter.puppy_count, "available_count": litter.available_count,
        "price": litter.price, "description": litter.description,
        "photo_url": litter.photo_url, "status": litter.status,
        "created_at": str(litter.created_at),
    }


# ---- Pedigree ----

@router.get("/breed/pedigree/{dog_id}")
def get_pedigree(
    dog_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    entries = (
        db.query(models.PedigreeEntry)
        .filter(models.PedigreeEntry.dog_id == dog_id)
        .order_by(models.PedigreeEntry.generation, models.PedigreeEntry.position)
        .all()
    )
    return [
        {
            "id": e.id, "dog_id": e.dog_id, "generation": e.generation,
            "position": e.position, "ancestor_name": e.ancestor_name,
            "ancestor_breed": e.ancestor_breed, "titles": e.titles,
            "created_at": str(e.created_at),
        }
        for e in entries
    ]


@router.post("/breed/pedigree")
def add_pedigree_entry(
    data: PedigreeEntryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == data.dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouve")

    entry = models.PedigreeEntry(
        dog_id=data.dog_id,
        generation=data.generation,
        position=data.position,
        ancestor_name=data.ancestor_name,
        ancestor_breed=data.ancestor_breed,
        titles=data.titles,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {
        "id": entry.id, "dog_id": entry.dog_id, "generation": entry.generation,
        "position": entry.position, "ancestor_name": entry.ancestor_name,
        "ancestor_breed": entry.ancestor_breed, "titles": entry.titles,
        "created_at": str(entry.created_at),
    }
