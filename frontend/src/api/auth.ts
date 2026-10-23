import { api } from "./client";
import type { AuthUser } from "../types";

export interface LoginPayload {
  username: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const { data } = await api.post("/auth/login", payload);
  return {
    user_id: data.user_id,
    username: payload.username,
    full_name: data.full_name,
    role: data.role,
    bureau: data.bureau,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  };
}

export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}
