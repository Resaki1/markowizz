import { Asset, Assets } from "../types/assets";
import { getTimeSeriesDaily } from "./api";

const period = 5;
const days = period * 252;

export const getStandardDeviation = (
  array: number[],
  mode?: "absolute" | "percent"
): number => {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  const std = Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );

  return mode === "percent" ? std / mean : std;
};

export const getAssetStd = async (timeSeries: number[]) => {
  return getStandardDeviation(timeSeries, "percent");
};

export const getAssetReturn = async (timeSeries: number[]) => {
  return (
    (timeSeries[0] - timeSeries[timeSeries.length - 1]) /
    timeSeries[timeSeries.length - 1]
  );
};

export const getTimeSeries = async (asset: string, days: number) => {
  const timeSeries = await getTimeSeriesDaily(asset);
  return Object.entries(timeSeries)
    .slice(0, days)
    .map((value) => Number.parseFloat(value[1]["4. close"]));
};

export const distance = (
  a: { x: number; y: number },
  b: { x: number; y: number }
) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

export const getAssets = async (symbols: string[]): Promise<Assets> => {
  const assets = await Promise.all(
    symbols.map(async (symbol) => {
      const timeSeries = await getTimeSeries(symbol, days);

      return {
        symbol,
        performance: {
          [period + "Y"]: {
            std: await getAssetStd(timeSeries),
            return: await getAssetReturn(timeSeries),
          },
        },
        timeSeries,
      } as Asset;
    })
  );

  return assets;
};
