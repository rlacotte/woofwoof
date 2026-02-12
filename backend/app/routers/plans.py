from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from ..database import get_db
from ..auth import get_current_user
from .. import models, schemas

router = APIRouter(prefix="/api", tags=["plans"])

PLAN_LIMITS = {
    "croquette": {"daily_swipes": 10, "daily_super_likes": 0, "can_see_likes": False, "can_advanced_search": False, "can_puppy_predictor": False, "priority_boost": False},
    "patee": {"daily_swipes": -1, "daily_super_likes": 1, "can_see_likes": True, "can_advanced_search": True, "can_puppy_predictor": True, "priority_boost": False},
    "os_en_or": {"daily_swipes": -1, "daily_super_likes": -1, "can_see_likes": True, "can_advanced_search": True, "can_puppy_predictor": True, "priority_boost": True},
}

PLANS_DATA = [
    {
        "id": "croquette",
        "name": "Croquette",
        "icon": "🦴",
        "price_monthly": 0,
        "features": [
            ("10 swipes par jour", True),
            ("Profil basique", True),
            ("Messagerie", True),
            ("Voir qui m'a liké", False),
            ("Recherche avancée", False),
            ("Puppy Predictor", False),
            ("Super Likes", False),
            ("Mise en avant du profil", False),
            ("Badge vérifié or", False),
        ],
    },
    {
        "id": "patee",
        "name": "Pâtée",
        "icon": "🥫",
        "price_monthly": 9.99,
        "features": [
            ("Swipes illimités", True),
            ("Profil complet", True),
            ("Messagerie illimitée", True),
            ("Voir qui m'a liké", True),
            ("Recherche avancée", True),
            ("Puppy Predictor", True),
            ("1 Super Like / jour", True),
            ("Mise en avant du profil", False),
            ("Badge vérifié or", False),
        ],
    },
    {
        "id": "os_en_or",
        "name": "Os en Or",
        "icon": "🏆",
        "price_monthly": 19.99,
        "features": [
            ("Swipes illimités", True),
            ("Profil complet", True),
            ("Messagerie illimitée", True),
            ("Voir qui m'a liké", True),
            ("Recherche avancée", True),
            ("Puppy Predictor détaillé", True),
            ("Super Likes illimités", True),
            ("Mise en avant du profil", True),
            ("Badge vérifié or", True),
        ],
    },
]


def get_user_plan(user: models.User) -> str:
    return user.plan_type or "croquette"


def get_plan_limits(plan: str) -> dict:
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["croquette"])


def count_today_swipes(user: models.User, db: Session) -> int:
    my_dog_ids = [d.id for d in user.dogs]
    if not my_dog_ids:
        return 0
    today = date.today()
    return (
        db.query(models.Swipe)
        .filter(
            models.Swipe.swiper_dog_id.in_(my_dog_ids),
            func.date(models.Swipe.created_at) == today,
        )
        .count()
    )


@router.get("/plans", response_model=list[schemas.PlanOut])
def get_plans(current_user: models.User = Depends(get_current_user)):
    user_plan = get_user_plan(current_user)
    result = []
    for p in PLANS_DATA:
        result.append(schemas.PlanOut(
            id=p["id"],
            name=p["name"],
            icon=p["icon"],
            price_monthly=p["price_monthly"],
            features=[schemas.PlanFeature(label=f[0], included=f[1]) for f in p["features"]],
            is_current=(p["id"] == user_plan),
        ))
    return result


@router.get("/my-subscription")
def get_my_subscription(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(models.Subscription).filter(models.Subscription.user_id == current_user.id).first()
    plan = get_user_plan(current_user)
    limits = get_plan_limits(plan)
    used = count_today_swipes(current_user, db)
    daily_limit = limits["daily_swipes"]

    return {
        "plan": plan,
        "plan_name": next((p["name"] for p in PLANS_DATA if p["id"] == plan), "Croquette"),
        "plan_icon": next((p["icon"] for p in PLANS_DATA if p["id"] == plan), "🦴"),
        "limits": limits,
        "swipes_used_today": used,
        "swipes_remaining": -1 if daily_limit == -1 else max(0, daily_limit - used),
    }


@router.post("/subscribe")
def subscribe(
    data: schemas.SubscribeRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.plan not in PLAN_LIMITS:
        raise HTTPException(status_code=400, detail="Plan invalide")

    current_user.plan_type = data.plan
    current_user.is_premium = data.plan != "croquette"

    sub = db.query(models.Subscription).filter(models.Subscription.user_id == current_user.id).first()
    if sub:
        sub.plan = data.plan
    else:
        sub = models.Subscription(user_id=current_user.id, plan=data.plan)
        db.add(sub)

    db.commit()
    return {"status": "ok", "plan": data.plan}


@router.get("/swipe-limit", response_model=schemas.SwipeLimitOut)
def get_swipe_limit(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = get_user_plan(current_user)
    limits = get_plan_limits(plan)
    used = count_today_swipes(current_user, db)
    daily_limit = limits["daily_swipes"]

    return schemas.SwipeLimitOut(
        daily_limit=daily_limit,
        used_today=used,
        remaining=-1 if daily_limit == -1 else max(0, daily_limit - used),
        plan=plan,
    )
