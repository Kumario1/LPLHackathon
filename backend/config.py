import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Transition OS"
    API_V1_STR: str = "/api"

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./transition_os.db")
    ENVIRONMENT: str = "DEV"  # DEV, TEST, STAGE, PROD
    LOG_LEVEL: str = "INFO"
    ENABLE_SKILL_STUBS: bool = True
    CORS_ALLOW_ORIGINS: str = os.getenv(
        "CORS_ALLOW_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
