import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    rb_officer = "rb_officer"
    pgrc_officer = "pgrc_officer"
    regional_officer = "regional_officer"
    senior_management = "senior_management"


class Bureau(str, enum.Enum):
    RB = "RB"
    PGRC = "PGRC"
    Regional = "Regional"
    Management = "Management"
    Admin = "Admin"
    Joint = "Joint"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), nullable=False)
    bureau: Mapped[Bureau] = mapped_column(SAEnum(Bureau), nullable=False)
    region: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    assigned_complaints = relationship(
        "Complaint", foreign_keys="Complaint.assigned_officer_id", back_populates="assigned_officer"
    )
    actions = relationship("ComplaintAction", back_populates="performed_by_user")
    audit_logs = relationship("AuditLog", back_populates="user")
