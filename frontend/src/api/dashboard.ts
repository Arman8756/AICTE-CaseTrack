import {
  MOCK_SUMMARY, MOCK_STATUS_CHART, MOCK_BUREAU_CHART,
  MOCK_REGION_CHART, MOCK_AGEING_CHART, MOCK_TREND_CHART, MOCK_RECENT_ACTIVITY,
} from "./mockData";
import type { DashboardSummary, ChartDataPoint, TrendDataPoint, AgeingDataPoint, RecentActivity } from "../types";

export const getDashboardSummary = async (): Promise<DashboardSummary> => MOCK_SUMMARY;
export const getStatusChart = async (): Promise<ChartDataPoint[]> => MOCK_STATUS_CHART;
export const getBureauChart = async (): Promise<ChartDataPoint[]> => MOCK_BUREAU_CHART;
export const getRegionChart = async (): Promise<ChartDataPoint[]> => MOCK_REGION_CHART;
export const getAgeingChart = async (): Promise<AgeingDataPoint[]> => MOCK_AGEING_CHART;
export const getTrendChart = async (): Promise<TrendDataPoint[]> => MOCK_TREND_CHART;
export const getRecentActivity = async (): Promise<RecentActivity[]> => MOCK_RECENT_ACTIVITY;
