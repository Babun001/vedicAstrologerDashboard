"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { StatusPill } from "../common/StatusPill";
import { InboxSkeleton } from "../common/Skeleton";
import axiosInstanceClient from "../services/client.services";
import { getSocket } from "../services/socket.services";

const channelFromPlatform = (platform) => {
  if (!platform) return "fb";
  const p = platform.toLowerCase();
  if (p.includes("insta")) return "ig";
  return "fb";
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

export const InboxView = ({ activeConvo, setActiveConvo }) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const seenMessageIds = useRef(new Set());
  const activeConvoRef = useRef(activeConvo);
  activeConvoRef.current = activeConvo;

  // Initial conversation list load
  useEffect(() => {
    let cancelled = false;

    axiosInstanceClient
      .get("/messages/conversations")
      .then((res) => {
        if (cancelled) return;
        const list = res.data.data || [];
        setConversations(list);

        // If the currently active id isn't in the real list (e.g. still
        // the "c2" placeholder from Dashboard's default state), fall
        // back to the first real conversation.
        if (list.length > 0 && !list.some((c) => c._id === activeConvoRef.current)) {
          setActiveConvo(list[0]._id);
        }
      })
      .catch((err) => {
        console.error("Failed to load conversations:", err);
        if (!cancelled) setError("Couldn't load conversations");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setActiveConvo]);

  // Load messages whenever the selected conversation changes
  useEffect(() => {
    if (!activeConvo) return;
    let cancelled = false;
    setMessagesLoading(true);

    axiosInstanceClient
      .get(`/messages/conversations/${activeConvo}`)
      .then((res) => {
        if (cancelled) return;
        const msgs = res.data.data || [];
        seenMessageIds.current = new Set(msgs.map((m) => m._id));
        setMessages(msgs);

        // Reflect the server-side unread reset locally
        setConversations((prev) =>
          prev.map((c) => (c._id === activeConvo ? { ...c, unreadCount: 0 } : c))
        );
      })
      .catch((err) => {
        console.error("Failed to load messages:", err);
        if (!cancelled) setError("Couldn't load this conversation");
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeConvo]);

  // Real-time updates
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = ({ conversationId, message }) => {
      if (!conversationId || !message) return;

      // Update the conversation list (preview, unread count, ordering)
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conversationId);
        let next;

        if (exists) {
          next = prev.map((c) =>
            c._id === conversationId
              ? {
                  ...c,
                  lastMessage: {
                    text: message.content?.text,
                    at: message.createdAt || new Date().toISOString(),
                  },
                  unreadCount:
                    conversationId === activeConvoRef.current
                      ? 0
                      : (c.unreadCount || 0) + (message.direction === "incoming" ? 1 : 0),
                }
              : c
          );
        } else {
          // Message from a brand-new conversation we don't have yet —
          // simplest correct fix is to refetch the list.
          axiosInstanceClient
            .get("/messages/conversations")
            .then((res) => setConversations(res.data.data || []))
            .catch((err) => console.error("Failed to refresh conversations:", err));
          next = prev;
        }

        return [...next].sort(
          (a, b) => new Date(b.lastMessage?.at || 0) - new Date(a.lastMessage?.at || 0)
        );
      });

      // Append to the open thread if it's the active conversation
      if (conversationId === activeConvoRef.current) {
        if (seenMessageIds.current.has(message._id)) return;
        seenMessageIds.current.add(message._id);
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, []);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || !activeConvo || sending) return;

    setSending(true);
    setDraft("");

    try {
      const res = await axiosInstanceClient.post("/messages/reply", {
        conversationId: activeConvo,
        message: text,
      });

      const saved = res.data.data;
      if (saved?._id && !seenMessageIds.current.has(saved._id)) {
        seenMessageIds.current.add(saved._id);
        setMessages((prev) => [...prev, saved]);
      }

      setConversations((prev) =>
        [...prev]
          .map((c) =>
            c._id === activeConvo
              ? { ...c, lastMessage: { text, at: new Date().toISOString() } }
              : c
          )
          .sort((a, b) => new Date(b.lastMessage?.at || 0) - new Date(a.lastMessage?.at || 0))
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Message failed to send");
      setDraft(text); // give the text back so they don't lose it
    } finally {
      setSending(false);
    }
  }, [draft, activeConvo, sending]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return <InboxSkeleton />;
  }

  const convo = conversations.find((c) => c._id === activeConvo);
  const contact = convo?.contactId;
  const contactName = contact?.name || contact?.platformUserId || "Unknown contact";
  const status = (convo?.unreadCount || 0) > 0 ? "new" : "replied";

  return (
    <div className="cr-inbox-layout">
      <div className="cr-convo-list">
        {conversations.map((c) => {
          const cName = c.contactId?.name || c.contactId?.platformUserId || "Unknown";
          return (
            <div
              key={c._id}
              className={`cr-convo-item ${c._id === activeConvo ? "active" : ""}`}
              onClick={() => setActiveConvo(c._id)}
            >
              <div className={`cr-channel-icon ${channelFromPlatform(c.platform)}`}>
                {channelFromPlatform(c.platform) === "ig" ? "IG" : "FB"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div className="cr-convo-name">{cName}</div>
                  <div className="cr-convo-time">{formatRelativeTime(c.lastMessage?.at)}</div>
                </div>
                <div className="cr-convo-preview">{c.lastMessage?.text || "No messages yet"}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cr-thread">
        {!convo ? (
          <div style={{ padding: 24, color: "var(--text-faint)" }}>
            {error || "Select a conversation"}
          </div>
        ) : (
          <>
            <div className="cr-thread-head">
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{contactName}</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
                  {channelFromPlatform(convo.platform) === "ig"
                    ? "Instagram DM"
                    : "Facebook Page message"}{" "}
                  · reply appears as the company handle
                </div>
              </div>
              <StatusPill status={status} />
            </div>

            <div className="cr-thread-body">
              {messagesLoading ? (
                <div style={{ padding: 16, color: "var(--text-faint)" }}>Loading…</div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m._id}
                    className={`cr-msg ${m.direction === "outgoing" ? "out" : "in"}`}
                  >
                    {m.content?.text}
                    <div className="cr-msg-time">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cr-composer">
              <input
                placeholder="Reply as Cosmic Remedies…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
              />
              <button className="cr-send-btn" onClick={handleSend} disabled={sending || !draft.trim()}>
                <Send size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};