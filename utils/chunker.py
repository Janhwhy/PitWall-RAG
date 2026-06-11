"""
chunker.py
----------
Converts structured F1 data CSVs into lists of text chunks suitable for
embedding and ingestion into a vector store.

Functions
---------
chunk_lap_data(csv_path) -> list[dict]
    Converts a laps CSV into one text chunk per driver-lap, with metadata.
"""

import pathlib
import re

import pandas as pd

# ── Default path ───────────────────────────────────────────────────────────
ROOT_DIR            = pathlib.Path(__file__).resolve().parent.parent
DEFAULT_LAPS_CSV    = ROOT_DIR / "data" / "laps"    / "monaco_2025.csv"
DEFAULT_WEATHER_CSV = ROOT_DIR / "data" / "history" / "monaco_2025_weather.csv"
DEFAULT_RADIO_DIR   = ROOT_DIR / "data" / "radio"   / "transcripts"


def _format_laptime(raw) -> str:
    """
    Convert a raw LapTime value (Timedelta string or NaT) to a tidy
    m:ss.mmm string, e.g. '1:14.312'.  Returns 'N/A' if missing.
    """
    if pd.isna(raw):
        return "N/A"
    try:
        # Timedelta stored as "0 days 00:01:14.312000"
        td = pd.to_timedelta(raw)
        total_seconds = int(td.total_seconds())
        minutes       = total_seconds // 60
        seconds       = total_seconds % 60
        millis        = td.components.milliseconds
        return f"{minutes}:{seconds:02d}.{millis:03d}"
    except Exception:
        return str(raw)


def _format_pit(raw) -> str:
    """
    Convert a raw PitInTime / PitOutTime value to a readable string.
    Returns 'N/A' if missing or NaT.
    """
    if pd.isna(raw):
        return "N/A"
    try:
        td = pd.to_timedelta(raw)
        total_seconds = td.total_seconds()
        return f"{total_seconds:.1f}s"
    except Exception:
        return str(raw)


def _safe_int(value) -> str:
    """Return int string for a numeric value, or 'N/A' if NaN/None."""
    try:
        if pd.isna(value):
            return "N/A"
        return str(int(value))
    except Exception:
        return "N/A"


def chunk_lap_data(csv_path: str | pathlib.Path = DEFAULT_LAPS_CSV) -> list[dict]:
    """
    Read a laps CSV and convert each row into a text chunk with metadata.

    Parameters
    ----------
    csv_path : str or Path
        Path to the laps CSV file (default: data/laps/monaco_2025.csv).

    Returns
    -------
    list of dict
        Each dict has:
          - "text"     : human-readable sentence describing the lap
          - "metadata" : dict with keys driver, lap_number, compound, source
    """
    df = pd.read_csv(csv_path)

    chunks: list[dict] = []

    for _, row in df.iterrows():
        driver      = str(row.get("Driver",     "N/A"))
        lap_number  = row.get("LapNumber",  "N/A")
        compound    = str(row.get("Compound",   "N/A"))
        tyre_life   = row.get("TyreLife",   "N/A")
        position    = row.get("Position",   "N/A")
        lap_time    = _format_laptime(row.get("LapTime"))
        pit_in      = _format_pit(row.get("PitInTime"))
        pit_out     = _format_pit(row.get("PitOutTime"))

        # ── Readable sentence ──────────────────────────────────────────────
        text = (
            f"Driver: {driver} | "
            f"Lap: {_safe_int(lap_number)} | "
            f"Compound: {compound} | "
            f"TyreLife: {_safe_int(tyre_life)} | "
            f"Position: {_safe_int(position)} | "
            f"LapTime: {lap_time} | "
            f"PitInTime: {pit_in} | "
            f"PitOutTime: {pit_out}"
        )

        # ── Metadata ───────────────────────────────────────────────────────
        lap_int = None if pd.isna(lap_number) else int(lap_number)
        metadata = {
            "driver":      driver,
            "lap_number":  lap_int,
            "compound":    compound,
            "source":      "laps",
        }

        chunks.append({"text": text, "metadata": metadata})

    return chunks


def chunk_weather_data(
    csv_path: str | pathlib.Path = DEFAULT_WEATHER_CSV,
    window: int = 10,
) -> list[dict]:
    """
    Read a weather CSV and group every `window` rows into one text chunk
    that summarises average conditions for that period.

    Parameters
    ----------
    csv_path : str or Path
        Path to the weather CSV (default: data/history/monaco_2025_weather.csv).
    window : int
        Number of rows to aggregate per chunk (default: 10).

    Returns
    -------
    list of dict
        Each dict has:
          - "text"     : formatted weather summary string
          - "metadata" : dict with keys window_start, window_end, source
    """
    df = pd.read_csv(csv_path)

    chunks: list[dict] = []

    for start in range(0, len(df), window):
        group = df.iloc[start : start + window]
        end   = min(start + window - 1, len(df) - 1)

        # Average numeric columns; majority-vote boolean Rainfall
        air_temp      = group["AirTemp"].mean()      if "AirTemp"      in group else float("nan")
        track_temp    = group["TrackTemp"].mean()    if "TrackTemp"    in group else float("nan")
        humidity      = group["Humidity"].mean()     if "Humidity"     in group else float("nan")
        wind_speed    = group["WindSpeed"].mean()    if "WindSpeed"    in group else float("nan")
        wind_dir      = group["WindDirection"].mean() if "WindDirection" in group else float("nan")
        rainfall      = bool(group["Rainfall"].mode()[0]) if "Rainfall" in group else False

        text = (
            f"AirTemp: {air_temp:.1f}°C | "
            f"TrackTemp: {track_temp:.1f}°C | "
            f"Humidity: {humidity:.1f}% | "
            f"Rainfall: {rainfall} | "
            f"WindSpeed: {wind_speed:.1f} | "
            f"WindDirection: {wind_dir:.0f}"
        )

        metadata = {
            "window_start": start,
            "window_end":   end,
            "source":       "weather",
        }

        chunks.append({"text": text, "metadata": metadata})

    return chunks


def chunk_radio_transcripts(
    transcripts_dir: str | pathlib.Path = DEFAULT_RADIO_DIR,
) -> list[dict]:
    """
    Parse every .txt file in `transcripts_dir` into per-utterance text chunks.

    Format expected (as produced by monaco_2025_radio_formatted.txt):
        [SPEAKER] First line of utterance
                  Continuation lines (indented — no tag)

    Skipped lines
    -------------
    - Empty / whitespace-only lines
    - Section headers: lines starting with ─, =, or matching patterns like
      ── RACE START ──, ======, etc.
    - Title lines (no [TAG] prefix and not a continuation)

    Parameters
    ----------
    transcripts_dir : str or Path
        Directory containing .txt transcript files.

    Returns
    -------
    list of dict
        Each dict has:
          - "text"     : full utterance text (joined multi-line)
          - "metadata" : dict with keys speaker, filename, source
    """
    transcripts_dir = pathlib.Path(transcripts_dir)
    txt_files       = sorted(transcripts_dir.glob("*.txt"))

    # Regex: matches lines that open a new speaker block, e.g. [COMMENTATOR]
    SPEAKER_RE  = re.compile(r"^\[([A-Z][A-Z0-9 _()]+)\]\s*(.*)", re.IGNORECASE)
    # Lines to skip: decorators (──, ==, --) or pure-whitespace
    SKIP_RE     = re.compile(r"^[\s\u2500\-=]+$")

    chunks: list[dict] = []

    for txt_path in txt_files:
        filename = txt_path.stem  # e.g. "monaco_2025_radio_formatted"
        lines    = txt_path.read_text(encoding="utf-8").splitlines()

        current_speaker: str | None = None
        current_lines:   list[str]  = []

        def _flush() -> None:
            """Save the accumulated utterance as a chunk."""
            if current_speaker and current_lines:
                text = " ".join(" ".join(current_lines).split())  # normalise whitespace
                chunks.append({
                    "text": text,
                    "metadata": {
                        "speaker":  current_speaker,
                        "filename": filename,
                        "source":   "radio",
                    },
                })

        for raw_line in lines:
            line = raw_line.rstrip()

            # --- Skip empty or decorator lines ---
            if not line.strip() or SKIP_RE.match(line.strip()):
                continue

            speaker_match = SPEAKER_RE.match(line)

            if speaker_match:
                # New speaker block — flush previous and start fresh
                _flush()
                current_speaker = speaker_match.group(1).strip().upper()
                first_text      = speaker_match.group(2).strip()
                current_lines   = [first_text] if first_text else []

            elif current_speaker is not None and line.startswith(" "):
                # Indented continuation of current speaker block
                current_lines.append(line.strip())

            else:
                # Non-tagged, non-indented line (e.g. title / END OF TRANSCRIPT)
                # Flush current block and discard this line
                _flush()
                current_speaker = None
                current_lines   = []

        # Flush the last accumulated block in the file
        _flush()

    return chunks


# ── Quick smoke test ───────────────────────────────────────────────────────
if __name__ == "__main__":
    # --- Lap chunks ---
    lap_chunks = chunk_lap_data()
    print(f"Lap chunks   : {len(lap_chunks)}")
    print("── Sample lap chunks ──────────────────────────────────────────")
    for chunk in lap_chunks[:3]:
        print(f"  TEXT    : {chunk['text']}")
        print(f"  METADATA: {chunk['metadata']}")
        print()

    # --- Weather chunks ---
    wx_chunks = chunk_weather_data()
    print(f"Weather chunks: {len(wx_chunks)}")
    print("── Sample weather chunks ──────────────────────────────────────")
    for chunk in wx_chunks[:3]:
        print(f"  TEXT    : {chunk['text']}")
        print(f"  METADATA: {chunk['metadata']}")
        print()

    # --- Radio chunks ---
    radio_chunks = chunk_radio_transcripts()
    print(f"Radio chunks : {len(radio_chunks)}")
    print("── Sample radio chunks ─────────────────────────────────────────")
    for chunk in radio_chunks[:5]:
        print(f"  TEXT    : {chunk['text']}")
        print(f"  METADATA: {chunk['metadata']}")
        print()
