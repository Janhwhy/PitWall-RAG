"""
fetch_laps.py
-------------
Fetches lap data for any F1 race session using the FastF1 library
and saves two CSVs to data/laps/:

    <out>.csv          – all laps with selected columns
    <out>_pitstops.csv – only laps where PitInTime is not null
                         (columns: Driver, LapNumber, PitInTime,
                          PitOutTime, Compound, TyreLife)

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

# Columns kept in the dedicated pitstops CSV
PITSTOP_COLUMNS = [
    "Driver",
    "LapNumber",
    "PitInTime",
    "PitOutTime",
    "Compound",
    "TyreLife",
]


def fetch_laps(year: int, race: str, out: str) -> pd.DataFrame:
    """
    Load an F1 race session, save all-laps CSV, and additionally save a
    filtered pitstops CSV (rows where PitInTime is not null).

    Outputs
    -------
    data/laps/<out>.csv           – all laps
    data/laps/<out>_pitstops.csv  – pit-stop laps only
    """
    output_csv    = OUTPUT_DIR / f"{out}.csv"
    pitstops_csv  = OUTPUT_DIR / f"{out}_pitstops.csv"

    print(f"Loading {year} {race} - Race session ...")
    session = fastf1.get_session(year, race, "R")

    # Load laps + telemetry + weather in one call
    session.load(laps=True, telemetry=True, weather=True)

    laps: pd.DataFrame = session.laps

    # ── Full laps CSV ────────────────────────────────────────────────────────
    available = [col for col in COLUMNS if col in laps.columns]
    missing   = [col for col in COLUMNS if col not in laps.columns]
    if missing:
        print(f"  [WARN] Columns not found and skipped: {missing}")

    df = laps[available].copy()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv, index=False)

    print(f"\n[OK] {len(df)} laps saved to: {output_csv.relative_to(ROOT_DIR)}")
    print(f"     Columns : {list(df.columns)}")
    print(f"     Drivers : {sorted(df['Driver'].unique())}")

    # ── Pitstops CSV ─────────────────────────────────────────────────────────
    pit_available = [col for col in PITSTOP_COLUMNS if col in laps.columns]
    pit_missing   = [col for col in PITSTOP_COLUMNS if col not in laps.columns]
    if pit_missing:
        print(f"  [WARN] Pitstop columns not found and skipped: {pit_missing}")

    # Filter to rows where PitInTime is not null — these are actual pit laps
    pitstops_df = laps[laps["PitInTime"].notna()][pit_available].copy()
    pitstops_df.to_csv(pitstops_csv, index=False)

    print(f"[OK] {len(pitstops_df)} pit-stop laps saved to: {pitstops_csv.relative_to(ROOT_DIR)}")
    print(f"     Columns : {list(pitstops_df.columns)}")

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
