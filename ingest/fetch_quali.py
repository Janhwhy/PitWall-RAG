"""
fetch_quali.py
--------------
Fetches Qualifying session data (grid position, Q1/Q2/Q3 times) for a given
race using FastF1, so Pre-Race Brief can show real starting-grid info instead
of only post-hoc race-strategy narrative.

Saves:
    data/laps/{country_lowercase}_{year}_quali.csv

Usage:
    python ingest/fetch_quali.py 2025 Monaco
"""

import sys
import argparse
import pathlib

import fastf1
import pandas as pd

ROOT_DIR  = pathlib.Path(__file__).resolve().parent.parent
CACHE_DIR = ROOT_DIR / "cache"
LAPS_DIR  = ROOT_DIR / "data" / "laps"

CACHE_DIR.mkdir(parents=True, exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))

# session.results columns -> our quali.csv columns.
QUALI_COLUMNS = {
    "Abbreviation": "Driver",
    "FullName":     "FullName",
    "TeamName":     "Team",
    "Position":     "GridPosition",
    "Q1":           "Q1",
    "Q2":           "Q2",
    "Q3":           "Q3",
}


def _format_time(raw) -> str:
    """Convert a Timedelta (or NaT) Q1/Q2/Q3 value to seconds, or '' if missing."""
    if pd.isna(raw):
        return ""
    try:
        return f"{pd.to_timedelta(raw).total_seconds():.3f}"
    except Exception:
        return ""


def fetch_quali(year: int, country: str) -> None:
    """Fetch Qualifying results for a given year/country and save to CSV."""
    country_lowercase = country.lower()
    quali_csv = LAPS_DIR / f"{country_lowercase}_{year}_quali.csv"

    print(f"Loading {year} {country} - Qualifying session ...")

    try:
        session = fastf1.get_session(year, country, "Q")
        session.load(laps=False, telemetry=False, weather=False)
        results: pd.DataFrame = session.results
        if results.empty:
            raise ValueError("Session results dataframe is empty")
    except Exception:
        print(f"⚠️ Skipping {country} {year} — no qualifying data available yet")
        sys.exit(0)

    LAPS_DIR.mkdir(parents=True, exist_ok=True)

    available_src = [col for col in QUALI_COLUMNS if col in results.columns]
    missing = [col for col in QUALI_COLUMNS if col not in results.columns]
    if missing:
        print(f"  [WARN] Quali columns not found and skipped: {missing}")

    df = results[available_src].rename(columns=QUALI_COLUMNS).copy()
    for col in ("Q1", "Q2", "Q3"):
        if col in df.columns:
            df[col] = df[col].apply(_format_time)

    df.to_csv(quali_csv, index=False)
    print(f"[OK] {len(df)} driver(s) saved to: {quali_csv.relative_to(ROOT_DIR)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch F1 Qualifying grid/lap-time data via FastF1")
    parser.add_argument("year", type=int, help="Season year")
    parser.add_argument("country", type=str, help="Race country / event name")
    args = parser.parse_args()
    fetch_quali(year=args.year, country=args.country)
