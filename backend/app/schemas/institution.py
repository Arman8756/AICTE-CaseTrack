from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
import re


def normalize_name(name: str) -> str:
    normalized = re.sub(r"[^a-z0-9\s]", "", name.lower())
    return re.sub(r"\s+", " ", normalized).strip()


class InstitutionBase(BaseModel):
    aicte_permanent_id: Optional[str] = None
    name: str
    institution_type: Optional[str] = None
    state: Optional[str] = None
    region: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    approval_status: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    institution_type: Optional[str] = None
    state: Optional[str] = None
    region: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    approval_status: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: Optional[bool] = None


class InstitutionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    aicte_permanent_id: Optional[str] = None
    name: str
    name_normalized: str
    institution_type: Optional[str] = None
    state: Optional[str] = None
    region: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    approval_status: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: bool
    created_at: datetime
    complaint_count: Optional[int] = None


class InstitutionListResponse(BaseModel):
    items: list[InstitutionResponse]
    total: int
    page: int
    page_size: int
