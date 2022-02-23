import React from "react";
import ReactDOM from "react-dom";
import { debugLog } from "../debug";
import { UPlotChartEvent } from "./UPlotChart";
import { MyPanelData } from "./utils";

interface ToolTipProps {
  evt: UPlotChartEvent | null;
  rect: DOMRect;
  data: MyPanelData;
}

// can wrap in <VizTooltipContainer> or <Popper> and leave ToolTip just responsible for content?
// wrapper can offset coords by uplot's rect?
// rect and data can come from uplot ctx?
export const ToolTip = ({ evt, rect, data }: ToolTipProps) => {
  debugLog("ToolTip()");

  if (data && evt && evt.x >= 0) {
    const left = Math.round(rect.left + evt.x);
    const top = Math.round(rect.top + evt.y);

    return ReactDOM.createPortal(
      <div
        style={{
          position: "absolute",
          pointerEvents: "none",
          backgroundColor: "pink",
          left,
          top,
        }}
      >
        <table>
          <tr>
            <th>seriesIdx</th>
            <th>dataIdx</th>
          </tr>
          {evt.dataIdxs.map((dataIdx: number, seriesIdx: number) => (
            <tr key={seriesIdx}>
              <td>{seriesIdx}</td>
              <td>
                {dataIdx == null ? "--" : data.aligned[seriesIdx][dataIdx]}
              </td>
            </tr>
          ))}
        </table>
      </div>,
      document.body,
    );
  }

  return null;
};
