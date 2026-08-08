"""
weather.py
----------
GET /weather-summary route — averaged weather conditions for a race session,
computed directly via SQL against pitwall.db: no LLM involved.
"""

import pathlib
import sqlite3

from fastapi import APIRouter

from api.models import WeatherSummaryResponse
from api.race_utils import parse_race_label

router = APIRouter()

ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent.parent
DB_PATH = ROOT_DIR / "data" / "pitwall.db"


@router.get("/weather-summary", response_model=WeatherSummaryResponse, summary="Averaged race-session weather")
def get_weather_summary(race: str = "Monaco 2025") -> WeatherSummaryResponse:
    """Return averaged air/track temp, humidity, wind, and rain probability for a race."""
    race_name, year = parse_race_label(race)
    response = WeatherSummaryResponse(race=race_name or race, year=year or 0)

    if not race_name or not year:
        return response

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT AVG(AirTemp), AVG(TrackTemp), AVG(Humidity), AVG(WindSpeed), AVG(WindDirection),
               100.0 * SUM(Rainfall) / COUNT(*)
        FROM weather WHERE Race = ? AND Year = ?
        """,
        (race_name, year),
    )
    row = cursor.fetchone()
    conn.close()

    if row and row[0] is not None:
        air, track, humidity, wind_speed, wind_dir, rain_pct = row
        response.has_data = True
        response.avg_air_temp = round(air, 1)
        response.avg_track_temp = round(track, 1)
        response.avg_humidity = round(humidity, 1)
        response.avg_wind_speed = round(wind_speed, 1)
        response.avg_wind_direction = round(wind_dir, 0)
        response.rain_probability_pct = round(rain_pct, 1)

    return response
