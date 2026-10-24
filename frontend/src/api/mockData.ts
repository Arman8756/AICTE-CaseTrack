import type {
  DashboardSummary, ChartDataPoint, TrendDataPoint,
  AgeingDataPoint, RecentActivity, Complaint, Institution,
  Overlap, User,
} from "../types";

// ─── Users ───────────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  { id: "u1", username: "admin", email: "admin@aicte.gov.in", full_name: "System Administrator", role: "admin", bureau: "Admin", region: null, is_active: true, created_at: "2025-01-01T00:00:00Z", last_login: "2026-10-24T08:30:00Z" },
  { id: "u2", username: "rb_officer1", email: "rb.officer1@aicte.gov.in", full_name: "Rajesh Kumar Sharma", role: "rb_officer", bureau: "RB", region: null, is_active: true, created_at: "2025-01-02T00:00:00Z", last_login: "2026-10-23T10:00:00Z" },
  { id: "u3", username: "rb_officer2", email: "rb.officer2@aicte.gov.in", full_name: "Sunita Devi Patel", role: "rb_officer", bureau: "RB", region: null, is_active: true, created_at: "2025-01-02T00:00:00Z", last_login: "2026-10-22T14:00:00Z" },
  { id: "u4", username: "pgrc_officer1", email: "pgrc.officer1@aicte.gov.in", full_name: "Anita Krishnamurthy", role: "pgrc_officer", bureau: "PGRC", region: null, is_active: true, created_at: "2025-01-03T00:00:00Z", last_login: "2026-10-24T09:00:00Z" },
  { id: "u5", username: "pgrc_officer2", email: "pgrc.officer2@aicte.gov.in", full_name: "Mohammed Rafi Ahmed", role: "pgrc_officer", bureau: "PGRC", region: null, is_active: true, created_at: "2025-01-03T00:00:00Z", last_login: "2026-10-21T11:00:00Z" },
  { id: "u6", username: "regional_north", email: "regional.north@aicte.gov.in", full_name: "Vikram Singh Rawat", role: "regional_officer", bureau: "Regional", region: "North", is_active: true, created_at: "2025-01-04T00:00:00Z", last_login: "2026-10-20T09:00:00Z" },
  { id: "u7", username: "regional_south", email: "regional.south@aicte.gov.in", full_name: "Lakshmi Narayanan", role: "regional_officer", bureau: "Regional", region: "South", is_active: true, created_at: "2025-01-04T00:00:00Z", last_login: "2026-10-19T08:00:00Z" },
  { id: "u8", username: "senior_mgmt", email: "director@aicte.gov.in", full_name: "Dr. Arun Prasad", role: "senior_management", bureau: "Management", region: null, is_active: true, created_at: "2025-01-05T00:00:00Z", last_login: "2026-10-24T07:30:00Z" },
];

// ─── Institutions ─────────────────────────────────────────────────────────────
export const MOCK_INSTITUTIONS: Institution[] = [
  { id: "i1", aicte_permanent_id: "1-1000001", name: "Apex Institute of Technology", name_normalized: "apex institute of technology", institution_type: "Engineering", state: "Delhi", region: "North", district: "Delhi District", address: "Plot 1, Industrial Area, Delhi", approval_status: "Approved", contact_email: "principal@apexinstitute.ac.in", contact_phone: "+91-9876543210", is_active: true, created_at: "2024-01-01T00:00:00Z", complaint_count: 8 },
  { id: "i2", aicte_permanent_id: "1-1000002", name: "Bharat College of Engineering", name_normalized: "bharat college of engineering", institution_type: "Engineering", state: "Maharashtra", region: "West", district: "Pune District", address: "Plot 2, Industrial Area, Maharashtra", approval_status: "Approved", contact_email: "principal@bharatcollege.ac.in", contact_phone: "+91-9876543211", is_active: true, created_at: "2024-01-02T00:00:00Z", complaint_count: 5 },
  { id: "i3", aicte_permanent_id: "1-1000003", name: "Central Engineering College", name_normalized: "central engineering college", institution_type: "Engineering", state: "Madhya Pradesh", region: "Central", district: "Bhopal District", address: "Plot 3, Industrial Area, MP", approval_status: "Conditionally Approved", contact_email: "principal@centraleng.ac.in", contact_phone: "+91-9876543212", is_active: true, created_at: "2024-01-03T00:00:00Z", complaint_count: 12 },
  { id: "i4", aicte_permanent_id: "1-1000004", name: "Delhi Institute of Advanced Studies", name_normalized: "delhi institute of advanced studies", institution_type: "MBA", state: "Delhi", region: "North", district: "Delhi District", address: "Plot 4, Industrial Area, Delhi", approval_status: "Approved", contact_email: "principal@dias.ac.in", contact_phone: "+91-9876543213", is_active: true, created_at: "2024-01-04T00:00:00Z", complaint_count: 3 },
  { id: "i5", aicte_permanent_id: "1-1000005", name: "Eastern Technical University", name_normalized: "eastern technical university", institution_type: "Engineering", state: "West Bengal", region: "East", district: "Kolkata District", address: "Plot 5, Industrial Area, WB", approval_status: "Debarred", contact_email: "principal@etu.ac.in", contact_phone: "+91-9876543214", is_active: true, created_at: "2024-01-05T00:00:00Z", complaint_count: 15 },
  { id: "i6", aicte_permanent_id: "1-1000006", name: "Global Institute of Technology", name_normalized: "global institute of technology", institution_type: "Engineering", state: "Karnataka", region: "South", district: "Bangalore District", address: "Plot 6, Industrial Area, Karnataka", approval_status: "Approved", contact_email: "principal@git.ac.in", contact_phone: "+91-9876543215", is_active: true, created_at: "2024-01-06T00:00:00Z", complaint_count: 6 },
  { id: "i7", aicte_permanent_id: "1-1000007", name: "Heritage Engineering College", name_normalized: "heritage engineering college", institution_type: "Engineering", state: "Tamil Nadu", region: "South", district: "Chennai District", address: "Plot 7, Industrial Area, TN", approval_status: "Approved", contact_email: "principal@heritage.ac.in", contact_phone: "+91-9876543216", is_active: true, created_at: "2024-01-07T00:00:00Z", complaint_count: 7 },
  { id: "i8", aicte_permanent_id: "1-1000008", name: "Imperial College of Technology", name_normalized: "imperial college of technology", institution_type: "Pharmacy", state: "Gujarat", region: "West", district: "Ahmedabad District", address: "Plot 8, Industrial Area, Gujarat", approval_status: "Approved", contact_email: "principal@imperial.ac.in", contact_phone: "+91-9876543217", is_active: true, created_at: "2024-01-08T00:00:00Z", complaint_count: 4 },
  { id: "i9", aicte_permanent_id: "1-1000009", name: "Jyoti Institute of Engineering", name_normalized: "jyoti institute of engineering", institution_type: "Engineering", state: "Rajasthan", region: "West", district: "Jaipur District", address: "Plot 9, Industrial Area, Rajasthan", approval_status: "Conditionally Approved", contact_email: "principal@jyoti.ac.in", contact_phone: "+91-9876543218", is_active: true, created_at: "2024-01-09T00:00:00Z", complaint_count: 9 },
  { id: "i10", aicte_permanent_id: "1-1000010", name: "Kiran College of Engineering", name_normalized: "kiran college of engineering", institution_type: "Architecture", state: "Haryana", region: "North", district: "Gurgaon District", address: "Plot 10, Industrial Area, Haryana", approval_status: "Approved", contact_email: "principal@kiran.ac.in", contact_phone: "+91-9876543219", is_active: true, created_at: "2024-01-10T00:00:00Z", complaint_count: 2 },
];

// ─── Complaints ───────────────────────────────────────────────────────────────

export const MOCK_COMPLAINTS: Complaint[] = [
  { id: "c1", case_id: "AICTE-2026-RB-000001", institution: { id: "i1", name: "Apex Institute of Technology", aicte_permanent_id: "1-1000001", region: "North", state: "Delhi" }, received_date: "2026-08-15", received_channel: "email", category: "Fee Regulation Violation", sub_category: null, description: "The institution has allegedly collected excess fees from students beyond the AICTE approved fee structure for the academic year 2026-27.", complainant_type: "Student", priority: "high", status: "under_process", assigned_bureau: "RB", assigned_officer: { id: "u2", full_name: "Rajesh Kumar Sharma", username: "rb_officer1", bureau: "RB" }, last_action_summary: "Show cause notice issued to institution.", next_action_required: "Await institution response within 15 days.", expected_disposal_date: "2026-11-15", actual_disposal_date: null, is_overdue: false, is_escalated: false, overlap_count: 1, has_overlap: true, created_at: "2026-08-15T09:00:00Z", updated_at: "2026-10-10T14:30:00Z" },
  { id: "c2", case_id: "AICTE-2026-PGRC-000001", institution: { id: "i1", name: "Apex Institute of Technology", aicte_permanent_id: "1-1000001", region: "North", state: "Delhi" }, received_date: "2026-08-20", received_channel: "portal", category: "Fee Regulation Violation", sub_category: null, description: "Complaint regarding excess fee collection by institution. Students demanded refund of excess amount charged.", complainant_type: "Parent", priority: "high", status: "new", assigned_bureau: "PGRC", assigned_officer: { id: "u4", full_name: "Anita Krishnamurthy", username: "pgrc_officer1", bureau: "PGRC" }, last_action_summary: "Case registered and under review.", next_action_required: "Coordinate with RB on overlap.", expected_disposal_date: "2026-11-20", actual_disposal_date: null, is_overdue: false, is_escalated: false, overlap_count: 1, has_overlap: true, created_at: "2026-08-20T10:00:00Z", updated_at: "2026-10-12T09:00:00Z" },
  { id: "c3", case_id: "AICTE-2026-RB-000002", institution: { id: "i3", name: "Central Engineering College", aicte_permanent_id: "1-1000003", region: "Central", state: "Madhya Pradesh" }, received_date: "2026-07-10", received_channel: "post", category: "Faculty Shortage", sub_category: null, description: "The institution is running courses without the requisite number of qualified faculty members as per AICTE norms.", complainant_type: "Faculty", priority: "urgent", status: "under_process", assigned_bureau: "RB", assigned_officer: { id: "u2", full_name: "Rajesh Kumar Sharma", username: "rb_officer1", bureau: "RB" }, last_action_summary: "Site inspection scheduled.", next_action_required: "Complete inspection report.", expected_disposal_date: "2026-09-10", actual_disposal_date: null, is_overdue: true, is_escalated: true, overlap_count: 0, has_overlap: false, created_at: "2026-07-10T09:00:00Z", updated_at: "2026-10-01T11:00:00Z" },
  { id: "c4", case_id: "AICTE-2026-PGRC-000002", institution: { id: "i5", name: "Eastern Technical University", aicte_permanent_id: "1-1000005", region: "East", state: "West Bengal" }, received_date: "2026-06-05", received_channel: "email", category: "Admission Irregularities", sub_category: null, description: "Management quota seats being sold at premium prices. Admission process not transparent.", complainant_type: "Student", priority: "high", status: "transferred", assigned_bureau: "PGRC", assigned_officer: { id: "u4", full_name: "Anita Krishnamurthy", username: "pgrc_officer1", bureau: "PGRC" }, last_action_summary: "Transferred from RB after initial review.", next_action_required: "Prepare disposal note.", expected_disposal_date: "2026-08-05", actual_disposal_date: null, is_overdue: true, is_escalated: false, overlap_count: 0, has_overlap: false, created_at: "2026-06-05T09:00:00Z", updated_at: "2026-09-15T10:00:00Z" },
  { id: "c5", case_id: "AICTE-2025-RB-000042", institution: { id: "i2", name: "Bharat College of Engineering", aicte_permanent_id: "1-1000002", region: "West", state: "Maharashtra" }, received_date: "2025-11-20", received_channel: "portal", category: "Infrastructure Deficiency", sub_category: null, description: "Institution lacks basic lab facilities and library resources as required by AICTE norms.", complainant_type: "Student", priority: "normal", status: "disposed", assigned_bureau: "RB", assigned_officer: { id: "u3", full_name: "Sunita Devi Patel", username: "rb_officer2", bureau: "RB" }, last_action_summary: "Institution has submitted compliance report. Case disposed after verification.", next_action_required: null, expected_disposal_date: "2026-02-20", actual_disposal_date: "2026-02-15", is_overdue: false, is_escalated: false, overlap_count: 0, has_overlap: false, created_at: "2025-11-20T09:00:00Z", updated_at: "2026-02-15T16:00:00Z" },
  { id: "c6", case_id: "AICTE-2026-RB-000003", institution: { id: "i6", name: "Global Institute of Technology", aicte_permanent_id: "1-1000006", region: "South", state: "Karnataka" }, received_date: "2026-09-01", received_channel: "email", category: "Affiliation Issues", sub_category: null, description: "Institution operating courses not affiliated with any recognised university.", complainant_type: "Public", priority: "urgent", status: "new", assigned_bureau: "RB", assigned_officer: null, last_action_summary: null, next_action_required: "Assign officer and review affiliation documents.", expected_disposal_date: "2026-12-01", actual_disposal_date: null, is_overdue: false, is_escalated: false, overlap_count: 0, has_overlap: false, created_at: "2026-09-01T09:00:00Z", updated_at: "2026-09-01T09:00:00Z" },
  { id: "c7", case_id: "AICTE-2026-PGRC-000003", institution: { id: "i6", name: "Global Institute of Technology", aicte_permanent_id: "1-1000006", region: "South", state: "Karnataka" }, received_date: "2026-09-05", received_channel: "portal", category: "Affiliation Issues", sub_category: null, description: "Students complain that the institution is not affiliated and degrees may not be recognised.", complainant_type: "Student", priority: "high", status: "new", assigned_bureau: "PGRC", assigned_officer: { id: "u5", full_name: "Mohammed Rafi Ahmed", username: "pgrc_officer2", bureau: "PGRC" }, last_action_summary: null, next_action_required: "Coordinate with RB — overlapping case detected.", expected_disposal_date: "2026-12-05", actual_disposal_date: null, is_overdue: false, is_escalated: false, overlap_count: 1, has_overlap: true, created_at: "2026-09-05T09:00:00Z", updated_at: "2026-09-05T09:00:00Z" },
  { id: "c8", case_id: "AICTE-2025-PGRC-000018", institution: { id: "i9", name: "Jyoti Institute of Engineering", aicte_permanent_id: "1-1000009", region: "West", state: "Rajasthan" }, received_date: "2025-08-10", received_channel: "phone", category: "Scholarship Disbursal", sub_category: null, description: "Institution not disbursing government scholarships to eligible students on time.", complainant_type: "Student", priority: "normal", status: "closed", assigned_bureau: "PGRC", assigned_officer: { id: "u4", full_name: "Anita Krishnamurthy", username: "pgrc_officer1", bureau: "PGRC" }, last_action_summary: "Resolved. Institution has disbursed all pending scholarships.", next_action_required: null, expected_disposal_date: "2025-10-10", actual_disposal_date: "2025-10-05", is_overdue: false, is_escalated: false, overlap_count: 0, has_overlap: false, created_at: "2025-08-10T09:00:00Z", updated_at: "2025-10-05T15:00:00Z" },
  { id: "c9", case_id: "AICTE-2026-RB-000004", institution: { id: "i7", name: "Heritage Engineering College", aicte_permanent_id: "1-1000007", region: "South", state: "Tamil Nadu" }, received_date: "2026-10-01", received_channel: "email", category: "NBA/NAAC Compliance", sub_category: null, description: "Institution claiming NBA accreditation without valid certificate.", complainant_type: "Anonymous", priority: "high", status: "pending_info", assigned_bureau: "RB", assigned_officer: { id: "u3", full_name: "Sunita Devi Patel", username: "rb_officer2", bureau: "RB" }, last_action_summary: "Sought clarification from institution.", next_action_required: "Awaiting NBA certificate copy.", expected_disposal_date: "2026-12-31", actual_disposal_date: null, is_overdue: false, is_escalated: false, overlap_count: 0, has_overlap: false, created_at: "2026-10-01T09:00:00Z", updated_at: "2026-10-15T11:00:00Z" },
  { id: "c10", case_id: "AICTE-2026-RB-000005", institution: { id: "i3", name: "Central Engineering College", aicte_permanent_id: "1-1000003", region: "Central", state: "Madhya Pradesh" }, received_date: "2026-08-25", received_channel: "portal", category: "Closure Procedure", sub_category: null, description: "Institution shutting down mid-semester without following AICTE closure guidelines.", complainant_type: "Student", priority: "urgent", status: "under_process", assigned_bureau: "RB", assigned_officer: { id: "u2", full_name: "Rajesh Kumar Sharma", username: "rb_officer1", bureau: "RB" }, last_action_summary: "Emergency meeting called. Students to be accommodated.", next_action_required: "Finalise student transfer plan.", expected_disposal_date: "2026-09-25", actual_disposal_date: null, is_overdue: true, is_escalated: true, overlap_count: 0, has_overlap: false, created_at: "2026-08-25T09:00:00Z", updated_at: "2026-10-18T10:00:00Z" },
  { id: "c11", case_id: "AICTE-2025-RB-000098", institution: { id: "i4", name: "Delhi Institute of Advanced Studies", aicte_permanent_id: "1-1000004", region: "North", state: "Delhi" }, received_date: "2025-12-01", received_channel: "walk_in", category: "Examination Malpractice", sub_category: null, description: "Mass copying reported during end-semester exams. Faculty involvement suspected.", complainant_type: "Staff", priority: "urgent", status: "disposed", assigned_bureau: "PGRC", assigned_officer: { id: "u5", full_name: "Mohammed Rafi Ahmed", username: "pgrc_officer2", bureau: "PGRC" }, last_action_summary: "University took action against involved faculty. Case disposed.", next_action_required: null, expected_disposal_date: "2026-03-01", actual_disposal_date: "2026-02-28", is_overdue: false, is_escalated: false, overlap_count: 0, has_overlap: false, created_at: "2025-12-01T09:00:00Z", updated_at: "2026-02-28T14:00:00Z" },
  { id: "c12", case_id: "AICTE-2026-PGRC-000004", institution: { id: "i8", name: "Imperial College of Technology", aicte_permanent_id: "1-1000008", region: "West", state: "Gujarat" }, received_date: "2026-09-15", received_channel: "email", category: "Harassment Complaint", sub_category: null, description: "Students report ragging incidents in hostels. Institution not taking adequate preventive measures.", complainant_type: "Student", priority: "urgent", status: "under_process", assigned_bureau: "PGRC", assigned_officer: { id: "u4", full_name: "Anita Krishnamurthy", username: "pgrc_officer1", bureau: "PGRC" }, last_action_summary: "Anti-ragging committee review initiated.", next_action_required: "Receive anti-ragging committee report.", expected_disposal_date: "2026-11-15", actual_disposal_date: null, is_overdue: false, is_escalated: true, overlap_count: 0, has_overlap: false, created_at: "2026-09-15T09:00:00Z", updated_at: "2026-10-20T09:00:00Z" },
];

// ─── Overlaps ─────────────────────────────────────────────────────────────────
export const MOCK_OVERLAPS: Overlap[] = [
  {
    id: "ov1",
    case_a: { id: "c1", case_id: "AICTE-2026-RB-000001", category: "Fee Regulation Violation", status: "under_process", assigned_bureau: "RB", institution_name: "Apex Institute of Technology" },
    case_b: { id: "c2", case_id: "AICTE-2026-PGRC-000001", category: "Fee Regulation Violation", status: "new", assigned_bureau: "PGRC", institution_name: "Apex Institute of Technology" },
    match_method: "aicte_id_exact",
    similarity_score: 1.0,
    detected_at: "2026-08-21T10:00:00Z",
    acknowledged_by_name: null,
    acknowledged_at: null,
    resolution_note: null,
    is_active: true,
  },
  {
    id: "ov2",
    case_a: { id: "c6", case_id: "AICTE-2026-RB-000003", category: "Affiliation Issues", status: "new", assigned_bureau: "RB", institution_name: "Global Institute of Technology" },
    case_b: { id: "c7", case_id: "AICTE-2026-PGRC-000003", category: "Affiliation Issues", status: "new", assigned_bureau: "PGRC", institution_name: "Global Institute of Technology" },
    match_method: "keyword_similarity",
    similarity_score: 0.87,
    detected_at: "2026-09-06T08:30:00Z",
    acknowledged_by_name: "Rajesh Kumar Sharma",
    acknowledged_at: "2026-09-08T11:00:00Z",
    resolution_note: "Both bureaus coordinated. RB taking primary ownership. PGRC monitoring.",
    is_active: true,
  },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const MOCK_SUMMARY: DashboardSummary = {
  total: 200,
  new: 38,
  under_process: 65,
  transferred: 18,
  pending_info: 24,
  disposed: 42,
  closed: 13,
  overdue: 17,
  overlapping: 12,
  escalated: 6,
};

export const MOCK_STATUS_CHART: ChartDataPoint[] = [
  { label: "New", value: 38 },
  { label: "Under Process", value: 65 },
  { label: "Transferred", value: 18 },
  { label: "Pending Info", value: 24 },
  { label: "Disposed", value: 42 },
  { label: "Closed", value: 13 },
];

export const MOCK_BUREAU_CHART: ChartDataPoint[] = [
  { label: "RB", value: 112 },
  { label: "PGRC", value: 88 },
];

export const MOCK_REGION_CHART: ChartDataPoint[] = [
  { label: "North", value: 48 },
  { label: "South", value: 36 },
  { label: "West", value: 42 },
  { label: "East", value: 28 },
  { label: "Central", value: 30 },
  { label: "North-East", value: 10 },
  { label: "North-West", value: 6 },
];

export const MOCK_AGEING_CHART: AgeingDataPoint[] = [
  { bucket: "0-15 days", count: 32 },
  { bucket: "16-30 days", count: 28 },
  { bucket: "31-60 days", count: 45 },
  { bucket: "60+ days", count: 40 },
];

export const MOCK_TREND_CHART: TrendDataPoint[] = [
  { month: "Nov 2025", inflow: 14, disposed: 8 },
  { month: "Dec 2025", inflow: 11, disposed: 12 },
  { month: "Jan 2026", inflow: 18, disposed: 10 },
  { month: "Feb 2026", inflow: 16, disposed: 14 },
  { month: "Mar 2026", inflow: 20, disposed: 11 },
  { month: "Apr 2026", inflow: 22, disposed: 16 },
  { month: "May 2026", inflow: 19, disposed: 18 },
  { month: "Jun 2026", inflow: 25, disposed: 20 },
  { month: "Jul 2026", inflow: 17, disposed: 15 },
  { month: "Aug 2026", inflow: 21, disposed: 13 },
  { month: "Sep 2026", inflow: 28, disposed: 17 },
  { month: "Oct 2026", inflow: 24, disposed: 9 },
];

export const MOCK_RECENT_ACTIVITY: RecentActivity[] = [
  { id: "a1", case_id: "AICTE-2026-RB-000001", institution_name: "Apex Institute of Technology", action_type: "status_change", performed_by: "Rajesh Kumar Sharma", performed_at: "2026-10-24T08:30:00Z", remarks: "Show cause notice issued to institution." },
  { id: "a2", case_id: "AICTE-2026-PGRC-000003", institution_name: "Global Institute of Technology", action_type: "overlap_acknowledged", performed_by: "Anita Krishnamurthy", performed_at: "2026-10-23T14:20:00Z", remarks: "Overlap acknowledged. RB taking primary ownership." },
  { id: "a3", case_id: "AICTE-2026-RB-000005", institution_name: "Central Engineering College", action_type: "escalation", performed_by: "Rajesh Kumar Sharma", performed_at: "2026-10-23T10:15:00Z", remarks: "Case escalated due to urgency — students affected." },
  { id: "a4", case_id: "AICTE-2026-PGRC-000004", institution_name: "Imperial College of Technology", action_type: "remark", performed_by: "Anita Krishnamurthy", performed_at: "2026-10-22T16:00:00Z", remarks: "Anti-ragging committee review initiated." },
  { id: "a5", case_id: "AICTE-2026-RB-000004", institution_name: "Heritage Engineering College", action_type: "remark", performed_by: "Sunita Devi Patel", performed_at: "2026-10-22T11:30:00Z", remarks: "Sought clarification from institution regarding NBA certificate." },
  { id: "a6", case_id: "AICTE-2026-PGRC-000002", institution_name: "Apex Institute of Technology", action_type: "created", performed_by: "Anita Krishnamurthy", performed_at: "2026-10-21T09:00:00Z", remarks: "Case registered via portal." },
];
