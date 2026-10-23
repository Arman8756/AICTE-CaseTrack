import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createComplaint } from "../../api/complaints";
import { listInstitutions } from "../../api/institutions";
import { listComplaints } from "../../api/complaints";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";
import { ArrowLeft, Search, AlertTriangle } from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDate } from "../../utils";

const CATEGORIES = [
  "Admission Irregularities", "Fee Regulation Violation", "Faculty Shortage",
  "Infrastructure Deficiency", "Affiliation Issues", "Examination Malpractice",
  "Scholarship Disbursal", "Harassment Complaint", "Closure Procedure", "NBA/NAAC Compliance",
];
const BUREAUS = ["RB", "PGRC", "Regional", "Joint"];
const CHANNELS = ["email", "portal", "post", "phone", "walk_in"];
const PRIORITIES = ["low", "normal", "high", "urgent"];
const COMPLAINANT_TYPES = ["Student", "Faculty", "Staff", "Public", "Anonymous", "Parent"];

export default function NewComplaintPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [institutionSearch, setInstitutionSearch] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<{ id: string; name: string; aicte_permanent_id: string | null } | null>(null);
  const [form, setForm] = useState({
    received_date: new Date().toISOString().split("T")[0],
    received_channel: "email",
    category: "",
    sub_category: "",
    description: "",
    complainant_type: "Public",
    priority: "normal",
    assigned_bureau: user?.bureau === "RB" || user?.bureau === "PGRC" ? user.bureau : "RB",
    expected_disposal_date: "",
    next_action_required: "",
  });

  const { data: institutionSearch_result } = useQuery({
    queryKey: ["institutions-search", institutionSearch],
    queryFn: () => listInstitutions({ search: institutionSearch, page_size: 10 }),
    enabled: institutionSearch.length > 2,
  });

  // Preview overlaps for selected institution
  const { data: previewOverlaps } = useQuery({
    queryKey: ["overlap-preview", selectedInstitution?.id],
    queryFn: () => listComplaints({
      institution_id: selectedInstitution!.id,
      page_size: 5,
      status: "under_process",
    }),
    enabled: !!selectedInstitution,
  });

  const createMut = useMutation({
    mutationFn: () => createComplaint({
      institution_id: selectedInstitution!.id,
      ...form,
      expected_disposal_date: form.expected_disposal_date || undefined,
    }),
    onSuccess: (data) => {
      toast.success(`Case ${data.case_id} created`);
      navigate(`/complaints/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitution) { toast.error("Please select an institution"); return; }
    if (!form.category) { toast.error("Please select a category"); return; }
    if (!form.description.trim()) { toast.error("Please enter a description"); return; }
    createMut.mutate();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/complaints" className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Complaint</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Institution */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Institution</h2>
          {selectedInstitution ? (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{selectedInstitution.name}</p>
                {selectedInstitution.aicte_permanent_id && (
                  <p className="text-xs font-mono text-gray-500 mt-0.5">{selectedInstitution.aicte_permanent_id}</p>
                )}
              </div>
              <button type="button" onClick={() => setSelectedInstitution(null)} className="text-xs text-gray-500 hover:text-red-600">
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="form-input pl-9"
                placeholder="Search institution by name or AICTE ID…"
                value={institutionSearch}
                onChange={(e) => setInstitutionSearch(e.target.value)}
              />
              {institutionSearch_result && institutionSearch.length > 2 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {institutionSearch_result.items.map((inst) => (
                    <button
                      key={inst.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0"
                      onClick={() => {
                        setSelectedInstitution(inst);
                        setInstitutionSearch("");
                      }}
                    >
                      <div className="font-medium">{inst.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{inst.aicte_permanent_id ?? "No AICTE ID"}</div>
                    </button>
                  ))}
                  {institutionSearch_result.items.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400">No institutions found</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Overlap preview */}
          {selectedInstitution && previewOverlaps && previewOverlaps.total > 0 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-semibold text-amber-800">
                  Existing open cases for this institution ({previewOverlaps.total})
                </p>
              </div>
              <p className="text-xs text-amber-700 mb-2">
                Filing this complaint may create an overlap. Human coordination will be required.
              </p>
              <div className="space-y-1.5">
                {previewOverlaps.items.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-amber-700">{c.case_id}</span>
                    <span className="text-amber-600">{c.assigned_bureau}</span>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Complaint fields */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Complaint Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Received Date *</label>
              <input
                type="date"
                className="form-input"
                value={form.received_date}
                onChange={(e) => setForm((f) => ({ ...f, received_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="form-label">Channel</label>
              <select
                className="form-input"
                value={form.received_channel}
                onChange={(e) => setForm((f) => ({ ...f, received_channel: e.target.value }))}
              >
                {CHANNELS.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select
                className="form-input"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                required
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Complainant Type</label>
              <select
                className="form-input"
                value={form.complainant_type}
                onChange={(e) => setForm((f) => ({ ...f, complainant_type: e.target.value }))}
              >
                {COMPLAINANT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select
                className="form-input"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Assigned Bureau</label>
              <select
                className="form-input"
                value={form.assigned_bureau}
                onChange={(e) => setForm((f) => ({ ...f, assigned_bureau: e.target.value }))}
              >
                {BUREAUS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Expected Disposal Date</label>
              <input
                type="date"
                className="form-input"
                value={form.expected_disposal_date}
                onChange={(e) => setForm((f) => ({ ...f, expected_disposal_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Description *</label>
            <textarea
              className="form-input"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the complaint in detail…"
              required
            />
          </div>

          <div>
            <label className="form-label">Next Action Required</label>
            <input
              type="text"
              className="form-input"
              value={form.next_action_required}
              onChange={(e) => setForm((f) => ({ ...f, next_action_required: e.target.value }))}
              placeholder="e.g. Seek clarification from institution"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link to="/complaints" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={createMut.isPending} className="btn-primary">
            {createMut.isPending ? "Creating…" : "Create Complaint"}
          </button>
        </div>
      </form>
    </div>
  );
}
