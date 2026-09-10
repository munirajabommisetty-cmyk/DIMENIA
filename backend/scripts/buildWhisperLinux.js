const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

if (process.platform === 'win32') {
  console.log('[setup-whisper] Windows platform detected. Skipping Linux binary setup.');
  process.exit(0);
}

const targetBin = path.resolve(__dirname, '../models/whisper/whisper-cli');

// Check if existing binary runs cleanly without dynamic library errors
if (fs.existsSync(targetBin)) {
  try {
    const testOut = execSync(`"${targetBin}" --help`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    if (testOut && (testOut.includes('usage:') || testOut.includes('options:') || testOut.includes('whisper'))) {
      console.log(`[setup-whisper] Valid working Linux whisper-cli binary present at: ${targetBin}`);
      process.exit(0);
    }
  } catch (e) {
    console.log(`[setup-whisper] Existing binary at ${targetBin} failed execution test (${e.message ? e.message.split('\n')[0] : 'error'}). Removing invalid binary...`);
    try {
      fs.unlinkSync(targetBin);
    } catch (err) {}
  }
}

console.log('[setup-whisper] Compiling 100% self-contained Linux whisper-cli binary using g++...');
const tmpDir = path.join(os.tmpdir(), `whisper_build_${Date.now()}`);
fs.mkdirSync(tmpDir, { recursive: true });

try {
  // Clone pinned whisper.cpp release v1.5.4
  execSync(`git clone -b v1.5.4 --single-branch https://github.com/ggerganov/whisper.cpp.git .`, { cwd: tmpDir, stdio: 'inherit' });

  // Determine main example source file
  const mainCpp = fs.existsSync(path.join(tmpDir, 'examples/main/main.cpp')) 
    ? 'examples/main/main.cpp' 
    : (fs.existsSync(path.join(tmpDir, 'examples/cli/cli.cpp')) ? 'examples/cli/cli.cpp' : 'examples/main/main.cpp');

  console.log(`[setup-whisper] Compiling static binary with g++ using ${mainCpp}...`);
  execSync(`g++ -O3 -std=c++11 -I. -I./examples ggml.c whisper.cpp ${mainCpp} -lpthread -lm -o whisper-cli`, { cwd: tmpDir, stdio: 'inherit' });

  const compiledBin = path.join(tmpDir, 'whisper-cli');
  if (fs.existsSync(compiledBin)) {
    const destDir = path.dirname(targetBin);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(compiledBin, targetBin);
    fs.chmodSync(targetBin, 0o755);
    console.log(`[setup-whisper] Successfully compiled and installed self-contained static binary at ${targetBin}`);
  } else {
    console.error('[setup-whisper] g++ compilation completed but output file not found.');
  }
} catch (err) {
  console.error('[setup-whisper] Direct g++ compilation failed:', err.message);
  // Fallback to cmake if g++ direct compilation had unexpected errors
  try {
    console.log('[setup-whisper] Attempting cmake fallback build...');
    execSync(`cmake -B build-static -DBUILD_SHARED_LIBS=OFF -DWHISPER_BUILD_EXAMPLES=ON`, { cwd: tmpDir, stdio: 'inherit' });
    execSync(`cmake --build build-static --config Release`, { cwd: tmpDir, stdio: 'inherit' });
    const findRes = execSync(`find "${tmpDir}/build-static" -name "main" -o -name "whisper-cli"`, { encoding: 'utf8' });
    const compiledPath = findRes.trim().split('\n')[0];
    if (compiledPath && fs.existsSync(compiledPath)) {
      const destDir = path.dirname(targetBin);
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(compiledPath, targetBin);
      fs.chmodSync(targetBin, 0o755);
      console.log(`[setup-whisper] Successfully installed cmake static binary at ${targetBin}`);
    }
  } catch (cmakeErr) {
    console.error('[setup-whisper] CMake fallback also failed:', cmakeErr.message);
  }
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (e) {}
}
