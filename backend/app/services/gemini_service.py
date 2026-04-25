import os
import json
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env
load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

def _load_prompt(filename: str) -> str:
    path = PROMPTS_DIR / filename
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()

def analyze_symptoms(symptoms: str) -> dict:
    try:
        system_instruction = _load_prompt("symptom_prompt.txt")
        
        # Use gemini-2.5-flash as originally configured
        model = genai.GenerativeModel(
            'gemini-2.5-flash', 
            system_instruction=system_instruction,
            generation_config={"response_mime_type": "application/json"}
        )
        
        response = model.generate_content(symptoms)
        
        # Parse and return JSON
        text = response.text.strip()
        print(f"DEBUG SYMPTOMS RESPONSE: {text}")
        
        # Fallback to strip markdown if response_mime_type didn't apply (older clients)
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        
        # Check if specialist is missing or empty
        if not data.get("specialist"):
             return {
                "fallback": True, 
                "message": "Your symptoms are too general. Please describe the location of pain, how long it has been happening, and whether it is mild, moderate, or severe."
            }
            
        return data
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Symptom Analysis failed: {e}")
        return {
            "fallback": True, 
            "message": "Your symptoms are too general. Please describe the location of pain, how long it has been happening, and whether it is mild, moderate, or severe."
        }

def analyze_report(file_bytes: bytes, mime_type: str) -> dict:
    try:
        system_instruction = _load_prompt("report_prompt.txt")
        
        model = genai.GenerativeModel(
            'gemini-2.5-flash', 
            system_instruction=system_instruction,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Prepare the file part for the vision model
        file_part = {
            "mime_type": mime_type,
            "data": file_bytes
        }
        
        # We pass a simple prompt along with the file
        response = model.generate_content([file_part, "Analyze this report"])
        
        # Parse and return JSON
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
        
    except Exception as e:
        print(f"Report Analysis failed: {e}")
        return {"fallback": True, "error": str(e), "message": "Failed to analyze report"}
