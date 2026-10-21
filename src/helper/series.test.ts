import { PricePoint } from "../types/types";
import { mergeSeries, tailIsContinuous } from "./series";

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
