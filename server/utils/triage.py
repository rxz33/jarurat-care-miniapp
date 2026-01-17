from typing import Dict, Any, List, Tuple

HIGH = {"oxygen", "breath", "breathing", "chest pain", "unconscious", "bleeding", "stroke", "emergency"}
MED  = {"fever", "vomit", "vomiting", "infection", "pain", "weakness", "dehydration", "fracture"}

def _text(payload: Dict[str, Any]) -> str:
    parts = [
        payload.get("cancerType") or "",
        payload.get("stage") or "",
        payload.get("symptoms") or "",
        payload.get("message") or "",
        " ".join(payload.get("needs") or []),
    ]
    return " ".join(parts).lower()

def detect_urgency(payload: Dict[str, Any]) -> str:
    t = _text(payload)
    if any(k in t for k in HIGH):
        return "High"
    if any(k in t for k in MED):
        return "Medium"
    return "Low"

def recommend_department(payload: Dict[str, Any]) -> str:
    needs: List[str] = payload.get("needs") or []
    t = _text(payload)

    if "caregiver" in t or "mentorship" in t or "emotional" in t:
        return "Caregiver Mentorship"
    if any("medicine" in n.lower() or "financial" in n.lower() for n in needs) or "fund" in t:
        return "Financial Guidance"
    if any("hospital" in n.lower() or "doctor" in n.lower() for n in needs) or "appointment" in t:
        return "Hospital Partner Connect"
    if "awareness" in t or "screening" in t or "prevention" in t:
        return "Awareness & Prevention"
    return "General Support"

def recommended_action(urgency: str) -> str:
    if urgency == "High":
        return "Call within 2 hours"
    if urgency == "Medium":
        return "Contact same day"
    return "Contact within 48 hours"

def generate_case_summary(payload: Dict[str, Any]) -> Dict[str, str]:
    urgency = detect_urgency(payload)
    dept = recommend_department(payload)
    action = recommended_action(urgency)

    full_name = payload.get("fullName") or "N/A"
    age = payload.get("age") if payload.get("age") is not None else "N/A"
    city = payload.get("city") or "N/A"
    state = payload.get("state") or "N/A"
    phone = payload.get("phone") or "N/A"
    patient_relation = payload.get("patientRelation") or "N/A"
    cancer_type = payload.get("cancerType") or "N/A"
    stage = payload.get("stage") or "N/A"
    symptoms = (payload.get("symptoms") or "").strip() or "N/A"
    needs = payload.get("needs") or []
    message = (payload.get("message") or "").strip() or "N/A"
    preferred = payload.get("preferredContact") or "N/A"

    lines = [
        f"Jarurat Care Case Summary",
        f"Requester: {full_name} | Relation: {patient_relation} | Age: {age}",
        f"Location: {city}, {state}",
        f"Contact: {phone} | Preferred: {preferred}",
        f"Cancer: {cancer_type} | Stage: {stage}",
        f"Needs: {', '.join(needs) if needs else 'N/A'}",
        f"Symptoms: {symptoms}",
        f"Notes: {message}",
        f"Urgency (auto): {urgency}",
        f"Suggested Department (auto): {dept}",
        f"Next Action (auto): {action}",
    ]

    return {
        "urgency": urgency,
        "department": dept,
        "nextAction": action,
        "summaryText": "\n".join(lines)
    }
