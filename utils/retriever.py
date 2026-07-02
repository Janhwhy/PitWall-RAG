"""
retriever.py
------------
Provides the ``retrieve`` function which queries one or more ChromaDB
collections (laps, weather, radio, pitstops) for chunks semantically
similar to a given natural-language query.

Workflow
--------
1. Wrap the query string in a single-element chunk list and embed it via
   ``embed_chunks`` from ``utils/embedder.py``.
2. For each requested collection, call ``collection.query`` with the
   resulting embedding vector, asking for the top 5 nearest neighbours.
3. Filter out any result whose cosine distance exceeds the threshold
   (default 0.35 — ChromaDB returns distances, not similarities, so a
   lower value means *more* similar).
4. Collect all surviving results into a flat list, tag each entry with
   the source collection name, and sort ascending by distance.

Functions
---------
retrieve(query, collections=None, top_k=5, distance_threshold=0.35)
    -> list[dict]
    Returns a list of result dicts, each with keys:
        text       – str   : the stored document text
        metadata   – dict  : metadata stored alongside the chunk
        distance   – float : cosine distance (lower = more relevant)
        collection – str   : name of the collection the result came from

Usage (standalone smoke test)
-------------------------------
    python utils/retriever.py
"""

import pathlib
import sys
from typing import Any

# ── Path bootstrap ──────────────────────────────────────────────────────────
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from utils.embedder import embed_chunks                          # local
from utils.vectorstore import (                                  # local
    get_laps_collection,
    get_weather_collection,
    get_radio_collection,
    get_pitstops_collection,
)

# ── Constants ───────────────────────────────────────────────────────────────
ALL_COLLECTIONS: list[str] = ["laps", "weather", "radio", "pitstops"]

_COLLECTION_GETTERS: dict[str, Any] = {
    "laps":     get_laps_collection,
    "weather":  get_weather_collection,
    "radio":    get_radio_collection,
    "pitstops": get_pitstops_collection,
}


# ── Public API ───────────────────────────────────────────────────────────────
def retrieve(
    query: str,
    collections: list[str] | None = None,
    top_k: int = 15,
    distance_threshold: float = 0.50,
) -> list[dict[str, Any]]:
    """
    Retrieve semantically similar chunks from one or more ChromaDB collections.

    The query is embedded with the same model used during ingestion
    (``BAAI/bge-small-en-v1.5`` via ``embed_chunks``).  Each collection is
    queried independently; results are merged, filtered, and returned sorted
    by cosine distance (ascending — closest first).

    Parameters
    ----------
    query : str
        The natural-language question or search string.
    collections : list[str] | None
        Names of collections to search.  Must be a subset of
        ``["laps", "weather", "radio", "pitstops"]``.  Defaults to all.
    top_k : int
        Maximum number of nearest-neighbour results to fetch *per collection*
        before applying the distance filter.  Defaults to 15.
    distance_threshold : float
        Maximum cosine distance (inclusive) to keep a result.
        ChromaDB's cosine distance is in ``[0, 2]``; a value of 0 means
        identical vectors.  Defaults to 0.50.

    Returns
    -------
    list of dict
        A flat, sorted list of result dicts.  Each dict contains:

        ``text``       – str   : stored document text
        ``metadata``   – dict  : metadata stored alongside the chunk
        ``distance``   – float : cosine distance from the query embedding
        ``collection`` – str   : name of the source collection

    Raises
    ------
    ValueError
        If ``query`` is empty or ``collections`` contains an unrecognised name.
    """
    if not query or not query.strip():
        raise ValueError("'query' must be a non-empty string.")

    target_collections: list[str] = collections if collections is not None else ALL_COLLECTIONS

    unknown = set(target_collections) - set(ALL_COLLECTIONS)
    if unknown:
        raise ValueError(
            f"Unknown collection name(s): {sorted(unknown)}. "
            f"Valid options are: {ALL_COLLECTIONS}"
        )

    # ── 1. Embed the query ───────────────────────────────────────────────────
    # Wrap the raw string in the standard chunk schema so embed_chunks can
    # process it.  embed_chunks adds the "embedding" key in-place.
    query_chunk: dict[str, Any] = {"text": query.strip(), "metadata": {}}
    embedded_query_list = embed_chunks([query_chunk])
    query_vector: list[float] = embedded_query_list[0]["embedding"]

    # ── 2. Query each collection ─────────────────────────────────────────────
    results: list[dict[str, Any]] = []

    for col_name in target_collections:
        getter = _COLLECTION_GETTERS[col_name]
        collection = getter()

        # Skip empty collections gracefully
        if collection.count() == 0:
            print(f"[INFO] retrieve: collection '{col_name}' is empty — skipping.")
            continue

        # Clamp top_k to the number of available documents to avoid ChromaDB errors
        n_results = min(top_k, collection.count())

        raw = collection.query(
            query_embeddings=[query_vector],
            n_results=n_results,
            include=["documents", "metadatas", "distances"],
        )

        # ChromaDB returns lists-of-lists (one inner list per query vector).
        # Since we always send exactly one query vector, we unwrap index 0.
        documents: list[str]   = raw["documents"][0]
        metadatas: list[dict]  = raw["metadatas"][0]
        distances: list[float] = raw["distances"][0]

        for text, metadata, distance in zip(documents, metadatas, distances):
            if distance <= distance_threshold:
                results.append(
                    {
                        "text":       text,
                        "metadata":   metadata,
                        "distance":   distance,
                        "collection": col_name,
                    }
                )

    # ── 3. Sort by distance ascending (closest first) ────────────────────────
    results.sort(key=lambda r: r["distance"])

    # ── 4. Diversity filter: group by race and take top 3 chunks per race ─────
    diversified_results = []
    race_counts = {}
    for r in results:
        metadata = r.get("metadata") or {}
        race = metadata.get("race", "Unknown")
        count = race_counts.get(race, 0)
        if count < 3:
            diversified_results.append(r)
            race_counts[race] = count + 1

    results = diversified_results[:15]

    print(
        f"[INFO] retrieve: query={query!r:.60} | "
        f"collections={target_collections} | "
        f"returned {len(results)} chunk(s) "
        f"(threshold={distance_threshold})"
    )

    return results


# ── Smoke test ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== retriever.py smoke test ===\n")

    test_query = "fastest lap on soft tyres"
    print(f"Query: {test_query!r}")
    print(f"Searching collections: {ALL_COLLECTIONS}\n")

    hits = retrieve(test_query)

    if not hits:
        print("[INFO] No results found within the distance threshold.")
    else:
        print(f"Found {len(hits)} result(s):\n")
        for i, hit in enumerate(hits, start=1):
            print(f"  [{i}] collection={hit['collection']!r}  "
                  f"distance={hit['distance']:.4f}")
            print(f"       text={hit['text'][:80]!r}")
            print(f"       metadata={hit['metadata']}\n")
