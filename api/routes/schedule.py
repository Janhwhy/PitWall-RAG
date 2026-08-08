"""
schedule.py
-----------
GET /schedule and GET /schedule/next — serve the full season calendar
(past AND future rounds, with session datetimes) straight from the
data/schedule_full_{year}.json files produced by
ingest/fetch_full_schedule.py.

Unlike /races (which only lists races with deep lap-level data already
ingested), this reflects the whole official calendar, so the frontend can
show a "next race" countdown and a full season list even for rounds that
haven't happened yet.
"""

import json
import pathlib
from datetime import datetime, timezone

from fastapi import APIRouter

from api.models import NextRaceResponse, ScheduleEvent, ScheduleResponse

router = APIRouter()

ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent.parent
DATA_DIR = ROOT_DIR / "data"


def _load_schedule(year: int) -> list[dict]:
    path = DATA_DIR / f"schedule_full_{year}.json"
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def _available_years() -> list[int]:
    years = []
    for path in DATA_DIR.glob("schedule_full_*.json"):
        try:
            years.append(int(path.stem.replace("schedule_full_", "")))
        except ValueError:
            continue
    return sorted(years)


@router.get("/schedule", response_model=ScheduleResponse, summary="Full season calendar (past + future)")
def get_schedule(year: int) -> ScheduleResponse:
    """Return every round of a season, including ones that haven't happened yet."""
    events = [ScheduleEvent(**e) for e in _load_schedule(year)]
    return ScheduleResponse(year=year, events=events)


@router.get("/schedule/next", response_model=NextRaceResponse, summary="The next upcoming race weekend")
def get_next_race() -> NextRaceResponse:
    """
    Scan every ingested season's schedule and return the soonest race weekend
    whose Race session is still in the future, along with a countdown.
    """
    now = datetime.now(timezone.utc)
    best: tuple[datetime, int, dict] | None = None

    for year in _available_years():
        for event in _load_schedule(year):
            race_session = next((s for s in event["sessions"] if s["name"] == "Race"), None)
            if not race_session or not race_session["date"]:
                continue
            race_dt = datetime.fromisoformat(race_session["date"])
            if race_dt <= now:
                continue
            if best is None or race_dt < best[0]:
                best = (race_dt, year, event)

    if best is None:
        return NextRaceResponse(found=False)

    race_dt, year, event = best
    return NextRaceResponse(
        found=True,
        event=ScheduleEvent(**event),
        year=year,
        race_session_date=race_dt.isoformat(),
        seconds_until=(race_dt - now).total_seconds(),
    )
