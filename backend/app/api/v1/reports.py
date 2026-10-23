import csv
import io
from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ComplaintStatus
from app.models.institution import Institution

router = APIRouter(prefix="/reports", tags=["Reports"])


def base_query(db, current_user):
    q = db.query(Complaint)
    if current_user.role in (UserRole.rb_officer, UserRole.pgrc_officer):
        q = q.filter(Complaint.assigned_bureau == current_user.bureau.value)
    elif current_user.role == UserRole.regional_officer:
        q = q.join(Institution).filter(Institution.region == current_user.region)
    return q


@router.get("/institution-summary")
def institution_summary(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    q = (
        db.query(
            Institution.id,
            Institution.name,
            Institution.aicte_permanent_id,
            Institution.region,
            func.count(Complaint.id).label("total"),
            func.sum(func.cast(Complaint.status == ComplaintStatus.disposed, db.bind.dialect.name == "postgresql" and "integer" or "integer")).label("disposed"),
        )
        .join(Complaint, Complaint.institution_id == Institution.id, isouter=True)
        .group_by(Institution.id, Institution.name, Institution.aicte_permanent_id, Institution.region)
    )
    rows = q.all()
    return [
        {
            "institution_id": str(r.id),
            "name": r.name,
            "aicte_id": r.aicte_permanent_id,
            "region": r.region,
            "total": r.total or 0,
        }
        for r in rows
    ]


@router.get("/region-summary")
def region_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    q = (
        db.query(Institution.region, func.count(Complaint.id).label("total"))
        .join(Complaint, Complaint.institution_id == Institution.id, isouter=True)
        .group_by(Institution.region)
    )
    rows = q.all()
    return [{"region": r.region or "Unknown", "total": r.total} for r in rows]


@router.get("/bureau-summary")
def bureau_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    q = db.query(
        Complaint.assigned_bureau,
        Complaint.status,
        func.count(Complaint.id).label("cnt"),
    ).group_by(Complaint.assigned_bureau, Complaint.status)
    rows = q.all()

    summary: dict = {}
    for r in rows:
        bureau = r.assigned_bureau
        if bureau not in summary:
            summary[bureau] = {"bureau": bureau, "total": 0}
        summary[bureau][r.status.value] = r.cnt
        summary[bureau]["total"] += r.cnt
    return list(summary.values())


@router.get("/ageing")
def ageing_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    today = date.today()
    q = base_query(db, current_user).filter(
        Complaint.status.notin_([ComplaintStatus.disposed, ComplaintStatus.closed])
    )
    complaints = q.all()
    rows = []
    for c in complaints:
        age = (today - c.received_date).days
        rows.append({
            "case_id": c.case_id,
            "age_days": age,
            "bureau": c.assigned_bureau,
            "status": c.status.value,
            "priority": c.priority.value,
            "is_overdue": c.is_overdue,
        })
    return sorted(rows, key=lambda x: x["age_days"], reverse=True)


@router.get("/disposal-rate")
def disposal_rate(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    results = []
    today = date.today()
    for i in range(5, -1, -1):
        first = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        if first.month == 12:
            last = first.replace(year=first.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            last = first.replace(month=first.month + 1, day=1) - timedelta(days=1)

        q = base_query(db, current_user)
        received = q.filter(Complaint.received_date >= first, Complaint.received_date <= last).count()
        disposed = q.filter(Complaint.actual_disposal_date >= first, Complaint.actual_disposal_date <= last).count()
        results.append({
            "period": first.strftime("%b %Y"),
            "received": received,
            "disposed": disposed,
            "rate_pct": round(disposed / received * 100, 1) if received else 0,
        })
    return results


@router.get("/export/csv")
def export_csv(
    status: Optional[str] = Query(None),
    bureau: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from sqlalchemy.orm import joinedload
    q = db.query(Complaint).options(
        joinedload(Complaint.institution),
        joinedload(Complaint.assigned_officer),
    )
    q = base_query(db, current_user)
    if status:
        q = q.filter(Complaint.status == status)
    if bureau:
        q = q.filter(Complaint.assigned_bureau == bureau)
    if date_from:
        q = q.filter(Complaint.received_date >= date_from)
    if date_to:
        q = q.filter(Complaint.received_date <= date_to)

    complaints = q.options(
        joinedload(Complaint.institution),
        joinedload(Complaint.assigned_officer),
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Case ID", "Institution", "AICTE ID", "Region", "Category",
        "Status", "Bureau", "Priority", "Received Date",
        "Expected Disposal", "Is Overdue", "Has Overlap",
    ])
    for c in complaints:
        writer.writerow([
            c.case_id,
            c.institution.name if c.institution else "",
            c.institution.aicte_permanent_id if c.institution else "",
            c.institution.region if c.institution else "",
            c.category,
            c.status.value,
            c.assigned_bureau,
            c.priority.value,
            c.received_date,
            c.expected_disposal_date or "",
            c.is_overdue,
            c.has_overlap,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=complaints_export.csv"},
    )
