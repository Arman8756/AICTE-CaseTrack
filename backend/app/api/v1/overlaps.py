from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional

from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.models.user import User, UserRole
from app.models.case_overlap import CaseOverlap
from app.models.complaint import Complaint
from app.schemas.overlap import OverlapResponse, OverlapListResponse, AcknowledgeOverlapRequest, OverlapCaseBrief
from app.models.complaint_action import ComplaintAction, ActionType
import uuid

router = APIRouter(prefix="/overlaps", tags=["Overlaps"])


def to_response(ov: CaseOverlap) -> OverlapResponse:
    ca = ov.complaint_a
    cb = ov.complaint_b
    return OverlapResponse(
        id=str(ov.id),
        case_a=OverlapCaseBrief(
            id=str(ca.id),
            case_id=ca.case_id,
            category=ca.category,
            status=ca.status.value,
            assigned_bureau=ca.assigned_bureau,
            institution_name=ca.institution.name if ca.institution else "",
        ),
        case_b=OverlapCaseBrief(
            id=str(cb.id),
            case_id=cb.case_id,
            category=cb.category,
            status=cb.status.value,
            assigned_bureau=cb.assigned_bureau,
            institution_name=cb.institution.name if cb.institution else "",
        ),
        match_method=ov.match_method,
        similarity_score=ov.similarity_score,
        detected_at=ov.detected_at,
        acknowledged_by_name=ov.acknowledged_by_user.full_name if ov.acknowledged_by_user else None,
        acknowledged_at=ov.acknowledged_at,
        resolution_note=ov.resolution_note,
        is_active=ov.is_active,
    )


@router.get("", response_model=OverlapListResponse)
def list_overlaps(
    active_only: bool = Query(True),
    bureau: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    q = db.query(CaseOverlap).options(
        joinedload(CaseOverlap.complaint_a).joinedload(Complaint.institution),
        joinedload(CaseOverlap.complaint_b).joinedload(Complaint.institution),
        joinedload(CaseOverlap.acknowledged_by_user),
    )
    if active_only:
        q = q.filter(CaseOverlap.is_active == True)

    # Bureau scoping — join Complaint only once, combine filters
    bureau_filter = bureau
    role_bureau = None
    if current_user.role in (UserRole.rb_officer, UserRole.pgrc_officer):
        role_bureau = current_user.bureau.value

    if role_bureau or bureau_filter:
        q = q.join(
            Complaint,
            or_(CaseOverlap.case_id_a == Complaint.id, CaseOverlap.case_id_b == Complaint.id),
        )
        if role_bureau:
            q = q.filter(Complaint.assigned_bureau == role_bureau)
        elif bureau_filter:
            q = q.filter(Complaint.assigned_bureau == bureau_filter)

    total = q.count()
    unacknowledged = db.query(CaseOverlap).filter(
        CaseOverlap.is_active == True,
        CaseOverlap.acknowledged_at == None,
    ).count()

    items = (
        q.order_by(CaseOverlap.detected_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return OverlapListResponse(
        items=[to_response(ov) for ov in items],
        total=total,
        unacknowledged_count=unacknowledged,
    )


@router.post("/{overlap_id}/acknowledge", response_model=dict)
def acknowledge_overlap(
    overlap_id: str,
    data: AcknowledgeOverlapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role == UserRole.senior_management:
        raise HTTPException(403, "Read-only access")

    overlap = db.query(CaseOverlap).filter(CaseOverlap.id == overlap_id).first()
    if not overlap:
        raise HTTPException(404, "Overlap record not found")

    overlap.acknowledged_by = current_user.id
    overlap.acknowledged_at = datetime.now(timezone.utc)
    overlap.resolution_note = data.resolution_note

    for cid in [overlap.case_id_a, overlap.case_id_b]:
        action = ComplaintAction(
            id=uuid.uuid4(),
            complaint_id=cid,
            action_type=ActionType.overlap_acknowledged,
            performed_by=current_user.id,
            remarks=f"Overlap acknowledged. Note: {data.resolution_note}",
        )
        db.add(action)

    db.commit()
    return {"message": "Overlap acknowledged"}
