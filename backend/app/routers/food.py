from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofFood"])


# ---- Schemas ----

class MealCreate(BaseModel):
    dog_id: int
    meal_type: str
    food_name: str
    brand: Optional[str] = None
    portion_grams: Optional[float] = None
    time: Optional[str] = None
    notes: Optional[str] = None


class MealUpdate(BaseModel):
    meal_type: Optional[str] = None
    food_name: Optional[str] = None
    brand: Optional[str] = None
    portion_grams: Optional[float] = None
    time: Optional[str] = None
    notes: Optional[str] = None


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


# ---- Meal Plans ----

@router.get("/food/meals/{dog_id}")
def get_meal_plan(
    dog_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(dog_id, current_user, db)
    meals = (
        db.query(models.MealPlan)
        .filter(models.MealPlan.dog_id == dog_id)
        .order_by(models.MealPlan.time.asc())
        .all()
    )
    return [_row_to_dict(m) for m in meals]


@router.post("/food/meals")
def create_meal(
    data: MealCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(data.dog_id, current_user, db)
    meal = models.MealPlan(
        dog_id=data.dog_id,
        meal_type=data.meal_type,
        food_name=data.food_name,
        brand=data.brand,
        portion_grams=data.portion_grams,
        time=data.time,
        notes=data.notes,
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return _row_to_dict(meal)


@router.put("/food/meals/{meal_id}")
def update_meal(
    meal_id: int,
    data: MealUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meal = db.query(models.MealPlan).filter(models.MealPlan.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Repas non trouve")
    _verify_dog_ownership(meal.dog_id, current_user, db)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(meal, key, value)

    db.commit()
    db.refresh(meal)
    return _row_to_dict(meal)


@router.delete("/food/meals/{meal_id}")
def delete_meal(
    meal_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meal = db.query(models.MealPlan).filter(models.MealPlan.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Repas non trouve")
    _verify_dog_ownership(meal.dog_id, current_user, db)
    db.delete(meal)
    db.commit()
    return {"status": "deleted"}


# ---- Food Products ----

@router.get("/food/products")
def list_products(
    product_type: Optional[str] = Query(None, alias="type"),
    brand: Optional[str] = Query(None),
    search: Optional[str] = Query(None, alias="q"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.FoodProduct)
    if product_type:
        query = query.filter(models.FoodProduct.product_type == product_type)
    if brand:
        query = query.filter(models.FoodProduct.brand.ilike(f"%{brand}%"))
    if search:
        query = query.filter(
            models.FoodProduct.name.ilike(f"%{search}%")
            | models.FoodProduct.brand.ilike(f"%{search}%")
        )
    products = query.order_by(models.FoodProduct.rating.desc()).all()
    return [_row_to_dict(p) for p in products]


@router.get("/food/products/{product_id}")
def get_product(
    product_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(models.FoodProduct).filter(models.FoodProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouve")
    return _row_to_dict(product)
