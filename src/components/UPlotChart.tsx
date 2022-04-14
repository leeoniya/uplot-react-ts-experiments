/**
 * UPlotChart wraps/extends UPlotReact with an interface that:
 *
 * 1. Accepts config: { builder: UPlotOptsBuilder, onevent: (type, callback) => void }
 *    instead of a final uPlot opts object. Typically, callback(event) => setState()
 *
 * 2. Invokes props.children(config) to allow child components to augment the config
 *    and/or subscribe to high-level events (e.g. hover, select) prior to final uPlot init.
 *
 * 3. Invokes config.builder.getOpts() to produce the final uPlot opts object, and passes it
 *    down to <UPlotReact opts={opts}>
 */

import React, { useMemo, useState } from "react";
import uPlot from "uplot";
import { debugLog } from "../debug";
import { DataFrame, TimeRange } from "./types";
import { UPlotOptsBuilder } from "./UPlotOptsBuilder";
import { UPlotReactProps, UPlotReact } from "./UPlotReact";

export type Handler = (event: UPlotChartEvent) => void;

export type EventType = "hover" | "move";

export interface UPlotChartEvent {
  x: number;
  y: number;
  dataIdxs: (number | null)[];
  // rects?
}

export interface VizDataBase {
  data: uPlot.AlignedData; // | FacetedData
}

export interface CtxBase {
  data: {
    frames: DataFrame[];
  };
  timeRange: TimeRange;
}

export interface UPlotChartConfig<
  TCtx extends CtxBase,
  TVizData extends VizDataBase,
> {
  error?: string | null;
  // updates data & any dynamic panel props (timeRange) inside config closure
  setCtx: (ctx: TCtx) => void;
  // joins, applies negY transforms, accums stacks
  vizData: () => TVizData;
  // generates final uPlot props before init
  builder: UPlotOptsBuilder;
  // high level event subscription interface
  on(type: EventType, handler: Handler): void;
}

// Usually are React components that:
// 0. Make use of uPlot's hooks/events or augment a pre-init config
// 1. Are renderless
// 2. Or render into a portal
// 3. Or manually modify/extend uPlot's DOM
//export type UPlotChartPlugin = React.ReactComponentElement<any>;

interface UPlotChartProps<TCtx extends CtxBase, TVizData extends VizDataBase>
  extends Omit<UPlotReactProps, "opts" | "data"> {
  config: UPlotChartConfig<TCtx, TVizData>;
  children?: (
    config: UPlotChartConfig<TCtx, TVizData>, // TCfg
    plot?: uPlot | null,
    vizData?: TVizData,
  ) => React.ReactElement; //) => UPlotChartPlugin | UPlotChartPlugin[];
}

export const UPlotChart = <TCtx extends CtxBase, TVizData extends VizDataBase>(
  props: UPlotChartProps<TCtx, TVizData>,
) => {
  debugLog("UPlotChart()");

  const [plot, setPlot] = useState<uPlot | null>(null);

  // this is for deubug only; should just be <UPlotReact oninit={setPlot}
  const oninit = (plot: uPlot) => {
    debugLog("oninit!", plot);
    setPlot(plot);
  };

  const { width, height, config, children: getChildren = () => null } = props;

  // this expects that uPlot plugins will not amend the config in ways that affect how vizData() processes data (joins, stacking, negY)
  // it also relies on config to internally cache/bust the result in sync with ctx.data changes
  const vizData = config.vizData();

  // allow all children opportunity to augment cfg
  const children = getChildren(config, plot, vizData);

  // generate final opts
  const opts = useMemo(() => config.builder.getOpts(), [config]);

  return (
    <>
      {children}
      <UPlotReact
        width={width}
        height={height}
        opts={opts}
        data={vizData.data}
        oninit={oninit}
      />
    </>
  );
};
