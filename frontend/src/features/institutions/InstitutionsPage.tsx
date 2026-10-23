import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listInstitutions } from "../../api/institutions";
import { Pagination } from "../../components/Pagination";
import { PageLoader } from "../../components/LoadingSpinner";
import { Search, Landmark } from "lucide-react";

const REGIONS = ["North","South","East","West","Central","North-East","North-West","South-East"];

export default function InstitutionsPage() {
  const [filters, setFilters] = useState({
    search: "", region: "", approval_status: "", page: 1, page_size: 25,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["institutions", filters],
    queryFn: () => listInstitutions(filters),
  });

  const set = (k: string, v: unknown) => setFilters((f) => ({ ...f, [k]: v, page: 1 }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? "…"} registered institutions</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="form-input pl-9"
              placeholder="Search by name or AICTE ID…"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
            />
          </div>
          <select className="form-input" value={filters.region} onChange={(e) => set("region", e.target.value)}>
            <option value="">All Regions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select className="form-input" value={filters.approval_status} onChange={(e) => set("approval_status", e.target.value)}>
            <option value="">All Statuses</option>
            {["Approved","Conditionally Approved","Debarred","Closed"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-th">Institution</th>
                  <th className="table-th">AICTE ID</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Region / State</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.items ?? []).map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50">
                    <td className="table-td">
                      <Link to={`/institutions/${inst.id}`} className="font-medium text-primary-700 hover:underline">
                        {inst.name}
                      </Link>
                    </td>
                    <td className="table-td font-mono text-xs text-gray-500">
                      {inst.aicte_permanent_id ?? "—"}
                    </td>
                    <td className="table-td text-gray-600">{inst.institution_type ?? "—"}</td>
                    <td className="table-td text-gray-600">
                      <div>{inst.region}</div>
                      <div className="text-xs text-gray-400">{inst.state}</div>
                    </td>
                    <td className="table-td">
                      <span className={`badge ${
                        inst.approval_status === "Approved" ? "bg-green-100 text-green-700" :
                        inst.approval_status === "Debarred" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {inst.approval_status ?? "Unknown"}
                      </span>
                    </td>
                    <td className="table-td text-gray-700 font-medium">
                      {inst.complaint_count ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.items ?? []).length === 0 && (
              <div className="text-center py-12 text-gray-400">No institutions found.</div>
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
