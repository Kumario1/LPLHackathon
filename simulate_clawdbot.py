import requests
import time
import json
import sys

BASE_URL = "http://localhost:8000"

def print_header(title):
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

def print_step(step, detail):
    print(f"\n>> {step}: {detail}")

def check_health():
    print_header("Checking Backend Health")
    try:
        response = requests.get(f"{BASE_URL}/health/live")
        print(f"Health Status: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code != 200:
            print("Backend is not healthy. Exiting.")
            sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("Could not connect to backend. Is it running?")
        sys.exit(1)

def simulate_onboarding():
    print_header("Scenario 1: Advisor Onboarding")
    
    # 1. User Intent
    print_step("User Intent", "I want to onboard Jane Doe from Schwab")
    
    # 2. Clawdbot Logic (Simulated)
    # Mapping intent to transition-onboard-advisor skill
    print_step("Clawdbot", "Identified 'transition-onboard-advisor' skill.")
    print_step("Clawdbot", "Extracting parameters: name='Jane Doe', firm='Schwab'. Using default type.")
    
    payload = {
        "workflow_type": "RECRUITED_ADVISOR",
        "advisor_id": "ADV_SIM_001",
        "metadata": {
            "advisor_name": "Jane Doe",
            "source_firm": "Schwab"
        }
    }
    
    # 3. Backend Call
    print_step("Clawdbot -> Backend", f"POST /workflows with {json.dumps(payload)}")
    response = requests.post(f"{BASE_URL}/workflows", json=payload)
    
    # 4. Response Handling
    print_step("Backend -> Clawdbot", f"Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201 or response.status_code == 200:
        data = response.json().get("data", {})
        wf_id = data.get("workflow_id")
        print_step("Clawdbot", f"Replying to user: 'Started onboarding for Jane Doe. Workflow ID is {wf_id}.'")
        return wf_id
    else:
        print_step("Clawdbot", "Error starting onboarding.")
        return None

def simulate_status_check(workflow_id):
    if not workflow_id:
        print("Skipping status check (no workflow ID)")
        return

    print_header("Scenario 2: Workflow Status")
    
    # 1. User Intent
    print_step("User Intent", f"How is the onboarding for {workflow_id} going?")
    
    # 2. Clawdbot Logic
    print_step("Clawdbot", "Identified 'transition-workflow-status' skill.")
    
    # 3. Backend Call
    print_step("Clawdbot -> Backend", f"GET /workflows/{workflow_id}")
    response = requests.get(f"{BASE_URL}/workflows/{workflow_id}")
    
    # 4. Response Handling
    print_step("Backend -> Clawdbot", f"Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")

def simulate_eta(workflow_id):
    if not workflow_id:
        return

    print_header("Scenario 3: ETA Prediction")
    
    print_step("User Intent", "When will it be done?")
    print_step("Clawdbot", "Identified 'transition-workflow-status' skill (ETA section).")
    
    print_step("Clawdbot -> Backend", f"GET /predictions/eta/{workflow_id}")
    response = requests.get(f"{BASE_URL}/predictions/eta/{workflow_id}")
    
    print_step("Backend -> Clawdbot", f"Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")

def simulate_doc_validation():
    print_header("Scenario 4: Document Validation")
    
    print_step("User Intent", "User uploads 'acat_form.pdf' and asks 'Is this valid?'")
    print_step("Clawdbot", "Identified 'transition-doc-validation' skill.")
    
    payload = {
        "document_id": "doc_sim_999",
        "document_type": "ACAT",
        "account_type": "IRA"
    }
    
    print_step("Clawdbot -> Backend", f"POST /documents/validate with {json.dumps(payload)}")
    response = requests.post(f"{BASE_URL}/documents/validate", json=payload)
    
    print_step("Backend -> Clawdbot", f"Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")


if __name__ == "__main__":
    check_health()
    wf_id = simulate_onboarding()
    time.sleep(1)
    simulate_status_check(wf_id)
    time.sleep(1)
    simulate_eta(wf_id)
    time.sleep(1)
    simulate_doc_validation()
    print_header("Simulation Complete")
