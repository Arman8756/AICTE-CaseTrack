from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from datetime import date, timedelta
from typing import Optional

from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ComplaintStatus
from app.models.complaint_action import ComplaintAction
from app.models.case_overlap import CaseOverlap
from app.models.institution import Institution
from app.schemas.dashboard import (
    DashboardSummary, ChartDataPoint, TrendDataPoint, AgeingDataPoint, RecentActivity
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def apply_scope(q, current_user: User, db: Session):
    if current_user.role in (UserRole.admin, UserRole.senior_management):
        return q
    if current_user.role in (UserRole.rb_officer, UserRole.pgrc_officer):
        return q.filter(Complaint.assigned_bureau == current_user.bureau.value)
    if current_user.role == UserRole.regional_officer:
        return q.join(Institution).filter(Institution.region == current_user.region)
    return q


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    base = db.query(Complaint)
    base = apply_scope(base, current_user, db)

    total = base.count()
    new = base.filter(Complaint.status == ComplaintStatus.new).count()
    under_process = base.filter(Complaint.status == ComplaintStatus.under_process).count()
    transferred = base.filter(Complaint.status == ComplaintStatus.transferred).count()
    pending_info = base.filter(Complaint.status == ComplaintStatus.pending_info).count()
    disposed = base.filter(Complaint.status == ComplaintStatus.disposed).count()
    closed = base.filter(Complaint.status == ComplaintStatus.closed).count()
    overdue = base.filter(Complaint.is_overdue == True).count()
    overlapping = base.filter(Complaint.has_overlap == True).count()
    escalated = base.filter(Complaint.is_escalated == True).count()

    return DashboardSummary(
        total=total, new=new, under_process=under_process,
        transferred=transferred, pending_info=pending_info,
        disposed=disposed, closed=closed, overdue=overdue,
        overlapping=overlapping, escalated=escalated,
    )


@router.get("/charts/status", response_model=list[ChartDataPoint])
def chart_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    q = db.query(Complaint.status, func.count(Complaint.id).label("cnt"))
    q = apply_scope(q, current_user, db)
    rows = q.group_by(Complaint.status).all()
    return [ChartDataPoint(label=r.status.value.replace("_", " ").title(), value=r.cnt) for r in rows]


@router.get("/charts/bureau", response_model=list[ChartDataPoint])
def chart_bureau(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    q = db.query(Complaint.assigned_bureau, func.count(Complaint.id).label("cnt"))
    q = apply_scope(q, current_user, db)
    rows = q.group_by(Complaint.assigned_bureau).all()
    return [ChartDataPoint(label=r.assigned_bureau, value=r.cnt) for r in rows]


@router.get("/charts/region", response_model=list[ChartDataPoint])
def chart_region(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    q = (
        db.query(Institution.region, func.count(Complaint.id).label("cnt"))
        .join(Complaint, Complaint.institution_id == Institution.id)
    )
    if current_user.role in (UserRole.rb_officer, UserRole.pgrc_officer):
        q = q.filter(Complaint.assigned_bureau == current_user.bureau.value)
    elif current_user.role == UserRole.regional_officer:
        q = q.filter(Institution.region == current_user.region)
    rows = q.group_by(Institution.region).all()
    return [ChartDataPoint(label=r.region or "Unknown", value=r.cnt) for r in rows]


@router.get("/charts/ageing", response_model=list[AgeingDataPoint])
def chart_ageing(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    today = date.today()
    q = db.query(Complaint).filter(
        Complaint.status.notin_([ComplaintStatus.disposed, ComplaintStatus.closed])
    )
    q = apply_scope(q, current_user, db)
    complaints = q.all()

    buckets = {"0-15 days": 0, "16-30 days": 0, "31-60 days": 0, "60+ days": 0}
    for c in complaints:
        age = (today - c.received_date).days
        if age <= 15:
            buckets["0-15 days"] += 1
        elif age <= 30:
            buckets["16-30 days"] += 1
        elif age <= 60:
            buckets["31-60 days"] += 1
        else:
            buckets["60+ days"] += 1

    return [AgeingDataPoint(bucket=k, count=v) for k, v in buckets.items()]


@router.get("/charts/trend", response_model=list[TrendDataPoint])
def chart_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from sqlalchemy import cast, String
    # Last 12 months
    results = []
    today = date.today()
    for i in range(11, -1, -1):
        first = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        if first.month == 12:
            last = first.replace(year=first.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            last = first.replace(month=first.month + 1, day=1) - timedelta(days=1)

        base = db.query(Complaint)
        base = apply_scope(base, current_user, db)

        inflow = base.filter(
            Complaint.received_date >= first,
            Complaint.received_date <= last,
        ).count()
        disposed = base.filter(
            Complaint.actual_disposal_date >= first,
            Complaint.actual_disposal_date <= last,
        ).count()
        results.append(TrendDataPoint(
            month=first.strftime("%b %Y"),
            inflow=inflow,
            disposed=disposed,
        ))
    return results


@router.get("/recent-activity", response_model=list[RecentActivity])
def recent_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from sqlalchemy.orm import joinedload
    actions = (
        db.query(ComplaintAction)
        .options(
            joinedload(ComplaintAction.complaint).joinedload(Complaint.institution),
            joinedload(ComplaintAction.performed_by_user),
        )
        .order_by(ComplaintAction.performed_at.desc())
        .limit(20)
        .all()
    )
    result = []
    for a in actions:
        result.append(RecentActivity(
            id=str(a.id),
            case_id=a.complaint.case_id if a.complaint else "",
            institution_name=a.complaint.institution.name if a.complaint and a.complaint.institution else "",
            action_type=a.action_type.value,
            performed_by=a.performed_by_user.full_name if a.performed_by_user else "System",
            performed_at=a.performed_at.isoformat(),
            remarks=a.remarks or "",
        ))
    return result
