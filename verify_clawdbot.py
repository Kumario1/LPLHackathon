import requests
import time
import json
import sys

BASE_URL = "http://54.221.139.68:8000/api"

def print_header(title):
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

def print_step(step, detail):
    print(f"\n>> {step}: {detail}")

def check_health():
    print_header("Checking Backend Health")
    try:
        # Health check is at root, not /api/health usually, or /health
        # README says http://54.221.139.68:8000/health/live
        # So we must strip /api for health check
        health_url = BASE_URL.replace("/api", "") + "/health/live"
        response = requests.get(health_url)
        print(f"Health Status: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code != 200:
            print("Backend is not healthy. Exiting.")
            sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("Could not connect to backend. Is it running?")
        sys.exit(1)

def scenario_onboarding():
    print_header("Scenario 1: Advisor Onboarding")
    
    # User Intent: "Onboard Jane Doe from Schwab"
    print_step("User Intent", "I want to onboard Jane Doe from Schwab")
    print_step("Clawdbot", "Identified 'transition-onboard-advisor' skill.")
    
    payload = {
        "workflow_type": "RECRUITED_ADVISOR",
        "advisor_id": 1,
        "metadata": {
            "advisor_name": "Jane Doe",
            "source_firm": "Schwab"
        }
    }
    
    print_step("Clawdbot -> Backend", f"POST /workflows with {json.dumps(payload)}")
    response = requests.post(f"{BASE_URL}/workflows", json=payload)
    
    print_step("Backend -> Clawdbot", f"Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code in [200, 201]:
        data = response.json().get("data", {})
        wf_id = data.get("workflow_id")
        # If response structure is different, try to extract ID
        if not wf_id and "workflow_id" in response.json():
             wf_id = response.json().get("workflow_id")
        return wf_id
    elif response.status_code == 404:
        print(">> POST /workflows not found. Trying GET /transitions list as fallback.")
        response = requests.get(f"{BASE_URL}/transitions")
        if response.status_code == 200 and isinstance(response.json(), list) and response.json():
             return response.json()[0].get("id")
    return None

def scenario_status(workflow_id):
    if not workflow_id: return
    print_header("Scenario 2: Workflow Status")
    
    # User Intent: "How is the onboarding going?"
    print_step("User", "How is the onboarding going?")
    print_step("Clawdbot", "Identified 'transition-workflow-status' skill.")
    
    # Live API uses GET /transitions/{id}
    print_step("Clawdbot -> Backend", f"GET /transitions/{workflow_id}")
    response = requests.get(f"{BASE_URL}/transitions/{workflow_id}")
    
    print_step("Backend -> Clawdbot", f"Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")

def scenario_eta(workflow_id):
    if not workflow_id: return
    print_header("Scenario 3: ETA Prediction")
    
    # User Intent: "When will it be done?"
    print_step("User", "When will it be done?")
    print_step("Clawdbot", "Identified 'transition-workflow-status' skill (ETA).")
    
    print_step("Clawdbot -> Backend", f"GET /predictions/eta/{workflow_id}")
    # Confirmed GET via browser docs
    response = requests.get(f"{BASE_URL}/predictions/eta/{workflow_id}")
    
    print_step("Backend -> Clawdbot", f"Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")

def scenario_doc_validation():
    print_header("Scenario 4: Document Validation")
    
    # User Intent: "Check this document"
    print_step("User", "Check this ACAT form.")
    print_step("Clawdbot", "Identified 'transition-doc-validation' skill.")
    
    payload = {
        "document_id": "doc_sim_999",
        "document_type": "ACAT",
        "account_type": "IRA"
    }
    
    print_step("Clawdbot -> Backend", f"POST /skills/nigo/analyze with {json.dumps(payload)}")
    response = requests.post(f"{BASE_URL}/skills/nigo/analyze", json=payload)
    
    print_step("Backend -> Clawdbot", f"Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")

def scenario_entity_resolution():
    print_header("Scenario 5: Entity Resolution")
    
    # User Intent: "Run matching for Schwab export"
    print_step("User", "Run matching for Schwab export.")
    print_step("Clawdbot", "Identified 'transition-entity-resolution' skill.")
    
    payload = {
        "source_system": "SCHWAB_EXPORT",
        "target_system": "LPL_PROD",
        "match_type": "CLIENT",
        "batch_id": "batch_sim_001"
    }
    
    # Entity Match not listed in ARCHITECTURE.md for live API, skipping or trying analogous
    print("Skipping Entity Match (not in Live API docs)")
    return
    
    print_step("Backend -> Clawdbot", f"Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")

def scenario_communications(workflow_id):
    if not workflow_id: return
    print_header("Scenario 6: Communications Draft")
    
    # User Intent: "Draft a status email"
    print_step("User", "Draft a status email.")
    print_step("Clawdbot", "Identified 'transition-communications' skill.")
    
    payload = {
        "template_type": "STATUS_UPDATE",
        "workflow_id": workflow_id,
        "tone": "professional"
    }
    
    print_step("Clawdbot -> Backend", f"POST /skills/copilot/draft with {json.dumps(payload)}")
    # Adjust payload keys for live API
    live_payload = {"context": "Status update", "message_type": "email"}
    response = requests.post(f"{BASE_URL}/skills/copilot/draft", json=live_payload)
    
    print_step("Backend -> Clawdbot", f"Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")

def scenario_webhook():
    print_header("Scenario: Webhook Simulation (Alternative Ingestion)")
    
    # User Intent: "Simulate a transfer rejection"
    print_step("System", "Simulating ACAT Rejection Webhook")
    
    payload = {
        "event_type": "ACAT_REJECTED",
        "account_id": 2,
        "reason": "Name mismatch"
    }
    
    print_step("External -> Backend", f"POST /webhooks/transfer with {json.dumps(payload)}")
    response = requests.post(f"{BASE_URL}/webhooks/transfer", json=payload)
    
    print_step("Backend -> External", f"Status: {response.status_code}")
    print(f"Body: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    check_health()
    scenario_webhook()
    wf_id = scenario_onboarding()
    time.sleep(1)
    scenario_status(wf_id)
    time.sleep(1)
    scenario_eta(wf_id)
    time.sleep(1)
    scenario_doc_validation()
    time.sleep(1)
    scenario_entity_resolution()
    time.sleep(1)
    scenario_communications(wf_id)
    
    print_header("Verification Complete")
