"""
fetch_laps.py
-------------
Fetches lap data for any F1 race session using the FastF1 library
and saves selected columns to data/laps/<output_name>.csv.

Default: 2025 Monaco Grand Prix

Usage:
    # Default — Monaco 2025
    python ingest/fetch_laps.py

    # Custom race
    python ingest/fetch_laps.py --year 2024 --race "British Grand Prix" --out silverstone_2024
"""

import argparse
import pathlib

import fastf1
import pandas as pd

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT_DIR   = pathlib.Path(__file__).resolve().parent.parent
CACHE_DIR  = ROOT_DIR / "cache"
OUTPUT_DIR = ROOT_DIR / "data" / "laps"

# ── FastF1 cache ───────────────────────────────────────────────────────────
CACHE_DIR.mkdir(parents=True, exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))

# ── Columns to extract ─────────────────────────────────────────────────────
COLUMNS = [
    "Driver",
    "LapNumber",
    "LapTime",
    "Compound",
    "TyreLife",
    "Position",
    "PitInTime",
    "PitOutTime",
]


def fetch_laps(year: int, race: str, out: str) -> pd.DataFrame:
    """Load an F1 race session and return the selected lap columns."""
    output_csv = OUTPUT_DIR / f"{out}.csv"

    print(f"Loading {year} {race} — Race session …")
    session = fastf1.get_session(year, race, "R")

    # Load laps + telemetry + weather in one call
    session.load(laps=True, telemetry=True, weather=True)

    laps: pd.DataFrame = session.laps

    # Keep only columns that actually exist in the DataFrame
    available = [col for col in COLUMNS if col in laps.columns]
    missing   = [col for col in COLUMNS if col not in laps.columns]
    if missing:
        print(f"  ⚠  Columns not found and skipped: {missing}")

    df = laps[available].copy()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv, index=False)

    print(f"\n✅  {len(df)} laps fetched and saved to: {output_csv.relative_to(ROOT_DIR)}")
    print(f"    Columns saved : {list(df.columns)}")
    print(f"    Drivers       : {sorted(df['Driver'].unique())}")

    return df


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch F1 lap data via FastF1")
    parser.add_argument("--year", type=int,  default=2025,            help="Season year (default: 2025)")
    parser.add_argument("--race", type=str,  default="Monaco Grand Prix", help="Race name (default: Monaco Grand Prix)")
    parser.add_argument("--out",  type=str,  default="monaco_2025",   help="Output CSV stem (default: monaco_2025)")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    fetch_laps(year=args.year, race=args.race, out=args.out)
