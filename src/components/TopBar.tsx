import React from 'react';
import { Wifi, WifiOff, Cpu, Sliders, Shield, Mic } from 'lucide-react';
import { HardwareInfo } from '../types/hardware';

export type ActiveNavTab = 
  | 'workstation'
  | 'study'
  | 'lecture'
  | 'code'
  | 'create'
  | 'files'
  | 'memory'
  | 'lab'
  | 'hardware'
  | 'demos';

interface TopBarProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  networkLock: boolean;
  onToggleNetworkLock: () => void;
  hardware: HardwareInfo;
  onOpenSetup: () => void;
  onOpenTranscribe?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  networkLock,
  onToggleNetworkLock,
  hardware,
  onOpenSetup,
  onOpenTranscribe,
}) => {
  const navItems: { id: ActiveNavTab; label: string }[] = [
    { id: 'workstation', label: 'Workstation' },
    { id: 'study', label: 'Study' },
    { id: 'lecture', label: 'Lecture' },
    { id: 'code', label: 'Code' },
    { id: 'create', label: 'Create' },
    { id: 'files', label: 'Files' },
    { id: 'memory', label: 'Memory' },
    { id: 'lab', label: 'Offline Lab' },
    { id: 'hardware', label: 'Hardware' },
    { id: 'demos', label: '🏆 Competition Rig' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-[#070912]/70 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.08)] px-5 flex items-center justify-between transition-colors">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#workstation"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('workstation');
          }}
          className="text-sm font-semibold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-2 h-2 rounded-full bg-[#E10600] inline-block shadow-[0_0_10px_rgba(225,6,0,0.9)] animate-pulse" />
          <span>Snapdragon Offline Study & Lecture Copilot</span>
        </a>
        <div className="hidden md:flex items-center gap-1.5">
          <span className="px-2 py-0.5 text-[10px] font-mono text-neutral-300 bg-white/[0.04] border border-white/[0.08] rounded backdrop-blur-md">
            Boya Yashwanth Kumar
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded backdrop-blur-md">
            100% Offline
          </span>
        </div>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'text-white bg-white/[0.10] border border-white/[0.18] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22)] backdrop-blur-md'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Network Lock Toggle */}
        <button
          onClick={onToggleNetworkLock}
          title={networkLock ? 'Network Lock Active: Disconnected from cloud' : 'Network Active: Click to engage Offline Lock'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border backdrop-blur-xl transition-all duration-200 ${
            networkLock
              ? 'bg-white/[0.05] hover:bg-white/[0.09] border-white/[0.12] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
              : 'bg-amber-950/40 hover:bg-amber-950/60 border-amber-500/40 text-amber-300 shadow-[inset_0_1px_0_0_rgba(245,158,11,0.15)]'
          }`}
        >
          {networkLock ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-[#E10600]" />
              <span className="font-mono text-[11px] tracking-wide">OFFLINE ●</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] tracking-wide">ONLINE-ONLY</span>
            </>
          )}
        </button>

        {/* Hardware Status Button */}
        <button
          onClick={() => onTabChange('hardware')}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-200 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/[0.10] hover:border-white/[0.16] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] rounded-lg transition-all"
          title={`Active Accelerator: ${hardware.activeAccelerator} (${hardware.runtimeEngine})`}
        >
          <Cpu className="w-3.5 h-3.5 text-[#E10600]" />
          <span className="font-mono text-[11px]">
            {hardware.activeAccelerator === 'NPU' ? 'HEXAGON NPU' : hardware.activeAccelerator === 'GPU' ? 'ADRENO GPU' : 'CPU SIMD'}
          </span>
        </button>

        {/* Setup wizard trigger */}
        <button
          onClick={onOpenSetup}
          title="Hardware & Model Setup Wizard"
          className="p-1.5 text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/[0.10] hover:border-white/[0.16] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] rounded-lg transition-all"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Audio Transcribe Trigger */}
        {onOpenTranscribe && (
          <button
            onClick={onOpenTranscribe}
            title="Audio Transcription Studio (gemini-3.5-transcribe)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#B20500]/70 to-[#E10600]/80 hover:from-[#B20500] hover:to-[#E10600] border border-[#E10600]/50 rounded-lg shadow-[0_0_12px_rgba(225,6,0,0.3)] transition-all"
          >
            <Mic className="w-3.5 h-3.5 text-white" />
            <span className="font-mono text-[11px] hidden sm:inline font-semibold">TRANSCRIBE</span>
          </button>
        )}
      </div>
    </header>
  );
};
