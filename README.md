# PitWall

Multi-agent F1 race strategy assistant — a FastAPI + RAG backend (FastF1 data, ChromaDB,
Groq-hosted LLM) paired with a React/Vite frontend.

## Project layout

- `api/` — FastAPI app (`api.main:app`) that the frontend talks to.
- `agents/` — orchestrator + specialist agents (tyre, weather, radio, rivals, circuit).
- `utils/` — RAG plumbing: chunking, embedding, ChromaDB (`vectorstore/`) and SQLite
  (`data/pitwall.db`) access.
- `ingest/` — offline scripts that fetch FastF1/weather/radio data and populate
  `data/` and `vectorstore/`. Not required at runtime — the API only reads the
  already-built data.
- `frontend/` — React + Vite + Tailwind app.
- `app.py` — legacy Streamlit UI, superseded by `frontend/`.

## Local development

### Backend

```bash
python -m venv venv
./venv/Scripts/activate        # source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env           # fill in GROQ_API_KEY at minimum
uvicorn api.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local     # VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

## Deployment

The backend deploys to **Render**, the frontend to **Vercel**. Deploy the backend
first so you have its URL for the frontend's env var.

### Backend → Render

A `render.yaml` blueprint is included at the repo root — in the Render dashboard,
choose **New → Blueprint** and point it at this repo, or configure a Web Service
manually with:

- **Build command**: `pip install -r requirements-api.txt`
  (a slimmed-down dependency set — see the comment at the top of that file;
  use `requirements.txt` instead only if you also need the ingest scripts to run
  on the server)
- **Start command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT`
- **Environment variables**:
  - `GROQ_API_KEY` (required) — Groq API key used for all LLM calls
  - `CORS_ORIGINS` (optional) — comma-separated list of allowed origins,
    e.g. `https://your-app.vercel.app`. Defaults to `*`.
  - `PYTHON_VERSION` — `3.12.4` (set in `render.yaml` already)

The vector store (`vectorstore/`) and SQLite DB (`data/pitwall.db`) are committed
to the repo, so no seeding step is needed — Render's build just installs
dependencies and starts the server. To refresh the underlying F1 data, run the
`ingest/` scripts locally and commit the updated `data/` and `vectorstore/`
directories.

### Frontend → Vercel

Import the repo in Vercel and set:

- **Root Directory**: `frontend`
- **Framework Preset**: Vite (auto-detected)
- **Build command** / **Output directory**: defaults (`npm run build` / `dist`)
- **Environment variable**: `VITE_API_BASE_URL` = your Render backend URL
  (e.g. `https://pitwall-api.onrender.com`)

`frontend/vercel.json` adds the SPA rewrite needed for client-side routing
(`react-router-dom`'s `BrowserRouter`) so deep links like `/races/2025/8` don't
404 on refresh.

Optional: `VITE_F1DASH_URL` if you're also running the local `f1-dash` live
telemetry container and want the Live Map to point somewhere other than
`http://localhost:3000`.
