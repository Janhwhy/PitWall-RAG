"""
standings.py
------------
GET /standings/drivers and GET /standings/constructors — serve the Drivers'
and Constructors' Championship tables straight from the
data/standings_{year}.json files produced by ingest/fetch_standings.py.
"""

import json
import pathlib

from fastapi import APIRouter, HTTPException

from api.models import StandingsResponse

router = APIRouter()

ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "data"


def _load_standings(year: int) -> dict:
    path = DATA_DIR / f"standings_{year}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"No standings data ingested for {year}.")
    return json.loads(path.read_text(encoding="utf-8"))


@router.get("/standings/drivers", response_model=StandingsResponse, summary="Drivers' Championship standings")
def get_driver_standings(year: int) -> StandingsResponse:
    data = _load_standings(year)
    return StandingsResponse(year=data["year"], round=data["round"], drivers=data["drivers"])


@router.get(
    "/standings/constructors", response_model=StandingsResponse, summary="Constructors' Championship standings"
)
def get_constructor_standings(year: int) -> StandingsResponse:
    data = _load_standings(year)
    return StandingsResponse(year=data["year"], round=data["round"], constructors=data["constructors"])
