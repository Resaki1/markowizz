import { Assets, Correlations, Period } from "../types/assets";
import { getTimeSeriesDaily } from "./api";
import calculateCorrelation from "calculate-correlation";

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

/* const getAvgAssetPrice = (dailyValues: number[]) => {
  const sum = dailyValues.reduce((a, b) => a + b, 0);
  return sum / dailyValues.length;
};

const getSquaredDeviations = (dailyValues: number[], average: number) => {
  return dailyValues.map((value) => Math.pow(value - average, 2));
}; */

function getStandardDeviation(array: number[]) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(
    array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n
  );
}

export const getCorrelation = async (asset1: string, asset2: string) => {
  const period = 5;
  const days = period * 252;

  const dailies1 = Object.entries(await getTimeSeriesDaily(asset1))
    .slice(0, days)
    .map((value) => Number.parseFloat(value[1]["4. close"]));
  const dailies2 = Object.entries(await getTimeSeriesDaily(asset2))
    .slice(0, days)
    .map((value) => Number.parseFloat(value[1]["4. close"]));

  const std1 = getStandardDeviation(dailies1);
  const std2 = getStandardDeviation(dailies2);

  const correlation = calculateCorrelation(dailies1, dailies2);

  console.log(`Standard Deviation ${asset1}: ${std1}`);
  console.log(`Standard Deviation ${asset2}: ${std2}`);
  console.log(`Correlation: ${correlation}`);

  return "test";
};
