const fs = require('fs');
const path = require('path');

if (process.platform === 'win32') {
  console.log('[setup-whisper] Windows platform detected. Skipping Linux binary setup.');
  process.exit(0);
}

const targetBin = path.resolve(__dirname, '../models/whisper/whisper-cli');

if (fs.existsSync(targetBin)) {
  console.log(`[setup-whisper] Preserving Stage 1 static whisper-cli binary at: ${targetBin}`);
  try {
    fs.chmodSync(targetBin, 0o755);
  } catch (e) {}
  process.exit(0);
}

console.log('[setup-whisper] Linux whisper-cli binary absent.');
