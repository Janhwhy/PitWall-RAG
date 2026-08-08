import sqlite3
import pandas as pd
import pathlib
import re
import os

ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
LAPS_DIR = ROOT_DIR / "data" / "laps"
HISTORY_DIR = ROOT_DIR / "data" / "history"
DB_PATH = ROOT_DIR / "data" / "pitwall.db"

def parse_filename(filename):
    """Extract race and year from filename like 'monaco_2025.csv' or 'monaco_2025_pitstops.csv'"""
    match = re.match(r"^([a-z _]+)_(\d{4})", filename)
    if match:
        return match.group(1).title(), int(match.group(2))
    return "Unknown", 0

def _format_laptime(raw):
    """Convert a raw LapTime value to a numeric seconds float for easier SQL aggregation."""
    if pd.isna(raw):
        return None
    try:
        td = pd.to_timedelta(raw)
        return td.total_seconds()
    except Exception:
        return None

def init_db():
    if DB_PATH.exists():
        DB_PATH.unlink()
        
    conn = sqlite3.connect(DB_PATH)
    
    # 1. Load laps
    laps_dfs = []
    for f in LAPS_DIR.glob("*.csv"):
        if "_pitstops" in f.name or "_drivers" in f.name or "_quali" in f.name:
            continue
        race, year = parse_filename(f.name)
        df = pd.read_csv(f)
        df['Race'] = race
        df['Year'] = year
        # Convert LapTime to seconds for easier math in SQL
        if 'LapTime' in df.columns:
            df['LapTimeSeconds'] = df['LapTime'].apply(_format_laptime)
        laps_dfs.append(df)
        
    if laps_dfs:
        pd.concat(laps_dfs, ignore_index=True).to_sql("laps", conn, index=False)
        print(f"Loaded {len(laps_dfs)} races into 'laps' table.")
        
    # 2. Load pitstops
    pitstops_dfs = []
    for f in LAPS_DIR.glob("*_pitstops.csv"):
        race, year = parse_filename(f.name)
        df = pd.read_csv(f)
        df['Race'] = race
        df['Year'] = year
        pitstops_dfs.append(df)
        
    if pitstops_dfs:
        pd.concat(pitstops_dfs, ignore_index=True).to_sql("pitstops", conn, index=False)
        print(f"Loaded {len(pitstops_dfs)} races into 'pitstops' table.")
        
    # 3. Load weather
    weather_dfs = []
    for f in HISTORY_DIR.glob("*_weather.csv"):
        race, year = parse_filename(f.name)
        df = pd.read_csv(f)
        df['Race'] = race
        df['Year'] = year
        weather_dfs.append(df)
        
    if weather_dfs:
        pd.concat(weather_dfs, ignore_index=True).to_sql("weather", conn, index=False)
        print(f"Loaded {len(weather_dfs)} races into 'weather' table.")

    # 4. Load drivers (Code -> FullName -> Team reference, one row per driver
    # per race weekend). This is the only place full driver names exist —
    # laps/pitstops only ever store the 3-letter code — so it's what lets
    # DataAgent answer "who is X" / "who won" with a real grounded name
    # instead of the LLM guessing one.
    drivers_dfs = []
    for f in LAPS_DIR.glob("*_drivers.csv"):
        race, year = parse_filename(f.name)
        df = pd.read_csv(f)
        df['Race'] = race
        df['Year'] = year
        drivers_dfs.append(df)

    if drivers_dfs:
        pd.concat(drivers_dfs, ignore_index=True).to_sql("drivers", conn, index=False)
        print(f"Loaded {len(drivers_dfs)} races into 'drivers' table.")

    # 5. Load qualifying (grid position, Q1/Q2/Q3) — the only pre-race data
    # ingested; everything else in this DB comes from the Race session.
    quali_dfs = []
    for f in LAPS_DIR.glob("*_quali.csv"):
        race, year = parse_filename(f.name)
        df = pd.read_csv(f)
        df['Race'] = race
        df['Year'] = year
        quali_dfs.append(df)

    if quali_dfs:
        pd.concat(quali_dfs, ignore_index=True).to_sql("qualifying", conn, index=False)
        print(f"Loaded {len(quali_dfs)} races into 'qualifying' table.")

    conn.close()
    print(f"Database successfully created at {DB_PATH}")

if __name__ == "__main__":
    init_db()
