import * as React from "react";

import "uplot/dist/uPlot.min.css";
import { debugLog } from "../debug";
import { MyPanel } from "./MyPanel";
import { Panel0 } from "./Panel0";

const App = () => {
  debugLog("App()");

  return (
    <div id="app">
      <Panel0></Panel0>
      <MyPanel></MyPanel>
    </div>
  );
};

export default App;
