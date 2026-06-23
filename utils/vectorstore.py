"""
vectorstore.py
--------------
Initialises a persistent ChromaDB client storing data in the vectorstore/ folder.
Provides utility functions to get or create collections for laps, weather, and radio,
as well as ingestion helpers load_laps, load_weather, load_radio, and load_all.

Functions
---------
get_laps_collection() -> chromadb.Collection
    Returns the 'laps' collection, creating it if it doesn't exist.
get_weather_collection() -> chromadb.Collection
    Returns the 'weather' collection, creating it if it doesn't exist.
get_radio_collection() -> chromadb.Collection
    Returns the 'radio' collection, creating it if it doesn't exist.
get_pitstops_collection() -> chromadb.Collection
    Returns the 'pitstops' collection, creating it if it doesn't exist.
load_laps(chunks: list[dict]) -> int
    Loads embedded lap chunk dictionaries into the 'laps' collection, skipping duplicates.
    Returns the number of loaded chunks.
load_weather(chunks: list[dict]) -> int
    Loads embedded weather chunk dictionaries into the 'weather' collection, skipping duplicates.
    Returns the number of loaded chunks.
load_radio(chunks: list[dict]) -> int
    Loads embedded radio chunk dictionaries into the 'radio' collection, skipping duplicates.
    Returns the number of loaded chunks.
load_pitstops(chunks: list[dict]) -> int
    Loads embedded pitstop chunk dictionaries into the 'pitstops' collection, skipping duplicates.
    Returns the number of loaded chunks.
load_all(laps_csv=None, weather_csv=None, radio_dir=None, pitstops_csv=None) -> None
    Chunks, embeds, and loads all laps, weather, radio, and pitstop data.
    Prints a summary of loaded chunks.

Usage
-----
    from utils.vectorstore import load_all
    load_all()
"""

import pathlib
import sys
import chromadb
from chromadb.utils import embedding_functions

# ── Paths ──────────────────────────────────────────────────────────────────
ROOT_DIR = pathlib.Path(__file__).resolve().parent.parent
DB_PATH = str(ROOT_DIR / "vectorstore")

# ── Embedding Function Config ──────────────────────────────────────────────
# Attempt to import default model from embedder config to keep them in sync.
try:
    # Add root to sys.path in case this file is run or imported from deep paths
    if str(ROOT_DIR) not in sys.path:
        sys.path.insert(0, str(ROOT_DIR))
    from utils.embedder import DEFAULT_MODEL, embed_chunks
except ImportError:
    DEFAULT_MODEL = "BAAI/bge-small-en-v1.5"
    # Fallback placeholder if embedder is not found/run directly in isolation
    def embed_chunks(chunks, **kwargs):
        for c in chunks:
            if "embedding" not in c:
                c["embedding"] = [0.0] * 384
        return chunks

# Use the sentence-transformers model configured in embedder.py
default_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=DEFAULT_MODEL
)

# ── Persistent Client Initialisation ───────────────────────────────────────
client = chromadb.PersistentClient(path=DB_PATH)


def get_laps_collection(embedding_function=default_ef):
    """
    Get or create the 'laps' collection from ChromaDB.

    Parameters
    ----------
    embedding_function : Optional[EmbeddingFunction]
        The embedding function to use. Defaults to the sentence-transformers model
        configured in embedder.py. Pass None to use Chroma's default.

    Returns
    -------
    chromadb.Collection
        The retrieved or newly created laps collection.
    """
    return client.get_or_create_collection(
        name="laps",
        embedding_function=embedding_function
    )


def get_weather_collection(embedding_function=default_ef):
    """
    Get or create the 'weather' collection from ChromaDB.

    Parameters
    ----------
    embedding_function : Optional[EmbeddingFunction]
        The embedding function to use. Defaults to the sentence-transformers model
        configured in embedder.py. Pass None to use Chroma's default.

    Returns
    -------
    chromadb.Collection
        The retrieved or newly created weather collection.
    """
    return client.get_or_create_collection(
        name="weather",
        embedding_function=embedding_function
    )


def get_pitstops_collection(embedding_function=default_ef):
    """
    Get or create the 'pitstops' collection from ChromaDB.

    Parameters
    ----------
    embedding_function : Optional[EmbeddingFunction]
        The embedding function to use. Defaults to the sentence-transformers model
        configured in embedder.py. Pass None to use Chroma's default.

    Returns
    -------
    chromadb.Collection
        The retrieved or newly created pitstops collection.
    """
    return client.get_or_create_collection(
        name="pitstops",
        embedding_function=embedding_function
    )


def get_radio_collection(embedding_function=default_ef):
    """
    Get or create the 'radio' collection from ChromaDB.

    Parameters
    ----------
    embedding_function : Optional[EmbeddingFunction]
        The embedding function to use. Defaults to the sentence-transformers model
        configured in embedder.py. Pass None to use Chroma's default.

    Returns
    -------
    chromadb.Collection
        The retrieved or newly created radio collection.
    """
    return client.get_or_create_collection(
        name="radio",
        embedding_function=embedding_function
    )


def load_laps(chunks: list[dict[str, any]]) -> int:
    """
    Load embedded lap chunk dictionaries into the laps ChromaDB collection.
    Uses driver name + lap number as a unique ID formatted as "VER_lap32".
    Skips any chunks that already exist in the collection to avoid duplicates.
    Prints how many chunks were loaded when done.

    Parameters
    ----------
    chunks : list of dict
        Each dict must have:
          - "text" : str (the document text)
          - "metadata" : dict (must contain "driver" and "lap_number")
          - "embedding" : list of float

    Returns
    -------
    int
        The number of chunks actually loaded into the collection.
    """
    if not chunks:
        print("Loaded 0 chunks.")
        return 0

    collection = get_laps_collection()

    # 1. Map chunks to unique IDs
    valid_chunks = []
    ids = []
    for chunk in chunks:
        metadata = chunk.get("metadata", {})
        driver = metadata.get("driver")
        lap_num = metadata.get("lap_number")
        if driver is not None and lap_num is not None:
            chunk_id = f"{driver}_lap{lap_num}"
            ids.append(chunk_id)
            valid_chunks.append((chunk_id, chunk))

    if not valid_chunks:
        print("Loaded 0 chunks.")
        return 0

    # 2. Check which IDs already exist in the collection to avoid duplicates
    existing_ids = set()
    try:
        existing_res = collection.get(ids=ids)
        if existing_res and "ids" in existing_res:
            existing_ids = set(existing_res["ids"])
    except Exception:
        pass

    # 3. Filter out chunks that already exist
    to_add_ids = []
    to_add_embeddings = []
    to_add_metadatas = []
    to_add_documents = []

    for chunk_id, chunk in valid_chunks:
        if chunk_id not in existing_ids:
            to_add_ids.append(chunk_id)
            to_add_embeddings.append(chunk["embedding"])
            to_add_metadatas.append(chunk["metadata"])
            to_add_documents.append(chunk["text"])

    # 4. Add the new chunks to ChromaDB
    if to_add_ids:
        collection.add(
            ids=to_add_ids,
            embeddings=to_add_embeddings,
            metadatas=to_add_metadatas,
            documents=to_add_documents
        )

    print(f"Loaded {len(to_add_ids)} chunks.")
    return len(to_add_ids)


def load_weather(chunks: list[dict[str, any]]) -> int:
    """
    Load embedded weather chunk dictionaries into the weather ChromaDB collection.
    Uses "weather_window_0" style IDs, where 0 is the window_start metadata field.
    Skips any chunks that already exist in the collection to avoid duplicates.
    Prints how many chunks were loaded when done.

    Parameters
    ----------
    chunks : list of dict
        Each dict must have:
          - "text" : str (the document text)
          - "metadata" : dict (must contain "window_start")
          - "embedding" : list of float

    Returns
    -------
    int
        The number of chunks actually loaded into the collection.
    """
    if not chunks:
        print("Loaded 0 chunks.")
        return 0

    collection = get_weather_collection()

    # 1. Map chunks to unique IDs
    valid_chunks = []
    ids = []
    for chunk in chunks:
        metadata = chunk.get("metadata", {})
        window_start = metadata.get("window_start")
        if window_start is not None:
            chunk_id = f"weather_window_{window_start}"
            ids.append(chunk_id)
            valid_chunks.append((chunk_id, chunk))

    if not valid_chunks:
        print("Loaded 0 chunks.")
        return 0

    # 2. Check which IDs already exist in the collection to avoid duplicates
    existing_ids = set()
    try:
        existing_res = collection.get(ids=ids)
        if existing_res and "ids" in existing_res:
            existing_ids = set(existing_res["ids"])
    except Exception:
        pass

    # 3. Filter out chunks that already exist
    to_add_ids = []
    to_add_embeddings = []
    to_add_metadatas = []
    to_add_documents = []

    for chunk_id, chunk in valid_chunks:
        if chunk_id not in existing_ids:
            to_add_ids.append(chunk_id)
            to_add_embeddings.append(chunk["embedding"])
            to_add_metadatas.append(chunk["metadata"])
            to_add_documents.append(chunk["text"])

    # 4. Add the new chunks to ChromaDB
    if to_add_ids:
        collection.add(
            ids=to_add_ids,
            embeddings=to_add_embeddings,
            metadatas=to_add_metadatas,
            documents=to_add_documents
        )

    print(f"Loaded {len(to_add_ids)} chunks.")
    return len(to_add_ids)


def load_radio(chunks: list[dict[str, any]]) -> int:
    """
    Load embedded radio chunk dictionaries into the radio ChromaDB collection.
    Uses filename + line/chunk index as ID like "monaco_2025_radio_0".
    Skips any chunks that already exist in the collection to avoid duplicates.
    Prints how many chunks were loaded when done.

    Parameters
    ----------
    chunks : list of dict
        Each dict must have:
          - "text" : str (the document text)
          - "metadata" : dict (must contain "filename")
          - "embedding" : list of float

    Returns
    -------
    int
        The number of chunks actually loaded into the collection.
    """
    if not chunks:
        print("Loaded 0 chunks.")
        return 0

    collection = get_radio_collection()

    # 1. Map chunks to unique IDs using a sequential counter per filename to handle multiple files safely
    valid_chunks = []
    ids = []
    filename_counters = {}
    for chunk in chunks:
        metadata = chunk.get("metadata", {})
        filename = metadata.get("filename", "radio")
        if filename not in filename_counters:
            filename_counters[filename] = 0
        idx = filename_counters[filename]
        filename_counters[filename] += 1

        chunk_id = f"{filename}_{idx}"
        ids.append(chunk_id)
        valid_chunks.append((chunk_id, chunk))

    if not valid_chunks:
        print("Loaded 0 chunks.")
        return 0

    # 2. Check which IDs already exist in the collection to avoid duplicates
    existing_ids = set()
    try:
        existing_res = collection.get(ids=ids)
        if existing_res and "ids" in existing_res:
            existing_ids = set(existing_res["ids"])
    except Exception:
        pass

    # 3. Filter out chunks that already exist
    to_add_ids = []
    to_add_embeddings = []
    to_add_metadatas = []
    to_add_documents = []

    for chunk_id, chunk in valid_chunks:
        if chunk_id not in existing_ids:
            to_add_ids.append(chunk_id)
            to_add_embeddings.append(chunk["embedding"])
            to_add_metadatas.append(chunk["metadata"])
            to_add_documents.append(chunk["text"])

    # 4. Add the new chunks to ChromaDB
    if to_add_ids:
        collection.add(
            ids=to_add_ids,
            embeddings=to_add_embeddings,
            metadatas=to_add_metadatas,
            documents=to_add_documents
        )

    print(f"Loaded {len(to_add_ids)} chunks.")
    return len(to_add_ids)


def load_pitstops(chunks: list[dict[str, any]]) -> int:
    """
    Load embedded pitstop chunk dictionaries into the pitstops ChromaDB collection.
    Uses driver name + lap number as a unique ID formatted as "pit_VER_lap28".
    Skips any chunks that already exist in the collection to avoid duplicates.

    Parameters
    ----------
    chunks : list of dict
        Each dict must have:
          - "text"      : str (the document text)
          - "metadata"  : dict (must contain "driver" and "lap_number")
          - "embedding" : list of float

    Returns
    -------
    int
        The number of chunks actually loaded into the collection.
    """
    if not chunks:
        print("Loaded 0 chunks.")
        return 0

    collection = get_pitstops_collection()

    valid_chunks = []
    ids = []
    for chunk in chunks:
        metadata = chunk.get("metadata", {})
        driver   = metadata.get("driver")
        lap_num  = metadata.get("lap_number")
        if driver is not None and lap_num is not None:
            chunk_id = f"pit_{driver}_lap{lap_num}"
            ids.append(chunk_id)
            valid_chunks.append((chunk_id, chunk))

    if not valid_chunks:
        print("Loaded 0 chunks.")
        return 0

    existing_ids = set()
    try:
        existing_res = collection.get(ids=ids)
        if existing_res and "ids" in existing_res:
            existing_ids = set(existing_res["ids"])
    except Exception:
        pass

    to_add_ids        = []
    to_add_embeddings = []
    to_add_metadatas  = []
    to_add_documents  = []

    for chunk_id, chunk in valid_chunks:
        if chunk_id not in existing_ids:
            to_add_ids.append(chunk_id)
            to_add_embeddings.append(chunk["embedding"])
            to_add_metadatas.append(chunk["metadata"])
            to_add_documents.append(chunk["text"])

    if to_add_ids:
        collection.add(
            ids=to_add_ids,
            embeddings=to_add_embeddings,
            metadatas=to_add_metadatas,
            documents=to_add_documents,
        )

    print(f"Loaded {len(to_add_ids)} chunks.")
    return len(to_add_ids)


def load_all(laps_csv=None, weather_csv=None, radio_dir=None, pitstops_csv=None) -> None:
    """
    Chunks, embeds, and loads all laps, weather, radio, and pitstop data.
    Prints a summary showing total chunks loaded per collection.

    Parameters
    ----------
    laps_csv : Optional[str or Path]
        Path to the laps CSV.
    weather_csv : Optional[str or Path]
        Path to the weather CSV.
    radio_dir : Optional[str or Path]
        Directory containing radio transcripts.
    pitstops_csv : Optional[str or Path]
        Path to the pitstops CSV (default: data/laps/monaco_2025_pitstops.csv).
    """
    from utils.chunker import (
        chunk_lap_data, chunk_weather_data,
        chunk_radio_transcripts, chunk_pitstop_data,
    )

    print("\n=== Ingestion starting: load_all() ===")

    # ── 1. Chunker ───────────────────────────────────────────────────────────
    print("\n--- Chunking Data ---")
    
    lap_kwargs = {"csv_path": laps_csv} if laps_csv is not None else {}
    print(f"Chunking laps data...")
    lap_chunks = chunk_lap_data(**lap_kwargs)
    print(f"  Generated {len(lap_chunks)} lap chunks.")

    weather_kwargs = {"csv_path": weather_csv} if weather_csv is not None else {}
    print(f"Chunking weather data...")
    weather_chunks = chunk_weather_data(**weather_kwargs)
    print(f"  Generated {len(weather_chunks)} weather chunks.")

    radio_kwargs = {"transcripts_dir": radio_dir} if radio_dir is not None else {}
    print("Chunking radio data...")
    radio_chunks = chunk_radio_transcripts(**radio_kwargs)
    print(f"  Generated {len(radio_chunks)} radio chunks.")

    print("Chunking pitstop data...")
    try:
        pitstops_kwargs = {"csv_path": pitstops_csv} if pitstops_csv is not None else {}
        pitstop_chunks = chunk_pitstop_data(**pitstops_kwargs)
        print(f"  Generated {len(pitstop_chunks)} pitstop chunks.")
    except FileNotFoundError as exc:
        print(f"  [WARN] {exc} — skipping pitstops collection.")
        pitstop_chunks = []

    # ── 2. Embedder ──────────────────────────────────────────────────────────
    print("\n--- Embedding Chunks ---")
    
    print("Embedding laps...")
    lap_embedded = embed_chunks(lap_chunks)
    
    print("Embedding weather...")
    weather_embedded = embed_chunks(weather_chunks)
    
    print("Embedding radio...")
    radio_embedded = embed_chunks(radio_chunks)

    print("Embedding pitstops...")
    pitstop_embedded = embed_chunks(pitstop_chunks) if pitstop_chunks else []

    # ── 3. Loaders ───────────────────────────────────────────────────────────
    print("\n--- Loading to Vector Database ---")
    
    print("Loading laps into collection...")
    laps_loaded = load_laps(lap_embedded)

    print("Loading weather into collection...")
    weather_loaded = load_weather(weather_embedded)

    print("Loading radio into collection...")
    radio_loaded = load_radio(radio_embedded)

    print("Loading pitstops into collection...")
    pitstop_loaded = load_pitstops(pitstop_embedded) if pitstop_embedded else 0

    # ── 4. Summary ───────────────────────────────────────────────────────────
    laps_total     = get_laps_collection().count()
    weather_total  = get_weather_collection().count()
    radio_total    = get_radio_collection().count()
    pitstops_total = get_pitstops_collection().count()

    print("\n=== Ingestion Summary ===")
    print(f"Laps Collection     : Loaded {laps_loaded:4d} new, Total: {laps_total:4d}")
    print(f"Weather Collection  : Loaded {weather_loaded:4d} new, Total: {weather_total:4d}")
    print(f"Radio Collection    : Loaded {radio_loaded:4d} new, Total: {radio_total:4d}")
    print(f"Pitstops Collection : Loaded {pitstop_loaded:4d} new, Total: {pitstops_total:4d}")
    print("==========================\n")


# ── Smoke test ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=== vectorstore.py smoke test ===")
    print(f"Persistent client path: {DB_PATH}")
    print(f"Default model configured: {DEFAULT_MODEL}\n")

    # Get collections to ensure they are initialized
    laps_col = get_laps_collection()
    print(f"  [OK] Collection name: {laps_col.name}, count: {laps_col.count()}")

    weather_col = get_weather_collection()
    print(f"  [OK] Collection name: {weather_col.name}, count: {weather_col.count()}")

    radio_col = get_radio_collection()
    print(f"  [OK] Collection name: {radio_col.name}, count: {radio_col.count()}\n")

    # ── Test load_laps ──
    print("Testing load_laps...")
    mock_lap_chunks = [
        {
            "text": "Driver: VER | Lap: 32 | Compound: SOFT | Position: 1",
            "metadata": {"driver": "VER", "lap_number": 32, "source": "laps"},
            "embedding": [0.1] * 384
        },
        {
            "text": "Driver: HAM | Lap: 32 | Compound: MEDIUM | Position: 2",
            "metadata": {"driver": "HAM", "lap_number": 32, "source": "laps"},
            "embedding": [0.2] * 384
        }
    ]
    try:
        laps_col.delete(ids=["VER_lap32", "HAM_lap32"])
    except Exception:
        pass

    print("  First load (should load 2 chunks):")
    load_laps(mock_lap_chunks)
    print("  Second load (should load 0 chunks due to duplicates):")
    load_laps(mock_lap_chunks)
    try:
        laps_col.delete(ids=["VER_lap32", "HAM_lap32"])
    except Exception:
        pass

    # ── Test load_weather ──
    print("\nTesting load_weather...")
    mock_weather_chunks = [
        {
            "text": "AirTemp: 22.0°C | TrackTemp: 35.0°C",
            "metadata": {"window_start": 0, "window_end": 9, "source": "weather"},
            "embedding": [0.3] * 384
        },
        {
            "text": "AirTemp: 22.5°C | TrackTemp: 34.8°C",
            "metadata": {"window_start": 10, "window_end": 19, "source": "weather"},
            "embedding": [0.4] * 384
        }
    ]
    try:
        weather_col.delete(ids=["weather_window_0", "weather_window_10"])
    except Exception:
        pass

    print("  First load (should load 2 chunks):")
    load_weather(mock_weather_chunks)
    print("  Second load (should load 0 chunks due to duplicates):")
    load_weather(mock_weather_chunks)
    try:
        weather_col.delete(ids=["weather_window_0", "weather_window_10"])
    except Exception:
        pass

    # ── Test load_radio ──
    print("\nTesting load_radio...")
    mock_radio_chunks = [
        {
            "text": "[VER] Box this lap.",
            "metadata": {"speaker": "VER", "filename": "monaco_2025_radio", "source": "radio"},
            "embedding": [0.5] * 384
        },
        {
            "text": "[GP] Copy Max, box.",
            "metadata": {"speaker": "GP", "filename": "monaco_2025_radio", "source": "radio"},
            "embedding": [0.6] * 384
        }
    ]
    try:
        radio_col.delete(ids=["monaco_2025_radio_0", "monaco_2025_radio_1"])
    except Exception:
        pass

    print("  First load (should load 2 chunks):")
    load_radio(mock_radio_chunks)
    print("  Second load (should load 0 chunks due to duplicates):")
    load_radio(mock_radio_chunks)
    try:
        radio_col.delete(ids=["monaco_2025_radio_0", "monaco_2025_radio_1"])
    except Exception:
        pass

    print("\n[SUCCESS] All checks and load tests completed successfully.")
