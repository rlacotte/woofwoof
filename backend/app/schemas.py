from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# --- Auth ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool
    is_premium: bool
    plan_type: str
    latitude: Optional[float]
    longitude: Optional[float]
    city: Optional[str]
    hub_order: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Dog ---
class DogCreate(BaseModel):
    name: str
    breed: str
    age_years: int
    age_months: int = 0
    weight_kg: Optional[float] = None
    sex: str
    is_neutered: bool = False
    pedigree: Optional[str] = None
    bio: Optional[str] = None
    temperament: Optional[str] = None
    intention: str = "balade"
    # Photos
    photo_url_1: Optional[str] = None
    photo_url_2: Optional[str] = None
    photo_url_3: Optional[str] = None
    photo_url_4: Optional[str] = None
    photo_url_5: Optional[str] = None
    photo_url_6: Optional[str] = None
    # Identite
    date_of_birth: Optional[datetime] = None
    lof_number: Optional[str] = None
    microchip_number: Optional[str] = None
    kennel_name: Optional[str] = None
    # Pedigree
    sire_name: Optional[str] = None
    sire_breed: Optional[str] = None
    dam_name: Optional[str] = None
    dam_breed: Optional[str] = None
    has_pedigree: bool = False
    pedigree_url: Optional[str] = None
    # Physique
    coat_color: Optional[str] = None
    height_cm: Optional[float] = None
    eye_color: Optional[str] = None
    # Sante
    health_tests: Optional[str] = None
    vaccination_status: Optional[str] = None
    allergies: Optional[str] = None
    # Mode de vie
    activity_level: Optional[str] = None
    diet: Optional[str] = None
    good_with_kids: Optional[bool] = None
    good_with_cats: Optional[bool] = None
    good_with_dogs: Optional[bool] = None
    # Palmares
    titles: Optional[str] = None


class DogUpdate(BaseModel):
    name: Optional[str] = None
    breed: Optional[str] = None
    age_years: Optional[int] = None
    age_months: Optional[int] = None
    weight_kg: Optional[float] = None
    bio: Optional[str] = None
    temperament: Optional[str] = None
    intention: Optional[str] = None
    photo_url_1: Optional[str] = None
    photo_url_2: Optional[str] = None
    photo_url_3: Optional[str] = None
    photo_url_4: Optional[str] = None
    photo_url_5: Optional[str] = None
    photo_url_6: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    lof_number: Optional[str] = None
    microchip_number: Optional[str] = None
    kennel_name: Optional[str] = None
    sire_name: Optional[str] = None
    sire_breed: Optional[str] = None
    dam_name: Optional[str] = None
    dam_breed: Optional[str] = None
    has_pedigree: Optional[bool] = None
    pedigree_url: Optional[str] = None
    coat_color: Optional[str] = None
    height_cm: Optional[float] = None
    eye_color: Optional[str] = None
    health_tests: Optional[str] = None
    vaccination_status: Optional[str] = None
    allergies: Optional[str] = None
    activity_level: Optional[str] = None
    diet: Optional[str] = None
    good_with_kids: Optional[bool] = None
    good_with_cats: Optional[bool] = None
    good_with_dogs: Optional[bool] = None
    titles: Optional[str] = None


class DogOut(BaseModel):
    id: int
    owner_id: int
    name: str
    breed: str
    age_years: int
    age_months: int
    weight_kg: Optional[float]
    sex: str
    is_neutered: bool
    pedigree: Optional[str]
    bio: Optional[str]
    temperament: Optional[str]
    intention: str
    photo_url_1: Optional[str]
    photo_url_2: Optional[str]
    photo_url_3: Optional[str]
    photo_url_4: Optional[str]
    photo_url_5: Optional[str]
    photo_url_6: Optional[str]
    date_of_birth: Optional[datetime]
    lof_number: Optional[str]
    microchip_number: Optional[str]
    kennel_name: Optional[str]
    sire_name: Optional[str]
    sire_breed: Optional[str]
    dam_name: Optional[str]
    dam_breed: Optional[str]
    has_pedigree: bool
    pedigree_url: Optional[str]
    coat_color: Optional[str]
    height_cm: Optional[float]
    eye_color: Optional[str]
    health_tests: Optional[str]
    vaccination_status: Optional[str]
    allergies: Optional[str]
    health_verified: bool
    breeder_certified: bool
    activity_level: Optional[str]
    diet: Optional[str]
    good_with_kids: Optional[bool]
    good_with_cats: Optional[bool]
    good_with_dogs: Optional[bool]
    titles: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DogCardOut(BaseModel):
    id: int
    name: str
    breed: str
    age_years: int
    age_months: int
    weight_kg: Optional[float]
    sex: str
    bio: Optional[str]
    temperament: Optional[str]
    intention: str
    photo_url_1: Optional[str]
    photo_url_2: Optional[str]
    photo_url_3: Optional[str]
    health_verified: bool
    breeder_certified: bool
    # Enriched fields
    coat_color: Optional[str] = None
    has_pedigree: bool = False
    lof_number: Optional[str] = None
    kennel_name: Optional[str] = None
    activity_level: Optional[str] = None
    diet: Optional[str] = None
    good_with_kids: Optional[bool] = None
    good_with_cats: Optional[bool] = None
    good_with_dogs: Optional[bool] = None
    titles: Optional[str] = None
    sire_name: Optional[str] = None
    dam_name: Optional[str] = None
    height_cm: Optional[float] = None
    eye_color: Optional[str] = None
    vaccination_status: Optional[str] = None
    # Owner info
    owner_name: Optional[str] = None
    owner_city: Optional[str] = None
    distance_km: Optional[float] = None
    # Compatibility
    compatibility_score: Optional[int] = None

    class Config:
        from_attributes = True


# --- Swipe & Match ---
class SwipeCreate(BaseModel):
    swiper_dog_id: int
    swiped_dog_id: int
    action: str


class MatchOut(BaseModel):
    id: int
    dog_1: DogOut
    dog_2: DogOut
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


# --- Messaging ---
class MessageCreate(BaseModel):
    match_id: int
    content: str


class MessageOut(BaseModel):
    id: int
    match_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Location ---
class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    city: Optional[str] = None


# --- Hub Order ---
class HubOrderUpdate(BaseModel):
    hub_ids: List[str]


# --- Puppy Predictor ---
class PuppyPredictorRequest(BaseModel):
    dog_1_id: int
    dog_2_id: int


class PuppyPrediction(BaseModel):
    possible_colors: List[str]
    size_estimate: str
    temperament_mix: List[str]
    health_notes: List[str]
    breed_mix: str
    litter_size_estimate: str
    puppy_image_url: Optional[str] = None


# --- Plans ---
class PlanFeature(BaseModel):
    label: str
    included: bool


class PlanOut(BaseModel):
    id: str
    name: str
    icon: str
    price_monthly: float
    features: List[PlanFeature]
    is_current: bool = False


class SubscriptionOut(BaseModel):
    plan: str
    started_at: datetime
    expires_at: Optional[datetime]
    is_active: bool

    class Config:
        from_attributes = True


class SubscribeRequest(BaseModel):
    plan: str


class SwipeLimitOut(BaseModel):
    daily_limit: int
    used_today: int
    remaining: int
    plan: str
