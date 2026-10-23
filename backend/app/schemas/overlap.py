from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.case_overlap import MatchMethod


class OverlapCaseBrief(BaseModel):
    id: str
    case_id: str
    category: str
    status: str
    assigned_bureau: str
    institution_name: str

    class Config:
        from_attributes = True


class OverlapResponse(BaseModel):
    id: str
    case_a: OverlapCaseBrief
    case_b: OverlapCaseBrief
    match_method: MatchMethod
    similarity_score: float
    detected_at: datetime
    acknowledged_by_name: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolution_note: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class OverlapListResponse(BaseModel):
    items: List[OverlapResponse]
    total: int
    unacknowledged_count: int


class AcknowledgeOverlapRequest(BaseModel):
    resolution_note: str
