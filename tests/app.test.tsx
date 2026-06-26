import { afterEach, expect, test } from "bun:test";
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { prepData } from "../src/components/utils";
import { FieldType } from "../src/components/types";

test("prepData passes frames through with no error", () => {
  const frames = [
    {
      length: 1,
      fields: [{ name: "Time", type: FieldType.time, values: [1] }],
    },
  ];

  const result = prepData(frames, { mode: "scatter" });

  expect(result.error).toBeNull();
  expect(result.frames).toBe(frames);
});

let root: Root | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

test("renders a React component into the happy-dom document", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const Hello = () => <span>Hello World!</span>;

  act(() => {
    root = createRoot(container);
    root.render(<Hello />);
  });

  expect(container.textContent).toBe("Hello World!");
});
