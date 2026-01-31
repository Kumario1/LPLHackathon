# Transition OS Backend

FastAPI application serving as the core logic for Transition OS.

## Setup

1.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run locally**:
    ```bash
    uvicorn backend.main:app --reload
    ```

## API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Database

The project uses SQLAlchemy.
- **Init DB**: `python backend/init_db.py`
- **Seed DB**: `python backend/seed_db.py`

## Testing

Run tests with `pytest`:
```bash
pytest
```
