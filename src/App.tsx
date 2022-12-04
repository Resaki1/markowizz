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
    symbol: "VNA",
    performance: {
      "5Y": {
        std: 0.0982,
        return: -0.0715,
      },
    },
  },
  {
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
  },
];

const correlations = {
  ING: {
    VNA: -0.2,
    MURGF: 0.12,
    DDAIY: -0.65,
  },
  VNA: {
    ING: -0.2,
    MURGF: 0.29,
    DDAIY: 0.42,
  },
  MURGF: {
    ING: 0.12,
    VNA: 0.29,
    DDAIY: 0.46,
  },
  DDAIY: {
    ING: -0.65,
    VNA: 0.42,
    MURGF: 0.46,
  },
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
