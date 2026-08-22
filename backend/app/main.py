from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.api import auth, credentials, issuers, users, consent, system, access_requests, resume, mobility, ai_agent, security
from app.dependencies.auth import require_role
from app.models import user, credential, issuer, consent as consent_model, access_request as access_request_model
from app.models.user import User, UserRole

# Create database tables automatically in PostgreSQL / SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="EduPass Decentralized Academic Credential & Verification API",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(credentials.router)
app.include_router(issuers.router)
app.include_router(users.router)
app.include_router(consent.router)
app.include_router(system.router)
app.include_router(access_requests.router)
app.include_router(resume.router)
app.include_router(mobility.router)
app.include_router(ai_agent.router)
app.include_router(security.router)


@app.get("/")
def root():
    return {"message": "EduPass API Service is live"}


# Protected Role Test Endpoints
@app.get("/protected/student", dependencies=[Depends(require_role(UserRole.STUDENT))])
def protected_student_endpoint(current_user: User = Depends(require_role(UserRole.STUDENT))):
    return {"message": "Access granted to STUDENT endpoint", "user": current_user.email}


@app.get("/protected/institution", dependencies=[Depends(require_role(UserRole.INSTITUTION))])
def protected_institution_endpoint(current_user: User = Depends(require_role(UserRole.INSTITUTION))):
    return {"message": "Access granted to INSTITUTION endpoint", "user": current_user.email}


@app.get("/protected/admin", dependencies=[Depends(require_role(UserRole.ADMIN))])
def protected_admin_endpoint(current_user: User = Depends(require_role(UserRole.ADMIN))):
    return {"message": "Access granted to ADMIN endpoint", "user": current_user.email}
