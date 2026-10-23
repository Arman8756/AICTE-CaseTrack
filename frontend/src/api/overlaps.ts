import { api } from "./client";
import type { Overlap } from "../types";

export interface OverlapListResponse {
  items: Overlap[];
  total: number;
  unacknowledged_count: number;
}

export const listOverlaps = async (params: {
  active_only?: boolean;
  bureau?: string;
  page?: number;
  page_size?: number;
}): Promise<OverlapListResponse> =>
  (await api.get("/overlaps", { params })).data;

export const acknowledgeOverlap = async (
  overlapId: string,
  resolution_note: string
) =>
  (await api.post(`/overlaps/${overlapId}/acknowledge`, { resolution_note })).data;
