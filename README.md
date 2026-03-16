# Document Conversation Converter - Full Stack AI Application

A production-ready full-stack AI application that converts documents (TXT/PDF) into natural conversational format using advanced language models.

## 🚀 Features

### Core Functionality
- **Document Upload**: Support for TXT and PDF files
- **AI-Powered Analysis**: Automatic document summarization and analysis
- **Conversation Generation**: Convert documents into engaging dialogues
- **User Management**: Secure authentication and user accounts
- **Database Storage**: Persistent storage of documents and conversations

### Technical Features
- **FastAPI Backend**: High-performance async API
- **React Frontend**: Modern, responsive user interface
- **SQLAlchemy ORM**: Robust database management
- **Groq AI Integration**: State-of-the-art language model
- **File Upload**: Secure file handling with validation
- **Real-time Processing**: Async document processing

## 🏗️ Architecture

```
├── backend/                 # FastAPI backend
│   ├── main.py             # Main API application
│   ├── config.py           # Configuration settings
│   ├── auth/               # Authentication modules
│   ├── db/                 # Database models and CRUD
│   ├── llm/                # AI/LLM integration
│   └── ingest/             # Document processing
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   └── App.tsx         # Main application
├── uploads/                # User uploaded files
├── vector_store/           # AI embeddings storage
└── docs/                   # Documentation storage
```

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- SQLite (default) or PostgreSQL/MySQL

### Backend Setup

1. **Clone and navigate to backend:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your API keys
```

5. **Initialize database:**
```bash
python ../init_db.py
```

### Frontend Setup

1. **Navigate to frontend:**
```bash
cd ../frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
```

### Production Setup

1. **Backend production:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

2. **Frontend production:**
```bash
cd frontend
npm run build
# Serve build/ directory with nginx/apache
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Database
DATABASE_URL=sqlite:///./prod.db

# AI API Keys
GROQ_API_KEY=your-groq-api-key-here

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB

# Security
SECRET_KEY=your-secret-key-here
```

### Database Configuration

The application supports multiple databases:

- **SQLite** (default): `sqlite:///./app.db`
- **PostgreSQL**: `postgresql://user:password@localhost/dbname`
- **MySQL**: `mysql://user:password@localhost/dbname`

## 📊 Database Schema

### Tables

- **users**: User accounts and authentication
- **documents**: Uploaded document metadata
- **conversations**: Generated conversation metadata
- **conversation_messages**: Individual conversation messages
- **qa_logs**: Question-answer history (RAG feature)

### Key Relationships

```
User (1) ──── (N) Document
User (1) ──── (N) Conversation
Document (1) ── (N) Conversation
Conversation (1) ── (N) ConversationMessage
```

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /login` - User login

### Document Management
- `POST /upload-document` - Upload document file
- `POST /process-document/{id}` - Process document to conversation

### Conversation Management
- `GET /conversations` - List user conversations
- `GET /conversation/{id}` - Get conversation details

### Legacy RAG (Optional)
- `POST /ask` - Question answering with RAG

## 🎨 Frontend Features

### User Interface
- **Login/Register**: Secure authentication
- **File Upload**: Drag-and-drop file upload with validation
- **Conversation List**: Browse generated conversations
- **Conversation View**: Detailed conversation with summary/analysis
- **Responsive Design**: Mobile-friendly interface

### Components
- `Login.tsx` - Authentication forms
- `DocumentUpload.tsx` - File upload interface
- `ConversationList.tsx` - Conversation browsing
- `ConversationView.tsx` - Detailed conversation display

## 🤖 AI Processing Pipeline

1. **Document Upload**: File validation and storage
2. **Text Extraction**: PDF/TXT content extraction
3. **AI Analysis**: Groq-powered summarization and analysis
4. **Conversation Generation**: Natural dialogue creation
5. **Database Storage**: Persistent conversation storage
6. **Frontend Display**: Interactive conversation viewing

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **File Validation**: Type and size restrictions
- **Input Sanitization**: Safe file handling
- **CORS Protection**: Configured cross-origin policies
- **Password Hashing**: Secure password storage

## 📈 Performance Optimization

- **Async Processing**: Non-blocking document processing
- **Database Indexing**: Optimized queries
- **File Caching**: Efficient file serving
- **Connection Pooling**: Database connection management

## 🚀 Deployment

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment

- **Backend**: Deploy to Railway, Render, or AWS Lambda
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3
- **Database**: Use managed services (PlanetScale, Supabase, etc.)

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Manual Testing
1. Register/login user
2. Upload TXT/PDF document
3. Process document
4. View generated conversation

## 📝 Usage Examples

### Upload and Process Document

```python
import requests

# Upload file
files = {'file': open('document.pdf', 'rb')}
headers = {'Authorization': f'Bearer {token}'}
response = requests.post('http://localhost:8000/upload-document',
                        files=files, headers=headers)

# Process document
doc_id = response.json()['document_id']
requests.post(f'http://localhost:8000/process-document/{doc_id}',
             headers=headers)
```

### Get Conversations

```python
response = requests.get('http://localhost:8000/conversations',
                       headers=headers)
conversations = response.json()
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: This README
- **API Docs**: http://localhost:8000/docs (when running)

---

**Built with**: FastAPI, React, SQLAlchemy, Material-UI, Groq AI
