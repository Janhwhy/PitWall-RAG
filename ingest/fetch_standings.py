"""
fetch_standings.py
-------------------
Fetches the F1 Drivers' and Constructors' Championship standings for a given
season using FastF1's Ergast (Jolpica-F1) wrapper, and saves them to
data/standings_{year}.json.

For an in-progress season this returns the standings as of the most recently
completed round; for a finished season it returns the final standings.

Run with:
    python -m ingest.fetch_standings 2026
"""

import argparse
import json
import pathlib

from fastf1.ergast import Ergast

ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT_DIR / "data"


def fetch_standings(year: int) -> None:
    """Fetch driver + constructor standings for a season and save to JSON."""
    print(f"Fetching {year} championship standings...")
    ergast = Ergast()

    driver_resp = ergast.get_driver_standings(season=year)
    constructor_resp = ergast.get_constructor_standings(season=year)

    round_reached = int(driver_resp.description["round"].iloc[0]) if len(driver_resp.description) else 0

    driver_df = driver_resp.content[0] if driver_resp.content else None
    constructor_df = constructor_resp.content[0] if constructor_resp.content else None

    drivers = []
    if driver_df is not None:
        for _, row in driver_df.iterrows():
            drivers.append(
                {
                    "position": int(row["position"]),
                    "driver_code": row["driverCode"],
                    "full_name": f"{row['givenName']} {row['familyName']}",
                    "team": row["constructorNames"][0] if row["constructorNames"] else "",
                    "points": float(row["points"]),
                    "wins": int(row["wins"]),
                    "nationality": row.get("driverNationality", ""),
                }
            )

    constructors = []
    if constructor_df is not None:
        for _, row in constructor_df.iterrows():
            constructors.append(
                {
                    "position": int(row["position"]),
                    "team": row["constructorName"],
                    "points": float(row["points"]),
                    "wins": int(row["wins"]),
                    "nationality": row.get("constructorNationality", ""),
                }
            )

    payload = {
        "year": year,
        "round": round_reached,
        "drivers": drivers,
        "constructors": constructors,
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / f"standings_{year}.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print(
        f"Saved standings through round {round_reached}: "
        f"{len(drivers)} drivers, {len(constructors)} constructors -> "
        f"{output_path.relative_to(ROOT_DIR)}"
    )


def parse_args():
    parser = argparse.ArgumentParser(description="Fetch F1 championship standings for a given season")
    parser.add_argument("year", type=int, help="Year of the F1 season")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    fetch_standings(args.year)
