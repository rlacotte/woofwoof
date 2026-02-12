from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import os, uuid, shutil

from ..database import get_db
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user
from .. import models, schemas

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/api", tags=["auth & profiles"])


# ---- Auth ----
@router.post("/auth/register", response_model=schemas.Token)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    user = models.User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/auth/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/me/location")
def update_location(
    loc: schemas.LocationUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.latitude = loc.latitude
    current_user.longitude = loc.longitude
    current_user.city = loc.city
    db.commit()
    return {"status": "ok"}


@router.put("/me/hub-order")
def update_hub_order(
    hub_order: schemas.HubOrderUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    current_user.hub_order = json.dumps(hub_order.hub_ids)
    db.commit()
    return {"status": "ok", "hub_order": hub_order.hub_ids}


@router.get("/me/hub-order")
def get_hub_order(
    current_user: models.User = Depends(get_current_user),
):
    import json
    if current_user.hub_order:
        return {"hub_order": json.loads(current_user.hub_order)}
    return {"hub_order": None}


# ---- Dogs ----
@router.post("/dogs", response_model=schemas.DogOut)
def create_dog(
    dog_data: schemas.DogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dog = models.Dog(owner_id=current_user.id, **dog_data.model_dump())
    db.add(dog)
    db.commit()
    db.refresh(dog)
    return dog


@router.get("/dogs", response_model=list[schemas.DogOut])
def get_my_dogs(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Dog).filter(models.Dog.owner_id == current_user.id).all()


@router.get("/dogs/{dog_id}", response_model=schemas.DogOut)
def get_dog(dog_id: int, db: Session = Depends(get_db)):
    dog = db.query(models.Dog).filter(models.Dog.id == dog_id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouvé")
    return dog


@router.put("/dogs/{dog_id}", response_model=schemas.DogOut)
def update_dog(
    dog_id: int,
    dog_data: schemas.DogUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouvé")

    update_data = dog_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(dog, key, value)

    db.commit()
    db.refresh(dog)
    return dog


@router.delete("/dogs/{dog_id}")
def delete_dog(
    dog_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouvé")
    db.delete(dog)
    db.commit()
    return {"status": "deleted"}


# ---- Photo Upload ----
@router.post("/upload-photo")
async def upload_photo(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Format non supporté. Utilisez JPEG, PNG, WebP ou GIF.")

    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex[:12]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB max
            raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 10MB)")
        f.write(content)

    return {"url": f"/uploads/{filename}"}


# ---- Verification ----
@router.post("/dogs/{dog_id}/verify-health")
def verify_health(
    dog_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouvé")
    if not dog.vaccination_status or not dog.health_tests:
        raise HTTPException(status_code=400, detail="Remplissez d'abord les infos santé (vaccins + tests)")
    dog.health_verified = True
    db.commit()
    return {"status": "ok", "health_verified": True}


@router.post("/dogs/{dog_id}/verify-breeder")
def verify_breeder(
    dog_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dog = db.query(models.Dog).filter(
        models.Dog.id == dog_id, models.Dog.owner_id == current_user.id
    ).first()
    if not dog:
        raise HTTPException(status_code=404, detail="Chien non trouvé")
    if not dog.has_pedigree or not dog.lof_number:
        raise HTTPException(status_code=400, detail="Remplissez d'abord le pedigree et le numéro LOF")
    dog.breeder_certified = True
    db.commit()
    return {"status": "ok", "breeder_certified": True}
