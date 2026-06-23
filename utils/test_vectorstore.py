"""
test_vectorstore.py
-------------------
Test script that populates the ChromaDB database using load_all()
and queries each collection with a test query, printing the top 3 results.
"""

import pathlib
import sys

# Ensure project root is in python path
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from utils.vectorstore import (
    load_all,
    get_laps_collection,
    get_weather_collection,
    get_radio_collection,
)


def run_test():
    print("Populating vector store (calling load_all)...")
    # This will chunk, embed, and load the default laps, weather, and radio datasets.
    load_all()

    # Define test queries for each collection
    queries = {
        "laps": ("Verstappen pit stop", get_laps_collection()),
        "weather": ("track temperature", get_weather_collection()),
        "radio": ("front wing damage", get_radio_collection()),
    }

    print("\n=== Executing Queries (Top 3 Results) ===")
    for name, (query_text, col) in queries.items():
        print(f"\nCollection: {name.upper()}")
        print(f"Query     : {query_text!r}")
        print("-" * 50)

        # Query the collection
        results = col.query(query_texts=[query_text], n_results=3)

        if not results or not results.get("documents") or not results["documents"][0]:
            print("  No results found.")
            continue

        ids = results["ids"][0]
        docs = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results.get("distances", [[]])[0]

        for i, (chunk_id, doc, meta, dist) in enumerate(zip(ids, docs, metadatas, distances)):
            print(f"  {i+1}. ID      : {chunk_id}")
            print(f"     Distance: {dist:.4f}")
            print(f"     Text    : {doc}")
            print(f"     Metadata: {meta}")
            print()


if __name__ == "__main__":
    run_test()
