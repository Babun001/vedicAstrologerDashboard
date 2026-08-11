"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import axiosInstanceClient from "../services/client.services";
import { getSocket } from "../services/socket.services";

const InboxContext = createContext(null);

// Single source of truth for "which conversations exist and how many
// unread messages each has". Previously the Sidebar badge was a
// hardcoded `badge: 4` in Sidebar.jsx's nav config, completely
// disconnected from InboxView's own local unread tracking — so it
// never moved no matter how many messages came in or were read.
//
// This context now owns that state so the Sidebar badge and the Inbox
// view are always looking at the same numbers.
export function InboxProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeConvoRef = useRef(activeConvo);
  activeConvoRef.current = activeConvo;

  const fetchConversations = useCallback(() => {
    return axiosInstanceClient
      .get("/messages/conversations")
      .then((res) => {
        const list = res.data.data || [];
        setConversations(list);
        setError(null);
        return list;
      })
      .catch((err) => {
        console.error("Failed to load conversations:", err);
        setError("Couldn't load conversations");
        return [];
      });
  }, []);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchConversations().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchConversations]);

  // Real-time updates — same increment/reset rule InboxView used to
  // apply locally: if the message belongs to the conversation currently
  // open, it's already "read" (unreadCount stays 0); otherwise bump it,
  // but only for incoming messages (an astrologer's own outgoing reply
  // shouldn't count as unread for themselves).
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = ({ conversationId, message }) => {
      if (!conversationId || !message) return;

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
                      : (c.unreadCount || 0) +
                        (message.direction === "incoming" ? 1 : 0),
                }
              : c
          );
        } else {
          // Brand-new conversation we don't have yet — refetch the list
          // rather than trying to reconstruct it from a partial payload.
          fetchConversations();
          next = prev;
        }

        return [...next].sort(
          (a, b) => new Date(b.lastMessage?.at || 0) - new Date(a.lastMessage?.at || 0)
        );
      });
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [fetchConversations]);

  // Called after a conversation's messages are fetched — the backend
  // (GET /messages/conversations/:id) already resets unreadCount to 0
  // server-side, this just mirrors that locally so the badge updates
  // instantly instead of waiting for the next full refetch.
  const markConversationRead = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((c) =>
        c._id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, []);

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  return (
    <InboxContext.Provider
      value={{
        conversations,
        setConversations,
        activeConvo,
        setActiveConvo,
        loading,
        error,
        totalUnread,
        markConversationRead,
        refetchConversations: fetchConversations,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) {
    throw new Error("useInbox must be used inside <InboxProvider>. Wrap your root layout with it.");
  }
  return ctx;
}