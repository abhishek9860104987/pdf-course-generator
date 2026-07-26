# AI PDF to E-Course Learning Platform

A production-ready full-stack application that transforms PDF documents into interactive, AI-powered learning courses.

## Features

- **PDF Upload & Processing**: Upload any PDF and automatically convert it into a structured course
- **AI-Powered Course Generation**: Uses LLM to generate chapters, lessons, and quizzes
- **Interactive Learning**: Beautiful course viewer with markdown rendering and syntax highlighting
- **AI Chatbot**: Ask questions about course content with RAG-powered responses
- **Quiz System**: Auto-generated quizzes with multiple question types
- **Progress Tracking**: Track lesson completion, learning time, and overall progress
- **Authentication**: Email/password and Google OAuth with JWT tokens
- **Dashboard**: Comprehensive analytics and learning statistics

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite
- TailwindCSS
- shadcn/ui components
- React Router
- TanStack Query
- React Hook Form with Zod validation
- Framer Motion animations
- Recharts for analytics

### Backend
- Python FastAPI
- SQLAlchemy ORM
- PostgreSQL database
- JWT Authentication
- PyMuPDF & pdfplumber for PDF processing
- SentenceTransformers for embeddings
- FAISS for vector search
- Groq API for AI generation

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   ├── auth/          # Authentication
│   │   ├── ai/            # AI integration
│   │   ├── rag/           # RAG implementation
│   │   └── config/        # Configuration
│   └── requirements.txt
```

## Quick Start with Docker

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd e-course-learning-platform

# Create .env file
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Update environment variables with your API keys

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Manual Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Update .env with your API URL
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Update .env with your database and API keys
```

### Database Setup

```bash
# Create PostgreSQL database
createdb courseai

# Run migrations
alembic upgrade head
```

### Running the Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/courseai
SECRET_KEY=your-secret-key-here
GROQ_API_KEY=your-groq-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development Phases

### ✅ Phase 1: Project Setup
- Folder structure
- Frontend configuration
- Backend configuration
- Database models

### ✅ Phase 2: Authentication
- User registration
- Login/logout
- JWT tokens
- Google OAuth

### ✅ Phase 3: Database
- Migrations
- Repository pattern

### ✅ Phase 4: PDF Upload
- File upload endpoint
- PDF processing
- Validation

### ✅ Phase 5: AI Course Generation
- AI integration
- Course structure
- Lesson generation

### ✅ Phase 6: RAG Implementation
- Vector embeddings
- FAISS integration
- Semantic search

### ✅ Phase 7: AI Chatbot
- Streaming responses
- Conversation memory
- RAG-powered answers

### ✅ Phase 8: Quiz System
- Quiz generation
- Question types
- Scoring system

### ✅ Phase 9: Dashboard
- Analytics
- Progress tracking
- Statistics

### ✅ Phase 10: Deployment
- Docker configuration
- Docker Compose
- Deployment guide

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deployment Options

1. **Docker Compose** (Local/Development)
   ```bash
   docker-compose up -d
   ```

2. **Render + Vercel** (Production)
   - Backend: Render.com
   - Frontend: Vercel.com
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for details

3. **AWS** (Enterprise)
   - EC2 for backend
   - RDS for database
   - CloudFront for CDN
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for details

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### PDF Upload
- `POST /api/upload` - Upload PDF
- `GET /api/upload/pdfs` - Get user PDFs
- `GET /api/upload/pdf/{id}/content` - Get PDF content
- `DELETE /api/upload/pdf/{id}` - Delete PDF

### Courses
- `POST /api/course/generate` - Generate course from PDF
- `GET /api/course/{id}` - Get course details
- `GET /api/course/` - Get all user courses
- `GET /api/course/search` - Search courses

### Chat
- `POST /api/chat/` - Send message
- `POST /api/chat/stream` - Send message (streaming)
- `GET /api/chat/{course_id}` - Get chat history
- `GET /api/chat/{course_id}/suggestions` - Get suggested questions

### Quiz
- `GET /api/quiz/{course_id}` - Get/generate quiz
- `POST /api/quiz/{course_id}/submit` - Submit quiz answers
- `GET /api/quiz/{course_id}/attempts` - Get quiz attempts

### Progress
- `POST /api/progress/` - Update progress
- `GET /api/progress/{course_id}` - Get course progress
- `GET /api/progress/` - Get all progress




It is designed as an AI-powered PDF to E-Course Learning Platform. Here is exactly where and how Generative AI is used within the codebase:

1. Course Outline & Lesson Generation (course_generation_service.py)
What it does: When a user uploads a PDF (like a textbook or research paper), the system processes the raw text.
Where AI is used: It calls the Groq API (configured in groq_client.py using LLM models like Llama 3) to dynamically write structured educational courses. It generates:
Course titles, descriptions, and difficulty levels.
Modular chapters.
Deep-dive lesson contents and key takeaways directly derived from the uploaded PDF text.
2. Auto-Generating Interactive Quizzes (quiz_service.py)
What it does: To test user knowledge, the platform offers quizzes for each course.
Where AI is used: It leverages Groq's LLMs in JSON mode to automatically create multiple-choice questions (MCQs), options, correct answers, and detailed explanations based on the generated course content.
3. AI Study Chatbot using RAG (chatbot_service.py & vector_store.py)
What it does: Users can chat with an AI assistant to clarify doubts about the uploaded course material.
Where AI is used: It uses a technique called RAG (Retrieval-Augmented Generation):
Vector Embeddings: The system uses sentence-transformers to turn PDF text into mathematical vectors.
Vector Search: It stores these vectors using a local FAISS (Facebook AI Similarity Search) index. When a user asks a question, FAISS finds the most relevant segments of the PDF.
LLM Synthesis: The retrieved PDF segments are sent as context to the Groq LLM to generate an accurate, hallucination-free response matching only the course content.
1:56 AM






### Dashboard
- `GET /api/dashboard/` - Get dashboard statistics
- `GET /api/dashboard/course/{id}/progress` - Get detailed course progress

## License

MIT
