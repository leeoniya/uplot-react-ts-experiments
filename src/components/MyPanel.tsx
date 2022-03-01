import React, { ReactElement, useLayoutEffect, useMemo, useRef, useState } from "react";
import { debugLog } from "../debug";
import { ToolTip } from "./Tooltip";
import { UMouse } from "./UMouse";
import { UPlotChart } from "./UPlotChart";
import { FieldType, PanelMode, prepConfig, prepData, TimeRange } from "./utils";

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

  // React hooks alternative to using { getTimeRange: () => this.props.timeRange }
  const timeRange = useRef<TimeRange>();
  timeRange.current = panelProps.timeRange;

  // propsToDiff
  const invalidateConfig = [panelProps.data.structureRev, panelProps.timeZone, panelProps.options.mode];
  const invalidateData = [...invalidateConfig, panelProps.data, panelProps.options.mode];

  const data = useMemo(() => {
    return prepData(panelProps.data.series, {
      mode: panelProps.options.mode, // some custom panel option for this vis
    });
  }, invalidateData);

  const cfg = useMemo(
    () => {
      const cfg = prepConfig({
        data,
        timeZone: panelProps.timeZone,
        get timeRange() {
          return timeRange.current;
        },
        mode: panelProps.options.mode, // some custom panel option for this vis
      });

      // prepConfig sould normally do this internally, but this shows that we can also augment here if needed
      cfg.builder.addSeries({ stroke: "red" });

      return cfg;
    },
    invalidateConfig,
  );

  let error: ReactElement | null = null;

  if (data.error) {
    error = <div>Could not prepData: {data.error}</div>;
  } else if (cfg.error) {
    error = <div>Could not prepConfig: {cfg.error}</div>;
  }

  useMemo(() => {
    if (!error) {
      cfg.withData(data);
    }
  }, invalidateData);

  const [size, setSize] = useState({ width: 800, height: 400 });

  const content = error ?? (
    <UPlotChart {...size} config={cfg} data={data.aligned}>
      {(cfg, plot) => (
        <>
          <UMouse config={cfg}>
            {(event, rect) => (
              // also rect? plot?
              // or wrap in VizTooltipContainer/popper to handle positioning w/rect logic
              <ToolTip evt={event} rect={rect} data={data} />
            )}
          </UMouse>
        </>
      )}
    </UPlotChart>
  );

  return (
    <div className="panel" style={{ overflow: "auto", resize: "both" }}>
      {content}
    </div>
  );
};
