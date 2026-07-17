"use client";
import { useState } from "react";
import LoginView from "../login/LoginView";
import { Sidebar } from "../layout/Sidebar";
import { TopBar } from "../layout/TopBar";
import { LotusWatermark } from "../common/LotusWatermark";
import { MyWorkView } from "../work/MyWorkView";
import { InboxView } from "../inbox/InboxView";
import { TasksView } from "../tasks/TasksView";

export default function Dashboard() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState("work");
  const [activeConvo, setActiveConvo] = useState("c2");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="cr-root">
      <div className="cr-grain" aria-hidden="true" />
      {!authed ? (
        <LoginView onLogin={() => setAuthed(true)} />
      ) : (
        <div className="cr-shell">
          {mobileNavOpen && (
            <div
              className="cr-mobile-backdrop"
              onClick={() => setMobileNavOpen(false)}
            />
          )}
          <Sidebar
            view={view}
            setView={setView}
            mobileNavOpen={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
            onSignOut={() => setAuthed(false)}
          />

          <main className="cr-main">
            <LotusWatermark className="cr-content-mandala" size={520} opacity={0.08} />
            <LotusWatermark className="cr-content-mandala-2" size={280} opacity={0.07} />
            <TopBar view={view} onMenuClick={() => setMobileNavOpen(true)} />
            <div className="cr-content">
              {view === "work" && <MyWorkView />}
              {view === "inbox" && (
                <InboxView activeConvo={activeConvo} setActiveConvo={setActiveConvo} />
              )}
              {view === "tasks" && <TasksView />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
