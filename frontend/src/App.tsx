import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./features/auth/AuthContext";
import ProtectedRoute from "./layouts/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./features/auth/LoginPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import ComplaintsListPage from "./features/complaints/ComplaintsListPage";
import ComplaintDetailPage from "./features/complaints/ComplaintDetailPage";
import NewComplaintPage from "./features/complaints/NewComplaintPage";
import InstitutionsPage from "./features/institutions/InstitutionsPage";
import InstitutionProfilePage from "./features/institutions/InstitutionProfilePage";
import OverlapsPage from "./features/overlaps/OverlapsPage";
import ReportsPage from "./features/reports/ReportsPage";
import AdminUsersPage from "./features/admin/AdminUsersPage";
import AuditLogPage from "./features/admin/AuditLogPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/complaints" element={<ComplaintsListPage />} />
                <Route path="/complaints/new" element={<NewComplaintPage />} />
                <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
                <Route path="/institutions" element={<InstitutionsPage />} />
                <Route path="/institutions/:id" element={<InstitutionProfilePage />} />
                <Route path="/overlaps" element={<OverlapsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/audit" element={<AuditLogPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: "14px" },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
