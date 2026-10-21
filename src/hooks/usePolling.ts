import { useEffect, useRef } from "react";
import { retryDelayMs } from "../services/errors";

// Runs `task` on a self-adjusting timer, but only while the tab is visible and online.
// `task` resolves to how long to wait before the next run; failures back off exponentially.
// Changing `key` (e.g. switching coin) runs the task again right away; the task decides,
// from the cache, whether that actually needs a network call.
export const usePolling = (task: () => Promise<number>, key: string, enabled = true) => {
  const taskRef = useRef(task);
  useEffect(() => {
    taskRef.current = task;
  });

  useEffect(() => {
    if (!enabled) return;
    let timer: number | undefined;
    let cancelled = false;
    let failures = 0;

    const schedule = (ms: number) => {
      window.clearTimeout(timer);
      // small jitter so several open tabs don't fire at the exact same moment
      timer = window.setTimeout(run, Math.max(0, ms) + Math.random() * 3000);
    };

    const run = async () => {
      // paused: the visibility/online listeners below resume us
      if (cancelled || document.hidden || !navigator.onLine) return;
      try {
        const next = await taskRef.current();
        failures = 0;
        if (!cancelled) schedule(next);
      } catch (err) {
        failures += 1;
        if (!cancelled) schedule(retryDelayMs(err, failures));
      }
    };

    const resume = () => {
      if (!document.hidden && navigator.onLine) {
        window.clearTimeout(timer);
        run();
      }
    };

    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    run();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
    };
  }, [key, enabled]);
};
