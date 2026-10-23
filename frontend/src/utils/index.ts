import { format, parseISO, differenceInDays } from "date-fns";
import type { ComplaintStatus, ComplaintPriority, UserRole } from "../types";

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "dd MMM yyyy, HH:mm");
  } catch {
    return dateStr;
  }
}

export function getStatusColor(status: ComplaintStatus | string): string {
  const map: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    under_process: "bg-yellow-100 text-yellow-800",
    transferred: "bg-purple-100 text-purple-800",
    pending_info: "bg-orange-100 text-orange-800",
    disposed: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

export function getPriorityColor(priority: ComplaintPriority | string): string {
  const map: Record<string, string> = {
    low: "bg-gray-100 text-gray-600",
    normal: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };
  return map[priority] ?? "bg-gray-100 text-gray-600";
}

export function getBureauColor(bureau: string): string {
  const map: Record<string, string> = {
    RB: "bg-indigo-100 text-indigo-800",
    PGRC: "bg-teal-100 text-teal-800",
    Regional: "bg-cyan-100 text-cyan-800",
    Joint: "bg-violet-100 text-violet-800",
  };
  return map[bureau] ?? "bg-gray-100 text-gray-600";
}

export function getRoleLabel(role: UserRole | string): string {
  const map: Record<string, string> = {
    admin: "Administrator",
    rb_officer: "RB Officer",
    pgrc_officer: "PGRC Officer",
    regional_officer: "Regional Officer",
    senior_management: "Senior Management",
  };
  return map[role] ?? role;
}

export function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getActionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    created: "Case Created",
    status_change: "Status Changed",
    remark: "Remark Added",
    transfer: "Case Transferred",
    document_upload: "Document Uploaded",
    escalation: "Case Escalated",
    overlap_acknowledged: "Overlap Acknowledged",
    disposition: "Case Disposed",
  };
  return map[type] ?? type;
}

export function isReadOnlyRole(role: UserRole | string): boolean {
  return role === "senior_management";
}
