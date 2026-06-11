"""
embedder.py
-----------
Generates vector embeddings for a list of text chunks using a local
sentence-transformers model — completely free, no API key required.

Default model : BAAI/bge-small-en-v1.5  (384 dims, fast on CPU, good RAG quality)
Alternative   : all-MiniLM-L6-v2        (384 dims, slightly faster)
                all-mpnet-base-v2        (768 dims, highest quality, slower)

The model weights are downloaded automatically from Hugging Face on first
run (~130 MB for bge-small) and cached in ~/.cache/huggingface/.

Functions
---------
embed_chunks(chunks, batch_size=100, model_name=DEFAULT_MODEL) -> list[dict]
    Adds an "embedding" key (list[float]) to each chunk dict in-place and
    returns the augmented list.

Requirements
------------
    sentence-transformers  (see requirements.txt)

Usage (standalone smoke test)
------------------------------
    python utils/embedder.py
"""

import os
import pathlib
import sys
from typing import Any

os.environ.setdefault("HF_HUB_DISABLE_IMPLICIT_TOKEN", "1")   # suppress HF login warning
from sentence_transformers import SentenceTransformer  # pyrefly: ignore [missing-import]

# ── Config ─────────────────────────────────────────────────────────────────
ROOT_DIR      = pathlib.Path(__file__).resolve().parent.parent
DEFAULT_MODEL = "BAAI/bge-small-en-v1.5"
DEFAULT_BATCH = 100


def embed_chunks(
    chunks: list[dict[str, Any]],
    batch_size: int = DEFAULT_BATCH,
    model_name: str = DEFAULT_MODEL,
) -> list[dict[str, Any]]:
    """
    Embed a list of chunk dicts using a local sentence-transformers model.

    Parameters
    ----------
    chunks : list of dict
        Each dict must have a ``"text"`` key (str) and a ``"metadata"`` key.
        An ``"embedding"`` key (list[float]) is added to every dict in-place.
    batch_size : int
        Number of texts encoded per batch (default: 100).
    model_name : str
        Any sentence-transformers compatible model name or local path.
        Defaults to ``BAAI/bge-small-en-v1.5``.

    Returns
    -------
    list of dict
        The same list, with ``"embedding"`` populated on every item.

    Raises
    ------
    ValueError
        If any chunk is missing the ``"text"`` key.
    """
    if not chunks:
        print("[INFO] embed_chunks: received empty list, nothing to do.")
        return chunks

    # Validate input shape early
    for i, chunk in enumerate(chunks):
        if "text" not in chunk:
            raise ValueError(
                f"Chunk at index {i} is missing the required 'text' key."
            )

    total   = len(chunks)
    batches = (total + batch_size - 1) // batch_size   # ceil division

    print(f"[INFO] Loading embedding model: {model_name!r}  "
          f"(downloading on first run ...)")
    model = SentenceTransformer(model_name)
    dims  = model.get_sentence_embedding_dimension()
    print(f"[INFO] Model ready — output dims: {dims}\n")

    print(f"[INFO] Embedding {total} chunks in {batches} batch(es) "
          f"of up to {batch_size}")

    for batch_idx in range(batches):
        start = batch_idx * batch_size
        end   = min(start + batch_size, total)
        batch = chunks[start:end]
        texts = [c["text"] for c in batch]

        print(f"  -> Batch {batch_idx + 1}/{batches}  "
              f"(chunks {start + 1}-{end} of {total}) ...")

        # encode() returns a numpy array of shape (n_texts, dims)
        embeddings = model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=False,
            normalize_embeddings=True,   # L2-normalise for cosine similarity
        )

        for chunk, vec in zip(batch, embeddings):
            chunk["embedding"] = vec.tolist()

        print(f"     [OK]  Batch {batch_idx + 1} done  (dims: {dims})")

    print(f"\n[OK] All {total} chunks embedded successfully.")
    return chunks


# ── Smoke test ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    sys.path.insert(0, str(ROOT_DIR / "utils"))
    from chunker import chunk_lap_data  # pyrefly: ignore [missing-import]

    print("=== embedder.py smoke test ===\n")

    sample_chunks = chunk_lap_data()[:5]
    print(f"[INFO] Loaded {len(sample_chunks)} sample lap chunks.\n")

    embedded = embed_chunks(sample_chunks)

    print("\n=== Results ===")
    for i, chunk in enumerate(embedded):
        vec = chunk["embedding"]
        print(f"  Chunk {i}: text={chunk['text'][:60]!r}...")
        print(f"            dims={len(vec)}, "
              f"first 3 values={[round(v, 6) for v in vec[:3]]}")
