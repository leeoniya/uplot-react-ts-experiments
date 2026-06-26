import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";

const rootEl = document.getElementById("root");

if (rootEl == null) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(<App />);
