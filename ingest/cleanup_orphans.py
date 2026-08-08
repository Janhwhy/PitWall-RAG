"""
cleanup_orphans.py
-------------------
One-time (repeatable) maintenance script that removes legacy chunks left over
from before race/year metadata + race-scoped IDs existed.

Older ingestion runs stored chunks under plain IDs (e.g. "VER_lap32") with no
"race"/"year" metadata. Later runs switched to race-scoped IDs
(e.g. "monaco_2025_VER_lap32"), which meant the old rows were never
overwritten by upsert() — they just sit alongside the new ones forever,
diluting nearest-neighbour search and (once retrieval is race/year filtered)
becoming permanently unreachable dead weight.

This script deletes every chunk in laps/weather/radio/pitstops whose
metadata is missing "race" or "year".

Usage:
    python ingest/cleanup_orphans.py            # deletes orphans
    python ingest/cleanup_orphans.py --dry-run   # just reports counts
"""

import argparse
import pathlib
import sys

ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from utils.vectorstore import (
    get_laps_collection,
    get_weather_collection,
    get_radio_collection,
    get_pitstops_collection,
)

_GETTERS = {
    "laps":     get_laps_collection,
    "weather":  get_weather_collection,
    "radio":    get_radio_collection,
    "pitstops": get_pitstops_collection,
}


def find_orphan_ids(collection) -> list[str]:
    """Return IDs of every chunk missing 'race' or 'year' metadata."""
    total = collection.count()
    if total == 0:
        return []
    data = collection.get(limit=total, include=["metadatas"])
    orphan_ids = [
        chunk_id
        for chunk_id, metadata in zip(data["ids"], data["metadatas"])
        if not metadata.get("race") or not metadata.get("year")
    ]
    return orphan_ids


def main(dry_run: bool) -> None:
    print("=== Orphan chunk cleanup (missing race/year metadata) ===\n")
    grand_total = 0

    for name, getter in _GETTERS.items():
        collection = getter()
        before = collection.count()
        orphan_ids = find_orphan_ids(collection)

        if not orphan_ids:
            print(f"{name:>9}: {before:5d} total, 0 orphans — clean.")
            continue

        if dry_run:
            print(f"{name:>9}: {before:5d} total, {len(orphan_ids):4d} orphan(s) would be deleted.")
        else:
            collection.delete(ids=orphan_ids)
            after = collection.count()
            print(f"{name:>9}: {before:5d} -> {after:5d} ({len(orphan_ids)} orphan(s) deleted)")

        grand_total += len(orphan_ids)

    print(f"\n{'[DRY RUN] Would delete' if dry_run else 'Deleted'} {grand_total} orphaned chunk(s) total.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Report counts without deleting anything.")
    args = parser.parse_args()
    main(dry_run=args.dry_run)
