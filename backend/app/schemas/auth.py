from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole, Bureau


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    bureau: str
    full_name: str
    user_id: str


class RefreshRequest(BaseModel):
    refresh_token: str


class UserProfileResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: UserRole
    bureau: Bureau
    region: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True
