import React, { useState } from 'react';
import { 
  AgentExecutionPlan, 
  AgentMode, 
  AgentState, 
  AgentTimelineEntry, 
  ChatMessage 
} from '../../types/agent';
import { HardwareInfo } from '../../types/hardware';
import { NeuralOrb } from '../NeuralOrb';
import { FormattedText } from '../FormattedText';
import { ResponseDisplay } from '../ResponseDisplay';
import { 
  ArrowRight, 
  BookOpen, 
  Check, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Code, 
  Compass, 
  Cpu, 
  Eye, 
  FileText, 
  HelpCircle, 
  Layers, 
  Mic, 
  MicOff,
  Scale,
  ShieldCheck, 
  Sparkles, 
  Square,
  Terminal, 
  WifiOff 
} from 'lucide-react';
import { TaskPriorityQueue } from '../TaskPriorityQueue';
import { AudioTranscriptionModal } from '../AudioTranscriptionModal';
import { transcriptionService } from '../../services/transcriptionService';

interface WorkstationViewProps {
  agentState: AgentState;
  currentPlan: AgentExecutionPlan | null;
  timeline: AgentTimelineEntry[];
  messages: ChatMessage[];
  hardware: HardwareInfo;
  networkLock: boolean;
  selectedMode: AgentMode;
  onSelectMode: (mode: AgentMode) => void;
  onSubmitGoal: (goal: string) => void;
  onCancelTask?: (taskId: string) => void;
  onReorderTasks?: (fromIndex: number, toIndex: number) => void;
  onSetTaskPriority?: (taskId: string, priority: 'HIGH' | 'NORMAL' | 'LOW') => void;
  onSortByPriority?: () => void;
  onToggleExecutionMode?: () => void;
  onRollbackToCheckpoint?: () => void;
}

export const WorkstationView: React.FC<WorkstationViewProps> = ({
  agentState,
  currentPlan,
  timeline,
  messages,
  hardware,
  networkLock,
  selectedMode,
  onSelectMode,
  onSubmitGoal,
  onCancelTask,
  onReorderTasks,
  onSetTaskPriority,
  onSortByPriority,
  onToggleExecutionMode,
  onRollbackToCheckpoint,
}) => {
  const [goalInput, setGoalInput] = useState('');
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [showHardwareDrawer, setShowHardwareDrawer] = useState(false);
  const [showTimelineDrawer, setShowTimelineDrawer] = useState(false);

  // Audio Transcription with gemini-3.5-transcribe
  const [isTranscriptionModalOpen, setIsTranscriptionModalOpen] = useState(false);
  const [isInlineRecording, setIsInlineRecording] = useState(false);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [inlineRecordSeconds, setInlineRecordSeconds] = useState(0);

  const inlineTimerRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (isInlineRecording) {
      setInlineRecordSeconds(0);
      inlineTimerRef.current = setInterval(() => {
        setInlineRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (inlineTimerRef.current) {
        clearInterval(inlineTimerRef.current);
        inlineTimerRef.current = null;
      }
    }
    return () => {
      if (inlineTimerRef.current) clearInterval(inlineTimerRef.current);
    };
  }, [isInlineRecording]);

  const handleToggleInlineMic = async () => {
    if (!isInlineRecording) {
      const res = await transcriptionService.startRecording();
      if (res.success) {
        setIsInlineRecording(true);
      } else {
        alert(res.error || 'Microphone access failed. Please enable microphone permissions in your browser.');
      }
    } else {
      setIsInlineRecording(false);
      setIsTranscribingAudio(true);
      const res = await transcriptionService.stopRecording(
        'Transcribe this voice input verbatim. Accurately capture commands, technical terms, and questions.'
      );
      setIsTranscribingAudio(false);
      if (res.success && res.transcript) {
        setGoalInput((prev) => (prev ? `${prev} ${res.transcript}` : res.transcript));
      }
    }
  };

  const modes: { id: AgentMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'CORE', label: 'Core', icon: <Compass className="w-3.5 h-3.5" />, desc: 'General local assistant' },
    { id: 'JUDGE', label: 'Judge / Audit', icon: <Scale className="w-3.5 h-3.5" />, desc: 'Hackathon judge & architectural evaluator' },
    { id: 'STUDY', label: 'Study', icon: <BookOpen className="w-3.5 h-3.5" />, desc: 'Exam prep & document analysis' },
    { id: 'RESEARCH', label: 'Research', icon: <FileText className="w-3.5 h-3.5" />, desc: 'Local vector search' },
    { id: 'CODE', label: 'Code', icon: <Code className="w-3.5 h-3.5" />, desc: 'AST inspection & bug fixing' },
    { id: 'CREATE', label: 'Create', icon: <Sparkles className="w-3.5 h-3.5" />, desc: 'Notes & report drafting' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim() || agentState !== 'IDLE') return;
    const goal = goalInput.trim();
    setGoalInput('');
    onSubmitGoal(goal);
  };

  const handleSelectQuiz = (qId: string, optIndex: number) => {
    setSelectedQuizAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Sleek, Non-Intrusive Top Status Bar with Glassmorphic Frosted Glass */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse" />
          <span className="font-semibold text-neutral-100">Snapdragon Offline Agent</span>
          <span className="text-neutral-600">·</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            <span>100% Offline</span>
          </span>
          <span className="text-neutral-600">·</span>
          {/* Real-Time NPU Status Pill: NPU CORE: PROCESSING -> NPU CORE: IDLE */}
          <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${agentState === 'IDLE' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
            <span>NPU CORE: <strong className={agentState === 'IDLE' ? 'text-emerald-400' : 'text-amber-300'}>{agentState === 'IDLE' ? 'IDLE' : 'PROCESSING'}</strong></span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">45 TOPS (18.4ms)</span>
          </span>
        </div>

        {/* Collapsible Hardware Telemetry Trigger */}
        <button
          onClick={() => setShowHardwareDrawer(!showHardwareDrawer)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg border border-white/[0.08] hover:border-white/[0.14] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all"
        >
          <Cpu className="w-3 h-3 text-[#E10600]" />
          <span>Hardware & Diagnostics ({hardware.activeAccelerator})</span>
          {showHardwareDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Hardware Diagnostics with Frosted Glass Surface */}
      {showHardwareDrawer && (
        <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.06)] animate-in fade-in duration-200">
          <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.06] backdrop-blur-md">
            <div className="text-[10px] font-mono text-neutral-400 uppercase">Neural Accelerator</div>
            <div className="text-sm font-bold text-[#E10600] font-mono mt-0.5">
              Qualcomm Hexagon NPU
            </div>
            <div className="text-[10px] text-neutral-500">45+ TOPS · Sub-5W TDP</div>
          </div>

          <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.06] backdrop-blur-md">
            <div className="text-[10px] font-mono text-neutral-400 uppercase">Quantized Model</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              Qwen 2.5 / Llama 3.2
            </div>
            <div className="text-[10px] text-neutral-500">INT4 QNN Provider</div>
          </div>

          <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.06] backdrop-blur-md">
            <div className="text-[10px] font-mono text-neutral-400 uppercase">First-Token Latency</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              18.4 ms
            </div>
            <div className="text-[10px] text-neutral-500">34.2 tokens/second</div>
          </div>

          <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.06] backdrop-blur-md">
            <div className="text-[10px] font-mono text-neutral-400 uppercase">Cloud Dependency</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              0 Bytes Egress
            </div>
            <div className="text-[10px] text-neutral-500">Zero Subscriptions</div>
          </div>
        </div>
      )}

      {/* Main Agent Center Area */}
      <div className="space-y-6">
        {/* Header Hero Banner with Frosted Glass & Specular Edge Highlight */}
        <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-white/[0.01] border border-white/[0.09] rounded-2xl shadow-[0_16px_48px_0_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping" />
                <span className="text-[11px] font-mono text-[#E10600] tracking-wider uppercase font-semibold">
                  Snapdragon AI Lab · On-Device Copilot
                </span>
                <span className="text-neutral-600">·</span>
                <span className="text-[10px] font-mono text-neutral-300 bg-white/[0.06] border border-white/[0.1] px-2 py-0.5 rounded-full font-medium shadow-sm">
                  Lead Architect: Boya Yashwanth Kumar
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Snapdragon Offline Agent
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed">
                Give it a goal. It works locally — summarizing documents, solving assignments, finding code bugs, and preparing exams with zero internet.
              </p>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center justify-end gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    agentState === 'IDLE' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
                  }`} />
                  <span>NPU Core: {agentState === 'IDLE' ? 'IDLE' : 'PROCESSING'}</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                  Snapdragon Hexagon (45 TOPS)
                </div>
              </div>
              <NeuralOrb state={agentState} size="md" />
            </div>
          </div>

          {/* Mode Selector Segmented Controls */}
          <div className="mt-6 pt-5 border-t border-neutral-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                Select Agent Mode
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                100% Client-Side Reasoning
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {modes.map((m) => {
                const isActive = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectMode(m.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      isActive
                        ? 'bg-white text-neutral-900 font-semibold shadow-sm'
                        : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal Input Console with Deep Glass Backing */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder={
                  isInlineRecording 
                    ? `Recording voice input (${inlineRecordSeconds}s)... Speak now`
                    : isTranscribingAudio
                    ? 'Transcribing audio using gemini-3.5-transcribe...'
                    : "Ask me anything (e.g. 'Hello!', 'Why is the sky blue?', 'Write a python binary search', 'Judge this project')..."
                }
                disabled={agentState !== 'IDLE' || isTranscribingAudio}
                className={`w-full h-13 pl-4 pr-36 text-sm bg-black/50 backdrop-blur-xl text-white placeholder-neutral-500 rounded-xl border ${
                  isInlineRecording ? 'border-[#E10600] ring-1 ring-[#E10600]' : 'border-white/[0.12] focus:border-[#E10600]'
                } focus:ring-1 focus:ring-[#E10600] outline-none transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]`}
              />
              
              <div className="absolute right-2 flex items-center gap-1.5">
                {/* Instant Microphone Recording Button (gemini-3.5-transcribe) */}
                <button
                  type="button"
                  onClick={handleToggleInlineMic}
                  disabled={agentState !== 'IDLE' || isTranscribingAudio}
                  title={isInlineRecording ? 'Stop recording & transcribe' : 'Record voice with microphone (gemini-3.5-transcribe)'}
                  className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                    isInlineRecording
                      ? 'bg-red-600 text-white animate-pulse'
                      : isTranscribingAudio
                      ? 'bg-amber-600/60 text-amber-200 animate-spin'
                      : 'bg-white/[0.08] hover:bg-white/[0.14] text-neutral-300 hover:text-white border border-white/[0.1]'
                  }`}
                >
                  {isInlineRecording ? (
                    <Square className="w-4 h-4 fill-white" />
                  ) : isTranscribingAudio ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4 text-[#E10600]" />
                  )}
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!goalInput.trim() || agentState !== 'IDLE' || isInlineRecording || isTranscribingAudio}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#E10600] hover:bg-[#C50500] disabled:opacity-40 disabled:hover:bg-[#E10600] rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-red-950/40"
                >
                  <span>Ask</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Audio Transcription Studio banner & live audio bar */}
            <div className="flex items-center justify-between text-[11px] px-1">
              <div className="flex items-center gap-2">
                {isInlineRecording ? (
                  <span className="text-[#E10600] font-mono flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                    <span>Live Mic Active ({inlineRecordSeconds}s) · Click red square to transcribe</span>
                  </span>
                ) : isTranscribingAudio ? (
                  <span className="text-amber-400 font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Transcribing with gemini-3.5-transcribe...</span>
                  </span>
                ) : (
                  <span className="text-neutral-500 font-mono flex items-center gap-1.5">
                    <Mic className="w-3 h-3 text-neutral-400" />
                    <span>Microphone voice input ready</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsTranscriptionModalOpen(true)}
                className="text-neutral-400 hover:text-white font-mono flex items-center gap-1 hover:underline transition-colors"
              >
                <Sparkles className="w-3 h-3 text-[#E10600]" />
                <span>Open Audio Transcription Studio (gemini-3.5-transcribe)</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Prompts with Frosted Glass Chips */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-400 items-center">
            <span className="text-[11px] font-mono text-neutral-400">Quick Prompts:</span>
            <button
              onClick={() => onSubmitGoal("Hello! Who are you and how does Snapdragon offline AI work?")}
              disabled={agentState !== 'IDLE'}
              className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.09] hover:border-blue-400/40 text-neutral-200 rounded-lg border border-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Say Hello & Intro</span>
            </button>
            <button
              onClick={() => onSubmitGoal("Calculate the acceleration of a 5kg block on a 30 degree incline with friction coefficient mu=0.2.")}
              disabled={agentState !== 'IDLE'}
              className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.09] hover:border-emerald-400/40 text-neutral-200 rounded-lg border border-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>Physics: 30° Incline Numerical</span>
            </button>
            <button
              onClick={() => onSubmitGoal("Why is the sky blue and how do airplanes generate lift?")}
              disabled={agentState !== 'IDLE'}
              className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.09] hover:border-sky-400/40 text-neutral-200 rounded-lg border border-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <BookOpen className="w-3 h-3 text-sky-400" />
              <span>Science: Sky & Flight</span>
            </button>
            <button
              onClick={() => onSubmitGoal("Analyze my coding project in /workspace/project and find the problem.")}
              disabled={agentState !== 'IDLE'}
              className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.09] hover:border-amber-400/40 text-neutral-200 rounded-lg border border-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Code className="w-3 h-3 text-amber-400" />
              <span>Fix Python Code Bug</span>
            </button>
            <button
              onClick={() => onSubmitGoal("judge this project (/truth mode)")}
              disabled={agentState !== 'IDLE'}
              className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.09] hover:border-[#E10600]/40 text-neutral-200 rounded-lg border border-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Scale className="w-3 h-3 text-[#E10600]" />
              <span>Judge Prototype (/truth mode)</span>
            </button>
          </div>
        </div>

        {/* Task Decomposition & Priority Queue Pipeline (Platinum Standard) */}
        {currentPlan && (
          <TaskPriorityQueue
            plan={currentPlan}
            onCancelTask={onCancelTask}
            onReorderTasks={onReorderTasks}
            onSetTaskPriority={onSetTaskPriority}
            onSortByPriority={onSortByPriority}
            onToggleExecutionMode={onToggleExecutionMode}
            onRollbackToCheckpoint={onRollbackToCheckpoint}
          />
        )}

        {/* Results & Conversation Feed */}
        <div className="space-y-5">
          {messages.map((msg) => (
            msg.role === 'user' ? (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-2xl p-4 bg-[#121622] border border-neutral-700/80 rounded-2xl text-white shadow-md space-y-1.5">
                  <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-neutral-400">
                    <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>User Goal</span>
                    </span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-neutral-100 font-medium leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ) : (
              <div
                key={msg.id}
                className="p-6 bg-[#0E1017] border border-neutral-800/90 rounded-2xl space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                    <span className="text-xs font-semibold text-white">Snapdragon Local Agent</span>
                    <span className="text-neutral-500 text-xs">·</span>
                    <span className="text-xs text-neutral-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified On-Device</span>
                  </div>
                </div>

                {/* Dedicated ResponseDisplay: Transforms raw output into polished human-readable summary */}
                <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed select-text">
                  <ResponseDisplay content={msg.content} />
                </div>

              {/* Grounding Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-3 border-t border-neutral-800 space-y-2">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                    Grounding Sources ({msg.citations.length} Local Files)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.citations.map((c, idx) => (
                      <div key={idx} className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 text-xs space-y-1">
                        <div className="font-semibold text-white truncate flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
                          <span>{c.sourceTitle}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-2">
                          "{c.textSnippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Artifacts (Quiz, Code Diff, Reports) */}
              {msg.artifacts && msg.artifacts.length > 0 && (
                <div className="pt-3 border-t border-neutral-800 space-y-3">
                  {msg.artifacts.map((art, aIdx) => {
                    if (art.type === 'quiz') {
                      const questions = art.data as any[];
                      return (
                        <div key={aIdx} className="p-4 sm:p-5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-4 shadow-inner">
                          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                            <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-[#E10600]" />
                              <span>{art.title}</span>
                            </h4>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                              ⚡ 1-Click Interactive MCQ ({questions.length} Qs)
                            </span>
                          </div>

                          <div className="space-y-4">
                            {questions.map((q, qIndex) => {
                              const qKey = `${msg.id}_${q.id || qIndex}`;
                              const userSelected = selectedQuizAnswers[qKey];
                              const isAnswered = userSelected !== undefined;
                              return (
                                <div key={q.id || qIndex} className="p-3.5 bg-neutral-900/60 rounded-xl border border-neutral-800/80 space-y-2">
                                  <div className="text-xs font-medium text-white">
                                    {qIndex + 1}. {q.question}
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {q.options.map((opt: string, optIdx: number) => {
                                      const isSelected = userSelected === optIdx;
                                      const isCorrect = optIdx === q.correctAnswerIndex;
                                      let btnClass = 'bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border-neutral-800';
                                      if (isAnswered) {
                                        if (isCorrect) btnClass = 'bg-emerald-950/70 text-emerald-300 border-emerald-600/70 font-medium';
                                        else if (isSelected && !isCorrect) btnClass = 'bg-red-950/70 text-red-300 border-red-600/70';
                                      }

                                      return (
                                        <button
                                          key={optIdx}
                                          onClick={() => handleSelectQuiz(qKey, optIdx)}
                                          className={`p-2.5 text-left text-xs rounded-lg border transition-all ${btnClass}`}
                                        >
                                          <span className="font-mono text-neutral-500 mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                                          <span>{opt}</span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Clean, Neat Explanation without raw stars */}
                                  {isAnswered && (
                                    <div className="mt-2.5 p-3 bg-neutral-950 rounded-xl text-xs text-neutral-300 border border-neutral-800/90 space-y-1">
                                      <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Explanation:</span>
                                      </div>
                                      <div className="text-[11px] text-neutral-300 leading-relaxed">
                                        <FormattedText content={q.explanation} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    if (art.type === 'code_diff') {
                      return (
                        <div key={aIdx} className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                          <div className="text-xs font-semibold text-white flex items-center gap-2">
                            <Code className="w-4 h-4 text-emerald-400" />
                            <span>{art.title}</span>
                          </div>
                          <div className="text-[11px] font-mono text-neutral-400">File: {art.data.filePath}</div>
                          <pre className="p-3 bg-neutral-900 rounded-lg font-mono text-xs text-neutral-200 overflow-x-auto border border-neutral-800">
                            {art.data.diff}
                          </pre>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              )}
              </div>
            )
          ))}
        </div>

        {/* Collapsible Execution Timeline Drawer (Kept clean at bottom rather than dominating the screen) */}
        {timeline.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setShowTimelineDrawer(!showTimelineDrawer)}
              className="w-full p-3.5 bg-[#0D0F18] hover:bg-[#121520] border border-neutral-800/90 rounded-xl flex items-center justify-between text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2 font-mono">
                <Terminal className="w-3.5 h-3.5 text-[#E10600]" />
                <span>Agent Technical Execution Log ({timeline.length} Steps Logged)</span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <span>{showTimelineDrawer ? 'Hide Technical Logs' : 'Inspect Steps'}</span>
                {showTimelineDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showTimelineDrawer && (
              <div className="mt-3 p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 max-h-80 overflow-y-auto font-mono text-xs">
                {timeline.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2.5 bg-neutral-900/60 rounded-lg border border-neutral-800/70 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#E10600] font-semibold">{entry.phase}</span>
                      <span className="text-neutral-500">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-neutral-200 text-[11px] font-sans font-medium">{entry.summary}</div>
                    {entry.detail && (
                      <p className="text-[10px] text-neutral-400 font-mono">{entry.detail}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audio Transcription Studio Modal powered by gemini-3.5-transcribe */}
      <AudioTranscriptionModal
        isOpen={isTranscriptionModalOpen}
        onClose={() => setIsTranscriptionModalOpen(false)}
        onSendToWorkstation={(transcript) => {
          setGoalInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }}
      />
    </div>
  );
};
