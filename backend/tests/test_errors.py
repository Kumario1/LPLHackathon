def test_create_workflow_validation_error(client):
    # Missing required 'advisor_id'
    response = client.post("/workflows", json={"workflow_type": "TEST"})
    assert response.status_code == 422

def test_route_not_found(client):
    response = client.get("/api/does-not-exist")
    assert response.status_code == 404

def test_method_not_allowed(client):
    # GET on a POST-only route
    response = client.get("/workflows")
    assert response.status_code == 405

from unittest.mock import patch

def test_internal_server_error_handling(client):
    with patch("backend.orchestrator.orchestrator.get_dashboard", side_effect=ValueError("Mocked error")):
        response = client.get("/workflows/123")
        assert response.status_code == 500
        data = response.json()
        assert data["status"] == "ERROR"
        assert "Mocked error" in data["detail"]
