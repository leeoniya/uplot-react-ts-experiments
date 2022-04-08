import { AlignedData } from "uplot";
import { debugLog } from "../debug";
import {
  EventType,
  Handler,
  UPlotChartConfig,
  UPlotChartEvent,
} from "./UPlotChart";
import { UPlotOptsBuilder } from "./UPlotOptsBuilder";

export const enum FieldType {
  time = "time",
  number = "number",
}

export interface Field {
  name: string;
  type: FieldType;
  values: number[];
}

export interface DataFrame {
  length: number;
  fields: Field[];
}

// viz-specific interface that is passed down to viz, legend, tooltip components
// can be facets, etc
export interface MyPanelData {
  frames: DataFrame[]; // original data.series
  aligned: AlignedData;
  error?: string | null;
  // stacked:
  // sorted:
  // other intermediate transforms?
}

export type PanelMode = "bubble" | "scatter";

export type TimeRange = { from: number; to: number };

export interface PrepDataOpts {
  mode: PanelMode;
}

export const prepData = (
  frames: DataFrame[],
  opts: PrepDataOpts,
): MyPanelData => {
  return {
    frames: frames,
    //joined:
    aligned: frames.flatMap((frame) =>
      frame.fields.map((field) => field.values),
    ),
  };
};

// should only hold static opts or getters for constructor init
export interface PrepCfgOpts<TData> {
  timeZone: string;
  mode: PanelMode;
}

// should only hold dynamic props that may be updated without config re-init
export interface PrepCfgCtx {
  timeRange: TimeRange;
  data: MyPanelData;
}

export interface MyPanelConfig extends UPlotChartConfig<PrepCfgCtx> {
  setCtx: (ctx: PrepCfgCtx) => void;
}

// should accept panelOpts, ctx.data, pre-existing builder
export const prepConfig = (
  opts: PrepCfgOpts<MyPanelData>,
  ctx: PrepCfgCtx,
  builder?: UPlotOptsBuilder,
): MyPanelConfig => {
  builder = builder ?? new UPlotOptsBuilder();

  // refreshes ctx within this closure
  const setCtx = (_ctx: PrepCfgCtx) => {
    debugLog("cfg.withData()");
    ctx = _ctx;
  };

  const subscribers = {
    hover: new Set<Handler>(),
    move: new Set<Handler>(),
  };

  builder.addHook("draw", () => {
    debugLog("build quadtree & draw bar labels using", ctx.data);
  });

  function on(type: EventType, handler: Handler) {
    const set = subscribers[type];

    if (set.size == 0) {
      // move, hover, enter, leave, focus
      if (type == "move") {
        builder.addHook("setCursor", (u: uPlot) => {
          debugLog("probe quadtree, generate event");

          const evt: UPlotChartEvent = {
            x: u.cursor.left,
            y: u.cursor.top,
            dataIdxs: u.cursor.idxs!,
            // rect,
            // seriesIdx,
            // dataIdx,
          };

          set.forEach((handler) => handler(evt));
        });
      }
    }

    set.add(handler);
  }

  return {
    setCtx,
    builder,
    on,
  };
};
