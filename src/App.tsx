import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { getAllStds, getPortfolioStd } from "./helpers/calculations";

const securities = [
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
];

const composition = [0.3, 0.3, 0.4];

const correlations = {
  ING: {
    VNA: -0.2,
    MURGF: 0.12,
  },
  VNA: {
    ING: -0.2,
    MURGF: 0.29,
  },
  MURGF: {
    ING: 0.12,
    VNA: 0.29,
  },
};

function App() {
  const [count, setCount] = useState(0);

  getAllStds(securities, "5Y", correlations);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
