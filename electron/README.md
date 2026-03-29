# StudyFlow Electron Notes

This folder contains the Windows-first Electron desktop shell for StudyFlow.

Key responsibilities:

- create the desktop window and tray integration
- expose a safe preload API through `window.studyflow`
- persist local data in SQLite
- sample the active foreground window on Windows
- receive browser activity from the Chrome extension over localhost

Development shape:

- `electron/main.ts`: main process and IPC registration
- `electron/preload.ts`: renderer bridge
- `electron/services/database.ts`: SQLite schema and queries
- `electron/services/tracking.ts`: active window sampling
- `electron/services/extension-bridge.ts`: localhost sync endpoint for the browser extension
