from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from app.models.complaint import ComplaintStatus, ComplaintPriority, ReceivedChannel


class ComplaintCreate(BaseModel):
    institution_id: str
    received_date: date
    received_channel: ReceivedChannel
    category: str
    sub_category: Optional[str] = None
    description: str
    complainant_type: Optional[str] = None
    priority: ComplaintPriority = ComplaintPriority.normal
    assigned_bureau: str
    assigned_officer_id: Optional[str] = None
    expected_disposal_date: Optional[date] = None
    next_action_required: Optional[str] = None


class ComplaintUpdate(BaseModel):
    category: Optional[str] = None
    sub_category: Optional[str] = None
    description: Optional[str] = None
    complainant_type: Optional[str] = None
    priority: Optional[ComplaintPriority] = None
    status: Optional[ComplaintStatus] = None
    assigned_bureau: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    last_action_summary: Optional[str] = None
    next_action_required: Optional[str] = None
    expected_disposal_date: Optional[date] = None
    actual_disposal_date: Optional[date] = None


class InstitutionBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    aicte_permanent_id: Optional[str] = None
    region: Optional[str] = None
    state: Optional[str] = None


class OfficerBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    username: str
    bureau: str


class ComplaintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    case_id: str
    institution: InstitutionBrief
    received_date: date
    received_channel: ReceivedChannel
    category: str
    sub_category: Optional[str] = None
    description: str
    complainant_type: Optional[str] = None
    priority: ComplaintPriority
    status: ComplaintStatus
    assigned_bureau: str
    assigned_officer: Optional[OfficerBrief] = None
    last_action_summary: Optional[str] = None
    next_action_required: Optional[str] = None
    expected_disposal_date: Optional[date] = None
    actual_disposal_date: Optional[date] = None
    is_overdue: bool
    is_escalated: bool
    overlap_count: int
    has_overlap: bool
    created_at: datetime
    updated_at: datetime


class ComplaintListResponse(BaseModel):
    items: List[ComplaintResponse]
    total: int
    page: int
    page_size: int


class TransferRequest(BaseModel):
    to_bureau: str
    to_officer_id: Optional[str] = None
    remarks: str


class EscalateRequest(BaseModel):
    remarks: str


class AddActionRequest(BaseModel):
    remarks: str
    new_status: Optional[ComplaintStatus] = None
    next_action_required: Optional[str] = None
