# StudyFlow Browser Extensions

This folder contains the source templates and browser profiles for StudyFlow's local browser companion extensions.

## Supported browsers

- Google Chrome
- Microsoft Edge
- Brave
- Mozilla Firefox
- Opera
- Vivaldi
- Arc
- Lenovo Browser

## Build unpacked extensions

Run:

```bash
npm run build:extensions
```

Generated unpacked extension folders will be written to:

- `chrome-extension/dist/chrome`
- `chrome-extension/dist/edge`
- `chrome-extension/dist/brave`
- `chrome-extension/dist/firefox`
- `chrome-extension/dist/opera`
- `chrome-extension/dist/vivaldi`
- `chrome-extension/dist/arc`
- `chrome-extension/dist/lenovo`

Then load the matching folder in the browser's extension developer mode.

## Add another browser

1. Open `chrome-extension/browser-profiles.json`
2. Add a new browser profile with:
   - `id`
   - `displayName`
   - `extensionName`
   - `appAliases`
3. Run `npm run build:extensions` again

`appAliases` should include the foreground window name and/or executable name that `active-win` reports on Windows.
