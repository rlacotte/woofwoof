from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofAdopt"])


# ---- Schemas ----

class AdoptionRequestCreate(BaseModel):
    listing_id: int
    message: Optional[str] = None


# ---- Listings ----

@router.get("/adopt/listings")
def list_listings(
    breed: Optional[str] = Query(None),
    sex: Optional[str] = Query(None),
    age_min: Optional[int] = Query(None),
    age_max: Optional[int] = Query(None),
    city: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.AdoptionListing).filter(
        models.AdoptionListing.status == "available"
    )
    if breed:
        query = query.filter(models.AdoptionListing.breed.ilike(f"%{breed}%"))
    if sex:
        query = query.filter(models.AdoptionListing.sex == sex)
    if age_min is not None:
        query = query.filter(models.AdoptionListing.age_years >= age_min)
    if age_max is not None:
        query = query.filter(models.AdoptionListing.age_years <= age_max)
    if city:
        shelter_ids = [
            s.id
            for s in db.query(models.Shelter).filter(
                models.Shelter.city.ilike(f"%{city}%")
            ).all()
        ]
        if shelter_ids:
            query = query.filter(
                models.AdoptionListing.shelter_id.in_(shelter_ids)
            )
        else:
            return []
    listings = (
        query.order_by(models.AdoptionListing.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    results = []
    for listing in listings:
        shelter = db.query(models.Shelter).filter(
            models.Shelter.id == listing.shelter_id
        ).first()
        results.append({
            "id": listing.id,
            "name": listing.name,
            "breed": listing.breed,
            "age_years": listing.age_years,
            "age_months": listing.age_months,
            "sex": listing.sex,
            "weight_kg": listing.weight_kg,
            "description": listing.description,
            "temperament": listing.temperament,
            "photo_url_1": listing.photo_url_1,
            "photo_url_2": listing.photo_url_2,
            "good_with_kids": listing.good_with_kids,
            "good_with_cats": listing.good_with_cats,
            "good_with_dogs": listing.good_with_dogs,
            "is_neutered": listing.is_neutered,
            "status": listing.status,
            "shelter_name": shelter.name if shelter else None,
            "shelter_city": shelter.city if shelter else None,
        })
    return results


@router.get("/adopt/listings/{listing_id}")
def get_listing_detail(
    listing_id: int,
    db: Session = Depends(get_db),
):
    listing = db.query(models.AdoptionListing).filter(
        models.AdoptionListing.id == listing_id
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvee")
    shelter = db.query(models.Shelter).filter(
        models.Shelter.id == listing.shelter_id
    ).first()
    shelter_info = None
    if shelter:
        shelter_info = {
            "id": shelter.id,
            "name": shelter.name,
            "city": shelter.city,
            "address": shelter.address,
            "phone": shelter.phone,
            "email": shelter.email,
            "website": shelter.website,
            "description": shelter.description,
            "photo_url": shelter.photo_url,
        }
    return {
        "id": listing.id,
        "name": listing.name,
        "breed": listing.breed,
        "age_years": listing.age_years,
        "age_months": listing.age_months,
        "sex": listing.sex,
        "weight_kg": listing.weight_kg,
        "description": listing.description,
        "temperament": listing.temperament,
        "photo_url_1": listing.photo_url_1,
        "photo_url_2": listing.photo_url_2,
        "good_with_kids": listing.good_with_kids,
        "good_with_cats": listing.good_with_cats,
        "good_with_dogs": listing.good_with_dogs,
        "is_neutered": listing.is_neutered,
        "status": listing.status,
        "created_at": listing.created_at.isoformat() if listing.created_at else None,
        "shelter": shelter_info,
    }


# ---- Shelters ----

@router.get("/adopt/shelters")
def list_shelters(
    city: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Shelter)
    if city:
        query = query.filter(models.Shelter.city.ilike(f"%{city}%"))
    shelters = query.order_by(models.Shelter.name).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "city": s.city,
            "address": s.address,
            "phone": s.phone,
            "email": s.email,
            "website": s.website,
            "description": s.description,
            "photo_url": s.photo_url,
        }
        for s in shelters
    ]


@router.get("/adopt/shelters/{shelter_id}")
def get_shelter_detail(
    shelter_id: int,
    db: Session = Depends(get_db),
):
    shelter = db.query(models.Shelter).filter(
        models.Shelter.id == shelter_id
    ).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Refuge non trouve")
    listings = (
        db.query(models.AdoptionListing)
        .filter(
            models.AdoptionListing.shelter_id == shelter_id,
            models.AdoptionListing.status == "available",
        )
        .order_by(models.AdoptionListing.created_at.desc())
        .all()
    )
    listings_list = [
        {
            "id": l.id,
            "name": l.name,
            "breed": l.breed,
            "age_years": l.age_years,
            "age_months": l.age_months,
            "sex": l.sex,
            "photo_url_1": l.photo_url_1,
            "status": l.status,
        }
        for l in listings
    ]
    return {
        "id": shelter.id,
        "name": shelter.name,
        "city": shelter.city,
        "address": shelter.address,
        "latitude": shelter.latitude,
        "longitude": shelter.longitude,
        "phone": shelter.phone,
        "email": shelter.email,
        "website": shelter.website,
        "description": shelter.description,
        "photo_url": shelter.photo_url,
        "listings": listings_list,
    }


# ---- Adoption Requests ----

@router.post("/adopt/request")
def submit_adoption_request(
    data: AdoptionRequestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.query(models.AdoptionListing).filter(
        models.AdoptionListing.id == data.listing_id
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Annonce non trouvee")
    if listing.status != "available":
        raise HTTPException(
            status_code=400,
            detail="Cet animal n'est plus disponible a l'adoption",
        )
    existing = db.query(models.AdoptionRequest).filter(
        models.AdoptionRequest.listing_id == data.listing_id,
        models.AdoptionRequest.user_id == current_user.id,
        models.AdoptionRequest.status == "pending",
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Vous avez deja une demande en cours pour cet animal",
        )
    request = models.AdoptionRequest(
        listing_id=data.listing_id,
        user_id=current_user.id,
        message=data.message,
        status="pending",
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return {
        "id": request.id,
        "listing_id": request.listing_id,
        "user_id": request.user_id,
        "message": request.message,
        "status": request.status,
        "created_at": request.created_at.isoformat() if request.created_at else None,
    }


@router.get("/adopt/my-requests")
def get_my_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    requests = (
        db.query(models.AdoptionRequest)
        .filter(models.AdoptionRequest.user_id == current_user.id)
        .order_by(models.AdoptionRequest.created_at.desc())
        .all()
    )
    results = []
    for req in requests:
        listing = db.query(models.AdoptionListing).filter(
            models.AdoptionListing.id == req.listing_id
        ).first()
        shelter = None
        if listing:
            shelter = db.query(models.Shelter).filter(
                models.Shelter.id == listing.shelter_id
            ).first()
        results.append({
            "id": req.id,
            "listing_id": req.listing_id,
            "animal_name": listing.name if listing else None,
            "animal_breed": listing.breed if listing else None,
            "animal_photo": listing.photo_url_1 if listing else None,
            "shelter_name": shelter.name if shelter else None,
            "shelter_city": shelter.city if shelter else None,
            "message": req.message,
            "status": req.status,
            "created_at": req.created_at.isoformat() if req.created_at else None,
        })
    return results
