"""
fetch_full_schedule.py
-----------------------
Fetches the ENTIRE F1 season schedule for a given year using FastF1 - unlike
fetch_schedule.py, this does NOT filter out future races. Every round is kept,
along with every session's name and localized datetime, so the frontend can
show a calendar of the whole season and compute "time until next session" for
races that haven't happened yet.

Saves data/schedule_full_{year}.json.

Run with:
    python -m ingest.fetch_full_schedule 2026
"""

import argparse
import json
import pathlib

import fastf1

ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
CACHE_DIR = ROOT_DIR / "cache"
OUTPUT_DIR = ROOT_DIR / "data"

CACHE_DIR.mkdir(parents=True, exist_ok=True)
fastf1.Cache.enable_cache(str(CACHE_DIR))


def _iso(ts) -> str | None:
    """Convert a pandas Timestamp (tz-aware or naive) to an ISO-8601 string."""
    if ts is None or str(ts).lower() == "nat":
        return None
    return ts.isoformat()


def fetch_full_schedule(year: int) -> None:
    """Fetch every round of a season (past AND future) and save it to JSON."""
    print(f"Fetching FULL F1 event schedule for season {year} (including future rounds)...")
    schedule = fastf1.get_event_schedule(year, include_testing=False)

    events = []
    for _, row in schedule.iterrows():
        sessions = []
        for i in range(1, 6):
            name = row.get(f"Session{i}")
            date = row.get(f"Session{i}Date")
            if name is None or str(name).lower() == "none":
                continue
            sessions.append({"name": str(name), "date": _iso(date)})

        events.append(
            {
                "round": int(row["RoundNumber"]),
                "country": str(row["Country"]),
                "location": str(row["Location"]),
                "event_name": str(row["EventName"]),
                "event_format": str(row["EventFormat"]),
                "sessions": sessions,
            }
        )

    events.sort(key=lambda e: e["round"])

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / f"schedule_full_{year}.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(events)} events to {output_path.relative_to(ROOT_DIR)}")


def parse_args():
    parser = argparse.ArgumentParser(description="Fetch the full F1 season schedule (past + future) for a given year")
    parser.add_argument("year", type=int, help="Year of the F1 season")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    fetch_full_schedule(args.year)
