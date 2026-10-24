import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Building2, LayoutDashboard, FileText, Landmark, AlertTriangle,
  BarChart3, Users, LogOut, Menu, X, Bell, Shield,
} from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { getRoleLabel } from "../utils";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../api/dashboard";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/complaints", icon: FileText, label: "Complaints" },
  { to: "/institutions", icon: Landmark, label: "Institutions" },
  { to: "/overlaps", icon: AlertTriangle, label: "Overlaps" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

const adminItems = [
  { to: "/admin/users", icon: Users, label: "User Management" },
  { to: "/admin/audit", icon: Shield, label: "Audit Log" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    refetchInterval: 60000,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";
  const isMgmt = user?.role === "senior_management" || isAdmin;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-900 text-white flex flex-col transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-primary-800">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-primary-800" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">AICTE CaseTrack</div>
            <div className="text-primary-300 text-xs">Complaint Dashboard</div>
          </div>
          <button
            className="ml-auto lg:hidden text-primary-300 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-700 text-white"
                      : "text-primary-200 hover:bg-primary-800 hover:text-white"
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
                {to === "/overlaps" && (summary?.overlapping ?? 0) > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {summary!.overlapping > 9 ? "9+" : summary!.overlapping}
                  </span>
                )}
                {to === "/complaints" && (summary?.overdue ?? 0) > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 text-xs">
                    {summary!.overdue} overdue
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {(isAdmin || isMgmt) && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-primary-400 uppercase tracking-wider">
                Administration
              </div>
              <div className="space-y-0.5">
                {adminItems.map(({ to, icon: Icon, label }) => (
                  isAdmin || to === "/admin/audit" ? (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary-700 text-white"
                            : "text-primary-200 hover:bg-primary-800 hover:text-white"
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </NavLink>
                  ) : null
                ))}
              </div>
            </>
          )}
        </nav>

        {/* User info */}
        <div className="border-t border-primary-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.full_name?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-primary-300 truncate">{getRoleLabel(user?.role ?? "")}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-primary-300 hover:text-white p-1 rounded"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <button
            className="lg:hidden p-1.5 rounded text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {(summary?.overdue ?? 0) > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                <Bell className="w-3 h-3" />
                {summary!.overdue} overdue
              </span>
            )}
            <span className="hidden sm:block text-sm text-gray-500">
              Bureau: <strong className="text-gray-700">{user?.bureau}</strong>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
