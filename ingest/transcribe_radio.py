"""
transcribe_radio.py
-------------------
Loops over all .mp3 files in data/radio/audio/ and transcribes each one
using the OpenAI Whisper API (whisper-1 model).

Each transcript is saved as a .txt file with the same stem into
data/radio/transcripts/.

Requirements:
    openai, python-dotenv  (both already in requirements.txt)

Usage:
    python ingest/transcribe_radio.py
"""

import pathlib

from dotenv import load_dotenv
import openai

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT_DIR      = pathlib.Path(__file__).resolve().parent.parent
AUDIO_DIR     = ROOT_DIR / "data" / "radio" / "audio"
TRANSCRIPT_DIR = ROOT_DIR / "data" / "radio" / "transcripts"


def transcribe_radio() -> None:
    """Transcribe every .mp3 in AUDIO_DIR and write .txt files to TRANSCRIPT_DIR."""

    # Load OPENAI_API_KEY from .env (silently ignored if file doesn't exist)
    load_dotenv(ROOT_DIR / ".env")

    # Ensure the output directory exists before we start
    TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)

    # Collect MP3 files (create the audio dir too so the path always exists)
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    mp3_files = sorted(AUDIO_DIR.glob("*.mp3"))

    if not mp3_files:
        print(
            "[INFO] No .mp3 files found in data/radio/audio/\n"
            "       Add team-radio recordings there and re-run this script."
        )
        return

    client = openai.OpenAI()  # picks up OPENAI_API_KEY from the environment

    print(f"[INFO] Found {len(mp3_files)} audio file(s) - starting transcription ...\n")

    for mp3_path in mp3_files:
        out_path = TRANSCRIPT_DIR / mp3_path.with_suffix(".txt").name
        print(f"  -> Transcribing: {mp3_path.name}")

        with mp3_path.open("rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
            )

        transcript_text: str = response.text
        out_path.write_text(transcript_text, encoding="utf-8")

        print(f"     [OK]  Saved to : {out_path.relative_to(ROOT_DIR)}")
        print(f"     [PRV] Preview  : {transcript_text[:120].strip()!r}\n")

    print(f"Done - {len(mp3_files)} transcript(s) written to {TRANSCRIPT_DIR.relative_to(ROOT_DIR)}")


if __name__ == "__main__":
    transcribe_radio()
