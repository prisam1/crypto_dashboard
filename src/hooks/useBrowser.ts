import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const subscribeOnline = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

export const useOnlineStatus = () =>
  useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);

export const useMediaQuery = (query: string) => {
  const sub = useCallback(
    (cb: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    [query]
  );
  return useSyncExternalStore(sub, () => window.matchMedia(query).matches, () => false);
};

// Re-render on an interval (for "updated 12s ago" labels). Keep it in small leaf components.
export const useNow = (intervalMs: number) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
};

// useState that survives reloads (UI preferences only; never API data).
export const usePersistentState = <T>(
  key: string,
  fallback: T,
  validate: (v: unknown) => v is T
) => {
  const storageKey = `cryptodash:pref:${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
      return validate(stored) ? stored : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // storage unavailable: preference just won't persist
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
};
