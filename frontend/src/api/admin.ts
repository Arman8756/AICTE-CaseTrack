import { api } from "./client";
import type { User } from "../types";

export const listUsers = async (): Promise<{ items: User[]; total: number }> =>
  (await api.get("/admin/users")).data;

export const createUser = async (payload: Record<string, unknown>): Promise<User> =>
  (await api.post("/admin/users", payload)).data;

export const updateUser = async (
  id: string,
  payload: Record<string, unknown>
): Promise<User> => (await api.put(`/admin/users/${id}`, payload)).data;

export const deactivateUser = async (id: string) =>
  (await api.put(`/admin/users/${id}/deactivate`)).data;

export const getAuditLog = async (params: {
  page?: number;
  page_size?: number;
  action?: string;
}) => (await api.get("/admin/audit-log", { params })).data;
