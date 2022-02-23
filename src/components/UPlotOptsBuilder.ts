import { OptsDimless } from "./UPlotReact";
import { Options, Series } from "uplot";

type HookTypes = keyof uPlot.Hooks.Defs;

export class UPlotOptsBuilder {
  opts: Partial<Options> = {
    hooks: {},
    scales: {
      x: {
        time: false,
      },
    },
    series: [{}],
  };

  // type if keyof Options.
  addHook(type: HookTypes, handler: Function) {
    const hooks = (this.opts.hooks = this.opts.hooks ?? {});
    (hooks[type] = hooks[type] ?? []).push(handler);
  }

  // type if keyof Options.
  addSeries(opts: Series) {
    (this.opts.series = this.opts.series ?? []).push(opts);
  }

  getOpts(): OptsDimless {
    return {
      ...this.opts,
      series: this.opts.series ?? [],
    };
  }
}
