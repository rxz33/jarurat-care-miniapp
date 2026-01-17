import os
import json
import re
from typing import Dict, Any
from groq import Groq

DEFAULT_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

ALLOWED_URGENCY = {"High", "Medium", "Low"}
ALLOWED_DEPTS = {
    "Caregiver Mentorship",
    "Financial Guidance",
    "Hospital Partner Connect",
    "Awareness & Prevention",
    "General Support",
}

def build_prompt(payload: dict) -> str:
    # Make output predictable: exact JSON schema
    schema = {
        "urgency": "High|Medium|Low",
        "department": "Caregiver Mentorship|Financial Guidance|Hospital Partner Connect|Awareness & Prevention|General Support",
        "staffSummary": "1-2 lines summary for NGO staff (no medical advice)",
        "followUpQuestions": [
            "3-5 short questions to ask requester"
        ],
        "autoReplyDraft": "short WhatsApp-ready message from Jarurat Care team"
    }

    return f"""
You are an NGO triage assistant for Jarurat Care (cancer care community in India).
You help coordinators by generating operational text and triage labels.

STRICT RULES:
- Do NOT provide medical advice, diagnosis, or treatment suggestions.
- Only summarize and organize what the requester said.
- Output MUST be valid JSON ONLY. No markdown, no extra text.
- Use EXACTLY these keys: urgency, department, staffSummary, followUpQuestions, autoReplyDraft
- urgency must be exactly one of: "High", "Medium", "Low"
- department must be exactly one of:
  "Caregiver Mentorship", "Financial Guidance", "Hospital Partner Connect",
  "Awareness & Prevention", "General Support"
- followUpQuestions must be a JSON array of 3 to 5 strings.

Return JSON in this shape:
{json.dumps(schema, ensure_ascii=False)}

User submission JSON:
{json.dumps(payload, ensure_ascii=False)}
""".strip()


def _safe_json_parse(text: str) -> Dict[str, Any]:
    """
    Usually response_format=json_object gives clean JSON.
    This fallback extracts the first JSON object if extra text appears.
    """
    text = (text or "").strip()

    # direct parse
    try:
        return json.loads(text)
    except Exception:
        pass

    # fallback: find a JSON object in the text
    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        raise ValueError("Groq returned non-JSON response")
    return json.loads(match.group(0))


def groq_triage(payload: dict) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("Missing GROQ_API_KEY")

    client = Groq(api_key=api_key)

    completion = client.chat.completions.create(
        model=DEFAULT_MODEL,
        messages=[
            {"role": "system", "content": "Return JSON only. Do not include any extra text."},
            {"role": "user", "content": build_prompt(payload)},
        ],
        temperature=0.2,
        max_tokens=500,
        response_format={"type": "json_object"},
    )

    content = completion.choices[0].message.content
    data = _safe_json_parse(content)

    # Defaults
    urgency = data.get("urgency", "Low")
    department = data.get("department", "General Support")
    staff_summary = data.get("staffSummary", "") or ""
    follow_ups = data.get("followUpQuestions", [])
    auto_reply = data.get("autoReplyDraft", "") or ""

    # Validate urgency / department
    if urgency not in ALLOWED_URGENCY:
        urgency = "Low"
    if department not in ALLOWED_DEPTS:
        department = "General Support"

    # Validate follow-up questions
    if not isinstance(follow_ups, list):
        follow_ups = []
    follow_ups = [str(x).strip() for x in follow_ups if str(x).strip()]
    follow_ups = follow_ups[:6]  # hard cap

    return {
        "urgency": urgency,
        "department": department,
        "staffSummary": staff_summary.strip(),
        "followUpQuestions": follow_ups,
        "autoReplyDraft": auto_reply.strip(),
    }
