"""
fetch_schedule.py
-----------------
Fetches the F1 season schedule for a given year using FastF1,
filters to only completed races (where the event date is before today),
prints them to the console, and saves the list as data/schedule_{year}.json.
"""

import argparse
import datetime
import json
import pathlib
import fastf1

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
CACHE_DIR = ROOT_DIR / "cache"
OUTPUT_DIR = ROOT_DIR / "data"

# Enable fastf1 cache
CACHE_DIR.mkdir(parents=True, exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))


def fetch_schedule(year: int):
    """
    Fetch the schedule for a given year, filter completed races, and save to JSON.
    """
    print(f"Fetching F1 event schedule for season {year}...")
    try:
        schedule = fastf1.get_event_schedule(year)
    except Exception as e:
        print(f"Error fetching schedule for year {year}: {e}")
        return

    # Filter out round 0 (tests / pre-season) and only keep rows where event date is before today
    # Note: EventDate is Timestamp (datetime64[ns]), we compare with today's date
    today = datetime.datetime.now()

    completed_races = []
    
    # Sort or iterate through schedule
    for _, row in schedule.iterrows():
        # Skip testing events (RoundNumber == 0 or Session5 is None/None-like)
        if row["RoundNumber"] == 0 or row["Session5"] is None or str(row["Session5"]).lower() == 'none':
            continue
            
        event_date = row["EventDate"]
        
        # Check if event_date is before today
        if event_date < today:
            round_num = int(row["RoundNumber"])
            country = str(row["Country"])
            location = str(row["Location"])
            date_str = event_date.strftime("%Y-%m-%d")
            session_name = str(row["Session5"])
            
            # Print details
            print(f"Round {round_num:2d}: {country} ({location}) - {date_str} [{session_name}]")
            
            completed_races.append({
                "round": round_num,
                "country": country,
                "location": location,
                "date": date_str,
                "session_name": session_name
            })
            
    print(f"Found {len(completed_races)} completed races for {year}.")
    
    # Save to data/schedule_{year}.json
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / f"schedule_{year}.json"
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(completed_races, f, indent=4)
        
    print(f"Saved schedule to {output_path.relative_to(ROOT_DIR)}")


def parse_args():
    parser = argparse.ArgumentParser(description="Fetch completed F1 races for a given year")
    parser.add_argument("year", type=int, help="Year of the F1 season")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    fetch_schedule(args.year)
