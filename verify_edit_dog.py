import requests
import sys

BASE_URL = "http://localhost:8001"
EMAIL = "verify_edit@example.com"
PASSWORD = "password123"

def register_and_login():
    # Try to login first
    login_data = {"username": EMAIL, "password": PASSWORD}
    response = requests.post(f"{BASE_URL}/api/auth/login", data=login_data)
    
    if response.status_code == 200:
        try:
            return response.json()["access_token"]
        except Exception:
            print(f"Login 200 but bad JSON: {response.text}")
            raise
        
    # Register if login fails
    register_data = {
        "email": EMAIL,
        "password": PASSWORD,
        "full_name": "Verify Edit",
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
        "name": "TestDog",
        "breed": "Tester",
        "age_years": 2,
        "sex": "male",
        "weight_kg": 10.5
    }
    
    print("\n2. Creating dog...")
    res = requests.post(f"{BASE_URL}/api/dogs", json=dog_data, headers=headers)
    if res.status_code != 200:
        print(f"Failed to create dog: {res.text}")
        sys.exit(1)
        
    dog = res.json()
    dog_id = dog["id"]
    print(f"   Dog created: ID {dog_id}, Name: {dog['name']}, Weight: {dog['weight_kg']}")
    
    # 2. Update the dog
    update_data = {
        "weight_kg": 12.0,
        "bio": "Updated bio"
    }
    print(f"\n3. Updating dog {dog_id} with new weight 12.0...")
    res = requests.put(f"{BASE_URL}/api/dogs/{dog_id}", json=update_data, headers=headers)
    if res.status_code != 200:
        print(f"Failed to update dog: {res.text}")
        sys.exit(1)
        
    updated_dog = res.json()
    print(f"   Update response: Weight: {updated_dog['weight_kg']}, Bio: {updated_dog['bio']}")
    
    if updated_dog["weight_kg"] != 12.0:
        print("❌ Weight mismatch in response")
        sys.exit(1)

    # 3. Verify persistence
    print(f"\n4. Fetching dog details to verify persistence...")
    res = requests.get(f"{BASE_URL}/api/dogs/{dog_id}", headers=headers)
    fetched_dog = res.json()
    
    if fetched_dog["weight_kg"] != 12.0 or fetched_dog["bio"] != "Updated bio":
        print(f"❌ Verification failed. Got: {fetched_dog}")
        sys.exit(1)
        
    print("✅ Persistence verified")

    # 4. Clean up
    print(f"\n5. Deleting dog...")
    res = requests.delete(f"{BASE_URL}/api/dogs/{dog_id}", headers=headers)
    if res.status_code != 200:
        print(f"Failed to delete dog: {res.text}")
        # Not exiting here, just warning
        
    print("\n🎉 Verification passed!")

if __name__ == "__main__":
    main()
