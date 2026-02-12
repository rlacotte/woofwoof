from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofHealth"])


# ---- Schemas ----

class HealthRecordCreate(BaseModel):
    dog_id: int
    record_type: str
    date: datetime
    description: Optional[str] = None
    vet_name: Optional[str] = None
    document_url: Optional[str] = None


class VaccinationCreate(BaseModel):
    dog_id: int
    name: str
    date: datetime
    next_due: Optional[datetime] = None
    vet_name: Optional[str] = None
    batch_number: Optional[str] = None


class AppointmentCreate(BaseModel):
    dog_id: int
    vet_name: str
    date: datetime
    appointment_type: str
    notes: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: str


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


# ---- Health Records ----

@router.get("/health/records/{dog_id}")
def get_health_records(
    dog_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(dog_id, current_user, db)
    records = (
        db.query(models.HealthRecord)
        .filter(models.HealthRecord.dog_id == dog_id)
        .order_by(models.HealthRecord.date.desc())
        .all()
    )
    return [_row_to_dict(r) for r in records]


@router.post("/health/records")
def create_health_record(
    data: HealthRecordCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(data.dog_id, current_user, db)
    record = models.HealthRecord(
        dog_id=data.dog_id,
        record_type=data.record_type,
        date=data.date,
        description=data.description,
        vet_name=data.vet_name,
        document_url=data.document_url,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _row_to_dict(record)


@router.delete("/health/records/{record_id}")
def delete_health_record(
    record_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = db.query(models.HealthRecord).filter(models.HealthRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Enregistrement non trouve")
    _verify_dog_ownership(record.dog_id, current_user, db)
    db.delete(record)
    db.commit()
    return {"status": "deleted"}


# ---- Vaccinations ----

@router.get("/health/vaccinations/{dog_id}")
def get_vaccinations(
    dog_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(dog_id, current_user, db)
    vaccinations = (
        db.query(models.VetVaccination)
        .filter(models.VetVaccination.dog_id == dog_id)
        .order_by(models.VetVaccination.date.desc())
        .all()
    )
    return [_row_to_dict(v) for v in vaccinations]


@router.post("/health/vaccinations")
def create_vaccination(
    data: VaccinationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(data.dog_id, current_user, db)
    vaccination = models.VetVaccination(
        dog_id=data.dog_id,
        name=data.name,
        date=data.date,
        next_due=data.next_due,
        vet_name=data.vet_name,
        batch_number=data.batch_number,
    )
    db.add(vaccination)
    db.commit()
    db.refresh(vaccination)
    return _row_to_dict(vaccination)


# ---- Appointments ----

@router.get("/health/appointments/{dog_id}")
def get_appointments(
    dog_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(dog_id, current_user, db)
    appointments = (
        db.query(models.VetAppointment)
        .filter(models.VetAppointment.dog_id == dog_id)
        .order_by(models.VetAppointment.date.desc())
        .all()
    )
    return [_row_to_dict(a) for a in appointments]


@router.post("/health/appointments")
def create_appointment(
    data: AppointmentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(data.dog_id, current_user, db)
    appointment = models.VetAppointment(
        dog_id=data.dog_id,
        vet_name=data.vet_name,
        date=data.date,
        appointment_type=data.appointment_type,
        notes=data.notes,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return _row_to_dict(appointment)


@router.put("/health/appointments/{apt_id}/status")
def update_appointment_status(
    apt_id: int,
    data: AppointmentStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = db.query(models.VetAppointment).filter(models.VetAppointment.id == apt_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouve")
    _verify_dog_ownership(appointment.dog_id, current_user, db)

    if data.status not in ("scheduled", "completed", "cancelled"):
        raise HTTPException(status_code=400, detail="Statut invalide")

    appointment.status = data.status
    db.commit()
    db.refresh(appointment)
    return _row_to_dict(appointment)
