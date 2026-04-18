const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const extensionDir = path.join(rootDir, "chrome-extension");
const outputDir = path.join(extensionDir, "dist");
const browserProfilesPath = path.join(extensionDir, "browser-profiles.json");
const manifestTemplatePath = path.join(extensionDir, "manifest.template.json");
const workerTemplatePath = path.join(extensionDir, "service-worker.template.js");

const browserProfiles = JSON.parse(fs.readFileSync(browserProfilesPath, "utf8"));
const manifestTemplate = fs.readFileSync(manifestTemplatePath, "utf8");
const workerTemplate = fs.readFileSync(workerTemplatePath, "utf8");

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const profile of browserProfiles) {
  const profileDir = path.join(outputDir, profile.id);
  fs.mkdirSync(profileDir, { recursive: true });

  const manifest = manifestTemplate.replaceAll("__EXTENSION_NAME__", profile.extensionName);
  const serviceWorker = workerTemplate
    .replaceAll("__BROWSER_ID__", profile.id)
    .replaceAll("__BROWSER_NAME__", profile.displayName);

  fs.writeFileSync(path.join(profileDir, "manifest.json"), manifest);
  fs.writeFileSync(path.join(profileDir, "service-worker.js"), serviceWorker);
}

console.log(`Built ${browserProfiles.length} browser extension bundles in ${outputDir}`);
