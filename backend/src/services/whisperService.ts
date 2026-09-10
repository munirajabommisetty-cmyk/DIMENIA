import path from 'path';
import fs from 'fs';
import os from 'os';
import { execFile, exec } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);

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
      const exeDir = path.dirname(exePath);
      const neededLibs = ['libwhisper.so', 'libwhisper.so.1', 'libwhisper.so.1.5.4'];
      for (const libName of neededLibs) {
        const libPath = path.join(exeDir, libName);
        if (!fs.existsSync(libPath)) {
          try {
            const files = fs.readdirSync(exeDir);
            for (const file of files) {
              if (file.includes('.so')) {
                const srcPath = path.join(exeDir, file);
                fs.copyFileSync(srcPath, libPath);
                fs.chmodSync(libPath, 0o755);
                console.log(`[STT] Created ${libPath} from ${srcPath}`);
                break;
              }
            }
          } catch (e) {
            console.warn(`[STT] Failed to create ${libName} fallback:`, e);
          }
        }
      }
    }

    if (!exePath || !modelPath) {
      console.error('[STT] Local Whisper CLI executable or model binary missing.', { exePath, modelPath, platform: process.platform });
      throw new Error('Local Whisper model or executable is missing in the backend/models/whisper folder.');
    }

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tempDir = fs.existsSync(path.resolve(process.cwd(), 'backend/temp')) 
      ? path.resolve(process.cwd(), 'backend/temp') 
      : os.tmpdir();
    
    const outputPrefix = path.join(tempDir, `whisper_${uniqueId}`);
    const tempWavPath = `${outputPrefix}.wav`;
    const candidateTxtPaths = [
      `${outputPrefix}.txt`,
      `${tempWavPath}.txt`,
      path.join(tempDir, `whisper_${uniqueId}.txt`),
      path.join(tempDir, `whisper_${uniqueId}.wav.txt`),
      path.join(path.dirname(exePath), `whisper_${uniqueId}.txt`),
      path.join(path.dirname(exePath), `whisper_${uniqueId}.wav.txt`),
      path.join(process.cwd(), `whisper_${uniqueId}.txt`),
      path.join(process.cwd(), `whisper_${uniqueId}.wav.txt`)
    ];

    try {
      fs.writeFileSync(tempWavPath, audioBuffer);
      console.log(`[STT] Saved temporary audio WAV file: ${tempWavPath} (${audioBuffer.length} bytes)`);

      const langFlag = language || 'en';
      const args = [
        '-m', modelPath,
        '-f', tempWavPath,
        '-l', langFlag,
        '-of', outputPrefix,
        '-otxt',
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

      let stdout = '';
      let stderr = '';
      if (process.platform === 'win32') {
        const res = await execFileAsync(exePath, args, {
          cwd: exeDir,
          timeout: 25000,
          env: {
            ...process.env,
            LD_LIBRARY_PATH: ldLibraryPath
          }
        });
        stdout = res.stdout || '';
        stderr = res.stderr || '';
      } else {
        const shellCmd = `LD_LIBRARY_PATH="${ldLibraryPath}" "${exePath}" ${args.join(' ')}`;
        console.log(`[STT] Shell execution command: ${shellCmd}`);
        const res = await execAsync(shellCmd, {
          cwd: exeDir,
          timeout: 25000,
          env: {
            ...process.env,
            LD_LIBRARY_PATH: ldLibraryPath
          }
        });
        stdout = res.stdout || '';
        stderr = res.stderr || '';
      }

      console.log(`[STT] Whisper stdout length: ${stdout.length}, stderr length: ${stderr.length}`);

      let transcript = '';

      // 1. Search across all potential TXT output file locations
      for (const p of candidateTxtPaths) {
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, 'utf8').trim();
          if (content.length > 0) {
            transcript = content;
            console.log(`[STT] Read transcript from generated file "${p}": "${transcript}"`);
            break;
          }
        }
      }

      // 2. Fallback: Parse transcript from stdout/stderr if TXT file was not created or empty
      if (!transcript) {
        const combinedOutput = `${stdout}\n${stderr}`;
        const lines = combinedOutput.split('\n');
        const textLines = lines
          .map(l => l.replace(/\[\d{2}:\d{2}(:\d{2})?(\.\d{3})?\s*-->\s*\d{2}:\d{2}(:\d{2})?(\.\d{3})?\]\s*/g, '').trim())
          .filter(l => {
            if (!l || l.length === 0) return false;
            if (l.startsWith('whisper_') || l.startsWith('system_info:') || l.startsWith('read_audio_data:')) return false;
            if (l.startsWith('main:') || l.startsWith('load_backend:') || l.startsWith('output_txt:') || l.startsWith('ggml_')) return false;
            if (l.startsWith('llama_') || l.startsWith('exec_') || l.startsWith('[STT]') || l.startsWith('[VOICE]')) return false;
            return true;
          });
        transcript = textLines.join(' ').trim();
        if (transcript) {
          console.log(`[STT] Extracted transcript from process stdout/stderr fallback: "${transcript}"`);
        }
      }

      console.log(`[STT] Offline Whisper final transcript output: "${transcript}"`);
      
      if (!transcript) {
        console.warn('[STT] Whisper output was empty or silent audio. Raw stdout:', stdout, 'stderr:', stderr);
        throw new Error('Speech transcription produced empty result. Please speak louder and clearly.');
      }

      return transcript;
    } catch (error: any) {
      console.error('[STT] Local Whisper CLI execution failed:', error);
      throw error instanceof Error ? error : new Error('Speech transcription failed locally.');
    } finally {
      try {
        if (fs.existsSync(tempWavPath)) fs.unlinkSync(tempWavPath);
        for (const p of candidateTxtPaths) {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        }
      } catch (e) {
        // Silently ignore cleanup errors
      }
    }
  }
};
