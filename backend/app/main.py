from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="ApuraLive API",
    description="API independente para acompanhamento em tempo real das eleições presidenciais com dados oficiais do TSE.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "ApuraLive API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mode": "live",
    }


@app.get("/api/v1/metadata", tags=["Metadata"])
async def get_metadata():
    return {
        "project": "ApuraLive",
        "slogan": "A apuração, em tempo real.",
        "nature": "Projeto independente sem associação oficial com o TSE",
        "source": "Tribunal Superior Eleitoral (TSE)",
        "mode": "live",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

