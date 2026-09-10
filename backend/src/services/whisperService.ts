import path from 'path';
import fs from 'fs';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export const whisperService = {
  getExecutablePath(): string | null {
    const isWindows = process.platform === 'win32';

    const winCandidates = [
      path.resolve(process.cwd(), 'models/whisper/whisper-cli.exe'),
      path.resolve(process.cwd(), 'backend/models/whisper/whisper-cli.exe'),
      path.resolve(__dirname, '../../models/whisper/whisper-cli.exe'),
      path.resolve(__dirname, '../../../models/whisper/whisper-cli.exe'),
      path.resolve(process.cwd(), 'models/whisper/main.exe'),
      path.resolve(process.cwd(), 'backend/models/whisper/main.exe')
    ];

    const unixCandidates = [
      path.resolve(process.cwd(), 'models/whisper/whisper-cli'),
      path.resolve(process.cwd(), 'backend/models/whisper/whisper-cli'),
      path.resolve(__dirname, '../../models/whisper/whisper-cli'),
      path.resolve(__dirname, '../../../models/whisper/whisper-cli'),
      path.resolve(process.cwd(), 'models/whisper/main'),
      path.resolve(process.cwd(), 'backend/models/whisper/main'),
      path.resolve(__dirname, '../../models/whisper/main'),
      path.resolve(__dirname, '../../../models/whisper/main')
    ];

    // On Windows, check .exe candidates first. On Linux/macOS, evaluate ONLY Unix binaries (ignore .exe files).
    const candidates = isWindows
      ? [...winCandidates, ...unixCandidates]
      : [...unixCandidates];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        if (!isWindows) {
          try {
            fs.chmodSync(p, 0o755);
          } catch (e) {
            console.warn(`[STT] Could not set executable permissions on ${p}:`, e);
          }
        }
        return p;
      }
    }
    return null;
  },

  getModelPath(): string | null {
    const candidates = [
      path.resolve(process.cwd(), 'models/whisper/ggml-tiny.bin'),
      path.resolve(process.cwd(), 'backend/models/whisper/ggml-tiny.bin'),
      path.resolve(__dirname, '../../models/whisper/ggml-tiny.bin'),
      path.resolve(__dirname, '../../../models/whisper/ggml-tiny.bin')
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return null;
  },

  ensureDirExists() {
    const tempDir = path.resolve(process.cwd(), 'backend/temp');
    if (!fs.existsSync(tempDir)) {
      try {
        fs.mkdirSync(tempDir, { recursive: true });
      } catch (e) {
        // Fall back to os.tmpdir() if creation fails
      }
    }
  },

  async transcribe(
    audioBuffer: Buffer,
    language?: string
  ): Promise<string> {
    console.log('[STT] ========================================');
    console.log('[STT] Local Hugging Face / GGML Whisper Offline STT');
    console.log('[STT] ========================================');
    console.log(`[STT] OS Platform: ${process.platform}`);
    console.log(`[STT] Audio Buffer size: ${audioBuffer.length} bytes`);
    console.log(`[STT] Requested language: ${language || 'en'}`);

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('No audio data received.');
    }

    const exePath = this.getExecutablePath();
    const modelPath = this.getModelPath();

    console.log(`[STT] Whisper Executable: ${exePath || 'NOT FOUND'}`);
    console.log(`[STT] Whisper Model: ${modelPath || 'NOT FOUND'}`);
    console.log(`[STT] Executable Exists: ${exePath ? fs.existsSync(exePath) : false}`);
    console.log(`[STT] Model Exists: ${modelPath ? fs.existsSync(modelPath) : false}`);
    if (exePath && process.platform !== 'win32') {
      const libPath = path.join(path.dirname(exePath), 'libwhisper.so');
      console.log(`[STT] Shared Library libwhisper.so Exists: ${fs.existsSync(libPath)}`);
    }

    if (!exePath || !modelPath) {
      console.error('[STT] Local Whisper CLI executable or model binary missing.', { exePath, modelPath, platform: process.platform });
      throw new Error('Local Whisper model or executable is missing in the backend/models/whisper folder.');
    }

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tempDir = fs.existsSync(path.resolve(process.cwd(), 'backend/temp')) 
      ? path.resolve(process.cwd(), 'backend/temp') 
      : os.tmpdir();
    
    const tempWavPath = path.join(tempDir, `whisper_${uniqueId}.wav`);
    const tempTxtPath = `${tempWavPath}.txt`;

    try {
      fs.writeFileSync(tempWavPath, audioBuffer);
      console.log(`[STT] Saved temporary audio WAV file: ${tempWavPath}`);

      const langFlag = language || 'en';
      const args = [
        '-m', modelPath,
        '-f', tempWavPath,
        '-l', langFlag,
        '--output-txt',
        '--no-timestamps',
        '-t', '4'
      ];

      console.log(`[STT] Executing local Whisper CLI: "${exePath}" ${args.join(' ')}`);

      const exeDir = path.dirname(exePath);
      const ldLibraryPath = [
        exeDir,
        '/usr/local/lib',
        '/usr/lib',
        process.env.LD_LIBRARY_PATH || ''
      ].filter(Boolean).join(':');

      const { stdout } = await execFileAsync(exePath, args, {
        cwd: exeDir,
        timeout: 25000,
        env: {
          ...process.env,
          LD_LIBRARY_PATH: ldLibraryPath
        }
      });

      let transcript = '';
      if (fs.existsSync(tempTxtPath)) {
        transcript = fs.readFileSync(tempTxtPath, 'utf8').trim();
      } else if (stdout && stdout.trim().length > 0) {
        // Parse brackets or raw stdout text if txt file wasn't generated
        const lines = stdout.split('\n');
        const textLines = lines
          .map(l => l.replace(/\[\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}\]\s*/g, '').trim())
          .filter(l => l.length > 0 && !l.startsWith('whisper_') && !l.startsWith('system_info') && !l.startsWith('read_audio_data'));
        transcript = textLines.join(' ').trim();
      }

      console.log(`[STT] Offline Whisper transcript output: "${transcript}"`);
      
      if (!transcript) {
        console.warn('[STT] Whisper output was empty or silent audio.');
        throw new Error('Speech transcription produced empty result. Please speak louder.');
      }

      return transcript;
    } catch (error: any) {
      console.error('[STT] Local Whisper CLI execution failed:', error);
      throw error instanceof Error ? error : new Error('Speech transcription failed locally.');
    } finally {
      try {
        if (fs.existsSync(tempWavPath)) fs.unlinkSync(tempWavPath);
        if (fs.existsSync(tempTxtPath)) fs.unlinkSync(tempTxtPath);
      } catch (e) {
        // Silently ignore cleanup errors
      }
    }
  }
};
