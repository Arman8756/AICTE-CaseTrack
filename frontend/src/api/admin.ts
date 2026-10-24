import type { User } from "../types";
import { MOCK_USERS } from "./mockData";

let users = [...MOCK_USERS];

export const listUsers = async (): Promise<{ items: User[]; total: number }> =>
  ({ items: users, total: users.length });

export const createUser = async (payload: Record<string, unknown>): Promise<User> => {
  const u: User = {
    id: `u${Date.now()}`,
    username: String(payload.username),
    email: String(payload.email),
    full_name: String(payload.full_name),
    role: payload.role as User["role"],
    bureau: payload.bureau as User["bureau"],
    region: payload.region ? String(payload.region) : null,
    is_active: true,
    created_at: new Date().toISOString(),
    last_login: null,
  };
  users = [...users, u];
  return u;
};

export const updateUser = async (id: string, payload: Record<string, unknown>): Promise<User> => {
  users = users.map((u) => u.id === id ? { ...u, ...payload } as User : u);
  return users.find((u) => u.id === id)!;
};

export const deactivateUser = async (id: string) => {
  users = users.map((u) => u.id === id ? { ...u, is_active: false } : u);
  return { message: "User deactivated" };
};

export const getAuditLog = async (_params: { page?: number; page_size?: number; action?: string }) => ({
  items: [
    { id: "al1", action: "post.api.v1.complaints", entity_type: "complaint", entity_id: "c1", ip_address: "10.0.0.1", request_method: "POST", endpoint: "/api/v1/complaints", performed_at: "2026-10-24T08:30:00Z", user_id: "u2" },
    { id: "al2", action: "post.api.v1.overlaps.acknowledge", entity_type: "overlap", entity_id: "ov2", ip_address: "10.0.0.2", request_method: "POST", endpoint: "/api/v1/overlaps/ov2/acknowledge", performed_at: "2026-10-23T14:20:00Z", user_id: "u4" },
    { id: "al3", action: "post.api.v1.complaints.escalate", entity_type: "complaint", entity_id: "c3", ip_address: "10.0.0.1", request_method: "POST", endpoint: "/api/v1/complaints/c3/escalate", performed_at: "2026-10-23T10:15:00Z", user_id: "u2" },
    { id: "al4", action: "put.api.v1.complaints", entity_type: "complaint", entity_id: "c4", ip_address: "10.0.0.3", request_method: "PUT", endpoint: "/api/v1/complaints/c4", performed_at: "2026-10-22T16:00:00Z", user_id: "u4" },
    { id: "al5", action: "post.api.v1.auth.login", entity_type: null, entity_id: null, ip_address: "10.0.0.5", request_method: "POST", endpoint: "/api/v1/auth/login", performed_at: "2026-10-22T09:00:00Z", user_id: "u1" },
  ],
  total: 5,
});
