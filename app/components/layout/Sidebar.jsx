"use client";
import { Sparkles, Inbox, ClipboardList, X, Award,FilePlus } from "lucide-react";
import { StarField } from "../common/StarField";
import { LotusWatermark } from "../common/LotusWatermark";

const nav = [
  { id: "work", label: "My Work", icon: Sparkles },
  { id: "inbox", label: "Unified Inbox", icon: Inbox, badge: 4 },
  { id: "tasks", label: "Report Tasks", icon: ClipboardList },
  { id: "create-report", label: "Create Report", icon: FilePlus },
];

export const Sidebar = ({
  view,
  setView,
  mobileNavOpen,
  onCloseMobile,
  onSignOut,
  astrologer,
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
        <div className="cr-cap-icon">
          <Award size={18} />
        </div>
        <div>
          <div className="cr-cap-label">Reports delivered</div>
          <div className="cr-cap-value">{astrologer?.totalReportsDelivered ?? 0}</div>
        </div>
      </div>
      <div className="cr-logout" onClick={onSignOut}>
        Sign out
      </div>
    </div>
  </aside>
);