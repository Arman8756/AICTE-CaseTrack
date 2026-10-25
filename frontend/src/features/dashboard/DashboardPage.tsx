import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary, getStatusChart, getBureauChart,
  getRegionChart, getAgeingChart, getTrendChart, getRecentActivity,
} from "../../api/dashboard";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { PageLoader } from "../../components/LoadingSpinner";
import { OverlapAlertBanner } from "../../components/OverlapAlert";
import { Link } from "react-router-dom";
import {
  FileText, Clock, CheckCircle, AlertTriangle, ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { getActionTypeLabel, formatDateTime } from "../../utils";

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#be185d"];

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  to?: string;
  urgent?: boolean;
}

function SummaryCard({ label, value, icon, color, to, urgent }: SummaryCardProps) {
  const content = (
    <div className={`card p-5 flex items-center gap-4 ${urgent && value > 0 ? "border-red-200 bg-red-50" : ""}`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-sm ${urgent && value > 0 ? "text-red-700 font-medium" : "text-gray-500"}`}>
          {label}
        </p>
      </div>
    </div>
  );
  return to ? <Link to={to} className="block hover:shadow-md transition-shadow">{content}</Link> : content;
}

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });
  const { data: statusChart } = useQuery({ queryKey: ["chart-status"], queryFn: getStatusChart });
  const { data: bureauChart } = useQuery({ queryKey: ["chart-bureau"], queryFn: getBureauChart });
  const { data: regionChart } = useQuery({ queryKey: ["chart-region"], queryFn: getRegionChart });
  const { data: ageingChart } = useQuery({ queryKey: ["chart-ageing"], queryFn: getAgeingChart });
  const { data: trendChart } = useQuery({ queryKey: ["chart-trend"], queryFn: getTrendChart });
  const { data: recentActivity } = useQuery({ queryKey: ["recent-activity"], queryFn: getRecentActivity });

  if (loadingSummary) return <PageLoader />;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Complaint monitoring overview</p>
        </div>
        <div className="flex gap-2">
          <Link to="/complaints/new" className="btn-primary">
            <FileText className="w-4 h-4" /> New Complaint
          </Link>
        </div>
      </div>

      {/* Overlap Alert */}
      {summary && <OverlapAlertBanner count={summary.overlapping} />}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <SummaryCard
            label="Total Cases"
            value={summary.total}
            icon={<FileText className="w-6 h-6 text-blue-700" />}
            color="bg-blue-100"
            to="/complaints"
          />
          <SummaryCard
            label="Under Process"
            value={summary.under_process + summary.new + summary.pending_info}
            icon={<Clock className="w-6 h-6 text-yellow-700" />}
            color="bg-yellow-100"
            to="/complaints?status=under_process"
          />
          <SummaryCard
            label="Disposed / Closed"
            value={summary.disposed + summary.closed}
            icon={<CheckCircle className="w-6 h-6 text-green-700" />}
            color="bg-green-100"
          />
          <SummaryCard
            label="Overdue"
            value={summary.overdue}
            icon={<AlertTriangle className="w-6 h-6 text-red-700" />}
            color="bg-red-100"
            to="/complaints?overdue_only=true"
            urgent
          />
          <SummaryCard
            label="Overlapping"
            value={summary.overlapping}
            icon={<RefreshCw className="w-6 h-6 text-amber-700" />}
            color="bg-amber-100"
            to="/overlaps"
            urgent={summary.overlapping > 0}
          />
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusChart ?? []}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ label, percent }) =>
                  percent > 0.04 ? `${label} (${(percent * 100).toFixed(0)}%)` : ""
                }
                labelLine={false}
              >
                {(statusChart ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bureau Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Bureau-wise Cases</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bureauChart ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Region Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Region-wise Cases</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={regionChart ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#0891b2" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Inflow vs Disposal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendChart ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="inflow" stroke="#2563eb" strokeWidth={2} dot={false} name="Received" />
              <Line type="monotone" dataKey="disposed" stroke="#16a34a" strokeWidth={2} dot={false} name="Disposed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ageing */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Case Ageing (Open Cases)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ageingChart ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {(ageingChart ?? []).map((_, i) => (
                  <Cell key={i} fill={["#16a34a", "#d97706", "#ea580c", "#dc2626"][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Recent Activity</h3>
          <Link to="/complaints" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {(recentActivity ?? []).slice(0, 8).map((activity) => (
            <div key={activity.id} className="px-5 py-3 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/complaints?search=${activity.case_id}`}
                    className="text-sm font-medium text-primary-700 hover:underline"
                  >
                    {activity.case_id}
                  </Link>
                  <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                    {getActionTypeLabel(activity.action_type)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {activity.institution_name} — {activity.remarks || "No remarks"}
                </p>
              </div>
              <div className="flex-shrink-0 text-xs text-gray-400">
                {formatDateTime(activity.performed_at)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
