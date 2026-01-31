def test_health_routes(client):
    assert client.get("/health/live").status_code == 200
    assert client.get("/health/ready").status_code == 200

def test_onboard_advisor_flow(client):
    # Test the new root-level endpoint
    response = client.post("/workflows", json={
        "workflow_type": "RECRUITED_ADVISOR",
        "advisor_id": "ADV_NEW_001",
        "metadata": {"name": "Test Advisor"}
    })
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "OK"
    assert "workflow_id" in data["data"]
    
    workflow_id = data["data"]["workflow_id"]
    
    # Test getting dashboard for it
    dashboard_res = client.get(f"/workflows/{workflow_id}")
    assert dashboard_res.status_code == 200
    assert dashboard_res.json()["workflow_id"] == workflow_id

def test_validate_document(client):
    # Test the new root-level endpoint with dict payload
    response = client.post("/documents/validate", json={
        "document_id": "doc_123",
        "document_type": "ACAT"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert data["data"]["document_id"] == "doc_123"
