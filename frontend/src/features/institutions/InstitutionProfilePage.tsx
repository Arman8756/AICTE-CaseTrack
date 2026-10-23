import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInstitution } from "../../api/institutions";
import { listComplaints } from "../../api/complaints";
import { PageLoader } from "../../components/LoadingSpinner";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDate } from "../../utils";
import { ArrowLeft, MapPin, Phone, Mail, Building } from "lucide-react";

export default function InstitutionProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: inst, isLoading } = useQuery({
    queryKey: ["institution", id],
    queryFn: () => getInstitution(id!),
    enabled: !!id,
  });

  const { data: complaints } = useQuery({
    queryKey: ["institution-complaints", id],
    queryFn: () => listComplaints({ institution_id: id!, page_size: 50 }),
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;
  if (!inst) return <div className="p-6 text-gray-500">Institution not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/institutions" className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{inst.name}</h1>
        <span className={`badge ${
          inst.approval_status === "Approved" ? "bg-green-100 text-green-700" :
          inst.approval_status === "Debarred" ? "bg-red-100 text-red-700" :
          "bg-gray-100 text-gray-600"
        }`}>{inst.approval_status}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Institution Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <Building className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs">AICTE Permanent ID</p>
                <p className="font-mono font-semibold">{inst.aicte_permanent_id ?? "Not assigned"}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Building className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs">Type</p>
                <p>{inst.institution_type ?? "—"}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs">Location</p>
                <p>{inst.district}, {inst.state}</p>
                <p className="text-gray-400 text-xs">Region: {inst.region}</p>
              </div>
            </div>
            {inst.contact_email && (
              <div className="flex gap-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p>{inst.contact_email}</p>
                </div>
              </div>
            )}
            {inst.contact_phone && (
              <div className="flex gap-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p>{inst.contact_phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Complaint Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total", val: complaints?.total ?? 0, color: "text-blue-700 bg-blue-50" },
              { label: "Open", val: (complaints?.items ?? []).filter(c => !["disposed","closed"].includes(c.status)).length, color: "text-yellow-700 bg-yellow-50" },
              { label: "Disposed", val: (complaints?.items ?? []).filter(c => c.status === "disposed").length, color: "text-green-700 bg-green-50" },
              { label: "Overlapping", val: (complaints?.items ?? []).filter(c => c.has_overlap).length, color: "text-amber-700 bg-amber-50" },
            ].map(({ label, val, color }) => (
              <div key={label} className={`rounded-lg p-3 ${color}`}>
                <p className="text-2xl font-bold">{val}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complaints table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">All Complaints ({complaints?.total ?? 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-th">Case ID</th>
                <th className="table-th">Category</th>
                <th className="table-th">Bureau</th>
                <th className="table-th">Status</th>
                <th className="table-th">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(complaints?.items ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="table-td">
                    <Link to={`/complaints/${c.id}`} className="font-mono text-xs font-semibold text-primary-700 hover:underline">
                      {c.case_id}
                    </Link>
                  </td>
                  <td className="table-td text-gray-600">{c.category}</td>
                  <td className="table-td">
                    <span className="badge bg-indigo-50 text-indigo-700">{c.assigned_bureau}</span>
                  </td>
                  <td className="table-td"><StatusBadge status={c.status} /></td>
                  <td className="table-td text-gray-500">{formatDate(c.received_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(complaints?.items ?? []).length === 0 && (
            <div className="text-center py-8 text-gray-400">No complaints for this institution.</div>
          )}
        </div>
      </div>
    </div>
  );
}
