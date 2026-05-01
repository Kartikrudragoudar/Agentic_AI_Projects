"""
auth.py
=======
Authentication routes:
  POST /api/v1/auth/register  — Register a new user
  POST /api/v1/auth/login     — Login and receive JWT access token
  GET  /api/v1/auth/me        — Get current user info (protected)
"""

from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from loguru import logger

from backend.app.core.security import (
    create_access_token,
    verify_token,
    get_password_hash,
    verify_password,
)
from backend.app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# ─── In-memory user store (replace with DB in production) ────────────────────
_users_db: dict = {}


# ─── Schemas ─────────────────────────────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    username: str
    email: str
    full_name: Optional[str]


# ─── Dependency: Get current user from JWT ────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """FastAPI dependency that extracts and verifies the JWT token."""
    payload = verify_token(token)
    username = payload.get("sub")
    user = _users_db.get(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register(body: UserRegisterRequest):
    """
    Register a new user.

    - Checks for duplicate username/email.
    - Stores bcrypt-hashed password.
    """
    if body.username in _users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{body.username}' is already taken.",
        )

    # Check email uniqueness
    for u in _users_db.values():
        if u["email"] == body.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered.",
            )

    _users_db[body.username] = {
        "username": body.username,
        "email": body.email,
        "full_name": body.full_name,
        "hashed_password": get_password_hash(body.password),
    }

    logger.info(f"New user registered: {body.username}")
    return UserResponse(username=body.username, email=body.email, full_name=body.full_name)


@router.post("/login", response_model=TokenResponse, tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login and receive a JWT access token.

    Uses OAuth2 password flow (username + password in form body).
    """
    user = _users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": form_data.username})
    logger.info(f"User logged in: {form_data.username}")

    return TokenResponse(access_token=token, token_type="bearer")


@router.get("/me", response_model=UserResponse, tags=["Auth"])
def get_me(current_user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's info."""
    return UserResponse(
        username=current_user["username"],
        email=current_user["email"],
        full_name=current_user.get("full_name"),
    )
