import React, { ReactElement, useMemo, useState } from "react";
import { debugLog } from "../debug";
import { ToolTip } from "./Tooltip";
import { FieldType, TimeRange } from "./types";
import { UMouse } from "./UMouse";
import { UPlotChart, UPlotChartConfig } from "./UPlotChart";
import {
  PrepCfgCtx,
  PanelMode,
  prepConfig,
  prepData,
  MyPanelConfig,
} from "./utils";

const panelProps = {
  timeZone: "UTC",
  timeRange: {
    from: 123,
    to: 456,
  } as TimeRange,
  options: {
    mode: "scatter" as PanelMode,
  },
  data: {
    structureRev: 1000,
    series: [
      {
        length: 5,
        fields: [
          {
            name: "Time",
            type: FieldType.time,
            values: [1, 2, 3, 7, 9],
          },
          {
            name: "Value",
            type: FieldType.number,
            values: [0, 10, 35, 20, 25],
          },
        ],
      },
    ],
  },
};

export const MyPanel = () => {
  debugLog("Panel()");

  // propsToDiff
  const invalidateConfig = [
    panelProps.data.structureRev,
    panelProps.timeZone,
    panelProps.options.mode,
  ];
  const invalidateData = [...invalidateConfig, panelProps.data];

  const data = useMemo(() => {
    /*
    // generic for most libs
    prepFrames(frames, opts)
      summary/stats not done in transforms
      built-in auto-transforms
      structured clone?
      filtering
      cleaning Inf, NaN, etc.
      sorting (right shape? choose /sort organize fields, coerce types, parse, clean data, detect errors)
      process dimensionsuppliers, fieldmatchers
      coercing units
      joining, field.origin setting          // is this a uPlot-ism that should be at end with stacking, negY?
      split exemplar frame from heatmap
      return {frames, joined, colorField: xFields:};
    */
    return prepData(panelProps.data.series, {
      mode: panelProps.options.mode, // some custom panel option for this vis
    });
  }, invalidateData);

  const cfgCtx: PrepCfgCtx = {
    timeRange: panelProps.timeRange,
    data,
  };

  const cfg = useMemo(() => {
    if (data.error) return;

    const cfg = prepConfig(
      {
        timeZone: panelProps.timeZone,
        mode: panelProps.options.mode, // some custom panel option for this vis
      },
      cfgCtx,
    );

    // prepConfig normally does this internally, but this shows that we can also augment here if needed
    cfg.builder.addSeries({ stroke: "red" });

    return cfg;
  }, invalidateConfig);

  let error: ReactElement | null = null;

  if (data.error) {
    error = <div>Could not prepData: {data.error}</div>;
  } else if (cfg.error) {
    error = <div>Could not prepConfig: {cfg.error}</div>;
  } else {
    cfg.setCtx(cfgCtx);
  }

  const [size, setSize] = useState({ width: 800, height: 400 });

  return (
    <div className="panel" style={{ overflow: "auto", resize: "both" }}>
      {error ?? (
        <UPlotChart {...size} config={cfg}>
          {(cfg, plot, vizData) => (
            <>
              <UMouse<MyPanelConfig> config={cfg}>
                {(event, rect) => (
                  // also rect? plot?
                  // or wrap in VizTooltipContainer/popper to handle positioning w/rect logic
                  <ToolTip
                    evt={event}
                    rect={rect}
                    data={data}
                    vizData={vizData}
                  />
                )}
              </UMouse>
            </>
          )}
        </UPlotChart>
      )}
    </div>
  );
};
