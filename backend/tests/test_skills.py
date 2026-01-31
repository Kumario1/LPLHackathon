def test_eta_prediction(client):
    # Test the root-level endpoint
    response = client.get("/predictions/eta/WF_TEST_123")
    assert response.status_code == 200
    data = response.json()
    assert data["confidence"] == "HIGH"
    assert "days_remaining" in data
    assert data["days_remaining"] == 14

def test_entity_match(client):
    response = client.post("/entity/match", json={"source": "test"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert "summary" in data["data"]

def test_draft_communication(client):
    response = client.post("/communications/draft", json={"workflow_id": "WF_123"})
    assert response.status_code == 200
    data = response.json()
    assert "draft_id" in data["data"]

def test_meeting_pack(client):
    response = client.get("/households/1/meeting-pack")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "READY"
