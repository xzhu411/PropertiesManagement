from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import portfolio, screening, analytics
from config import settings

app = FastAPI(title="Plaza Intelligence — Residential AM", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio.router, prefix="/api")
app.include_router(screening.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "model": settings.model, "service": "Plaza Intelligence — Residential AM"}
