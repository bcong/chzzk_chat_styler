# Project map
- CHZZK chat-styling userscript; `src/index.tsx` mounts the React app into the page.
- `src/App.tsx` initializes GM-backed settings and collects native chat messages; `src/Stores/MainStore` owns observable settings and messages.
- `src/Templates/ChatTemplate` coordinates native-chat visibility and selects `src/Components/OverlayChat` or `FrameChat`; settings UI is in `src/Views/Setting`.
- Vite emits `dist/userscripts.user.js`; change source and rebuild rather than editing the bundle.
- Stack: `mem:tech_stack`. Source conventions: `mem:conventions`. Commands: `mem:suggested_commands`. Completion check: `mem:task_completion`.