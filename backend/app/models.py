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
