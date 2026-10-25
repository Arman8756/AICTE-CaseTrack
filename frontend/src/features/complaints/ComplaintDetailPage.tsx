import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComplaint, getComplaintActions, addAction,
  transferComplaint, escalateComplaint,
} from "../../api/complaints";
import { StatusBadge } from "../../components/StatusBadge";
import { PageLoader } from "../../components/LoadingSpinner";
import { OverlapAlertBanner } from "../../components/OverlapAlert";
import DocumentUpload from "../../components/DocumentUpload";
import {
  formatDate, formatDateTime, getActionTypeLabel,
  getPriorityColor, getBureauColor, isReadOnlyRole,
} from "../../utils";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import {
  ArrowLeft, Clock, AlertTriangle, MessageSquare, ArrowRightLeft,
  CheckCircle,
} from "lucide-react";

const ACTION_ICON: Record<string, React.ReactNode> = {
  created: <CheckCircle className="w-4 h-4 text-green-600" />,
  status_change: <Clock className="w-4 h-4 text-blue-600" />,
  remark: <MessageSquare className="w-4 h-4 text-gray-500" />,
  transfer: <ArrowRightLeft className="w-4 h-4 text-purple-600" />,
  escalation: <AlertTriangle className="w-4 h-4 text-red-600" />,
  overlap_acknowledged: <CheckCircle className="w-4 h-4 text-amber-600" />,
  disposition: <CheckCircle className="w-4 h-4 text-teal-600" />,
};

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const readOnly = isReadOnlyRole(user?.role ?? "");

  const [remarkText, setRemarkText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [transferBureau, setTransferBureau] = useState("");
  const [transferRemarks, setTransferRemarks] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [escalateRemarks, setEscalateRemarks] = useState("");

  const { data: complaint, isLoading } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => getComplaint(id!),
    enabled: !!id,
  });

  const { data: actions = [] } = useQuery({
    queryKey: ["complaint-actions", id],
    queryFn: () => getComplaintActions(id!),
    enabled: !!id,
  });

  const addActionMut = useMutation({
    mutationFn: () => addAction(id!, {
      remarks: remarkText,
      new_status: newStatus || undefined,
    }),
    onSuccess: () => {
      toast.success("Action recorded");
      setRemarkText("");
      setNewStatus("");
      qc.invalidateQueries({ queryKey: ["complaint", id] });
      qc.invalidateQueries({ queryKey: ["complaint-actions", id] });
    },
  });

  const transferMut = useMutation({
    mutationFn: () => transferComplaint(id!, { to_bureau: transferBureau, remarks: transferRemarks }),
    onSuccess: () => {
      toast.success(`Case transferred to ${transferBureau}`);
      setShowTransfer(false);
      qc.invalidateQueries({ queryKey: ["complaint", id] });
    },
  });

  const escalateMut = useMutation({
    mutationFn: () => escalateComplaint(id!, escalateRemarks),
    onSuccess: () => {
      toast.success("Case escalated");
      setShowEscalate(false);
      qc.invalidateQueries({ queryKey: ["complaint", id] });
    },
  });

  if (isLoading) return <PageLoader />;
  if (!complaint) return <div className="p-6 text-gray-500">Complaint not found.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Link to="/complaints" className="mt-1 p-1.5 rounded-md text-gray-400 hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold font-mono text-gray-900">{complaint.case_id}</h1>
            <StatusBadge status={complaint.status} />
            <span className={`badge ${getPriorityColor(complaint.priority)}`}>
              {complaint.priority}
            </span>
            <span className={`badge ${getBureauColor(complaint.assigned_bureau)}`}>
              {complaint.assigned_bureau}
            </span>
            {complaint.is_overdue && <span className="badge bg-red-100 text-red-700">Overdue</span>}
            {complaint.is_escalated && <span className="badge bg-purple-100 text-purple-700">Escalated</span>}
          </div>
          <p className="text-sm text-gray-500">
            Received {formatDate(complaint.received_date)} via {complaint.received_channel} ·{" "}
            {complaint.assigned_officer ? `Assigned to ${complaint.assigned_officer.full_name}` : "Unassigned"}
          </p>
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            {!complaint.is_escalated && (
              <button onClick={() => setShowEscalate(true)} className="btn-secondary text-red-600 border-red-200">
                <AlertTriangle className="w-4 h-4" /> Escalate
              </button>
            )}
            <button onClick={() => setShowTransfer(true)} className="btn-secondary">
              <ArrowRightLeft className="w-4 h-4" /> Transfer
            </button>
          </div>
        )}
      </div>

      {/* Overlap alert */}
      {complaint.has_overlap && <OverlapAlertBanner count={complaint.overlap_count} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case details card */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Case Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Institution</p>
                <Link
                  to={`/institutions/${complaint.institution.id}`}
                  className="font-medium text-primary-700 hover:underline"
                >
                  {complaint.institution.name}
                </Link>
                {complaint.institution.aicte_permanent_id && (
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {complaint.institution.aicte_permanent_id}
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Category</p>
                <p className="font-medium">{complaint.category}</p>
                {complaint.sub_category && <p className="text-xs text-gray-400">{complaint.sub_category}</p>}
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Complainant Type</p>
                <p>{complaint.complainant_type ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Channel</p>
                <p className="capitalize">{complaint.received_channel}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Expected Disposal</p>
                <p className={complaint.is_overdue ? "text-red-600 font-medium" : ""}>
                  {formatDate(complaint.expected_disposal_date) || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Actual Disposal</p>
                <p>{formatDate(complaint.actual_disposal_date) || "—"}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-500 text-xs mb-1">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{complaint.description}</p>
            </div>
            {complaint.next_action_required && (
              <div className="mt-3 p-3 bg-blue-50 rounded-md">
                <p className="text-xs font-semibold text-blue-700">Next Action Required</p>
                <p className="text-sm text-blue-800 mt-0.5">{complaint.next_action_required}</p>
              </div>
            )}
          </div>

          {/* Add Action */}
          {!readOnly && (
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Add Action / Remark</h2>
              <div className="space-y-3">
                <div>
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter your remarks or action taken…"
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Update Status (optional)</label>
                  <select
                    className="form-input"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">Keep current status</option>
                    {["new","under_process","transferred","pending_info","disposed","closed"].map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => addActionMut.mutate()}
                  disabled={!remarkText.trim() || addActionMut.isPending}
                  className="btn-primary"
                >
                  {addActionMut.isPending ? "Saving…" : "Record Action"}
                </button>
              </div>
            </div>
          )}

          {/* Documents */}
          <DocumentUpload
            complaintId={complaint.id}
            readOnly={readOnly}
            uploaderName={user?.full_name ?? "Current User"}
          />
        </div>

        {/* Right column — timeline */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Action History</h2>
          <div className="relative">
            <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-200" aria-hidden="true" />
            <div className="space-y-4">
              {actions.map((action) => (
                <div key={action.id} className="relative flex gap-3 pl-1">
                  <div className="relative z-10 flex-shrink-0 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                    {ACTION_ICON[action.action_type] ?? <Clock className="w-3 h-3 text-gray-400" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-800">
                        {getActionTypeLabel(action.action_type)}
                      </span>
                      {action.new_status && (
                        <StatusBadge status={action.new_status} />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{action.performed_by}</p>
                    {action.remarks && (
                      <p className="text-xs text-gray-600 mt-1">{action.remarks}</p>
                    )}
                    {action.transferred_to_bureau && (
                      <p className="text-xs text-purple-600 mt-0.5">
                        → Transferred to {action.transferred_to_bureau}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(action.performed_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Case</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Transfer to Bureau</label>
                <select
                  className="form-input"
                  value={transferBureau}
                  onChange={(e) => setTransferBureau(e.target.value)}
                >
                  <option value="">Select bureau…</option>
                  {["RB", "PGRC", "Regional", "Joint"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Reason for Transfer</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  placeholder="Enter reason…"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setShowTransfer(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => transferMut.mutate()}
                disabled={!transferBureau || !transferRemarks.trim() || transferMut.isPending}
                className="btn-primary"
              >
                {transferMut.isPending ? "Transferring…" : "Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Escalate Case</h3>
            <p className="text-sm text-gray-500 mb-4">
              This will flag the case for senior management attention.
            </p>
            <div>
              <label className="form-label">Reason for Escalation</label>
              <textarea
                className="form-input"
                rows={3}
                value={escalateRemarks}
                onChange={(e) => setEscalateRemarks(e.target.value)}
                placeholder="Enter reason for escalation…"
              />
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setShowEscalate(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => escalateMut.mutate()}
                disabled={!escalateRemarks.trim() || escalateMut.isPending}
                className="btn-danger"
              >
                {escalateMut.isPending ? "Escalating…" : "Escalate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
