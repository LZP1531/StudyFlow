const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const extensionDir = path.join(rootDir, "chrome-extension");
const outputDir = path.join(extensionDir, "dist");
const browserProfilesPath = path.join(extensionDir, "browser-profiles.json");
const manifestTemplatePath = path.join(extensionDir, "manifest.template.json");
const workerTemplatePath = path.join(extensionDir, "service-worker.template.js");

const browserProfiles = JSON.parse(fs.readFileSync(browserProfilesPath, "utf8"));
const manifestTemplate = JSON.parse(fs.readFileSync(manifestTemplatePath, "utf8"));
const workerTemplate = fs.readFileSync(workerTemplatePath, "utf8");

fs.mkdirSync(outputDir, { recursive: true });

for (const profile of browserProfiles) {
  const profileDir = path.join(outputDir, profile.id);
  fs.mkdirSync(profileDir, { recursive: true });

  const manifest = {
    ...manifestTemplate,
    name: profile.extensionName,
    action: {
      ...manifestTemplate.action,
      default_title: profile.extensionName,
    },
  };

  if (profile.browserSpecificSettings) {
    manifest.browser_specific_settings = profile.browserSpecificSettings;
  }

  const serviceWorker = workerTemplate
    .replaceAll("__BROWSER_ID__", profile.id)
    .replaceAll("__BROWSER_NAME__", profile.displayName);

  fs.writeFileSync(path.join(profileDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(profileDir, "service-worker.js"), serviceWorker);
}

console.log(`Built ${browserProfiles.length} browser extension bundles in ${outputDir}`);
