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

  useEffect(
    () =>
      startTransition(() => {
        const getPortfolios = async () => {
          const portfolios = await getAllPortfolios(assets, "5Y", correlations);

          let returnSum = 0;
          let stdSum = 0;
          let bestReturnPortfolio = { x: 0, y: -1000 };
          let bestStdPortfolio = { x: 1000, y: 0 };
          let worstStdPortfolio = { x: -1000, y: 0 };
          const data = portfolios.map((portfolio, index) => {
            const std = Math.round(portfolio.std * 10000) / 100;
            const periodReturn =
              Math.round(portfolio.periodReturn * 10000) / 100;

            returnSum += periodReturn;
            stdSum += std;
            if (periodReturn > bestReturnPortfolio.y)
              bestReturnPortfolio = { x: std, y: periodReturn };
            if (std < bestStdPortfolio.x)
              bestStdPortfolio = { x: std, y: periodReturn };
            if (std > worstStdPortfolio.x)
              worstStdPortfolio = { x: std, y: periodReturn };

            return {
              x: std,
              y: periodReturn,
              z: portfolio.composition.map(
                (position, index) =>
                  ` ${Math.round(position * 100)}% ${assets[index].symbol}`
              ),
            };
          });

          // calculate the line between the best return and best std portfolio
          const mBest =
            (bestReturnPortfolio.y - bestStdPortfolio.y) /
            (bestReturnPortfolio.x - bestStdPortfolio.x);
          const bBest = bestReturnPortfolio.y - mBest * bestReturnPortfolio.x;

          // calculate the distance of the worst std portfolio to the line
          const distanceWorst =
            Math.abs(
              mBest * worstStdPortfolio.x - worstStdPortfolio.y + bBest
            ) / Math.sqrt(mBest * mBest + 1);

          // filter all points from data that are above the line
          const filteredData = data.filter((point) => {
            if (point.y >= mBest * point.x + bBest) {
              return true;
            } else {
              const dist =
                Math.abs(mBest * point.x - point.y + bBest) /
                Math.sqrt(mBest * mBest + 1);
              return (
                Math.pow(
                  (distanceWorst - dist) / distanceWorst,
                  assets.length * 2
                ) > Math.random()
              );
            }
          });

          console.log(filteredData.length, "data points");
          setChartData(filteredData);
        };

        getPortfolios();
      }),
    [assets, correlations]
  );

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
            name="return p.a."
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
