"use client";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { StatusPill } from "../common/StatusPill";
import { threadMessages, conversations } from "../data/demoData";
import { InboxSkeleton } from "../common/Skeleton";

export const InboxView = ({ activeConvo, setActiveConvo }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: replace this simulated delay with the real fetch once the
    // inbox API exists, e.g.:
    //
    // axiosInstanceClient.get("/astrologer/inbox")
    //   .then((res) => setConversations(res.data.data))
    //   .catch((err) => console.error("Failed to load inbox:", err))
    //   .finally(() => setLoading(false));
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const convo =
    conversations.find((c) => c.id === activeConvo) || conversations[0];
  const messages = threadMessages[activeConvo] || threadMessages.c2;

  if (loading) {
    return <InboxSkeleton />;
  }

  return (
    <div className="cr-inbox-layout">
      <div className="cr-convo-list">
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`cr-convo-item ${c.id === activeConvo ? "active" : ""}`}
            onClick={() => setActiveConvo(c.id)}
          >
            <div className={`cr-channel-icon ${c.channel}`}>
              {c.channel === "ig" ? "IG" : "FB"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className="cr-convo-name">{c.name}</div>
                <div className="cr-convo-time">{c.time}</div>
              </div>
              <div className="cr-convo-preview">{c.preview}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="cr-thread">
        <div className="cr-thread-head">
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{convo.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
              {convo.channel === "ig"
                ? "Instagram DM"
                : "Facebook Page message"}{" "}
              · reply appears as the company handle
            </div>
          </div>
          <StatusPill status={convo.status} />
        </div>
        <div className="cr-thread-body">
          {messages.map((m, i) => (
            <div key={i} className={`cr-msg ${m.from}`}>
              {m.text}
              <div className="cr-msg-time">
                {m.time}
                {m.sendStatus ? ` · ${m.sendStatus}` : ""}
              </div>
            </div>
          ))}
        </div>
        <div className="cr-composer">
          <input placeholder="Reply as Cosmic Remedies…" />
          <button className="cr-send-btn">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
