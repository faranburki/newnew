import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
import json
from pathlib import Path

def initialize_firebase():
    """
    Initialize Firebase Admin SDK using serviceAccountKey.json 
    or GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.
    """
    if len(firebase_admin._apps):
        return True

    try:
        # Priority 1: Environment variable (Production/Railway)
        cred_json_str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
        if cred_json_str:
            cred_dict = json.loads(cred_json_str)
            cred = credentials.Certificate(cred_dict)
        else:
            # Priority 2: Local file (Development)
            # Check for env path or default path
            default_path = str(Path(__file__).parent / "serviceAccountKey.json")
            key_path = os.getenv("FIREBASE_ADMIN_SDK_PATH") or default_path
            
            if os.path.exists(key_path):
                cred = credentials.Certificate(key_path)
            else:
                raise FileNotFoundError(
                    "Service account credentials not found. "
                    "Set GOOGLE_APPLICATION_CREDENTIALS_JSON or place serviceAccountKey.json in app/core/"
                )

        firebase_admin.initialize_app(cred)
        return True
    except Exception as e:
        print(f"Firebase Init Error: {e}")
        # In some environments, we might want to fail hard, 
        # but for now we'll just log it.
        return False

def get_auth():
    """Get Firebase Authentication instance"""
    return auth

def get_firestore_db():
    """Get Firestore database instance"""
    return firestore.client()

# Auto-initialize on import
initialize_firebase()
