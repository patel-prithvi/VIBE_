import { useState, useEffect, useCallback } from "react";
import api from "../services/api.js";
import { useSmartPolling } from "./useSmartPolling.js";

/**
 * Shared inbox state: recent notifications + unread count.
 * Uses smart polling (visibility-aware, focus-refetch, error backoff).
 */
export const useNotifications = (pollMs = 30000) => {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/notifications", { params: { limit: 20 } });
      const data = res.data?.data || {};
      setItems(Array.isArray(data.items) ? data.items : []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Not authenticated or backend unreachable — stay silent, keep old state
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Smart polling (pauses when tab is hidden, refreshes immediately on focus)
  useSmartPolling(refresh, {
    intervalMs: pollMs,
    enabled: Boolean(pollMs),
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pauseWhenHidden: true,
  });

  const markRead = useCallback(
    async (id) => {
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await api.patch(`/notifications/${id}/read`);
      } catch {
        refresh(); // revert on failure
      }
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.patch("/notifications/read-all");
    } catch {
      refresh();
    }
  }, [refresh]);

  return { items, unreadCount, loading, refresh, markRead, markAllRead };
};
