import re
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional
from app.db.session import get_db
from app.core.deps import get_current_active_user, require_admin
from app.models.user import User
from app.models.institution import Institution
from app.models.complaint import Complaint
from app.schemas.institution import (
    InstitutionCreate, InstitutionUpdate, InstitutionResponse, InstitutionListResponse
)

router = APIRouter(prefix="/institutions", tags=["Institutions"])


def normalize(name: str) -> str:
    n = re.sub(r"[^a-z0-9\s]", "", name.lower())
    return re.sub(r"\s+", " ", n).strip()


def to_response(inst: Institution, db: Session) -> InstitutionResponse:
    count = db.query(func.count(Complaint.id)).filter(Complaint.institution_id == inst.id).scalar()
    r = InstitutionResponse(
        id=str(inst.id),
        aicte_permanent_id=inst.aicte_permanent_id,
        name=inst.name,
        name_normalized=inst.name_normalized,
        institution_type=inst.institution_type,
        state=inst.state,
        region=inst.region,
        district=inst.district,
        address=inst.address,
        approval_status=inst.approval_status,
        contact_email=inst.contact_email,
        contact_phone=inst.contact_phone,
        is_active=inst.is_active,
        created_at=inst.created_at,
        complaint_count=count,
    )
    return r


@router.get("", response_model=InstitutionListResponse)
def list_institutions(
    search: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    institution_type: Optional[str] = Query(None),
    approval_status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    q = db.query(Institution).filter(Institution.is_active == True)
    if search:
        norm = normalize(search)
        q = q.filter(
            or_(
                Institution.name.ilike(f"%{search}%"),
                Institution.aicte_permanent_id.ilike(f"%{search}%"),
                Institution.name_normalized.ilike(f"%{norm}%"),
            )
        )
    if region:
        q = q.filter(Institution.region == region)
    if state:
        q = q.filter(Institution.state == state)
    if institution_type:
        q = q.filter(Institution.institution_type == institution_type)
    if approval_status:
        q = q.filter(Institution.approval_status == approval_status)

    total = q.count()
    institutions = q.order_by(Institution.name).offset((page - 1) * page_size).limit(page_size).all()

    return InstitutionListResponse(
        items=[to_response(i, db) for i in institutions],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=InstitutionResponse, status_code=201)
def create_institution(
    data: InstitutionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if data.aicte_permanent_id:
        existing = db.query(Institution).filter(
            Institution.aicte_permanent_id == data.aicte_permanent_id
        ).first()
        if existing:
            raise HTTPException(400, "AICTE Permanent ID already registered")

    inst = Institution(
        name=data.name,
        name_normalized=normalize(data.name),
        aicte_permanent_id=data.aicte_permanent_id,
        institution_type=data.institution_type,
        state=data.state,
        region=data.region,
        district=data.district,
        address=data.address,
        approval_status=data.approval_status or "Approved",
        contact_email=data.contact_email,
        contact_phone=data.contact_phone,
    )
    db.add(inst)
    db.commit()
    db.refresh(inst)
    return to_response(inst, db)


@router.get("/{institution_id}", response_model=InstitutionResponse)
def get_institution(
    institution_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(404, "Institution not found")
    return to_response(inst, db)


@router.put("/{institution_id}", response_model=InstitutionResponse)
def update_institution(
    institution_id: str,
    data: InstitutionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    inst = db.query(Institution).filter(Institution.id == institution_id).first()
    if not inst:
        raise HTTPException(404, "Institution not found")

    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data:
        update_data["name_normalized"] = normalize(update_data["name"])
    for key, value in update_data.items():
        setattr(inst, key, value)

    db.commit()
    db.refresh(inst)
    return to_response(inst, db)
