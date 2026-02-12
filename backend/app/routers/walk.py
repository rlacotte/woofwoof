from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofWalk"])


# ---- Schemas ----

class WalkCreate(BaseModel):
    dog_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    distance_km: Optional[float] = 0
    duration_minutes: Optional[int] = 0
    calories: Optional[int] = 0
    route_json: Optional[str] = None
    notes: Optional[str] = None


class WalkSpotCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    spot_type: str
    description: Optional[str] = None
    photo_url: Optional[str] = None
    city: Optional[str] = None


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


# ---- Walks ----

@router.get("/walks/{dog_id}")
def get_walks(
    dog_id: int,
    limit: int = Query(20, ge=1, le=100),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(dog_id, current_user, db)
    walks = (
        db.query(models.Walk)
        .filter(models.Walk.dog_id == dog_id)
        .order_by(models.Walk.start_time.desc())
        .limit(limit)
        .all()
    )
    return [_row_to_dict(w) for w in walks]


@router.post("/walks")
def create_walk(
    data: WalkCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(data.dog_id, current_user, db)
    walk = models.Walk(
        dog_id=data.dog_id,
        user_id=current_user.id,
        start_time=data.start_time,
        end_time=data.end_time,
        distance_km=data.distance_km,
        duration_minutes=data.duration_minutes,
        calories=data.calories,
        route_json=data.route_json,
        notes=data.notes,
    )
    db.add(walk)
    db.commit()
    db.refresh(walk)
    return _row_to_dict(walk)


@router.get("/walks/{dog_id}/stats")
def get_walk_stats(
    dog_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(dog_id, current_user, db)

    stats = (
        db.query(
            func.count(models.Walk.id).label("total_walks"),
            func.coalesce(func.sum(models.Walk.distance_km), 0).label("total_distance_km"),
            func.coalesce(func.sum(models.Walk.duration_minutes), 0).label("total_duration_minutes"),
            func.coalesce(func.avg(models.Walk.distance_km), 0).label("avg_distance_km"),
        )
        .filter(models.Walk.dog_id == dog_id)
        .first()
    )

    return {
        "dog_id": dog_id,
        "total_walks": stats.total_walks,
        "total_distance_km": round(float(stats.total_distance_km), 2),
        "total_duration_minutes": int(stats.total_duration_minutes),
        "avg_distance_km": round(float(stats.avg_distance_km), 2),
    }


# ---- Walk Spots ----

@router.get("/walk-spots")
def get_walk_spots(
    city: Optional[str] = Query(None),
    spot_type: Optional[str] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.WalkSpot)
    if city:
        query = query.filter(models.WalkSpot.city.ilike(f"%{city}%"))
    if spot_type:
        query = query.filter(models.WalkSpot.spot_type == spot_type)
    spots = query.order_by(models.WalkSpot.rating.desc()).all()
    return [_row_to_dict(s) for s in spots]


@router.post("/walk-spots")
def create_walk_spot(
    data: WalkSpotCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    spot = models.WalkSpot(
        name=data.name,
        latitude=data.latitude,
        longitude=data.longitude,
        spot_type=data.spot_type,
        description=data.description,
        photo_url=data.photo_url,
        city=data.city,
        added_by=current_user.id,
    )
    db.add(spot)
    db.commit()
    db.refresh(spot)
    return _row_to_dict(spot)


@router.get("/walk-spots/{spot_id}")
def get_walk_spot(
    spot_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    spot = db.query(models.WalkSpot).filter(models.WalkSpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Spot non trouve")
    return _row_to_dict(spot)
