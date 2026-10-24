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

    # Supabase API Settings
    SUPABASE_URL: Optional[str] = "https://nxyzpcrieucfvckrsayc.supabase.co"
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_PUBLISHABLE_KEY: Optional[str] = "sb_publishable_8mYuYdC0SDTnsolk8Bj1ZQ_-fhqSVNU"
    SUPABASE_SECRET_KEY: Optional[str] = None
    SUPABASE_JWKS_URL: Optional[str] = "https://nxyzpcrieucfvckrsayc.supabase.co/auth/v1/.well-known/jwks.json"

    # Application Secrets
    SECRET_KEY: str = "ayursutra-secret-key-32b-secure-jwt-token-key-2024"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    GOOGLE_CLIENT_ID: Optional[str] = None
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:8081,http://127.0.0.1:8081,http://10.121.0.144:3000,http://10.121.0.144:8081,http://10.121.0.144:8000,http://192.168.1.34:3000,http://192.168.1.34:8081,http://192.168.1.34:8000,http://192.168.1.37:3000,http://192.168.1.37:8081,http://192.168.1.37:8000,http://10.243.0.162:8081,http://10.243.0.162:3000,http://192.168.1.50:8081,http://192.168.1.50:3000,http://192.168.56.77:8081,http://192.168.56.77:3000,http://localhost,https://localhost,capacitor://localhost"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @model_validator(mode="after")
    def assemble_db_url(self):
        # Fix Render/Heroku postgres:// schema for SQLAlchemy 1.4+
        if self.DATABASE_URL and self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql://", 1)

        # If DATABASE_URL is missing or contains a placeholder, construct it from individual variables
        if (
            not self.DATABASE_URL
            or "YOUR_SUPABASE_PASSWORD" in self.DATABASE_URL
            or "[YOUR-PASSWORD]" in self.DATABASE_URL
            or "[YOUR_PASSWORD]" in self.DATABASE_URL
            or "YOUR_PASSWORD" in self.DATABASE_URL
        ):
            if self.DB_PASSWORD:
                encoded_password = quote_plus(self.DB_PASSWORD)
                self.DATABASE_URL = (
                    f"postgresql://{self.DB_USER}:{encoded_password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
                )
            else:
                self.DATABASE_URL = (
                    f"postgresql://{self.DB_USER}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
                )
        return self

    @property
    def get_cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

settings = Settings()

