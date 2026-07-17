import { useState } from "react";
import { Bell, Clock } from "lucide-react";
import { notifications } from "../data/demoData";

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => n.unread).length;
  return (
    <div className="cr-notif-wrap">
      <button
        className="cr-notif-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && <span className="cr-notif-dot">{unread}</span>}
      </button>
      {open && (
        <>
          <div className="cr-notif-backdrop" onClick={() => setOpen(false)} />
          <div className="cr-notif-panel">
            <div className="cr-notif-head">Notifications</div>
            {notifications.map((n, i) => (
              <div className="cr-notif-item" key={i}>
                {n.unread && <span className="cr-notif-item-dot" />}
                <div>
                  <div className="cr-notif-title">{n.title}</div>
                  <div className="cr-notif-body">{n.body}</div>
                  <div className="cr-notif-time">
                    <Clock size={10} /> {n.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
