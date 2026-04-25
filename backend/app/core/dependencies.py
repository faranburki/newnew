from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import firebase_admin
from firebase_admin import auth, firestore

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    """
    Dependency to verify Firebase ID token from Authorization header.
    Returns the user's uid and role from Firestore.
    
    Args:
        credentials: HTTP Bearer token from Authorization header
        
    Returns:
        dict: Contains user uid, email, and role
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials

    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")

    except firebase_admin.exceptions.InvalidArgumentError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fetch user data from Firestore
    try:
        db = firestore.client()
        user_doc = db.collection("users").document(uid).get()

        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in database",
            )

        user_data = user_doc.to_dict()
        role = user_data.get("role")

        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User role not set",
            )

        return {
            "uid": uid,
            "email": email,
            "role": role,
            "user_data": user_data,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user data: {str(e)}",
        )


async def get_current_patient(current_user: dict = Depends(get_current_user)):
    """
    Dependency to ensure the current user is a patient.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        dict: Current user data
        
    Raises:
        HTTPException: If user is not a patient
    """
    if current_user["role"] != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patients can access this resource",
        )
    return current_user


async def get_current_doctor(current_user: dict = Depends(get_current_user)):
    """
    Dependency to ensure the current user is a doctor.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        dict: Current user data
        
    Raises:
        HTTPException: If user is not a doctor
    """
    if current_user["role"] != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors can access this resource",
        )
    return current_user
