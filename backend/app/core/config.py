import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "EduPass Auth & Role System"
    API_V1_STR: str = ""
    SECRET_KEY: str = os.getenv("SECRET_KEY", "EDUPASS_SUPER_SECRET_JWT_KEY_2026_CHANGE_IN_PRODUCTION")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 Hours
    
    # Database: Supports PostgreSQL (postgresql://user:pass@host/db) or SQLite fallback
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./edupass.db")

    # AI Model Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # CORS (Supports Localhost, Tailscale & Local WiFi LAN)
    BACKEND_CORS_ORIGINS: List[str] = [
        "*",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://172.16.42.95:3000",
        "http://172.16.42.95:8000",
    ]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")


settings = Settings()
