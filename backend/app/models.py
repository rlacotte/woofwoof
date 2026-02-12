from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .database import Base


class IntentionType(str, enum.Enum):
    REPRODUCTION = "reproduction"
    BALADE = "balade"
    BOTH = "both"


class SwipeAction(str, enum.Enum):
    LIKE = "like"
    PASS = "pass"
    SUPER_LIKE = "super_like"


class PlanType(str, enum.Enum):
    CROQUETTE = "croquette"
    PATEE = "patee"
    OS_EN_OR = "os_en_or"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    is_premium = Column(Boolean, default=False)
    plan_type = Column(String, default=PlanType.CROQUETTE)
    created_at = Column(DateTime, default=datetime.utcnow)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    city = Column(String, nullable=True)

    # Hub order customization: JSON array of hub IDs
    hub_order = Column(Text, nullable=True)  # e.g., '["health","walk","food",...]'

    dogs = relationship("Dog", back_populates="owner", cascade="all, delete-orphan")


class Dog(Base):
    __tablename__ = "dogs"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    breed = Column(String, nullable=False)
    age_years = Column(Integer, nullable=False)
    age_months = Column(Integer, default=0)
    weight_kg = Column(Float, nullable=True)
    sex = Column(String, nullable=False)
    is_neutered = Column(Boolean, default=False)
    pedigree = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    temperament = Column(String, nullable=True)
    intention = Column(String, default=IntentionType.BALADE)

    # --- Photos ---
    photo_url_1 = Column(String, nullable=True)
    photo_url_2 = Column(String, nullable=True)
    photo_url_3 = Column(String, nullable=True)
    photo_url_4 = Column(String, nullable=True)
    photo_url_5 = Column(String, nullable=True)
    photo_url_6 = Column(String, nullable=True)

    # --- Identite & Enregistrement ---
    date_of_birth = Column(DateTime, nullable=True)
    lof_number = Column(String, nullable=True)
    microchip_number = Column(String, nullable=True)
    kennel_name = Column(String, nullable=True)

    # --- Pedigree / Lignee ---
    sire_name = Column(String, nullable=True)
    sire_breed = Column(String, nullable=True)
    dam_name = Column(String, nullable=True)
    dam_breed = Column(String, nullable=True)
    has_pedigree = Column(Boolean, default=False)
    pedigree_url = Column(String, nullable=True)

    # --- Physique ---
    coat_color = Column(String, nullable=True)
    height_cm = Column(Float, nullable=True)
    eye_color = Column(String, nullable=True)

    # --- Sante ---
    health_tests = Column(Text, nullable=True)
    vaccination_status = Column(String, nullable=True)
    allergies = Column(Text, nullable=True)
    health_verified = Column(Boolean, default=False)
    breeder_certified = Column(Boolean, default=False)

    # --- Mode de vie ---
    activity_level = Column(String, nullable=True)
    diet = Column(String, nullable=True)
    good_with_kids = Column(Boolean, nullable=True)
    good_with_cats = Column(Boolean, nullable=True)
    good_with_dogs = Column(Boolean, nullable=True)

    # --- Palmares ---
    titles = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="dogs")


class Swipe(Base):
    __tablename__ = "swipes"

    id = Column(Integer, primary_key=True, index=True)
    swiper_dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    swiped_dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    action = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    swiper_dog_rel = relationship("Dog", foreign_keys=[swiper_dog_id])
    swiped_dog_rel = relationship("Dog", foreign_keys=[swiped_dog_id])


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    dog_1_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    dog_2_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    dog_1 = relationship("Dog", foreign_keys=[dog_1_id])
    dog_2 = relationship("Dog", foreign_keys=[dog_2_id])


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    match = relationship("Match")
    sender = relationship("User")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    plan = Column(String, default=PlanType.CROQUETTE)
    started_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", backref="subscription")


# ============================================================
# WoofHealth - Sante & Bien-etre
# ============================================================

class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    record_type = Column(String, nullable=False)  # checkup, surgery, illness, allergy, other
    date = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
    vet_name = Column(String, nullable=True)
    document_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    dog = relationship("Dog")


class VetVaccination(Base):
    __tablename__ = "vet_vaccinations"

    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    name = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    next_due = Column(DateTime, nullable=True)
    vet_name = Column(String, nullable=True)
    batch_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    dog = relationship("Dog")


class VetAppointment(Base):
    __tablename__ = "vet_appointments"

    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    vet_name = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    appointment_type = Column(String, nullable=False)  # checkup, vaccination, surgery, grooming
    notes = Column(Text, nullable=True)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    dog = relationship("Dog")


# ============================================================
# WoofWalk - Promenades & Activite
# ============================================================

class Walk(Base):
    __tablename__ = "walks"

    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    distance_km = Column(Float, default=0)
    duration_minutes = Column(Integer, default=0)
    calories = Column(Integer, default=0)
    route_json = Column(Text, nullable=True)  # JSON array of {lat, lng}
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    dog = relationship("Dog")
    user = relationship("User")


class WalkSpot(Base):
    __tablename__ = "walk_spots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    spot_type = Column(String, nullable=False)  # park, forest, beach, trail, dog_park
    rating = Column(Float, default=0)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    city = Column(String, nullable=True)
    added_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


# ============================================================
# WoofFood - Nutrition & Alimentation
# ============================================================

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    meal_type = Column(String, nullable=False)  # breakfast, lunch, dinner, snack
    food_name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    portion_grams = Column(Float, nullable=True)
    time = Column(String, nullable=True)  # e.g. "08:00"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    dog = relationship("Dog")


class FoodProduct(Base):
    __tablename__ = "food_products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    product_type = Column(String, nullable=False)  # croquettes, pate, friandise, complement
    rating = Column(Float, default=0)
    protein_pct = Column(Float, nullable=True)
    fat_pct = Column(Float, nullable=True)
    fiber_pct = Column(Float, nullable=True)
    ingredients = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    price = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ============================================================
# WoofSitter - Garde & Pet-sitting
# ============================================================

class SitterProfile(Base):
    __tablename__ = "sitter_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    bio = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    rate_per_hour = Column(Float, nullable=True)
    rate_per_day = Column(Float, nullable=True)
    services = Column(String, nullable=True)  # comma-separated: walking,boarding,daycare,visits
    max_dogs = Column(Integer, default=3)
    has_garden = Column(Boolean, default=False)
    verified = Column(Boolean, default=False)
    rating = Column(Float, default=0)
    total_reviews = Column(Integer, default=0)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class SitterBooking(Base):
    __tablename__ = "sitter_bookings"

    id = Column(Integer, primary_key=True, index=True)
    sitter_id = Column(Integer, ForeignKey("sitter_profiles.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    service_type = Column(String, nullable=False)  # walking, boarding, daycare, visit
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String, default="pending")  # pending, confirmed, completed, cancelled
    total_price = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sitter = relationship("SitterProfile")
    owner = relationship("User")
    dog = relationship("Dog")


class SitterReview(Base):
    __tablename__ = "sitter_reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("sitter_bookings.id"), nullable=False)
    sitter_id = Column(Integer, ForeignKey("sitter_profiles.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("SitterBooking")
    sitter = relationship("SitterProfile")
    reviewer = relationship("User")


# ============================================================
# WoofSocial - Reseau Social
# ============================================================

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=True)
    content = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    dog = relationship("Dog")


class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post")
    user = relationship("User")


class PostComment(Base):
    __tablename__ = "post_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post")
    user = relationship("User")


class Follow(Base):
    __tablename__ = "follows"

    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    followed_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    follower = relationship("User", foreign_keys=[follower_id])
    followed = relationship("User", foreign_keys=[followed_id])


# ============================================================
# WoofShop - Marketplace & E-commerce
# ============================================================

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)  # toys, accessories, clothing, grooming, beds, bowls
    image_url = Column(String, nullable=True)
    stock = Column(Integer, default=0)
    rating = Column(Float, default=0)
    brand = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    product = relationship("Product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, confirmed, shipped, delivered
    shipping_address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order")
    product = relationship("Product")


# ============================================================
# WoofTrain - Education & Dressage
# ============================================================

class TrainingProgram(Base):
    __tablename__ = "training_programs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String, nullable=False)  # beginner, intermediate, advanced
    category = Column(String, nullable=True)  # obedience, tricks, agility, socialization
    duration_weeks = Column(Integer, default=4)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class TrainingStep(Base):
    __tablename__ = "training_steps"

    id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("training_programs.id"), nullable=False)
    step_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    tips = Column(Text, nullable=True)
    duration_minutes = Column(Integer, default=15)
    created_at = Column(DateTime, default=datetime.utcnow)

    program = relationship("TrainingProgram")


class UserTrainingProgress(Base):
    __tablename__ = "user_training_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("training_programs.id"), nullable=False)
    current_step = Column(Integer, default=1)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User")
    dog = relationship("Dog")
    program = relationship("TrainingProgram")


# ============================================================
# WoofAdopt - Adoption & Refuge
# ============================================================

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AdoptionListing(Base):
    __tablename__ = "adoption_listings"

    id = Column(Integer, primary_key=True, index=True)
    shelter_id = Column(Integer, ForeignKey("shelters.id"), nullable=False)
    name = Column(String, nullable=False)
    breed = Column(String, nullable=True)
    age_years = Column(Integer, nullable=True)
    age_months = Column(Integer, default=0)
    sex = Column(String, nullable=True)
    weight_kg = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    temperament = Column(String, nullable=True)
    photo_url_1 = Column(String, nullable=True)
    photo_url_2 = Column(String, nullable=True)
    good_with_kids = Column(Boolean, nullable=True)
    good_with_cats = Column(Boolean, nullable=True)
    good_with_dogs = Column(Boolean, nullable=True)
    is_neutered = Column(Boolean, default=False)
    status = Column(String, default="available")  # available, pending, adopted
    created_at = Column(DateTime, default=datetime.utcnow)

    shelter = relationship("Shelter")


class AdoptionRequest(Base):
    __tablename__ = "adoption_requests"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("adoption_listings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("AdoptionListing")
    user = relationship("User")


# ============================================================
# WoofTravel - Voyages & Deplacements
# ============================================================

class PetFriendlyPlace(Base):
    __tablename__ = "pet_friendly_places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    place_type = Column(String, nullable=False)  # hotel, restaurant, cafe, beach, camping, transport
    city = Column(String, nullable=True)
    address = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    rating = Column(Float, default=0)
    description = Column(Text, nullable=True)
    amenities = Column(String, nullable=True)  # comma-separated: water_bowl, garden, dog_menu
    photo_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    added_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class TravelChecklist(Base):
    __tablename__ = "travel_checklists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    destination = Column(String, nullable=False)
    departure_date = Column(DateTime, nullable=True)
    items_json = Column(Text, nullable=True)  # JSON array of {item, checked}
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    dog = relationship("Dog")


# ============================================================
# WoofInsure - Assurance & Finance
# ============================================================

class InsurancePlan(Base):
    __tablename__ = "insurance_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    monthly_price = Column(Float, nullable=False)
    annual_price = Column(Float, nullable=True)
    coverage_pct = Column(Integer, default=80)  # percentage reimbursed
    deductible = Column(Float, default=0)
    max_annual = Column(Float, nullable=True)
    covers_accident = Column(Boolean, default=True)
    covers_illness = Column(Boolean, default=True)
    covers_prevention = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class InsuranceClaim(Base):
    __tablename__ = "insurance_claims"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("insurance_plans.id"), nullable=True)
    claim_type = Column(String, nullable=False)  # accident, illness, prevention
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="submitted")  # submitted, processing, approved, rejected
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    dog = relationship("Dog")
    plan = relationship("InsurancePlan")


# ============================================================
# WoofID - Identification & Securite
# ============================================================

class PetTag(Base):
    __tablename__ = "pet_tags"

    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    tag_code = Column(String, unique=True, nullable=False)
    tag_type = Column(String, default="qr")  # qr, nfc
    is_active = Column(Boolean, default=True)
    scans_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    dog = relationship("Dog")


class LostPetAlert(Base):
    __tablename__ = "lost_pet_alerts"

    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    last_seen_address = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    status = Column(String, default="active")  # active, found, closed
    contact_phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    dog = relationship("Dog")
    user = relationship("User")


class LostPetSighting(Base):
    __tablename__ = "lost_pet_sightings"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("lost_pet_alerts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    alert = relationship("LostPetAlert")
    user = relationship("User")


# ============================================================
# WoofBreed - Elevage & Reproduction
# ============================================================

class BreederProfile(Base):
    __tablename__ = "breeder_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    kennel_name = Column(String, nullable=False)
    breeds = Column(String, nullable=True)  # comma-separated
    city = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    website = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    verified = Column(Boolean, default=False)
    rating = Column(Float, default=0)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class Litter(Base):
    __tablename__ = "litters"

    id = Column(Integer, primary_key=True, index=True)
    breeder_id = Column(Integer, ForeignKey("breeder_profiles.id"), nullable=False)
    sire_name = Column(String, nullable=True)
    sire_breed = Column(String, nullable=True)
    dam_name = Column(String, nullable=True)
    dam_breed = Column(String, nullable=True)
    breed = Column(String, nullable=False)
    birth_date = Column(DateTime, nullable=True)
    puppy_count = Column(Integer, default=0)
    available_count = Column(Integer, default=0)
    price = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    status = Column(String, default="available")  # upcoming, available, reserved, sold
    created_at = Column(DateTime, default=datetime.utcnow)

    breeder = relationship("BreederProfile")


class PedigreeEntry(Base):
    __tablename__ = "pedigree_entries"

    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id"), nullable=False)
    generation = Column(Integer, nullable=False)  # 1=parents, 2=grandparents, etc.
    position = Column(String, nullable=False)  # sire, dam, sire_sire, sire_dam, etc.
    ancestor_name = Column(String, nullable=False)
    ancestor_breed = Column(String, nullable=True)
    titles = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    dog = relationship("Dog")


# ============================================================
# WoofAlert - Securite & Dangers
# ============================================================

class DangerZone(Base):
    __tablename__ = "danger_zones"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    alert_type = Column(String, nullable=False)  # ticks, plants, other
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    city = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
