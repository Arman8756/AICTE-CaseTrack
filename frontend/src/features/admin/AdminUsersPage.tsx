import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUsers, createUser, updateUser, deactivateUser } from "../../api/admin";
import { PageLoader } from "../../components/LoadingSpinner";
import { getRoleLabel, formatDate } from "../../utils";
import { Plus, UserX } from "lucide-react";
import toast from "react-hot-toast";
import type { UserRole, Bureau } from "../../types";

const ROLES: UserRole[] = ["admin","rb_officer","pgrc_officer","regional_officer","senior_management"];
const BUREAUS: Bureau[] = ["Admin","RB","PGRC","Regional","Management"];

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: "", email: "", password: "", full_name: "",
    role: "rb_officer" as UserRole, bureau: "RB" as Bureau, region: "",
  });

  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: listUsers });

  const createMut = useMutation({
    mutationFn: () => createUser(form),
    onSuccess: () => {
      toast.success("User created");
      setShowForm(false);
      setForm({ username: "", email: "", password: "", full_name: "", role: "rb_officer", bureau: "RB", region: "" });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => {
      toast.success("User deactivated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-th">Name</th>
                  <th className="table-th">Username</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Bureau</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Last Login</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.items ?? []).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="table-td font-medium">{user.full_name}</td>
                    <td className="table-td font-mono text-xs text-gray-600">{user.username}</td>
                    <td className="table-td">
                      <span className="badge bg-blue-50 text-blue-700 text-xs">{getRoleLabel(user.role)}</span>
                    </td>
                    <td className="table-td text-gray-600">{user.bureau}</td>
                    <td className="table-td">
                      <span className={`badge ${user.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="table-td text-gray-500 text-xs">{formatDate(user.last_login)}</td>
                    <td className="table-td">
                      {user.is_active && (
                        <button
                          onClick={() => deactivateMut.mutate(user.id)}
                          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <UserX className="w-3.5 h-3.5" /> Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create user modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Full Name", key: "full_name", type: "text" },
                { label: "Username", key: "username", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Password", key: "password", type: "password" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    className="form-input"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div>
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}>
                  {ROLES.map((r) => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Bureau</label>
                <select className="form-input" value={form.bureau} onChange={(e) => setForm((f) => ({ ...f, bureau: e.target.value as Bureau }))}>
                  {BUREAUS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="form-label">Region (for regional officers)</label>
                <input type="text" className="form-input" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="btn-primary">
                {createMut.isPending ? "Creating…" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
