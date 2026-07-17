import { ChevronRight } from "lucide-react";
import { tasks } from "../data/demoData";
import { StatusPill } from "../common/StatusPill";
import { Eyebrow } from "../common/Eyebrow";

const Stat = ({ label, value, sub, tone }) => (
  <div className="cr-card cr-stat">
    <div className="cr-stat-label">{label}</div>
    <div
      className="cr-stat-value"
      style={tone === "success" ? { color: "var(--success)" } : {}}
    >
      {value}
    </div>
    <div className="cr-stat-sub">{sub}</div>
  </div>
);

export const MyWorkView = () => {
  return (
    <>
      <Eyebrow>Today</Eyebrow>
      <div className="cr-stat-grid">
        <Stat label="Assigned today" value="6" sub="4 reports · 2 threads" />
        <Stat label="Replied" value="18" sub="avg. response 6m" />
        <Stat label="Reports delivered" value="3" sub="this week: 21" />
        <Stat
          label="Overdue"
          value="0"
          sub="nothing escalated"
          tone="success"
        />
      </div>
      <div className="cr-card" style={{ marginBottom: 18 }}>
        <div style={{ padding: "14px 16px 4px" }}>
          <div className="cr-section-title">
            Assigned to you{" "}
            <span className="cr-section-count">{tasks.length}</span>
          </div>
        </div>
        <div>
          {tasks.map((t, i) => (
            <div className="cr-task-row" key={i}>
              <StatusPill status={t.status} />
              <div style={{ flex: 1 }}>
                <div className="cr-task-name">{t.name}</div>
                <div className="cr-task-meta">{t.meta}</div>
              </div>
              <ChevronRight size={15} color="var(--text-faint)" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
