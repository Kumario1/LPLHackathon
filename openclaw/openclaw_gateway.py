from openclaw.config import OPENCLAW_HOST, OPENCLAW_PORT
from openclaw.server import app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("openclaw.openclaw_gateway:app", host=OPENCLAW_HOST, port=OPENCLAW_PORT, reload=False)
