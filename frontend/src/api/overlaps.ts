import type { Overlap } from "../types";
import { MOCK_OVERLAPS } from "./mockData";

export interface OverlapListResponse {
  items: Overlap[];
  total: number;
  unacknowledged_count: number;
}

let overlaps = [...MOCK_OVERLAPS];

export const listOverlaps = async (params: {
  active_only?: boolean;
  bureau?: string;
  page?: number;
  page_size?: number;
}): Promise<OverlapListResponse> => {
  let items = [...overlaps];
  if (params.active_only !== false) items = items.filter((o) => o.is_active);
  if (params.bureau) items = items.filter((o) => o.case_a.assigned_bureau === params.bureau || o.case_b.assigned_bureau === params.bureau);

  const page = params.page ?? 1;
  const page_size = params.page_size ?? 25;
  const unacknowledged_count = items.filter((o) => !o.acknowledged_at).length;
  return {
    items: items.slice((page - 1) * page_size, page * page_size),
    total: items.length,
    unacknowledged_count,
  };
};

export const acknowledgeOverlap = async (overlapId: string, resolution_note: string) => {
  overlaps = overlaps.map((o) =>
    o.id === overlapId
      ? { ...o, acknowledged_by_name: "Current User", acknowledged_at: new Date().toISOString(), resolution_note }
      : o
  );
  return { message: "Overlap acknowledged" };
};
