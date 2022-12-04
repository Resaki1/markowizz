import "./App.css";
import { getAllPortfolios, getCorrelation } from "./helpers/calculations";
import Chart from "./components/Chart";
import { Assets } from "./types/assets";

const securities: Assets = [
  {
    symbol: "ING",
    performance: {
      "5Y": {
        std: 0.1085,
        return: -0.0376,
      },
    },
  },
  {
    symbol: "VNA.FRK",
    performance: {
      "5Y": {
        std: 0.0982,
        return: -0.0715,
      },
    },
  },
  /* {
    symbol: "MURGF",
    performance: {
      "5Y": {
        std: 0.119,
        return: 0.1943,
      },
    },
  },
  {
    symbol: "DDAIY",
    performance: {
      "5Y": {
        std: 0.0895,
        return: 0.1452,
      },
    },
  }, */
];

const correlations = {
  ING: {
    VNA: await getCorrelation("ING", "VNA.FRK"),
    MURGF: await getCorrelation("ING", "MURGF"),
    DDAIY: await getCorrelation("ING", "DDAIY"),
  },
  "VNA.FRK": {
    ING: await getCorrelation("VNA.FRK", "ING"),
    MURGF: await getCorrelation("VNA.FRK", "MURGF"),
    DDAIY: await getCorrelation("VNA.FRK", "DDAIY"),
  } /* 
  MURGF: {
    ING: await getCorrelation("MURGF", "ING"),
    VNA: await getCorrelation("MURGF", "VNA.FRK"),
    DDAIY: await getCorrelation("MURGF", "DDAIY"),
  },
  DDAIY: {
    ING: await getCorrelation("DDAIY", "ING"),
    VNA: await getCorrelation("DDAIY", "VNA.FRK"),
    MURGF: await getCorrelation("DDAIY", "MURGF"),
  }, */,
};

console.log(getCorrelation("DDAIY", "MURGF"));

const App = () => {
  return (
    <div className="App">
      <Chart
        data={getAllPortfolios(securities, "5Y", correlations)}
        assets={securities}
      />
    </div>
  );
};

export default App;
