import uuid
from datetime import datetime, date, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.db.session import get_db
from app.core.deps import get_current_active_user
from app.models.user import User, UserRole
from app.models.complaint import Complaint, ComplaintStatus, ComplaintPriority
from app.models.complaint_action import ComplaintAction, ActionType
from app.models.institution import Institution
from app.schemas.complaint import (
    ComplaintCreate, ComplaintUpdate, ComplaintResponse, ComplaintListResponse,
    TransferRequest, EscalateRequest, AddActionRequest,
    InstitutionBrief, OfficerBrief,
)
from app.services.case_id import generate_case_id
from app.services.overlap import detect_overlaps_for_complaint

router = APIRouter(prefix="/complaints", tags=["Complaints"])


def apply_role_filter(q, current_user: User, already_joined_institution: bool = False):
    """Apply bureau/region scoping based on user role."""
    if current_user.role in (UserRole.admin, UserRole.senior_management):
        return q
    if current_user.role in (UserRole.rb_officer, UserRole.pgrc_officer):
        return q.filter(Complaint.assigned_bureau == current_user.bureau.value)
    if current_user.role == UserRole.regional_officer:
        if not already_joined_institution:
            q = q.join(Institution, Complaint.institution_id == Institution.id)
        return q.filter(Institution.region == current_user.region)
    return q


def to_response(c: Complaint) -> ComplaintResponse:
    inst = c.institution
    officer = c.assigned_officer
    return ComplaintResponse(
        id=str(c.id),
        case_id=c.case_id,
        institution=InstitutionBrief(
            id=str(inst.id),
            name=inst.name,
            aicte_permanent_id=inst.aicte_permanent_id,
            region=inst.region,
            state=inst.state,
        ),
        received_date=c.received_date,
        received_channel=c.received_channel,
        category=c.category,
        sub_category=c.sub_category,
        description=c.description,
        complainant_type=c.complainant_type,
        priority=c.priority,
        status=c.status,
        assigned_bureau=c.assigned_bureau,
        assigned_officer=OfficerBrief(
            id=str(officer.id),
            full_name=officer.full_name,
            username=officer.username,
            bureau=officer.bureau.value,
        ) if officer else None,
        last_action_summary=c.last_action_summary,
        next_action_required=c.next_action_required,
        expected_disposal_date=c.expected_disposal_date,
        actual_disposal_date=c.actual_disposal_date,
        is_overdue=c.is_overdue,
        is_escalated=c.is_escalated,
        overlap_count=c.overlap_count,
        has_overlap=c.has_overlap,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )


@router.get("", response_model=ComplaintListResponse)
def list_complaints(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    bureau: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    institution_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    overdue_only: bool = Query(False),
    has_overlap: bool = Query(False),
    is_escalated: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Determine if we need to join Institution for filters
    needs_inst_join = bool(search or region) or current_user.role == UserRole.regional_officer

    q = db.query(Complaint).options(
        joinedload(Complaint.institution),
        joinedload(Complaint.assigned_officer),
    )

    # Join Institution once if needed
    if needs_inst_join:
        q = q.join(Institution, Complaint.institution_id == Institution.id)

    # Role-based scoping (pass already_joined=True to avoid double join)
    if current_user.role in (UserRole.admin, UserRole.senior_management):
        pass
    elif current_user.role in (UserRole.rb_officer, UserRole.pgrc_officer):
        q = q.filter(Complaint.assigned_bureau == current_user.bureau.value)
    elif current_user.role == UserRole.regional_officer:
        q = q.filter(Institution.region == current_user.region)

    if search:
        q = q.filter(
            or_(
                Complaint.case_id.ilike(f"%{search}%"),
                Institution.name.ilike(f"%{search}%"),
                Institution.aicte_permanent_id.ilike(f"%{search}%"),
            )
        )
    if region:
        q = q.filter(Institution.region == region)
    if status:
        q = q.filter(Complaint.status == status)
    if bureau:
        q = q.filter(Complaint.assigned_bureau == bureau)
    if category:
        q = q.filter(Complaint.category == category)
    if priority:
        q = q.filter(Complaint.priority == priority)
    if institution_id:
        q = q.filter(Complaint.institution_id == institution_id)
    if date_from:
        q = q.filter(Complaint.received_date >= date_from)
    if date_to:
        q = q.filter(Complaint.received_date <= date_to)
    if overdue_only:
        q = q.filter(Complaint.is_overdue == True)
    if has_overlap:
        q = q.filter(Complaint.has_overlap == True)
    if is_escalated:
        q = q.filter(Complaint.is_escalated == True)

    total = q.count()
    complaints = (
        q.order_by(Complaint.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return ComplaintListResponse(
        items=[to_response(c) for c in complaints],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=ComplaintResponse, status_code=201)
def create_complaint(
    data: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role == UserRole.senior_management:
        raise HTTPException(403, "Senior management cannot create complaints")

    institution = db.query(Institution).filter(Institution.id == data.institution_id).first()
    if not institution:
        raise HTTPException(404, "Institution not found")

    case_id = generate_case_id(db, data.assigned_bureau)

    complaint = Complaint(
        id=uuid.uuid4(),
        case_id=case_id,
        institution_id=institution.id,
        received_date=data.received_date,
        received_channel=data.received_channel,
        category=data.category,
        sub_category=data.sub_category,
        description=data.description,
        complainant_type=data.complainant_type,
        priority=data.priority,
        status=ComplaintStatus.new,
        assigned_bureau=data.assigned_bureau,
        assigned_officer_id=data.assigned_officer_id,
        next_action_required=data.next_action_required,
        expected_disposal_date=data.expected_disposal_date,
        created_by=current_user.id,
    )
    db.add(complaint)
    db.flush()

    # Log creation action
    action = ComplaintAction(
        id=uuid.uuid4(),
        complaint_id=complaint.id,
        action_type=ActionType.created,
        performed_by=current_user.id,
        remarks=f"Case created by {current_user.full_name}",
        new_status=ComplaintStatus.new.value,
    )
    db.add(action)
    db.flush()

    # Run overlap detection
    detect_overlaps_for_complaint(db, complaint)

    db.commit()
    db.refresh(complaint)
    return to_response(complaint)


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    complaint = db.query(Complaint).options(
        joinedload(Complaint.institution),
        joinedload(Complaint.assigned_officer),
    ).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(404, "Complaint not found")
    return to_response(complaint)


@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: str,
    data: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role == UserRole.senior_management:
        raise HTTPException(403, "Read-only access")

    complaint = db.query(Complaint).options(
        joinedload(Complaint.institution),
        joinedload(Complaint.assigned_officer),
    ).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(404, "Complaint not found")

    if current_user.role not in (UserRole.admin,) and complaint.assigned_bureau != current_user.bureau.value:
        raise HTTPException(403, "Cannot edit cases from another bureau")

    update_data = data.model_dump(exclude_unset=True)
    old_status = complaint.status

    for key, value in update_data.items():
        setattr(complaint, key, value)

    if "status" in update_data and update_data["status"] != old_status:
        new_status_val = update_data["status"]
        new_status_str = new_status_val.value if hasattr(new_status_val, "value") else str(new_status_val)
        action = ComplaintAction(
            id=uuid.uuid4(),
            complaint_id=complaint.id,
            action_type=ActionType.status_change,
            performed_by=current_user.id,
            old_status=old_status.value,
            new_status=new_status_str,
            remarks=f"Status updated by {current_user.full_name}",
        )
        db.add(action)
        if new_status_str in ("disposed", "closed") and not complaint.actual_disposal_date:
            complaint.actual_disposal_date = date.today()

    db.commit()
    db.refresh(complaint)
    return to_response(complaint)


@router.post("/{complaint_id}/actions", response_model=dict)
def add_action(
    complaint_id: str,
    data: AddActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role == UserRole.senior_management:
        raise HTTPException(403, "Read-only access")

    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(404, "Complaint not found")

    old_status = complaint.status
    action_type = ActionType.remark

    if data.new_status and data.new_status != old_status:
        action_type = ActionType.status_change
        complaint.status = data.new_status
        if str(data.new_status) in ("disposed", "closed") and not complaint.actual_disposal_date:
            complaint.actual_disposal_date = date.today()

    if data.next_action_required:
        complaint.next_action_required = data.next_action_required

    complaint.last_action_summary = data.remarks

    action = ComplaintAction(
        id=uuid.uuid4(),
        complaint_id=complaint.id,
        action_type=action_type,
        performed_by=current_user.id,
        old_status=old_status.value if data.new_status else None,
        new_status=data.new_status.value if data.new_status else None,
        remarks=data.remarks,
    )
    db.add(action)
    db.commit()
    return {"message": "Action recorded", "action_id": str(action.id)}


@router.post("/{complaint_id}/transfer", response_model=dict)
def transfer_complaint(
    complaint_id: str,
    data: TransferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.role in (UserRole.senior_management, UserRole.regional_officer):
        raise HTTPException(403, "Insufficient permissions to transfer")

    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(404, "Complaint not found")

    old_status = complaint.status  # capture BEFORE modifying
    complaint.assigned_bureau = data.to_bureau
    complaint.status = ComplaintStatus.transferred
    if data.to_officer_id:
        complaint.assigned_officer_id = data.to_officer_id

    action = ComplaintAction(
        id=uuid.uuid4(),
        complaint_id=complaint.id,
        action_type=ActionType.transfer,
        performed_by=current_user.id,
        old_status=old_status.value,
        new_status=ComplaintStatus.transferred.value,
        remarks=data.remarks,
        transferred_to_bureau=data.to_bureau,
        transferred_to_officer_id=data.to_officer_id,
    )
    db.add(action)
    db.commit()
    return {"message": f"Case transferred to {data.to_bureau}"}


@router.post("/{complaint_id}/escalate", response_model=dict)
def escalate_complaint(
    complaint_id: str,
    data: EscalateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(404, "Complaint not found")

    complaint.is_escalated = True
    complaint.escalated_by = current_user.id
    complaint.escalated_at = datetime.now(timezone.utc)

    action = ComplaintAction(
        id=uuid.uuid4(),
        complaint_id=complaint.id,
        action_type=ActionType.escalation,
        performed_by=current_user.id,
        remarks=data.remarks,
    )
    db.add(action)
    db.commit()
    return {"message": "Case escalated"}


@router.get("/{complaint_id}/actions", response_model=list)
def get_actions(
    complaint_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(404, "Complaint not found")

    actions = (
        db.query(ComplaintAction)
        .filter(ComplaintAction.complaint_id == complaint_id)
        .order_by(ComplaintAction.performed_at)
        .all()
    )
    return [
        {
            "id": str(a.id),
            "action_type": a.action_type.value,
            "performed_by": a.performed_by_user.full_name if a.performed_by_user else "System",
            "performed_at": a.performed_at.isoformat(),
            "old_status": a.old_status,
            "new_status": a.new_status,
            "remarks": a.remarks,
            "transferred_to_bureau": a.transferred_to_bureau,
        }
        for a in actions
    ]
