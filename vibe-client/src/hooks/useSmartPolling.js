import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for Smart Polling:
 * - Automatically pauses polling when document/tab is hidden (saves bandwidth and CPU)
 * - Refetches immediately when tab regains focus or visibility (with a minimum throttle)
 * - Refetches on network reconnection ('online' event)
 * - Applies exponential backoff on consecutive network errors
 * - Automatically cleans up all timers and event listeners on unmount
 *
 * @param {Function} callback - Async or sync function to execute on each poll tick
 * @param {Object} options
 * @param {number} [options.intervalMs=30000] - Interval between ticks in ms (0 or null to disable periodic timer)
 * @param {boolean} [options.enabled=true] - Enable or disable polling
 * @param {boolean} [options.refetchOnFocus=true] - Trigger refetch when tab becomes visible or focused
 * @param {boolean} [options.refetchOnReconnect=true] - Trigger refetch when browser goes back online
 * @param {boolean} [options.pauseWhenHidden=true] - Pause timer while document.hidden is true
 * @param {number} [options.minFocusIntervalMs=8000] - Throttle refetch on focus (must be at least this old)
 * @param {number} [options.maxBackoffMs=120000] - Maximum backoff delay on consecutive errors (2 mins)
 */
export const useSmartPolling = (
  callback,
  {
    intervalMs = 30000,
    enabled = true,
    refetchOnFocus = true,
    refetchOnReconnect = true,
    pauseWhenHidden = true,
    minFocusIntervalMs = 8000,
    maxBackoffMs = 120000,
  } = {}
) => {
  const savedCallback = useRef(callback);
  const lastFetchTimeRef = useRef(0);
  const errorCountRef = useRef(0);
  const timerRef = useRef(null);

  // Keep callback fresh without restarting timer on every render
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleNext = useCallback(() => {
    clearTimer();
    if (!enabled || !intervalMs || intervalMs <= 0) return;

    if (pauseWhenHidden && typeof document !== "undefined" && document.hidden) {
      return; // Paused while tab is hidden
    }

    const backoffMultiplier = Math.min(
      Math.pow(1.5, errorCountRef.current),
      maxBackoffMs / intervalMs
    );
    const delay = Math.min(intervalMs * backoffMultiplier, maxBackoffMs);

    timerRef.current = setTimeout(async () => {
      try {
        lastFetchTimeRef.current = Date.now();
        await savedCallback.current();
        errorCountRef.current = 0;
      } catch (err) {
        errorCountRef.current += 1;
      } finally {
        scheduleNext();
      }
    }, delay);
  }, [enabled, intervalMs, pauseWhenHidden, maxBackoffMs]);

  const trigger = useCallback(async () => {
    if (!enabled) return;
    clearTimer();
    try {
      lastFetchTimeRef.current = Date.now();
      await savedCallback.current();
      errorCountRef.current = 0;
    } catch (err) {
      errorCountRef.current += 1;
    } finally {
      scheduleNext();
    }
  }, [enabled, scheduleNext]);

  // Main lifecycle: start/stop scheduler when dependencies change
  useEffect(() => {
    scheduleNext();
    return () => clearTimer();
  }, [scheduleNext]);

  // Listeners for Tab Visibility, Window Focus, and Online reconnection
  useEffect(() => {
    if (!enabled) return undefined;

    const handleVisibilityOrFocus = () => {
      if (typeof document !== "undefined" && document.hidden) {
        clearTimer();
        return;
      }

      const timeSinceLast = Date.now() - lastFetchTimeRef.current;
      if (refetchOnFocus && timeSinceLast >= minFocusIntervalMs) {
        trigger();
      } else {
        scheduleNext();
      }
    };

    const handleOnline = () => {
      if (refetchOnReconnect) {
        trigger();
      } else {
        scheduleNext();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleVisibilityOrFocus);
      window.addEventListener("online", handleOnline);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleVisibilityOrFocus);
        window.removeEventListener("online", handleOnline);
      }
    };
  }, [enabled, refetchOnFocus, refetchOnReconnect, minFocusIntervalMs, trigger, scheduleNext]);

  return { trigger };
};

export default useSmartPolling;
