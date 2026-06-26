# React + Bun + Typescript Starter
> Minimal starter using [Bun](https://bun.sh) for bundling, dev server (with HMR / React Fast Refresh), and testing — no Webpack, Babel, or Jest required.

* **[React](https://react.dev/)** (18.x)
* **[Bun](https://bun.sh)** as the package manager, bundler, dev server, and test runner
* **[Typescript](https://www.typescriptlang.org/)** (5.x) — transpiled by Bun, type-checked with `tsc`
* Hot Module Replacement (HMR) via Bun's dev server
* Production build + static file server, both powered by Bun
* Tests via Bun's built-in test runner + [happy-dom](https://github.com/capricorn86/happy-dom)

## Installation
1. Install [Bun](https://bun.sh) (`curl -fsSL https://bun.sh/install | bash`)
2. `bun install`

## Usage

**Development**

`bun run dev`

* Builds and serves the app with HMR @ `http://localhost:8080`

**Production**

`bun run start-prod`

* Builds the app to `/dist/` and serves it @ `http://localhost:3000`

---

**All commands**

Command | Description
--- | ---
`bun run dev` | Build + serve with HMR @ `http://localhost:8080` (alias: `bun run start`)
`bun run build` | Build app to `/dist/`
`bun run start-prod` | Build app and serve `/dist/` @ `http://localhost:3000`
`bun test` | Run tests
`bun run typecheck` | Type-check with `tsc --noEmit`

## See also
* [Bun: Full-stack dev server](https://bun.sh/docs/bundler/fullstack)
* [Bun: Test runner](https://bun.sh/docs/cli/test)
