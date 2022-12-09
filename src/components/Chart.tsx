import { Suspense, useEffect, useState, useTransition } from "react";
import {
  CartesianGrid,
  Label,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { getAllPortfolios } from "../helpers/calculations";
import useWindowDimensions from "../helpers/hooks";
import { Assets, Correlations } from "../types/assets";
import "./Chart.scss";
import CustomTooltip from "./CustomTooltip";

const Chart = ({
  correlations,
  assets,
}: {
  correlations: Correlations;
  assets: Assets;
}) => {
  const [chartData, setChartData] = useState<any>([]);
  const [isPending, startTransition] = useTransition();
  const { height, width } = useWindowDimensions();

  useEffect(() => {
    const getPortfolios = async () => {
      const portfolios = await getAllPortfolios(assets, "5Y", correlations);

      const data = portfolios.map((portfolio) => {
        return {
          x: Math.round(portfolio.std * 10000) / 100,
          y: Math.round(portfolio.periodReturn * 10000) / 100,
          z: portfolio.composition.map(
            (position, index) =>
              ` ${Math.round(position * 100)}% ${assets[index].symbol}`
          ),
        };
      });

      startTransition(() => setChartData(data));
    };

    getPortfolios();
  }, [assets, correlations]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {isPending && <div>Updating...</div>}
      <div className="scatter__wrapper">
        <ScatterChart
          width={width - width / 10}
          height={height - height / 5}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            name="stdev"
            unit="%"
            domain={[
              (dataMin: number) => Math.round(dataMin - 2),
              (dataMax: number) => Math.round(dataMax + 2),
            ]}
            type="number"
            tickCount={10}
          >
            <Label
              value="Risk (standard deviation)"
              offset={-20}
              position="insideBottom"
            />
          </XAxis>
          <YAxis
            dataKey="y"
            name="return"
            unit="%"
            domain={[
              (dataMin: number) => Math.round(dataMin - 5),
              (dataMax: number) => Math.round(dataMax + 5),
            ]}
            type="number"
            tickCount={10}
          >
            <Label value="return" offset={-20} position="insideLeft" />
          </YAxis>
          <ZAxis dataKey="z" name="composition" />
          <ReferenceLine
            y={0}
            stroke="red"
            strokeDasharray="3 3"
            label={"0%"}
          />
          <Scatter name="Possible Portfolios" data={chartData} fill="#8884d8" />
          <Tooltip content={<CustomTooltip active={false} payload={[]} />} />
        </ScatterChart>
      </div>
    </Suspense>
  );
};

export default Chart;
