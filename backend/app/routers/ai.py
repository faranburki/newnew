from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.gemini_service import analyze_symptoms, analyze_report
from app.core.firebase_admin import get_firestore_db
from firebase_admin import firestore
import datetime

router = APIRouter()

class SymptomRequest(BaseModel):
    symptoms: str

@router.post("/analyze-symptoms")
async def handle_analyze_symptoms(request: SymptomRequest):
    analysis = analyze_symptoms(request.symptoms)
    
    if analysis.get("fallback"):
        return analysis
        
    specialist = analysis.get("specialist")
    urgency = analysis.get("urgency")
    reason = analysis.get("reason")
    
    doctors_list = []
    
    if specialist:
        db = get_firestore_db()
        docs_ref = db.collection("doctors").where("specialty", "==", specialist).stream()
        for doc in docs_ref:
            doc_data = doc.to_dict()
            doc_data["id"] = doc.id
            
            # Serialize Datetime objects for FastAPI JSON response compatibility
            if "createdAt" in doc_data and hasattr(doc_data["createdAt"], "isoformat"):
                doc_data["createdAt"] = doc_data["createdAt"].isoformat()
            
            doctors_list.append(doc_data)
            
    return {
        "specialist": specialist,
        "urgency": urgency,
        "reason": reason,
        "doctors": doctors_list
    }

@router.post("/analyze-report")
async def handle_analyze_report(file: UploadFile = File(...)):
    contents = await file.read()
    mime_type = file.content_type
    
    if not mime_type:
        mime_type = "application/octet-stream"
        
    analysis = analyze_report(contents, mime_type)
    
    if analysis.get("fallback"):
        return analysis
        
    db = get_firestore_db()
    
    report_data = {
        "patientId": "anonymous",
        "summary": analysis.get("summary", ""),
        "normal_values": analysis.get("normal_values", []),
        "abnormal_values": analysis.get("abnormal_values", []),
        "recommended_specialist": analysis.get("recommended_specialist", ""),
        "urgency": analysis.get("urgency", ""),
        "createdAt": firestore.SERVER_TIMESTAMP
    }
    
    # Save to Firestore
    doc_ref = db.collection("reports").document()
    doc_ref.set(report_data)
    
    # Prepare and return the response augmenting the analysis result with the new reportId
    response_data = dict(analysis)
    response_data["reportId"] = doc_ref.id
    
    return response_data
