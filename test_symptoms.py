import os
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.gemini_service import analyze_symptoms

if __name__ == "__main__":
    result = analyze_symptoms("throat pain")
    print(result)
