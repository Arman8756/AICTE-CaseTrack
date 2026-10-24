export type NotificationType =
  | "overlap"
  | "overdue"
  | "escalation"
  | "transfer"
  | "new_case"
  | "disposed";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  case_id?: string;
  complaint_id?: string;
  institution_name?: string;
  timestamp: string;
  read: boolean;
}

// In-memory store — persists for the session
let notifications: AppNotification[] = [
  {
    id: "n1",
    type: "overlap",
    title: "Potential Overlap Detected",
    message: "AICTE-2026-RB-000001 and AICTE-2026-PGRC-000001 both relate to Apex Institute of Technology (Fee Regulation Violation). Coordination required.",
    case_id: "AICTE-2026-RB-000001",
    complaint_id: "c1",
    institution_name: "Apex Institute of Technology",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    read: false,
  },
  {
    id: "n2",
    type: "overdue",
    title: "Case Overdue",
    message: "AICTE-2026-RB-000002 (Central Engineering College — Faculty Shortage) has crossed its expected disposal date. Immediate action required.",
    case_id: "AICTE-2026-RB-000002",
    complaint_id: "c3",
    institution_name: "Central Engineering College",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hrs ago
    read: false,
  },
  {
    id: "n3",
    type: "escalation",
    title: "Case Escalated",
    message: "AICTE-2026-RB-000005 (Central Engineering College — Closure Procedure) has been escalated to Senior Management by Rajesh Kumar Sharma.",
    case_id: "AICTE-2026-RB-000005",
    complaint_id: "c10",
    institution_name: "Central Engineering College",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hrs ago
    read: false,
  },
  {
    id: "n4",
    type: "overdue",
    title: "Case Overdue",
    message: "AICTE-2026-PGRC-000002 (Eastern Technical University — Admission Irregularities) is 79 days past the expected disposal date.",
    case_id: "AICTE-2026-PGRC-000002",
    complaint_id: "c4",
    institution_name: "Eastern Technical University",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hrs ago
    read: true,
  },
  {
    id: "n5",
    type: "new_case",
    title: "New Case Registered",
    message: "AICTE-2026-PGRC-000004 filed against Imperial College of Technology for Harassment Complaint. Assigned to Anita Krishnamurthy.",
    case_id: "AICTE-2026-PGRC-000004",
    complaint_id: "c12",
    institution_name: "Imperial College of Technology",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: "n6",
    type: "overlap",
    title: "Overlap Acknowledged",
    message: "RB and PGRC have acknowledged the overlap on Global Institute of Technology (Affiliation Issues). RB taking primary ownership.",
    case_id: "AICTE-2026-RB-000003",
    complaint_id: "c6",
    institution_name: "Global Institute of Technology",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 hrs ago
    read: true,
  },
  {
    id: "n7",
    type: "transfer",
    title: "Case Transferred",
    message: "AICTE-2026-PGRC-000002 (Eastern Technical University) has been transferred from RB to PGRC for further processing.",
    case_id: "AICTE-2026-PGRC-000002",
    complaint_id: "c4",
    institution_name: "Eastern Technical University",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
  },
  {
    id: "n8",
    type: "disposed",
    title: "Case Disposed",
    message: "AICTE-2025-RB-000042 (Bharat College of Engineering — Infrastructure Deficiency) has been disposed after compliance verification.",
    case_id: "AICTE-2025-RB-000042",
    complaint_id: "c5",
    institution_name: "Bharat College of Engineering",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    read: true,
  },
];

export function getNotifications(): AppNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getUnreadCount(): number {
  return notifications.filter((n) => !n.read).length;
}

export function markAsRead(id: string): void {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
}

export function markAllAsRead(): void {
  notifications = notifications.map((n) => ({ ...n, read: true }));
}

export function addNotification(notif: Omit<AppNotification, "id" | "read">): void {
  notifications = [
    { ...notif, id: `n${Date.now()}`, read: false },
    ...notifications,
  ];
}
