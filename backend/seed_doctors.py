import sys
import os
import random
import datetime
import firebase_admin
from firebase_admin import credentials, firestore

def seed_doctors():
    print("Loading Firebase credentials...")
    service_account_path = os.path.join(
        os.path.dirname(__file__), "app", "core", "serviceAccountKey.json"
    )
    
    if not os.path.exists(service_account_path):
        print(f"Error: Could not find credentials at {service_account_path}")
        sys.exit(1)
        
    if not len(firebase_admin._apps):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        
    db = firestore.client()
    
    # 2 doctors each for first 4 then 1 each = 10 doctors
    specialties_dist = [
        "Cardiologist", "Cardiologist", 
        "Dermatologist", "Dermatologist", 
        "General Physician", "General Physician", 
        "ENT", "ENT", 
        "Neurologist", 
        "Orthopedic"
    ]
    
    # Randomly assign the remaining 15 doctors to reach 25
    all_specialties = ["Cardiologist", "Dermatologist", "General Physician", "ENT", "Neurologist", "Orthopedic"]
    for _ in range(15):
        specialties_dist.append(random.choice(all_specialties))
        
    random.shuffle(specialties_dist)
    
    first_names = ["Ali", "Ahmad", "Ayesha", "Fatima", "Hassan", "Usman", "Zainab", "Khadija", "Umar", "Bilal", "Tariq", "Imran", "Farhan", "Sana", "Nida", "Raza", "Numan", "Sadia", "Kiran", "Faizan", "Hamza", "Zohaib", "Asad", "Yasir", "Naveed", "Nadia", "Rubina"]
    last_names = ["Khan", "Ahmed", "Ali", "Qureshi", "Malik", "Shah", "Mehmood", "Abbas", "Raza", "Iqbal", "Hussain", "Tariq"]
    
    times_list = ["09:00", "11:00", "14:00", "16:00", "18:00", "19:00"]
    today = datetime.datetime.now().date()
    tomorrow = today + datetime.timedelta(days=1)
    
    print("Seeding exactly 25 doctors into Firestore...")
    for i in range(25):
        name = "Dr. " + random.choice(first_names) + " " + random.choice(last_names)
        specialty = specialties_dist[i]
        
        fee = random.randint(5, 30) * 100 # Generating 500-3000 PKR rounded to 100s
        rating = round(random.uniform(3.5, 5.0), 1)
        pmdc_number = f"{random.randint(10000, 99999)}"
        bio = f"A highly experienced {specialty} committed to providing excellent patient care."
        
        lat = 33.6 + random.uniform(-0.05, 0.05)
        lng = 73.0 + random.uniform(-0.05, 0.05)
        
        doctor_data = {
            "name": name,
            "specialty": specialty,
            "fee": fee,
            "rating": rating,
            "pmdc_number": pmdc_number,
            "bio": bio,
            "availabilityStatus": True,
            "location": {
                "lat": lat,
                "lng": lng
            },
            "createdAt": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = db.collection("doctors").document()
        doc_ref.set(doctor_data)
        
        slots_ref = doc_ref.collection("slots")
        
        today_times = random.sample(times_list, 3)
        tomorrow_times = random.sample(times_list, 3)
        
        for t in today_times:
            slots_ref.add({
                "date": today.isoformat(),
                "time": t,
                "status": "available",
                "patientId": None
            })
            
        for t in tomorrow_times:
            slots_ref.add({
                "date": tomorrow.isoformat(),
                "time": t,
                "status": "available",
                "patientId": None
            })
            
        print(f"Doctor added: {name}")
        
    print(f"\nSuccessfully seeded {len(specialties_dist)} doctors.")

if __name__ == '__main__':
    seed_doctors()
