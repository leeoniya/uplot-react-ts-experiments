import React, { useState } from "react";
import uPlot, { AlignedData } from "uplot";
import { debugLog } from "../debug";
import { OptsDimless, UPlotReact } from "./UPlotReact";

const data0: AlignedData = [
  [1, 2],
  [3, 4],
];

const data1: AlignedData = [
  [1, 2, 3],
  [0, 1, 0],
];

const opts0: OptsDimless = {
  scales: {
    x: {
      time: false,
    },
  },
  series: [
    {},
    {
      width: 1,
      stroke: "red",
    },
  ],
};

const opts1: OptsDimless = {
  scales: {
    x: {
      time: false,
    },
  },
  series: [
    {},
    {
      width: 3,
      stroke: "green",
    },
  ],
};

const size0 = { width: 800, height: 400 };

const size1 = { width: 400, height: 200 };

export const Panel0 = () => {
  debugLog("Panel0()");

  const [data, setData] = useState<AlignedData>(data0);
  const [size, setSize] = useState(size0);
  const [opts, setOpts] = useState<OptsDimless>(opts0);
  const [mounted, setMounted] = useState(true);

  const oninit = (plot: uPlot) => {
    debugLog("oninit()", plot);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          console.clear();
          setMounted(!mounted);
        }}
      >
        Mount/Dismount
      </button>
      <button
        type="button"
        onClick={() => {
          console.clear();
          setSize(size === size0 ? size1 : size0);
        }}
      >
        Resize
      </button>
      <button
        type="button"
        onClick={() => {
          console.clear();
          setOpts(opts === opts0 ? opts1 : opts0);
        }}
      >
        New opts
      </button>
      <button
        type="button"
        onClick={() => {
          console.clear();
          setData(data === data0 ? data1 : data0);
        }}
      >
        Data
      </button>

      {mounted && (
        <UPlotReact
          width={size.width}
          height={size.height}
          data={data}
          opts={opts}
          oninit={oninit}
        />
      )}
    </>
  );
};
