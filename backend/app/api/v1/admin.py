import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.core.deps import require_admin, get_current_active_user
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse, PasswordChange

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=UserListResponse)
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    users = db.query(User).order_by(User.full_name).all()
    return UserListResponse(
        items=[UserResponse(
            id=str(u.id), username=u.username, email=u.email,
            full_name=u.full_name, role=u.role, bureau=u.bureau,
            region=u.region, is_active=u.is_active,
            created_at=u.created_at, last_login=u.last_login,
        ) for u in users],
        total=len(users),
    )


@router.post("/users", response_model=UserResponse, status_code=201)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(400, "Username already exists")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already exists")

    user = User(
        id=uuid.uuid4(),
        username=data.username,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        role=data.role,
        bureau=data.bureau,
        region=data.region,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(
        id=str(user.id), username=user.username, email=user.email,
        full_name=user.full_name, role=user.role, bureau=user.bureau,
        region=user.region, is_active=user.is_active,
        created_at=user.created_at, last_login=user.last_login,
    )


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    data: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return UserResponse(
        id=str(user.id), username=user.username, email=user.email,
        full_name=user.full_name, role=user.role, bureau=user.bureau,
        region=user.region, is_active=user.is_active,
        created_at=user.created_at, last_login=user.last_login,
    )


@router.put("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if str(user.id) == str(current_admin.id):
        raise HTTPException(400, "Cannot deactivate your own account")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}


@router.get("/audit-log")
def get_audit_log(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    action: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role not in (UserRole.admin, UserRole.senior_management):
        raise HTTPException(403, "Insufficient permissions")

    q = db.query(AuditLog).order_by(AuditLog.performed_at.desc())
    if action:
        q = q.filter(AuditLog.action.ilike(f"%{action}%"))

    total = q.count()
    logs = q.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": str(log.id),
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "ip_address": log.ip_address,
                "endpoint": log.endpoint,
                "performed_at": log.performed_at.isoformat(),
                "user_id": str(log.user_id) if log.user_id else None,
            }
            for log in logs
        ],
        "total": total,
    }


@router.post("/users/{user_id}/change-password")
def change_own_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from app.core.security import verify_password
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(400, "Current password is incorrect")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password updated"}


@router.post("/seed", tags=["Admin"])
def trigger_seed(
    _: User = Depends(require_admin),
):
    """Dev-only: re-seed the database with synthetic data."""
    from app.seed.seed import run_seed
    from app.core.config import settings
    if settings.ENVIRONMENT == "production":
        raise HTTPException(403, "Seeding is disabled in production")
    run_seed()
    return {"message": "Database seeded with synthetic demonstration data"}
