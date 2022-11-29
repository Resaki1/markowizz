import { Assets, Correlations, Period } from "../types/assets";

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

export const getAllStds = (
  assets: Assets,
  currentPeriod: Period,
  correlations: Correlations
) => {
  const stepSize = 0.1;

  let compositions = [[]];
  generatePortfolioCombinations([], assets.length, compositions, stepSize);

  const stds = compositions.map((composition) => {
    return {
      composition,
      std: getPortfolioStd(assets, currentPeriod, composition, correlations),
      return: getPortfolioReturn(assets, currentPeriod, composition),
    };
  });

  console.log(stds);
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
