from openclaw.config import CLAWDBOT_HOST, CLAWDBOT_PORT
from openclaw.server import app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("openclaw.clawdbot_server:app", host=CLAWDBOT_HOST, port=CLAWDBOT_PORT, reload=False)
