# Tech stack
- TypeScript, React 18, MobX 6 / mobx-react-lite, Vite 5, `vite-plugin-monkey`, Less CSS modules.
- Yarn lockfile and Yarn project configuration; dependencies are already present in `node_modules`.
- Browser userscript uses Tampermonkey GM APIs; Vite bundles `src/index.tsx` as `dist/userscripts.user.js`.
- Package scripts do not define a test, lint, or typecheck command; production build is the available project check.