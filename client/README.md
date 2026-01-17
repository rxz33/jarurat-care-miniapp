# Jarurat Care – Mini Healthcare Support Web App (Concept-Level)

Prototype for Jarurat Care (Cancer care NGO) to collect support requests + volunteer registrations and provide an internal triage dashboard.

## Features
- Patient/Caregiver Support Request form
- Volunteer Registration form
- Internal Dashboard (view latest requests/volunteers + counts)

## AI / Automation Idea (Concept-level)
Backend generates:
- Auto case summary for coordinators
- Urgency tag: High/Medium/Low
- Suggested department routing (Mentorship / Financial / Hospital connect / Awareness)
- Recommended next action (call within 2 hrs / same day / 48 hrs)

Rule-based automation for demo (can later be replaced with Gemini/OpenAI).

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI
- Storage: JSON files (server/data/*.json)

## Run locally

### Backend
```bash
cd server
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
