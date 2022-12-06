import { Asset, Assets, Correlations, Period } from "../types/assets";
import { getTimeSeriesDaily } from "./api";
import calculateCorrelation from "calculate-correlation";

const period = 5;
const days = period * 252;

export const getPortfolioStd = (
  assets: Assets,
  currentPeriod: Period,
  composition: number[],
  correlations: Correlations
) => {
  //var _this = this
  var sum1 = 0;
  var sum2 = 0;

  assets.forEach((x, i) => {
    sum1 +=
      Math.pow(x.performance[currentPeriod].std, 2) *
      Math.pow(composition[i], 2);
  });

  assets.forEach((x, i) => {
    assets.forEach((y, j) => {
      if (i != j) {
        sum2 +=
          composition[i] *
          composition[j] *
          x.performance[currentPeriod].std *
          y.performance[currentPeriod].std *
          correlations[x.symbol][y.symbol];
      }
    });
  });

  return Math.sqrt(sum1 + sum2);
};

export const getPortfolioReturn = (
  assets: Assets,
  currentPeriod: Period,
  composition: number[]
) => {
  var sum = 0;
  assets.forEach((x, i) => {
    sum += x.performance[currentPeriod].return * composition[i];
  });
  return sum;
};

export const getAllPortfolios = (
  assets: Assets,
  currentPeriod: Period,
  correlations: Correlations
): {
  composition: never[];
  std: number;
  periodReturn: number;
}[] => {
  if (assets.length === 0) return [];
  const stepSize = 0.1;

  let compositions = [[]];
  generatePortfolioCombinations([], assets.length, compositions, stepSize);

  const portfolios = compositions.map((composition) => {
    return {
      composition,
      std: getPortfolioStd(assets, currentPeriod, composition, correlations),
      periodReturn: getPortfolioReturn(assets, currentPeriod, composition),
    };
  });

  portfolios.shift();

  return portfolios;
};

const sumOf = (array: number[]) => {
  return array.reduce((a, b) => a + b, 0);
};

const generatePortfolioCombinations = (
  composition: number[],
  length: number,
  compositions: number[][],
  stepSize: number = 0.1
) => {
  var sum = sumOf(composition);
  if (composition.length == length - 1) {
    var newComposition = composition.slice(0);
    newComposition.push(Math.round((1 - sum) * 100) / 100);
    compositions.push(newComposition);
  } else {
    for (var i = 0; i <= 1 - sum; i = Math.round((i + stepSize) * 100) / 100) {
      var newComposition = composition.slice(0);
      newComposition.push(i);
      generatePortfolioCombinations(
        newComposition,
        length,
        compositions,
        stepSize
      );
    }
  }
};

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

const getTimeSeries = async (asset: string, days: number) => {
  const timeSeries = await getTimeSeriesDaily(asset);
  return Object.entries(timeSeries)
    .slice(0, days)
    .map((value) => Number.parseFloat(value[1]["4. close"]));
};

export const getCorrelation = (
  dailies1: number[],
  dailies2: number[]
): number => calculateCorrelation(dailies1, dailies2);

export const getAssetStd = async (timeSeries: number[]) => {
  return getStandardDeviation(timeSeries, "percent");
};

export const getAssetReturn = async (timeSeries: number[]) => {
  return (
    (timeSeries[0] - timeSeries[timeSeries.length - 1]) /
    timeSeries[timeSeries.length - 1]
  );
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

export const getCorrelations = async (
  assets: Asset[]
): Promise<Correlations> => {
  const correlations: Correlations = {};

  assets.forEach((asset1) => {
    correlations[asset1.symbol] = {};
    assets.forEach(async (asset2) => {
      if (asset1.symbol !== asset2.symbol) {
        correlations[asset1.symbol][asset2.symbol] = await getCorrelation(
          asset1.timeSeries,
          asset2.timeSeries
        );
      }
    });
  });

  return correlations;
};
