"use client";
import { useEffect } from "react";
import {
  Sparkles,
  Inbox,
  ClipboardList,
  X,
  Award,
  FilePlus,
  HelpCircle,
  History,
} from "lucide-react";
// import { StarField } from "../common/StarField";
import { LotusWatermark } from "../common/LotusWatermark";
import { useInbox } from "../context/InboxContext";
import { useNotifications } from "../context/NotificationContext";

const navBase = [
  { id: "work", label: "My Work", icon: Sparkles },
  { id: "inbox", label: "Unified Inbox", icon: Inbox },
  { id: "tasks", label: "Report Tasks", icon: ClipboardList },
  { id: "create-report", label: "Create Report", icon: FilePlus },
  { id: "questions", label: "Questions", icon: HelpCircle },
  { id: "history", label: "History", icon: History },
];

export const Sidebar = ({
  view,
  setView,
  mobileNavOpen,
  onCloseMobile,
  onSignOut,
  astrologer,
}) => {
  const { totalUnread } = useInbox();

  const { reportsBadge, questionsBadge, resetReportsBadge, resetQuestionsBadge } =
    useNotifications();

  useEffect(() => {
    if (view === "tasks" || view === "create-report") resetReportsBadge();
  }, [view, resetReportsBadge]);

  useEffect(() => {
    if (view === "questions" || view === "answer-question") resetQuestionsBadge();
  }, [view, resetQuestionsBadge]);

  const nav = navBase.map((item) => {
    if (item.id === "inbox") {
      return { ...item, badge: view === "inbox" ? 0 : totalUnread };
    }
    if (item.id === "tasks") {
      return {
        ...item,
        badge: view === "tasks" || view === "create-report" ? 0 : reportsBadge,
      };
    }
    if (item.id === "questions") {
      return {
        ...item,
        badge: view === "questions" || view === "answer-question" ? 0 : questionsBadge,
      };
    }
    return item;
  });

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
