const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const versionInfoPath = path.join(__dirname, '../version-info.json');

function bumpVersion() {
  try {
    // 1. Read package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentPkgVersion = packageJson.version;

    // 2. Read or Create version-info.json
    let versionInfo = { current: currentPkgVersion, last: "0.0.0" };
    if (fs.existsSync(versionInfoPath)) {
      try {
        versionInfo = JSON.parse(fs.readFileSync(versionInfoPath, 'utf8'));
      } catch (e) {
        console.warn("Could not parse version-info.json, resetting.");
      }
    }

    // 3. Update 'last' to 'current' before bumping
    versionInfo.last = currentPkgVersion;

    // 4. Increment Version (Patch bump)
    const parts = currentPkgVersion.split('.');
    if (parts.length === 3) {
      parts[2] = parseInt(parts[2], 10) + 1;
    } else {
      parts.push('1');
    }
    const nextVersion = parts.join('.');

    // 5. Update structures
    versionInfo.current = nextVersion;
    versionInfo.updatedAt = new Date().toISOString();
    packageJson.version = nextVersion;

    // 6. Save package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated package.json version: ${currentPkgVersion} -> ${nextVersion}`);

    // 7. Save version-info.json
    fs.writeFileSync(versionInfoPath, JSON.stringify(versionInfo, null, 2));
    console.log(`Updated version-info.json (Last: ${versionInfo.last}, Current: ${versionInfo.current})`);

  } catch (err) {
    console.error("Error bumping version:", err);
    process.exit(1);
  }
}

bumpVersion();
