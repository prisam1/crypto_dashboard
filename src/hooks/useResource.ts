import { useCallback, useSyncExternalStore } from "react";
import { getResource, Resource, subscribe, Validator } from "../services/cache";

// Subscribe a component to one cache entry. Re-renders only when that entry changes.
// `validate` must be a stable (module-level) function.
export const useResource = <T>(key: string, validate: Validator<T>): Resource<T> => {
  const sub = useCallback((cb: () => void) => subscribe(key, cb), [key]);
  const snapshot = useCallback(() => getResource(key, validate), [key, validate]);
  return useSyncExternalStore(sub, snapshot, snapshot);
};
