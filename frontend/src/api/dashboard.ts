import { api } from "./client";
import type {
  DashboardSummary, ChartDataPoint, TrendDataPoint, AgeingDataPoint, RecentActivity
} from "../types";

export const getDashboardSummary = async (): Promise<DashboardSummary> =>
  (await api.get("/dashboard/summary")).data;

export const getStatusChart = async (): Promise<ChartDataPoint[]> =>
  (await api.get("/dashboard/charts/status")).data;

export const getBureauChart = async (): Promise<ChartDataPoint[]> =>
  (await api.get("/dashboard/charts/bureau")).data;

export const getRegionChart = async (): Promise<ChartDataPoint[]> =>
  (await api.get("/dashboard/charts/region")).data;

export const getAgeingChart = async (): Promise<AgeingDataPoint[]> =>
  (await api.get("/dashboard/charts/ageing")).data;

export const getTrendChart = async (): Promise<TrendDataPoint[]> =>
  (await api.get("/dashboard/charts/trend")).data;

export const getRecentActivity = async (): Promise<RecentActivity[]> =>
  (await api.get("/dashboard/recent-activity")).data;
