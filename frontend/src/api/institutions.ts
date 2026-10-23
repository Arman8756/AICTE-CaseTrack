import { api } from "./client";
import type { Institution, PaginatedResponse } from "../types";

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
): Promise<PaginatedResponse<Institution>> =>
  (await api.get("/institutions", { params: filters })).data;

export const getInstitution = async (id: string): Promise<Institution> =>
  (await api.get(`/institutions/${id}`)).data;

export const createInstitution = async (payload: Record<string, unknown>): Promise<Institution> =>
  (await api.post("/institutions", payload)).data;

export const updateInstitution = async (
  id: string,
  payload: Record<string, unknown>
): Promise<Institution> => (await api.put(`/institutions/${id}`, payload)).data;
