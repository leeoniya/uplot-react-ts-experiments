## uPlot-Based Panels In Grafana

This document aims to be an architectural overview and general guide for how panels based on uPlot should be structured.

---
### What is uPlot?

uPlot is a JavaScript charting library based on Canvas2D (in contrast to SVG). It has an imperative API focused on maximizing rendering performance for large timeseries datasets and on reducing UI interaction latency. Currently, the following core panels use it for visualization:

- TimeSeries
- Stat (sparkline)
- BarChart
- Histogram
- Heatmap
- XYChart
- StateTimeline
- StatusHistory
- BoxPlot
- Candlestick

---
### uPlot API Basics

```jsx
const opts = {
  width: 600,
  height: 300,
  series: [
    {},                 // x series 0 opts
    { stroke: 'red' },  // y series 1 opts
    { stroke: 'blue' }, // y series 2 opts
  ],
};

// (null is used to represent gaps in data)
const data = [
  [1640995200, 1640998800, 1641002400], // x series 0 timestamps
  [       100,        125,        200], // y series 1 values
  [        25,       null,         49], // y series 2 values
];

const container = document.getElementById('chart-wrapper');

const plot = new uPlot(opts, data, container);

// we can swap in new data at a later time
plot.setData([
  [1640995200, 1640998800, 1641002400],
  [       100,        125,        200],
  [        25,       null,         49],
]);

// or resize the plot
plot.setSize({ width: 800, height: 400 });

// or remove & clean up
plot.destroy();
plot = null;
```

---
### UPlotReact.tsx

In Grafana, we destroy and re-initialize the uPlot instance whenever options change that are not covered by `plot.setData()` and `plot.setSize()`. While uPlot has some additional methods such as `plot.addSeries()`, they are not used to simplify integration and change tracking; most of the time, options tend to be static and even a full re-init is extremely fast when they must change during panel editing or occasional data structure changes.

```jsx
<UPlotReact width={width} height={height} opts={opts} data={data} oninit={getInstance} />
```

`<UPlotReact>` is a minimal React wrapper for uPlot that implements these semantics for the raw API shown above. The optional `oninit` prop accepts a callback in the form of `const getInstance = (plot: uPlot | null) => {};`. This callback is invoked with the new `plot` instance whenever the underlying plot is re-initialized or with `null` when the component is unmounted and the plot is destroyed without re-creation. `oninit` can be used to populate a React context, call a `setState()` a parent component, etc.

**IMPORTANT:** To avoid excessive `plot.setData()` and `plot.destroy()` calls, it is important to maintain referential integrity of `data` and `opts` when they do not actually change. Some ways to avoid this is by using `useMemo()`, `useState()`, or `useRef()` hooks. A common React pattern that can destroy performance is copying or spreading these props into new objects on every re-render, e.g. `<UPlotReact width={width} height={height} opts={{...opts}} data={[...data]}>`.

---
### UPlotOptsBuilder.ts

Rather than building raw uPlot opts directly, Grafana uses the `UPlotOptsBuilder` class to make option assembly more fluent, type-safe, and to apply automatic defaults in cases of insufficient or invalid option combinations; raw uPlot does not provide any safeguards, validation, or error messages around its API.

```jsx
const builder = new UPlotOptsBuilder();

builder.addAxis({
  scale: 'usd',
  space: 200,
});

const opts = builder.build();
```

---
### UPlotChart.tsx

`<UPlotChart>` is a [HOC](https://reactjs.org/docs/higher-order-components.html) wrapper around `<UPlotReact>` with a [`children()` render prop](https://reactjs.org/docs/render-props.html#using-props-other-than-render). Rather than accepting a raw uPlot `opts` prop, it accepts a work-in-progress, partially-built `UPlotOptsBuilder` within a `config` prop. It passes this `builder` down to child components/plugins which can then augment it prior to final `<UPlotReact>` init; the order in which this must happen is orchestrated by `<UPlotChart>`.

```jsx
// should parse, filter, transform, and aggregate the raw data as necessary for the viz, tooltip and legend
function prepData(opts) {
  const { frames } = opts;

  return {
    frames,
    data: {},
  }
}

function prepConfig(opts, builder?) {
  builder = builder ?? new UPlotOptsBuilder();

  let data = null;

  // use builder to assemble uPlot opts from passed-in panel opts, initial data, etc.
  builder.addScale('y', {});
  builder.addHook('draw', () => {
    console.log('draw extra stuff', data);
  });

  return {
    // exposes raw opts builder so it can be further augmented if necessary
    builder,
    // wrapper that caches prepped data into local scope to keep it current with panel data re-queries
    prepData: (...args) => (data = prepData(...args)),

    // plus any additional helpful APIs
    getQuadtree() {}
  };
}

const UPluginA = ({config, data, plot}) => {
  if (plot == null) {
    config.builder.addHook('setCursor', plot => {
      console.log('mousemove left:' + plot.cursor.left);
    });
  }

  // UPlotChart plugins are typically:
  // 1. render-less
  // 2. or render into a portal
  // 3. or manually modify and manage uPlot's DOM
  return null;
};

const { frames, mode, timeZone, theme } = props;

const config = useMemo(prepConfig({
  frames,
  mode,
  timeZone,
  theme
}), [mode, timeZone, theme]);

const data = useMemo(() => {
  return cfg.prepData({
    frames: panelProps.data.series,
  });
}, [cfg, panelProps.data]);

<UPlotChart width={width} height={height} config={config} data={data}>
  {(config, plot) => (
    <>
      <UPluginA plot={plot} config={config} data={data} />
    </>
  )}
</UPlotChart>
```

<!--
Some things worth noting that are specific to Grafana's default opts vs native uPlot:
  - uPlot's legend is always disabled via `opts.legend.show = false` since Grafana uses its own legend components that differ in location based on panel layout and can vary in implementation per panel type.
  - The "x" scale range is always matched to the dashboard or panel `timeRange` rather than the supplied data extents: `opts.scales.x.range = () => [timeRange.from, timeRange.to]`. All "zooming" is done by re-querying the datasource for the selected `timeRange` and invoking `plot.setData()` with the reponse data.
-->