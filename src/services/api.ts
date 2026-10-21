import axios from "axios";
import { RATE_LIMIT_COOLDOWN_MS } from "../config";
import { RateLimitError } from "./errors";

const baseURL = process.env.REACT_APP_API_BASE;
// Optional CoinGecko key. Demo keys use the public host; Pro keys use pro-api.coingecko.com.
const apiKey = process.env.REACT_APP_API_KEY;
const keyHeader = baseURL?.includes("pro-api") ? "x-cg-pro-api-key" : "x-cg-demo-api-key";

//axios instance with base URL from env
const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: apiKey ? { [keyHeader]: apiKey } : undefined,
});

// After a 429, block every request until the cooldown ends, so retries cost nothing.
let cooldownUntil = 0;

const parseRetryAfter = (value: unknown): number | null => {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null;
};

api.interceptors.request.use((config) => {
  const wait = cooldownUntil - Date.now();
  if (wait > 0) return Promise.reject(new RateLimitError(wait));
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 429) {
      const wait = parseRetryAfter(error.response.headers?.["retry-after"]) ?? RATE_LIMIT_COOLDOWN_MS;
      cooldownUntil = Date.now() + wait;
      return Promise.reject(new RateLimitError(wait));
    }
    return Promise.reject(error);
  }
);

export default api;
