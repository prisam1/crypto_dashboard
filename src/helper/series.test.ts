import { PricePoint } from "../types/types";
import { convertCoin, convertPoints, mergeSeries, tailIsContinuous } from "./series";

test("currency conversion scales prices but not percentages", () => {
  const coin = {
    id: "bitcoin", symbol: "btc", name: "Bitcoin", image: "",
    current_price: 100, market_cap: 1000, total_volume: null, high_24h: 110, low_24h: 90,
    market_cap_rank: 1, price_change_percentage_24h: 2.5,
  };
  const inr = convertCoin(coin, 80);
  expect(inr.current_price).toBe(8000);
  expect(inr.market_cap).toBe(80000);
  expect(inr.total_volume).toBeNull();
  expect(inr.price_change_percentage_24h).toBe(2.5);
  expect(convertPoints([[1, 2]], 3)).toEqual([[1, 6]]);
});

const MIN = 60_000;

test("appends only ticks newer than the chart and trims to the window", () => {
  const base: PricePoint[] = [
    [0, 1],
    [5 * MIN, 2],
    [10 * MIN, 3],
  ];
  const ticks: PricePoint[] = [
    [9 * MIN, 99], // older than chart end → ignored
    [11 * MIN, 4],
    [12 * MIN, 5],
  ];
  expect(mergeSeries(base, ticks, 7 * MIN)).toEqual([
    [5 * MIN, 2],
    [10 * MIN, 3],
    [11 * MIN, 4],
    [12 * MIN, 5],
  ]);
});

test("no chart history → empty series", () => {
  expect(mergeSeries(null, [[1, 1]], MIN)).toEqual([]);
});

test("continuous live ticks keep the chart fresh", () => {
  const ticks: PricePoint[] = [
    [11 * MIN, 1],
    [12 * MIN, 1],
    [13 * MIN, 1],
  ];
  expect(tailIsContinuous(10 * MIN, ticks, 14 * MIN, 5 * MIN)).toBe(true);
});

test("a gap in ticks (e.g. tab was hidden) requires a refetch", () => {
  const ticks: PricePoint[] = [
    [11 * MIN, 1],
    [30 * MIN, 1],
  ];
  expect(tailIsContinuous(10 * MIN, ticks, 31 * MIN, 5 * MIN)).toBe(false);
  expect(tailIsContinuous(10 * MIN, [], 20 * MIN, 5 * MIN)).toBe(false);
});
