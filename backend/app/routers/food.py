from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta
from sqlalchemy import func

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api/food", tags=["WoofFood"])


# ---- Schemas ----

class FoodProductCreate(BaseModel):
    name: str
    brand: str
    product_type: str  # croquettes, pate, friandise, complement
    kcal_per_kg: Optional[float] = 3500
    current_stock_g: Optional[float] = 0
    total_stock_g: Optional[float] = 0
    low_stock_threshold_g: Optional[float] = 500
    protein_pct: Optional[float] = None
    fat_pct: Optional[float] = None


class FoodRefill(BaseModel):
    amount_g: float  # Amount to add


class MealLogCreate(BaseModel):
    dog_id: int
    food_product_id: Optional[int] = None
    amount_g: float
    timestamp: Optional[datetime] = None
    meal_type: str = "meal"  # meal, snack


class MealPlanCreate(BaseModel):
    dog_id: int
    meal_type: str
    food_name: str
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


# ---- Meal Tracking (History) ----

@router.post("/meals")
def log_meal(
    data: MealLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(data.dog_id, current_user, db)
    
    # Calculate calories if food product is known
    calories = 0
    food = None
    if data.food_product_id:
        food = db.query(models.FoodProduct).filter(models.FoodProduct.id == data.food_product_id).first()
        if food:
            # Check ownership if it's a private food (or allow global)
            if food.user_id and food.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Produit non autorise")
            
            if food.kcal_per_kg:
                calories = int((data.amount_g / 1000) * food.kcal_per_kg)
                
            # Update Stock
            if food.current_stock_g is not None:
                food.current_stock_g = max(0, food.current_stock_g - data.amount_g)
                db.add(food)

    meal = models.Meal(
        dog_id=data.dog_id,
        food_product_id=data.food_product_id,
        amount_g=data.amount_g,
        calories=calories,
        meal_type=data.meal_type,
        timestamp=data.timestamp or datetime.utcnow()
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    
    return {
        **_row_to_dict(meal),
        "food_name": food.name if food else None,
        "remaining_stock": food.current_stock_g if food else None
    }


@router.get("/meals/{dog_id}")
def get_meal_history(
    dog_id: int,
    limit: int = 20,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(dog_id, current_user, db)
    meals = (
        db.query(models.Meal)
        .filter(models.Meal.dog_id == dog_id)
        .order_by(models.Meal.timestamp.desc())
        .limit(limit)
        .all()
    )
    result = []
    for m in meals:
        md = _row_to_dict(m)
        if m.food_product:
            md["food_name"] = m.food_product.name
            md["food_brand"] = m.food_product.brand
        result.append(md)
    return result


@router.get("/stats/{dog_id}")
def get_nutrition_stats(
    dog_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verify_dog_ownership(dog_id, current_user, db)
    
    today = datetime.utcnow().date()
    start_of_day = datetime(today.year, today.month, today.day)
    
    # Calories today
    calories_today = (
        db.query(func.sum(models.Meal.calories))
        .filter(models.Meal.dog_id == dog_id, models.Meal.timestamp >= start_of_day)
        .scalar()
    ) or 0
    
    # Last Meal
    last_meal = (
        db.query(models.Meal)
        .filter(models.Meal.dog_id == dog_id)
        .order_by(models.Meal.timestamp.desc())
        .first()
    )
    
    last_meal_time = last_meal.timestamp.isoformat() if last_meal else None
    
    return {
        "calories_today": calories_today,
        "last_meal_time": last_meal_time,
        "meals_count_today": db.query(models.Meal).filter(models.Meal.dog_id == dog_id, models.Meal.timestamp >= start_of_day).count()
    }


# ---- Pantry Management (Food Products) ----

@router.get("/products")
def list_products(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get Global Products OR User's Products
    products = (
        db.query(models.FoodProduct)
        .filter(
            (models.FoodProduct.user_id == None) | (models.FoodProduct.user_id == current_user.id)
        )
        .order_by(models.FoodProduct.user_id.desc(), models.FoodProduct.name.asc()) # User products first
        .all()
    )
    return [_row_to_dict(p) for p in products]


@router.post("/products")
def create_product(
    data: FoodProductCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = models.FoodProduct(
        user_id=current_user.id, # Always bind to user when creating via API
        name=data.name,
        brand=data.brand,
        product_type=data.product_type,
        kcal_per_kg=data.kcal_per_kg,
        current_stock_g=data.current_stock_g,
        total_stock_g=data.total_stock_g,
        low_stock_threshold_g=data.low_stock_threshold_g,
        protein_pct=data.protein_pct,
        fat_pct=data.fat_pct
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return _row_to_dict(product)


@router.post("/products/{product_id}/refill")
def refill_product(
    product_id: int,
    data: FoodRefill,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(models.FoodProduct).filter(models.FoodProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouve")
    
    if product.user_id and product.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Non autorise")
    
    # Update stock
    product.current_stock_g = (product.current_stock_g or 0) + data.amount_g
    # Optionally update total capacity if refill exceeds it
    if product.current_stock_g > (product.total_stock_g or 0):
        product.total_stock_g = product.current_stock_g
        
    db.commit()
    db.refresh(product)
    return _row_to_dict(product)


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(models.FoodProduct).filter(models.FoodProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouve")
    if product.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Seuls les produits personnels peuvent etre supprimes")
        
    db.delete(product)
    db.commit()
    return {"status": "deleted"}


# ---- Meal Plans (Schedule) ----
# Renamed from original /food/meals to /food/plans to distinguish from history

@router.get("/plans/{dog_id}")
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


@router.post("/plans")
def create_meal_plan(
    data: MealPlanCreate,
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


@router.delete("/plans/{plan_id}")
def delete_meal_plan(
    plan_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meal = db.query(models.MealPlan).filter(models.MealPlan.id == plan_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Non trouve")
    _verify_dog_ownership(meal.dog_id, current_user, db)
    db.delete(meal)
    db.commit()
    return {"status": "deleted"}
