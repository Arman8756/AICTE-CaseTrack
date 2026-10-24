import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class ActionType(str, enum.Enum):
    created = "created"
    status_change = "status_change"
    remark = "remark"
    transfer = "transfer"
    document_upload = "document_upload"
    escalation = "escalation"
    overlap_acknowledged = "overlap_acknowledged"
    disposition = "disposition"


class ComplaintAction(Base):
    __tablename__ = "complaint_actions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    complaint_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False, index=True
    )
    action_type: Mapped[ActionType] = mapped_column(SAEnum(ActionType), nullable=False)
    performed_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    performed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    old_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    new_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    transferred_to_bureau: Mapped[str | None] = mapped_column(String(30), nullable=True)
    transferred_to_officer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )

    # Relationships
    complaint = relationship("Complaint", back_populates="actions")
    performed_by_user = relationship("User", back_populates="actions")
    documents = relationship("Document", back_populates="action")
