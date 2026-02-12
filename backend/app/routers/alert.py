from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api/alerts", tags=["WoofAlert"])

class DangerZoneCreate(BaseModel):
    latitude: float
    longitude: float
    alert_type: str  # ticks, plants, other
    description: Optional[str] = None
    photo_url: Optional[str] = None
    city: Optional[str] = None

@router.post("/danger")
def create_danger_zone(
    data: DangerZoneCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    zone = models.DangerZone(
        user_id=current_user.id,
        latitude=data.latitude,
        longitude=data.longitude,
        alert_type=data.alert_type,
        description=data.description,
        photo_url=data.photo_url,
        city=data.city
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone

@router.get("/danger")
def get_danger_zones(
    city: Optional[str] = Query(None),
    alert_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.DangerZone)
    if city:
        query = query.filter(models.DangerZone.city.ilike(f"%{city}%"))
    if alert_type:
        query = query.filter(models.DangerZone.alert_type == alert_type)
    
    return query.all()
