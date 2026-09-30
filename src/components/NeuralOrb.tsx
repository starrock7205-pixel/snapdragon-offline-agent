import React from 'react';
import { AgentState } from '../types/agent';

interface NeuralOrbProps {
  state: AgentState;
  size?: 'sm' | 'md' | 'lg';
}

export const NeuralOrb: React.FC<NeuralOrbProps> = ({ state, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  }[size];

  // Visual cues based on agent state
  const stateConfig: Record<AgentState, { label: string; ringColor: string; coreGlow: string; pulseSpeed: string }> = {
    IDLE: {
      label: 'IDLE',
      ringColor: 'border-neutral-700/60',
      coreGlow: 'bg-[#E10600]/20',
      pulseSpeed: 'animate-pulse duration-3000',
    },
    THINKING: {
      label: 'THINKING',
      ringColor: 'border-[#E10600]/70',
      coreGlow: 'bg-[#E10600]/40',
      pulseSpeed: 'animate-spin duration-4000',
    },
    READING: {
      label: 'READING',
      ringColor: 'border-amber-500/60',
      coreGlow: 'bg-amber-500/30',
      pulseSpeed: 'animate-pulse duration-1500',
    },
    LISTENING: {
      label: 'LISTENING',
      ringColor: 'border-emerald-500/70',
      coreGlow: 'bg-emerald-500/30',
      pulseSpeed: 'animate-ping duration-2000',
    },
    PROCESSING: {
      label: 'PROCESSING',
      ringColor: 'border-red-500/80',
      coreGlow: 'bg-red-600/40',
      pulseSpeed: 'animate-spin duration-2500',
    },
    ACTING: {
      label: 'ACTING',
      ringColor: 'border-rose-500/90',
      coreGlow: 'bg-rose-500/40',
      pulseSpeed: 'animate-pulse duration-1000',
    },
    OFFLINE: {
      label: 'OFFLINE',
      ringColor: 'border-neutral-600',
      coreGlow: 'bg-neutral-800',
      pulseSpeed: '',
    },
    COMPLETED: {
      label: 'COMPLETED',
      ringColor: 'border-emerald-500/90',
      coreGlow: 'bg-emerald-500/30',
      pulseSpeed: 'duration-500',
    },
    ERROR: {
      label: 'ERROR',
      ringColor: 'border-red-600',
      coreGlow: 'bg-red-700/50',
      pulseSpeed: '',
    },
  };

  const config = stateConfig[state] || stateConfig.IDLE;

  return (
    <div className="flex flex-col items-center justify-center gap-2 group select-none">
      <div className={`relative ${sizeClasses} flex items-center justify-center`}>
        {/* Outer orbital rings */}
        <div
          className={`absolute inset-0 rounded-full border border-dashed ${config.ringColor} transition-all duration-700 ${config.pulseSpeed}`}
        />
        <div
          className="absolute inset-1.5 rounded-full border border-white/10 transition-all duration-500"
        />

        {/* Central core die */}
        <div
          className={`w-1/2 h-1/2 rounded-full ${config.coreGlow} backdrop-blur-md flex items-center justify-center border border-white/20 transition-all duration-500 shadow-[0_0_24px_rgba(225,6,0,0.25)]`}
        >
          {/* Inner silicon chip notch */}
          <div className="w-2.5 h-2.5 rounded-sm bg-white/90 shadow-sm" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-neutral-400 uppercase">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            state === 'OFFLINE' ? 'bg-neutral-500' : state === 'ERROR' ? 'bg-red-500' : 'bg-[#E10600]'
          }`}
        />
        <span>{config.label}</span>
      </div>
    </div>
  );
};
