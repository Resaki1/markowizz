import retry from "async-retry";
import { DailyTimeSeriesAdjusted } from "../types/alphavantage";

const API_KEY = import.meta.env.VITE_APLHA_VANTAGE_API_KEY;

const API_URL = `https://www.alphavantage.co/query?apikey=${API_KEY}&function=`;

export const getTimeSeriesDaily = async (
  symbol: string
): Promise<DailyTimeSeriesAdjusted[]> => {
  const response = retry(async () => {
    const localStorage = window.localStorage.getItem(symbol);
    if (localStorage) {
      return JSON.parse(localStorage) as DailyTimeSeriesAdjusted[];
    }
    const response = await fetch(
      `${API_URL}TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full`
    );

    const data = await response.json();
    if (await data["Note"]) throw new Error("API rate limit exceeded");

    window.localStorage.setItem(
      symbol,
      JSON.stringify(data["Time Series (Daily)"])
    );
    return data["Time Series (Daily)"] as DailyTimeSeriesAdjusted[];
  });

  return response;
};
