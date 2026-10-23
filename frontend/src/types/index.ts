export type UserRole =
  | "admin"
  | "rb_officer"
  | "pgrc_officer"
  | "regional_officer"
  | "senior_management";

export type Bureau = "RB" | "PGRC" | "Regional" | "Management" | "Admin" | "Joint";

export type ComplaintStatus =
  | "new"
  | "under_process"
  | "transferred"
  | "pending_info"
  | "disposed"
  | "closed";

export type ComplaintPriority = "low" | "normal" | "high" | "urgent";

export type ReceivedChannel = "email" | "portal" | "post" | "phone" | "walk_in";

export type ActionType =
  | "created"
  | "status_change"
  | "remark"
  | "transfer"
  | "document_upload"
  | "escalation"
  | "overlap_acknowledged"
  | "disposition";

export interface AuthUser {
  user_id: string;
  username: string;
  full_name: string;
  role: UserRole;
  bureau: Bureau;
  access_token: string;
  refresh_token: string;
}

export interface InstitutionBrief {
  id: string;
  name: string;
  aicte_permanent_id: string | null;
  region: string | null;
  state: string | null;
}

export interface Institution extends InstitutionBrief {
  name_normalized: string;
  institution_type: string | null;
  district: string | null;
  address: string | null;
  approval_status: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  complaint_count: number | null;
}

export interface OfficerBrief {
  id: string;
  full_name: string;
  username: string;
  bureau: string;
}

export interface Complaint {
  id: string;
  case_id: string;
  institution: InstitutionBrief;
  received_date: string;
  received_channel: ReceivedChannel;
  category: string;
  sub_category: string | null;
  description: string;
  complainant_type: string | null;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assigned_bureau: string;
  assigned_officer: OfficerBrief | null;
  last_action_summary: string | null;
  next_action_required: string | null;
  expected_disposal_date: string | null;
  actual_disposal_date: string | null;
  is_overdue: boolean;
  is_escalated: boolean;
  overlap_count: number;
  has_overlap: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplaintAction {
  id: string;
  action_type: ActionType;
  performed_by: string;
  performed_at: string;
  old_status: string | null;
  new_status: string | null;
  remarks: string | null;
  transferred_to_bureau: string | null;
}

export interface OverlapCase {
  id: string;
  case_id: string;
  category: string;
  status: string;
  assigned_bureau: string;
  institution_name: string;
}

export interface Overlap {
  id: string;
  case_a: OverlapCase;
  case_b: OverlapCase;
  match_method: string;
  similarity_score: number;
  detected_at: string;
  acknowledged_by_name: string | null;
  acknowledged_at: string | null;
  resolution_note: string | null;
  is_active: boolean;
}

export interface DashboardSummary {
  total: number;
  new: number;
  under_process: number;
  transferred: number;
  pending_info: number;
  disposed: number;
  closed: number;
  overdue: number;
  overlapping: number;
  escalated: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface TrendDataPoint {
  month: string;
  inflow: number;
  disposed: number;
}

export interface AgeingDataPoint {
  bucket: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  case_id: string;
  institution_name: string;
  action_type: string;
  performed_by: string;
  performed_at: string;
  remarks: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  bureau: Bureau;
  region: string | null;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}
