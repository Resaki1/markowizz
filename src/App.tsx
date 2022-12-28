import "./App.css";
import { getAssets } from "./helpers/calculations";
import Chart from "./components/Chart";
import { useEffect, useRef, useState, useTransition } from "react";
import NewAsset from "./components/NewAsset";
import { Asset, Correlations } from "./types/assets";
import MyWorker from "./workers/worker?worker";
import { wrap } from "comlink";

const worker = new MyWorker();
const api: any = wrap(worker);

const App = () => {
  const [symbols, setSymbols] = useState<string[]>([
    "MURGF",
    "BAS.FRK",
    "INN1.FRK",
    "ALIZF",
    "BAYA.FRK",
    /* "DAI.DEX", */
    /* "VNA.FRK",
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
  const startTime = useRef<number>(0);

  const addNewAsset = (newAsset: string) => {
    symbols
      ? startTransition(() => setSymbols([...symbols, newAsset]))
      : startTransition(() => setSymbols([newAsset]));
  };

  useEffect(() => {
    startTime.current = Date.now();

    getAssets(symbols).then(async (assets) => {
      await api.getCorrelations(assets);
      const correlations: Correlations = await api.correlations;
      setData({ correlations, assets });
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

      <Chart
        correlations={data.correlations}
        assets={data.assets}
        debug_starttime={startTime.current}
      />
    </div>
  );
};

export default App;
