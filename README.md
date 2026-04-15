# InkToFrame

Full-stack FastAPI website with:
- Homepage with upload + login/signup icons
- Login/Signup page
- Document upload + conversion endpoint
- Anonymous users can convert one document; second use requires login

## Run locally

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Open `http://localhost:8000`.
