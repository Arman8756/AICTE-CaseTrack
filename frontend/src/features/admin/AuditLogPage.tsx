import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLog } from "../../api/admin";
import { PageLoader } from "../../components/LoadingSpinner";
import { Pagination } from "../../components/Pagination";
import { formatDateTime } from "../../utils";
import { Search } from "lucide-react";

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-log", page, search],
    queryFn: () => getAuditLog({ page, page_size: 50, action: search || undefined }),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-0.5">All system actions are logged here.</p>
      </div>

      <div className="card p-4">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="form-input pl-9"
            placeholder="Filter by action…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-th">Timestamp</th>
                  <th className="table-th">Action</th>
                  <th className="table-th">Endpoint</th>
                  <th className="table-th">Method</th>
                  <th className="table-th">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.items ?? []).map((log: Record<string, string>) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="table-td text-xs text-gray-500">{formatDateTime(log.performed_at)}</td>
                    <td className="table-td">
                      <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{log.action}</span>
                    </td>
                    <td className="table-td font-mono text-xs text-gray-500 max-w-xs truncate">{log.endpoint}</td>
                    <td className="table-td">
                      <span className={`badge text-xs ${
                        log.request_method === "DELETE" ? "bg-red-100 text-red-700" :
                        log.request_method === "POST" ? "bg-green-100 text-green-700" :
                        log.request_method === "PUT" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{log.request_method}</span>
                    </td>
                    <td className="table-td text-xs text-gray-400">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.items ?? []).length === 0 && (
              <div className="text-center py-12 text-gray-400">No audit log entries found.</div>
            )}
          </div>
        )}
        {data && (
          <Pagination page={page} pageSize={50} total={data.total} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
