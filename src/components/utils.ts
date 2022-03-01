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
  error?: string | null,
  // stacked:
  // sorted:
  // other intermediate transforms?
}

export type PanelMode = "bubble" | "scatter";

export type TimeRange = { from: number; to: number };

export interface PrepDataOpts {
  mode: PanelMode;
}

export const prepData = (frames: DataFrame[], opts: PrepDataOpts): MyPanelData => {
  return {
    frames: frames,
    aligned: frames.flatMap((frame) =>
      frame.fields.map((field) => field.values),
    ),
  };
};

export interface PrepCfgOpts<TData> {
  data: TData;
  timeZone: string;
  get timeRange(): TimeRange;

  mode: PanelMode;
}

export interface MyPanelConfig extends UPlotChartConfig {
  withData: (data: MyPanelData) => void;
};

// should accept panelOpts, fieldConfig, data, pre-existing builder
export const prepConfig = (
  opts: PrepCfgOpts<MyPanelData>,
  builder?: UPlotOptsBuilder,
): MyPanelConfig => {
  builder = builder ?? new UPlotOptsBuilder();

  const subscribers = {
    hover: new Set<Handler>(),
    move: new Set<Handler>(),
  };

  let { data } = opts;
  // refreshes initial data within this closure
  const withData = (_data) => {
    debugLog("cfg.withData()");
    data = _data;
  };

  builder.addHook("draw", () => {
    debugLog("build quadtree & draw bar labels using", data);
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
    withData,
    builder,
    on,
  };
};
