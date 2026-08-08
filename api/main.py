"""
main.py
-------
PitWall FastAPI application entry point.
Mounts all API routers, adds CORS middleware for the React frontend,
and logs ChromaDB chunk counts on startup.

Run with:
    uvicorn api.main:app --reload --port 8000
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import ask, brief, debrief, pitstops, races, race_stats, results, schedule, standings, status, weather

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PitWall API",
    description=(
        "Multi-agent F1 race strategy assistant. "
        "Query specialist agents for tyre, weather, radio, rivals and circuit insights."
    ),
    version="1.0.0",
)

# ── CORS ────────────────────────────────────────────────────────────────────
# Allow all origins so the React (or any other) frontend can call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(status.router, tags=["Health"])
app.include_router(ask.router, tags=["Strategy"])
app.include_router(brief.router, tags=["Strategy"])
app.include_router(debrief.router, tags=["Strategy"])
app.include_router(races.router, tags=["Strategy"])
app.include_router(race_stats.router, tags=["Strategy"])
app.include_router(results.router, tags=["Strategy"])
app.include_router(pitstops.router, tags=["Strategy"])
app.include_router(weather.router, tags=["Strategy"])
app.include_router(schedule.router, tags=["Schedule"])
app.include_router(standings.router, tags=["Standings"])


# ── Startup event ───────────────────────────────────────────────────────────
@app.on_event("startup")
async def log_collection_counts() -> None:
    """Log the number of chunks in each ChromaDB collection on startup."""
    from utils.vectorstore import (
        get_laps_collection,
        get_weather_collection,
        get_radio_collection,
        get_pitstops_collection,
    )

    counts = {
        "laps": get_laps_collection().count(),
        "weather": get_weather_collection().count(),
        "radio": get_radio_collection().count(),
        "pitstops": get_pitstops_collection().count(),
    }

    logger.info("=== PitWall ChromaDB Collections ===")
    for name, count in counts.items():
        logger.info("  %-10s : %d chunks", name, count)
    logger.info("====================================")


# ── Root ─────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"], summary="API liveness check")
def root() -> dict:
    """Simple liveness probe."""
    return {"status": "PitWall API is live"}
