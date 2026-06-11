"""
fetch_radio.py
--------------
Downloads the audio track from a YouTube URL using yt-dlp and saves it as an
.mp3 file to data/radio/audio/monaco_2025_radio.mp3.

Requirements:
    yt-dlp, python-dotenv  (see requirements.txt)

Usage:
    python ingest/fetch_radio.py
"""

import pathlib

from dotenv import load_dotenv
import yt_dlp

# ── Config ─────────────────────────────────────────────────────────────────
YOUTUBE_URL = "https://youtu.be/q7wD-7g14hs"
OUTPUT_STEM = "monaco_2025_radio"   # filename without extension

# ── Paths ───────────────────────────────────────────────────────────────────
ROOT_DIR  = pathlib.Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT_DIR / "data" / "radio" / "audio"
OUT_PATH  = AUDIO_DIR / f"{OUTPUT_STEM}.mp3"


def fetch_radio() -> None:
    """Download audio from YOUTUBE_URL and save as OUT_PATH (.mp3)."""

    # Load .env (no-op if the file doesn't exist)
    load_dotenv(ROOT_DIR / ".env")

    # Ensure the destination directory exists
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[INFO] Downloading audio from: {YOUTUBE_URL}")
    print(f"[INFO] Destination            : {OUT_PATH.relative_to(ROOT_DIR)}")

    ydl_opts = {
        # Extract the best available audio and re-encode to mp3
        "format": "bestaudio/best",
        "outtmpl": str(AUDIO_DIR / OUTPUT_STEM),   # yt-dlp appends the ext
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",           # 192 kbps — good for Whisper
            }
        ],
        # Suppress the verbose progress bar; show only warnings/errors
        "quiet": True,
        "no_warnings": False,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([YOUTUBE_URL])

    if not OUT_PATH.exists():
        raise FileNotFoundError(
            f"Download appeared to succeed but {OUT_PATH} was not found. "
            "Check that ffmpeg is installed and available on PATH."
        )

    size_mb = OUT_PATH.stat().st_size / (1024 * 1024)
    print(f"\n[OK] Download complete.")
    print(f"     File : {OUT_PATH.relative_to(ROOT_DIR)}")
    print(f"     Size : {size_mb:.2f} MB")


if __name__ == "__main__":
    fetch_radio()
