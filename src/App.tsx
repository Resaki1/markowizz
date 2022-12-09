import "./App.css";
import {
  getAllPortfolios,
  getAssets,
  getCorrelation,
  getCorrelations,
} from "./helpers/calculations";
import Chart from "./components/Chart";
import { Suspense, useEffect, useState } from "react";
import NewAsset from "./components/NewAsset";
import { Asset, Assets, Correlations } from "./types/assets";

const App = () => {
  const [symbols, setSymbols] = useState<string[]>([
    "VNA.FRK",
    "IBM",
    "DTGHF",
    "ING",
    "DDAIY",
    "MURGF",
  ]);
  const [data, setData] = useState<{
    correlations: Correlations;
    assets: Asset[];
  }>({
    correlations: {},
    assets: [],
  });

  const addNewAsset = (newAsset: string) => {
    symbols ? setSymbols([...symbols, newAsset]) : setSymbols([newAsset]);
  };

  useEffect(() => {
    const fetchAssets = async () => {
      return await getAssets(symbols);
    };
    const calcCorrelations = async (assets: Asset[]) => {
      return await getCorrelations(assets);
    };

    fetchAssets().then((assets) => {
      calcCorrelations(assets).then((correlations) => {
        setData({ correlations, assets });
      });
    });
  }, [symbols]);

  return (
    <div className="App">
      <ul>
        {symbols?.map((asset) => (
          <li key={asset}>{asset}</li>
        ))}
      </ul>
      <NewAsset addNewAsset={addNewAsset} />

      <Chart correlations={data.correlations} assets={data.assets} />
    </div>
  );
};

export default App;
