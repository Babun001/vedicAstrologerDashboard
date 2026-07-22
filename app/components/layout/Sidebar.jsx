"use client";
import { Sparkles, Inbox, ClipboardList, X } from "lucide-react";
import { StarField } from "../common/StarField";
import { LotusWatermark } from "../common/LotusWatermark";
import { OrbitRing } from "../common/OrbitRing";

const nav = [
  { id: "work", label: "My Work", icon: Sparkles },
  { id: "inbox", label: "Unified Inbox", icon: Inbox, badge: 4 },
  { id: "tasks", label: "Report Tasks", icon: ClipboardList },
  { id: "create-report", label: "Create Report", icon: ClipboardList },
  // { id: "tasks", label: "Report Tasks", icon: ClipboardList },

];

export const Sidebar = ({
  view,
  setView,
  mobileNavOpen,
  onCloseMobile,
  onSignOut,
}) => (
  <aside className={`cr-sidebar ${mobileNavOpen ? "open" : ""}`}>
    <StarField />
    <LotusWatermark className="cr-sidebar-mandala" size={340} opacity={0.1} />
    <div className="cr-brand">
      <img src="/image.webp" alt="Cosmic Remedies" className="cr-brand-mark" />
      <div>
        <div className="cr-brand-name cr-shimmer-text">Cosmic Remedies</div>
        <div className="cr-brand-sub">Astrologer Desk</div>
      </div>
      <div className="cr-mobile-close" onClick={onCloseMobile}>
        <X size={18} />
      </div>
    </div>

    <nav className="cr-navlist">
      {nav.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className={`cr-navitem ${view === item.id ? "active" : ""}`}
            onClick={() => {
              setView(item.id);
              onCloseMobile();
            }}
          >
            <Icon className="cr-navicon" />
            {item.label}
            {item.badge ? <span className="cr-navbadge">{item.badge}</span> : null}
          </div>
        );
      })}
    </nav>

    <div className="cr-sidebar-foot">
      <div className="cr-cap-card">
        <OrbitRing value={6} max={10} size={40} stroke={4} />
        <div>
          <div className="cr-cap-label">Daily cap</div>
          <div className="cr-cap-value">6 / 10</div>
        </div>
      </div>
      <div className="cr-logout" onClick={onSignOut}>
        Sign out
      </div>
    </div>
  </aside>
);
