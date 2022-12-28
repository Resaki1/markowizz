import { Suspense, useMemo, useState, useTransition } from "react";
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
import { distance } from "../helpers/calculations";
import useWindowDimensions from "../helpers/hooks";
import { Assets, Correlations } from "../types/assets";
import "./Chart.scss";
import CustomTooltip from "./CustomTooltip";
import MyWorker from "../workers/worker?worker";
import { wrap } from "comlink";

const worker = new MyWorker();
const api: any = wrap(worker);

const Chart = ({
  correlations,
  assets,
  debug_starttime,
}: {
  correlations: Correlations;
  assets: Assets;
  debug_starttime: number;
}) => {
  const [chartData, setChartData] = useState<any>([]);
  const [isPending, startTransition] = useTransition();
  const { height, width } = useWindowDimensions();

  useMemo(
    () =>
      startTransition(() => {
        const getPortfolios = async () => {
          await api.getAllPortfolios(assets, "5Y", correlations);
          const portfolios: {
            composition: never[];
            std: number;
            periodReturn: number;
          }[] = await api.portfolios;

          let best = { x: 1000, y: -1000 };
          let worst = { x: -1000, y: 1000 };
          const data = portfolios.map((portfolio, index) => {
            const std: number = Math.round(portfolio.std * 10000) / 100;
            const periodReturn =
              Math.round(portfolio.periodReturn * 10000) / 100;

            if (periodReturn - std > best.y - best.x)
              best = { x: std, y: periodReturn };

            if (periodReturn - std < worst.y - worst.x)
              worst = { x: std, y: periodReturn };

            return {
              x: std,
              y: periodReturn,
              z: portfolio.composition.map(
                (position, index) =>
                  ` ${Math.round(position * 100)}% ${assets[index].symbol}`
              ),
            };
          });

          // filter all points from data that are above the line
          await api.distance(best, worst);
          const largestDistance = await api.dist;
          const filteredData =
            assets.length <= 3
              ? data
              : data.filter((point) => {
                  if (point.z.find((z) => z.includes("100%"))) {
                    return true;
                  } else {
                    const dist = distance(point, best);
                    const distPercentage = dist / largestDistance;
                    const distCoefficient = Math.pow(
                      distPercentage,
                      Math.pow(assets.length, assets.length / 1.25) /
                        data.length
                    );
                    const random = Math.random();
                    const shouldRender = distCoefficient < random;

                    if (distPercentage < 0.25 / assets.length) return true;

                    return shouldRender;
                  }
                });

          setChartData(filteredData);
        };

        getPortfolios();
      }),
    [assets]
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
          {console.log("duration", Date.now() - debug_starttime)}
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
