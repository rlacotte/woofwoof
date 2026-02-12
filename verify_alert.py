import requests
import json

BASE_URL = "http://localhost:8001/api"

# Login as demo user
def login():
    try:
        response = requests.post(f"{BASE_URL}/auth/login", data={
            "username": "marie@example.com",
            "password": "demo1234"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        print(f"Login failed: {response.text}")
        return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def verify_alerts(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create Danger Zone
    print("\n--- Testing Create Danger Zone ---")
    danger_data = {
        "latitude": 48.8566,
        "longitude": 2.3522,
        "alert_type": "ticks",
        "description": "Attention aux tiques dans les hautes herbes",
        "city": "Paris"
    }
    resp = requests.post(f"{BASE_URL}/alerts/danger", json=danger_data, headers=headers)
    if resp.status_code == 200:
        print("✅ Danger Zone Created:", resp.json()["id"])
    else:
        print(f"❌ Failed to create danger zone: {resp.text}")

    # 2. Get Danger Zones
    print("\n--- Testing Get Danger Zones ---")
    resp = requests.get(f"{BASE_URL}/alerts/danger", headers=headers)
    if resp.status_code == 200:
        zones = resp.json()
        print(f"✅ Retrieved {len(zones)} danger zones")
        if len(zones) > 0:
            print("Sample:", zones[0])
    else:
        print(f"❌ Failed to get danger zones: {resp.text}")

    # 3. Get Lost Pets (Integration Check)
    print("\n--- Testing Get Lost Pets ---")
    resp = requests.get(f"{BASE_URL}/id/lost", headers=headers)
    if resp.status_code == 200:
        alerts = resp.json()
        print(f"✅ Retrieved {len(alerts)} lost pet alerts")
    else:
        print(f"❌ Failed to get lost pet alerts: {resp.text}")

if __name__ == "__main__":
    token = login()
    if token:
        verify_alerts(token)
    else:
        print("Skipping tests due to login failure")
