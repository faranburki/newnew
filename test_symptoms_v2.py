import os
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from app.services.gemini_service import analyze_symptoms

if __name__ == "__main__":
    try:
        result = analyze_symptoms("throat pain")
        print("FINAL_RESULT_START")
        print(result)
        print("FINAL_RESULT_END")
    except Exception as e:
        print(f"FAILED: {e}")
