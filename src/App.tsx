import "./App.css";
import {
  getAllPortfolios,
  getAssets,
  getCorrelation,
} from "./helpers/calculations";
import Chart from "./components/Chart";
import { Suspense, useEffect, useState } from "react";
import NewAsset from "./components/NewAsset";
import { Assets } from "./types/assets";

const correlations = {
  ING: {
    "VNA.FRK": await getCorrelation("ING", "VNA.FRK"),
    MURGF: await getCorrelation("ING", "MURGF"),
    DDAIY: await getCorrelation("ING", "DDAIY"),
  },
  "VNA.FRK": {
    ING: await getCorrelation("VNA.FRK", "ING"),
    MURGF: await getCorrelation("VNA.FRK", "MURGF"),
    DDAIY: await getCorrelation("VNA.FRK", "DDAIY"),
  },
  MURGF: {
    ING: await getCorrelation("MURGF", "ING"),
    "VNA.FRK": await getCorrelation("MURGF", "VNA.FRK"),
    DDAIY: await getCorrelation("MURGF", "DDAIY"),
  },
  DDAIY: {
    ING: await getCorrelation("DDAIY", "ING"),
    "VNA.FRK": await getCorrelation("DDAIY", "VNA.FRK"),
    MURGF: await getCorrelation("DDAIY", "MURGF"),
  },
};

const App = () => {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [assets, setAssets] = useState<Assets>([]);

  const addNewAsset = (newAsset: string) => {
    symbols ? setSymbols([...symbols, newAsset]) : setSymbols([newAsset]);
  };

  useEffect(() => {
    const fetchAssets = async () => {
      const assets = await getAssets(symbols);
      setAssets(assets);
    };
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
