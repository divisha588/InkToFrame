# 🚀 InkToFrame - Complete Project Setup & Running Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Requirements](#system-requirements)
3. [Project Structure](#project-structure)
4. [Complete Setup Instructions](#complete-setup-instructions)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [API Endpoints](#api-endpoints)

---

## 📖 Project Overview

**InkToFrame** is a full-stack AI-powered application that transforms PDF and TXT documents into natural conversational format using advanced language models.

### Key Features
- 📄 Document Upload (PDF/TXT)
- 🤖 AI-Powered Analysis & Summarization
- 💬 Automatic Conversation Generation
- 👤 User Authentication & Management
- 📚 Conversation History & Retrieval
- 🔐 Secure Document Processing

### Tech Stack

**Backend:**
- FastAPI (Python)
- SQLAlchemy ORM
- Groq AI API
- Chroma Vector Database
- LangChain
- SQLite Database

**Frontend:**
- React 18 (TypeScript)
- Material-UI v5
- Axios HTTP Client
- Modern Responsive Design

---

## 💻 System Requirements

### Minimum Requirements
- **OS:** macOS, Linux, or Windows
- **Python:** 3.8+
- **Node.js:** 16+
- **npm:** 7+
- **RAM:** 4GB (8GB recommended)
- **Disk Space:** 2GB free

### External Requirements
- **Groq API Key** (free at https://console.groq.com)
- **Internet Connection** (for AI API calls)

---

## 📁 Project Structure

```
InkToFrame/
├── backend/                          # FastAPI Backend
│   ├── __init__.py
│   ├── main.py                       # Main API app
│   ├── config.py                     # Configuration
│   ├── requirements.txt              # Python dependencies
│   ├── auth/                         # Authentication
│   │   ├── confluence_auth.py
│   │   ├── dependencies.py
│   │   ├── security.py
│   │   └── __init__.py
│   ├── db/                           # Database
│   │   ├── base.py
│   │   ├── deps.py
│   │   ├── init_db.py
│   │   ├── session.py
│   │   ├── crud/                     # CRUD Operations
│   │   │   ├── __init__.py
│   │   │   ├── conversation.py
│   │   │   └── qa.py
│   │   ├── models/                   # SQLAlchemy Models
│   │   │   ├── __init__.py
│   │   │   ├── conversation.py
│   │   │   ├── qa.py
│   │   │   └── user.py
│   │   └── __init__.py
│   ├── llm/                          # AI/LLM Integration
│   │   ├── document_conversation.py
│   │   ├── prompt_templates.py
│   │   ├── qa_chain.py
│   │   └── __init__.py
│   ├── ingest/                       # Document Processing
│   │   ├── ingestion.py
│   │   ├── utils.py
│   │   ├── README.md
│   │   └── __init__.py
│   ├── retriever/                    # Vector Search
│   │   ├── retriever.py
│   │   ├── vector_store.py
│   │   └── __init__.py
│   └── __init__.py
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/               # React Components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   └── ConversationView.tsx
│   │   ├── App.tsx                   # Main App
│   │   ├── index.tsx                 # Entry Point
│   │   ├── index.css                 # Global Styles
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
├── vector_store/                     # Chroma Vector DB
│   └── chroma.sqlite3
│
├── uploads/                          # Uploaded Documents
│
├── init_db.py                        # Database Initialization
├── start.sh                          # Startup Script
├── README.md                         # Main README
├── DOCUMENT_CONVERSATION_README.md   # Feature Documentation
└── FRONTEND_SETUP.md                 # Frontend Setup Guide
```

---

## ⚙️ Complete Setup Instructions

### Step 1: Backend Setup

#### 1.1 Navigate to Backend
```bash
cd backend
```

#### 1.2 Create Python Virtual Environment
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

#### 1.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

**Required Packages:**
- fastapi
- uvicorn
- sqlalchemy
- alembic
- python-multipart
- PyPDF2
- unstructured[pdf]
- langchain
- langchain-community
- langchain-openai
- chromadb
- sentence-transformers
- python-dotenv
- tiktoken
- argon2-cffi
- markdown
- groq

#### 1.4 Set Environment Variables
```bash
# macOS/Linux
export GROQ_API_KEY="your-groq-api-key-here"
export UPLOAD_DIR="uploads"
export BASE_DOCS_PATH="docs"
export VECTOR_STORE_PATH="vector_store"

# Windows (Command Prompt)
set GROQ_API_KEY=your-groq-api-key-here
set UPLOAD_DIR=uploads
set BASE_DOCS_PATH=docs
set VECTOR_STORE_PATH=vector_store

# Windows (PowerShell)
$env:GROQ_API_KEY="your-groq-api-key-here"
```

**Or create a `.env` file:**
```
GROQ_API_KEY=your-groq-api-key-here
DATABASE_URL=sqlite:///./test.db
UPLOAD_DIR=uploads
BASE_DOCS_PATH=docs
VECTOR_STORE_PATH=vector_store
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
CHUNK_SIZE=1000
CHUNK_OVERLAP=100
TOP_K=5
ALLOWED_EXTENSIONS=txt,pdf
MAX_FILE_SIZE=52428800
```

### Step 2: Initialize Database

```bash
# From project root
python init_db.py
```

This creates:
- SQLite database
- All required tables (Users, Conversations, Q&A Logs)
- Default schema

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend
```bash
cd frontend
```

#### 3.2 Install Node Dependencies
```bash
npm install
```

#### 3.3 (Optional) Create `.env` for Frontend
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

---

## 🏃 Running the Application

### Option 1: Run Backend Only (for API testing)

```bash
cd backend
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Access:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs (Swagger UI)
- ReDoc: http://localhost:8000/redoc

---

### Option 2: Run Frontend Only (for UI testing)

```bash
cd frontend
npm start
```

**Terminal Output:**
```
webpack compiled...
On Your Network: http://192.168.x.x:3000
Compiled successfully!

You can now view document-conversation-frontend in the browser.
```

**Access:**
- Frontend: http://localhost:3000

---

### Option 3: Run Full Application (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Or use the provided script:**
```bash
# macOS/Linux
chmod +x start.sh
./start.sh

# Windows
start.sh
```

---

## 🎯 First Test Run

### 1. Open Application
- Open browser to http://localhost:3000
- You should see the **InkToFrame** homepage

### 2. Test Homepage
- View the landing page with features and call-to-actions
- Click "Upload Document" or "Login / Sign Up"

### 3. Create Account
- Click "Sign Up" tab in modal
- Enter email: `test@example.com`
- Enter password: `TestPassword123`
- Click "Create Account"
- Auto-redirects to upload page

### 4. Login
- Email: `test@example.com`
- Password: `TestPassword123`
- Click "Sign In"

### 5. Upload & Convert Document
- Download or create a test document (**dummy_document.txt** provided)
- Drag & drop to upload area or click "Choose File"
- Click "Convert to Conversation"
- Wait for processing (30-60 seconds)
- View generated summary, analysis, and conversation

### 6. View History
- Click "History" button
- See list of past conversions
- Click on a conversation to view full details
- Download conversation as TXT file

---

## 🗂️ Important Directories

### Backend Directories
```
backend/
├── uploads/          # User uploaded files
├── docs/             # Document base path
└── vector_store/     # Chroma vector database
```

### Create if Missing
```bash
mkdir -p backend/uploads
mkdir -p backend/docs
mkdir -p backend/vector_store
```

---

## 📊 API Endpoints Reference

### Authentication
- `POST /auth/register` - Create account
- `POST /login` - User login

### Documents
- `POST /upload-document` - Upload file
- `POST /convert-document` - Convert to conversation

### Conversations
- `GET /conversations` - List all conversations
- `GET /conversation/{id}` - Get conversation details
- `DELETE /conversation/{id}` - Delete conversation

### Q&A (if RAG enabled)
- `POST /ask` - Ask question about documents
- `GET /qa-history` - Get Q&A history

### System
- `GET /` - Health check
- `GET /docs` - Swagger documentation
- `GET /redoc` - ReDoc documentation

---

## 🐛 Troubleshooting

### Backend Issues

**1. "ModuleNotFoundError" or import errors**
```bash
# Re-install dependencies
pip install --upgrade -r requirements.txt

# Verify Python version
python --version
```

**2. "GROQ_API_KEY not set"**
```bash
# Verify environment variable
echo $GROQ_API_KEY  # macOS/Linux
echo %GROQ_API_KEY%  # Windows

# Or create .env file in backend/
GROQ_API_KEY=your-key-here
```

**3. Database errors**
```bash
# Reinitialize database
rm -f test.db
python init_db.py
```

**4. "Port 8000 already in use"**
```bash
# Use different port
uvicorn main:app --port 8001

# Or kill process on port 8000
lsof -i :8000
kill -9 <PID>
```

### Frontend Issues

**1. "npm ERR! Cannot find module"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. "Cannot connect to backend"**
```bash
# Verify backend is running
curl http://localhost:8000/

# Check firewall/network settings
# Verify API URL in Network tab (DevTools)
```

**3. "Port 3000 already in use"**
```bash
# Use different port
PORT=3001 npm start

# Or kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

**4. White screen or build errors**
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (macOS)

# Check console for errors (F12)
# Verify Node version
node --version
```

### Common Issues

**"CORS Error"**
- Backend CORS is configured to allow all origins
- Check browser network tab for actual error
- Ensure backend is running on port 8000

**"File upload fails"**
- Check file size (max 50MB)
- Verify file format (PDF or TXT)
- Check backend logs for details

**"Conversation not generating"**
- Verify Groq API key is valid and has remaining quota
- Check internet connection
- Review backend logs for API errors

---

## 📝 .env Configuration Reference

### Backend .env
```
# Database
DATABASE_URL=sqlite:///./test.db

# API Keys
GROQ_API_KEY=your-groq-api-key

# File Handling
UPLOAD_DIR=uploads
BASE_DOCS_PATH=docs
UPLOAD_FOLDER=backend/uploads
MAX_FILE_SIZE=52428800

# Vector Store
VECTOR_STORE_PATH=vector_store
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Processing
CHUNK_SIZE=1000
CHUNK_OVERLAP=100
TOP_K=5

# File Validation
ALLOWED_EXTENSIONS=txt,pdf
```

### Frontend .env
```
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Environment
REACT_APP_ENV=development
```

---

## 📱 Testing with Sample Document

**Sample provided:** `dummy_document.txt`

Contains comprehensive information about:
- Artificial Intelligence fundamentals
- Machine Learning concepts
- Python programming guide

**To test:**
1. Navigate to upload page
2. Select `dummy_document.txt`
3. Click "Convert to Conversation"
4. Review generated output

---

## 🔐 Security Notes

- Never commit `.env` files with API keys
- Always use HTTPS in production
- Rotate Groq API keys regularly
- Implement rate limiting for production
- Use environment variables for sensitive data
- Keep dependencies updated

---

## 📚 Additional Resources

- [Backend Setup Details](backend/README.md) - if exists
- [Frontend Setup Details](FRONTEND_SETUP.md)
- [Document Conversation Feature](DOCUMENT_CONVERSATION_README.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)

---

## 🎉 You're Ready!

Your InkToFrame application is now set up and ready to use. Start with:

1. **Backend:** `cd backend && source venv/bin/activate && uvicorn main:app --reload`
2. **Frontend:** `cd frontend && npm start`
3. **Open:** http://localhost:3000

Happy document converting! 🚀

---

## 📞 Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review backend/frontend logs
3. Check browser DevTools (F12)
4. Verify all prerequisites are installed
5. Ensure environment variables are set correctly

Last Updated: April 15, 2026
