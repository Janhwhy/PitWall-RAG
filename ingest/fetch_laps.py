"""
fetch_laps.py
-------------
Fetches lap, pitstop, weather, and driver data for a specified F1 race session using the FastF1 library.
Saves four files:
    data/laps/{country_lowercase}_{year}.csv            - Lap data
    data/laps/{country_lowercase}_{year}_pitstops.csv   - Pitstop data
    data/history/{country_lowercase}_{year}_weather.csv - Weather data
    data/laps/{country_lowercase}_{year}_drivers.csv    - Driver code -> full name -> team

Usage:
    python ingest/fetch_laps.py 2025 Monaco
"""

import sys
import argparse
import pathlib

import fastf1
import pandas as pd

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT_DIR   = pathlib.Path(__file__).resolve().parent.parent
CACHE_DIR  = ROOT_DIR / "cache"
LAPS_DIR   = ROOT_DIR / "data" / "laps"
HISTORY_DIR = ROOT_DIR / "data" / "history"

# ── FastF1 cache ───────────────────────────────────────────────────────────
CACHE_DIR.mkdir(parents=True, exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))

# ── Columns to extract ─────────────────────────────────────────────────────
COLUMNS = [
    "Driver",
    "Team",
    "LapNumber",
    "LapTime",
    "Compound",
    "TyreLife",
    "Position",
    "PitInTime",
    "PitOutTime",
]

PITSTOP_COLUMNS = [
    "Driver",
    "Team",
    "LapNumber",
    "PitInTime",
    "PitOutTime",
    "Compound",
    "TyreLife",
]

WEATHER_COLUMNS = [
    "AirTemp",
    "Humidity",
    "Pressure",
    "Rainfall",
    "TrackTemp",
    "WindDirection",
    "WindSpeed",
]

# session.results columns -> our drivers.csv columns. Only Driver codes are
# stored anywhere else in the pipeline (laps/pitstops), so full names have
# to come from here or the app has no grounded way to answer "who is X" /
# "who won" without the LLM guessing a name from its own pretrained bias.
DRIVER_COLUMNS = {
    "Abbreviation": "Driver",
    "FullName": "FullName",
    "TeamName": "Team",
    "Position": "FinishPosition",
}


def fetch_data(year: int, country: str) -> None:
    """
    Fetch lap, pitstop, and weather data for a given year and country.
    Saves outputs to the configured CSV paths.
    If no session data is available, prints a warning and exits cleanly.
    """
    country_lowercase = country.lower()

    # Define outputs
    laps_csv = LAPS_DIR / f"{country_lowercase}_{year}.csv"
    pitstops_csv = LAPS_DIR / f"{country_lowercase}_{year}_pitstops.csv"
    weather_csv = HISTORY_DIR / f"{country_lowercase}_{year}_weather.csv"
    drivers_csv = LAPS_DIR / f"{country_lowercase}_{year}_drivers.csv"

    print(f"Loading {year} {country} - Race session ...")
    
    try:
        # get_session automatically does fuzzy matching
        session = fastf1.get_session(year, country, "R")
        session.load(laps=True, telemetry=True, weather=True)
        
        # Access laps to check if they actually loaded; this raises DataNotLoadedError if empty/missing
        laps: pd.DataFrame = session.laps
        if laps.empty:
            raise ValueError("Session laps dataframe is empty")
    except Exception:
        print(f"⚠️ Skipping {country} {year} — no data available yet")
        sys.exit(0)

    # Make sure output directories exist
    LAPS_DIR.mkdir(parents=True, exist_ok=True)
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)

    # ── 1. Full laps CSV ─────────────────────────────────────────────────────
    available_laps = [col for col in COLUMNS if col in laps.columns]
    missing_laps = [col for col in COLUMNS if col not in laps.columns]
    if missing_laps:
        print(f"  [WARN] Lap columns not found and skipped: {missing_laps}")

    df_laps = laps[available_laps].copy()
    df_laps.to_csv(laps_csv, index=False)
    print(f"[OK] {len(df_laps)} laps saved to: {laps_csv.relative_to(ROOT_DIR)}")

    # ── 2. Pitstops CSV ──────────────────────────────────────────────────────
    available_pit = [col for col in PITSTOP_COLUMNS if col in laps.columns]
    missing_pit = [col for col in PITSTOP_COLUMNS if col not in laps.columns]
    if missing_pit:
        print(f"  [WARN] Pitstop columns not found and skipped: {missing_pit}")

    pitstops_df = laps[laps["PitInTime"].notna()][available_pit].copy()
    pitstops_df.to_csv(pitstops_csv, index=False)
    print(f"[OK] {len(pitstops_df)} pit-stop laps saved to: {pitstops_csv.relative_to(ROOT_DIR)}")

    # ── 3. Weather CSV ───────────────────────────────────────────────────────
    weather: pd.DataFrame = session.weather_data
    available_weather = [col for col in WEATHER_COLUMNS if col in weather.columns]
    missing_weather = [col for col in WEATHER_COLUMNS if col not in weather.columns]
    if missing_weather:
        print(f"  [WARN] Weather columns not found and skipped: {missing_weather}")

    df_weather = weather[available_weather].copy()
    df_weather.to_csv(weather_csv, index=False)
    print(f"[OK] {len(df_weather)} weather rows saved to: {weather_csv.relative_to(ROOT_DIR)}")

    # ── 4. Drivers reference CSV (code -> full name -> team) ────────────────
    results: pd.DataFrame = session.results
    available_src = [col for col in DRIVER_COLUMNS if col in results.columns]
    missing_driver = [col for col in DRIVER_COLUMNS if col not in results.columns]
    if missing_driver:
        print(f"  [WARN] Driver columns not found and skipped: {missing_driver}")

    df_drivers = results[available_src].rename(columns=DRIVER_COLUMNS).copy()
    df_drivers.to_csv(drivers_csv, index=False)
    print(f"[OK] {len(df_drivers)} driver(s) saved to: {drivers_csv.relative_to(ROOT_DIR)}")


if __name__ == "__main__":
    # The prompt requires: accepts two command line arguments: year and country
    # E.g. python fetch_laps.py 2025 Monaco
    parser = argparse.ArgumentParser(description="Fetch F1 lap, pitstop, and weather data via FastF1")
    parser.add_argument("year", type=int, help="Season year")
    parser.add_argument("country", type=str, help="Race country / event name")
    
    args = parser.parse_args()
    fetch_data(year=args.year, country=args.country)
