"""
run_all_seasons.py
------------------
Master bulk ingestion runner for the PitWall RAG pipeline.
Ingests F1 seasons bulk data, chunking, embedding, and loading into ChromaDB.
"""

import sys
import json
import argparse
import pathlib
import subprocess

# ── Ensure project root is in path ─────────────────────────────────────────
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from utils.chunker import (
    chunk_lap_data,
    chunk_weather_data,
    chunk_pitstop_data,
    chunk_radio_transcripts,
)
from utils.embedder import embed_chunks
from utils.vectorstore import (
    load_laps,
    load_weather,
    load_pitstops,
    load_radio,
)


def run_bulk_ingestion(years: list[int]) -> None:
    """
    Loop through specified years, load schedule, fetch laps, chunk, embed, and upsert to ChromaDB.
    """
    # Track statistics
    stats = {
        year: {"laps": 0, "weather": 0, "pitstops": 0, "radio": 0}
        for year in years
    }

    for year in years:
        schedule_json = ROOT_DIR / "data" / f"schedule_{year}.json"
        
        # 1. Fetch schedule if it doesn't exist
        if not schedule_json.exists():
            print(f"\nschedule_{year}.json not found. Running fetch_schedule.py...")
            try:
                subprocess.run(
                    [sys.executable, "ingest/fetch_schedule.py", str(year)],
                    check=True,
                    cwd=str(ROOT_DIR)
                )
            except Exception as e:
                print(f"❌ Failed to fetch schedule for year {year}: {e}")
                continue

        if not schedule_json.exists():
            print(f"❌ schedule_{year}.json still missing after fetch attempt. Skipping season {year}.")
            continue

        with open(schedule_json, "r", encoding="utf-8") as f:
            races = json.load(f)

        print(f"\n=== Starting Season {year} Ingestion ({len(races)} races) ===")

        # 2. Loop over completed races
        for race in races:
            country = race["country"]
            country_lower = country.lower()
            
            print(f"🔄 Attempting {country} {year}...")
            try:
                # Run fetch_laps.py as a subprocess
                result = subprocess.run(
                    [sys.executable, "ingest/fetch_laps.py", str(year), country],
                    capture_output=True,
                    text=True,
                    cwd=str(ROOT_DIR)
                )
                
                if result.returncode == 0:
                    laps_csv = ROOT_DIR / "data" / "laps" / f"{country_lower}_{year}.csv"
                    # If laps CSV doesn't exist, the race was skipped cleanly by fetch_laps.py
                    if not laps_csv.exists():
                        print(f"⚠️ {country} {year} skipped — no session data available yet")
                        continue
                else:
                    raise RuntimeError(f"fetch_laps.py failed (exit code {result.returncode}):\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}")

                # Paths
                weather_csv = ROOT_DIR / "data" / "history" / f"{country_lower}_{year}_weather.csv"
                pitstops_csv = ROOT_DIR / "data" / "laps" / f"{country_lower}_{year}_pitstops.csv"
                radio_dir = ROOT_DIR / "data" / "radio" / "transcripts"
                
                # ── 3. Chunking ──────────────────────────────────────────────────
                lap_chunks = chunk_lap_data(csv_path=laps_csv, race_name=country, year=year)
                weather_chunks = chunk_weather_data(csv_path=weather_csv, race_name=country, year=year)
                
                try:
                    pitstop_chunks = chunk_pitstop_data(csv_path=pitstops_csv, race_name=country, year=year)
                except FileNotFoundError:
                    pitstop_chunks = []

                # Skips radio if no transcript exists for this specific race/year
                radio_pattern = f"*{country_lower}_{year}*.txt"
                if list(radio_dir.glob(radio_pattern)):
                    radio_chunks = chunk_radio_transcripts(transcripts_dir=radio_dir, race_name=country, year=year)
                else:
                    radio_chunks = []

                # ── 4. Embedding ─────────────────────────────────────────────────
                lap_embedded = embed_chunks(lap_chunks) if lap_chunks else []
                weather_embedded = embed_chunks(weather_chunks) if weather_chunks else []
                pitstop_embedded = embed_chunks(pitstop_chunks) if pitstop_chunks else []
                radio_embedded = embed_chunks(radio_chunks) if radio_chunks else []

                # ── 5. Ingestion (Upsert) ────────────────────────────────────────
                laps_loaded = load_laps(lap_embedded)
                weather_loaded = load_weather(weather_embedded)
                pitstops_loaded = load_pitstops(pitstop_embedded)
                radio_loaded = load_radio(radio_embedded)

                # Record stats
                stats[year]["laps"] += laps_loaded
                stats[year]["weather"] += weather_loaded
                stats[year]["pitstops"] += pitstops_loaded
                stats[year]["radio"] += radio_loaded

                # Print race success message
                # Output exactly the requested style: ✅ Monaco 2025 — 1203 lap chunks, 18 weather chunks, 45 pitstop chunks loaded
                print(f"✅ {country} {year} — {laps_loaded} lap chunks, {weather_loaded} weather chunks, {pitstops_loaded} pitstop chunks loaded")

            except Exception as error:
                import traceback
                print(f"❌ {country} {year} failed — {error}")
                traceback.print_exc()
                continue

    # ── 6. Final Summary Print ─────────────────────────────────────────────
    print("\n=== FINAL SUMMARY ===")
    total_all = 0
    for year in years:
        year_stats = stats[year]
        l = year_stats["laps"]
        w = year_stats["weather"]
        p = year_stats["pitstops"]
        r = year_stats["radio"]
        total_year = l + w + p + r
        total_all += total_year
        print(f"{year}: laps={l}  weather={w}  pitstops={p}  radio={r}")

    print(f"TOTAL: {total_all} chunks across 4 collections")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Master bulk ingestion runner for PitWall")
    parser.add_argument(
        "years",
        nargs="*",
        type=int,
        default=[2025, 2026],
        help="List of years to process (default: [2025, 2026])"
    )
    args = parser.parse_args()
    run_bulk_ingestion(args.years)
