TRD (Technical Requirements Document)
1. Frontend Stack
Technology	Purpose
React + Vite	Frontend framework
Tailwind CSS	Styling
Framer Motion	Animations
Axios	API calls
React Router DOM	Routing
2. Backend Stack
Technology	Purpose
FastAPI	Backend framework
Python	Core language
Uvicorn	ASGI server
Pydantic	Data validation
3. AI Stack
Technology	Purpose
CrewAI	Multi-agent orchestration
Gemini 1.5 Flash	LLM reasoning
4. Database
Technology	Purpose
MongoDB Atlas	Workflow storage

Collections:

workflows
reviews
traces
repositories
5. GitHub Integration
Technology	Purpose
GitHub Webhooks	Event triggers
PyGithub	GitHub API integration
6. Async Execution
Technology	Purpose
BackgroundTasks	Async review workflows
7. Hosting
Component	Platform
Frontend	Vercel
Backend	Render
Database	MongoDB Atlas
8. Environment Variables
GITHUB_TOKEN=
GITHUB_WEBHOOK_SECRET=

GEMINI_API_KEY=

MONGODB_URI=
DATABASE_NAME=
9. Backend Folder Structure
backend/
├── agents/
├── routes/
├── services/
├── database/
├── models/
├── traces/
├── utils/
└── main.py
10. Frontend Folder Structure
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── routes/
│   └── App.jsx