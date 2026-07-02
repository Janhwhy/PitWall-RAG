"""
status.py
---------
GET /status route — reports the number of chunks in each ChromaDB collection.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from api.models import StatusResponse
from utils.vectorstore import (
    get_laps_collection,
    get_weather_collection,
    get_radio_collection,
    get_pitstops_collection,
)

router = APIRouter()


class F1DashStatusResponse(BaseModel):
    status: str


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


@router.get("/f1dash/status", response_model=F1DashStatusResponse, summary="f1-dash mock connection status check")
def get_f1dash_status() -> F1DashStatusResponse:
    """
    Return whether f1-dash is online or offline.
    Checks if a local service is listening on port 3001.
    """
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(0.5)
    try:
        s.connect(("127.0.0.1", 3001))
        s.close()
        return F1DashStatusResponse(status="online")
    except Exception:
        return F1DashStatusResponse(status="offline")
