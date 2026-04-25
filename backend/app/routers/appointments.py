from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.firebase_admin import get_firestore_db
from firebase_admin import firestore as fs
from google.cloud.firestore_v1 import Query
import datetime

router = APIRouter()


class BookingRequest(BaseModel):
    doctorId: str
    slotId: str
    patientId: str


@router.post("/book")
async def book_appointment(request: BookingRequest):
    """
    Book an appointment using a Firestore transaction to prevent double-booking.
    """
    db = get_firestore_db()

    slot_ref = (
        db.collection("doctors")
        .document(request.doctorId)
        .collection("slots")
        .document(request.slotId)
    )

    appointment_ref = db.collection("appointments").document()

    @fs.transactional
    def book_in_transaction(transaction):
        # 1. Read slot inside transaction
        slot_snapshot = slot_ref.get(transaction=transaction)

        if not slot_snapshot.exists:
            raise HTTPException(status_code=404, detail="Slot not found.")

        slot_data = slot_snapshot.to_dict()

        # 2. Check if already booked
        if slot_data.get("status") == "booked":
            raise HTTPException(
                status_code=409,
                detail="This slot was just booked by someone else. Please choose another.",
            )

        # 3. Update slot to booked
        transaction.update(slot_ref, {
            "status": "booked",
            "patientId": request.patientId,
        })

        # 4. Create appointment document
        transaction.set(appointment_ref, {
            "patientId": request.patientId,
            "doctorId": request.doctorId,
            "slotId": request.slotId,
            "date": slot_data.get("date", ""),
            "time": slot_data.get("time", ""),
            "status": "confirmed",
            "createdAt": fs.SERVER_TIMESTAMP,
        })

    # Execute transaction
    transaction = db.transaction()
    book_in_transaction(transaction)

    return {
        "appointmentId": appointment_ref.id,
        "message": "Appointment booked successfully",
    }


@router.get("/patient/{patient_id}")
async def get_patient_appointments(patient_id: str):
    """All appointments for a patient, ordered by createdAt desc, with doctor name."""
    db = get_firestore_db()

    appts_ref = (
        db.collection("appointments")
        .where("patientId", "==", patient_id)
    )

    results = []
    for doc in appts_ref.stream():
        data = doc.to_dict()
        data["id"] = doc.id
        
        # Keep raw timestamp for sorting
        raw_created_at = data.get("createdAt")

        # Serialize datetime
        if "createdAt" in data and hasattr(data["createdAt"], "isoformat"):
            data["createdAt"] = data["createdAt"].isoformat()

        # Fetch doctor name
        doctor_id = data.get("doctorId")
        if doctor_id:
            doctor_doc = db.collection("doctors").document(doctor_id).get()
            if doctor_doc.exists:
                doctor_data = doctor_doc.to_dict()
                data["doctorName"] = doctor_data.get("name", "Unknown")
                data["doctorSpecialty"] = doctor_data.get("specialty", "")
            else:
                data["doctorName"] = "Unknown"
                data["doctorSpecialty"] = ""

        # Use a sortable key (timestamp or empty string fallback)
        data["_sort_key"] = raw_created_at or ""
        results.append(data)

    # In-memory sort to avoid needing a Firestore composite index
    results.sort(key=lambda x: str(x["_sort_key"]), reverse=True)
    
    # Clean up sort key before returning
    for r in results:
        r.pop("_sort_key", None)

    return results


@router.get("/doctor/{doctor_id}")
async def get_doctor_appointments(doctor_id: str):
    """All appointments for a doctor where date == today, with patient profile."""
    db = get_firestore_db()

    today_str = datetime.datetime.now().date().isoformat()

    # Query by doctorId only to avoid needing a composite index for multiple fields
    appts_ref = (
        db.collection("appointments")
        .where("doctorId", "==", doctor_id)
    )

    results = []
    # In-memory filter for today's date
    for doc in appts_ref.stream():
        data = doc.to_dict()
        
        # Only include if date matches today
        if data.get("date") != today_str:
            continue

        data["id"] = doc.id

        # Serialize datetime
        if "createdAt" in data and hasattr(data["createdAt"], "isoformat"):
            data["createdAt"] = data["createdAt"].isoformat()

        # Fetch patient profile from users/{id}/profile/health
        patient_id = data.get("patientId")
        if patient_id:
            # 1. Basic user data (name, email)
            user_doc = db.collection("users").document(patient_id).get()
            profile_data = {}
            if user_doc.exists:
                profile_data = user_doc.to_dict()
            
            # 2. Health profile data (bloodType, allergies, etc)
            health_doc = db.collection("users").document(patient_id).collection("profile").document("health").get()
            if health_doc.exists:
                profile_data.update(health_doc.to_dict())
            
            data["patientProfile"] = profile_data if profile_data else {"name": "Unknown", "email": ""}

        results.append(data)

    return results
