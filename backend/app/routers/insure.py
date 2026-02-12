from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofInsure"])


# ---- Schemas ----

class ClaimCreate(BaseModel):
    dog_id: int
    plan_id: Optional[int] = None
    claim_type: str
    amount: float
    description: Optional[str] = None
    date: datetime


# ---- Insurance Plans ----

@router.get("/insurance/plans")
def list_plans(
    covers_prevention: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.InsurancePlan)
    if covers_prevention is not None:
        query = query.filter(models.InsurancePlan.covers_prevention == covers_prevention)
    plans = query.all()
    return [
        {
            "id": p.id, "name": p.name, "provider": p.provider,
            "monthly_price": p.monthly_price, "annual_price": p.annual_price,
            "coverage_pct": p.coverage_pct, "deductible": p.deductible,
            "max_annual": p.max_annual, "covers_accident": p.covers_accident,
            "covers_illness": p.covers_illness, "covers_prevention": p.covers_prevention,
            "description": p.description, "created_at": str(p.created_at),
        }
        for p in plans
    ]


@router.get("/insurance/plans/{plan_id}")
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    plan = db.query(models.InsurancePlan).filter(models.InsurancePlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan non trouve")
    return {
        "id": plan.id, "name": plan.name, "provider": plan.provider,
        "monthly_price": plan.monthly_price, "annual_price": plan.annual_price,
        "coverage_pct": plan.coverage_pct, "deductible": plan.deductible,
        "max_annual": plan.max_annual, "covers_accident": plan.covers_accident,
        "covers_illness": plan.covers_illness, "covers_prevention": plan.covers_prevention,
        "description": plan.description, "created_at": str(plan.created_at),
    }


# ---- Insurance Claims ----

@router.post("/insurance/claims")
def submit_claim(
    data: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == data.dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouve")

    if data.plan_id:
        plan = db.query(models.InsurancePlan).filter(models.InsurancePlan.id == data.plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Plan non trouve")

    claim = models.InsuranceClaim(
        user_id=current_user.id,
        dog_id=data.dog_id,
        plan_id=data.plan_id,
        claim_type=data.claim_type,
        amount=data.amount,
        description=data.description,
        date=data.date,
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return {
        "id": claim.id, "user_id": claim.user_id, "dog_id": claim.dog_id,
        "plan_id": claim.plan_id, "claim_type": claim.claim_type,
        "amount": claim.amount, "description": claim.description,
        "status": claim.status, "date": str(claim.date),
        "created_at": str(claim.created_at),
    }


@router.get("/insurance/claims")
def list_claims(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    claims = (
        db.query(models.InsuranceClaim)
        .filter(models.InsuranceClaim.user_id == current_user.id)
        .order_by(models.InsuranceClaim.created_at.desc())
        .all()
    )
    return [
        {
            "id": c.id, "user_id": c.user_id, "dog_id": c.dog_id,
            "plan_id": c.plan_id, "claim_type": c.claim_type,
            "amount": c.amount, "description": c.description,
            "status": c.status, "date": str(c.date),
            "created_at": str(c.created_at),
        }
        for c in claims
    ]


@router.get("/insurance/claims/{claim_id}")
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    claim = (
        db.query(models.InsuranceClaim)
        .filter(
            models.InsuranceClaim.id == claim_id,
            models.InsuranceClaim.user_id == current_user.id,
        )
        .first()
    )
    if not claim:
        raise HTTPException(status_code=404, detail="Reclamation non trouvee")
    return {
        "id": claim.id, "user_id": claim.user_id, "dog_id": claim.dog_id,
        "plan_id": claim.plan_id, "claim_type": claim.claim_type,
        "amount": claim.amount, "description": claim.description,
        "status": claim.status, "date": str(claim.date),
        "created_at": str(claim.created_at),
    }
