"""
status.py
---------
GET /status route — reports the number of chunks in each ChromaDB collection.
"""

from fastapi import APIRouter

from api.models import StatusResponse
from utils.vectorstore import (
    get_laps_collection,
    get_weather_collection,
    get_radio_collection,
    get_pitstops_collection,
)

router = APIRouter()


@router.get("/status", response_model=StatusResponse, summary="Vector-store health check")
def get_status() -> StatusResponse:
    """
    Query every ChromaDB collection and return the current chunk counts.

    Returns
    -------
    StatusResponse
        A mapping of collection name → number of stored chunks.
    """
    collections = {
        "laps": get_laps_collection().count(),
        "weather": get_weather_collection().count(),
        "radio": get_radio_collection().count(),
        "pitstops": get_pitstops_collection().count(),
    }
    return StatusResponse(collections=collections)
