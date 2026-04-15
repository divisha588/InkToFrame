"""Compatibility package for running `uvicorn backend.main:app` from inside `backend/`.

When imported from inside `backend/`, this package augments its module search
path so `backend.auth`, `backend.db`, etc. resolve from the parent directory.
"""

from pathlib import Path

_PARENT_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_PARENT_BACKEND_DIR) not in __path__:
    __path__.append(str(_PARENT_BACKEND_DIR))
