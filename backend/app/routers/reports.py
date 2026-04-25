from fastapi import APIRouter, HTTPException
from app.core.firebase_admin import get_firestore_db
from google.cloud.firestore_v1 import Query

router = APIRouter()

@router.get("/{patient_id}")
async def get_patient_reports(patient_id: str):
    """Returns all reports for a patient, ordered by createdAt descending."""
    db = get_firestore_db()

    reports_ref = (
        db.collection("reports")
        .where("patientId", "==", patient_id)
        .order_by("createdAt", direction=Query.DESCENDING)
    )

    results = []
    for doc in reports_ref.stream():
        data = doc.to_dict()
        data["id"] = doc.id
        # Serialize datetime for JSON response
        if "createdAt" in data and hasattr(data["createdAt"], "isoformat"):
            data["createdAt"] = data["createdAt"].isoformat()
        results.append(data)

    return results
