from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
from typing import List, Optional
import math

from app.core.firebase_admin import get_firestore_db

router = APIRouter()

class AvailabilityUpdate(BaseModel):
    status: bool

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in kilometers between two points on the earth."""
    R = 6371.0 # Earth radius in kilometers
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = (math.sin(dLat / 2) * math.sin(dLat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dLon / 2) * math.sin(dLon / 2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("")
async def get_doctors(
    specialty: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None
):
    """Returns all doctors from Firestore, optionally filtered by specialty and optionally sorted by distance."""
    db = get_firestore_db()
    
    # Optional filtering by specialty
    if specialty:
        docs_ref = db.collection("doctors").where("specialty", "==", specialty)
    else:
        docs_ref = db.collection("doctors")
    
    results = []
    # Firestore fetch
    for doc in docs_ref.stream():
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)
        
    # Optional sorting by location/distance
    if lat is not None and lng is not None:
        for doctor in results:
            d_loc = doctor.get("location", {})
            d_lat = d_loc.get("lat")
            d_lng = d_loc.get("lng")
            if d_lat is not None and d_lng is not None:
                doctor["distance"] = haversine(lat, lng, float(d_lat), float(d_lng))
            else:
                doctor["distance"] = float('inf')
                
        results.sort(key=lambda x: x.get("distance", float('inf')))
        
    return results

@router.get("/{doctor_id}")
async def get_doctor(doctor_id: str):
    """Returns single doctor document by ID."""
    db = get_firestore_db()
    doc_ref = db.collection("doctors").document(doctor_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    data = doc.to_dict()
    data["id"] = doc.id
    return data

@router.get("/{doctor_id}/slots")
async def get_doctor_slots(doctor_id: str):
    """Returns only slots where status == 'available' from the doctor's slots subcollection."""
    db = get_firestore_db()
    slots_ref = db.collection("doctors").document(doctor_id).collection("slots")
    
    # Filter by available status
    query_ref = slots_ref.where("status", "==", "available")
    
    results = []
    for slot in query_ref.stream():
        data = slot.to_dict()
        data["id"] = slot.id
        results.append(data)
        
    return results

@router.patch("/{doctor_id}/availability")
async def update_availability(doctor_id: str, update: AvailabilityUpdate):
    """Updates availabilityStatus in Firestore."""
    db = get_firestore_db()
    doc_ref = db.collection("doctors").document(doctor_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    doc_ref.update({"availabilityStatus": update.status})
    
    return {"status": update.status}
