import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
from pathlib import Path

# Initialize Firebase Admin SDK
def initialize_firebase():
    """
    Initialize Firebase Admin SDK using serviceAccountKey.json
    located at backend/app/core/serviceAccountKey.json
    """
    # Get the path to the service account key file
    # First check if FIREBASE_ADMIN_SDK_PATH env var is set
    if os.getenv("FIREBASE_ADMIN_SDK_PATH"):
        service_account_path = os.getenv("FIREBASE_ADMIN_SDK_PATH")
    else:
        # Default to backend/app/core/serviceAccountKey.json
        current_dir = Path(__file__).parent
        service_account_path = str(current_dir / "serviceAccountKey.json")

    # Check if the file exists
    if not os.path.exists(service_account_path):
        raise FileNotFoundError(
            f"Service account key file not found at {service_account_path}. "
            "Please place serviceAccountKey.json at backend/app/core/serviceAccountKey.json "
            "or set FIREBASE_ADMIN_SDK_PATH environment variable."
        )

    # Initialize Firebase Admin SDK with credentials
    if not len(firebase_admin._apps):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)

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
