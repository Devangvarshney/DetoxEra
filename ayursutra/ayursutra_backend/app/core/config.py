from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import List, Optional
from urllib.parse import quote_plus

class Settings(BaseSettings):
    # Individual DB parameters
    DB_USER: Optional[str] = "postgres"
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = "db.nxyzpcrieucfvckrsayc.supabase.co"
    DB_PORT: Optional[int] = 5432
    DB_NAME: Optional[str] = "postgres"

    # Database connection URL (can be set directly or generated from parameters above)
    DATABASE_URL: Optional[str] = None

    # Application Secrets
    SECRET_KEY: str = "ayursutra-secret-key-32b-secure-jwt-token-key-2024"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @model_validator(mode="after")
    def assemble_db_url(self):
        # If DATABASE_URL is missing or contains the placeholder, construct it from individual variables
        if not self.DATABASE_URL or "YOUR_SUPABASE_PASSWORD" in self.DATABASE_URL or "[YOUR-PASSWORD]" in self.DATABASE_URL:
            if self.DB_PASSWORD:
                encoded_password = quote_plus(self.DB_PASSWORD)
                self.DATABASE_URL = (
                    f"postgresql://{self.DB_USER}:{encoded_password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
                )
        return self

    @property
    def get_cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

settings = Settings()

