import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import { Building2, Lock, User } from "lucide-react";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
      navigate("/dashboard");
    } catch {
      toast.error("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
            <Building2 className="w-9 h-9 text-primary-700" />
          </div>
          <h1 className="text-2xl font-bold text-white">AICTE CaseTrack</h1>
          <p className="text-primary-200 mt-1 text-sm">
            Integrated Complaint Monitoring Dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  className="form-input pl-10"
                  placeholder="e.g. rb_officer1"
                  autoComplete="username"
                  {...register("username")}
                />
              </div>
              {errors.username && <p className="form-error">{errors.username.message}</p>}
            </div>

            <div>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  className="form-input pl-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-2.5">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-1">Demo Credentials</p>
            <div className="text-xs text-blue-600 space-y-0.5">
              <div>Admin: <code className="font-mono">admin / Admin@123</code></div>
              <div>RB Officer: <code className="font-mono">rb_officer1 / RBOfficer@123</code></div>
              <div>PGRC Officer: <code className="font-mono">pgrc_officer1 / PGRCOfficer@123</code></div>
              <div>Senior Mgmt: <code className="font-mono">senior_mgmt / Director@123</code></div>
            </div>
          </div>
        </div>

        <p className="text-center text-primary-200 text-xs mt-6">
          All India Council for Technical Education — Internal System
        </p>
      </div>
    </div>
  );
}
