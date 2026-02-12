"""Seed the database with enriched demo data."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models import (
    User, Dog, Subscription,
    HealthRecord, VetVaccination, VetAppointment,
    Walk, WalkSpot,
    MealPlan, FoodProduct,
    SitterProfile, SitterBooking, SitterReview,
    Post, PostLike, PostComment, Follow,
    Product, CartItem, Order, OrderItem,
    TrainingProgram, TrainingStep, UserTrainingProgress,
    Shelter, AdoptionListing, AdoptionRequest,
    PetFriendlyPlace, TravelChecklist,
    InsurancePlan, InsuranceClaim,
    PetTag, LostPetAlert, LostPetSighting,
    BreederProfile, Litter, PedigreeEntry,
)
from app.auth import get_password_hash

Base.metadata.create_all(bind=engine)
db = SessionLocal()

for tbl in reversed(Base.metadata.sorted_tables):
    db.execute(tbl.delete())
db.commit()

users_data = [
    {"email": "marie@example.com", "full_name": "Marie Dupont", "city": "Paris", "lat": 48.8566, "lon": 2.3522, "plan": "os_en_or"},
    {"email": "jean@example.com", "full_name": "Jean Martin", "city": "Lyon", "lat": 45.7640, "lon": 4.8357, "plan": "patee"},
    {"email": "sophie@example.com", "full_name": "Sophie Bernard", "city": "Paris", "lat": 48.8606, "lon": 2.3376, "plan": "croquette"},
    {"email": "pierre@example.com", "full_name": "Pierre Durand", "city": "Marseille", "lat": 43.2965, "lon": 5.3698, "plan": "croquette"},
    {"email": "chloe@example.com", "full_name": "Chloe Petit", "city": "Paris", "lat": 48.8530, "lon": 2.3499, "plan": "patee"},
    {"email": "luc@example.com", "full_name": "Luc Moreau", "city": "Bordeaux", "lat": 44.8378, "lon": -0.5792, "plan": "croquette"},
]

users = []
for u in users_data:
    user = User(
        email=u["email"], hashed_password=get_password_hash("demo1234"),
        full_name=u["full_name"], city=u["city"],
        latitude=u["lat"], longitude=u["lon"],
        plan_type=u["plan"], is_premium=u["plan"] != "croquette",
    )
    db.add(user)
    db.flush()
    users.append(user)
    sub = Subscription(user_id=user.id, plan=u["plan"])
    db.add(sub)

dogs_data = [
    {
        "owner_idx": 0, "name": "Rex", "breed": "Berger Allemand",
        "age_years": 3, "age_months": 6, "weight_kg": 32, "sex": "male",
        "date_of_birth": datetime(2022, 8, 15),
        "lof_number": "LOF 2 BGA 12345/2022", "microchip_number": "250269802123456",
        "kennel_name": "Du Domaine des Braves",
        "sire_name": "Ch. Arko du Val d'Aisne", "sire_breed": "Berger Allemand",
        "dam_name": "Bella du Clos des Tilleuls", "dam_breed": "Berger Allemand",
        "has_pedigree": True,
        "coat_color": "Noir et feu", "height_cm": 63, "eye_color": "Marron",
        "health_tests": '{"dysplasie_hanches":"A","dysplasie_coudes":"0","ADN_DM":"clear"}',
        "vaccination_status": "a_jour",
        "activity_level": "high", "diet": "croquettes",
        "good_with_kids": True, "good_with_cats": False, "good_with_dogs": True,
        "titles": "Champion de France, SchH1",
        "bio": "Rex adore jouer au frisbee et est tres protecteur. Champion de France 2024, pedigree exceptionnel.",
        "temperament": "loyal,protecteur,joueur", "intention": "reproduction",
        "photo_url_1": "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600",
        "health_verified": True, "breeder_certified": True,
    },
    {
        "owner_idx": 1, "name": "Luna", "breed": "Golden Retriever",
        "age_years": 2, "age_months": 3, "weight_kg": 28, "sex": "female",
        "date_of_birth": datetime(2023, 11, 2),
        "lof_number": "LOF 1 GR 67890/2023", "microchip_number": "250269802234567",
        "kennel_name": "Des Terres Dorees",
        "sire_name": "Duke of Golden Valley", "sire_breed": "Golden Retriever",
        "dam_name": "Sunshine des Terres Dorees", "dam_breed": "Golden Retriever",
        "has_pedigree": True,
        "coat_color": "Dore", "height_cm": 54, "eye_color": "Noisette",
        "health_tests": '{"dysplasie_hanches":"B","ADN_PRA":"clear","ADN_ICT":"clear"}',
        "vaccination_status": "a_jour",
        "activity_level": "moderate", "diet": "mixte",
        "good_with_kids": True, "good_with_cats": True, "good_with_dogs": True,
        "bio": "Luna est une boule d'amour ! Douce, patiente et intelligente. Ideale pour la famille.",
        "temperament": "doux,affectueux,intelligent", "intention": "both",
        "photo_url_1": "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=600",
        "health_verified": True, "breeder_certified": False,
    },
    {
        "owner_idx": 2, "name": "Milo", "breed": "Bulldog Francais",
        "age_years": 4, "weight_kg": 12, "sex": "male",
        "coat_color": "Fauve bringe", "height_cm": 32, "eye_color": "Marron fonce",
        "vaccination_status": "a_jour",
        "activity_level": "low", "diet": "patee",
        "good_with_kids": True, "good_with_cats": True, "good_with_dogs": False,
        "has_pedigree": False,
        "bio": "Milo est le roi du canape. Petit mais costaud, caractere en or ! Ronfleur professionnel.",
        "temperament": "calme,tetu,affectueux", "intention": "balade",
        "photo_url_1": "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600",
    },
    {
        "owner_idx": 3, "name": "Nala", "breed": "Labrador",
        "age_years": 1, "age_months": 8, "weight_kg": 25, "sex": "female",
        "date_of_birth": datetime(2024, 6, 20),
        "kennel_name": "Du Soleil Levant",
        "sire_name": "Max du Soleil Levant", "sire_breed": "Labrador",
        "dam_name": "Caramel des Iles", "dam_breed": "Labrador",
        "has_pedigree": True, "lof_number": "LOF 1 LAB 11111/2024",
        "coat_color": "Chocolat", "height_cm": 55, "eye_color": "Ambre",
        "health_tests": '{"dysplasie_hanches":"A","ADN_EIC":"carrier"}',
        "vaccination_status": "a_jour",
        "activity_level": "very_high", "diet": "croquettes",
        "good_with_kids": True, "good_with_cats": False, "good_with_dogs": True,
        "bio": "Nala est un bebe dans sa tete ! Tres joueuse, adore l'eau et les longues promenades.",
        "temperament": "joueur,energique,gourmand", "intention": "balade",
        "photo_url_1": "https://images.unsplash.com/photo-1579213838058-4a005df44a5a?w=600",
        "health_verified": True,
    },
    {
        "owner_idx": 4, "name": "Oscar", "breed": "Border Collie",
        "age_years": 5, "weight_kg": 20, "sex": "male",
        "date_of_birth": datetime(2021, 1, 10),
        "lof_number": "LOF 1 BC 55555/2021", "microchip_number": "250269802555555",
        "kennel_name": "De la Vallee des Ombres",
        "sire_name": "Fly de la Vallee", "sire_breed": "Border Collie",
        "dam_name": "Fleur des Montagnes", "dam_breed": "Border Collie",
        "has_pedigree": True,
        "coat_color": "Noir et blanc", "height_cm": 52, "eye_color": "Marron",
        "health_tests": '{"dysplasie_hanches":"A","ADN_CEA":"clear","ADN_TNS":"clear"}',
        "vaccination_status": "a_jour",
        "activity_level": "very_high", "diet": "barf",
        "good_with_kids": True, "good_with_cats": True, "good_with_dogs": True,
        "titles": "Champion Agility France 2024, Obedience 3",
        "bio": "Oscar est le plus intelligent du parc ! Champion d'agility, comprend plus de 50 commandes.",
        "temperament": "vif,intelligent,actif", "intention": "reproduction",
        "photo_url_1": "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=600",
        "health_verified": True, "breeder_certified": True,
    },
    {
        "owner_idx": 5, "name": "Bella", "breed": "Husky",
        "age_years": 3, "weight_kg": 22, "sex": "female",
        "date_of_birth": datetime(2023, 2, 14),
        "kennel_name": "Du Grand Nord",
        "sire_name": "Storm du Grand Nord", "sire_breed": "Husky Siberien",
        "dam_name": "Neige des Flocons", "dam_breed": "Husky Siberien",
        "has_pedigree": True, "lof_number": "LOF 5 HS 77777/2023",
        "coat_color": "Gris et blanc", "height_cm": 53, "eye_color": "Bleu",
        "health_tests": '{"dysplasie_hanches":"B","yeux":"clear"}',
        "vaccination_status": "a_jour",
        "activity_level": "very_high", "diet": "croquettes",
        "good_with_kids": True, "good_with_cats": False, "good_with_dogs": True,
        "bio": "Bella a les plus beaux yeux bleus ! Adore courir et hurler a la lune. Fugueuse occasionnelle.",
        "temperament": "independant,energique,vocal", "intention": "both",
        "photo_url_1": "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600",
    },
    {
        "owner_idx": 0, "name": "Pixel", "breed": "Jack Russell",
        "age_years": 2, "weight_kg": 6, "sex": "male",
        "coat_color": "Blanc et marron", "height_cm": 28,
        "activity_level": "very_high", "diet": "croquettes",
        "good_with_kids": False, "good_with_cats": False, "good_with_dogs": True,
        "has_pedigree": False,
        "bio": "Petit mais explosif ! Pixel ne tient pas en place et adore creuser des trous.",
        "temperament": "energique,intrepide,joueur", "intention": "balade",
        "photo_url_1": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600",
    },
    {
        "owner_idx": 2, "name": "Choupette", "breed": "Cavalier King Charles",
        "age_years": 6, "weight_kg": 7, "sex": "female",
        "date_of_birth": datetime(2020, 5, 1),
        "lof_number": "LOF 1 CKC 99999/2020",
        "kennel_name": "Des Jardins Royaux",
        "sire_name": "Prince des Jardins Royaux", "sire_breed": "Cavalier King Charles",
        "dam_name": "Duchesse de Versailles", "dam_breed": "Cavalier King Charles",
        "has_pedigree": True,
        "coat_color": "Blenheim", "height_cm": 30, "eye_color": "Marron",
        "health_tests": '{"coeur_MVD":"grade_1","syringomyelie":"clear"}',
        "vaccination_status": "a_jour", "allergies": "Poulet",
        "activity_level": "low", "diet": "patee",
        "good_with_kids": True, "good_with_cats": True, "good_with_dogs": True,
        "titles": "Best in Show regional 2023",
        "bio": "Choupette est une vraie princesse. Douce et calme, allergique au poulet.",
        "temperament": "doux,calme,affectueux", "intention": "reproduction",
        "photo_url_1": "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600",
        "health_verified": True, "breeder_certified": True,
    },
]

dogs = []
for d in dogs_data:
    owner_idx = d.pop("owner_idx")
    dog = Dog(owner_id=users[owner_idx].id, **d)
    db.add(dog)
    db.flush()
    dogs.append(dog)

db.flush()

# dogs index reference:
# 0=Rex (Marie), 1=Luna (Jean), 2=Milo (Sophie), 3=Nala (Pierre),
# 4=Oscar (Chloe), 5=Bella (Luc), 6=Pixel (Marie), 7=Choupette (Sophie)

# ============================================================
# WoofHealth - Sante & Bien-etre
# ============================================================

health_records_data = [
    {"dog_id": dogs[0].id, "record_type": "checkup", "date": datetime(2025, 6, 15), "description": "Bilan annuel complet. RAS.", "vet_name": "Dr. Lefevre - Clinique Vetoparis"},
    {"dog_id": dogs[0].id, "record_type": "surgery", "date": datetime(2024, 3, 10), "description": "Retrait corps etranger intestinal (morceau de balle).", "vet_name": "Dr. Lefevre - Clinique Vetoparis"},
    {"dog_id": dogs[0].id, "record_type": "allergy", "date": datetime(2025, 4, 2), "description": "Reaction cutanee aux puces. Traitement antiparasitaire renforce.", "vet_name": "Dr. Lefevre - Clinique Vetoparis"},
    {"dog_id": dogs[1].id, "record_type": "checkup", "date": datetime(2025, 9, 20), "description": "Bilan de sante. Poids ideal, dents propres.", "vet_name": "Dr. Martin - Cabinet VetLyon"},
    {"dog_id": dogs[1].id, "record_type": "illness", "date": datetime(2025, 2, 8), "description": "Gastro-enterite passagere. Diete 48h + probiotiques.", "vet_name": "Dr. Martin - Cabinet VetLyon"},
    {"dog_id": dogs[2].id, "record_type": "checkup", "date": datetime(2025, 5, 12), "description": "Bilan annuel. Leger surpoids, regime conseille.", "vet_name": "Dr. Roux - Vetoparis 15e"},
    {"dog_id": dogs[2].id, "record_type": "other", "date": datetime(2025, 7, 1), "description": "Nettoyage des plis faciaux. Soins reguliers recommandes.", "vet_name": "Dr. Roux - Vetoparis 15e"},
    {"dog_id": dogs[3].id, "record_type": "checkup", "date": datetime(2025, 8, 5), "description": "Premier bilan adulte. Croissance terminee, excellente condition.", "vet_name": "Dr. Blanc - Vet Marseille Sud"},
    {"dog_id": dogs[3].id, "record_type": "allergy", "date": datetime(2025, 10, 15), "description": "Allergie alimentaire suspectee au ble. Regime d'eviction.", "vet_name": "Dr. Blanc - Vet Marseille Sud"},
    {"dog_id": dogs[4].id, "record_type": "checkup", "date": datetime(2025, 3, 22), "description": "Bilan sportif. Articulations en excellent etat.", "vet_name": "Dr. Morel - Clinique du Parc"},
    {"dog_id": dogs[4].id, "record_type": "surgery", "date": datetime(2023, 11, 5), "description": "Sterilisation.", "vet_name": "Dr. Morel - Clinique du Parc"},
    {"dog_id": dogs[5].id, "record_type": "checkup", "date": datetime(2025, 7, 18), "description": "Bilan annuel. Yeux controles, pas d'anomalie.", "vet_name": "Dr. Garnier - VetBordeaux"},
    {"dog_id": dogs[5].id, "record_type": "illness", "date": datetime(2025, 1, 10), "description": "Otite externe bilaterale. Traitement auriculaire 10 jours.", "vet_name": "Dr. Garnier - VetBordeaux"},
    {"dog_id": dogs[6].id, "record_type": "checkup", "date": datetime(2025, 4, 30), "description": "Bilan. Tres energique, bon etat general.", "vet_name": "Dr. Lefevre - Clinique Vetoparis"},
    {"dog_id": dogs[7].id, "record_type": "checkup", "date": datetime(2025, 5, 25), "description": "Controle cardiaque annuel (souffle grade 1 stable).", "vet_name": "Dr. Roux - Vetoparis 15e"},
    {"dog_id": dogs[7].id, "record_type": "illness", "date": datetime(2025, 9, 3), "description": "Conjonctivite. Collyre antibiotique 7 jours.", "vet_name": "Dr. Roux - Vetoparis 15e"},
]
for hr in health_records_data:
    db.add(HealthRecord(**hr))

vaccinations_data = [
    {"dog_id": dogs[0].id, "name": "CHPPiL (Pentavalent)", "date": datetime(2025, 6, 15), "next_due": datetime(2026, 6, 15), "vet_name": "Dr. Lefevre", "batch_number": "VAX-2025-4412"},
    {"dog_id": dogs[0].id, "name": "Rage", "date": datetime(2025, 6, 15), "next_due": datetime(2026, 6, 15), "vet_name": "Dr. Lefevre", "batch_number": "RAB-2025-0098"},
    {"dog_id": dogs[0].id, "name": "Leptospirose", "date": datetime(2025, 6, 15), "next_due": datetime(2026, 6, 15), "vet_name": "Dr. Lefevre", "batch_number": "LEP-2025-1177"},
    {"dog_id": dogs[1].id, "name": "CHPPiL (Pentavalent)", "date": datetime(2025, 9, 20), "next_due": datetime(2026, 9, 20), "vet_name": "Dr. Martin", "batch_number": "VAX-2025-5523"},
    {"dog_id": dogs[1].id, "name": "Rage", "date": datetime(2025, 9, 20), "next_due": datetime(2026, 9, 20), "vet_name": "Dr. Martin", "batch_number": "RAB-2025-0201"},
    {"dog_id": dogs[1].id, "name": "Toux de chenil (KC)", "date": datetime(2025, 9, 20), "next_due": datetime(2026, 9, 20), "vet_name": "Dr. Martin", "batch_number": "KC-2025-0044"},
    {"dog_id": dogs[2].id, "name": "CHPPiL (Pentavalent)", "date": datetime(2025, 5, 12), "next_due": datetime(2026, 5, 12), "vet_name": "Dr. Roux", "batch_number": "VAX-2025-3301"},
    {"dog_id": dogs[2].id, "name": "Rage", "date": datetime(2025, 5, 12), "next_due": datetime(2026, 5, 12), "vet_name": "Dr. Roux", "batch_number": "RAB-2025-0155"},
    {"dog_id": dogs[3].id, "name": "CHPPiL (Pentavalent)", "date": datetime(2025, 8, 5), "next_due": datetime(2026, 8, 5), "vet_name": "Dr. Blanc", "batch_number": "VAX-2025-6678"},
    {"dog_id": dogs[3].id, "name": "Rage", "date": datetime(2025, 8, 5), "next_due": datetime(2026, 8, 5), "vet_name": "Dr. Blanc", "batch_number": "RAB-2025-0312"},
    {"dog_id": dogs[3].id, "name": "Leishmaniose", "date": datetime(2025, 8, 5), "next_due": datetime(2026, 8, 5), "vet_name": "Dr. Blanc", "batch_number": "LEI-2025-0087"},
    {"dog_id": dogs[4].id, "name": "CHPPiL (Pentavalent)", "date": datetime(2025, 3, 22), "next_due": datetime(2026, 3, 22), "vet_name": "Dr. Morel", "batch_number": "VAX-2025-2209"},
    {"dog_id": dogs[4].id, "name": "Rage", "date": datetime(2025, 3, 22), "next_due": datetime(2026, 3, 22), "vet_name": "Dr. Morel", "batch_number": "RAB-2025-0078"},
    {"dog_id": dogs[5].id, "name": "CHPPiL (Pentavalent)", "date": datetime(2025, 7, 18), "next_due": datetime(2026, 7, 18), "vet_name": "Dr. Garnier", "batch_number": "VAX-2025-7745"},
    {"dog_id": dogs[5].id, "name": "Rage", "date": datetime(2025, 7, 18), "next_due": datetime(2026, 7, 18), "vet_name": "Dr. Garnier", "batch_number": "RAB-2025-0266"},
    {"dog_id": dogs[5].id, "name": "Piroplasmose", "date": datetime(2025, 7, 18), "next_due": datetime(2026, 7, 18), "vet_name": "Dr. Garnier", "batch_number": "PIR-2025-0033"},
    {"dog_id": dogs[6].id, "name": "CHPPiL (Pentavalent)", "date": datetime(2025, 4, 30), "next_due": datetime(2026, 4, 30), "vet_name": "Dr. Lefevre", "batch_number": "VAX-2025-1190"},
    {"dog_id": dogs[6].id, "name": "Rage", "date": datetime(2025, 4, 30), "next_due": datetime(2026, 4, 30), "vet_name": "Dr. Lefevre", "batch_number": "RAB-2025-0401"},
    {"dog_id": dogs[7].id, "name": "CHPPiL (Pentavalent)", "date": datetime(2025, 5, 25), "next_due": datetime(2026, 5, 25), "vet_name": "Dr. Roux", "batch_number": "VAX-2025-4456"},
    {"dog_id": dogs[7].id, "name": "Rage", "date": datetime(2025, 5, 25), "next_due": datetime(2026, 5, 25), "vet_name": "Dr. Roux", "batch_number": "RAB-2025-0189"},
    {"dog_id": dogs[7].id, "name": "Toux de chenil (KC)", "date": datetime(2025, 5, 25), "next_due": datetime(2026, 5, 25), "vet_name": "Dr. Roux", "batch_number": "KC-2025-0102"},
]
for v in vaccinations_data:
    db.add(VetVaccination(**v))

appointments_data = [
    {"dog_id": dogs[0].id, "vet_name": "Dr. Lefevre - Clinique Vetoparis", "date": datetime(2026, 6, 15, 10, 0), "appointment_type": "checkup", "notes": "Bilan annuel + rappel vaccins", "status": "scheduled"},
    {"dog_id": dogs[0].id, "vet_name": "Dr. Lefevre - Clinique Vetoparis", "date": datetime(2026, 3, 1, 14, 30), "appointment_type": "grooming", "notes": "Detartrage dentaire", "status": "scheduled"},
    {"dog_id": dogs[1].id, "vet_name": "Dr. Martin - Cabinet VetLyon", "date": datetime(2026, 9, 20, 9, 0), "appointment_type": "vaccination", "notes": "Rappel annuel vaccins", "status": "scheduled"},
    {"dog_id": dogs[2].id, "vet_name": "Dr. Roux - Vetoparis 15e", "date": datetime(2026, 5, 12, 11, 0), "appointment_type": "checkup", "notes": "Controle poids + vaccins", "status": "scheduled"},
    {"dog_id": dogs[3].id, "vet_name": "Dr. Blanc - Vet Marseille Sud", "date": datetime(2026, 2, 20, 10, 30), "appointment_type": "checkup", "notes": "Suivi allergie alimentaire", "status": "scheduled"},
    {"dog_id": dogs[4].id, "vet_name": "Dr. Morel - Clinique du Parc", "date": datetime(2026, 3, 22, 9, 30), "appointment_type": "vaccination", "notes": "Rappel annuel", "status": "scheduled"},
    {"dog_id": dogs[5].id, "vet_name": "Dr. Garnier - VetBordeaux", "date": datetime(2026, 7, 18, 15, 0), "appointment_type": "checkup", "notes": "Bilan annuel + controle yeux", "status": "scheduled"},
    {"dog_id": dogs[6].id, "vet_name": "Dr. Lefevre - Clinique Vetoparis", "date": datetime(2026, 4, 30, 16, 0), "appointment_type": "vaccination", "notes": "Rappel vaccins", "status": "scheduled"},
    {"dog_id": dogs[7].id, "vet_name": "Dr. Roux - Vetoparis 15e", "date": datetime(2026, 5, 25, 10, 0), "appointment_type": "checkup", "notes": "Controle cardiaque semestriel", "status": "scheduled"},
    {"dog_id": dogs[7].id, "vet_name": "Dr. Roux - Vetoparis 15e", "date": datetime(2025, 11, 25, 10, 0), "appointment_type": "checkup", "notes": "Controle cardiaque semestriel", "status": "completed"},
]
for a in appointments_data:
    db.add(VetAppointment(**a))

db.flush()

# ============================================================
# WoofWalk - Promenades & Activite
# ============================================================

now = datetime.utcnow()
walks_data = [
    {"dog_id": dogs[0].id, "user_id": users[0].id, "start_time": now - timedelta(days=1, hours=8), "end_time": now - timedelta(days=1, hours=7), "distance_km": 4.2, "duration_minutes": 60, "calories": 320, "notes": "Promenade matinale au Jardin du Luxembourg"},
    {"dog_id": dogs[0].id, "user_id": users[0].id, "start_time": now - timedelta(days=2, hours=18), "end_time": now - timedelta(days=2, hours=17, minutes=30), "distance_km": 2.1, "duration_minutes": 30, "calories": 160, "notes": "Tour du soir rapide"},
    {"dog_id": dogs[0].id, "user_id": users[0].id, "start_time": now - timedelta(days=5, hours=9), "end_time": now - timedelta(days=5, hours=7), "distance_km": 8.5, "duration_minutes": 120, "calories": 640, "notes": "Grande randonnee au Bois de Vincennes"},
    {"dog_id": dogs[1].id, "user_id": users[1].id, "start_time": now - timedelta(days=1, hours=7), "end_time": now - timedelta(days=1, hours=6), "distance_km": 3.8, "duration_minutes": 55, "calories": 280, "notes": "Parc de la Tete d'Or - baignade au lac"},
    {"dog_id": dogs[1].id, "user_id": users[1].id, "start_time": now - timedelta(days=3, hours=17), "end_time": now - timedelta(days=3, hours=16, minutes=20), "distance_km": 2.5, "duration_minutes": 40, "calories": 190, "notes": "Promenade en bord de Rhone"},
    {"dog_id": dogs[1].id, "user_id": users[1].id, "start_time": now - timedelta(days=7, hours=10), "end_time": now - timedelta(days=7, hours=8), "distance_km": 7.0, "duration_minutes": 110, "calories": 520, "notes": "Rando Mont Pilat"},
    {"dog_id": dogs[2].id, "user_id": users[2].id, "start_time": now - timedelta(days=1, hours=10), "end_time": now - timedelta(days=1, hours=9, minutes=40), "distance_km": 1.2, "duration_minutes": 20, "calories": 60, "notes": "Petit tour au parc Montsouris"},
    {"dog_id": dogs[2].id, "user_id": users[2].id, "start_time": now - timedelta(days=2, hours=18), "end_time": now - timedelta(days=2, hours=17, minutes=45), "distance_km": 0.8, "duration_minutes": 15, "calories": 40, "notes": "Tour du pate de maisons"},
    {"dog_id": dogs[2].id, "user_id": users[2].id, "start_time": now - timedelta(days=4, hours=11), "end_time": now - timedelta(days=4, hours=10, minutes=30), "distance_km": 1.5, "duration_minutes": 30, "calories": 75, "notes": "Promenade au Champ de Mars"},
    {"dog_id": dogs[3].id, "user_id": users[3].id, "start_time": now - timedelta(days=1, hours=6), "end_time": now - timedelta(days=1, hours=5), "distance_km": 5.0, "duration_minutes": 65, "calories": 350, "notes": "Course matinale le long des Calanques"},
    {"dog_id": dogs[3].id, "user_id": users[3].id, "start_time": now - timedelta(days=2, hours=17), "end_time": now - timedelta(days=2, hours=16), "distance_km": 3.5, "duration_minutes": 50, "calories": 240, "notes": "Plage du Prado"},
    {"dog_id": dogs[3].id, "user_id": users[3].id, "start_time": now - timedelta(days=6, hours=8), "end_time": now - timedelta(days=6, hours=5), "distance_km": 12.0, "duration_minutes": 180, "calories": 800, "notes": "Randonnee dans les calanques"},
    {"dog_id": dogs[4].id, "user_id": users[4].id, "start_time": now - timedelta(days=1, hours=7), "end_time": now - timedelta(days=1, hours=5, minutes=30), "distance_km": 6.5, "duration_minutes": 90, "calories": 420, "notes": "Entrainement agility au Bois de Boulogne"},
    {"dog_id": dogs[4].id, "user_id": users[4].id, "start_time": now - timedelta(days=2, hours=7), "end_time": now - timedelta(days=2, hours=6), "distance_km": 5.0, "duration_minutes": 60, "calories": 350, "notes": "Course dans le parc des Buttes Chaumont"},
    {"dog_id": dogs[4].id, "user_id": users[4].id, "start_time": now - timedelta(days=3, hours=17), "end_time": now - timedelta(days=3, hours=15, minutes=30), "distance_km": 7.2, "duration_minutes": 90, "calories": 450, "notes": "Frisbee au parc de la Villette"},
    {"dog_id": dogs[5].id, "user_id": users[5].id, "start_time": now - timedelta(days=1, hours=6), "end_time": now - timedelta(days=1, hours=4), "distance_km": 10.0, "duration_minutes": 120, "calories": 580, "notes": "Course le long de la Garonne"},
    {"dog_id": dogs[5].id, "user_id": users[5].id, "start_time": now - timedelta(days=2, hours=7), "end_time": now - timedelta(days=2, hours=5, minutes=30), "distance_km": 8.5, "duration_minutes": 90, "calories": 490, "notes": "Foret de pins bordelais"},
    {"dog_id": dogs[5].id, "user_id": users[5].id, "start_time": now - timedelta(days=4, hours=16), "end_time": now - timedelta(days=4, hours=14), "distance_km": 9.0, "duration_minutes": 120, "calories": 520, "notes": "Plage du Cap Ferret avec Bella"},
    {"dog_id": dogs[6].id, "user_id": users[0].id, "start_time": now - timedelta(days=1, hours=8), "end_time": now - timedelta(days=1, hours=7), "distance_km": 3.0, "duration_minutes": 55, "calories": 180, "notes": "Promenade avec Rex et Pixel ensemble"},
    {"dog_id": dogs[6].id, "user_id": users[0].id, "start_time": now - timedelta(days=3, hours=18), "end_time": now - timedelta(days=3, hours=17, minutes=30), "distance_km": 2.0, "duration_minutes": 30, "calories": 120, "notes": "Tour du quartier - Pixel a creuse 3 trous"},
    {"dog_id": dogs[6].id, "user_id": users[0].id, "start_time": now - timedelta(days=5, hours=9), "end_time": now - timedelta(days=5, hours=7), "distance_km": 5.5, "duration_minutes": 120, "calories": 340, "notes": "Parc de Bercy, course folle"},
    {"dog_id": dogs[7].id, "user_id": users[2].id, "start_time": now - timedelta(days=1, hours=16), "end_time": now - timedelta(days=1, hours=15, minutes=40), "distance_km": 1.0, "duration_minutes": 20, "calories": 35, "notes": "Petit tour au jardin des Tuileries"},
    {"dog_id": dogs[7].id, "user_id": users[2].id, "start_time": now - timedelta(days=3, hours=10), "end_time": now - timedelta(days=3, hours=9, minutes=30), "distance_km": 1.5, "duration_minutes": 30, "calories": 50, "notes": "Parc Monceau, promenade tranquille"},
    {"dog_id": dogs[7].id, "user_id": users[2].id, "start_time": now - timedelta(days=6, hours=14), "end_time": now - timedelta(days=6, hours=13, minutes=30), "distance_km": 1.2, "duration_minutes": 30, "calories": 40, "notes": "Tour calme au Square des Batignolles"},
]
for w in walks_data:
    db.add(Walk(**w))

walk_spots_data = [
    {"name": "Jardin du Luxembourg", "latitude": 48.8462, "longitude": 2.3372, "spot_type": "park", "rating": 4.7, "description": "Grand parc parisien, aires de promenade ombragees. Chiens en laisse uniquement.", "city": "Paris", "added_by": users[0].id},
    {"name": "Bois de Vincennes", "latitude": 48.8282, "longitude": 2.4348, "spot_type": "forest", "rating": 4.9, "description": "Immense foret urbaine avec lac et chemins de randonnee. Espace de liberte pour chiens.", "city": "Paris", "added_by": users[0].id},
    {"name": "Parc de la Tete d'Or", "latitude": 45.7769, "longitude": 4.8553, "spot_type": "park", "rating": 4.8, "description": "Plus grand parc de Lyon avec lac, zoo et espaces verts magnifiques.", "city": "Lyon", "added_by": users[1].id},
    {"name": "Plage du Prado", "latitude": 43.2587, "longitude": 5.3744, "spot_type": "beach", "rating": 4.5, "description": "Plage amenagee avec zone chiens autorisee en hiver.", "city": "Marseille", "added_by": users[3].id},
    {"name": "Calanques de Sugiton", "latitude": 43.2108, "longitude": 5.4468, "spot_type": "trail", "rating": 4.9, "description": "Randonnee spectaculaire dans les calanques. Sentier exigeant mais vue incroyable.", "city": "Marseille", "added_by": users[3].id},
    {"name": "Parc Bordelais", "latitude": 44.8514, "longitude": -0.5983, "spot_type": "dog_park", "rating": 4.6, "description": "Espace canin cloture au sein du parc. Ideal pour les jeux entre chiens.", "city": "Bordeaux", "added_by": users[5].id},
    {"name": "Plage du Cap Ferret", "latitude": 44.6360, "longitude": -1.2477, "spot_type": "beach", "rating": 4.8, "description": "Plage sauvage acceptant les chiens toute l'annee. Dunes et pins.", "city": "Cap Ferret", "added_by": users[5].id},
    {"name": "Buttes Chaumont", "latitude": 48.8809, "longitude": 2.3828, "spot_type": "park", "rating": 4.6, "description": "Parc vallonne avec grottes et cascades. Vue panoramique sur Paris.", "city": "Paris", "added_by": users[4].id},
]
for ws in walk_spots_data:
    db.add(WalkSpot(**ws))

db.flush()

# ============================================================
# WoofFood - Nutrition & Alimentation
# ============================================================

meal_plans_data = [
    {"dog_id": dogs[0].id, "meal_type": "breakfast", "food_name": "Royal Canin German Shepherd Adult", "brand": "Royal Canin", "portion_grams": 200, "time": "07:30", "notes": "Melanger avec un peu d'eau tiede"},
    {"dog_id": dogs[0].id, "meal_type": "dinner", "food_name": "Royal Canin German Shepherd Adult", "brand": "Royal Canin", "portion_grams": 200, "time": "18:30"},
    {"dog_id": dogs[1].id, "meal_type": "breakfast", "food_name": "Croquettes Purina Pro Plan", "brand": "Purina", "portion_grams": 150, "time": "08:00"},
    {"dog_id": dogs[1].id, "meal_type": "dinner", "food_name": "Patee Cesar classique au boeuf", "brand": "Cesar", "portion_grams": 200, "time": "18:00", "notes": "Regime mixte croquettes + patee"},
    {"dog_id": dogs[2].id, "meal_type": "breakfast", "food_name": "Patee Royal Canin Bulldog", "brand": "Royal Canin", "portion_grams": 120, "time": "08:30"},
    {"dog_id": dogs[2].id, "meal_type": "dinner", "food_name": "Patee Royal Canin Bulldog", "brand": "Royal Canin", "portion_grams": 120, "time": "19:00", "notes": "Regime strict - controle du poids"},
    {"dog_id": dogs[3].id, "meal_type": "breakfast", "food_name": "Orijen Original", "brand": "Orijen", "portion_grams": 160, "time": "07:00"},
    {"dog_id": dogs[3].id, "meal_type": "dinner", "food_name": "Orijen Original", "brand": "Orijen", "portion_grams": 160, "time": "18:00"},
    {"dog_id": dogs[3].id, "meal_type": "snack", "food_name": "Friandises de saumon", "brand": "Edgard & Cooper", "portion_grams": 30, "time": "12:00", "notes": "Recompense apres entrainement"},
    {"dog_id": dogs[4].id, "meal_type": "breakfast", "food_name": "BARF maison - boeuf cru", "brand": "Fait maison", "portion_grams": 250, "time": "07:00", "notes": "Viande + legumes + huile de saumon"},
    {"dog_id": dogs[4].id, "meal_type": "dinner", "food_name": "BARF maison - poulet cru", "brand": "Fait maison", "portion_grams": 250, "time": "18:30", "notes": "Ajouter complement mineral"},
    {"dog_id": dogs[5].id, "meal_type": "breakfast", "food_name": "Acana Classics Prairie Poultry", "brand": "Acana", "portion_grams": 180, "time": "07:30"},
    {"dog_id": dogs[5].id, "meal_type": "dinner", "food_name": "Acana Classics Prairie Poultry", "brand": "Acana", "portion_grams": 180, "time": "19:00"},
    {"dog_id": dogs[6].id, "meal_type": "breakfast", "food_name": "Hill's Science Plan Small & Mini", "brand": "Hill's", "portion_grams": 60, "time": "08:00"},
    {"dog_id": dogs[6].id, "meal_type": "dinner", "food_name": "Hill's Science Plan Small & Mini", "brand": "Hill's", "portion_grams": 60, "time": "18:00"},
    {"dog_id": dogs[7].id, "meal_type": "breakfast", "food_name": "Patee Lily's Kitchen agneau", "brand": "Lily's Kitchen", "portion_grams": 80, "time": "08:30", "notes": "Sans poulet (allergie)"},
    {"dog_id": dogs[7].id, "meal_type": "dinner", "food_name": "Patee Lily's Kitchen saumon", "brand": "Lily's Kitchen", "portion_grams": 80, "time": "19:00", "notes": "Sans poulet (allergie)"},
]
for mp in meal_plans_data:
    db.add(MealPlan(**mp))

food_products_data = [
    {"name": "German Shepherd Adult", "brand": "Royal Canin", "product_type": "croquettes", "rating": 4.6, "protein_pct": 24, "fat_pct": 17, "fiber_pct": 1.2, "ingredients": "Riz, proteines de volaille, graisses animales, mais, gluten de ble", "price": 64.99},
    {"name": "Pro Plan Large Athletic", "brand": "Purina", "product_type": "croquettes", "rating": 4.4, "protein_pct": 26, "fat_pct": 16, "fiber_pct": 2.0, "ingredients": "Poulet, riz, mais, gluten de ble, huile de poisson", "price": 52.90},
    {"name": "Original Grain-Free", "brand": "Orijen", "product_type": "croquettes", "rating": 4.8, "protein_pct": 38, "fat_pct": 18, "fiber_pct": 4.0, "ingredients": "Poulet frais, dinde, oeufs, poisson entier, foie de poulet", "price": 89.90},
    {"name": "Classics Prairie Poultry", "brand": "Acana", "product_type": "croquettes", "rating": 4.7, "protein_pct": 29, "fat_pct": 17, "fiber_pct": 5.0, "ingredients": "Poulet eleve en liberte, avoine, dinde, oeufs", "price": 69.90},
    {"name": "Science Plan Small & Mini", "brand": "Hill's", "product_type": "croquettes", "rating": 4.3, "protein_pct": 24, "fat_pct": 15, "fiber_pct": 1.5, "ingredients": "Poulet, mais, ble, graisses animales, orge", "price": 38.50},
    {"name": "Classique au boeuf", "brand": "Cesar", "product_type": "pate", "rating": 4.0, "protein_pct": 10, "fat_pct": 6, "fiber_pct": 0.5, "ingredients": "Viandes et sous-produits animaux (boeuf 4%), cereales, mineraux", "price": 1.29},
    {"name": "Patee agneau bio", "brand": "Lily's Kitchen", "product_type": "pate", "rating": 4.7, "protein_pct": 12, "fat_pct": 5, "fiber_pct": 0.5, "ingredients": "Agneau 60%, patate douce, carottes, petits pois, herbes", "price": 3.49},
    {"name": "Friandises au saumon", "brand": "Edgard & Cooper", "product_type": "friandise", "rating": 4.5, "protein_pct": 45, "fat_pct": 12, "fiber_pct": 1.0, "ingredients": "Saumon frais 80%, patate douce, pomme, graines de lin", "price": 4.99},
    {"name": "Dental Sticks", "brand": "Pedigree Dentastix", "product_type": "friandise", "rating": 4.2, "protein_pct": 8, "fat_pct": 2, "fiber_pct": 2.5, "ingredients": "Cereales, sous-produits d'origine vegetale, mineraux, viande", "price": 6.99},
    {"name": "Complement Omega 3-6", "brand": "Virbac", "product_type": "complement", "rating": 4.6, "protein_pct": 0, "fat_pct": 95, "fiber_pct": 0, "ingredients": "Huile de poisson concentree, vitamine E, EPA, DHA", "price": 18.90},
]
for fp in food_products_data:
    db.add(FoodProduct(**fp))

db.flush()

# ============================================================
# WoofSitter - Garde & Pet-sitting
# ============================================================

sitter_profiles = []
sp_data = [
    {"user_id": users[2].id, "bio": "Passionnee de chiens depuis toujours ! J'ai un grand appartement avec terrasse a Paris 15e. Experience avec toutes les races.", "experience_years": 5, "rate_per_hour": 15, "rate_per_day": 45, "services": "walking,daycare,visits", "max_dogs": 3, "has_garden": False, "verified": True, "rating": 4.8, "total_reviews": 12},
    {"user_id": users[3].id, "bio": "Maison avec grand jardin a Marseille. Ideal pour les chiens actifs. Ancien educateur canin.", "experience_years": 8, "rate_per_hour": 18, "rate_per_day": 55, "services": "walking,boarding,daycare,visits", "max_dogs": 4, "has_garden": True, "verified": True, "rating": 4.9, "total_reviews": 23},
    {"user_id": users[5].id, "bio": "Garde de chiens a Bordeaux. Acces direct a la campagne et aux plages. Specialise grands chiens.", "experience_years": 3, "rate_per_hour": 12, "rate_per_day": 40, "services": "walking,boarding,daycare", "max_dogs": 2, "has_garden": True, "verified": False, "rating": 4.5, "total_reviews": 6},
]
for sp in sp_data:
    sitter = SitterProfile(**sp)
    db.add(sitter)
    db.flush()
    sitter_profiles.append(sitter)

bookings = []
bookings_data = [
    {"sitter_id": sitter_profiles[1].id, "owner_id": users[0].id, "dog_id": dogs[0].id, "service_type": "boarding", "start_date": datetime(2025, 12, 20), "end_date": datetime(2025, 12, 27), "status": "completed", "total_price": 385, "notes": "Vacances de Noel. Rex adore jouer dans le jardin."},
    {"sitter_id": sitter_profiles[0].id, "owner_id": users[1].id, "dog_id": dogs[1].id, "service_type": "daycare", "start_date": datetime(2026, 1, 15), "end_date": datetime(2026, 1, 15), "status": "completed", "total_price": 45, "notes": "Journee de garde pendant deplacement pro."},
]
for b in bookings_data:
    booking = SitterBooking(**b)
    db.add(booking)
    db.flush()
    bookings.append(booking)

reviews_data = [
    {"booking_id": bookings[0].id, "sitter_id": sitter_profiles[1].id, "reviewer_id": users[0].id, "rating": 5, "comment": "Pierre est fantastique ! Rex est revenu en pleine forme apres une semaine chez lui. Le jardin est top. Je recommande a 100%."},
    {"booking_id": bookings[1].id, "sitter_id": sitter_profiles[0].id, "reviewer_id": users[1].id, "rating": 5, "comment": "Sophie est tres attentionnee. Luna a ete gatee et promenee au parc. Merci beaucoup !"},
]
for r in reviews_data:
    db.add(SitterReview(**r))

db.flush()

# ============================================================
# WoofSocial - Reseau Social
# ============================================================

posts = []
posts_data = [
    {"user_id": users[0].id, "dog_id": dogs[0].id, "content": "Rex a remporte le concours d'agility du club canin de Paris ! Tellement fier de mon champion.", "photo_url": "https://images.unsplash.com/photo-1558929996-da64ba858215?w=600", "likes_count": 24, "comments_count": 5},
    {"user_id": users[1].id, "dog_id": dogs[1].id, "content": "Luna profite du soleil au Parc de la Tete d'Or. Elle adore se baigner dans le lac !", "photo_url": "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600", "likes_count": 18, "comments_count": 3},
    {"user_id": users[2].id, "dog_id": dogs[2].id, "content": "Milo, roi du canape. Sa position preferee pour la sieste dominicale.", "photo_url": "https://images.unsplash.com/photo-1583337130417-13104dec14a8?w=600", "likes_count": 31, "comments_count": 7},
    {"user_id": users[3].id, "dog_id": dogs[3].id, "content": "Premiere baignade pour Nala dans les calanques ! Elle a adore l'eau turquoise.", "photo_url": "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600", "likes_count": 42, "comments_count": 8},
    {"user_id": users[4].id, "dog_id": dogs[4].id, "content": "Entrainement agility du samedi avec Oscar. 3e temps sur le parcours, on progresse !", "photo_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600", "likes_count": 15, "comments_count": 4},
    {"user_id": users[5].id, "dog_id": dogs[5].id, "content": "Bella et moi au coucher de soleil sur la Dune du Pilat. Moment magique.", "photo_url": "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600", "likes_count": 56, "comments_count": 12},
    {"user_id": users[0].id, "dog_id": dogs[6].id, "content": "Pixel a encore creuse un trou dans le jardin... Ce Jack Russell est infatigable !", "photo_url": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600", "likes_count": 28, "comments_count": 6},
    {"user_id": users[2].id, "dog_id": dogs[7].id, "content": "Choupette dans sa robe d'hiver. La plus elegante du quartier.", "photo_url": "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600", "likes_count": 35, "comments_count": 9},
]
for p in posts_data:
    post = Post(**p)
    db.add(post)
    db.flush()
    posts.append(post)

likes_data = [
    {"post_id": posts[0].id, "user_id": users[1].id},
    {"post_id": posts[0].id, "user_id": users[2].id},
    {"post_id": posts[0].id, "user_id": users[4].id},
    {"post_id": posts[1].id, "user_id": users[0].id},
    {"post_id": posts[1].id, "user_id": users[3].id},
    {"post_id": posts[2].id, "user_id": users[0].id},
    {"post_id": posts[2].id, "user_id": users[1].id},
    {"post_id": posts[2].id, "user_id": users[4].id},
    {"post_id": posts[2].id, "user_id": users[5].id},
    {"post_id": posts[3].id, "user_id": users[0].id},
    {"post_id": posts[3].id, "user_id": users[1].id},
    {"post_id": posts[3].id, "user_id": users[2].id},
    {"post_id": posts[3].id, "user_id": users[5].id},
    {"post_id": posts[5].id, "user_id": users[0].id},
    {"post_id": posts[5].id, "user_id": users[1].id},
    {"post_id": posts[5].id, "user_id": users[2].id},
    {"post_id": posts[5].id, "user_id": users[3].id},
    {"post_id": posts[5].id, "user_id": users[4].id},
    {"post_id": posts[7].id, "user_id": users[0].id},
    {"post_id": posts[7].id, "user_id": users[1].id},
    {"post_id": posts[7].id, "user_id": users[4].id},
]
for lk in likes_data:
    db.add(PostLike(**lk))

comments_data = [
    {"post_id": posts[0].id, "user_id": users[1].id, "content": "Bravo Rex ! Quel champion !"},
    {"post_id": posts[0].id, "user_id": users[4].id, "content": "Impressionnant ! Oscar et Rex devraient faire un duo d'agility."},
    {"post_id": posts[2].id, "user_id": users[0].id, "content": "Haha Milo est trop mignon ! Rex aussi adore le canape."},
    {"post_id": posts[2].id, "user_id": users[5].id, "content": "Les bouledogues sont les meilleurs pour la sieste !"},
    {"post_id": posts[3].id, "user_id": users[1].id, "content": "Les calanques c'est magnifique ! Luna adorerait."},
    {"post_id": posts[3].id, "user_id": users[0].id, "content": "Il faut qu'on organise une sortie groupe la-bas !"},
    {"post_id": posts[5].id, "user_id": users[0].id, "content": "Photo magnifique ! La Dune du Pilat c'est magique avec un chien."},
    {"post_id": posts[5].id, "user_id": users[3].id, "content": "Bella est superbe ! Les huskys sont faits pour ces paysages."},
    {"post_id": posts[5].id, "user_id": users[4].id, "content": "Wow, on dirait une carte postale !"},
    {"post_id": posts[7].id, "user_id": users[0].id, "content": "Choupette est adorable ! On dirait une petite reine."},
    {"post_id": posts[7].id, "user_id": users[1].id, "content": "Je suis fan de cette race, ils sont tellement doux."},
]
for c in comments_data:
    db.add(PostComment(**c))

follows_data = [
    {"follower_id": users[0].id, "followed_id": users[1].id},
    {"follower_id": users[0].id, "followed_id": users[2].id},
    {"follower_id": users[0].id, "followed_id": users[4].id},
    {"follower_id": users[1].id, "followed_id": users[0].id},
    {"follower_id": users[1].id, "followed_id": users[3].id},
    {"follower_id": users[1].id, "followed_id": users[5].id},
    {"follower_id": users[2].id, "followed_id": users[0].id},
    {"follower_id": users[2].id, "followed_id": users[4].id},
    {"follower_id": users[3].id, "followed_id": users[0].id},
    {"follower_id": users[3].id, "followed_id": users[1].id},
    {"follower_id": users[3].id, "followed_id": users[5].id},
    {"follower_id": users[4].id, "followed_id": users[0].id},
    {"follower_id": users[4].id, "followed_id": users[2].id},
    {"follower_id": users[4].id, "followed_id": users[5].id},
    {"follower_id": users[5].id, "followed_id": users[0].id},
    {"follower_id": users[5].id, "followed_id": users[3].id},
    {"follower_id": users[5].id, "followed_id": users[4].id},
]
for f in follows_data:
    db.add(Follow(**f))

db.flush()

# ============================================================
# WoofShop - Marketplace & E-commerce
# ============================================================

products = []
products_data = [
    {"name": "Balle indestructible Kong Classic", "description": "Jouet en caoutchouc ultra-resistant. Rebondit de maniere imprevisible. Ideal pour les macheurs.", "price": 12.99, "category": "toys", "stock": 45, "rating": 4.7, "brand": "Kong", "is_featured": True},
    {"name": "Frisbee en caoutchouc naturel", "description": "Frisbee souple et resistant, parfait pour le jeu en plein air.", "price": 9.99, "category": "toys", "stock": 30, "rating": 4.5, "brand": "Chuckit"},
    {"name": "Corde a noeuds triple", "description": "Jouet en corde de coton naturel pour le tir a la corde. 3 noeuds, 40cm.", "price": 7.49, "category": "toys", "stock": 60, "rating": 4.3, "brand": "Trixie"},
    {"name": "Harnais anti-traction Easy Walk", "description": "Harnais ergonomique qui decourage la traction. Bandes reflechissantes.", "price": 29.90, "category": "accessories", "stock": 25, "rating": 4.6, "brand": "PetSafe", "is_featured": True},
    {"name": "Laisse retractable 5m", "description": "Laisse retractable avec systeme de frein. Pour chiens jusqu'a 30kg.", "price": 19.90, "category": "accessories", "stock": 35, "rating": 4.2, "brand": "Flexi"},
    {"name": "Collier en cuir personnalise", "description": "Collier en cuir veritable avec gravure du nom. Fabrication artisanale francaise.", "price": 34.90, "category": "accessories", "stock": 20, "rating": 4.8, "brand": "Made in France"},
    {"name": "Manteau d'hiver impermeable", "description": "Manteau chaud et impermeable. Doublure polaire, bandes reflechissantes.", "price": 39.90, "category": "clothing", "stock": 15, "rating": 4.4, "brand": "Ruffwear", "is_featured": True},
    {"name": "Pull en laine merinos", "description": "Pull doux et chaud en laine merinos. Coupe ajustee, lavable en machine.", "price": 28.50, "category": "clothing", "stock": 20, "rating": 4.3, "brand": "Cloud7"},
    {"name": "Shampoing naturel aloe vera", "description": "Shampoing bio a l'aloe vera pour poils sensibles. pH neutre, sans paraben.", "price": 14.90, "category": "grooming", "stock": 40, "rating": 4.5, "brand": "Biogance"},
    {"name": "Brosse Furminator", "description": "Brosse de deshebage professionnelle. Reduit la perte de poils de 90%.", "price": 24.90, "category": "grooming", "stock": 25, "rating": 4.7, "brand": "Furminator", "is_featured": True},
    {"name": "Coupe-griffes professionnel", "description": "Coupe-griffes avec securite anti-coupure. Manche antiderapant.", "price": 11.90, "category": "grooming", "stock": 35, "rating": 4.4, "brand": "Pecute"},
    {"name": "Panier orthopedique memoire de forme", "description": "Matelas a memoire de forme pour un soutien articulaire optimal. Housse lavable.", "price": 69.90, "category": "beds", "stock": 12, "rating": 4.8, "brand": "Brunolie"},
    {"name": "Coussin d'exterieur waterproof", "description": "Coussin resistant a l'eau pour terrasse ou jardin. Rembourrage dense.", "price": 44.90, "category": "beds", "stock": 18, "rating": 4.3, "brand": "Knuffelwuff"},
    {"name": "Gamelle anti-glouton en inox", "description": "Gamelle avec reliefs pour ralentir la prise alimentaire. Fond antiderapant.", "price": 16.90, "category": "bowls", "stock": 50, "rating": 4.5, "brand": "Outward Hound"},
    {"name": "Fontaine a eau 2L automatique", "description": "Fontaine filtree avec capteur de mouvement. Eau fraiche en permanence.", "price": 34.90, "category": "bowls", "stock": 22, "rating": 4.6, "brand": "Catit"},
]
for pd_item in products_data:
    product = Product(**pd_item)
    db.add(product)
    db.flush()
    products.append(product)

# Orders
orders = []
order1 = Order(user_id=users[0].id, total=82.79, status="delivered", shipping_address="12 Rue du Bac, 75007 Paris")
db.add(order1)
db.flush()
orders.append(order1)

order_items_1 = [
    {"order_id": order1.id, "product_id": products[0].id, "quantity": 1, "price": 12.99},
    {"order_id": order1.id, "product_id": products[3].id, "quantity": 1, "price": 29.90},
    {"order_id": order1.id, "product_id": products[6].id, "quantity": 1, "price": 39.90},
]
for oi in order_items_1:
    db.add(OrderItem(**oi))

order2 = Order(user_id=users[4].id, total=46.89, status="shipped", shipping_address="8 Avenue Foch, 75016 Paris")
db.add(order2)
db.flush()
orders.append(order2)

order_items_2 = [
    {"order_id": order2.id, "product_id": products[1].id, "quantity": 1, "price": 9.99},
    {"order_id": order2.id, "product_id": products[8].id, "quantity": 1, "price": 14.90},
    {"order_id": order2.id, "product_id": products[9].id, "quantity": 1, "price": 24.90},
]
for oi in order_items_2:
    db.add(OrderItem(**oi))

# Cart items
cart_items_data = [
    {"user_id": users[1].id, "product_id": products[11].id, "quantity": 1},
    {"user_id": users[1].id, "product_id": products[13].id, "quantity": 2},
    {"user_id": users[3].id, "product_id": products[4].id, "quantity": 1},
]
for ci in cart_items_data:
    db.add(CartItem(**ci))

db.flush()

# ============================================================
# WoofTrain - Education & Dressage
# ============================================================

programs = []
programs_data = [
    {"title": "Les bases de l'obeissance", "description": "Programme complet pour apprendre les commandes essentielles : assis, couche, pas bouger, au pied. Ideal pour les chiots et jeunes chiens.", "difficulty": "beginner", "category": "obedience", "duration_weeks": 4},
    {"title": "Marche en laisse sans tirer", "description": "Apprenez a votre chien a marcher calmement en laisse sans tirer. Techniques de renforcement positif.", "difficulty": "beginner", "category": "obedience", "duration_weeks": 3},
    {"title": "Tricks fun et impressionnants", "description": "Apprenez des tours amusants : donne la patte, roule, fais le beau, slalom entre les jambes.", "difficulty": "intermediate", "category": "tricks", "duration_weeks": 6},
    {"title": "Initiation a l'agility", "description": "Decouvrez l'agility avec votre chien. Tunnels, haies, slaloms et passerelle. Renforce le lien maitre-chien.", "difficulty": "advanced", "category": "agility", "duration_weeks": 8},
]
for pg in programs_data:
    prog = TrainingProgram(**pg)
    db.add(prog)
    db.flush()
    programs.append(prog)

steps_data = [
    # Program 1: Les bases de l'obeissance
    {"program_id": programs[0].id, "step_number": 1, "title": "Assis", "description": "Tenez une friandise au-dessus du nez du chien et deplacez-la vers l'arriere. Le chien s'assoit naturellement.", "tips": "Recompensez immediatement. Repetez 10 fois par session.", "duration_minutes": 10},
    {"program_id": programs[0].id, "step_number": 2, "title": "Couche", "description": "A partir de la position assise, guidez la friandise vers le sol entre les pattes.", "tips": "Ne forcez jamais la position. Patience et friandises !", "duration_minutes": 15},
    {"program_id": programs[0].id, "step_number": 3, "title": "Pas bouger", "description": "Demandez assis, puis reculez d'un pas. Recompensez si le chien ne bouge pas.", "tips": "Augmentez la distance progressivement. Max 30 secondes au debut.", "duration_minutes": 15},
    {"program_id": programs[0].id, "step_number": 4, "title": "Au pied", "description": "Marchez avec le chien a votre gauche, friandise a la main. Recompensez quand il reste a cote.", "tips": "Commencez dans un endroit calme sans distraction.", "duration_minutes": 20},
    {"program_id": programs[0].id, "step_number": 5, "title": "Le rappel", "description": "Appelez le chien par son nom suivi de 'viens'. Recompensez genereusement a chaque retour.", "tips": "Ne rappelez JAMAIS pour punir. Le rappel doit etre positif.", "duration_minutes": 20},
    # Program 2: Marche en laisse
    {"program_id": programs[1].id, "step_number": 1, "title": "Desensibilisation laisse", "description": "Laissez le chien porter la laisse a la maison sans la tenir. Recompensez le calme.", "tips": "Utilisez une laisse legere au debut.", "duration_minutes": 10},
    {"program_id": programs[1].id, "step_number": 2, "title": "Technique du stop", "description": "Quand le chien tire, arretez-vous. Ne repartez que quand la laisse est detendue.", "tips": "Soyez patient, les premieres promenades seront lentes.", "duration_minutes": 20},
    {"program_id": programs[1].id, "step_number": 3, "title": "Changements de direction", "description": "Changez de direction de maniere imprevisible pour que le chien apprenne a vous suivre.", "tips": "Recompensez chaque fois que le chien revient a votre hauteur.", "duration_minutes": 20},
    # Program 3: Tricks fun
    {"program_id": programs[2].id, "step_number": 1, "title": "Donne la patte", "description": "Touchez la patte du chien, recompensez. Puis attendez qu'il leve la patte tout seul.", "tips": "Commencez par la patte preferee du chien.", "duration_minutes": 10},
    {"program_id": programs[2].id, "step_number": 2, "title": "Tourne", "description": "Guidez le chien en cercle avec une friandise. Ajoutez le signal verbal.", "tips": "Dans les deux sens pour travailler l'equilibre.", "duration_minutes": 15},
    {"program_id": programs[2].id, "step_number": 3, "title": "Fais le beau", "description": "A partir de assis, guidez la friandise vers le haut. Le chien leve les pattes avant.", "tips": "Soutenez-le au debut s'il perd l'equilibre.", "duration_minutes": 15},
    {"program_id": programs[2].id, "step_number": 4, "title": "Roule", "description": "A partir de couche, guidez la friandise sur le cote pour que le chien roule sur le dos.", "tips": "Utilisez une surface douce. Certains chiens mettent du temps.", "duration_minutes": 20},
    {"program_id": programs[2].id, "step_number": 5, "title": "Slalom entre les jambes", "description": "Ecartez les jambes, guidez le chien en huit entre vos jambes avec la friandise.", "tips": "Commencez a l'arret avant de marcher.", "duration_minutes": 20},
    # Program 4: Agility
    {"program_id": programs[3].id, "step_number": 1, "title": "Le tunnel", "description": "Commencez par un tunnel court et droit. Attirez le chien avec une friandise a la sortie.", "tips": "N'utilisez jamais la force. Fete a chaque passage !", "duration_minutes": 15},
    {"program_id": programs[3].id, "step_number": 2, "title": "Les haies basses", "description": "Commencez avec des haies tres basses (10cm). Augmentez progressivement.", "tips": "Courez a cote du chien pour le motiver.", "duration_minutes": 20},
    {"program_id": programs[3].id, "step_number": 3, "title": "Le slalom", "description": "Guidez le chien entre les piquets avec une friandise. Commencez avec peu de piquets.", "tips": "Le slalom est l'obstacle le plus difficile. Soyez patient.", "duration_minutes": 25},
    {"program_id": programs[3].id, "step_number": 4, "title": "La passerelle", "description": "Habituez le chien a monter sur une planche basse. Augmentez la hauteur progressivement.", "tips": "La zone de contact est importante en competition.", "duration_minutes": 20},
    {"program_id": programs[3].id, "step_number": 5, "title": "Enchainement complet", "description": "Enchainez 3-4 obstacles de suite. Travaillez la fluidite et la vitesse.", "tips": "Filmez-vous pour analyser vos trajectoires.", "duration_minutes": 30},
]
for s in steps_data:
    db.add(TrainingStep(**s))

progress_data = [
    {"user_id": users[0].id, "dog_id": dogs[0].id, "program_id": programs[0].id, "current_step": 5, "completed": True, "completed_at": datetime(2025, 10, 1)},
    {"user_id": users[4].id, "dog_id": dogs[4].id, "program_id": programs[3].id, "current_step": 4, "completed": False},
    {"user_id": users[1].id, "dog_id": dogs[1].id, "program_id": programs[1].id, "current_step": 2, "completed": False},
    {"user_id": users[3].id, "dog_id": dogs[3].id, "program_id": programs[0].id, "current_step": 3, "completed": False},
]
for pr in progress_data:
    db.add(UserTrainingProgress(**pr))

db.flush()

# ============================================================
# WoofAdopt - Adoption & Refuge
# ============================================================

shelters = []
shelters_data = [
    {"name": "SPA de Gennevilliers", "city": "Gennevilliers", "address": "30 Avenue du General de Gaulle, 92230 Gennevilliers", "latitude": 48.9326, "longitude": 2.3044, "phone": "01 47 98 57 40", "email": "contact@spa-gennevilliers.fr", "website": "https://www.la-spa.fr", "description": "Plus grand refuge de la SPA en Ile-de-France. Des centaines de chiens attendent une famille."},
    {"name": "Refuge AVA - Agir pour la Vie Animale", "city": "Cuy-Saint-Fiacre", "address": "Lieu-dit Le Bois Guyard, 76220 Cuy-Saint-Fiacre", "latitude": 49.4833, "longitude": 1.7000, "phone": "02 35 90 86 07", "email": "contact@ava-refuge.fr", "website": "https://www.ava-association.com", "description": "Refuge associatif en Normandie. Specialise dans les sauvetages et la rehabilitation."},
    {"name": "Refuge de Marseille", "city": "Marseille", "address": "Chemin de la Madrague, 13015 Marseille", "latitude": 43.3600, "longitude": 5.3500, "phone": "04 91 60 70 80", "email": "refuge.marseille@spa.fr", "description": "Refuge SPA du sud avec de nombreux chiens en attente d'adoption. Visite sur rendez-vous."},
]
for sh in shelters_data:
    shelter = Shelter(**sh)
    db.add(shelter)
    db.flush()
    shelters.append(shelter)

listings = []
listings_data = [
    {"shelter_id": shelters[0].id, "name": "Filou", "breed": "Croise Berger", "age_years": 4, "sex": "male", "weight_kg": 22, "description": "Filou est un chien joyeux et affectueux, abandonne suite a un demenagement. Tres sociable.", "temperament": "joueur,sociable,affectueux", "good_with_kids": True, "good_with_cats": False, "good_with_dogs": True, "is_neutered": True, "status": "available"},
    {"shelter_id": shelters[0].id, "name": "Maya", "breed": "Croise Labrador", "age_years": 2, "sex": "female", "weight_kg": 18, "description": "Maya est une jeune chienne pleine d'energie. Trouvee errante, elle cherche sa famille pour la vie.", "temperament": "energique,douce,curieuse", "good_with_kids": True, "good_with_cats": True, "good_with_dogs": True, "is_neutered": True, "status": "available"},
    {"shelter_id": shelters[1].id, "name": "Papy", "breed": "Epagneul Breton", "age_years": 10, "sex": "male", "weight_kg": 15, "description": "Papy est un vieux monsieur tres doux. Abandonne par son maitre age en maison de retraite. Calme et calin.", "temperament": "calme,doux,fidele", "good_with_kids": True, "good_with_cats": True, "good_with_dogs": True, "is_neutered": True, "status": "available"},
    {"shelter_id": shelters[1].id, "name": "Tornade", "breed": "Croise Malinois", "age_years": 1, "age_months": 6, "sex": "female", "weight_kg": 24, "description": "Tornade porte bien son nom ! Jeune chienne tres dynamique qui a besoin d'un maitre sportif.", "temperament": "energique,vif,intelligent", "good_with_kids": False, "good_with_cats": False, "good_with_dogs": True, "is_neutered": False, "status": "available"},
    {"shelter_id": shelters[2].id, "name": "Caramel", "breed": "Croise Griffon", "age_years": 5, "sex": "male", "weight_kg": 10, "description": "Caramel est un petit chien au grand coeur. Parfait pour un appartement avec promenades quotidiennes.", "temperament": "affectueux,calme,joueur", "good_with_kids": True, "good_with_cats": True, "good_with_dogs": True, "is_neutered": True, "status": "available"},
    {"shelter_id": shelters[2].id, "name": "Tempete", "breed": "Croise Husky", "age_years": 3, "sex": "female", "weight_kg": 20, "description": "Tempete est une belle croisee husky, fugueuse et vocale mais adorable. Jardin cloture obligatoire.", "temperament": "independant,vocal,joueur", "good_with_kids": True, "good_with_cats": False, "good_with_dogs": True, "is_neutered": True, "status": "pending"},
]
for ls in listings_data:
    listing = AdoptionListing(**ls)
    db.add(listing)
    db.flush()
    listings.append(listing)

adoption_requests_data = [
    {"listing_id": listings[1].id, "user_id": users[1].id, "message": "Bonjour, je vis a Lyon avec un grand jardin. J'ai deja une Golden Retriever, Luna, tres sociable. Maya serait la bienvenue !", "status": "pending"},
    {"listing_id": listings[5].id, "user_id": users[5].id, "message": "J'ai deja un Husky, Bella. Tempete serait une compagne ideale. Grande maison avec jardin cloture a Bordeaux.", "status": "approved"},
]
for ar in adoption_requests_data:
    db.add(AdoptionRequest(**ar))

db.flush()

# ============================================================
# WoofTravel - Voyages & Deplacements
# ============================================================

pet_friendly_places_data = [
    {"name": "Hotel Le Bristol Paris", "place_type": "hotel", "city": "Paris", "address": "112 Rue du Faubourg Saint-Honore, 75008", "latitude": 48.8718, "longitude": 2.3160, "rating": 4.9, "description": "Palace parisien accueillant les chiens de toute taille. Service dog-sitting disponible.", "amenities": "water_bowl,dog_menu,dog_sitting", "website": "https://www.oetkercollection.com/fr/hotels/le-bristol-paris/"},
    {"name": "Restaurant Le Bouillon Chartier", "place_type": "restaurant", "city": "Paris", "address": "7 Rue du Faubourg Montmartre, 75009", "latitude": 48.8741, "longitude": 2.3445, "rating": 4.3, "description": "Restaurant historique parisien acceptant les chiens en terrasse et en salle.", "amenities": "water_bowl,terrace"},
    {"name": "Cafe de Flore", "place_type": "cafe", "city": "Paris", "address": "172 Boulevard Saint-Germain, 75006", "latitude": 48.8540, "longitude": 2.3326, "rating": 4.5, "description": "Cafe legendaire de Saint-Germain-des-Pres. Chiens bienvenus en terrasse.", "amenities": "water_bowl,terrace", "added_by": users[0].id},
    {"name": "Plage de Deauville (zone chiens)", "place_type": "beach", "city": "Deauville", "address": "Boulevard de la Mer, 14800 Deauville", "latitude": 49.3594, "longitude": 0.0656, "rating": 4.7, "description": "Zone de plage autorisee aux chiens en basse saison (octobre a mars).", "amenities": "water_bowl,off_leash", "added_by": users[2].id},
    {"name": "Camping Les Flots Bleus", "place_type": "camping", "city": "Lacanau", "address": "Route du Baganais, 33680 Lacanau", "latitude": 44.9784, "longitude": -1.1996, "rating": 4.4, "description": "Camping 3 etoiles en bordure de foret. Chiens acceptes (max 2). Acces plage a 500m.", "amenities": "garden,off_leash,water_bowl", "added_by": users[5].id},
    {"name": "TGV SNCF", "place_type": "transport", "city": "France", "latitude": 48.8448, "longitude": 2.3735, "rating": 3.8, "description": "Les chiens de moins de 6kg voyagent dans un sac. Les autres paient 50% du billet 2nde classe.", "amenities": "leash_required"},
    {"name": "Eurostar (avec passeport animal)", "place_type": "transport", "city": "Paris", "latitude": 48.8809, "longitude": 2.3553, "rating": 3.5, "description": "Chiens acceptes avec passeport europeen, vaccination rage et traitement contre les tiques.", "amenities": "leash_required"},
    {"name": "Hotel Negresco Nice", "place_type": "hotel", "city": "Nice", "address": "37 Promenade des Anglais, 06000 Nice", "latitude": 43.6953, "longitude": 7.2582, "rating": 4.7, "description": "Palace niçois iconique. Chiens de toute taille bienvenus. Coussin et gamelle fournis.", "amenities": "water_bowl,dog_menu,garden", "added_by": users[3].id},
    {"name": "La Cantine du Troquet", "place_type": "restaurant", "city": "Paris", "address": "101 Rue de l'Ouest, 75014", "latitude": 48.8335, "longitude": 2.3200, "rating": 4.4, "description": "Bistrot convivial du 14e, terrasse ombragee dog-friendly.", "amenities": "water_bowl,terrace", "added_by": users[2].id},
    {"name": "BlaBlaCar (covoiturage)", "place_type": "transport", "city": "France", "latitude": 48.8566, "longitude": 2.3522, "rating": 4.0, "description": "Certains conducteurs acceptent les animaux. Filtrer 'animaux acceptes' lors de la recherche.", "amenities": "leash_required"},
    {"name": "Lac d'Annecy - Plage d'Albigny", "place_type": "beach", "city": "Annecy", "address": "Plage d'Albigny, 74000 Annecy", "latitude": 45.9010, "longitude": 6.1411, "rating": 4.6, "description": "Plage autorisee aux chiens avec eau cristalline. Cadre montagnard magnifique.", "amenities": "water_bowl,off_leash", "added_by": users[1].id},
    {"name": "Gite du Berger - Vercors", "place_type": "hotel", "city": "Villard-de-Lans", "address": "Chemin du Berger, 38250 Villard-de-Lans", "latitude": 45.0720, "longitude": 5.5520, "rating": 4.8, "description": "Gite de montagne dog-friendly avec randonnees au depart. Chiens en liberte dans le jardin.", "amenities": "garden,off_leash,water_bowl", "added_by": users[1].id},
]
for pfp in pet_friendly_places_data:
    db.add(PetFriendlyPlace(**pfp))

travel_checklists_data = [
    {"user_id": users[0].id, "dog_id": dogs[0].id, "destination": "Nice (vacances d'ete)", "departure_date": datetime(2026, 7, 15), "items_json": '[{"item":"Carnet de sante","checked":true},{"item":"Passeport europeen","checked":true},{"item":"Croquettes (7 jours)","checked":false},{"item":"Gamelle pliable","checked":true},{"item":"Laisse + harnais","checked":true},{"item":"Sacs a crottes","checked":false},{"item":"Medicaments anti-tiques","checked":true},{"item":"Jouet prefere","checked":false}]', "notes": "Verifier reservation hotel accepte les grands chiens"},
    {"user_id": users[5].id, "dog_id": dogs[5].id, "destination": "Cap Ferret (week-end)", "departure_date": datetime(2026, 5, 1), "items_json": '[{"item":"Laisse","checked":true},{"item":"Croquettes (3 jours)","checked":true},{"item":"Serviette de plage","checked":false},{"item":"Eau fraiche","checked":false},{"item":"Anti-puces","checked":true}]', "notes": "Attention Bella est fugueuse, ne pas la detacher pres de la route"},
]
for tc in travel_checklists_data:
    db.add(TravelChecklist(**tc))

db.flush()

# ============================================================
# WoofInsure - Assurance & Finance
# ============================================================

insurance_plans = []
insurance_plans_data = [
    {"name": "Formule Essentielle", "provider": "SantéVet", "monthly_price": 19.90, "annual_price": 215.00, "coverage_pct": 60, "deductible": 75, "max_annual": 1500, "covers_accident": True, "covers_illness": True, "covers_prevention": False, "description": "Couverture de base pour accidents et maladies. Ideal pour les jeunes chiens en bonne sante."},
    {"name": "Formule Confort", "provider": "SantéVet", "monthly_price": 34.90, "annual_price": 379.00, "coverage_pct": 80, "deductible": 50, "max_annual": 2500, "covers_accident": True, "covers_illness": True, "covers_prevention": True, "description": "Notre formule la plus populaire. Accidents, maladies et prevention (vaccins, detartrage, vermifuges)."},
    {"name": "Formule Premium", "provider": "Agria", "monthly_price": 49.90, "annual_price": 539.00, "coverage_pct": 90, "deductible": 0, "max_annual": 5000, "covers_accident": True, "covers_illness": True, "covers_prevention": True, "description": "Couverture maximale sans franchise. Inclut medecines alternatives, comportementaliste et funeraire."},
]
for ip in insurance_plans_data:
    plan = InsurancePlan(**ip)
    db.add(plan)
    db.flush()
    insurance_plans.append(plan)

claims_data = [
    {"user_id": users[0].id, "dog_id": dogs[0].id, "plan_id": insurance_plans[1].id, "claim_type": "illness", "amount": 285.00, "description": "Retrait corps etranger intestinal (morceau de balle). Chirurgie + hospitalisation 24h.", "status": "approved", "date": datetime(2024, 3, 12)},
    {"user_id": users[2].id, "dog_id": dogs[7].id, "plan_id": insurance_plans[0].id, "claim_type": "illness", "amount": 95.00, "description": "Consultation ophtalmologique + traitement conjonctivite.", "status": "processing", "date": datetime(2025, 9, 5)},
]
for cl in claims_data:
    db.add(InsuranceClaim(**cl))

db.flush()

# ============================================================
# WoofID - Identification & Securite
# ============================================================

tags = []
for i, dog in enumerate(dogs):
    tag = PetTag(dog_id=dog.id, tag_code=f"WOOF-{2024+i:04d}-{dog.id:06d}", tag_type="qr", is_active=True, scans_count=i * 3)
    db.add(tag)
    db.flush()
    tags.append(tag)

# Lost pet alert for Bella (the husky who is a known escape artist)
alert = LostPetAlert(
    dog_id=dogs[5].id, user_id=users[5].id,
    latitude=44.8400, longitude=-0.5750,
    last_seen_address="Parc Bordelais, Bordeaux",
    description="Bella s'est echappee pendant la promenade au Parc Bordelais. Husky femelle gris et blanc, yeux bleus. Porte un collier rouge avec medaille. Tres amicale mais difficile a attraper. Repond a son nom.",
    photo_url="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600",
    status="found", contact_phone="06 12 34 56 78",
)
db.add(alert)
db.flush()

sightings_data = [
    {"alert_id": alert.id, "user_id": users[3].id, "latitude": 44.8420, "longitude": -0.5810, "description": "J'ai vu un husky correspondant a la description rue Judaique, il courait vers le nord."},
    {"alert_id": alert.id, "user_id": users[0].id, "latitude": 44.8450, "longitude": -0.5770, "description": "Husky femelle apercue Place Gambetta, elle jouait avec un autre chien. Contacte le proprietaire."},
]
for sg in sightings_data:
    db.add(LostPetSighting(**sg))

db.flush()

# ============================================================
# WoofBreed - Elevage & Reproduction
# ============================================================

breeder_profiles = []
bp_data = [
    {"user_id": users[0].id, "kennel_name": "Du Domaine des Braves", "breeds": "Berger Allemand,Jack Russell", "city": "Paris", "description": "Elevage familial de Bergers Allemands et Jack Russell depuis 12 ans. Chiots LOF, testes ADN, socialises en famille.", "experience_years": 12, "website": "https://www.domaine-des-braves.fr", "phone": "06 11 22 33 44", "verified": True, "rating": 4.8},
    {"user_id": users[4].id, "kennel_name": "De la Vallee des Ombres", "breeds": "Border Collie", "city": "Paris", "description": "Elevage passion de Border Collies de lignee travail et sport. Champions d'agility sur plusieurs generations.", "experience_years": 8, "phone": "06 55 66 77 88", "verified": True, "rating": 4.9},
]
for bp in bp_data:
    breeder = BreederProfile(**bp)
    db.add(breeder)
    db.flush()
    breeder_profiles.append(breeder)

litters = []
litters_data = [
    {"breeder_id": breeder_profiles[0].id, "sire_name": "Ch. Arko du Val d'Aisne", "sire_breed": "Berger Allemand", "dam_name": "Bella du Clos des Tilleuls", "dam_breed": "Berger Allemand", "breed": "Berger Allemand", "birth_date": datetime(2025, 11, 15), "puppy_count": 7, "available_count": 3, "price": 1800, "description": "Portee de 7 chiots dont 3 encore disponibles. Parents testes hanches A, coudes 0, ADN DM clear. Chiots LOF.", "status": "available"},
    {"breeder_id": breeder_profiles[0].id, "sire_name": "Flash du Domaine des Braves", "sire_breed": "Jack Russell", "dam_name": "Pepite des Landes", "dam_breed": "Jack Russell", "breed": "Jack Russell", "birth_date": datetime(2026, 3, 1), "puppy_count": 5, "available_count": 5, "price": 1200, "description": "Portee prevue debut mars 2026. Parents testes, lignee chasse et compagnie. Reservations ouvertes.", "status": "upcoming"},
    {"breeder_id": breeder_profiles[1].id, "sire_name": "Fly de la Vallee", "sire_breed": "Border Collie", "dam_name": "Fleur des Montagnes", "dam_breed": "Border Collie", "breed": "Border Collie", "birth_date": datetime(2025, 9, 20), "puppy_count": 6, "available_count": 0, "price": 1500, "description": "Portee de 6 chiots, tous reserves. Parents champions d'agility, ADN complets (CEA clear, TNS clear).", "status": "reserved"},
]
for lt in litters_data:
    litter = Litter(**lt)
    db.add(litter)
    db.flush()
    litters.append(litter)

# Pedigree entries for dogs with has_pedigree=True
pedigree_data = [
    # Rex (dogs[0]) - Berger Allemand
    {"dog_id": dogs[0].id, "generation": 1, "position": "sire", "ancestor_name": "Ch. Arko du Val d'Aisne", "ancestor_breed": "Berger Allemand", "titles": "Champion de France, SchH3"},
    {"dog_id": dogs[0].id, "generation": 1, "position": "dam", "ancestor_name": "Bella du Clos des Tilleuls", "ancestor_breed": "Berger Allemand", "titles": "SchH1"},
    {"dog_id": dogs[0].id, "generation": 2, "position": "sire_sire", "ancestor_name": "Enzo vom Buchhorn", "ancestor_breed": "Berger Allemand", "titles": "VA, SchH3, IPO3"},
    {"dog_id": dogs[0].id, "generation": 2, "position": "sire_dam", "ancestor_name": "Gina du Val d'Aisne", "ancestor_breed": "Berger Allemand"},
    # Luna (dogs[1]) - Golden Retriever
    {"dog_id": dogs[1].id, "generation": 1, "position": "sire", "ancestor_name": "Duke of Golden Valley", "ancestor_breed": "Golden Retriever", "titles": "Ch."},
    {"dog_id": dogs[1].id, "generation": 1, "position": "dam", "ancestor_name": "Sunshine des Terres Dorees", "ancestor_breed": "Golden Retriever"},
    {"dog_id": dogs[1].id, "generation": 2, "position": "sire_sire", "ancestor_name": "Dorado Golden Dream", "ancestor_breed": "Golden Retriever", "titles": "Multi Ch., BIS"},
    {"dog_id": dogs[1].id, "generation": 2, "position": "sire_dam", "ancestor_name": "Misty Morning Light", "ancestor_breed": "Golden Retriever"},
    # Oscar (dogs[4]) - Border Collie
    {"dog_id": dogs[4].id, "generation": 1, "position": "sire", "ancestor_name": "Fly de la Vallee", "ancestor_breed": "Border Collie", "titles": "Champion Agility"},
    {"dog_id": dogs[4].id, "generation": 1, "position": "dam", "ancestor_name": "Fleur des Montagnes", "ancestor_breed": "Border Collie", "titles": "Obedience 3"},
    {"dog_id": dogs[4].id, "generation": 2, "position": "sire_sire", "ancestor_name": "Glen of the Valley", "ancestor_breed": "Border Collie", "titles": "Int. Ch. Agility"},
    {"dog_id": dogs[4].id, "generation": 2, "position": "dam_sire", "ancestor_name": "Storm des Alpages", "ancestor_breed": "Border Collie"},
    # Bella (dogs[5]) - Husky
    {"dog_id": dogs[5].id, "generation": 1, "position": "sire", "ancestor_name": "Storm du Grand Nord", "ancestor_breed": "Husky Siberien", "titles": "Champion Mushing"},
    {"dog_id": dogs[5].id, "generation": 1, "position": "dam", "ancestor_name": "Neige des Flocons", "ancestor_breed": "Husky Siberien"},
    # Choupette (dogs[7]) - Cavalier King Charles
    {"dog_id": dogs[7].id, "generation": 1, "position": "sire", "ancestor_name": "Prince des Jardins Royaux", "ancestor_breed": "Cavalier King Charles", "titles": "Ch. de Beaute"},
    {"dog_id": dogs[7].id, "generation": 1, "position": "dam", "ancestor_name": "Duchesse de Versailles", "ancestor_breed": "Cavalier King Charles", "titles": "BOB"},
    {"dog_id": dogs[7].id, "generation": 2, "position": "sire_sire", "ancestor_name": "Lord Byron of Windsor", "ancestor_breed": "Cavalier King Charles", "titles": "Multi BIS, Ch. Int."},
    {"dog_id": dogs[7].id, "generation": 2, "position": "dam_dam", "ancestor_name": "Comtesse des Lys", "ancestor_breed": "Cavalier King Charles"},
]
for pe in pedigree_data:
    db.add(PedigreeEntry(**pe))

# ============================================================
# Final commit
# ============================================================

db.commit()
db.close()

print("Database seeded with enriched demo data!")
print(f"  - {len(users_data)} users (password: demo1234)")
print(f"  - {len(dogs_data)} dogs with full profiles")
print(f"  - {len(health_records_data)} health records")
print(f"  - {len(vaccinations_data)} vaccinations")
print(f"  - {len(appointments_data)} vet appointments")
print(f"  - {len(walks_data)} walks + {len(walk_spots_data)} walk spots")
print(f"  - {len(meal_plans_data)} meal plans + {len(food_products_data)} food products")
print(f"  - {len(sp_data)} sitter profiles, {len(bookings_data)} bookings, {len(reviews_data)} reviews")
print(f"  - {len(posts_data)} posts, {len(likes_data)} likes, {len(comments_data)} comments, {len(follows_data)} follows")
print(f"  - {len(products_data)} products, {len(orders)} orders")
print(f"  - {len(programs_data)} training programs, {len(steps_data)} steps, {len(progress_data)} progress entries")
print(f"  - {len(shelters_data)} shelters, {len(listings_data)} adoption listings")
print(f"  - {len(pet_friendly_places_data)} pet-friendly places")
print(f"  - {len(insurance_plans_data)} insurance plans, {len(claims_data)} claims")
print(f"  - {len(dogs)} pet tags, 1 lost pet alert, {len(sightings_data)} sightings")
print(f"  - {len(bp_data)} breeder profiles, {len(litters_data)} litters, {len(pedigree_data)} pedigree entries")
print(f"  - Plans: marie=Os en Or, jean/chloe=Patee, others=Croquette")
print(f"  - Login: marie@example.com / demo1234")
