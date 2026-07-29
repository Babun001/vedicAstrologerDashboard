"use client";

import { useState } from "react";
import LoginView from "../login/LoginView";
import RegisterView from "../login/RegisterView";
import { Sidebar } from "../layout/Sidebar";
import { TopBar } from "../layout/TopBar";
import { LotusWatermark } from "../common/LotusWatermark";
import { MyWorkView } from "../work/MyWorkView";
import CreateReport from "../work/CreateReport";
import { InboxView } from "../inbox/InboxView";
import { TasksView } from "../tasks/TasksView";
import axiosInstanceClient from "../services/client.services";
import { useEffect } from "react";
import { DashboardSkeleton } from "../common/Skeleton";
import ProfileView from "../profile/ProfileView";
import { NotificationProvider } from "../context/NotificationContext";

export default function Dashboard() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState("work");
  const [activeConvo, setActiveConvo] = useState("c2");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [astrologer, setAstrologer] = useState(null);
  const [authView, setAuthView] = useState("login");
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!authed) return;
    setProfileLoading(true);
    axiosInstanceClient
      .get("/astrologer/profile")
      .then((res) => setAstrologer(res.data.data.astrologer))
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setProfileLoading(false));
  }, [authed]);

  const handleLogout = async () => {
    try {
      await axiosInstanceClient.post("/astrologer/logout");

      console.log("Astrologer logged out successfully");
    } catch (error) {
      console.error("Astrologer logout failed:", error);
    } finally {
      // Logout from frontend even if API fails
      localStorage.removeItem("astrologerToken");
      setAuthed(false);
    }
  };

  return (
    <div className="cr-root">
      <div className="cr-grain" aria-hidden="true" />

      {!authed ? (
        authView === "login" ? (
          <LoginView
            onLogin={() => setAuthed(true)}
            onSwitchToRegister={() => setAuthView("register")}
          />
        ) : (
          <RegisterView onSwitchToLogin={() => setAuthView("login")} />
        )
      ) : (
        <NotificationProvider>
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
              onSignOut={handleLogout}
              astrologer={astrologer}
            />

            <main className="cr-main">
              <LotusWatermark
                className="cr-content-mandala"
                size={520}
                opacity={0.08}
              />

              <LotusWatermark
                className="cr-content-mandala-2"
                size={280}
                opacity={0.07}
              />

              {profileLoading ? (
                <DashboardSkeleton />
              ) : (
                <>
                  <TopBar
                    view={view}
                    astrologer={astrologer}
                    onMenuClick={() => setMobileNavOpen(true)}
                    onProfileClick={() => setView("profile")}
                  />

                  <div className="cr-content">
                    {view === "work" && (
                      <MyWorkView onViewTasks={() => setView("tasks")} />
                    )}

                    {view === "inbox" && (
                      <InboxView
                        activeConvo={activeConvo}
                        setActiveConvo={setActiveConvo}
                      />
                    )}

                    {view === "tasks" && (
                      <TasksView
                        onGenerateReport={(report) => {
                          setSelectedReportId(report);
                          setView("create-report");
                        }}
                      />
                    )}

                    {view === "create-report" && (
                      <CreateReport report={selectedReportId} />
                    )}

                    {view === "profile" && (
                      <ProfileView
                        astrologer={astrologer}
                        onUpdate={setAstrologer}
                      />
                    )}
                  </div>
                </>
              )}
            </main>
          </div>
        </NotificationProvider>
      )}
    </div>
  );
}
