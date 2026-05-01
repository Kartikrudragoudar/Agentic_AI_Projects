# Backend API

FastAPI backend for the Stock & Crypto Morning Brief frontend.

## Install

From `Project3/`:

```bash
pip install -r requirements.txt
```

Or from `Project3/backend/`:

```bash
pip install -r requirements.txt
```

## Run

From `Project3/`:

```bash
python main.py
```

Or:

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

The frontend calls `http://localhost:8000/api` by default. Override it with `VITE_API_URL` if needed.
