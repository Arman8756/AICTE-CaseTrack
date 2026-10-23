import { api } from "./client";
import type { Complaint, ComplaintAction, PaginatedResponse } from "../types";

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

export async function listComplaints(
  filters: ComplaintFilters = {}
): Promise<PaginatedResponse<Complaint>> {
  const { data } = await api.get("/complaints", { params: filters });
  return data;
}

export async function getComplaint(id: string): Promise<Complaint> {
  const { data } = await api.get(`/complaints/${id}`);
  return data;
}

export async function createComplaint(payload: Record<string, unknown>): Promise<Complaint> {
  const { data } = await api.post("/complaints", payload);
  return data;
}

export async function updateComplaint(
  id: string,
  payload: Record<string, unknown>
): Promise<Complaint> {
  const { data } = await api.put(`/complaints/${id}`, payload);
  return data;
}

export async function getComplaintActions(id: string): Promise<ComplaintAction[]> {
  const { data } = await api.get(`/complaints/${id}/actions`);
  return data;
}

export async function addAction(
  id: string,
  payload: { remarks: string; new_status?: string; next_action_required?: string }
) {
  const { data } = await api.post(`/complaints/${id}/actions`, payload);
  return data;
}

export async function transferComplaint(
  id: string,
  payload: { to_bureau: string; to_officer_id?: string; remarks: string }
) {
  const { data } = await api.post(`/complaints/${id}/transfer`, payload);
  return data;
}

export async function escalateComplaint(id: string, remarks: string) {
  const { data } = await api.post(`/complaints/${id}/escalate`, { remarks });
  return data;
}
