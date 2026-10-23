import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getInstitutionSummary, getRegionSummary, getBureauSummary,
  getAgeingReport, getDisposalRate, exportCSV,
} from "../../api/reports";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import { PageLoader } from "../../components/LoadingSpinner";
import { Download } from "lucide-react";

const TABS = [
  { key: "institution", label: "Institution Summary" },
  { key: "region", label: "Region Summary" },
  { key: "bureau", label: "Bureau Summary" },
  { key: "ageing", label: "Case Ageing" },
  { key: "disposal", label: "Disposal Rate" },
];

export default function ReportsPage() {
  const [tab, setTab] = useState("institution");

  const instQ = useQuery({ queryKey: ["report-inst"], queryFn: getInstitutionSummary, enabled: tab === "institution" });
  const regionQ = useQuery({ queryKey: ["report-region"], queryFn: getRegionSummary, enabled: tab === "region" });
  const bureauQ = useQuery({ queryKey: ["report-bureau"], queryFn: getBureauSummary, enabled: tab === "bureau" });
  const ageingQ = useQuery({ queryKey: ["report-ageing"], queryFn: getAgeingReport, enabled: tab === "ageing" });
  const disposalQ = useQuery({ queryKey: ["report-disposal"], queryFn: getDisposalRate, enabled: tab === "disposal" });

  const isLoading = instQ.isLoading || regionQ.isLoading || bureauQ.isLoading || ageingQ.isLoading || disposalQ.isLoading;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Complaint data summary and trends</p>
        </div>
        <button onClick={() => exportCSV({})} className="btn-secondary">
          <Download className="w-4 h-4" /> Export All CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <PageLoader />}

      {/* Institution Summary */}
      {tab === "institution" && instQ.data && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-th">Institution</th>
                  <th className="table-th">AICTE ID</th>
                  <th className="table-th">Region</th>
                  <th className="table-th">Total Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {instQ.data.map((r: Record<string, unknown>) => (
                  <tr key={r.institution_id as string} className="hover:bg-gray-50">
                    <td className="table-td font-medium">{r.name as string}</td>
                    <td className="table-td font-mono text-xs text-gray-500">{r.aicte_id as string ?? "—"}</td>
                    <td className="table-td text-gray-600">{r.region as string ?? "—"}</td>
                    <td className="table-td font-semibold text-primary-700">{r.total as number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Region Summary */}
      {tab === "region" && regionQ.data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Region-wise Case Count</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionQ.data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="region" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200">
                <th className="table-th">Region</th>
                <th className="table-th">Total Cases</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {regionQ.data.map((r: Record<string, unknown>) => (
                  <tr key={r.region as string} className="hover:bg-gray-50">
                    <td className="table-td">{r.region as string}</td>
                    <td className="table-td font-semibold text-primary-700">{r.total as number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bureau Summary */}
      {tab === "bureau" && bureauQ.data && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-th">Bureau</th>
                  <th className="table-th">Total</th>
                  <th className="table-th">New</th>
                  <th className="table-th">Under Process</th>
                  <th className="table-th">Transferred</th>
                  <th className="table-th">Disposed</th>
                  <th className="table-th">Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bureauQ.data.map((r: Record<string, unknown>) => (
                  <tr key={r.bureau as string} className="hover:bg-gray-50">
                    <td className="table-td font-medium">
                      <span className="badge bg-indigo-50 text-indigo-700">{r.bureau as string}</span>
                    </td>
                    <td className="table-td font-bold text-primary-700">{r.total as number}</td>
                    <td className="table-td">{(r.new as number) ?? 0}</td>
                    <td className="table-td">{(r.under_process as number) ?? 0}</td>
                    <td className="table-td">{(r.transferred as number) ?? 0}</td>
                    <td className="table-td">{(r.disposed as number) ?? 0}</td>
                    <td className="table-td">{(r.closed as number) ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ageing */}
      {tab === "ageing" && ageingQ.data && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              {ageingQ.data.length} open cases sorted by age (oldest first)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-th">Case ID</th>
                  <th className="table-th">Age (days)</th>
                  <th className="table-th">Bureau</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Priority</th>
                  <th className="table-th">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ageingQ.data.slice(0, 50).map((r: Record<string, unknown>) => (
                  <tr key={r.case_id as string} className={`hover:bg-gray-50 ${r.is_overdue ? "bg-red-50/30" : ""}`}>
                    <td className="table-td font-mono text-xs font-semibold text-primary-700">
                      {r.case_id as string}
                    </td>
                    <td className="table-td font-semibold">{r.age_days as number}</td>
                    <td className="table-td"><span className="badge bg-indigo-50 text-indigo-700">{r.bureau as string}</span></td>
                    <td className="table-td"><span className="badge bg-gray-100 text-gray-700">{r.status as string}</span></td>
                    <td className="table-td capitalize">{r.priority as string}</td>
                    <td className="table-td">
                      {r.is_overdue ? <span className="badge bg-red-100 text-red-700">Yes</span> : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disposal Rate */}
      {tab === "disposal" && disposalQ.data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Disposal Rate (%)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={disposalQ.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Line type="monotone" dataKey="rate_pct" stroke="#16a34a" strokeWidth={2} name="Disposal Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200">
                <th className="table-th">Period</th>
                <th className="table-th">Received</th>
                <th className="table-th">Disposed</th>
                <th className="table-th">Rate</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {disposalQ.data.map((r: Record<string, unknown>) => (
                  <tr key={r.period as string} className="hover:bg-gray-50">
                    <td className="table-td">{r.period as string}</td>
                    <td className="table-td">{r.received as number}</td>
                    <td className="table-td">{r.disposed as number}</td>
                    <td className="table-td font-semibold text-green-700">{r.rate_pct as number}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
