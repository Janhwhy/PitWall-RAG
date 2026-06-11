"""
run_all.py
----------
Master ingestion runner for the PitWall RAG pipeline.

Runs each ingest step in order:
  1. fetch_laps.py      -- lap data via FastF1
  2. fetch_weather.py   -- weather data via FastF1
  3. transcribe_radio.py -- team-radio transcription via OpenAI Whisper

If a step raises an exception, the error is printed and the runner
continues to the next step without crashing the whole pipeline.

Usage:
    python ingest/run_all.py
"""

import sys
import traceback
from typing import Callable

# ---------------------------------------------------------------------------
# Import each ingest module's main function.
# We import at the top level so missing dependencies surface immediately,
# not mid-run when the step is about to execute.
# ---------------------------------------------------------------------------
from fetch_laps import fetch_laps
from fetch_weather import fetch_weather
from transcribe_radio import transcribe_radio


# ---------------------------------------------------------------------------
# Pipeline definition
# Each entry is (label, callable).  The callable takes no arguments; default
# parameters are baked in (Monaco 2025, same as each script's __main__ block).
# ---------------------------------------------------------------------------
STEPS: list[tuple[str, Callable[[], None]]] = [
    (
        "fetch_laps       -- lap data (FastF1)",
        lambda: fetch_laps(year=2025, race="Monaco Grand Prix", out="monaco_2025"),
    ),
    (
        "fetch_weather     -- weather data (FastF1)",
        fetch_weather,
    ),
    (
        "transcribe_radio  -- team-radio transcription (Whisper)",
        transcribe_radio,
    ),
]

DIVIDER = "-" * 60


def run_pipeline() -> None:
    """Execute every ingestion step, reporting success or failure for each."""
    total = len(STEPS)
    failures: list[str] = []

    print("=" * 60)
    print("  PitWall Ingestion Pipeline")
    print(f"  {total} steps to run")
    print("=" * 60)

    for idx, (label, fn) in enumerate(STEPS, start=1):
        print(f"\n[{idx}/{total}] START  {label}")
        print(DIVIDER)

        try:
            fn()
            print(DIVIDER)
            print(f"[{idx}/{total}] DONE   {label}")
        except Exception:
            print(DIVIDER)
            print(f"[{idx}/{total}] ERROR  {label}")
            print("  Full traceback:")
            # Encode each line to ASCII (replacing unmappable chars with '?')
            # so a Unicode character inside the error never causes a secondary
            # crash on Windows terminals using cp1252.
            tb = traceback.format_exc()
            for line in tb.splitlines():
                safe_line = line.encode("ascii", errors="replace").decode("ascii")
                print(f"    {safe_line}")
            failures.append(label)

    # ── Final summary ────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    passed = total - len(failures)
    print(f"  Pipeline complete: {passed}/{total} steps succeeded.")

    if failures:
        print(f"  {len(failures)} step(s) failed:")
        for name in failures:
            print(f"    - {name}")
        sys.exit(1)          # non-zero exit so CI/scripts can detect partial failure
    else:
        print("  All steps completed successfully.")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline()
