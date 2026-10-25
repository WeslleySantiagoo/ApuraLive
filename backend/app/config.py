from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    TSE_ENV: str = "live"
    TSE_BASE_URL: str = "https://resultados.tse.jus.br/oficial/ele2026"
    TSE_ELECTION_CODE: str = "ele2026"
    CACHE_TTL_NATIONAL: int = 3
    CACHE_TTL_STATE: int = 5
    CACHE_TTL_MUNICIPALITY: int = 10
    CACHE_TTL_METADATA: int = 3600
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
