import type { Complaint, ComplaintAction, PaginatedResponse } from "../types";
import { MOCK_COMPLAINTS } from "./mockData";

export interface ComplaintFilters {
  search?: string;
  status?: string;
  bureau?: string;
  region?: string;
  category?: string;
  priority?: string;
  institution_id?: string;
  date_from?: string;
  date_to?: string;
  overdue_only?: boolean;
  has_overlap?: boolean;
  is_escalated?: boolean;
  page?: number;
  page_size?: number;
}

// In-memory store so creates/updates persist during the session
let complaints = [...MOCK_COMPLAINTS];

export async function listComplaints(
  filters: ComplaintFilters = {}
): Promise<PaginatedResponse<Complaint>> {
  let items = [...complaints];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    items = items.filter(
      (c) =>
        c.case_id.toLowerCase().includes(s) ||
        c.institution.name.toLowerCase().includes(s) ||
        (c.institution.aicte_permanent_id ?? "").toLowerCase().includes(s)
    );
  }
  if (filters.status) items = items.filter((c) => c.status === filters.status);
  if (filters.bureau) items = items.filter((c) => c.assigned_bureau === filters.bureau);
  if (filters.region) items = items.filter((c) => c.institution.region === filters.region);
  if (filters.category) items = items.filter((c) => c.category === filters.category);
  if (filters.priority) items = items.filter((c) => c.priority === filters.priority);
  if (filters.institution_id) items = items.filter((c) => c.institution.id === filters.institution_id);
  if (filters.overdue_only) items = items.filter((c) => c.is_overdue);
  if (filters.has_overlap) items = items.filter((c) => c.has_overlap);
  if (filters.is_escalated) items = items.filter((c) => c.is_escalated);

  const total = items.length;
  const page = filters.page ?? 1;
  const page_size = filters.page_size ?? 25;
  items = items.slice((page - 1) * page_size, page * page_size);

  return { items, total, page, page_size };
}

export async function getComplaint(id: string): Promise<Complaint> {
  const c = complaints.find((c) => c.id === id);
  if (!c) throw new Error("Not found");
  return c;
}

export async function createComplaint(payload: Record<string, unknown>): Promise<Complaint> {
  const newId = `c${Date.now()}`;
  const caseId = `AICTE-2026-${String(payload.assigned_bureau)}-${String(Date.now()).slice(-6)}`;
  const inst = { id: String(payload.institution_id), name: "Selected Institution", aicte_permanent_id: null, region: null, state: null };
  const c: Complaint = {
    id: newId,
    case_id: caseId,
    institution: inst,
    received_date: String(payload.received_date),
    received_channel: payload.received_channel as Complaint["received_channel"],
    category: String(payload.category),
    sub_category: null,
    description: String(payload.description),
    complainant_type: payload.complainant_type ? String(payload.complainant_type) : null,
    priority: (payload.priority as Complaint["priority"]) ?? "normal",
    status: "new",
    assigned_bureau: String(payload.assigned_bureau),
    assigned_officer: null,
    last_action_summary: null,
    next_action_required: payload.next_action_required ? String(payload.next_action_required) : null,
    expected_disposal_date: payload.expected_disposal_date ? String(payload.expected_disposal_date) : null,
    actual_disposal_date: null,
    is_overdue: false,
    is_escalated: false,
    overlap_count: 0,
    has_overlap: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  complaints = [c, ...complaints];
  return c;
}

export async function updateComplaint(id: string, payload: Record<string, unknown>): Promise<Complaint> {
  complaints = complaints.map((c) => c.id === id ? { ...c, ...payload, updated_at: new Date().toISOString() } : c);
  return complaints.find((c) => c.id === id)!;
}

const actionStore: Record<string, ComplaintAction[]> = {};

export async function getComplaintActions(id: string): Promise<ComplaintAction[]> {
  if (!actionStore[id]) {
    actionStore[id] = [
      { id: `${id}-a1`, action_type: "created", performed_by: "System Administrator", performed_at: new Date(Date.now() - 86400000 * 10).toISOString(), old_status: null, new_status: "new", remarks: "Case registered.", transferred_to_bureau: null },
      { id: `${id}-a2`, action_type: "remark", performed_by: "Rajesh Kumar Sharma", performed_at: new Date(Date.now() - 86400000 * 5).toISOString(), old_status: null, new_status: null, remarks: "Institution response received and reviewed.", transferred_to_bureau: null },
    ];
  }
  return actionStore[id];
}

export async function addAction(
  id: string,
  payload: { remarks: string; new_status?: string; next_action_required?: string }
) {
  const action: ComplaintAction = {
    id: `${id}-a${Date.now()}`,
    action_type: payload.new_status ? "status_change" : "remark",
    performed_by: "Current User",
    performed_at: new Date().toISOString(),
    old_status: null,
    new_status: payload.new_status ?? null,
    remarks: payload.remarks,
    transferred_to_bureau: null,
  };
  if (!actionStore[id]) actionStore[id] = [];
  actionStore[id] = [...actionStore[id], action];

  // Update complaint status in memory
  if (payload.new_status) {
    complaints = complaints.map((c) =>
      c.id === id ? { ...c, status: payload.new_status as Complaint["status"], updated_at: new Date().toISOString() } : c
    );
  }
  return { message: "Action recorded", action_id: action.id };
}

export async function transferComplaint(
  id: string,
  payload: { to_bureau: string; to_officer_id?: string; remarks: string }
) {
  complaints = complaints.map((c) =>
    c.id === id ? { ...c, assigned_bureau: payload.to_bureau, status: "transferred" as const, updated_at: new Date().toISOString() } : c
  );
  if (!actionStore[id]) actionStore[id] = [];
  actionStore[id].push({ id: `${id}-t${Date.now()}`, action_type: "transfer", performed_by: "Current User", performed_at: new Date().toISOString(), old_status: null, new_status: "transferred", remarks: payload.remarks, transferred_to_bureau: payload.to_bureau });
  return { message: `Case transferred to ${payload.to_bureau}` };
}

export async function escalateComplaint(id: string, remarks: string) {
  complaints = complaints.map((c) =>
    c.id === id ? { ...c, is_escalated: true, updated_at: new Date().toISOString() } : c
  );
  if (!actionStore[id]) actionStore[id] = [];
  actionStore[id].push({ id: `${id}-e${Date.now()}`, action_type: "escalation", performed_by: "Current User", performed_at: new Date().toISOString(), old_status: null, new_status: null, remarks, transferred_to_bureau: null });
  return { message: "Case escalated" };
}
