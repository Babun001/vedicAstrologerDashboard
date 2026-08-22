"use client";

import { useState, useEffect } from "react";
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
import { DashboardSkeleton } from "../common/Skeleton";
import ProfileView from "../profile/ProfileView";
import { NotificationProvider } from "../context/NotificationContext";
import { InboxProvider } from "../context/InboxContext";
import { QuestionsView } from "../questions/QuestionsView";
import AnswerQuestion from "../questions/AnswerQuestion";
import { HistoryView } from "../history/HistoryView";

export default function Dashboard() {
  const [authed, setAuthed] = useState(false);
  // Whether we're still deciding if a stored token is still valid — kept
  // separate from `authed` so the very first render (before we've even
  // looked at localStorage) doesn't flash the login form for someone who's
  // actually still signed in.
  const [authChecking, setAuthChecking] = useState(true);
  const [view, setView] = useState("work");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  // One-shot "open this specific card's modal" ids for the boards
  // reached from MyWorkView. Cleared immediately once TasksView/
  // QuestionsView consumes them so navigating back to that tab later
  // (e.g. via the sidebar) doesn't reopen a stale modal.
  const [initialTaskId, setInitialTaskId] = useState(null);
  const [initialQuestionId, setInitialQuestionId] = useState(null);
  const [astrologer, setAstrologer] = useState(null);
  const [authView, setAuthView] = useState("login");
  const [profileLoading, setProfileLoading] = useState(false);

  // Session bootstrap. A page reload wipes all component state, but the
  // access token in localStorage is still valid — so on mount we check for
  // it and, if present, ask the backend to confirm it before dropping the
  // user back into the dashboard. This is also where an expired/revoked
  // token gets cleaned up instead of silently failing later.
  useEffect(() => {
    const token = localStorage.getItem("astrologerToken");

    if (!token) {
      setAuthChecking(false);
      return;
    }

    axiosInstanceClient
      .get("/astrologer/profile")
      .then((res) => {
        setAstrologer(res.data.data.astrologer);
        setAuthed(true);
      })
      .catch((err) => {
        console.error("Stored session is no longer valid:", err);
        localStorage.removeItem("astrologerToken");
        setAuthed(false);
      })
      .finally(() => setAuthChecking(false));
  }, []);

  // Re-fetch the profile whenever a fresh login happens (session bootstrap
  // above already covers the reload case, so this only fires after
  // LoginView's onLogin()).
  useEffect(() => {
    if (!authed || astrologer) return;
    setProfileLoading(true);
    axiosInstanceClient
      .get("/astrologer/profile")
      .then((res) => setAstrologer(res.data.data.astrologer))
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setProfileLoading(false));
  }, [authed, astrologer]);

  const handleLogout = async () => {
    try {
      await axiosInstanceClient.post("/astrologer/logout");

      console.log("Astrologer logged out successfully");
    } catch (error) {
      console.error("Astrologer logout failed:", error);
    } finally {
      // Logout from frontend even if API fails
      localStorage.removeItem("astrologerToken");
      setAstrologer(null);
      setAuthed(false);
    }
  };

  if (authChecking) {
    return (
      <div className="cr-root">
        <div className="cr-grain" aria-hidden="true" />
        <DashboardSkeleton />
      </div>
    );
  }

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
          <InboxProvider>
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
                      <MyWorkView
                        onViewTasks={() => setView("tasks")}
                        onSelectReport={(report) => {
                          setInitialTaskId(report.reportId || report.id);
                          setView("tasks");
                        }}
                        onSelectQuestion={(question) => {
                          setSelectedQuestion(question);
                          setView("answer-question");
                        }}
                      />
                    )}

                    {view === "inbox" && <InboxView />}

                    {view === "tasks" && (
                      <TasksView
                        initialSelectedId={initialTaskId}
                        onInitialSelectedConsumed={() => setInitialTaskId(null)}
                        onGenerateReport={(report) => {
                          setSelectedReportId(report);
                          setView("create-report");
                        }}
                      />
                    )}

                    {view === "create-report" && (
                      <CreateReport report={selectedReportId} />
                    )}

                    {view === "questions" && (
                      <QuestionsView
                        initialSelectedId={initialQuestionId}
                        onInitialSelectedConsumed={() => setInitialQuestionId(null)}
                        onAnswerQuestion={(question) => {
                          setSelectedQuestion(question);
                          setView("answer-question");
                        }}
                      />
                    )}

                    {view === "answer-question" && (
                      <AnswerQuestion
                        question={selectedQuestion}
                        onBack={() => setView("questions")}
                      />
                    )}

                    {view === "history" && <HistoryView />}

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
          </InboxProvider>
        </NotificationProvider>
      )}
    </div>
  );
}