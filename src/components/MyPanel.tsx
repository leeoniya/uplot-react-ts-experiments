import React, { useMemo, useRef } from "react";
import { debugLog } from "../debug";
import { ToolTip } from "./Tooltip";
import { UMouse } from "./UMouse";
import { UPlotChart } from "./UPlotChart";
import { FieldType, PanelMode, prepConfig, TimeRange } from "./utils";

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

  const cfg = useMemo(
    () => {
      const cfg = prepConfig({
        frames: panelProps.data.series,
        timeZone: panelProps.timeZone,
        get timeRange() {
          return timeRange.current;
        },
        mode: panelProps.options.mode, // some custom panel option for this vis
      });

      // validation failed, barf!
      // if (cfg.error) {
      //   throw "bad data!";
      // }

      // prepConfig sould normally do this internally, but this shows that we can also augment here if needed
      cfg.builder.addSeries({ stroke: "red" });

      return cfg;
    },
    // addl propsToDiff checks should go here
    [panelProps.data.structureRev, panelProps.timeZone],
  );

  const data = useMemo(() => {
    return cfg.prepData({
      frames: panelProps.data.series,
    });
  }, [cfg, panelProps.data]);

  const size = useMemo(() => ({ width: 800, height: 400 }), []);

  return (
    <div className="panel" style={{ overflow: "auto", resize: "both" }}>
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
    </div>
  );
};
