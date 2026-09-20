# Build setup

This project is configured for TypeScript + Vite + React.

Required type packages are declared in `devDependencies`:
- `vite` provides `vite/client` typings.
- `@types/node` provides Node.js typings.

`tsconfig.app.json` includes `types: ["vite/client"]` and `tsconfig.node.json` includes `types: ["node"]`.

For a clean deployment, the hosting service should run `npm install` (or its normal dependency installation) before `npm run build`.

Build command: `npm run build`
Publish directory: `dist`
