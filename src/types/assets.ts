import { DailyTimeSeriesAdjusted } from "./alphavantage";

export type Asset = {
  symbol: string;
  performance: {
    [key in Period]: {
      std: number;
      return: number;
    };
  };
  timeSeries: number[];
};

export type Assets = Asset[];

export type Correlations = {
  [key: string]: {
    [key: string]: number;
  };
};

export type Period = "5Y";
