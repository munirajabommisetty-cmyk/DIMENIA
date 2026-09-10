const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

if (process.platform === 'win32') {
  console.log('[setup-whisper] Windows platform detected. Skipping Linux binary setup.');
  process.exit(0);
}

const whisperDir = path.resolve(__dirname, '../models/whisper');
const targetBin = path.join(whisperDir, 'whisper-cli');

if (!fs.existsSync(whisperDir)) {
  fs.mkdirSync(whisperDir, { recursive: true });
}

const versionFile = path.join(whisperDir, 'whisper-cli.version');
const TARGET_VERSION = 'whisper-linux-static-v1.5.4';

let needsBuild = !fs.existsSync(targetBin) || !fs.existsSync(versionFile) || fs.readFileSync(versionFile, 'utf8').trim() !== TARGET_VERSION;

if (!needsBuild) {
  try {
    fs.chmodSync(targetBin, 0o755);
    execSync(`"${targetBin}" --help`, { stdio: 'ignore' });
    console.log(`[setup-whisper] Verified working whisper-cli binary (${TARGET_VERSION}) at: ${targetBin}`);
    process.exit(0);
  } catch (e) {
    console.warn('[setup-whisper] Existing whisper-cli binary failed test execution. Rebuilding...');
    needsBuild = true;
  }
}

if (needsBuild) {
  console.log('[setup-whisper] Building native Linux whisper-cli binary for Render...');
  const tmpDir = path.resolve(__dirname, '../temp_whisper_build');
  try {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });

    execSync('git clone -b v1.5.4 --single-branch https://github.com/ggerganov/whisper.cpp.git .', { cwd: tmpDir, stdio: 'inherit' });
    execSync('cmake -B build -DBUILD_SHARED_LIBS=OFF -DWHISPER_BUILD_EXAMPLES=ON -DWHISPER_OPENMP=OFF', { cwd: tmpDir, stdio: 'inherit' });
    execSync('cmake --build build --config Release', { cwd: tmpDir, stdio: 'inherit' });

    const possibleBins = [
      path.join(tmpDir, 'build/bin/whisper-cli'),
      path.join(tmpDir, 'build/bin/main')
    ];
    let builtBin = possibleBins.find(p => fs.existsSync(p));

    if (builtBin && fs.existsSync(builtBin)) {
      fs.copyFileSync(builtBin, targetBin);
      fs.chmodSync(targetBin, 0o755);
      fs.writeFileSync(versionFile, TARGET_VERSION);
      console.log(`[setup-whisper] Installed static whisper-cli (${TARGET_VERSION}) to ${targetBin}`);
    }

    execSync(`"${targetBin}" --help`, { stdio: 'ignore' });
    console.log('[setup-whisper] Successfully verified static whisper-cli binary execution!');
  } catch (err) {
    console.error('[setup-whisper] Build error:', err.message);
  } finally {
    try {
      if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}
  }
}
