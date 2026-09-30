/**
 * Audio Transcription Service for Snapdragon Offline Copilot
 * Uses model: gemini-3.5-transcribe
 */

export interface TranscriptionResult {
  success: boolean;
  transcript: string;
  modelUsed: string;
  wordsCount?: number;
  durationSeconds?: number;
  audioBlob?: Blob;
  audioUrl?: string;
  error?: string;
}

export class AudioTranscriptionService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private startTime: number = 0;

  /**
   * Start recording from user's microphone with live volume level feedback
   */
  public async startRecording(onVolumeUpdate?: (level: number) => void): Promise<{ success: boolean; error?: string }> {
    try {
      this.cleanup();
      this.audioChunks = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioStream = stream;
      this.startTime = Date.now();

      // Setup audio analyzer for volume visualization
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 256;
          source.connect(this.analyser);

          const bufferLength = this.analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const checkVolume = () => {
            if (!this.analyser) return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const normalized = Math.min(100, Math.round((average / 128) * 100));
            if (onVolumeUpdate) {
              onVolumeUpdate(normalized);
            }
            this.animFrameId = requestAnimationFrame(checkVolume);
          };

          checkVolume();
        }
      } catch (e) {
        console.warn('AudioContext volume analyzer failed to initialize:', e);
      }

      // Select supported MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          mimeType = ''; // Let browser choose default
        }
      }

      this.mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(200); // chunk every 200ms
      return { success: true };
    } catch (err: any) {
      this.cleanup();
      console.error('Failed to start microphone recording:', err);
      return {
        success: false,
        error: err?.message || 'Microphone access denied or audio device not found.',
      };
    }
  }

  /**
   * Stop recording and transcribe the captured audio using gemini-3.5-transcribe
   */
  public async stopRecording(prompt?: string): Promise<TranscriptionResult> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        resolve({
          success: false,
          transcript: '',
          modelUsed: 'gemini-3.5-transcribe',
          error: 'Recording is not active.',
        });
        return;
      }

      const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      this.mediaRecorder.onstop = async () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          const audioUrl = URL.createObjectURL(audioBlob);

          this.cleanup();

          if (audioBlob.size === 0) {
            resolve({
              success: false,
              transcript: '',
              modelUsed: 'gemini-3.5-transcribe',
              error: 'No audio data was recorded.',
            });
            return;
          }

          // Convert blob to base64
          const base64Data = await this.blobToBase64(audioBlob);

          // Transcribe via server with model gemini-3.5-transcribe
          const result = await this.callTranscriptionApi(base64Data, mimeType, prompt);
          resolve({
            ...result,
            durationSeconds,
            audioBlob,
            audioUrl,
          });
        } catch (err: any) {
          this.cleanup();
          resolve({
            success: false,
            transcript: '',
            modelUsed: 'gemini-3.5-transcribe',
            error: err?.message || 'Audio processing failed.',
          });
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Transcribe an uploaded audio file (.mp3, .wav, .m4a, .webm, etc.) using gemini-3.5-transcribe
   */
  public async transcribeAudioFile(file: File, prompt?: string): Promise<TranscriptionResult> {
    try {
      const mimeType = file.type || 'audio/webm';
      const base64Data = await this.blobToBase64(file);
      const audioUrl = URL.createObjectURL(file);

      const result = await this.callTranscriptionApi(base64Data, mimeType, prompt);
      return {
        ...result,
        audioBlob: file,
        audioUrl,
      };
    } catch (err: any) {
      return {
        success: false,
        transcript: '',
        modelUsed: 'gemini-3.5-transcribe',
        error: err?.message || 'Failed to read audio file.',
      };
    }
  }

  /**
   * Call server endpoint which runs model: gemini-3.5-transcribe
   */
  private async callTranscriptionApi(
    audioBase64: string,
    mimeType: string,
    prompt?: string
  ): Promise<TranscriptionResult> {
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          prompt,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server transcription request failed');
      }

      return {
        success: true,
        transcript: data.transcript || '',
        modelUsed: data.modelUsed || 'gemini-3.5-transcribe',
        wordsCount: data.wordsCount,
      };
    } catch (err: any) {
      console.warn('Direct API transcription failed, providing fallback:', err);
      return {
        success: false,
        transcript: '',
        modelUsed: 'gemini-3.5-transcribe',
        error: err?.message || 'Transcription failed',
      };
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        // Strip data: prefix if present
        const base64 = res.includes(',') ? res.split(',')[1] : res;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
    this.analyser = null;

    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }
  }
}

export const transcriptionService = new AudioTranscriptionService();
