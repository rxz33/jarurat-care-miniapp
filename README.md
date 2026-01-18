# Jarurat Care – AI-Enabled Mini Healthcare Support Web App (Concept-Level)

A full-stack prototype for **Jarurat Care (Cancer Care NGO)** to collect:
- **Patient/Caregiver Support Requests**
- **Volunteer Registrations**
…and provide an internal **dashboard** for coordinators.

This is a **concept-level** app: built to demonstrate clarity, effort, and an AI/automation workflow (not a production medical system).

---

## Features

### 1) Support Request Form (Patients/Caregivers)
Collects basic details + cancer context (optional) + needs.

### 2) Volunteer Registration Form
Captures volunteer details, skills, and availability.

### 3) Internal Dashboard
Shows totals, urgency breakdown, department routing counts, and latest entries.

---

## AI / Automation (Groq)

On every support request submission, the backend uses **Groq LLM** to generate:
- **Urgency:** High / Medium / Low
- **Suggested department routing:** Caregiver Mentorship / Financial Guidance / Hospital Partner Connect / Awareness & Prevention / General Support
- **Staff summary** (non-medical)
- **Follow-up questions** (3–5)
- **Auto-reply draft** (WhatsApp-ready)

✅ If Groq is unavailable, the backend automatically falls back to a **rule-based triage** for reliability.

> Note: The system does NOT provide medical advice. It only summarizes and helps coordinate support.

---

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS

### Backend
- FastAPI (Python)
- Groq API integration
- Local JSON storage (concept-level)

---

## Project Structure

```txt
Jarurat-Care/
  client/                 # React + Vite + Tailwind (UI)
  server/                 # FastAPI + Groq AI (API)
    data/                 # Local JSON storage (concept-level)
  screenshots/            # Optional: demo screenshots
  README.md

Setup & Run Locally
1) Backend (FastAPI)

Open terminal in the server/ folder:

cd server


If you’re using uv (recommended):

uv run uvicorn main:app --reload --port 8000


Backend URLs:

Health check: http://localhost:8000/health

API Docs (Swagger): http://localhost:8000/docs

Environment Variables (Groq)

Create a file: server/.env

GROQ_API_KEY=YOUR_GROQ_KEY_HERE
GROQ_MODEL=llama-3.1-8b-instant


✅ Make sure .env is in .gitignore (do NOT push secrets).

2) Frontend (React)

Open terminal in the client/ folder:

cd client
npm install
npm run dev


Frontend URL:

http://localhost:5173

API Endpoints
Support Requests

GET /api/support → list support requests

POST /api/support → create support request (runs Groq AI + fallback)

Volunteers

GET /api/volunteers → list volunteers

POST /api/volunteers → create volunteer registration

Dashboard

GET /api/dashboard/summary → totals + urgency counts + department counts

Demo Flow (How to Test)

Start backend (server) and frontend (client)

Open the app: http://localhost:5173

Go to Support Request and submit a sample request

Check Automation Output for:

urgency, department, next action

AI staff summary

follow-up questions

auto-reply draft

Go to Dashboard to see totals and latest entries

Submit a Volunteer Registration and refresh dashboard

Screenshots (Optional but Recommended)

Create a folder in project root: screenshots/

Add images like:

support-form.png
ai-output.png
dashboard.png
Then add this to the README:

## Screenshots

### Support Request Form
![Support Form](screenshots/support-form.png)

### AI Automation Output (Groq)
![AI Output](screenshots/ai-output.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

Notes / Safety

This is a concept-level prototype for NGO operations.

The system does not provide medical advice, diagnosis, or treatment suggestions.

AI is used only for:
summarization
triage labels
follow-up questions
drafting coordinator messages

Author
Rashi   github@rxz33