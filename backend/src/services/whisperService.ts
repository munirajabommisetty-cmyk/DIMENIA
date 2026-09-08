const HF_BASE_URL =
  'https://hemanthdfdgh-dimentiacare-whisper.hf.space';

const HF_UPLOAD_URL = `${HF_BASE_URL}/gradio_api/upload`;
const HF_TRANSCRIBE_URL = `${HF_BASE_URL}/gradio_api/call/v2/transcribe`;
const HF_RESULT_URL = `${HF_BASE_URL}/gradio_api/call/transcribe`;

const HF_TOKEN = process.env.HF_TOKEN;

function hfAuthHeaders(): Record<string, string> {
  if (!HF_TOKEN) {
    throw new Error(
      'HF_TOKEN is not configured. Please configure the Hugging Face token in the backend environment.'
    );
  }

  return { Authorization: `Bearer ${HF_TOKEN}` };
}

function extractCompleteResult(raw: string): string {
  if (!raw) return '';

  const completeMatch = raw.match(
    /event:\s*complete\s*\r?\ndata:\s*(.+)/s
  );

  if (!completeMatch) return '';

  try {
    const data = JSON.parse(completeMatch[1].trim());

    if (Array.isArray(data) && typeof data[0] === 'string') {
      return data[0].trim();
    }

    return '';
  } catch (error) {
    console.error('[STT] Failed to parse Hugging Face result:', error);
    return '';
  }
}

async function uploadAudio(audioBuffer: Buffer): Promise<string> {
  const blob = new Blob([audioBuffer], { type: 'audio/wav' });
  const formData = new FormData();

  formData.append('files', blob, 'audio.wav');

  console.log('[STT] Uploading audio to Hugging Face...');

  const response = await fetch(HF_UPLOAD_URL, {
    method: 'POST',
    headers: hfAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[STT] Hugging Face upload failed: ${response.status} ${errorText}`
    );
    throw new Error(`Hugging Face audio upload failed (${response.status})`);
  }

  const uploadedFiles = await response.json() as unknown;

  if (
    !Array.isArray(uploadedFiles) ||
    typeof uploadedFiles[0] !== 'string'
  ) {
    throw new Error('Hugging Face returned an invalid upload response');
  }

  console.log('[STT] Audio uploaded successfully');
  return uploadedFiles[0];
}

async function startTranscription(uploadedPath: string): Promise<string> {
  console.log('[STT] Starting Hugging Face transcription...');

  const response = await fetch(HF_TRANSCRIBE_URL, {
    method: 'POST',
    headers: {
      ...hfAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio: {
        path: uploadedPath,
        meta: { _type: 'gradio.FileData' },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[STT] Hugging Face transcription request failed: ${response.status} ${errorText}`
    );
    throw new Error(
      `Hugging Face transcription request failed (${response.status})`
    );
  }

  const result = await response.json() as { event_id?: string };

  if (!result.event_id) {
    throw new Error('Hugging Face did not return a transcription event ID');
  }

  console.log(`[STT] Hugging Face event ID: ${result.event_id}`);
  return result.event_id;
}

async function waitForTranscription(eventId: string): Promise<string> {
  const resultUrl = `${HF_RESULT_URL}/${eventId}`;

  console.log('[STT] Waiting for Hugging Face transcription result...');

  const response = await fetch(resultUrl, {
    method: 'GET',
    headers: hfAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[STT] Hugging Face result request failed: ${response.status} ${errorText}`
    );
    throw new Error(
      `Hugging Face transcription result failed (${response.status})`
    );
  }

  const rawResult = await response.text();

  console.log('[STT] Hugging Face transcription result received');
  console.log('[STT] Raw Hugging Face SSE result:', rawResult);

  if (rawResult.includes('event: error')) {
    const errorMatch = rawResult.match(
      /event:\s*error\s*\r?\ndata:\s*(.+)/s
    );

    if (errorMatch) {
      try {
        const errorData = JSON.parse(errorMatch[1].trim()) as {
          error?: string;
          title?: string;
        };

        console.error('[STT] Hugging Face SSE error:', errorData);

        throw new Error(
          errorData.error ||
          errorData.title ||
          'Hugging Face transcription failed.'
        );
      } catch (error) {
        if (error instanceof Error) throw error;
      }
    }

    throw new Error('Hugging Face transcription failed.');
  }

  const transcript = extractCompleteResult(rawResult);

  if (!transcript) {
    console.warn('[STT] Empty transcription returned by Hugging Face');
    throw new Error('Could not understand the speech. Please try again.');
  }

  console.log(`[STT] Transcript: "${transcript}"`);
  return transcript;
}

export const whisperService = {
  getExecutablePath(): string | null {
    return null;
  },

  getModelPath(): string | null {
    return null;
  },

  ensureDirExists() {
    // No local Whisper directory is required anymore.
  },

  async transcribe(
    audioBuffer: Buffer,
    language?: string
  ): Promise<string> {
    console.log('[STT] ========================================');
    console.log('[STT] Hugging Face Whisper transcription');
    console.log('[STT] ========================================');
    console.log(`[STT] WAV size: ${audioBuffer.length} bytes`);
    console.log(`[STT] Requested language: ${language || 'en'}`);

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('No audio data received.');
    }

    try {
      const uploadedPath = await uploadAudio(audioBuffer);
      const eventId = await startTranscription(uploadedPath);
      return await waitForTranscription(eventId);
    } catch (error) {
      console.error('[STT] Hugging Face Whisper error:', error);

      if (error instanceof Error) throw error;

      throw new Error(
        'Speech transcription failed. Please try again.'
      );
    }
  },
};
