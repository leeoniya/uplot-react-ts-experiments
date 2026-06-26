import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Registers window/document/etc. as globals so `bun test` has a DOM,
// replacing jest's bundled jsdom environment.
GlobalRegistrator.register();

// Tell React it's running inside an act()-aware test environment.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
