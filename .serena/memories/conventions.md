# Source conventions
- Use function React components; wrap components that read MobX state in `observer`.
- Access shared application state via `useMainStore` from `src/Stores`; source aliases such as `@Components` and `@Stores` are configured in `vite.config.ts`.
- Add setting keys to `T_SETTING` in `src/@types/index.d.ts` and defaults in `MainStore`; persist user changes through `mainStore.setSetting(key, value, true)`.
- Component styles use Less CSS modules (`style.module.less`). Follow the neighboring file's formatting.