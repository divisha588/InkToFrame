"""Compatibility ASGI entrypoint.

This allows the command `uvicorn backend.main:app` to work even when the
current working directory is `backend/`.
"""

import sys
from pathlib import Path

PARENT_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(PARENT_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(PARENT_BACKEND_DIR))

from main import app  # noqa: E402
