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
import { Assets, Correlations } from "./types/assets";

const App = () => {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [assets, setAssets] = useState<Assets>([]);
  const [correlations, setCorrelations] = useState<Correlations>({});

  const addNewAsset = (newAsset: string) => {
    symbols ? setSymbols([...symbols, newAsset]) : setSymbols([newAsset]);
  };

  useEffect(() => {
    const calcCorrelations = async () => {
      const correlations = await getCorrelations(symbols);
      setCorrelations(correlations);
    };
    const fetchAssets = async () => {
      const assets = await getAssets(symbols);
      setAssets(assets);
    };
    calcCorrelations();
    fetchAssets();
  }, [symbols]);

  return (
    <div className="App">
      <ul>
        {symbols?.map((asset) => (
          <li key={asset}>{asset}</li>
        ))}
      </ul>
      <NewAsset addNewAsset={addNewAsset} />
      {assets.length > 0 && (
        <Chart
          data={getAllPortfolios(assets, "5Y", correlations)}
          assets={assets}
        />
      )}
    </div>
  );
};

export default App;
