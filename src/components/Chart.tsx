import { Suspense } from "react";
import {
  CartesianGrid,
  Label,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Assets } from "../types/assets";
import "./Chart.scss";
import CustomTooltip from "./CustomTooltip";

const Chart = (portfolios: {
  data: {
    composition: never[];
    std: number;
    periodReturn: number;
  }[];
  assets: Assets;
}) => {
  const chartData = portfolios.data.map((portfolio) => {
    return {
      x: Math.round(portfolio.std * 10000) / 100,
      y: Math.round(portfolio.periodReturn * 10000) / 100,
      z: portfolio.composition.map(
        (position, index) =>
          ` ${Math.round(position * 100)}% ${portfolios.assets[index].symbol}`
      ),
    };
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="scatter__wrapper">
        <ScatterChart width={920} height={480}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" name="stdev" unit="%" type="number">
            <Label value="Risk (standard deviation)" position={"center"} />
          </XAxis>
          <YAxis dataKey="y" name="return" unit="%">
            <Label value="return" />
          </YAxis>
          <ZAxis dataKey="z" name="composition" />
          <Scatter name="Possible Portfolios" data={chartData} fill="#8884d8" />
          <Tooltip content={<CustomTooltip active={false} payload={[]} />} />
        </ScatterChart>
      </div>
    </Suspense>
  );
};

export default Chart;
