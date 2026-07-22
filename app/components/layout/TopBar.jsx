"use client";
import { Menu, Search } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

/* ---------------- Top bar ---------------- */
const titles = {
  work: ["My Work", "Today's report tasks and open conversations"],
  inbox: ["Unified Inbox", "Instagram and Facebook messages, one thread"],
  tasks: ["Report Tasks", "Birth-chart PDF pipeline — drag a card to move it"],
  "create-report": [
    "Create Report",
    "Generate a new astrology report"
  ],
};
export const TopBar = ({ view, onMenuClick }) => (
  <div className="cr-topbar">
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div className="cr-hamburger" onClick={onMenuClick}>
        <Menu size={18} />
      </div>
      <div>
        <div className="cr-title">{titles[view][0]}</div>
        <div className="cr-subtitle">{titles[view][1]}</div>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div className="cr-search">
        <Search size={14} />
        Search clients, threads, tasks
      </div>
      <NotificationBell />
      <div className="cr-avatar">RS</div>
    </div>
  </div>
);