import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables first
load_dotenv()

from database.mongodb import init_db
from database.seeder import seed_initial_data
from routes.api import router as api_router

# Setup logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")

app = FastAPI(
    title="PulseReview AI API",
    description="Autonomous Multi-Agent Code Review Platform Backend API",
    version="1.0.0"
)

# CORS configuration
# Allow Vite frontend (port 5173 or other local hosts) to make calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting PulseReview AI Backend...")
    # Initialize DB (which connects or falls back to JSON mock db)
    init_db()
    # Seed mock data if database is empty
    await seed_initial_data()
    logger.info("Startup sequence complete.")

@app.get("/")
async def root():
    return {
        "app": "PulseReview AI API",
        "status": "online",
        "version": "1.0.0"
    }

# Include API Router under /api
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    # Get port from environment or fallback to 8000
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Running uvicorn server on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
