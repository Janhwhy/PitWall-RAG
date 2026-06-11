"""
transcribe_radio.py
-------------------
Loops over all .mp3 files in data/radio/audio/ and transcribes each one
using the faster-whisper library (runs 100% locally, no API key required).

Model options (trade-off between speed and accuracy):
    tiny   ~1 min  per file  -- rough, good for testing
    base   ~2 min  per file  -- decent quality
    small  ~4 min  per file  -- good quality  (default)
    medium ~8 min  per file  -- very good quality
    large  ~15 min per file  -- best quality

Each transcript is saved as a .txt file with the same stem into
data/radio/transcripts/.

Requirements:
    faster-whisper  (see requirements.txt)

Usage:
    python ingest/transcribe_radio.py
    python ingest/transcribe_radio.py --model medium
"""

import argparse
import pathlib

from faster_whisper import WhisperModel  # pyrefly: ignore [missing-import]

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT_DIR       = pathlib.Path(__file__).resolve().parent.parent
AUDIO_DIR      = ROOT_DIR / "data" / "radio" / "audio"
TRANSCRIPT_DIR = ROOT_DIR / "data" / "radio" / "transcripts"

DEFAULT_MODEL = "small"   # good balance of speed vs accuracy on CPU


def transcribe_radio(model_size: str = DEFAULT_MODEL) -> None:
    """Transcribe every .mp3 in AUDIO_DIR and write .txt files to TRANSCRIPT_DIR."""

    # Ensure directories exist
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)

    mp3_files = sorted(AUDIO_DIR.glob("*.mp3"))

    if not mp3_files:
        print(
            "[INFO] No .mp3 files found in data/radio/audio/\n"
            "       Add team-radio recordings there and re-run this script."
        )
        return

    print(f"[INFO] Loading Whisper model: {model_size!r}  (downloading on first run ...)")
    # device="cpu", compute_type="int8" keeps RAM usage low on a laptop
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    print(f"[INFO] Model ready.\n")

    print(f"[INFO] Found {len(mp3_files)} audio file(s) - starting transcription ...\n")

    for mp3_path in mp3_files:
        out_path = TRANSCRIPT_DIR / mp3_path.with_suffix(".txt").name
        print(f"  -> Transcribing: {mp3_path.name}  (this may take a few minutes ...)")

        segments, info = model.transcribe(str(mp3_path), beam_size=5)

        print(f"     Detected language: {info.language!r}  "
              f"(probability: {info.language_probability:.0%})")

        # Materialise the lazy generator and join all segment texts
        transcript_text = " ".join(seg.text.strip() for seg in segments)

        out_path.write_text(transcript_text, encoding="utf-8")

        print(f"     [OK]  Saved to : {out_path.relative_to(ROOT_DIR)}")
        print(f"     [PRV] Preview  : {transcript_text[:120].strip()!r}\n")

    print(f"Done - {len(mp3_files)} transcript(s) written to "
          f"{TRANSCRIPT_DIR.relative_to(ROOT_DIR)}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcribe F1 team-radio MP3s using local Whisper (free, no API key)"
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        choices=["tiny", "base", "small", "medium", "large"],
        help=f"Whisper model size (default: {DEFAULT_MODEL})",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    transcribe_radio(model_size=args.model)
