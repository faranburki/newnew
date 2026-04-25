import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
from pathlib import Path

import json

# Initialize Firebase Admin SDK
def initialize_firebase():
    """
    Initialize Firebase Admin SDK using serviceAccountKey.json
    or GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.
    """
    if len(firebase_admin._apps):
        return True

    key_path = str(Path(__file__).parent / "serviceAccountKey.json")
    
    try:
        if os.path.exists(key_path):
            cred = credentials.Certificate(key_path)
        elif os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON"):
            cred_json = json.loads(os.environ["GOOGLE_APPLICATION_CREDENTIALS_JSON"])
            cred = credentials.Certificate(cred_json)
        else:
            # Fallback for manual path override
            env_path = os.getenv("FIREBASE_ADMIN_SDK_PATH")
            if env_path and os.path.exists(env_path):
                cred = credentials.Certificate(env_path)
            else:
                raise FileNotFoundError(
                    "Service account credentials not found. "
                    "Place serviceAccountKey.json in app/core/ or set GOOGLE_APPLICATION_CREDENTIALS_JSON."
                )

        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Firebase Init Error: {e}")
        raise e

    return True


# Get Firebase Auth instance
def get_auth():
    """Get Firebase Authentication instance"""
    return auth


# Get Firestore instance
def get_firestore_db():
    """Get Firestore database instance"""
    return firestore.client()


# Initialize Firebase on module import
try:
    initialize_firebase()
except Exception as e:
    print(f"Warning: Firebase Admin SDK initialization failed: {e}")
