import { api } from "./client";

export const getInstitutionSummary = async () =>
  (await api.get("/reports/institution-summary")).data;

export const getRegionSummary = async () =>
  (await api.get("/reports/region-summary")).data;

export const getBureauSummary = async () =>
  (await api.get("/reports/bureau-summary")).data;

export const getAgeingReport = async () =>
  (await api.get("/reports/ageing")).data;

export const getDisposalRate = async () =>
  (await api.get("/reports/disposal-rate")).data;

export const exportCSV = async (params: Record<string, string>) => {
  const response = await api.get("/reports/export/csv", {
    params,
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = "complaints_export.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};
