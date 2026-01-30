import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Transition OS"
    API_V1_STR: str = "/api"
    
    # Default to SQLite for local ease, but ready for Postgres
    # format: postgresql://user:password@postgresserver/db
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./transition_os.db")
    
    class Config:
        env_file = ".env"

settings = Settings()
