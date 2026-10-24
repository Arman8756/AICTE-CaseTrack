import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listComplaints } from "../../api/complaints";
import { StatusBadge } from "../../components/StatusBadge";
import { Pagination } from "../../components/Pagination";
import { PageLoader } from "../../components/LoadingSpinner";
import { CaseOverlapBadge } from "../../components/OverlapAlert";
import { formatDate } from "../../utils";
import { Search, Plus, Download } from "lucide-react";
import { exportCSV } from "../../api/reports";

const STATUSES = ["new", "under_process", "transferred", "pending_info", "disposed", "closed"];
const BUREAUS = ["RB", "PGRC", "Regional", "Joint"];
const PRIORITIES = ["low", "normal", "high", "urgent"];

export default function ComplaintsListPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    bureau: "",
    priority: "",
    overdue_only: false,
    has_overlap: false,
    is_escalated: false,
    page: 1,
    page_size: 25,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", filters],
    queryFn: () => listComplaints(filters),
  });

  const set = (k: string, v: unknown) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `${data.total} total cases` : "Loading..."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV({ status: filters.status, bureau: filters.bureau })}
            className="btn-secondary"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <Link to="/complaints/new" className="btn-primary">
            <Plus className="w-4 h-4" /> New Complaint
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="form-input pl-9"
              placeholder="Search by Case ID, Institution, AICTE ID…"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
            />
          </div>
          <select className="form-input" value={filters.status} onChange={(e) => set("status", e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <select className="form-input" value={filters.bureau} onChange={(e) => set("bureau", e.target.value)}>
            <option value="">All Bureaus</option>
            {BUREAUS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="form-input" value={filters.priority} onChange={(e) => set("priority", e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="flex items-center gap-4 col-span-1 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.overdue_only}
                onChange={(e) => set("overdue_only", e.target.checked)}
                className="rounded border-gray-300 text-primary-600"
              />
              Overdue only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.has_overlap}
                onChange={(e) => set("has_overlap", e.target.checked)}
                className="rounded border-gray-300 text-primary-600"
              />
              Has overlap
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.is_escalated}
                onChange={(e) => set("is_escalated", e.target.checked)}
                className="rounded border-gray-300 text-primary-600"
              />
              Escalated
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <PageLoader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-th">Case ID</th>
                  <th className="table-th">Institution</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Bureau</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Received</th>
                  <th className="table-th">Expected Disposal</th>
                  <th className="table-th">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.items ?? []).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <Link
                        to={`/complaints/${c.id}`}
                        className="font-mono text-xs font-semibold text-primary-700 hover:underline"
                      >
                        {c.case_id}
                      </Link>
                    </td>
                    <td className="table-td">
                      <div className="font-medium text-gray-900 max-w-xs truncate">
                        {c.institution.name}
                      </div>
                      {c.institution.aicte_permanent_id && (
                        <div className="text-xs text-gray-400 font-mono">
                          {c.institution.aicte_permanent_id}
                        </div>
                      )}
                    </td>
                    <td className="table-td text-gray-600">{c.category}</td>
                    <td className="table-td">
                      <span className="badge bg-indigo-50 text-indigo-700">{c.assigned_bureau}</span>
                    </td>
                    <td className="table-td">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="table-td text-gray-500">{formatDate(c.received_date)}</td>
                    <td className="table-td text-gray-500">
                      {c.expected_disposal_date ? (
                        <span className={c.is_overdue ? "text-red-600 font-medium" : ""}>
                          {formatDate(c.expected_disposal_date)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="table-td">
                      <div className="flex flex-wrap gap-1">
                        {c.is_overdue && (
                          <span className="badge bg-red-100 text-red-700">Overdue</span>
                        )}
                        {c.is_escalated && (
                          <span className="badge bg-purple-100 text-purple-700">Escalated</span>
                        )}
                        {c.has_overlap && <CaseOverlapBadge count={c.overlap_count} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.items ?? []).length === 0 && (
              <div className="text-center py-12 text-gray-400">No complaints found.</div>
            )}
          </div>
        )}
        {data && (
          <Pagination
            page={filters.page}
            pageSize={filters.page_size}
            total={data.total}
            onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
        )}
      </div>
    </div>
  );
}
