"use client";
import { Menu, Search } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { IncomeBadge } from "./IncomeBadge";

/* ---------------- Top bar ---------------- */
const titles = {
  work: ["My Work", "Today's report tasks and open conversations"],
  inbox: ["Unified Inbox", "Instagram and Facebook messages, one thread"],
  tasks: ["Report Tasks", "Birth-chart PDF pipeline — drag a card to move it"],
  "create-report": ["Create Report", "Generate a new astrology report"],
  questions: ["Questions", "Client questions assigned to you — reply when ready"],
  "answer-question": ["Reply to Question", "Write and send your answer to the client"],
  history: ["History", "Every report and question you've completed, with time and earnings"],
  profile: ["My Profile", "Manage your astrologer account"],
};

const getName = (name) => {
  if (!name) return "";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase();
  return initials;
}
export const TopBar = ({ view, astrologer, onMenuClick, onProfileClick }) => {
  const [title, subtitle] = titles[view] || titles.work;

  return (
    <div className="cr-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="cr-hamburger" onClick={onMenuClick}>
          <Menu size={18} />
        </div>
        <div>
          <div className="cr-title">{title}</div>
          <div className="cr-subtitle">{subtitle}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div className="cr-search">
          <Search size={14} />
          Search clients, threads, tasks
        </div>
        <IncomeBadge />
        <NotificationBell />
        <div
          className="cr-avatar"
          onClick={onProfileClick}
          style={{ cursor: "pointer" }}
          title="View profile"
        >
          {getName(astrologer?.name)}
        </div>
      </div>
    </div>
  );
};