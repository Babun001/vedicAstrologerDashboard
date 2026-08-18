"use client";
import {
  Sparkles,
  Inbox,
  ClipboardList,
  X,
  Award,
  FilePlus,
  HelpCircle,
} from "lucide-react";
// import { StarField } from "../common/StarField";
import { LotusWatermark } from "../common/LotusWatermark";
import { useInbox } from "../context/InboxContext";

const navBase = [
  { id: "work", label: "My Work", icon: Sparkles },
  { id: "inbox", label: "Unified Inbox", icon: Inbox },
  { id: "tasks", label: "Report Tasks", icon: ClipboardList },
  { id: "create-report", label: "Create Report", icon: FilePlus },
  { id: "questions", label: "Questions", icon: HelpCircle },
];

export const Sidebar = ({
  view,
  setView,
  mobileNavOpen,
  onCloseMobile,
  onSignOut,
  astrologer,
}) => {
  // Was a hardcoded `badge: 4` in the nav config — never moved no
  // matter how many messages actually came in or were read. Now pulls
  // the live total from InboxContext (shared with InboxView), and
  // zeroes out while the Inbox tab is the active view — same as
  // WhatsApp's chat-list badge clearing once you're looking at it.
  const { totalUnread } = useInbox();

  const nav = navBase.map((item) =>
    item.id === "inbox"
      ? { ...item, badge: view === "inbox" ? 0 : totalUnread }
      : item,
  );

  return (
    <aside className={`cr-sidebar ${mobileNavOpen ? "open" : ""}`}>
      {/* <StarField /> */}
      <LotusWatermark className="cr-sidebar-mandala" size={340} opacity={0.1} />
      <div className="cr-brand">
        <img
          src="/final_logo_170826.png"
          alt="Cosmic Remedies"
          className="cr-brand-mark"
        />
        <div>
          {/* <div className="cr-brand-name cr-shimmer-text">Cosmic Remedies</div>
          <div className="cr-brand-sub">Astrologer Desk</div> */}
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
              {item.badge ? (
                <span className="cr-navbadge">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              ) : null}
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
            <div className="cr-cap-value">
              {astrologer?.totalReportsDelivered ?? 0}
            </div>
          </div>
        </div>
        <div className="cr-logout" onClick={onSignOut}>
          Sign out
        </div>
      </div>
    </aside>
  );
};
