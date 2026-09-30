import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Upload, 
  Copy, 
  Check, 
  Sparkles, 
  X, 
  FileAudio, 
  ArrowRight, 
  Volume2, 
  RotateCcw,
  Clock,
  Send
} from 'lucide-react';
import { transcriptionService, TranscriptionResult } from '../services/transcriptionService';

interface AudioTranscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToWorkstation?: (transcript: string) => void;
  initialPrompt?: string;
}

export const AudioTranscriptionModal: React.FC<AudioTranscriptionModalProps> = ({
  isOpen,
  onClose,
  onSendToWorkstation,
  initialPrompt = '',
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>(initialPrompt);
  const [stats, setStats] = useState<{ words?: number; duration?: number; model?: string }>({});

  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!isOpen) return null;

  const handleStartRecording = async () => {
    setErrorNotice(null);
    const res = await transcriptionService.startRecording((level) => {
      setVolumeLevel(level);
    });

    if (res.success) {
      setIsRecording(true);
      setTranscript('');
      setAudioUrl(null);
    } else {
      setErrorNotice(res.error || 'Could not start microphone recording. Check permissions.');
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    setErrorNotice(null);

    const promptText = customPrompt.trim()
      ? customPrompt
      : 'Transcribe this microphone audio verbatim. Accurately capture technical terminology, formulas, and punctuation.';

    const result: TranscriptionResult = await transcriptionService.stopRecording(promptText);
    setIsProcessing(false);

    if (result.success && result.transcript) {
      setTranscript(result.transcript);
      if (result.audioUrl) {
        setAudioUrl(result.audioUrl);
      }
      setStats({
        words: result.wordsCount || result.transcript.split(/\s+/).filter(Boolean).length,
        duration: result.durationSeconds || recordingSeconds,
        model: result.modelUsed || 'gemini-3.5-transcribe',
      });
    } else {
      setErrorNotice(result.error || 'Failed to transcribe audio.');
      if (result.audioUrl) setAudioUrl(result.audioUrl);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorNotice(null);
    setTranscript('');

    const promptText = customPrompt.trim()
      ? customPrompt
      : 'Transcribe this lecture audio recording verbatim with timestamps and speaker labels if available.';

    const result = await transcriptionService.transcribeAudioFile(file, promptText);
    setIsProcessing(false);

    if (result.success && result.transcript) {
      setTranscript(result.transcript);
      if (result.audioUrl) setAudioUrl(result.audioUrl);
      setStats({
        words: result.wordsCount || result.transcript.split(/\s+/).filter(Boolean).length,
        model: result.modelUsed || 'gemini-3.5-transcribe',
      });
    } else {
      setErrorNotice(result.error || 'File transcription failed.');
    }
  };

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToWorkstation = () => {
    if (!transcript) return;
    if (onSendToWorkstation) {
      onSendToWorkstation(transcript);
      onClose();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#090C16] border border-white/[0.14] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E10600]/20 border border-[#E10600]/40 flex items-center justify-center text-[#E10600] shadow-[0_0_15px_rgba(225,6,0,0.3)]">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Audio Transcription Studio
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-full">
                  gemini-3.5-transcribe
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Input audio with microphone or file upload for high-accuracy speech-to-text
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Microphone Recording Centerpiece */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.08] flex flex-col items-center justify-center text-center space-y-4">
            {/* Visualizer Wave Rings */}
            <div className="relative flex items-center justify-center">
              {isRecording && (
                <>
                  <div 
                    className="absolute w-28 h-28 rounded-full bg-[#E10600]/20 animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                  <div 
                    className="absolute rounded-full border border-[#E10600]/50 transition-all duration-75"
                    style={{
                      width: `${88 + volumeLevel * 0.8}px`,
                      height: `${88 + volumeLevel * 0.8}px`,
                    }}
                  />
                </>
              )}

              {/* Main Record Action Button */}
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  disabled={isProcessing}
                  className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-[#B20500] to-[#E10600] hover:scale-105 active:scale-95 text-white flex flex-col items-center justify-center shadow-[0_0_30px_rgba(225,6,0,0.5)] transition-all disabled:opacity-40"
                >
                  <Mic className="w-8 h-8" />
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-900 border-2 border-[#E10600] text-white flex flex-col items-center justify-center shadow-[0_0_30px_rgba(225,6,0,0.6)] hover:scale-105 active:scale-95 transition-all"
                >
                  <Square className="w-7 h-7 text-[#E10600] fill-[#E10600]" />
                </button>
              )}
            </div>

            {/* Status & Timer */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  isRecording ? 'bg-[#E10600] animate-pulse' :
                  isProcessing ? 'bg-amber-400 animate-spin' :
                  'bg-emerald-400'
                }`} />
                <span className="text-xs font-mono font-medium text-neutral-200">
                  {isRecording ? `RECORDING: ${formatTimer(recordingSeconds)}` :
                   isProcessing ? 'TRANSCRIBING WITH GEMINI-3.5-TRANSCRIBE...' :
                   'READY TO RECORD'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {isRecording 
                  ? 'Speak clearly into your microphone. Click the red stop square when finished.' 
                  : isProcessing 
                  ? 'Processing audio stream through Google GenAI gemini-3.5-transcribe model...' 
                  : 'Click the red microphone to start recording speech or lecture audio.'}
              </p>
            </div>

            {/* Live Audio Level Bars */}
            {isRecording && (
              <div className="flex items-center gap-1 h-6">
                {[...Array(16)].map((_, i) => {
                  const factor = Math.sin(i * 0.5) * 0.3 + 0.7;
                  const barHeight = Math.max(4, Math.min(24, Math.round((volumeLevel / 100) * 24 * factor)));
                  return (
                    <div
                      key={i}
                      className="w-1 bg-[#E10600] rounded-full transition-all duration-75"
                      style={{ height: `${barHeight}px` }}
                    />
                  );
                })}
              </div>
            )}

            {/* Audio Upload Fallback / Alternate Option */}
            <div className="pt-2 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isRecording || isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] rounded-lg transition-all disabled:opacity-40"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Audio File (.wav, .mp3, .webm)</span>
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {errorNotice && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center justify-between">
              <span>{errorNotice}</span>
              <button onClick={() => setErrorNotice(null)} className="text-red-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Audio Playback Preview (if audio was recorded or uploaded) */}
          {audioUrl && (
            <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-300 font-mono">
                <Volume2 className="w-4 h-4 text-[#E10600]" />
                <span>Captured Audio Preview</span>
              </div>
              <audio
                ref={audioPlayerRef}
                src={audioUrl}
                controls
                className="h-8 max-w-[260px] sm:max-w-[320px] rounded"
              />
            </div>
          )}

          {/* Output Transcript Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase text-neutral-300">
                  Transcription Output
                </span>
                {stats.words && (
                  <span className="text-[10px] font-mono text-neutral-400">
                    ({stats.words} words {stats.duration ? `· ${stats.duration}s` : ''})
                  </span>
                )}
              </div>
              {transcript && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-md transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="relative min-h-[140px] p-4 bg-black/60 border border-white/[0.1] rounded-xl text-sm leading-relaxed text-neutral-100 font-sans shadow-inner">
              {transcript ? (
                <p className="whitespace-pre-wrap">{transcript}</p>
              ) : isProcessing ? (
                <div className="flex flex-col items-center justify-center py-8 text-neutral-400 space-y-2">
                  <Sparkles className="w-6 h-6 text-[#E10600] animate-spin" />
                  <span className="text-xs font-mono">Transcribing using gemini-3.5-transcribe...</span>
                </div>
              ) : (
                <p className="text-neutral-500 italic text-xs">
                  Your transcribed audio text will appear here with full sentence capitalization, punctuation, and terminology.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Engine: gemini-3.5-transcribe</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-all"
            >
              Close
            </button>

            {onSendToWorkstation && (
              <button
                onClick={handleSendToWorkstation}
                disabled={!transcript}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#E10600] hover:bg-[#C50500] disabled:opacity-40 disabled:hover:bg-[#E10600] rounded-lg transition-all shadow-lg shadow-red-950/40"
              >
                <span>Send to Copilot</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
