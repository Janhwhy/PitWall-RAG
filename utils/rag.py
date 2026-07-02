"""
rag.py
------
Top-level orchestrator for the PitWall RAG pipeline.

Wires together the three pipeline stages in the correct order:

    1. Retrieve  – semantic search across ChromaDB collections
                   (utils/retriever.py)
    2. Prompt    – build system + user prompt from retrieved chunks
                   (utils/prompt_builder.py)
    3. Generate  – call the Groq LLM and return the answer
                   (utils/groq_client.py)

Functions
---------
ask(question, collections=None, top_k=5, distance_threshold=0.35,
    model=DEFAULT_MODEL, max_tokens=1024) -> str

Usage (standalone smoke test)
------------------------------
    python utils/rag.py
"""

from __future__ import annotations

import pathlib
import sys
from collections import Counter
from typing import Any

# ── Path bootstrap ───────────────────────────────────────────────────────────
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from utils.retriever     import retrieve, ALL_COLLECTIONS   # stage 1
from utils.prompt_builder import build_prompt               # stage 2
from utils.groq_client   import ask_groq, DEFAULT_MODEL     # stage 3


# ── Public API ────────────────────────────────────────────────────────────────

def ask(
    question: str,
    collections: list[str] | None = None,
    top_k: int = 15,
    distance_threshold: float = 0.50,
    model: str = DEFAULT_MODEL,
    max_tokens: int = 1_024,
) -> str:
    """
    Run the full PitWall RAG pipeline for a single question.

    Pipeline stages
    ---------------
    1. **Retrieve** – embed the question and search ChromaDB for the
       most semantically similar chunks across the requested collections.
    2. **Build prompt** – format the retrieved chunks and the question into
       a structured system / user prompt pair.
    3. **Generate** – send the prompts to the Groq LLM and return its reply.

    Parameters
    ----------
    question : str
        Natural-language question from the user.
    collections : list[str] | None
        Collections to search.  Subset of ``["laps", "weather", "radio", "pitstops"]``.
        Defaults to all.
    top_k : int
        Maximum nearest-neighbour results to fetch *per collection* before
        distance filtering.  Defaults to 15.
    distance_threshold : float
        Maximum cosine distance (inclusive) to keep a retrieved chunk.
        Defaults to 0.50.
    model : str
        Groq model identifier.  Defaults to ``"llama-3.1-70b-versatile"``.
    max_tokens : int
        Maximum tokens the LLM may generate.  Defaults to 1 024.

    Returns
    -------
    str
        The final answer string from the LLM, stripped of surrounding
        whitespace.

    Raises
    ------
    ValueError
        If ``question`` is empty.
    EnvironmentError
        If ``GROQ_API_KEY`` is not configured (propagated from groq_client).
    """
    if not question or not question.strip():
        raise ValueError("'question' must be a non-empty string.")

    question = question.strip()

    # ── Stage 1 · Retrieve ───────────────────────────────────────────────────
    print(f"\n[PitWall] Question: {question!r}")
    print("[PitWall] Stage 1 — Retrieving relevant chunks …")

    chunks: list[dict[str, Any]] = retrieve(
        query=question,
        collections=collections,
        top_k=top_k,
        distance_threshold=distance_threshold,
    )

    # Print a per-collection breakdown so the caller can see what was found.
    counts: Counter[str] = Counter(c["collection"] for c in chunks)
    target = collections if collections is not None else ALL_COLLECTIONS
    for col in target:
        n = counts.get(col, 0)
        print(f"           {col:>8}: {n} chunk(s) retrieved")
    print(f"           {'total':>8}: {len(chunks)} chunk(s) retrieved")

    # ── Stage 2 · Build prompt ───────────────────────────────────────────────
    print("[PitWall] Stage 2 — Building prompt …")

    prompts: dict[str, str] = build_prompt(
        question=question,
        chunks=chunks,
    )

    # ── Stage 3 · Generate ───────────────────────────────────────────────────
    print(f"[PitWall] Stage 3 — Querying Groq ({model}) …")

    answer: str = ask_groq(
        system_prompt=prompts["system"],
        user_prompt=prompts["user"],
        model=model,
        max_tokens=max_tokens,
    )

    print("[PitWall] Done.\n")
    return answer


# ── Smoke test ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== rag.py smoke test ===\n")

    test_question = "What tyre compound was Verstappen on during his fastest lap?"

    try:
        result = ask(test_question)
        print("── Answer ─────────────────────────────────────────────────────")
        print(result)
    except EnvironmentError as exc:
        print(f"[CONFIG ERROR] {exc}")
    except Exception as exc:
        print(f"[ERROR] {type(exc).__name__}: {exc}")
        raise
