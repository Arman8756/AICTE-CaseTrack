import { AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  count: number;
  caseId?: string;
}

export function OverlapAlertBanner({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">
          Potential Overlapping Cases — Coordination Required
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          {count} case pair{count !== 1 ? "s" : ""} involve the same institution across different
          bureaus. Human review and coordination is required. No case will be automatically closed.
        </p>
      </div>
      <Link to="/overlaps" className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900">
        View <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

export function CaseOverlapBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 badge bg-amber-100 text-amber-800">
      <AlertTriangle className="w-3 h-3" />
      {count} overlap{count !== 1 ? "s" : ""}
    </span>
  );
}
