const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

if (process.platform === 'win32') {
  console.log('[setup-whisper] Windows platform detected. Skipping Linux binary setup.');
  process.exit(0);
}

const targetBin = path.resolve(__dirname, '../models/whisper/whisper-cli');

if (fs.existsSync(targetBin)) {
  console.log(`[setup-whisper] Preserving existing Linux whisper-cli binary at: ${targetBin}`);
  try {
    fs.chmodSync(targetBin, 0o755);
  } catch (e) {}
  process.exit(0);
}

console.log('[setup-whisper] Linux whisper-cli binary missing. Attempting static compilation...');

let hasGit = false;
let hasCmake = false;
try {
  execSync('git --version', { stdio: 'ignore' });
  hasGit = true;
} catch (e) {}
try {
  execSync('cmake --version', { stdio: 'ignore' });
  hasCmake = true;
} catch (e) {}

if (!hasGit || !hasCmake) {
  console.warn('[setup-whisper] Warning: git or cmake missing on host. Skipping compilation.');
  process.exit(0);
}

const tmpDir = path.join(os.tmpdir(), `whisper_build_${Date.now()}`);
fs.mkdirSync(tmpDir, { recursive: true });

try {
  execSync(`git clone -b v1.5.4 --single-branch https://github.com/ggerganov/whisper.cpp.git .`, { cwd: tmpDir, stdio: 'inherit' });
  execSync(`cmake -B build-static -DBUILD_SHARED_LIBS=OFF -DWHISPER_BUILD_EXAMPLES=ON`, { cwd: tmpDir, stdio: 'inherit' });
  execSync(`cmake --build build-static --config Release`, { cwd: tmpDir, stdio: 'inherit' });

  const candidates = [
    path.join(tmpDir, 'build-static/bin/whisper-cli'),
    path.join(tmpDir, 'build-static/bin/main'),
    path.join(tmpDir, 'build-static/examples/main/main'),
    path.join(tmpDir, 'build-static/main')
  ];

  let compiledPath = null;
  for (const cand of candidates) {
    if (fs.existsSync(cand)) {
      compiledPath = cand;
      break;
    }
  }

  if (compiledPath && fs.existsSync(compiledPath)) {
    const destDir = path.dirname(targetBin);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(compiledPath, targetBin);
    fs.chmodSync(targetBin, 0o755);
    console.log(`[setup-whisper] Successfully installed static binary at ${targetBin}`);
  }
} catch (err) {
  console.error('[setup-whisper] Linux Whisper build failed:', err.message);
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {}
}
