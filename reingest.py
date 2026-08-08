import sys
import os
import pathlib
sys.path.append(os.getcwd())
import chromadb

# NOTE: utils/vectorstore.py's persistent client (and every agent that reads
# through it) points at the "vectorstore/" directory, not "data/chroma_db/".
# Deleting collections in the wrong directory silently no-ops, leaving stale
# data in place — always target the same path vectorstore.py uses.
client = chromadb.PersistentClient(path="vectorstore")
for col in ["laps", "weather", "pitstops", "radio"]:
    try:
        client.delete_collection(col)
        print(f"Deleted {col}")
    except Exception as e:
        print(f"Skipped {col}: {e}")

from ingest.run_all_seasons import run_bulk_ingestion
run_bulk_ingestion([2025, 2026])
