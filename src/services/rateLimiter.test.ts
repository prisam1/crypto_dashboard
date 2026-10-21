import { createRateLimiter } from "./rateLimiter";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

// advance fake time, then let resolved promises run
const advance = async (ms: number) => {
  jest.advanceTimersByTime(ms);
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

test("never lets more than `max` calls through per window", async () => {
  const acquire = createRateLimiter(3, 60000);
  let passed = 0;
  for (let i = 0; i < 5; i++) acquire().then(() => passed++);

  await advance(0);
  expect(passed).toBe(3); // 4th and 5th are queued

  await advance(59000);
  expect(passed).toBe(3);

  await advance(2000); // first slots expire
  expect(passed).toBe(5);
});
