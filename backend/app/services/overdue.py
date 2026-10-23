"""Updates is_overdue flag on complaints."""
from datetime import date
from sqlalchemy.orm import Session
from app.models.complaint import Complaint, ComplaintStatus


TERMINAL_STATUSES = [ComplaintStatus.disposed, ComplaintStatus.closed]


def refresh_overdue_flags(db: Session) -> int:
    today = date.today()
    updated = (
        db.query(Complaint)
        .filter(
            Complaint.expected_disposal_date < today,
            Complaint.status.notin_(TERMINAL_STATUSES),
            Complaint.is_overdue == False,
        )
        .update({"is_overdue": True})
    )
    db.commit()
    return updated
