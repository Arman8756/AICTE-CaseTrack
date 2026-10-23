import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, Float, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class MatchMethod(str, enum.Enum):
    aicte_id_exact = "aicte_id_exact"
    name_normalized = "name_normalized"
    keyword_similarity = "keyword_similarity"


class CaseOverlap(Base):
    __tablename__ = "case_overlaps"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    case_id_a: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False, index=True
    )
    case_id_b: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("complaints.id"), nullable=False, index=True
    )
    match_method: Mapped[MatchMethod] = mapped_column(SAEnum(MatchMethod), nullable=False)
    similarity_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    acknowledged_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    acknowledged_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    resolution_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    complaint_a = relationship("Complaint", foreign_keys=[case_id_a], back_populates="overlaps_as_a")
    complaint_b = relationship("Complaint", foreign_keys=[case_id_b], back_populates="overlaps_as_b")
    acknowledged_by_user = relationship("User", foreign_keys=[acknowledged_by])

    __table_args__ = (
        UniqueConstraint("case_id_a", "case_id_b", name="uq_case_overlap_pair"),
    )
