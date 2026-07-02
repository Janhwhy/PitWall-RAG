"""
verify_expansion.py
-------------------
Verifies the database ingestion progress and runs semantic queries using RAG.
Prints chunk counts and breakdowns per race and year, then executes four test queries.
"""

import sys
import pathlib

# Ensure project root is in path
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from utils.vectorstore import (
    get_laps_collection,
    get_weather_collection,
    get_radio_collection,
    get_pitstops_collection,
)
from utils.rag import ask


def print_collection_breakdown(name: str, col) -> int:
    """Print the count and breakdown of chunks per race and year for a collection."""
    print(f"\n{name.upper()} COLLECTION")
    print("-" * 40)
    
    total_count = col.count()
    if total_count == 0:
        print("  Empty collection")
        print(f"TOTAL: 0 chunks")
        return 0

    # Fetch all metadatas using collection.get()
    res = col.get(include=["metadatas"])
    metadatas = res.get("metadatas", [])

    # Group by (year, race)
    groups = {}
    for meta in metadatas:
        if meta is None:
            continue
        year = meta.get("year", "Unknown")
        race = meta.get("race", "Unknown")
        key = (year, race)
        groups[key] = groups.get(key, 0) + 1

    # Sort groups by year (asc), then race name (asc)
    sorted_keys = sorted(groups.keys(), key=lambda x: (str(x[0]), str(x[1])))
    for year, race in sorted_keys:
        count = groups[(year, race)]
        print(f"{year:<6} {race:<18} → {count} chunks")

    print(f"TOTAL: {total_count} chunks")
    return total_count


def cleanup_collection(name: str, col) -> int:
    """Deletes entries where race metadata is missing, empty, or 'Unknown'."""
    res = col.get(include=["metadatas"])
    ids = res.get("ids", [])
    metadatas = res.get("metadatas", [])
    
    ids_to_delete = []
    for idx, meta in enumerate(metadatas):
        is_bad = False
        if meta is None:
            is_bad = True
        else:
            race = meta.get("race")
            if race is None or str(race).strip() in ("", "Unknown"):
                is_bad = True
        
        if is_bad:
            ids_to_delete.append(ids[idx])
            
    if ids_to_delete:
        col.delete(ids=ids_to_delete)
        
    return len(ids_to_delete)


def verify_and_query() -> None:
    # Run the 4 test queries through ask from utils/rag.py
    test_queries = [
        "Which 2025 race had the most pit stops based on pitstop data?",
        "Compare Monaco strategy between 2025 and 2026",
        "Which driver appears most consistently in P1 across 2025 lap data?",
        "What were the tyre compounds used most in 2025 races?",
    ]

    print("\n========================================")
    print("  Executing RAG Queries")
    print("========================================\n")

    for i, query in enumerate(test_queries, 1):
        print(f"Query {i}: {query}")
        print("-" * 60)
        try:
            answer = ask(query)
            print("Answer:")
            print(answer)
        except Exception as e:
            print(f"Error querying LLM: {e}")
        print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    verify_and_query()
