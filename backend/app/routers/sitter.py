from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofSitter"])


# ---- Schemas ----

class SitterProfileCreate(BaseModel):
    bio: Optional[str] = None
    experience_years: Optional[int] = 0
    rate_per_hour: Optional[float] = None
    rate_per_day: Optional[float] = None
    services: Optional[str] = None
    max_dogs: Optional[int] = 3
    has_garden: Optional[bool] = False


class SitterProfileUpdate(BaseModel):
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    rate_per_hour: Optional[float] = None
    rate_per_day: Optional[float] = None
    services: Optional[str] = None
    max_dogs: Optional[int] = None
    has_garden: Optional[bool] = None
    photo_url: Optional[str] = None


class BookingCreate(BaseModel):
    sitter_id: int
    dog_id: int
    service_type: str
    start_date: datetime
    end_date: datetime
    notes: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    status: str


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int
    comment: Optional[str] = None


# ---- Helpers ----

def _verify_dog_ownership(dog_id: int, user: models.User, db: Session) -> models.Dog:
    dog = db.query(models.Dog).filter(
        models.Dog.id == dog_id, models.Dog.owner_id == user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouve ou non autorise")
    return dog


def _row_to_dict(obj) -> dict:
    d = {}
    for col in obj.__table__.columns:
        val = getattr(obj, col.name)
        if isinstance(val, datetime):
            val = val.isoformat()
        d[col.name] = val
    return d


# ---- Sitter Search ----

@router.get("/sitters")
def search_sitters(
    city: Optional[str] = Query(None),
    service_type: Optional[str] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.SitterProfile).join(
        models.User, models.SitterProfile.user_id == models.User.id
    )
    if city:
        query = query.filter(models.User.city.ilike(f"%{city}%"))
    if service_type:
        query = query.filter(models.SitterProfile.services.ilike(f"%{service_type}%"))

    sitters = query.order_by(models.SitterProfile.rating.desc()).all()
    results = []
    for sitter in sitters:
        sitter_dict = _row_to_dict(sitter)
        user = db.query(models.User).filter(models.User.id == sitter.user_id).first()
        if user:
            sitter_dict["user_name"] = user.full_name
            sitter_dict["user_city"] = user.city
        results.append(sitter_dict)
    return results


@router.get("/sitters/bookings/mine")
def get_my_bookings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bookings = (
        db.query(models.SitterBooking)
        .filter(models.SitterBooking.owner_id == current_user.id)
        .order_by(models.SitterBooking.start_date.desc())
        .all()
    )
    results = []
    for booking in bookings:
        booking_dict = _row_to_dict(booking)
        sitter = db.query(models.SitterProfile).filter(
            models.SitterProfile.id == booking.sitter_id
        ).first()
        if sitter:
            sitter_user = db.query(models.User).filter(models.User.id == sitter.user_id).first()
            booking_dict["sitter_name"] = sitter_user.full_name if sitter_user else None
        dog = db.query(models.Dog).filter(models.Dog.id == booking.dog_id).first()
        booking_dict["dog_name"] = dog.name if dog else None
        results.append(booking_dict)
    return results


@router.get("/sitters/bookings/requests")
def get_booking_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sitter_profile = db.query(models.SitterProfile).filter(
        models.SitterProfile.user_id == current_user.id
    ).first()
    if not sitter_profile:
        raise HTTPException(status_code=404, detail="Vous n'etes pas pet-sitter")

    bookings = (
        db.query(models.SitterBooking)
        .filter(models.SitterBooking.sitter_id == sitter_profile.id)
        .order_by(models.SitterBooking.start_date.desc())
        .all()
    )
    results = []
    for booking in bookings:
        booking_dict = _row_to_dict(booking)
        owner = db.query(models.User).filter(models.User.id == booking.owner_id).first()
        booking_dict["owner_name"] = owner.full_name if owner else None
        dog = db.query(models.Dog).filter(models.Dog.id == booking.dog_id).first()
        booking_dict["dog_name"] = dog.name if dog else None
        results.append(booking_dict)
    return results


@router.get("/sitters/{sitter_id}")
def get_sitter_profile(
    sitter_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sitter = db.query(models.SitterProfile).filter(models.SitterProfile.id == sitter_id).first()
    if not sitter:
        raise HTTPException(status_code=404, detail="Pet-sitter non trouve")

    sitter_dict = _row_to_dict(sitter)

    user = db.query(models.User).filter(models.User.id == sitter.user_id).first()
    if user:
        sitter_dict["user_name"] = user.full_name
        sitter_dict["user_city"] = user.city

    reviews = (
        db.query(models.SitterReview)
        .filter(models.SitterReview.sitter_id == sitter_id)
        .order_by(models.SitterReview.created_at.desc())
        .all()
    )
    sitter_dict["reviews"] = []
    for review in reviews:
        review_dict = _row_to_dict(review)
        reviewer = db.query(models.User).filter(models.User.id == review.reviewer_id).first()
        review_dict["reviewer_name"] = reviewer.full_name if reviewer else None
        sitter_dict["reviews"].append(review_dict)

    return sitter_dict


# ---- Sitter Profile Management ----

@router.get("/sitters/profile/me")
def get_my_sitter_profile(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(models.SitterProfile).filter(
        models.SitterProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil de pet-sitter non trouvé")
    return _row_to_dict(profile)


@router.post("/sitters/profile")
def create_sitter_profile(
    data: SitterProfileCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(models.SitterProfile).filter(
        models.SitterProfile.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez deja un profil de pet-sitter")

    profile = models.SitterProfile(
        user_id=current_user.id,
        bio=data.bio,
        experience_years=data.experience_years,
        rate_per_hour=data.rate_per_hour,
        rate_per_day=data.rate_per_day,
        services=data.services,
        max_dogs=data.max_dogs,
        has_garden=data.has_garden,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return _row_to_dict(profile)


@router.put("/sitters/profile")
def update_sitter_profile(
    data: SitterProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(models.SitterProfile).filter(
        models.SitterProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil de pet-sitter non trouve")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return _row_to_dict(profile)


# ---- Bookings ----

@router.post("/sitters/book")
def create_booking(
    data: BookingCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(data.dog_id, current_user, db)

    sitter = db.query(models.SitterProfile).filter(
        models.SitterProfile.id == data.sitter_id
    ).first()
    if not sitter:
        raise HTTPException(status_code=404, detail="Pet-sitter non trouve")

    if sitter.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas reserver votre propre service")

    # Calculate total price
    total_price = None
    if data.start_date and data.end_date:
        delta = data.end_date - data.start_date
        days = max(delta.days, 1)
        hours = delta.total_seconds() / 3600
        if data.service_type in ("boarding", "daycare") and sitter.rate_per_day:
            total_price = round(sitter.rate_per_day * days, 2)
        elif sitter.rate_per_hour:
            total_price = round(sitter.rate_per_hour * hours, 2)

    booking = models.SitterBooking(
        sitter_id=data.sitter_id,
        owner_id=current_user.id,
        dog_id=data.dog_id,
        service_type=data.service_type,
        start_date=data.start_date,
        end_date=data.end_date,
        total_price=total_price,
        notes=data.notes,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _row_to_dict(booking)


@router.put("/sitters/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(models.SitterBooking).filter(
        models.SitterBooking.id == booking_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reservation non trouvee")

    # Allow the sitter or the owner to update status
    sitter_profile = db.query(models.SitterProfile).filter(
        models.SitterProfile.id == booking.sitter_id
    ).first()
    is_sitter = sitter_profile and sitter_profile.user_id == current_user.id
    is_owner = booking.owner_id == current_user.id

    if not is_sitter and not is_owner:
        raise HTTPException(status_code=403, detail="Non autorise")

    if data.status not in ("confirmed", "cancelled", "completed"):
        raise HTTPException(status_code=400, detail="Statut invalide")

    booking.status = data.status
    db.commit()
    db.refresh(booking)
    return _row_to_dict(booking)


# ---- Reviews ----

@router.post("/sitters/reviews")
def create_review(
    data: ReviewCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="La note doit etre entre 1 et 5")

    booking = db.query(models.SitterBooking).filter(
        models.SitterBooking.id == data.booking_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Reservation non trouvee")

    if booking.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Seul le proprietaire peut laisser un avis")

    if booking.status != "completed":
        raise HTTPException(status_code=400, detail="La reservation doit etre terminee pour laisser un avis")

    existing_review = db.query(models.SitterReview).filter(
        models.SitterReview.booking_id == data.booking_id
    ).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="Un avis existe deja pour cette reservation")

    review = models.SitterReview(
        booking_id=data.booking_id,
        sitter_id=booking.sitter_id,
        reviewer_id=current_user.id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()

    # Update sitter average rating
    sitter = db.query(models.SitterProfile).filter(
        models.SitterProfile.id == booking.sitter_id
    ).first()
    if sitter:
        avg_result = (
            db.query(func.avg(models.SitterReview.rating))
            .filter(models.SitterReview.sitter_id == sitter.id)
            .scalar()
        )
        total = (
            db.query(func.count(models.SitterReview.id))
            .filter(models.SitterReview.sitter_id == sitter.id)
            .scalar()
        )
        sitter.rating = round(float(avg_result), 2) if avg_result else 0
        sitter.total_reviews = total or 0
        db.commit()

    db.refresh(review)
    return _row_to_dict(review)
