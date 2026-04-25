from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.firebase_admin import initialize_firebase

# Initialize Firebase Admin SDK
initialize_firebase()

# Create FastAPI app
app = FastAPI(
    title="Medi-Connect Pakistan API",
    description="AI-powered healthcare application API",
    version="1.0.0",
)

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Medi-Connect Pakistan API is running"}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Medi-Connect Pakistan API",
        "version": "1.0.0",
        "docs": "/docs",
    }


# Include routers here (when they are created)
from app.routers import doctors, ai, reports, appointments
# from app.routers import auth
# app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(doctors.router, prefix="/doctors", tags=["Doctors"])
app.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
