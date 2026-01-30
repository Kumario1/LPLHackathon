import logging
import sys
import json
from typing import Any, Dict
from datetime import datetime

class JsonFormatter(logging.Formatter):
    """
    Formatter that outputs JSON strings after parsing the LogRecord.
    Redacts sensitive keys if found.
    """
    SENSITIVE_KEYS = {"ssn", "password", "token", "account_number", "secret"}

    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }
        
        # Add extra fields if they exist
        if hasattr(record, "request_id"):
            log_record["request_id"] = record.request_id # type: ignore

        if hasattr(record, "payload"):
            log_record["payload"] = self._redact(record.payload) # type: ignore

        if record.exc_info:
            log_record["exc_info"] = self.formatException(record.exc_info)

        return json.dumps(log_record)

    def _redact(self, data: Any) -> Any:
        if isinstance(data, dict):
            return {k: (v if k.lower() not in self.SENSITIVE_KEYS else "[REDACTED]") for k, v in data.items()}
        return data

def setup_logging(level: str = "INFO"):
    logger = logging.getLogger()
    logger.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    
    # Clear existing handlers to avoid duplicates during reloads
    logger.handlers = []
    logger.addHandler(handler)
    
    # Set level for libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    return logger
