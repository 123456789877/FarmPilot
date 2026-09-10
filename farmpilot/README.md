# FarmPilot – Intelligent Farm Operations & Crop Management SaaS

**Phase 1 MVP** – Full-stack farm management system with real-data AI insights.

## Features

- Authentication (JWT)
- Farm & Field management
- Crop cycle tracking with growth stages
- Agricultural activity logging
- Task management (Pending / Overdue / Completed)
- Input & Expense tracking
- Irrigation records
- Harvest & revenue tracking
- Professional Dashboard with Recharts
- Profitability calculations (actual recorded data)
- **AI Farm Insights** – analyzes real farm data and returns actionable recommendations

## Tech Stack

| Layer     | Stack                                      |
|-----------|--------------------------------------------|
| Frontend  | React, Vite, TypeScript, Tailwind, Recharts|
| Backend   | Python, FastAPI, SQLAlchemy, Pydantic      |
| Database  | PostgreSQL                                 |
| Auth      | JWT + bcrypt                               |
| AI        | Gemini API (with rule-based fallback)      |

## Quick Start

### 1. Database

```bash
# Create PostgreSQL database
createdb farmpilot
# or via psql:
# CREATE DATABASE farmpilot;
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env – set DATABASE_URL and SECRET_KEY
# Optional: add GEMINI_API_KEY for live AI

# Seed demo data
python seed_data.py

# Run API
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Demo Login

```
Email:    farmer@farmpilot.com
Password: demo1234
```

Farm: **Green Valley Farm** (25 acres) with 3 fields, active crops, activities, expenses, irrigation & harvests already seeded.

## Demo Flow (Hackathon)

1. Login with demo credentials  
2. Dashboard – metrics, charts, profitability  
3. Farms → Green Valley Farm  
4. Fields → Field A/B/C  
5. Crop Cycles – see Paddy (Flowering), Tomato (Fruiting), Groundnut  
6. Add an Activity  
7. Add an Expense  
8. Add Irrigation record  
9. Record a Harvest  
10. Dashboard updates automatically  
11. Open **AI Insights** → Generate → see data-driven recommendations  

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/farmpilot
SECRET_KEY=long-random-string
GEMINI_API_KEY=optional-for-live-ai
CORS_ORIGINS=http://localhost:5173
```

If no Gemini key is set, the AI endpoint uses a smart rule-based fallback so the demo always works.

## Project Structure

```
farmpilot/
├── backend/
│   ├── app/
│   │   ├── api/          # routers
│   │   ├── models/       # SQLAlchemy
│   │   ├── schemas/      # Pydantic
│   │   ├── services/     # AI service
│   │   ├── auth/
│   │   ├── core/
│   │   └── database/
│   ├── seed_data.py
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── layouts/
│       ├── services/
│       ├── hooks/
│       └── types/
└── README.md
```

## Deployment Notes

- Frontend → Vercel  
- Backend → Render / Railway  
- Set environment variables on the host  
- Point frontend `VITE_API_URL` to the backend URL  

---

Built as a clean, demo-ready Phase 1 MVP focused on real farm data → AI insights → actionable decisions.
