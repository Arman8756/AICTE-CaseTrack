import { MOCK_COMPLAINTS, MOCK_INSTITUTIONS } from "./mockData";

export const getInstitutionSummary = async () =>
  MOCK_INSTITUTIONS.map((i) => ({
    institution_id: i.id,
    name: i.name,
    aicte_id: i.aicte_permanent_id,
    region: i.region,
    total: i.complaint_count ?? 0,
  }));

export const getRegionSummary = async () => {
  const map: Record<string, number> = {};
  MOCK_INSTITUTIONS.forEach((i) => {
    const r = i.region ?? "Unknown";
    map[r] = (map[r] ?? 0) + (i.complaint_count ?? 0);
  });
  return Object.entries(map).map(([region, total]) => ({ region, total }));
};

export const getBureauSummary = async () => {
  const bureaus: Record<string, Record<string, number>> = {};
  MOCK_COMPLAINTS.forEach((c) => {
    if (!bureaus[c.assigned_bureau]) bureaus[c.assigned_bureau] = { bureau: 0, total: 0 };
    const key = c.status;
    bureaus[c.assigned_bureau][key] = (bureaus[c.assigned_bureau][key] ?? 0) + 1;
    bureaus[c.assigned_bureau].total = (bureaus[c.assigned_bureau].total ?? 0) + 1;
  });
  return Object.entries(bureaus).map(([bureau, counts]) => ({ bureau, ...counts }));
};

export const getAgeingReport = async () => {
  const today = new Date();
  return MOCK_COMPLAINTS
    .filter((c) => !["disposed", "closed"].includes(c.status))
    .map((c) => ({
      case_id: c.case_id,
      age_days: Math.floor((today.getTime() - new Date(c.received_date).getTime()) / 86400000),
      bureau: c.assigned_bureau,
      status: c.status,
      priority: c.priority,
      is_overdue: c.is_overdue,
    }))
    .sort((a, b) => b.age_days - a.age_days);
};

export const getDisposalRate = async () => [
  { period: "May 2026", received: 19, disposed: 18, rate_pct: 94.7 },
  { period: "Jun 2026", received: 25, disposed: 20, rate_pct: 80.0 },
  { period: "Jul 2026", received: 17, disposed: 15, rate_pct: 88.2 },
  { period: "Aug 2026", received: 21, disposed: 13, rate_pct: 61.9 },
  { period: "Sep 2026", received: 28, disposed: 17, rate_pct: 60.7 },
  { period: "Oct 2026", received: 24, disposed: 9,  rate_pct: 37.5 },
];

export const exportCSV = async (_params: Record<string, string>) => {
  const headers = ["Case ID", "Institution", "AICTE ID", "Region", "Category", "Status", "Bureau", "Priority", "Received Date"];
  const rows = MOCK_COMPLAINTS.map((c) => [
    c.case_id, c.institution.name, c.institution.aicte_permanent_id ?? "",
    c.institution.region ?? "", c.category, c.status, c.assigned_bureau,
    c.priority, c.received_date,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "complaints_export.csv";
  a.click();
  URL.revokeObjectURL(url);
};
