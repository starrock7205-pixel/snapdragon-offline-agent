import React, { useState } from 'react';
import { ParticleSwarmCanvas, PRESET_SHADERS } from '../ParticleSwarmCanvas';
import { 
  Sparkles, 
  Cpu, 
  Zap, 
  Code, 
  Copy, 
  Check, 
  Flame, 
  Layers, 
  ExternalLink, 
  ShieldCheck,
  Sliders
} from 'lucide-react';

export const ParticleSwarmView: React.FC = () => {
  const [copiedPreset, setCopiedPreset] = useState<string | null>(null);

  const handleCopyCode = (presetId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPreset(presetId);
    setTimeout(() => setCopiedPreset(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner with Frosted Glass Surface */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-red-950/20 via-white/[0.03] to-white/[0.015] border border-white/[0.09] rounded-2xl shadow-[0_16px_40px_0_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E10600] animate-pulse shadow-[0_0_12px_rgba(225,6,0,0.9)]" />
            <span className="text-[11px] font-mono text-[#E10600] uppercase tracking-wider font-semibold">
              WebGL Creative Shader Studio · 20,000+ Units Swarm
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Hyper-Dimensional Particle Swarm & Neural Lattice
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
            High-performance WebGL simulation powered by zero-allocation vector kinematics, 4D toroidal harmonics, and real-time interactive parameter modulation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-xl text-right shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="text-[10px] font-mono text-neutral-400 uppercase">Frame Budget</div>
            <div className="text-xs font-mono font-bold text-emerald-400">16.6ms · 60 FPS Locked</div>
          </div>
          <div className="px-3.5 py-2 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-xl text-right shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="text-[10px] font-mono text-neutral-400 uppercase">Allocations</div>
            <div className="text-xs font-mono font-bold text-cyan-400">0 Bytes / Frame (Zero GC)</div>
          </div>
        </div>
      </div>

      {/* Main Interactive WebGL Simulation Canvas */}
      <ParticleSwarmCanvas particleCount={20000} initialPresetId="neural-singularity" />

      {/* Technical Architecture & API Documentation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Zero GC Architecture */}
        <div className="p-4 bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] rounded-xl space-y-2 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all">
          <div className="flex items-center gap-2 text-rose-400">
            <Zap className="w-4 h-4" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Zero GC Discipline</h3>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Runs 20,000 particle updates 60 times per second (1.2M iterations/sec) without allocating a single vector, array, or object inside the update loop. All positions and colors write directly into continuous Float32Array buffers.
          </p>
        </div>

        {/* Card 2: Interactive API Contract */}
        <div className="p-4 bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] rounded-xl space-y-2 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sliders className="w-4 h-4" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Interactive UI Sliders</h3>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            The <code className="text-cyan-300 font-mono text-[11px]">addControl(id, label, min, max, initialValue)</code> hook exposes real-time mathematical coefficients directly to the floating control panel without requiring shader re-compilation.
          </p>
        </div>

        {/* Card 3: Floating 3D HUD Annotations */}
        <div className="p-4 bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] rounded-xl space-y-2 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition-all">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Floating 3D HUD</h3>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            <code className="text-emerald-300 font-mono text-[11px]">setInfo(title, desc)</code> and <code className="text-emerald-300 font-mono text-[11px]">annotate(id, target, label)</code> automatically project high-dimensional attractor coordinates into 2D viewport coordinates for glowing spatial beacons.
          </p>
        </div>
      </div>

      {/* Preset Shader Library & One-Click Copy */}
      <div className="p-5 bg-white/[0.025] border border-white/[0.08] rounded-2xl space-y-4 shadow-[0_16px_40px_0_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#E10600]" />
            <h3 className="text-sm font-bold text-white font-mono">
              Shader Presets (Pure JS Output for External Sandboxes)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            Click copy to paste directly into Rashberry or any WebGL particle sandbox
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_SHADERS.map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.07] backdrop-blur-md flex flex-col justify-between space-y-3 hover:border-white/[0.14] transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-white font-mono flex items-center justify-between">
                  <span>{preset.name}</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <button
                onClick={() => handleCopyCode(preset.id, preset.code)}
                className="w-full py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-[#E10600]/20 hover:border-[#E10600]/50 border border-white/[0.09] text-xs font-mono text-neutral-200 transition-all flex items-center justify-center gap-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
              >
                {copiedPreset === preset.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Function Body!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy Function Body</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
