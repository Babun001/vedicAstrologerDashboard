"use client";
import { useState } from "react";
import {
  Bell,
  Clock,
  UserPlus,
  RotateCcw,
  CheckCircle2,
  PartyPopper,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

const ICONS = {
  assignment: UserPlus,
  revision: RotateCcw,
  delivered: CheckCircle2,
  milestone: PartyPopper,
};

const timeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <div className="cr-notif-wrap">
      <button
        className="cr-notif-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="cr-notif-dot">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="cr-notif-backdrop" onClick={() => setOpen(false)} />
          <div className="cr-notif-panel">
            <div className="cr-notif-head">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button className="cr-notif-mark-all" onClick={markAllAsRead}>
                  Mark all read
                </button>
              )}
            </div>

            <div className="cr-notif-list">
              {notifications.length === 0 && (
                <div className="cr-notif-empty">You're all caught up.</div>
              )}

              {notifications.map((n) => {
                const Icon = ICONS[n.type] || Bell;
                return (
                  <div
                    className={`cr-notif-item ${n.read ? "cr-notif-item--read" : "cr-notif-item--unread"}`}
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                  >
                    {!n.read && <span className="cr-notif-item-dot" />}
                    <Icon size={14} className="cr-notif-item-icon" />
                    <div>
                      <div className="cr-notif-title">{n.title}</div>
                      <div className="cr-notif-body">{n.body}</div>
                      <div className="cr-notif-time">
                        <Clock size={10} /> {timeAgo(n.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
