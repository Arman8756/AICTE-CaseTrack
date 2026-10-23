import { getStatusColor, getPriorityColor, getBureauColor, formatStatus } from "../utils";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${getStatusColor(status)}`}>
      {formatStatus(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`badge ${getPriorityColor(priority)}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

export function BureauBadge({ bureau }: { bureau: string }) {
  return (
    <span className={`badge ${getBureauColor(bureau)}`}>{bureau}</span>
  );
}
