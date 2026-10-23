from pydantic import BaseModel
from typing import List


class DashboardSummary(BaseModel):
    total: int
    new: int
    under_process: int
    transferred: int
    pending_info: int
    disposed: int
    closed: int
    overdue: int
    overlapping: int
    escalated: int


class ChartDataPoint(BaseModel):
    label: str
    value: int


class TrendDataPoint(BaseModel):
    month: str
    inflow: int
    disposed: int


class AgeingDataPoint(BaseModel):
    bucket: str
    count: int


class RecentActivity(BaseModel):
    id: str
    case_id: str
    institution_name: str
    action_type: str
    performed_by: str
    performed_at: str
    remarks: str
