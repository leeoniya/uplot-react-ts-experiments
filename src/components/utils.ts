import { AlignedData } from "uplot";
import { debugLog } from "../debug";
import { DataFrame, TimeRange } from "./types";
import {
  EventType,
  Handler,
  UPlotChartConfig,
  UPlotChartEvent,
  VizDataBase,
} from "./UPlotChart";
import { UPlotOptsBuilder } from "./UPlotOptsBuilder";

export type PanelMode = "bubble" | "scatter";

export interface PrepDataOpts {
  mode: PanelMode;
}

export interface MyPreppedData {
  frames: DataFrame[];
  //colorByField:
  //xField:
  //yFields:
  error: null;
}

// should
export const prepData = (
  frames: DataFrame[],
  opts: PrepDataOpts,
): MyPreppedData => {
  return {
    frames,
    error: null,
  };
};

type StackSumsBySeriesIdx = [null, ...number[][]];

// should only hold static opts or getters for constructor init
export interface PrepCfgOpts {
  timeZone: string;
  mode: PanelMode;
}

// should only hold dynamic props that may be updated without config re-init
export interface PrepCfgCtx {
  timeRange: TimeRange;
  data: MyPreppedData;
}

export interface MyVizData extends VizDataBase {
  // final data for u.setData(), joined -> negY -> stacked
  data: AlignedData; // | FacetedData
  // joined & gapped only (raw values by index)
  joined: AlignedData;
  // sums for computing in tooltip and value label rendering
  stackSums: {
    byValue: StackSumsBySeriesIdx;
    byPercent: StackSumsBySeriesIdx;
  };

  // parsed?
  // cleaned?

  // from thresholds or value mappings
  mapped: {
    text: [];
    color: [];
    number: [];
    // icon:
    // size:
    // opacity:
    // label:
    // state:
    // thresholdIndex? steps?
    /*
    const display: DisplayValue = {
      text,
      numeric,
      prefix,
      suffix,
      color,
    };

    if (icon != null) {
      display.icon = icon;
    }

    if (percent != null) {
      display.percent = percent;
    }
    */
  };
}

interface StackingGroup {
  series: number[];
  dir: 1 | -1;
}

export interface MyPanelConfig extends UPlotChartConfig<PrepCfgCtx, MyVizData> {
  setCtx: (ctx: PrepCfgCtx) => void;
  getCtx: () => PrepCfgCtx;
  vizData: () => MyVizData;

  stacks: StackingGroup[];
}

export const prepConfig = (
  opts: PrepCfgOpts,
  ctx: PrepCfgCtx,
  builder?: UPlotOptsBuilder,
): MyPanelConfig => {
  builder = builder ?? new UPlotOptsBuilder();

  //const stacks = getStacks(ctx.data.y);
  //builder.setStacks(stacks); // internally it does genBands/addBand during config building

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

  // internal cache, kept in sync with ctx.data
  let vizData: MyVizData = null;
  const getVizData = () => {
    if (vizData == null) {
      debugLog("regen getVizData()");

      const joined = ctx.data.frames.flatMap((frame) =>
        frame.fields.map((field) => field.values),
      );

      vizData = {
        data: joined,
        joined: joined,
        // TODO: omit when not stacking
        stackSums: {
          byValue: [null, "accum", "accum"],
          byPercent: [null, "accum", "accum"],
        },
      };
    } else {
      debugLog("cached getVizData()");
    }

    return vizData;
  };

  const setCtx = (_ctx: PrepCfgCtx) => {
    debugLog("cfg.setCtx()");
    // this relies on memo at the panel level
    if (_ctx.data != ctx.data) {
      vizData = null;
    }
    ctx = _ctx;
  };

  // origin, seriesIdx, displayProcessor, value coercion
  // field origins should already be attached
  // data.frames (original)
  // all selected "y" fields should ave origins mapped into data.frames

  return {
    stacks: [],

    builder,
    on,
    getCtx: () => ctx,
    setCtx,
    vizData: getVizData,
  };
};
