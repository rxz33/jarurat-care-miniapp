from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, timezone
import os, json
from dotenv import load_dotenv

from utils.groq_ai import groq_triage
from utils.triage import generate_case_summary

load_dotenv()

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
SUPPORT_FILE = os.path.join(DATA_DIR, "support_requests.json")
VOL_FILE = os.path.join(DATA_DIR, "volunteers.json")

os.makedirs(DATA_DIR, exist_ok=True)
for f in [SUPPORT_FILE, VOL_FILE]:
    if not os.path.exists(f):
        with open(f, "w", encoding="utf-8") as fp:
            json.dump([], fp)

def _read(path: str) -> List[dict]:
    try:
        with open(path, "r", encoding="utf-8") as fp:
            return json.load(fp) or []
    except Exception:
        return []

def _write(path: str, items: List[dict]) -> None:
    with open(path, "w", encoding="utf-8") as fp:
        json.dump(items, fp, ensure_ascii=False, indent=2)

ALLOWED_URGENCY = {"High", "Medium", "Low"}
ALLOWED_DEPTS = {
    "Caregiver Mentorship",
    "Financial Guidance",
    "Hospital Partner Connect",
    "Awareness & Prevention",
    "General Support"
}

class SupportRequestIn(BaseModel):
    fullName: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=6)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)

    age: Optional[int] = None
    patientRelation: Optional[str] = "Self"
    preferredContact: Optional[str] = "WhatsApp"

    cancerType: Optional[str] = None
    stage: Optional[str] = None
    needs: Optional[List[str]] = []
    symptoms: Optional[str] = None
    message: Optional[str] = None

    # HARDEN: accept "" as None so frontend never breaks backend
    @field_validator("age", mode="before")
    @classmethod
    def parse_age(cls, v):
        if v in ("", None):
            return None
        return int(v)

class VolunteerIn(BaseModel):
    fullName: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=6)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)

    email: Optional[str] = None
    skills: Optional[List[str]] = []
    availabilityHoursPerWeek: Optional[int] = None
    motivation: Optional[str] = None

app = FastAPI(title="Jarurat Care Mini Support API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Jarurat Care Mini API running. Visit /docs"}

@app.get("/health")
def health():
    return {"ok": True, "service": "jarurat-care-mini-api"}

@app.get("/api/support")
def list_support():
    return {"items": _read(SUPPORT_FILE)}

@app.post("/api/support", status_code=201)
def create_support(payload: SupportRequestIn):
    data = payload.model_dump()

    # Rule-based baseline (reliable)
    fallback = generate_case_summary(data)

    # Try Groq AI (real automation)
    try:
        ai = groq_triage(data)

        urgency = ai.get("urgency", fallback.get("urgency", "Low"))
        if urgency not in ALLOWED_URGENCY:
            urgency = fallback.get("urgency", "Low")

        department = ai.get("department", fallback.get("department", "General Support"))
        if department not in ALLOWED_DEPTS:
            department = fallback.get("department", "General Support")

        staff_summary = ai.get("staffSummary", "") or ""
        follow_ups = ai.get("followUpQuestions", [])
        if not isinstance(follow_ups, list):
            follow_ups = []
        follow_ups = follow_ups[:6]

        auto_reply = ai.get("autoReplyDraft", "") or ""

        automation = {
            "urgency": urgency,
            "department": department,
            "nextAction": fallback.get("nextAction", "Contact within 48 hours"),  # keep deterministic
            "staffSummary": staff_summary,
            "followUpQuestions": follow_ups,
            "autoReplyDraft": auto_reply,
            "summaryText": fallback.get("summaryText", ""),
            "tags": fallback.get("tags", []),
            "aiProvider": "groq",
            "aiEnabled": True
        }

    except Exception as e:
        # Optional: print error so you can debug missing key, model name etc.
        print("Groq failed, using fallback:", repr(e))
        automation = {
            **fallback,
            "aiProvider": "none",
            "aiEnabled": False
        }

    record = {
        "id": str(uuid4()),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        **data,
        **automation
    }

    items = _read(SUPPORT_FILE)
    items.insert(0, record)
    _write(SUPPORT_FILE, items)
    return {"item": record}

@app.get("/api/volunteers")
def list_volunteers():
    return {"items": _read(VOL_FILE)}

@app.post("/api/volunteers", status_code=201)
def create_volunteer(payload: VolunteerIn):
    record = {
        "id": str(uuid4()),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        **payload.model_dump()
    }
    items = _read(VOL_FILE)
    items.insert(0, record)
    _write(VOL_FILE, items)
    return {"item": record}

@app.get("/api/dashboard/summary")
def dashboard_summary():
    support = _read(SUPPORT_FILE)
    vols = _read(VOL_FILE)

    urg = {"High": 0, "Medium": 0, "Low": 0}
    dept = {}
    for s in support:
        urg_key = s.get("urgency", "Low")
        if urg_key not in urg:
            urg_key = "Low"
        urg[urg_key] += 1

        d = s.get("department", "General Support")
        dept[d] = dept.get(d, 0) + 1

    return {
        "totals": {
            "supportRequests": len(support),
            "volunteers": len(vols)
        },
        "urgencyCounts": urg,
        "departmentCounts": dept
    }
