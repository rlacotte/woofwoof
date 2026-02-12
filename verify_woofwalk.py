import requests
import sys
import json
from datetime import datetime

BASE_URL = "http://localhost:8001"
EMAIL = "verify_walk@example.com"
PASSWORD = "password123"

def register_and_login():
    login_data = {"username": EMAIL, "password": PASSWORD}
    response = requests.post(f"{BASE_URL}/api/auth/login", data=login_data)
    
    if response.status_code == 200:
        return response.json()["access_token"]
        
    register_data = {
        "email": EMAIL,
        "password": PASSWORD,
        "full_name": "Verify Walk",
        "plan_type": "croquette"
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    if response.status_code == 200:
        return response.json()["access_token"]
        
    print(f"Auth failed: {response.text}")
    sys.exit(1)

def main():
    token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    
    print("1. Authenticated successfully")

    # 1. Create a dog
    dog_data = {
        "name": "WalkerDog",
        "breed": "Walker",
        "age_years": 3,
        "sex": "female",
        "weight_kg": 20.0
    }
    
    print("\n2. Creating dog...")
    res = requests.post(f"{BASE_URL}/api/dogs", json=dog_data, headers=headers)
    if res.status_code != 200:
        print(f"Failed to create dog: {res.text}")
        sys.exit(1)
        
    dog = res.json()
    dog_id = dog["id"]
    print(f"   Dog created: ID {dog_id}")
    
    # 2. Create a walk with route_json
    print("\n3. Creating walk with path and events...")
    
    path_data = [
        [45.757, 4.832],
        [45.758, 4.833],
        [45.759, 4.834]
    ]
    events_data = [
        {"type": "pee", "lat": 45.758, "lng": 4.833, "time": datetime.now().isoformat()}
    ]
    
    walk_payload = {
        "dog_id": dog_id,
        "start_time": datetime.now().isoformat(),
        "end_time": datetime.now().isoformat(),
        "distance_km": 1.5,
        "duration_minutes": 30,
        "calories": 150,
        "route_json": json.dumps({"path": path_data, "events": events_data}),
        "notes": "Great walk!"
    }
    
    res = requests.post(f"{BASE_URL}/api/walks", json=walk_payload, headers=headers)
    if res.status_code != 200:
        print(f"Failed to create walk: {res.text}")
        sys.exit(1)
        
    walk = res.json()
    walk_id = walk["id"]
    print(f"   Walk created: ID {walk_id}")

    # 3. Verify detail endpoint
    print(f"\n4. Fetching walk detail from /api/walks/{walk_id}/detail...")
    res = requests.get(f"{BASE_URL}/api/walks/{walk_id}/detail", headers=headers)
    if res.status_code != 200:
        print(f"Failed to fetch walk detail: {res.text}")
        sys.exit(1)
        
    detail = res.json()
    print(f"   Walk detail fetched.")
    
    # Check content
    fetched_route = json.loads(detail["route_json"])
    if len(fetched_route["path"]) != 3:
        print(f"❌ Path length mismatch. Expected 3, got {len(fetched_route['path'])}")
        sys.exit(1)
        
    if len(fetched_route["events"]) != 1:
        print(f"❌ Events length mismatch. Expected 1, got {len(fetched_route['events'])}")
        sys.exit(1)
        
    print("✅ Route data verified correctly")

    # 4. Clean up (optional, but good practice)
    # We don't have a delete walk endpoint exposed in router (only delete dog)
    # Deleting the dog cascades to walks usually? Let's check model.
    # User.dogs = relationship(..., cascade="all, delete-orphan")
    # Walk.dog = relationship("Dog") - Wait, Walk has dog_id foreign key. 
    # If we delete dog, we need to make sure walks are deleted or handled.
    # The model definition:
    # class Dog(Base): ...
    # class Walk(Base): dog_id = ForeignKey("dogs.id")
    # There is no cascade defined on Dog.walks (it's not even defined on Dog).
    # So deleting dog might fail if walks exist, unless DB has ON DELETE CASCADE.
    # Let's try deleting the dog.
    
    print(f"\n5. Cleaning up...")
    requests.delete(f"{BASE_URL}/api/dogs/{dog_id}", headers=headers)
        
    print("\n🎉 WoofWalk Verification passed!")

if __name__ == "__main__":
    main()
