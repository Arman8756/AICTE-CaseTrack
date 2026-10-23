import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listOverlaps, acknowledgeOverlap } from "../../api/overlaps";
import { Link } from "react-router-dom";
import { PageLoader } from "../../components/LoadingSpinner";
import { StatusBadge } from "../../components/StatusBadge";
import { Pagination } from "../../components/Pagination";
import { formatDateTime } from "../../utils";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

export default function OverlapsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState(true);
  const [acknowledgeId, setAcknowledgeId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["overlaps", activeOnly, page],
    queryFn: () => listOverlaps({ active_only: activeOnly, page, page_size: 25 }),
  });

  const ackMut = useMutation({
    mutationFn: () => acknowledgeOverlap(acknowledgeId!, resolutionNote),
    onSuccess: () => {
      toast.success("Overlap acknowledged");
      setAcknowledgeId(null);
      setResolutionNote("");
      qc.invalidateQueries({ queryKey: ["overlaps"] });
    },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overlaps Center</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Cases involving the same institution across different Bureaus.
        </p>
      </div>

      {/* Warning banner */}
      {(data?.unacknowledged_count ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Potential Overlapping Cases — Coordination Required
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {data!.unacknowledged_count} unacknowledged overlap pair{data!.unacknowledged_count !== 1 ? "s" : ""} require human review.
              The system does not automatically close or decide any case. Officers must coordinate and
              manually acknowledge each overlap.
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => { setActiveOnly(e.target.checked); setPage(1); }}
            className="rounded border-gray-300 text-primary-600"
          />
          Active overlaps only
        </label>
        {data && (
          <span className="text-sm text-gray-500">{data.total} pairs found</span>
        )}
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
                  <th className="table-th">Institution</th>
                  <th className="table-th">Case A (RB)</th>
                  <th className="table-th">Case B (PGRC)</th>
                  <th className="table-th">Match</th>
                  <th className="table-th">Detected</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.items ?? []).map((ov) => (
                  <tr key={ov.id} className={`hover:bg-gray-50 ${!ov.acknowledged_at ? "bg-amber-50/40" : ""}`}>
                    <td className="table-td">
                      <p className="font-medium text-gray-900 max-w-xs truncate">
                        {ov.case_a.institution_name}
                      </p>
                    </td>
                    <td className="table-td">
                      <Link to={`/complaints/${ov.case_a.id}`} className="font-mono text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1">
                        {ov.case_a.case_id} <ExternalLink className="w-3 h-3" />
                      </Link>
                      <div className="flex gap-1 mt-1">
                        <span className="badge bg-indigo-50 text-indigo-700 text-xs">{ov.case_a.assigned_bureau}</span>
                        <StatusBadge status={ov.case_a.status} />
                      </div>
                    </td>
                    <td className="table-td">
                      <Link to={`/complaints/${ov.case_b.id}`} className="font-mono text-xs font-semibold text-primary-700 hover:underline flex items-center gap-1">
                        {ov.case_b.case_id} <ExternalLink className="w-3 h-3" />
                      </Link>
                      <div className="flex gap-1 mt-1">
                        <span className="badge bg-teal-50 text-teal-700 text-xs">{ov.case_b.assigned_bureau}</span>
                        <StatusBadge status={ov.case_b.status} />
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="badge bg-gray-100 text-gray-700">
                        {ov.match_method.replace(/_/g, " ")}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">
                        Score: {(ov.similarity_score * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="table-td text-gray-500 text-xs">{formatDateTime(ov.detected_at)}</td>
                    <td className="table-td">
                      {ov.acknowledged_at ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs text-green-700 font-medium">Acknowledged</p>
                            <p className="text-xs text-gray-400">{ov.acknowledged_by_name}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="badge bg-amber-100 text-amber-800">Pending Review</span>
                      )}
                    </td>
                    <td className="table-td">
                      {!ov.acknowledged_at && ov.is_active && (
                        <button
                          onClick={() => setAcknowledgeId(ov.id)}
                          className="btn-secondary text-xs py-1 px-2"
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data?.items ?? []).length === 0 && (
              <div className="text-center py-12 text-gray-400">
                {activeOnly ? "No active overlaps. All cases are coordinated." : "No overlap records found."}
              </div>
            )}
          </div>
        )}
        {data && (
          <Pagination page={page} pageSize={25} total={data.total} onPageChange={setPage} />
        )}
      </div>

      {/* Acknowledge Modal */}
      {acknowledgeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acknowledge Overlap</h3>
            <p className="text-sm text-gray-500 mb-4">
              Acknowledging this overlap indicates that you have reviewed the cases and coordinated
              with the relevant Bureau. <strong>No case will be automatically closed or modified.</strong>
            </p>
            <div>
              <label className="form-label">Coordination Note (required)</label>
              <textarea
                className="form-input"
                rows={4}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Describe the coordination taken or planned between bureaus…"
              />
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => { setAcknowledgeId(null); setResolutionNote(""); }} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => ackMut.mutate()}
                disabled={!resolutionNote.trim() || ackMut.isPending}
                className="btn-primary"
              >
                {ackMut.isPending ? "Saving…" : "Confirm Acknowledgment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
