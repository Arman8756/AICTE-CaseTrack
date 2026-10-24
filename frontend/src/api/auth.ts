import type { AuthUser } from "../types";

export interface LoginPayload {
  username: string;
  password: string;
}

// Role lookup by username — any password accepted in mock mode
const ROLE_MAP: Record<string, Pick<AuthUser, "role" | "bureau" | "full_name" | "user_id">> = {
  admin:           { user_id: "u1", full_name: "System Administrator",   role: "admin",              bureau: "Admin"      },
  rb_officer1:     { user_id: "u2", full_name: "Rajesh Kumar Sharma",     role: "rb_officer",         bureau: "RB"         },
  rb_officer2:     { user_id: "u3", full_name: "Sunita Devi Patel",       role: "rb_officer",         bureau: "RB"         },
  pgrc_officer1:   { user_id: "u4", full_name: "Anita Krishnamurthy",     role: "pgrc_officer",       bureau: "PGRC"       },
  pgrc_officer2:   { user_id: "u5", full_name: "Mohammed Rafi Ahmed",     role: "pgrc_officer",       bureau: "PGRC"       },
  regional_north:  { user_id: "u6", full_name: "Vikram Singh Rawat",      role: "regional_officer",   bureau: "Regional"   },
  regional_south:  { user_id: "u7", full_name: "Lakshmi Narayanan",       role: "regional_officer",   bureau: "Regional"   },
  senior_mgmt:     { user_id: "u8", full_name: "Dr. Arun Prasad",         role: "senior_management",  bureau: "Management" },
};

export async function login(payload: LoginPayload): Promise<AuthUser> {
  // In mock mode any username/password works; known usernames get real roles
  const profile = ROLE_MAP[payload.username] ?? {
    user_id: "u1",
    full_name: payload.username || "Demo User",
    role: "admin" as const,
    bureau: "Admin" as const,
  };

  return {
    ...profile,
    username: payload.username || "demo",
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
  };
}

export async function getMe() {
  const stored = sessionStorage.getItem("auth_user");
  return stored ? JSON.parse(stored) : null;
}

export async function logout() {
  // no-op in mock mode
}
