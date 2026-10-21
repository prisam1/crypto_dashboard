// Sliding-window limiter: `acquire()` resolves immediately while fewer than `max` calls
// were made in the last `windowMs`, otherwise waits for the oldest one to expire.
export const createRateLimiter = (max: number, windowMs: number) => {
  const recent: number[] = [];

  return async function acquire() {
    for (;;) {
      const now = Date.now();
      while (recent.length && now - recent[0] >= windowMs) recent.shift();
      if (recent.length < max) {
        recent.push(now);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, recent[0] + windowMs - now + 50));
    }
  };
};
