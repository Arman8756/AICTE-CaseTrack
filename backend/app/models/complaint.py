import uuid
import enum
from datetime import datetime, date, timezone
from sqlalchemy import (
    String, Boolean, DateTime, Date, Text, Integer, ForeignKey,
    Enum as SAEnum, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class ComplaintStatus(str, enum.Enum):
    new = "new"
    under_process = "under_process"
    transferred = "transferred"
    pending_info = "pending_info"
    disposed = "disposed"
    closed = "closed"


class ComplaintPriority(str, enum.Enum):
    low = "low"
    normal = "normal"
    high = "high"
    urgent = "urgent"


class ReceivedChannel(str, enum.Enum):
    email = "email"
    portal = "portal"
    post = "post"
    phone = "phone"
    walk_in = "walk_in"


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    case_id: Mapped[str] = mapped_column(String(30), unique=True, nullable=False, index=True)
    institution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("institutions.id"), nullable=False, index=True
    )
    received_date: Mapped[date] = mapped_column(Date, nullable=False)
    received_channel: Mapped[ReceivedChannel] = mapped_column(
        SAEnum(ReceivedChannel), nullable=False
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    sub_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    complainant_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    priority: Mapped[ComplaintPriority] = mapped_column(
        SAEnum(ComplaintPriority), default=ComplaintPriority.normal, nullable=False
    )
    status: Mapped[ComplaintStatus] = mapped_column(
        SAEnum(ComplaintStatus), default=ComplaintStatus.new, nullable=False, index=True
    )
    assigned_bureau: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    assigned_officer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    last_action_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_action_required: Mapped[str | None] = mapped_column(Text, nullable=True)
    expected_disposal_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    actual_disposal_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_overdue: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_escalated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    escalated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    escalated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    overlap_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    has_overlap: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    institution = relationship("Institution", back_populates="complaints")
    assigned_officer = relationship(
        "User", foreign_keys=[assigned_officer_id], back_populates="assigned_complaints"
    )
    created_by_user = relationship("User", foreign_keys=[created_by])
    escalated_by_user = relationship("User", foreign_keys=[escalated_by])
    actions = relationship(
        "ComplaintAction", back_populates="complaint", order_by="ComplaintAction.performed_at"
    )
    documents = relationship("Document", back_populates="complaint")
    overlaps_as_a = relationship(
        "CaseOverlap", foreign_keys="CaseOverlap.case_id_a", back_populates="complaint_a"
    )
    overlaps_as_b = relationship(
        "CaseOverlap", foreign_keys="CaseOverlap.case_id_b", back_populates="complaint_b"
    )

    __table_args__ = (
        Index("ix_complaints_bureau_status", "assigned_bureau", "status"),
    )
