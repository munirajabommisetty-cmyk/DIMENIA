import type { LanguageKey } from './translationService';
import { apiClient } from './apiClient';

export interface VoiceStreamCallbacks {
  onStart: () => void;
  onPartial?: (text: string) => void;
  onResult: (transcript: string) => void;
  onCommand?: (command: any) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

const localeMap: Record<LanguageKey, string> = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Bengali: 'bn-IN',
  Assamese: 'as-IN',
  Manipuri: 'en-IN',
  Khasi: 'en-IN',
  Mizo: 'en-IN',
  Nagamese: 'en-IN',
  Tripuri: 'en-IN'
};

const whisperLangMap: Record<LanguageKey, string> = {
  English: 'en',
  Hindi: 'hi',
  Bengali: 'bn',
  Assamese: 'as',
  Manipuri: 'en',
  Khasi: 'en',
  Mizo: 'en',
  Nagamese: 'en',
  Tripuri: 'en'
};

export const getBrowserLocale = (lang: LanguageKey): string => {
  return localeMap[lang] || 'en-IN';
};

// Resample Float32 audio samples from inputSampleRate down to 16000 Hz using linear interpolation
function resampleTo16k(inputSamples: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate === 16000) {
    return inputSamples;
  }
  const ratio = inputSampleRate / 16000;
  const outputLength = Math.floor(inputSamples.length / ratio);
  const result = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const pos = i * ratio;
    const index = Math.floor(pos);
    const frac = pos - index;
    const sample1 = inputSamples[index] !== undefined ? inputSamples[index] : 0;
    const sample2 = inputSamples[index + 1] !== undefined ? inputSamples[index + 1] : sample1;
    result[i] = sample1 + frac * (sample2 - sample1);
  }
  return result;
}

// Encode Float32 16000Hz mono samples to a standards-compliant PCM16 WAV Blob
function encodeWAV(samples: Float32Array, sampleRate: number = 16000): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // "fmt " sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);            // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);             // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);   // NumChannels (1 for Mono)
  view.setUint32(24, sampleRate, true);    // SampleRate (16000)
  view.setUint32(28, byteRate, true);      // ByteRate (32000)
  view.setUint16(32, blockAlign, true);    // BlockAlign (2)
  view.setUint16(34, bitsPerSample, true); // BitsPerSample (16)

  // "data" sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM16 samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

export class VoiceRecognitionService {
  private isListening: boolean = false;
  private currentMode: 'fallback' | null = null;
  private currentLang: LanguageKey = 'English';
  private activeCallbacks: VoiceStreamCallbacks | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private recordTimeout: any = null;

  // Audio capture storage & diagnostics
  private fallbackChunks: Float32Array[] = [];
  private totalSamplesReceived: number = 0;
  private peakLevel: number = 0;
  private nativeSampleRate: number = 44100;

  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async startListening(lang: LanguageKey, callbacks: VoiceStreamCallbacks) {
    if (this.isListening) return;

    this.activeCallbacks = callbacks;
    this.currentLang = lang;
    this.isListening = true;
    this.totalSamplesReceived = 0;
    this.peakLevel = 0;
    callbacks.onStart();

    // Check backend health for local Whisper CLI execution
    const isConnected = await apiClient.checkHealth();
    if (isConnected) {
      await this.startFallbackRecording();
    } else {
      // If local backend server is not running, fall back seamlessly to browser offline speech recognition
      const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      if (hasWebSpeech) {
        console.log('[VOICE] Local backend server unreachable. Using in-browser speech recognition fallback.');
        this.startWebSpeechRecognition(lang, callbacks);
      } else {
        console.warn('[VOICE] Local backend and in-browser speech recognition unavailable.');
        this.isListening = false;
        callbacks.onError('service-unavailable');
        callbacks.onEnd();
      }
    }
  }

  private recognitionInstance: any = null;

  private startWebSpeechRecognition(lang: LanguageKey, callbacks: VoiceStreamCallbacks) {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      this.isListening = false;
      callbacks.onError('service-unavailable');
      callbacks.onEnd();
      return;
    }

    try {
      this.recognitionInstance = new SpeechRec();
      this.recognitionInstance.continuous = false;
      this.recognitionInstance.interimResults = true;
      this.recognitionInstance.lang = localeMap[lang] || 'en-IN';

      let finalTranscript = '';

      this.recognitionInstance.onstart = () => {
        console.log('[VOICE WebSpeech] Recognition started');
      };

      this.recognitionInstance.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim && callbacks.onPartial) {
          callbacks.onPartial(interim);
        }
      };

      this.recognitionInstance.onerror = (event: any) => {
        console.error('[VOICE WebSpeech] Error:', event.error);
        this.isListening = false;
        callbacks.onError(event.error === 'not-allowed' ? 'microphone-denied' : 'service-unavailable');
        callbacks.onEnd();
      };

      this.recognitionInstance.onend = () => {
        this.isListening = false;
        if (finalTranscript && finalTranscript.trim().length > 0) {
          callbacks.onResult(finalTranscript.trim());
        } else {
          callbacks.onError('empty-recording');
        }
        callbacks.onEnd();
      };

      this.recognitionInstance.start();
    } catch (e: any) {
      console.error('[VOICE WebSpeech] Failed to start WebSpeech:', e);
      this.isListening = false;
      callbacks.onError('service-unavailable');
      callbacks.onEnd();
    }
  }

  private async startFallbackRecording() {
    this.currentMode = 'fallback';
    this.fallbackChunks = [];
    this.totalSamplesReceived = 0;
    this.peakLevel = 0;

    console.log('[VOICE] Microphone requested');

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('[VOICE] Permission granted');

      // Verify track status
      const audioTracks = this.mediaStream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        throw new Error('no-audio-track');
      }
      const track = audioTracks[0];
      console.log(`[VOICE] Track state: ${track.readyState}`);
      if (track.readyState !== 'live' || !track.enabled) {
        throw new Error('microphone-unavailable');
      }

      // Initialize AudioContext using browser native sample rate
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.nativeSampleRate = this.audioContext.sampleRate;
      console.log(`[VOICE] Input sample rate: ${this.nativeSampleRate} Hz`);

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.fallbackChunks.push(new Float32Array(inputData));
        this.totalSamplesReceived += inputData.length;

        // Level tracking
        for (let i = 0; i < inputData.length; i++) {
          const absVal = Math.abs(inputData[i]);
          if (absVal > this.peakLevel) {
            this.peakLevel = absVal;
          }
        }
      };

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);
      console.log('[VOICE] Recording started');

      if (this.recordTimeout) clearTimeout(this.recordTimeout);
      this.recordTimeout = setTimeout(() => {
        console.log('[VOICE] 8 seconds completed. Auto-stopping microphone capture.');
        this.stopListening();
      }, 8000);
    } catch (err: any) {
      console.error('[VOICE] Microphone access error:', err);
      this.activeCallbacks?.onError(err.name === 'NotAllowedError' || err.message === 'NotAllowedError' ? 'microphone-denied' : 'microphone-unavailable');
      this.stopListening();
    }
  }

  async stopListening() {
    if (!this.isListening) return;
    this.isListening = false;

    if (this.recognitionInstance) {
      try { this.recognitionInstance.stop(); } catch (e) {}
      this.recognitionInstance = null;
    }

    if (this.recordTimeout) {
      clearTimeout(this.recordTimeout);
      this.recordTimeout = null;
    }

    const callbacks = this.activeCallbacks;
    this.activeCallbacks = null;

    console.log('[VOICE] Recording stopped');

    // Disconnect audio nodes and stream tracks
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    if (this.currentMode === 'fallback') {
      const totalLength = this.fallbackChunks.reduce((acc, c) => acc + c.length, 0);

      // Merge Float32 samples
      const allSamples = new Float32Array(totalLength);
      let offset = 0;
      let sumSq = 0;
      let maxPeak = 0;

      for (const chunk of this.fallbackChunks) {
        allSamples.set(chunk, offset);
        offset += chunk.length;
        for (let i = 0; i < chunk.length; i++) {
          const val = chunk[i];
          const absVal = Math.abs(val);
          if (absVal > maxPeak) maxPeak = absVal;
          sumSq += val * val;
        }
      }

      const rms = totalLength > 0 ? Math.sqrt(sumSq / totalLength) : 0;
      console.log(`[VOICE] Samples captured: ${totalLength}`);
      console.log(`[VOICE] Peak: ${(maxPeak * 100).toFixed(1)}%`);
      console.log(`[VOICE] RMS: ${rms.toFixed(4)}`);

      // Silence or empty recording check
      if (totalLength === 0 || maxPeak < 0.008 || rms < 0.001) {
        console.warn('[VOICE] Could not hear speech. Please speak closer to the microphone and try again.');
        callbacks?.onError('empty-recording');
        callbacks?.onEnd();
        return;
      }

      try {
        // Resample from native browser sample rate down to 16000 Hz
        console.log(`[VOICE] Resampling ${this.nativeSampleRate} Hz -> 16000 Hz`);
        const resampledSamples = resampleTo16k(allSamples, this.nativeSampleRate);
        console.log(`[VOICE] Resampled samples: ${resampledSamples.length}`);

        // Encode to standards-compliant PCM16 mono 16000Hz WAV
        const wavBlob = encodeWAV(resampledSamples, 16000);
        console.log(`[VOICE] WAV created: ${wavBlob.size} bytes`);
        console.log('[VOICE] WAV format: PCM16 mono 16000Hz');

        // Convert WAV Blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(wavBlob);
        reader.onloadend = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            const whisperLang = whisperLangMap[this.currentLang] || 'en';

            console.log('[VOICE] Sending audio for transcription');
            const apiBaseUrl = (() => {
              const envUrl = import.meta.env.VITE_API_URL;
              if (envUrl && envUrl.trim().length > 0) {
                const trimmed = envUrl.trim().replace(/\/+$/, '');
                return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
              }
              if (typeof window !== 'undefined' && window.location && window.location.origin) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  if (window.location.port === '5173') {
                    return 'http://localhost:5000/api';
                  }
                }
                return `${window.location.origin}/api`;
              }
              return 'http://localhost:5000/api';
            })();

            const response = await fetch(`${apiBaseUrl}/voice/transcribe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64Data, language: whisperLang })
            });

            if (!response.ok) {
              const errBody = await response.json().catch(() => ({}));
              throw new Error(errBody.error || `HTTP ${response.status}`);
            }

            const result = await response.json();
            if (result && result.success && result.transcript && result.transcript.trim().length > 0) {
              const cleanTranscript = result.transcript.trim();
              console.log(`[VOICE] Final transcript: "${cleanTranscript}"`);
              callbacks?.onResult(cleanTranscript);
            } else {
              console.warn('[VOICE] STT returned empty or unsuccessful transcript', result);
              callbacks?.onError('empty-transcript');
            }
          } catch (e: any) {
            console.error('[VOICE] Voice transcription error:', e);
            callbacks?.onError('service-unavailable');
          } finally {
            callbacks?.onEnd();
          }
        };
      } catch (err) {
        console.error('[VOICE] Audio conversion error:', err);
        callbacks?.onError('error');
        callbacks?.onEnd();
      }
    }
  }
}

export const voiceRecognitionService = new VoiceRecognitionService();

export const speakText = (text: string, lang: LanguageKey = 'English', onEnd?: () => void) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('sb_last_tts_response', text);
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = localeMap[lang] || 'en-IN';
    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }
    window.speechSynthesis.speak(utterance);
  } else if (onEnd) {
    onEnd();
  }
};

