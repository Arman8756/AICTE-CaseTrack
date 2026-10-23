"""Generates unique AICTE Case IDs."""
from datetime import date
from sqlalchemy.orm import Session
from app.models.complaint import Complaint


def generate_case_id(db: Session, bureau: str, year: int | None = None) -> str:
    """Generate AICTE-YYYY-BUREAU-NNNNNN format case ID."""
    if year is None:
        year = date.today().year

    bureau_code = bureau.upper().replace(" ", "")[:6]
    prefix = f"AICTE-{year}-{bureau_code}-"

    # Count existing complaints with this prefix to derive sequence
    count = (
        db.query(Complaint)
        .filter(Complaint.case_id.like(f"{prefix}%"))
        .count()
    )
    sequence = count + 1
    return f"{prefix}{sequence:06d}"
