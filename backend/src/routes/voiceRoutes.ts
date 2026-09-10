import { Router } from 'express';
import fs from 'fs';
import { voiceService } from '../services/voiceService';
import { whisperService } from '../services/whisperService';
import { voskService } from '../services/voskService';
import { commandExecutor } from '../services/commandExecutor';
import { localLLMService } from '../services/localLLMService';

const router = Router();

router.post('/voice/command', async (req, res) => {
  try {
    const patientId = req.body.patientId || 'patient-ravi';
    const command = req.body.command || req.body.text || '';
    const language = req.body.language || 'en';
    const contextData = req.body.contextData || {};
    const voiceContext = req.body.voiceContext || null;

    const result = await commandExecutor.execute(
      command,
      language,
      patientId,
      contextData,
      voiceContext
    );

    res.json(result);
  } catch (error: any) {
    console.error(
      '[Second Brain] /voice/command route error:',
      error
    );

    res.status(500).json({
      success: false,
      error:
        error.message || 'Failed to process command'
    });
  }
});

router.get('/voice/version', (req, res) => {
  res.json({
    success: true,
    version: 'whisper-linux-v10-static-322e9fd',
    timestamp: new Date().toISOString()
  });
});

router.get('/voice/stt-status', (req, res) => {
  const voskStatus = voskService.getStatus();
  const exePath = whisperService.getExecutablePath();
  const modelPath = whisperService.getModelPath();
  const whisperAvailable = Boolean(exePath && fs.existsSync(exePath) && modelPath && fs.existsSync(modelPath));

  res.json({
    success: true,
    vosk: {
      available: voskStatus.available,
      languages: voskStatus.languages
    },
    whisper: {
      available: whisperAvailable,
      executableExists: Boolean(exePath && fs.existsSync(exePath)),
      modelExists: Boolean(modelPath && fs.existsSync(modelPath)),
      version: 'whisper-linux-static-v1.5.4'
    },
    offline: true
  });
});

router.post('/voice/transcribe', async (req, res) => {
  try {
    const { audio, language } = req.body;

    console.log('[STT DEBUG] request received');
    console.log(`[STT DEBUG] content type: ${req.headers['content-type']}`);

    if (!audio) {
      console.warn('[STT DEBUG] No audio data provided');
      return res.status(400).json({
        success: false,
        error: 'No audio data provided'
      });
    }

    const audioBuffer = Buffer.from(
      audio,
      'base64'
    );

    console.log(`[STT DEBUG] byte size: ${audioBuffer.length}`);

    const transcript =
      await whisperService.transcribe(
        audioBuffer,
        language
      );

    console.log(`[STT DEBUG] backend returned transcript: "${transcript}"`);

    res.json({
      success: true,
      transcript
    });
  } catch (error: any) {
    console.error(
      '[STT DEBUG] Backend transcription error:',
      error
    );

    res.json({
      success: false,
      error:
        error.message ||
        'Failed to transcribe audio'
    });
  }
});

router.post('/voice/translate', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error:
          'No title provided for translation'
      });
    }

    const translations =
      await localLLMService.translateText(
        title,
        description || ''
      );

    if (translations) {
      res.json({
        success: true,
        translations
      });
    } else {
      res.json({
        success: false,
        error:
          'Failed to generate translations from LLM'
      });
    }
  } catch (error: any) {
    console.error(
      '[Second Brain] Backend translation route error:',
      error
    );

    res.json({
      success: false,
      error:
        error.message ||
        'Translation failed'
    });
  }
});

export default router;