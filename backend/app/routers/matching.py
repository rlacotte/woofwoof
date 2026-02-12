from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from math import radians, cos, sin, asin, sqrt
from typing import Optional
from datetime import date
import httpx
import base64
import os
import uuid
import asyncio

from ..database import get_db
from ..auth import get_current_user
from .. import models, schemas
from .plans import get_user_plan, get_plan_limits, count_today_swipes

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "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")

# Directory to store generated puppy images
GENERATED_IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "generated_images")
os.makedirs(GENERATED_IMAGES_DIR, exist_ok=True)

router = APIRouter(prefix="/api", tags=["matching"])


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


ACTIVITY_LEVELS = ["low", "moderate", "high", "very_high"]


def compute_compatibility(my_dog: models.Dog, other_dog: models.Dog, distance: Optional[float] = None) -> int:
    """Compute a 0-100 compatibility score between two dogs."""
    score = 0.0

    # 1. Intention match (25%)
    if my_dog.intention == other_dog.intention:
        score += 25
    elif "both" in (my_dog.intention, other_dog.intention):
        score += 18
    else:
        score += 0

    # 2. Activity level (20%)
    if my_dog.activity_level and other_dog.activity_level:
        try:
            idx1 = ACTIVITY_LEVELS.index(my_dog.activity_level)
            idx2 = ACTIVITY_LEVELS.index(other_dog.activity_level)
            diff = abs(idx1 - idx2)
            score += {0: 20, 1: 12, 2: 4}.get(diff, 0)
        except ValueError:
            score += 10
    else:
        score += 10  # unknown = neutral

    # 3. Size/Weight (15%)
    w1 = my_dog.weight_kg
    w2 = other_dog.weight_kg
    if w1 and w2 and w1 > 0 and w2 > 0:
        ratio = min(w1, w2) / max(w1, w2)
        if ratio >= 0.7:
            score += 15
        elif ratio >= 0.5:
            score += 9
        else:
            score += 3
    else:
        score += 8  # unknown

    # 4. Temperament similarity (15%)
    t1 = set(t.strip().lower() for t in (my_dog.temperament or "").split(",") if t.strip())
    t2 = set(t.strip().lower() for t in (other_dog.temperament or "").split(",") if t.strip())
    if t1 and t2:
        union = t1 | t2
        intersection = t1 & t2
        jaccard = len(intersection) / len(union) if union else 0
        score += 15 * jaccard
    else:
        score += 7

    # 5. Social compatibility (10%)
    if other_dog.good_with_dogs is True:
        score += 10
    elif other_dog.good_with_dogs is None:
        score += 5
    # false = 0

    # 6. Breed (10%)
    if my_dog.breed.lower().strip() == other_dog.breed.lower().strip():
        score += 10
    else:
        score += 5

    # 7. Distance (5%)
    if distance is not None:
        if distance < 10:
            score += 5
        elif distance < 50:
            score += 3.5
        elif distance < 100:
            score += 2
        else:
            score += 0.5
    else:
        score += 2.5

    return min(100, max(0, round(score)))


def dog_to_card(dog: models.Dog, owner: models.User, distance: Optional[float] = None, compatibility_score: Optional[int] = None) -> schemas.DogCardOut:
    return schemas.DogCardOut(
        id=dog.id, name=dog.name, breed=dog.breed,
        age_years=dog.age_years, age_months=dog.age_months,
        weight_kg=dog.weight_kg, sex=dog.sex, bio=dog.bio,
        temperament=dog.temperament, intention=dog.intention,
        photo_url_1=dog.photo_url_1, photo_url_2=dog.photo_url_2,
        photo_url_3=dog.photo_url_3,
        health_verified=dog.health_verified, breeder_certified=dog.breeder_certified,
        coat_color=dog.coat_color, has_pedigree=dog.has_pedigree,
        lof_number=dog.lof_number, kennel_name=dog.kennel_name,
        activity_level=dog.activity_level, diet=dog.diet,
        good_with_kids=dog.good_with_kids, good_with_cats=dog.good_with_cats,
        good_with_dogs=dog.good_with_dogs, titles=dog.titles,
        sire_name=dog.sire_name, dam_name=dog.dam_name,
        height_cm=dog.height_cm, eye_color=dog.eye_color,
        vaccination_status=dog.vaccination_status,
        owner_name=owner.full_name if owner else None,
        owner_city=owner.city if owner else None,
        distance_km=round(distance, 1) if distance is not None else None,
        compatibility_score=compatibility_score,
    )


@router.get("/discover", response_model=list[schemas.DogCardOut])
def discover_dogs(
    dog_id: int = Query(..., description="ID de votre chien"),
    max_distance_km: float = Query(50),
    breed_filter: Optional[str] = Query(None),
    intention_filter: Optional[str] = Query(None),
    sex_filter: Optional[str] = Query(None),
    limit: int = Query(20),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    my_dog = db.query(models.Dog).filter(
        models.Dog.id == dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not my_dog:
        raise HTTPException(status_code=404, detail="Chien non trouvé")

    already_swiped_ids = [
        s.swiped_dog_id
        for s in db.query(models.Swipe).filter(models.Swipe.swiper_dog_id == dog_id).all()
    ]
    already_swiped_ids.append(dog_id)

    query = db.query(models.Dog).filter(
        models.Dog.id.notin_(already_swiped_ids),
        models.Dog.owner_id != current_user.id,
    )

    if breed_filter:
        query = query.filter(models.Dog.breed.ilike(f"%{breed_filter}%"))
    if intention_filter:
        query = query.filter(models.Dog.intention == intention_filter)
    if sex_filter:
        query = query.filter(models.Dog.sex == sex_filter)

    candidates = query.all()
    results = []

    for dog in candidates:
        owner = db.query(models.User).filter(models.User.id == dog.owner_id).first()
        distance = None
        if current_user.latitude and owner and owner.latitude:
            distance = haversine(
                current_user.latitude, current_user.longitude,
                owner.latitude, owner.longitude,
            )
            if distance > max_distance_km:
                continue
        compat = compute_compatibility(my_dog, dog, distance)
        results.append(dog_to_card(dog, owner, distance, compat))

    # Os en Or users' dogs appear first for other users
    results.sort(key=lambda x: x.distance_km if x.distance_km is not None else 9999)
    return results[:limit]


@router.post("/swipe")
def swipe(
    data: schemas.SwipeCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    my_dog = db.query(models.Dog).filter(
        models.Dog.id == data.swiper_dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not my_dog:
        raise HTTPException(status_code=403, detail="Ce n'est pas votre chien")

    # Swipe limit check
    plan = get_user_plan(current_user)
    limits = get_plan_limits(plan)
    if data.action in ("like", "super_like", "pass"):
        daily_limit = limits["daily_swipes"]
        if daily_limit != -1:
            used = count_today_swipes(current_user, db)
            if used >= daily_limit:
                raise HTTPException(
                    status_code=403,
                    detail=f"Limite de {daily_limit} swipes/jour atteinte. Passez au plan Pâtée pour des swipes illimités !",
                )

    # Super like check
    if data.action == "super_like":
        sl_limit = limits["daily_super_likes"]
        if sl_limit != -1:
            today = date.today()
            sl_used = (
                db.query(models.Swipe)
                .filter(
                    models.Swipe.swiper_dog_id.in_([d.id for d in current_user.dogs]),
                    models.Swipe.action == "super_like",
                    func.date(models.Swipe.created_at) == today,
                )
                .count()
            )
            if sl_used >= sl_limit:
                raise HTTPException(
                    status_code=403,
                    detail="Limite de Super Likes atteinte pour aujourd'hui.",
                )

    existing = db.query(models.Swipe).filter(
        models.Swipe.swiper_dog_id == data.swiper_dog_id,
        models.Swipe.swiped_dog_id == data.swiped_dog_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Déjà swipé")

    swipe_obj = models.Swipe(
        swiper_dog_id=data.swiper_dog_id,
        swiped_dog_id=data.swiped_dog_id,
        action=data.action,
    )
    db.add(swipe_obj)
    db.commit()

    is_match = False
    if data.action in ("like", "super_like"):
        reverse = db.query(models.Swipe).filter(
            models.Swipe.swiper_dog_id == data.swiped_dog_id,
            models.Swipe.swiped_dog_id == data.swiper_dog_id,
            models.Swipe.action.in_(["like", "super_like"]),
        ).first()
        if reverse:
            match = models.Match(
                dog_1_id=min(data.swiper_dog_id, data.swiped_dog_id),
                dog_2_id=max(data.swiper_dog_id, data.swiped_dog_id),
            )
            db.add(match)
            db.commit()
            is_match = True

    return {"status": "ok", "is_match": is_match}


@router.get("/matches", response_model=list[schemas.MatchOut])
def get_matches(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    my_dog_ids = [d.id for d in current_user.dogs]
    if not my_dog_ids:
        return []

    matches = db.query(models.Match).filter(
        models.Match.is_active == True,
        or_(
            models.Match.dog_1_id.in_(my_dog_ids),
            models.Match.dog_2_id.in_(my_dog_ids),
        ),
    ).order_by(models.Match.created_at.desc()).all()
    return matches


# --- Search by Criteria (Patee+ only) ---
@router.get("/search", response_model=list[schemas.DogCardOut])
def search_dogs(
    breed: Optional[str] = Query(None),
    sex: Optional[str] = Query(None),
    intention: Optional[str] = Query(None),
    min_age_years: Optional[int] = Query(None),
    max_age_years: Optional[int] = Query(None),
    min_weight_kg: Optional[float] = Query(None),
    max_weight_kg: Optional[float] = Query(None),
    max_distance_km: Optional[float] = Query(None),
    has_pedigree: Optional[bool] = Query(None),
    health_verified: Optional[bool] = Query(None),
    coat_color: Optional[str] = Query(None),
    activity_level: Optional[str] = Query(None),
    good_with_kids: Optional[bool] = Query(None),
    good_with_cats: Optional[bool] = Query(None),
    good_with_dogs: Optional[bool] = Query(None),
    diet: Optional[str] = Query(None),
    sort_by: str = Query("distance"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Plan gating
    plan = get_user_plan(current_user)
    if plan == "croquette":
        raise HTTPException(
            status_code=403,
            detail="La recherche avancée est réservée aux plans Pâtée et Os en Or. Mettez à niveau votre abonnement !",
        )

    query = db.query(models.Dog).filter(models.Dog.owner_id != current_user.id)

    if breed:
        query = query.filter(models.Dog.breed.ilike(f"%{breed}%"))
    if sex:
        query = query.filter(models.Dog.sex == sex)
    if intention:
        query = query.filter(models.Dog.intention == intention)
    if min_age_years is not None:
        query = query.filter(models.Dog.age_years >= min_age_years)
    if max_age_years is not None:
        query = query.filter(models.Dog.age_years <= max_age_years)
    if min_weight_kg is not None:
        query = query.filter(models.Dog.weight_kg >= min_weight_kg)
    if max_weight_kg is not None:
        query = query.filter(models.Dog.weight_kg <= max_weight_kg)
    if has_pedigree is not None:
        query = query.filter(models.Dog.has_pedigree == has_pedigree)
    if health_verified is not None:
        query = query.filter(models.Dog.health_verified == health_verified)
    if coat_color:
        query = query.filter(models.Dog.coat_color.ilike(f"%{coat_color}%"))
    if activity_level:
        query = query.filter(models.Dog.activity_level == activity_level)
    if good_with_kids is not None:
        query = query.filter(models.Dog.good_with_kids == good_with_kids)
    if good_with_cats is not None:
        query = query.filter(models.Dog.good_with_cats == good_with_cats)
    if good_with_dogs is not None:
        query = query.filter(models.Dog.good_with_dogs == good_with_dogs)
    if diet:
        query = query.filter(models.Dog.diet == diet)

    candidates = query.all()
    results = []

    for dog in candidates:
        owner = db.query(models.User).filter(models.User.id == dog.owner_id).first()
        distance = None
        if current_user.latitude and owner and owner.latitude:
            distance = haversine(
                current_user.latitude, current_user.longitude,
                owner.latitude, owner.longitude,
            )
            if max_distance_km is not None and distance > max_distance_km:
                continue
        results.append(dog_to_card(dog, owner, distance))

    if sort_by == "age":
        results.sort(key=lambda x: x.age_years)
    elif sort_by == "name":
        results.sort(key=lambda x: x.name.lower())
    else:
        results.sort(key=lambda x: x.distance_km if x.distance_km is not None else 9999)

    start = (page - 1) * per_page
    return results[start:start + per_page]


# --- Puppy Predictor (Patee+ only) ---
BREED_SIZES = {
    "chihuahua": "tiny", "yorkshire": "tiny", "pomeranian": "tiny",
    "jack russell": "small", "beagle": "small", "cocker": "small", "cavalier": "small",
    "border collie": "medium", "bulldog": "medium", "berger australien": "medium",
    "labrador": "large", "golden retriever": "large", "berger allemand": "large",
    "husky": "large", "rottweiler": "large", "doberman": "large",
    "saint-bernard": "giant", "dogue allemand": "giant", "terre-neuve": "giant",
}

BREED_COLORS = {
    "labrador": ["noir", "chocolat", "sable"],
    "golden retriever": ["doré", "crème"],
    "berger allemand": ["noir et feu", "sable"],
    "husky": ["gris et blanc", "noir et blanc", "roux et blanc"],
    "bulldog": ["fauve", "bringé", "blanc"],
    "beagle": ["tricolore", "citron et blanc"],
    "border collie": ["noir et blanc", "rouge et blanc", "merle"],
    "rottweiler": ["noir et feu"],
    "cocker": ["doré", "noir", "roux"],
}

TEMPERAMENTS = {
    "labrador": ["joueur", "affectueux", "gourmand"],
    "golden retriever": ["doux", "patient", "intelligent"],
    "berger allemand": ["loyal", "protecteur", "courageux"],
    "husky": ["indépendant", "énergique", "vocal"],
    "bulldog": ["calme", "têtu", "affectueux"],
    "beagle": ["curieux", "joyeux", "déterminé"],
    "border collie": ["vif", "intelligent", "actif"],
    "jack russell": ["énergique", "intrépide", "joueur"],
}


def generate_puppy_image(breed_mix: str, possible_colors: list, size_estimate: str, temperament_mix: list) -> Optional[str]:
    """Generate a puppy image using OpenRouter image generation API."""
    color_desc = ", ".join(possible_colors[:3])
    size_map = {"tiny": "very small", "small": "small", "medium": "medium-sized", "large": "large", "giant": "very large"}
    size_desc = size_map.get(size_estimate, "medium-sized")
    temperament_desc = " and ".join(temperament_mix[:2]) if temperament_mix else "playful"

    prompt = (
        f"A single adorable {breed_mix} puppy, {size_desc} breed, "
        f"with {color_desc} coat coloring, looking {temperament_desc}. "
        f"The puppy is sitting in a soft, warm studio setting with gentle lighting. "
        f"Ultra realistic photo, shallow depth of field, professional pet photography, "
        f"cute expression, high quality, 8k resolution. No text, no watermark."
    )

    with httpx.Client(timeout=60.0) as client:
        response = client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://woofwoof.app",
                "X-Title": "WoofWoof Puppy Predictor",
            },
            json={
                "model": "openai/gpt-5-image-mini",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            },
        )
        response.raise_for_status()
        data = response.json()

        # Extract image from response
        choices = data.get("choices", [])
        if not choices:
            return None

        message = choices[0].get("message", {})

        # OpenRouter returns images in message.images array
        images = message.get("images", [])
        if images:
            for img_item in images:
                if img_item.get("type") == "image_url":
                    img_url = img_item.get("image_url", {}).get("url", "")
                    if img_url.startswith("data:image"):
                        header, b64data = img_url.split(",", 1)
                        filename = f"puppy_{uuid.uuid4().hex[:8]}.png"
                        filepath = os.path.join(GENERATED_IMAGES_DIR, filename)
                        with open(filepath, "wb") as f:
                            f.write(base64.b64decode(b64data))
                        return f"/generated/{filename}"
                    elif img_url.startswith("http"):
                        return img_url

        # Fallback: check content for inline images
        content = message.get("content", "")
        if isinstance(content, list):
            for item in content:
                if isinstance(item, dict) and item.get("type") == "image_url":
                    img_url = item.get("image_url", {}).get("url", "")
                    if img_url.startswith("data:image"):
                        header, b64data = img_url.split(",", 1)
                        filename = f"puppy_{uuid.uuid4().hex[:8]}.png"
                        filepath = os.path.join(GENERATED_IMAGES_DIR, filename)
                        with open(filepath, "wb") as f:
                            f.write(base64.b64decode(b64data))
                        return f"/generated/{filename}"
                    elif img_url.startswith("http"):
                        return img_url

    return None


@router.post("/puppy-predictor", response_model=schemas.PuppyPrediction)
def puppy_predictor(
    data: schemas.PuppyPredictorRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = get_user_plan(current_user)
    if plan == "croquette":
        raise HTTPException(
            status_code=403,
            detail="Le Puppy Predictor est réservé aux plans Pâtée et Os en Or.",
        )

    dog1 = db.query(models.Dog).filter(models.Dog.id == data.dog_1_id).first()
    dog2 = db.query(models.Dog).filter(models.Dog.id == data.dog_2_id).first()
    if not dog1 or not dog2:
        raise HTTPException(status_code=404, detail="Chien(s) non trouvé(s)")

    b1 = dog1.breed.lower().strip()
    b2 = dog2.breed.lower().strip()

    colors_1 = BREED_COLORS.get(b1, dog1.coat_color.split(",") if dog1.coat_color else ["inconnu"])
    colors_2 = BREED_COLORS.get(b2, dog2.coat_color.split(",") if dog2.coat_color else ["inconnu"])
    possible_colors = list(set(colors_1 + colors_2))

    size_1 = BREED_SIZES.get(b1, "medium")
    size_2 = BREED_SIZES.get(b2, "medium")
    size_order = ["tiny", "small", "medium", "large", "giant"]
    avg_idx = (size_order.index(size_1) + size_order.index(size_2)) // 2
    size_estimate = size_order[avg_idx]

    temp_1 = TEMPERAMENTS.get(b1, dog1.temperament.split(",")[:2] if dog1.temperament else ["adaptable"])
    temp_2 = TEMPERAMENTS.get(b2, dog2.temperament.split(",")[:2] if dog2.temperament else ["adaptable"])
    temperament_mix = list(set(temp_1[:2] + temp_2[:2]))

    health_notes = []
    if b1 == b2:
        health_notes.append("Race pure - vérifier les tests génétiques spécifiques à la race")
    else:
        health_notes.append("Croisement - vigueur hybride possible")
    if size_1 != size_2:
        health_notes.append("Différence de taille - suivi vétérinaire recommandé")

    breed_mix = dog1.breed if b1 == b2 else f"{dog1.breed} x {dog2.breed}"

    avg_weight = ((dog1.weight_kg or 15) + (dog2.weight_kg or 15)) / 2
    if avg_weight < 5:
        litter = "1-3 chiots"
    elif avg_weight < 15:
        litter = "3-5 chiots"
    elif avg_weight < 30:
        litter = "5-8 chiots"
    else:
        litter = "6-12 chiots"

    # Generate puppy image via OpenRouter
    puppy_image_url = None
    try:
        puppy_image_url = generate_puppy_image(
            breed_mix=breed_mix,
            possible_colors=possible_colors,
            size_estimate=size_estimate,
            temperament_mix=temperament_mix,
        )
    except Exception as e:
        print(f"Image generation failed: {e}")

    return schemas.PuppyPrediction(
        possible_colors=possible_colors,
        size_estimate=size_estimate,
        temperament_mix=temperament_mix,
        health_notes=health_notes,
        breed_mix=breed_mix,
        litter_size_estimate=litter,
        puppy_image_url=puppy_image_url,
    )
