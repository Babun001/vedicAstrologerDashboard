"use client";

import "./Skeleton.css";

export function SkelBlock({ className = "", style = {} }) {
  return <div className={`cr-skel ${className}`} style={style} />;
}

export function SkelLine({ width = "100%", style = {} }) {
  return <SkelBlock className="cr-skel-line" style={{ width, ...style }} />;
}

export function SkelAvatar({ size = 40, style = {} }) {
  return (
    <SkelBlock
      className="cr-skel-avatar"
      style={{ width: size, height: size, ...style }}
    />
  );
}

export function SkelCard({ style = {} }) {
  return <SkelBlock className="cr-skel-card" style={style} />;
}

/**
 * Skeleton for the dashboard's top bar (avatar + name/role placeholders).
 * Mirrors TopBar's usual shape: astrologer name + status on the right.
 */
export function TopBarSkeleton() {
  return (
    <div className="cr-topbar-skel">
      <SkelLine width="140px" style={{ height: 18 }} />
      <div className="cr-topbar-skel-right">
        <SkelLine width="90px" style={{ height: 14 }} />
        <SkelAvatar size={36} />
      </div>
    </div>
  );
}

/**
 * Generic content skeleton — a few stat cards + list rows.
 * Use while any dashboard view (work / inbox / tasks) is loading its data.
 */
export function DashboardContentSkeleton({ cards = 3, rows = 5 }) {
  return (
    <div className="cr-dash-skel">
      <div className="cr-dash-skel-cards">
        {Array.from({ length: cards }).map((_, i) => (
          <SkelCard key={i} />
        ))}
      </div>
      <div className="cr-dash-skel-list">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="cr-dash-skel-row">
            <SkelAvatar size={34} />
            <div style={{ flex: 1 }}>
              <SkelLine width="55%" style={{ height: 12, marginBottom: 6 }} />
              <SkelLine width="35%" style={{ height: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full dashboard-shell skeleton (top bar + content), used while the
 * astrologer profile / initial dashboard data is loading — sidebar stays
 * mounted and interactive.
 */
export function DashboardSkeleton() {
  return (
    <>
      <TopBarSkeleton />
      <div className="cr-content">
        <DashboardContentSkeleton />
      </div>
    </>
  );
}

/**
 * Skeleton matching InboxView's layout — convo list on the left,
 * thread header + message bubbles on the right. Reuses real
 * .cr-inbox-layout / .cr-convo-list / .cr-thread classes.
 */
export function InboxSkeleton({ convoCount = 5, bubbleCount = 4 }) {
  return (
    <div className="cr-inbox-layout">
      <div className="cr-convo-list">
        {Array.from({ length: convoCount }).map((_, i) => (
          <div className="cr-convo-item" key={i}>
            <SkelAvatar size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <SkelLine width="70%" style={{ height: 12, marginBottom: 6 }} />
              <SkelLine width="90%" style={{ height: 10 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="cr-thread">
        <div className="cr-thread-head">
          <div style={{ flex: 1 }}>
            <SkelLine width="120px" style={{ height: 13, marginBottom: 6 }} />
            <SkelLine width="200px" style={{ height: 10 }} />
          </div>
          <SkelBlock style={{ width: 58, height: 20, borderRadius: 20 }} />
        </div>

        <div className="cr-thread-body">
          {Array.from({ length: bubbleCount }).map((_, i) => (
            <SkelLine
              key={i}
              width={i % 2 === 0 ? "55%" : "40%"}
              style={{
                height: 34,
                borderRadius: 12,
                marginBottom: 12,
                marginLeft: i % 2 === 0 ? 0 : "auto",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton matching MyWorkView's exact layout — reuses the real
 * .cr-stat-grid / .cr-card / .cr-task-row classes so spacing/borders
 * are identical to the loaded state, just with placeholder content.
 */
export function MyWorkSkeleton({ statCount = 4, rows = 4 }) {
  return (
    <>
      <div className="cr-stat-grid">
        {Array.from({ length: statCount }).map((_, i) => (
          <div key={i} className="cr-card cr-stat">
            <SkelLine width="60%" style={{ height: 11, marginBottom: 10 }} />
            <SkelLine width="40%" style={{ height: 22, marginBottom: 8 }} />
            <SkelLine width="70%" style={{ height: 10 }} />
          </div>
        ))}
      </div>

      <div className="cr-card" style={{ marginBottom: 18 }}>
        <div style={{ padding: "14px 16px 4px" }}>
          <SkelLine width="140px" style={{ height: 14 }} />
        </div>
        <div>
          {Array.from({ length: rows }).map((_, i) => (
            <div className="cr-task-row" key={i}>
              <SkelBlock style={{ width: 58, height: 20, borderRadius: 20 }} />
              <div style={{ flex: 1, marginLeft: 12 }}>
                <SkelLine width="50%" style={{ height: 12, marginBottom: 6 }} />
                <SkelLine width="30%" style={{ height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Skeleton matching TasksView's Kanban layout — reuses the real
 * .cr-kanban / .cr-kcol / .cr-kcard classes so column widths and
 * card spacing are identical to the loaded board.
 */
export function KanbanSkeleton({ columnCount = 4, cardsPerCol = 3 }) {
  return (
    <div className="cr-kanban">
      {Array.from({ length: columnCount }).map((_, ci) => (
        <div key={ci} className="cr-kcol">
          <div className="cr-kcol-head">
            <SkelLine width="90px" style={{ height: 13 }} />
            <SkelBlock style={{ width: 22, height: 16, borderRadius: 8 }} />
          </div>
          <div className="cr-kcol-bar" />
          <div className="cr-kcol-body">
            {Array.from({ length: cardsPerCol }).map((_, ri) => (
              <div className="cr-kcard" key={ri} style={{ cursor: "default" }}>
                <SkelLine width="65%" style={{ height: 12, marginBottom: 8 }} />
                <SkelLine
                  width="45%"
                  style={{ height: 10, marginBottom: 10 }}
                />
                <SkelLine width="80px" style={{ height: 9 }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
