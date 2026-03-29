const { mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const distElectronDir = join(process.cwd(), "dist-electron");
const runtimeDir = join(distElectronDir, "electron");

mkdirSync(distElectronDir, { recursive: true });
mkdirSync(runtimeDir, { recursive: true });

const commonJsPackage = JSON.stringify({ type: "commonjs" }, null, 2);

writeFileSync(join(distElectronDir, "package.json"), commonJsPackage);
writeFileSync(join(runtimeDir, "package.json"), commonJsPackage);
