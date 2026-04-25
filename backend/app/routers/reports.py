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
    )

    results = []
    for doc in reports_ref.stream():
        data = doc.to_dict()
        data["id"] = doc.id
        
        # Keep raw timestamp for sorting
        raw_created_at = data.get("createdAt")

        # Serialize datetime for JSON response
        if "createdAt" in data and hasattr(data["createdAt"], "isoformat"):
            data["createdAt"] = data["createdAt"].isoformat()
        
        # Use a sortable key (timestamp or empty string fallback)
        data["_sort_key"] = raw_created_at or ""
        results.append(data)

    # In-memory sort to avoid needing a Firestore composite index
    results.sort(key=lambda x: str(x["_sort_key"]), reverse=True)
    
    # Clean up sort key before returning
    for r in results:
        r.pop("_sort_key", None)

    return results
