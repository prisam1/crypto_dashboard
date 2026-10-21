import { __resetCache, getResource, load } from "./cache";

const isNumbers = (v: unknown): v is number[] =>
  Array.isArray(v) && v.every((n) => typeof n === "number");

const fresh = (maxAge: number) => (r: { fetchedAt: number }) => Date.now() - r.fetchedAt < maxAge;

beforeEach(() => {
  window.localStorage.clear();
  __resetCache();
});

test("concurrent loads share one request", async () => {
  const fetcher = jest.fn().mockResolvedValue([1, 2, 3]);
  const opts = { fetcher, validate: isNumbers, isFresh: fresh(60000) };
  const [a, b] = await Promise.all([load("k", opts), load("k", opts)]);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(a.data).toEqual([1, 2, 3]);
  expect(b.data).toEqual([1, 2, 3]);
});

test("fresh data is served from cache without calling the API", async () => {
  const fetcher = jest.fn().mockResolvedValue([1]);
  const opts = { fetcher, validate: isNumbers, isFresh: fresh(60000) };
  await load("k", opts);
  await load("k", opts);
  expect(fetcher).toHaveBeenCalledTimes(1);
});

test("saved data survives a reload", async () => {
  await load("k", { fetcher: async () => [7], validate: isNumbers, isFresh: fresh(60000) });
  __resetCache(); // simulate page reload: memory gone, localStorage kept
  const fetcher = jest.fn();
  const r = await load("k", { fetcher, validate: isNumbers, isFresh: fresh(60000) });
  expect(fetcher).not.toHaveBeenCalled();
  expect(r.data).toEqual([7]);
});

test("corrupted or wrong-shape storage is ignored instead of crashing", () => {
  window.localStorage.setItem("cryptodash:v1:bad", "{not json");
  window.localStorage.setItem("cryptodash:v1:shape", JSON.stringify({ data: "x", fetchedAt: 1 }));
  expect(getResource("bad", isNumbers).data).toBeNull();
  expect(getResource("shape", isNumbers).data).toBeNull();
});

test("a failed refresh keeps the previous data", async () => {
  await load("k", { fetcher: async () => [1], validate: isNumbers, isFresh: () => false });
  await expect(
    load("k", { fetcher: () => Promise.reject(new Error("boom")), validate: isNumbers, isFresh: () => false })
  ).rejects.toThrow("boom");
  const r = getResource("k", isNumbers);
  expect(r.data).toEqual([1]);
  expect(r.error).toBeTruthy();
});
