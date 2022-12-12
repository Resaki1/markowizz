import "./App.css";
import { getAssets, getCorrelations } from "./helpers/calculations";
import Chart from "./components/Chart";
import { useEffect, useState, useTransition } from "react";
import NewAsset from "./components/NewAsset";
import { Asset, Correlations } from "./types/assets";

const App = () => {
  const [symbols, setSymbols] = useState<string[]>([
    /* "MURGF",
    "BAS.FRK",
    "INN1.FRK",
    "ALIZF",
    "BAYA.FRK", */
    /* "DAI.DEX",
    "VNA.FRK",
    "DTG.FRK", */
  ]);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<{
    correlations: Correlations;
    assets: Asset[];
  }>({
    correlations: {},
    assets: [],
  });

  const addNewAsset = (newAsset: string) => {
    symbols
      ? startTransition(() => setSymbols([...symbols, newAsset]))
      : startTransition(() => setSymbols([newAsset]));
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
      {isPending && <div>Updating assets</div>}
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
