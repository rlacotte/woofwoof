"""Seed the database with enriched demo data."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime
from app.database import SessionLocal, engine, Base
from app.models import User, Dog, Subscription
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

for d in dogs_data:
    owner_idx = d.pop("owner_idx")
    dog = Dog(owner_id=users[owner_idx].id, **d)
    db.add(dog)

db.commit()
db.close()

print("Database seeded with enriched demo data!")
print(f"  - {len(users_data)} users (password: demo1234)")
print(f"  - {len(dogs_data)} dogs with full profiles")
print(f"  - Plans: marie=Os en Or, jean/chloe=Patee, others=Croquette")
print(f"  - Login: marie@example.com / demo1234")
