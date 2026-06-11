"""
test_chunking.py
----------------
End-to-end smoke test for the PitWall chunking + embedding pipeline.

Tests
-----
1. chunk_lap_data()          -- lap data from data/laps/monaco_2025.csv
2. chunk_weather_data()      -- weather data from data/history/monaco_2025_weather.csv
3. chunk_radio_transcripts() -- radio transcripts from data/radio/transcripts/
4. embed_chunks()            -- local embeddings (BAAI/bge-small-en-v1.5, no API key)

Usage
-----
    python utils/test_chunking.py
"""

import pathlib
import sys

# ── Make sure utils/ and project root are importable ──────────────────────
ROOT_DIR  = pathlib.Path(__file__).resolve().parent.parent
UTILS_DIR = ROOT_DIR / "utils"
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(UTILS_DIR))

from chunker import (  # pyrefly: ignore [missing-import]
    chunk_lap_data,
    chunk_weather_data,
    chunk_radio_transcripts,
)
from embedder import embed_chunks  # pyrefly: ignore [missing-import]

DIVIDER = "-" * 64
HEADER  = "=" * 64


def _section(title: str) -> None:
    print(f"\n{HEADER}")
    print(f"  {title}")
    print(HEADER)


def _print_sample(chunk: dict, embedding_done: bool = False) -> None:
    print(f"  TEXT     : {chunk['text'][:100].strip()!r}")
    if len(chunk["text"]) > 100:
        print(f"             ... ({len(chunk['text'])} chars total)")
    print(f"  METADATA : {chunk['metadata']}")
    if embedding_done:
        vec = chunk.get("embedding", [])
        print(f"  EMBEDDING: {len(vec)} dims  |  "
              f"first 3 values: {[round(v, 6) for v in vec[:3]]}")
    print()


def _assert(condition: bool, message: str) -> None:
    status = "[PASS]" if condition else "[FAIL]"
    print(f"  {status} {message}")
    if not condition:
        sys.exit(1)


# ── 1. Lap chunks ──────────────────────────────────────────────────────────
_section("1 / 4  Lap Data Chunks")

lap_chunks = chunk_lap_data()

print(f"  Chunks produced : {len(lap_chunks)}")
_assert(len(lap_chunks) > 0,                             "At least one lap chunk produced")
_assert("text"     in lap_chunks[0],                     "Chunk has 'text' key")
_assert("metadata" in lap_chunks[0],                     "Chunk has 'metadata' key")
_assert(lap_chunks[0]["metadata"].get("source") == "laps", "Metadata source == 'laps'")

print(f"\n  Sample chunk (index 0):")
print(DIVIDER)
_print_sample(lap_chunks[0])

# ── 2. Weather chunks ──────────────────────────────────────────────────────
_section("2 / 4  Weather Data Chunks")

wx_chunks = chunk_weather_data()

print(f"  Chunks produced : {len(wx_chunks)}")
_assert(len(wx_chunks) > 0,                                "At least one weather chunk produced")
_assert("text"     in wx_chunks[0],                        "Chunk has 'text' key")
_assert("metadata" in wx_chunks[0],                        "Chunk has 'metadata' key")
_assert(wx_chunks[0]["metadata"].get("source") == "weather", "Metadata source == 'weather'")

print(f"\n  Sample chunk (index 0):")
print(DIVIDER)
_print_sample(wx_chunks[0])

# ── 3. Radio transcript chunks ─────────────────────────────────────────────
_section("3 / 4  Radio Transcript Chunks")

radio_chunks = chunk_radio_transcripts()

print(f"  Chunks produced : {len(radio_chunks)}")
_assert(len(radio_chunks) > 0,                              "At least one radio chunk produced")
_assert("text"     in radio_chunks[0],                      "Chunk has 'text' key")
_assert("metadata" in radio_chunks[0],                      "Chunk has 'metadata' key")
_assert(radio_chunks[0]["metadata"].get("source") == "radio", "Metadata source == 'radio'")

print(f"\n  Sample chunk (index 0):")
print(DIVIDER)
_print_sample(radio_chunks[0])

# ── 4. Embedder (local — no API key needed) ────────────────────────────────
_section("4 / 4  Embedder  (BAAI/bge-small-en-v1.5, local)")

# Embed one sample from each source — keeps the test fast
sample_chunks = [lap_chunks[0], wx_chunks[0], radio_chunks[0]]
print(f"  Embedding {len(sample_chunks)} sample chunk(s)  (1 per source) ...\n")

embedded = embed_chunks(sample_chunks, batch_size=100)

print()
_assert(all("embedding" in c for c in embedded),
        "All sample chunks have 'embedding' key after embed_chunks()")

dims = len(embedded[0]["embedding"])
_assert(dims == 384, f"Embedding dimension is 384 (got {dims})")

print(f"\n  Sample chunk details after embedding:")
print(DIVIDER)
labels = ["lap", "weather", "radio"]
for label, chunk in zip(labels, embedded):
    print(f"  [{label.upper()}]")
    _print_sample(chunk, embedding_done=True)

# ── Summary ────────────────────────────────────────────────────────────────
_section("Summary")

total_chunks = len(lap_chunks) + len(wx_chunks) + len(radio_chunks)

print(f"  Lap chunks     : {len(lap_chunks):>5}")
print(f"  Weather chunks : {len(wx_chunks):>5}")
print(f"  Radio chunks   : {len(radio_chunks):>5}")
print(f"  {DIVIDER[2:]}")
print(f"  Total chunks   : {total_chunks:>5}")
print()
print("  [OK] Chunking + embedding pipeline is fully working.")
print("       Model: BAAI/bge-small-en-v1.5 | 384 dims | runs locally, 100% free.")
print()
