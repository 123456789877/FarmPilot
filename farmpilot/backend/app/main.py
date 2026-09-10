from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base
from app.core.config import settings
from app.api import auth, farms, fields, crops, activities, tasks, inputs, expenses, irrigation, harvests, dashboard, ai

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FarmPilot API",
    description="Intelligent Farm Operations & Crop Management SaaS - Phase 1 MVP",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(farms.router, prefix="/api/farms", tags=["Farms"])
app.include_router(fields.router, prefix="/api/fields", tags=["Fields"])
app.include_router(crops.router, prefix="/api/crops", tags=["Crop Cycles"])
app.include_router(activities.router, prefix="/api/activities", tags=["Activities"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(inputs.router, prefix="/api/inputs", tags=["Inputs"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])
app.include_router(irrigation.router, prefix="/api/irrigation", tags=["Irrigation"])
app.include_router(harvests.router, prefix="/api/harvests", tags=["Harvests"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Insights"])

@app.get("/")
def root():
    return {"message": "FarmPilot API is running", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
