type Number<T extends number> = number extends T ? number : _Range<T, []>;
type _Range<T extends number, R extends unknown[]> = R["length"] extends T
  ? R[number]
  : _Range<T, [R["length"], ...R]>;

export type Asset = {
  symbol: string;
  performance: {
    [key in Period]: {
      std: number;
      return: number;
    };
  };
};

export type Assets = Asset[];

export type Correlations = {
  [key: string]: {
    [key: string]: number;
  };
};

export type Period = "5Y";
