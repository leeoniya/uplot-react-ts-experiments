// context (perf test)
// uPlot instance
// getBoundingClientRect()

// General setup from panel opts
// Zoom plugin (fetch data for X range)
// Tooltip (with data links?)
// Legend
// Annotations plugin (with popovers?)
// Thresholds plugin

import { useLayoutEffect, useRef, useState } from "react";
import uPlot from "uplot";
import { debugLog } from "../debug";
import { UPlotChartConfig, UPlotChartEvent } from "./UPlotChart";

interface UMouseProps {
  config: UPlotChartConfig;
  children: (
    evt: UPlotChartEvent | null,
    rect: DOMRect | null,
  ) => React.ReactElement;
  //plot: uPlot | null;
  //coords: { x: number; y: number };
}

//export const UMouse: UPlotChartPlugin =
export const UMouse = ({ config, children }: UMouseProps) => {
  debugLog("UMouse()");

  const [evt, setEvt] = useState<UPlotChartEvent | null>(null);
  const rect = useRef<DOMRect | null>(null);

  useLayoutEffect(() => {
    //debugLog("UMouse.useLayoutEffect()");

    config.on("move", (evt: UPlotChartEvent) => {
      setEvt(evt);
    });

    config.builder.addHook("syncRect", (u: uPlot, newRecr: DOMRect) => {
      rect.current = newRecr;
    });

    return () => {
      //debugLog('UMouse.cfg.offevent');
    };
  }, [config]);

  return children(evt, rect.current);
};
