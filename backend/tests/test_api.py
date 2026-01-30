def test_health_live(client):
    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "UP", "version": "1.0.0"}

def test_health_ready(client):
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "READY"}

def test_eta_stub(client):
    # Should return stub data
    response = client.get("/api/predictions/eta/1")
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 0.85

def test_workflow_create_stub_not_implemented(client):
    # Should return 501 because the Stub raises NotImplementedError
    response = client.post("/api/workflows", json={"workflow_type": "TEST", "advisor_id": 1})
    assert response.status_code == 501
    data = response.json()
    assert data["status"] == "NOT_IMPLEMENTED"
