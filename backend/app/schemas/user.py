from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, Bureau


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    role: UserRole
    bureau: Bureau
    region: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    bureau: Optional[Bureau] = None
    region: Optional[str] = None
    is_active: Optional[bool] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    email: str
    full_name: str
    role: UserRole
    bureau: Bureau
    region: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
