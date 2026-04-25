import os
import sys
from pathlib import Path
import uuid
import datetime

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from app.core.firebase_admin import get_firestore_db

def seed_doctors():
    db = get_firestore_db()
    
    doctors = [
        {
            "name": "Dr. Sarah Ali",
            "specialty": "Endocrinologist",
            "bio": "Specialist in diabetes management, thyroid disorders, and hormonal health. 12 years of experience.",
            "fee": 2500,
            "rating": 4.9,
            "availabilityStatus": True,
            "pmdc_number": "PMDC-88291",
        },
        {
            "name": "Dr. Kamran Ahmed",
            "specialty": "Internal Medicine",
            "bio": "General management, treatment for vitamin deficiencies, dyslipidemia, and chronic illness management.",
            "fee": 2000,
            "rating": 4.7,
            "availabilityStatus": True,
            "pmdc_number": "PMDC-77382",
        },
        {
            "name": "Dr. Zainab Raza",
            "specialty": "Allergist",
            "bio": "Expert in treating high IgE levels, seasonal allergies, and immune system disorders.",
            "fee": 3000,
            "rating": 4.8,
            "availabilityStatus": True,
            "pmdc_number": "PMDC-99201",
        },
        {
            "name": "Dr. Mustafa Hassan",
            "specialty": "Cardiologist",
            "bio": "Cardiovascular risk assessment, heart disease prevention, and hypertension management.",
            "fee": 3500,
            "rating": 5.0,
            "availabilityStatus": True,
            "pmdc_number": "PMDC-11022",
        },
        {
            "name": "Dr. Faizan Malik",
            "specialty": "ENT",
            "bio": "Specialist in Ear, Nose, and Throat surgeries and treatments. Expert in throat pain and sinus issues.",
            "fee": 1800,
            "rating": 4.6,
            "availabilityStatus": True,
            "pmdc_number": "PMDC-66551",
        }
    ]

    today = datetime.datetime.now().date().isoformat()
    slots_to_add = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]

    print("Starting seeding...")
    for doc_data in doctors:
        # Create doctor document with a consistent ID for repeated runs or random
        # We'll use a deterministic ID based on name to avoid duplicates
        doc_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, doc_data["name"]))
        doc_ref = db.collection("doctors").document(doc_id)
        doc_ref.set(doc_data)
        
        print(f"Seeded: {doc_data['name']} ({doc_data['specialty']})")

        # Add slots for today
        slots_ref = doc_ref.collection("slots")
        for stime in slots_to_add:
            slot_id = f"{today}_{stime.replace(' ', '_')}"
            slots_ref.document(slot_id).set({
                "date": today,
                "time": stime,
                "status": "available"
            })
    
    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_doctors()
