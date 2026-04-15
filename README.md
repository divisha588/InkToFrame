# InkToFrame

Full-stack FastAPI website with:
- Homepage with upload + login/signup icons
- Login/Signup page
- Document upload + conversion endpoint
- Anonymous users can convert one document; second use requires login

## Run locally

From the **repository root**:

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

If you are inside the `backend/` directory, this now also works:

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

(Alternative from inside `backend/`: `uvicorn main:app --reload --port 8000`.)

Open `http://localhost:8000`.
