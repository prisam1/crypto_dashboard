import { describeError } from "./errors";

// Persistent response cache shared by every hook:
//  - memory + localStorage, so reloads and coin switches reuse saved data
//  - identical concurrent requests share one network call
//  - other tabs' fetches show up here via the `storage` event, so tabs don't double-fetch
//  - everything read back from storage is validated, so bad/old data can't crash the UI

export interface Resource<T> {
  data: T | null;
  fetchedAt: number; // 0 = never fetched
  error: string | null;
  fetching: boolean;
}

export type Validator<T> = (value: unknown) => value is T;

const STORAGE_PREFIX = "cryptodash:v1:";

const EMPTY: Resource<never> = Object.freeze({
  data: null,
  fetchedAt: 0,
  error: null,
  fetching: false,
});

const store = new Map<string, Resource<unknown>>();
const validators = new Map<string, Validator<unknown>>();
const inflight = new Map<string, Promise<Resource<unknown>>>();
const listeners = new Map<string, Set<() => void>>();

const storage = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null; // private mode / blocked storage
  }
};

const hydrate = <T>(key: string, validate: Validator<T>): Resource<T> => {
  try {
    const raw = storage()?.getItem(STORAGE_PREFIX + key);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.fetchedAt === "number" && validate(parsed.data)) {
      return { data: parsed.data, fetchedAt: parsed.fetchedAt, error: null, fetching: false };
    }
    storage()?.removeItem(STORAGE_PREFIX + key); // drop corrupt or outdated entries
  } catch {
    // unreadable entry → behave as if nothing was cached
  }
  return EMPTY;
};

const persist = (key: string, data: unknown, fetchedAt: number) => {
  try {
    storage()?.setItem(STORAGE_PREFIX + key, JSON.stringify({ data, fetchedAt }));
  } catch {
    // quota exceeded / blocked: the in-memory copy still works
  }
};

const notify = (key: string) => listeners.get(key)?.forEach((listener) => listener());

// Stable snapshot for useSyncExternalStore: same object until the entry changes.
export const getResource = <T>(key: string, validate: Validator<T>): Resource<T> => {
  validators.set(key, validate as Validator<unknown>);
  let entry = store.get(key);
  if (!entry) {
    entry = hydrate(key, validate);
    store.set(key, entry);
  }
  return entry as Resource<T>;
};

const update = <T>(key: string, validate: Validator<T>, patch: Partial<Resource<T>>) => {
  const next = { ...getResource(key, validate), ...patch } as Resource<T>;
  store.set(key, next);
  notify(key);
  return next;
};

export const subscribe = (key: string, listener: () => void) => {
  let set = listeners.get(key);
  if (!set) listeners.set(key, (set = new Set()));
  set.add(listener);
  return () => {
    set!.delete(listener);
  };
};

// Write data that didn't come from `load` (e.g. live price ticks).
export const setData = <T>(key: string, validate: Validator<T>, data: T, fetchedAt = Date.now()) => {
  update(key, validate, { data, fetchedAt });
  persist(key, data, fetchedAt);
};

interface LoadOptions<T> {
  fetcher: () => Promise<T>;
  validate: Validator<T>;
  // Return true to serve the cached value without calling the API.
  isFresh: (cached: Resource<T> & { data: T }) => boolean;
}

// Returns cached data when fresh, otherwise fetches once (de-duplicated) and saves it.
// On failure the previous data is kept and only `error` is set.
export const load = <T>(key: string, { fetcher, validate, isFresh }: LoadOptions<T>): Promise<Resource<T>> => {
  const cached = getResource(key, validate);
  if (cached.data !== null && isFresh(cached as Resource<T> & { data: T })) {
    return Promise.resolve(cached);
  }

  const pending = inflight.get(key);
  if (pending) return pending as Promise<Resource<T>>;

  const request = (async () => {
    update(key, validate, { fetching: true });
    try {
      const data = await fetcher();
      if (!validate(data)) throw new Error("Unexpected response from the price API.");
      const next = update(key, validate, { data, fetchedAt: Date.now(), error: null, fetching: false });
      persist(key, data, next.fetchedAt);
      return next;
    } catch (err) {
      update(key, validate, { error: describeError(err), fetching: false });
      throw err;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request as Promise<Resource<unknown>>);
  return request;
};

// Another tab saved fresher data → use it here instead of fetching again.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (!event.key?.startsWith(STORAGE_PREFIX)) return;
    const key = event.key.slice(STORAGE_PREFIX.length);
    const validate = validators.get(key);
    if (!validate) return; // this tab never used that key
    const incoming = hydrate(key, validate);
    const current = store.get(key);
    if (incoming.data === null || (current && current.fetchedAt >= incoming.fetchedAt)) return;
    store.set(key, { ...incoming, fetching: current?.fetching ?? false });
    notify(key);
  });
}

// Test helper.
export const __resetCache = () => {
  store.clear();
  validators.clear();
  inflight.clear();
  listeners.clear();
};
