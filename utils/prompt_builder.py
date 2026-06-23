"""
prompt_builder.py
-----------------
Constructs the system and user prompts for PitWall's RAG pipeline.

Given a natural-language question and a list of retrieved chunks (as returned
by ``utils/retriever.retrieve``), ``build_prompt`` produces a two-key dict
ready to pass directly to an LLM chat API:

    {
        "system": "<system prompt string>",
        "user":   "<user prompt string>",
    }

System prompt behaviour
-----------------------
- Establishes PitWall as an expert F1 race strategy analyst.
- Instructs the model to answer *only* from the supplied context.
- Requires every factual claim to cite its source collection
  (laps | weather | radio).
- Mandates the fallback phrase "I don't have enough data to answer that."
  when the context is insufficient.

User prompt layout
------------------
- Retrieved chunks are grouped by collection name and rendered as a
  numbered list under a clear heading for each group.
- The user's question is appended at the end, clearly demarcated.

Functions
---------
build_prompt(question, chunks) -> dict[str, str]

Usage (standalone smoke test)
------------------------------
    python utils/prompt_builder.py
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any


# ── Constants ────────────────────────────────────────────────────────────────

# Canonical display order and human-readable labels for the three collections.
_COLLECTION_ORDER: list[str] = ["laps", "pitstops", "weather", "radio"]
_COLLECTION_LABELS: dict[str, str] = {
    "laps":     "Lap Data",
    "pitstops": "Pit Stops",
    "weather":  "Weather Data",
    "radio":    "Team Radio",
}

_SYSTEM_PROMPT = """\
You are PitWall, an expert Formula 1 race strategy analyst.

ROLE
----
You analyse lap telemetry, weather conditions, and team radio communications
to deliver precise, data-driven answers about F1 race strategy, tyre management,
pit-stop timing, and on-track performance.

RULES — follow these without exception
---------------------------------------
1. Answer ONLY from the context sections provided in the user message.
   Do not draw on outside knowledge, assumptions, or prior races unless
   explicitly reflected in the supplied context.

2. Cite your sources. After every factual claim, indicate which collection
   it came from using one of these inline tags:
       [laps]    – derived from lap telemetry / timing data
       [weather] – derived from weather / track-condition data
       [radio]   – derived from team radio communications

3. If the context does not contain enough information to answer the question
   fully and accurately, respond with exactly:
       "I don't have enough data to answer that."
   You may optionally add one sentence explaining what kind of data would
   be needed, but do not speculate or fabricate facts.

4. Be concise and precise. Use F1 terminology correctly.
   Prefer structured answers (short paragraphs or bullet points) where
   appropriate, but always ground every statement in the provided context.\
"""


# ── Public API ────────────────────────────────────────────────────────────────

def build_prompt(
    question: str,
    chunks: list[dict[str, Any]],
) -> dict[str, str]:
    """
    Build a system / user prompt pair for the PitWall RAG pipeline.

    Parameters
    ----------
    question : str
        The natural-language question from the user.
    chunks : list of dict
        Retrieved chunks as returned by ``utils.retriever.retrieve``.
        Each dict must contain at least:
            ``text``       – str  : the stored document text
            ``collection`` – str  : one of "laps", "weather", "radio"
        Optional but rendered if present:
            ``distance``   – float : cosine distance (used for debug info)
            ``metadata``   – dict  : arbitrary metadata stored at ingestion

    Returns
    -------
    dict with keys ``"system"`` and ``"user"`` (both ``str``).

    Raises
    ------
    ValueError
        If ``question`` is empty.
    """
    if not question or not question.strip():
        raise ValueError("'question' must be a non-empty string.")

    user_prompt = _build_user_prompt(question.strip(), chunks)

    return {
        "system": _SYSTEM_PROMPT,
        "user":   user_prompt,
    }


# ── Internal helpers ──────────────────────────────────────────────────────────

def _build_user_prompt(question: str, chunks: list[dict[str, Any]]) -> str:
    """Render the user-facing prompt string from chunks + question."""
    lines: list[str] = []

    if not chunks:
        # Emit an explicit no-context section so the model triggers its
        # "insufficient data" rule rather than hallucinating.
        lines.append("## Retrieved Context\n")
        lines.append("*(No relevant context was found for this query.)*\n")
    else:
        lines.append("## Retrieved Context\n")
        lines.append(
            "The following data was retrieved from the PitWall knowledge base. "
            "Use only this information to answer the question.\n"
        )

        # Group chunks by collection, preserving canonical display order.
        grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for chunk in chunks:
            col = chunk.get("collection", "unknown")
            grouped[col].append(chunk)

        # Render known collections first (in canonical order), then any unknown.
        ordered_keys = [c for c in _COLLECTION_ORDER if c in grouped]
        ordered_keys += [c for c in grouped if c not in _COLLECTION_ORDER]

        for col_name in ordered_keys:
            label = _COLLECTION_LABELS.get(col_name, col_name.title())
            lines.append(f"### {label} [{col_name}]\n")

            for idx, chunk in enumerate(grouped[col_name], start=1):
                text     = chunk.get("text", "").strip()
                distance = chunk.get("distance")
                metadata = chunk.get("metadata", {})

                # Build a compact header line for each chunk.
                header_parts: list[str] = [f"Chunk {idx}"]
                if distance is not None:
                    header_parts.append(f"distance={distance:.4f}")
                if metadata:
                    # Surface a few useful metadata fields if present.
                    meta_snippets: list[str] = []
                    for key in ("driver", "lap_number", "compound",
                                "window_start", "window_end",
                                "speaker", "filename"):
                        if key in metadata:
                            meta_snippets.append(f"{key}={metadata[key]}")
                    if meta_snippets:
                        header_parts.append(", ".join(meta_snippets))

                lines.append(f"**[{' | '.join(header_parts)}]**")
                lines.append(text)
                lines.append("")   # blank line between chunks

    # ── Question ─────────────────────────────────────────────────────────────
    lines.append("---\n")
    lines.append("## Question\n")
    lines.append(question)

    return "\n".join(lines)


# ── Smoke test ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== prompt_builder.py smoke test ===\n")

    mock_chunks = [
        {
            "text": "Driver: VER | Lap: 32 | Compound: SOFT | LapTime: 1:12.345 | Position: 1",
            "metadata": {"driver": "VER", "lap_number": 32, "compound": "SOFT"},
            "distance": 0.12,
            "collection": "laps",
        },
        {
            "text": "Driver: HAM | Lap: 32 | Compound: MEDIUM | LapTime: 1:13.102 | Position: 2",
            "metadata": {"driver": "HAM", "lap_number": 32, "compound": "MEDIUM"},
            "distance": 0.18,
            "collection": "laps",
        },
        {
            "text": "AirTemp: 28.5°C | TrackTemp: 44.2°C | Humidity: 38% | Rainfall: False",
            "metadata": {"window_start": 30, "window_end": 39},
            "distance": 0.21,
            "collection": "weather",
        },
        {
            "text": "[GP] Max, we're going to box you this lap. Soft tyres ready.",
            "metadata": {"speaker": "GP", "filename": "monaco_2025_radio"},
            "distance": 0.29,
            "collection": "radio",
        },
    ]

    question = "Why did Verstappen pit on lap 32?"
    prompt = build_prompt(question, mock_chunks)

    print("── SYSTEM PROMPT ──────────────────────────────────────────────────")
    print(prompt["system"])
    print()
    print("── USER PROMPT ────────────────────────────────────────────────────")
    print(prompt["user"])
    print()

    # Edge case: no chunks
    print("── EMPTY CONTEXT TEST ─────────────────────────────────────────────")
    empty_prompt = build_prompt("What happened on lap 1?", [])
    print(empty_prompt["user"])
