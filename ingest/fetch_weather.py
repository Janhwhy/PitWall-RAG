"""
fetch_weather.py
----------------
Extracts weather data from the FastF1 session for the 2025 Monaco Grand Prix
and saves it to data/history/monaco_2025_weather.csv.

Usage:
    python ingest/fetch_weather.py
"""

import pathlib

import fastf1
import pandas as pd

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT_DIR   = pathlib.Path(__file__).resolve().parent.parent
CACHE_DIR  = ROOT_DIR / "cache"
OUTPUT_DIR = ROOT_DIR / "data" / "history"
OUTPUT_CSV = OUTPUT_DIR / "monaco_2025_weather.csv"

# ── FastF1 cache ───────────────────────────────────────────────────────────
CACHE_DIR.mkdir(parents=True, exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))

# ── Weather columns to extract ─────────────────────────────────────────────
WEATHER_COLUMNS = [
    "AirTemp",
    "Humidity",
    "Pressure",
    "Rainfall",
    "TrackTemp",
    "WindDirection",
    "WindSpeed",
]


def fetch_weather() -> pd.DataFrame:
    """Load the 2025 Monaco GP session and return its weather dataframe."""
    print("Loading 2025 Monaco Grand Prix - Race session (weather) ...")
    session = fastf1.get_session(2025, "Monaco Grand Prix", "R")

    # Weather is bundled with the session; no need for telemetry
    session.load(laps=False, telemetry=False, weather=True)

    weather: pd.DataFrame = session.weather_data

    # Keep only columns that actually exist
    available = [col for col in WEATHER_COLUMNS if col in weather.columns]
    missing   = [col for col in WEATHER_COLUMNS if col not in weather.columns]
    if missing:
        print(f"  [WARN] Columns not found and skipped: {missing}")

    df = weather[available].copy()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_CSV, index=False)

    print(f"\n[OK] Weather data saved to: {OUTPUT_CSV.relative_to(ROOT_DIR)}")
    print(f"     Rows      : {len(df)}")
    print(f"     Columns   : {list(df.columns)}")
    print(f"\n-- First 5 rows -----------------------------------------------")
    print(df.head().to_string(index=False))

    return df


if __name__ == "__main__":
    fetch_weather()
