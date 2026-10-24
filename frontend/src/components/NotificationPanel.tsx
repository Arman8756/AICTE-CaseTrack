import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, X, AlertTriangle, Clock, TrendingUp,
  ArrowRightLeft, FilePlus, CheckCircle, CheckCheck,
} from "lucide-react";
import type { AppNotification, NotificationType } from "../api/notifications";
import { markAsRead, markAllAsRead } from "../api/notifications";

// ── Icon + colour per notification type ───────────────────────────────────────
function typeConfig(type: NotificationType) {
  switch (type) {
    case "overlap":
      return { icon: AlertTriangle, bg: "bg-amber-100", text: "text-amber-600", label: "Overlap" };
    case "overdue":
      return { icon: Clock, bg: "bg-red-100", text: "text-red-600", label: "Overdue" };
    case "escalation":
      return { icon: TrendingUp, bg: "bg-purple-100", text: "text-purple-600", label: "Escalation" };
    case "transfer":
      return { icon: ArrowRightLeft, bg: "bg-blue-100", text: "text-blue-600", label: "Transfer" };
    case "new_case":
      return { icon: FilePlus, bg: "bg-green-100", text: "text-green-600", label: "New Case" };
    case "disposed":
      return { icon: CheckCircle, bg: "bg-teal-100", text: "text-teal-600", label: "Disposed" };
  }
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  notifications: AppNotification[];
  unreadCount: number;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void; // trigger re-render in parent after read/markAll
}

export function NotificationBell({
  unreadCount,
  onClick,
}: {
  unreadCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

export function NotificationPanel({ notifications, unreadCount, open, onClose, onUpdate }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open, onClose]);

  if (!open) return null;

  const handleRead = (notif: AppNotification) => {
    markAsRead(notif.id);
    onUpdate();
    if (notif.complaint_id) {
      onClose();
      navigate(`/complaints/${notif.complaint_id}`);
    }
  };

  const handleMarkAll = () => {
    markAllAsRead();
    onUpdate();
  };

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" aria-hidden="true" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-4 top-14 z-50 w-[22rem] sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col max-h-[80vh]"
        role="dialog"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-700" />
            <span className="font-semibold text-gray-900 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400">
              <Bell className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <>
              {/* Unread section */}
              {unread.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Unread
                    </span>
                  </div>
                  {unread.map((n) => (
                    <NotificationItem key={n.id} notif={n} onClick={handleRead} />
                  ))}
                </div>
              )}

              {/* Read section */}
              {read.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Earlier
                    </span>
                  </div>
                  {read.map((n) => (
                    <NotificationItem key={n.id} notif={n} onClick={handleRead} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <p className="text-xs text-center text-gray-400">
              Showing last {notifications.length} notifications
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function NotificationItem({
  notif,
  onClick,
}: {
  notif: AppNotification;
  onClick: (n: AppNotification) => void;
}) {
  const cfg = typeConfig(notif.type);
  const Icon = cfg.icon;

  return (
    <button
      onClick={() => onClick(notif)}
      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
        !notif.read ? "bg-blue-50/40" : ""
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${cfg.text}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-gray-800">{notif.title}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
              {cfg.label}
            </span>
          </div>
          {!notif.read && (
            <span className="flex-shrink-0 w-2 h-2 mt-1 rounded-full bg-blue-500" aria-label="Unread" />
          )}
        </div>

        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed line-clamp-2">
          {notif.message}
        </p>

        <div className="flex items-center gap-2 mt-1.5">
          {notif.case_id && (
            <span className="text-[10px] font-mono text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
              {notif.case_id}
            </span>
          )}
          <span className="text-[10px] text-gray-400">{timeAgo(notif.timestamp)}</span>
        </div>
      </div>
    </button>
  );
}
