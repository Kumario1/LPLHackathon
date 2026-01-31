import os
import pytest
from fastapi.testclient import TestClient

# Set env vars BEFORE importing app/config to ensure they are picked up
os.environ["DATABASE_URL"] = "sqlite:///./test_db.sqlite"
os.environ["ENABLE_SKILL_STUBS"] = "True"

from backend.main import app as fastapi_app

@pytest.fixture(scope="session")
def app():
    return fastapi_app

@pytest.fixture(scope="function")
def client(app):
    return TestClient(app)
