import type { Institution, PaginatedResponse } from "../types";
import { MOCK_INSTITUTIONS } from "./mockData";

export interface InstitutionFilters {
  search?: string;
  region?: string;
  state?: string;
  institution_type?: string;
  approval_status?: string;
  page?: number;
  page_size?: number;
}

export const listInstitutions = async (
  filters: InstitutionFilters = {}
): Promise<PaginatedResponse<Institution>> => {
  let items = [...MOCK_INSTITUTIONS];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(s) ||
        (i.aicte_permanent_id ?? "").toLowerCase().includes(s)
    );
  }
  if (filters.region) items = items.filter((i) => i.region === filters.region);
  if (filters.state) items = items.filter((i) => i.state === filters.state);
  if (filters.institution_type) items = items.filter((i) => i.institution_type === filters.institution_type);
  if (filters.approval_status) items = items.filter((i) => i.approval_status === filters.approval_status);

  const total = items.length;
  const page = filters.page ?? 1;
  const page_size = filters.page_size ?? 25;
  return { items: items.slice((page - 1) * page_size, page * page_size), total, page, page_size };
};

export const getInstitution = async (id: string): Promise<Institution> => {
  const inst = MOCK_INSTITUTIONS.find((i) => i.id === id);
  if (!inst) throw new Error("Institution not found");
  return inst;
};

export const createInstitution = async (payload: Record<string, unknown>): Promise<Institution> => {
  return { id: `i${Date.now()}`, ...payload, name_normalized: String(payload.name ?? "").toLowerCase(), is_active: true, created_at: new Date().toISOString(), complaint_count: 0 } as Institution;
};

export const updateInstitution = async (id: string, payload: Record<string, unknown>): Promise<Institution> => {
  const inst = MOCK_INSTITUTIONS.find((i) => i.id === id);
  return { ...inst!, ...payload } as Institution;
};
