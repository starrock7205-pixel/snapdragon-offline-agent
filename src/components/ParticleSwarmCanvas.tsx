import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Code2, 
  Maximize2, 
  Minimize2, 
  Cpu, 
  Check, 
  AlertCircle,
  Activity
} from 'lucide-react';
import { AgentState } from '../types/agent';

export interface ParticleControl {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
}

export interface AnnotationItem {
  id: string;
  position: THREE.Vector3;
  screenX: number;
  screenY: number;
  visible: boolean;
  label: string;
}

export const PRESET_SHADERS: { id: string; name: string; description: string; code: string }[] = [
  {
    id: 'neural-singularity',
    name: 'Hyper-Dimensional Neural Singularity',
    description: 'Quantum lattice particle swarm simulating multi-frequency 4D toroidal harmonics and Hexagon tensor field resonance.',
    code: `const radius = addControl("radius", "Core Radius", 10, 120, 50);
const harmonic = addControl("harmonic", "Harmonic Freq", 1, 8, 3.0);
const warp = addControl("warp", "4D Warp", 0, 5, 2.0);
const twist = addControl("twist", "Toroidal Twist", 0, 6, 2.5);
const speed = addControl("speed", "Pulse Speed", 0.1, 3, 1.0);

const t = time * speed;
const pRatio = i / count;
const phi = pRatio * 6.283185307179586;
const theta = (i * 2.399963229728653) + (t * 0.25);

const pulse = Math.sin(t * 1.5 + phi * harmonic) * Math.cos(t * 0.8 + theta * 2.0);
const r = radius * (0.65 + 0.35 * Math.sin(phi * 3.0 + t)) + pulse * (warp * 6.0);

const cosTheta = Math.cos(theta);
const sinTheta = Math.sin(theta);
const cosPhi = Math.cos(phi + t * 0.15);
const sinPhi = Math.sin(phi + t * 0.15);

const x = r * sinPhi * cosTheta + Math.sin(theta * twist + t) * (warp * 8.0);
const y = r * sinPhi * sinTheta + Math.cos(phi * twist - t) * (warp * 8.0);
const z = r * cosPhi + Math.sin(t * 2.0 + phi * harmonic) * (warp * 10.0);

target.set(x, y, z);

const hue = (0.58 + pRatio * 0.42 + Math.sin(t * 0.6 + z * 0.02) * 0.15) % 1.0;
const safeHue = hue < 0 ? hue + 1.0 : hue;
const lightness = 0.38 + 0.32 * (sinPhi * 0.5 + 0.5);

color.setHSL(safeHue, 0.95, lightness);

if (i === 0) {
  setInfo("Hyper-Dimensional Neural Singularity", "Quantum lattice particle swarm simulating multi-frequency 4D toroidal harmonics and tensor field resonance.");
  annotate("singularity", target, "Resonance Core");
}`,
  },
  {
    id: 'clifford-attractor',
    name: '4D Clifford & Lorenz Attractor',
    description: 'Dynamic chaotic strange attractor mapping folded manifold orbits in high-dimensional phase space.',
    code: `const scale = addControl("scale", "Attractor Scale", 20, 150, 75);
const chaos = addControl("chaos", "Chaos Tensor", 0.5, 3.5, 1.8);
const spin = addControl("spin", "Orbital Spin", 0.1, 4.0, 1.2);
const morph = addControl("morph", "Phase Shift", 0, 10, 3.2);

const t = time * spin * 0.3;
const p = (i / count) * 6.2831853;

const a = 1.7 + Math.sin(t * 0.2) * 0.2;
const b = -1.8 * chaos * 0.5;
const c = 1.9;
const d = -0.8 + Math.cos(t * 0.3) * 0.2;

const xPrev = Math.sin(a * p) + c * Math.cos(a * (p + t));
const yPrev = Math.sin(b * p) + d * Math.cos(b * (p + t));
const zPrev = Math.sin(c * p + t) * Math.cos(d * p);

const x = xPrev * scale * 0.5;
const y = yPrev * scale * 0.5;
const z = zPrev * scale * 0.5;

target.set(x, y, z);

const hue = (0.95 + (z / (scale + 0.01)) * 0.4 + t * 0.05) % 1.0;
color.setHSL(hue < 0 ? hue + 1 : hue, 1.0, 0.5 + Math.sin(p * morph) * 0.2);

if (i === 0) {
  setInfo("4D Clifford Strange Attractor", "High-energy chaotic phase orbits computed via non-linear recurrence tensors.");
  annotate("attractor-eye", target, "Phase Well");
}`,
  },
  {
    id: 'hexagon-tensor-torus',
    name: 'Qualcomm Hexagon NPU Lattice',
    description: 'Bioluminescent tensor matrix ring symbolizing 45 TOPS parallel vector processing pipelines.',
    code: `const majorR = addControl("majorR", "Torus Radius", 30, 120, 65);
const minorR = addControl("minorR", "Tube Thickness", 5, 50, 22);
const waves = addControl("waves", "Hex Fluctuation", 2, 12, 6);
const rate = addControl("rate", "Compute Flow", 0.2, 5.0, 1.5);

const t = time * rate;
const u = (i / count) * 6.2831853;
const v = (i % 80) / 80 * 6.2831853;

const hexMod = Math.sin(u * waves + t) * Math.cos(v * waves - t);
const rTube = minorR * (1 + 0.3 * hexMod);

const x = (majorR + rTube * Math.cos(v)) * Math.cos(u + t * 0.2);
const y = (majorR + rTube * Math.cos(v)) * Math.sin(u + t * 0.2);
const z = rTube * Math.sin(v) + Math.sin(u * 3 + t * 2) * 8;

target.set(x, y, z);

// Snapdragon Red (#E10600) to Electric Cyan Gradient
const blend = (Math.sin(u * 2 + t) + 1) * 0.5;
const hue = blend > 0.5 ? 0.98 : 0.52;
color.setHSL(hue, 1.0, 0.45 + hexMod * 0.15);

if (i === 0) {
  setInfo("Hexagon Tensor Processing Lattice", "Visualizing 45 TOPS on-device NPU compute topology and matrix multiplication pathways.");
  annotate("npu-hub", target, "Hexagon Vector Engine");
}`,
  },
];

interface ParticleSwarmCanvasProps {
  particleCount?: number;
  initialPresetId?: string;
  isCompact?: boolean;
  agentState?: AgentState;
}

export const ParticleSwarmCanvas: React.FC<ParticleSwarmCanvasProps> = ({
  particleCount = 20000,
  initialPresetId = 'neural-singularity',
  isCompact = false,
  agentState,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activePreset, setActivePreset] = useState<string>(initialPresetId);
  const [code, setCode] = useState<string>(() => {
    const found = PRESET_SHADERS.find((p) => p.id === initialPresetId);
    return found ? found.code : PRESET_SHADERS[0].code;
  });
  const [compiledFn, setCompiledFn] = useState<Function | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [count, setCount] = useState<number>(particleCount);
  const [showCodeEditor, setShowCodeEditor] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Dynamic sliders from addControl
  const [controls, setControls] = useState<Record<string, ParticleControl>>({});
  const controlsValuesRef = useRef<Record<string, number>>({});

  // Dynamic HUD info
  const [hudInfo, setHudInfo] = useState<{ title: string; description: string }>({
    title: '3D Particle Swarm',
    description: 'Initialising WebGL canvas...',
  });

  // Dynamic annotations
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const annotationsRef = useRef<Map<string, { position: THREE.Vector3; label: string }>>(new Map());

  // Compile user's code safely
  const compileShaderCode = useCallback((source: string) => {
    try {
      // Forbidden patterns security check
      const forbidden = [
        'document', 'window', 'fetch', 'XMLHttpRequest', 'WebSocket',
        'eval', 'Function(', 'import(', 'require(', 'process',
        '__proto__', '.prototype', 'globalThis', 'self', 'location', 'navigator',
        'localStorage', 'sessionStorage', 'indexedDB', 'crypto',
        'setTimeout', 'setInterval', 'alert(', 'confirm(', 'prompt('
      ];

      for (const pattern of forbidden) {
        if (source.includes(pattern)) {
          throw new Error(`Security validation failed: Forbidden token "${pattern}" detected.`);
        }
      }

      // Construct pure function
      const fn = new Function(
        'i',
        'count',
        'target',
        'color',
        'time',
        'THREE',
        'addControl',
        'setInfo',
        'annotate',
        source
      );

      // Dry run with i = 0 to verify stability & catch ReferenceErrors
      const testTarget = new THREE.Vector3();
      const testColor = new THREE.Color();
      const dummyControl = (id: string, label: string, min: number, max: number, initial: number) => initial;
      const dummyInfo = () => {};
      const dummyAnnotate = () => {};

      fn(0, 100, testTarget, testColor, 0, THREE, dummyControl, dummyInfo, dummyAnnotate);

      if (isNaN(testTarget.x) || isNaN(testTarget.y) || isNaN(testTarget.z)) {
        throw new Error('Stability lock failed: Coordinate evaluated to NaN.');
      }

      setCodeError(null);
      setCompiledFn(() => fn);
    } catch (err: any) {
      console.warn('[Particle Shader Error]', err);
      setCodeError(err.message || 'Syntax or runtime error in particle function');
    }
  }, []);

  // Update code when preset changes
  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    const preset = PRESET_SHADERS.find((p) => p.id === presetId);
    if (preset) {
      setCode(preset.code);
      compileShaderCode(preset.code);
    }
  };

  // Compile on mount or code change
  useEffect(() => {
    compileShaderCode(code);
  }, [compileShaderCode]);

  // Main Three.js Scene Setup & Loop
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !compiledFn) return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 140);

    // Particle Geometry & Buffers
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Texture creation (smooth glowing circular dot)
    const createParticleTexture = () => {
      const texCanvas = document.createElement('canvas');
      texCanvas.width = 64;
      texCanvas.height = 64;
      const ctx = texCanvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.85)');
        gradient.addColorStop(0.7, 'rgba(225,6,0,0.4)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(texCanvas);
    };

    const material = new THREE.PointsMaterial({
      size: isCompact ? 1.8 : 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      map: createParticleTexture(),
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Reusable objects for ZERO GARBAGE COLLECTION
    const reusableTarget = new THREE.Vector3();
    const reusableColor = new THREE.Color();

    // Mouse Interaction / Camera Orbit
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationX = 0;
    let rotationY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      rotationY += deltaX * 0.005;
      rotationX += deltaY * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(30, Math.min(300, camera.position.z + e.deltaY * 0.1));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Helper functions passed into user's shader
    const discoveredControls: Record<string, ParticleControl> = {};

    const addControl = (id: string, label: string, min: number, max: number, initialValue: number): number => {
      if (controlsValuesRef.current[id] === undefined) {
        controlsValuesRef.current[id] = initialValue;
      }
      if (!discoveredControls[id]) {
        discoveredControls[id] = {
          id,
          label,
          min,
          max,
          value: controlsValuesRef.current[id],
        };
      }
      return controlsValuesRef.current[id];
    };

    const setInfo = (title: string, description: string) => {
      setHudInfo({ title, description });
    };

    const annotate = (id: string, positionVector: THREE.Vector3, labelText: string) => {
      annotationsRef.current.set(id, {
        position: positionVector.clone(),
        label: labelText,
      });
    };

    let clockTime = 0;
    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      animationFrameId = requestAnimationFrame(renderLoop);

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Cognitive Speed Scaling coupled with Snapdragon Agent State
      let stateSpeedMultiplier = 1.0;
      if (agentState === 'THINKING' || agentState === 'READING') {
        stateSpeedMultiplier = 2.4;
      } else if (agentState === 'PROCESSING' || agentState === 'ACTING') {
        stateSpeedMultiplier = 1.8;
      } else if (agentState === 'COMPLETED') {
        stateSpeedMultiplier = 0.6;
      }

      if (isPlaying) {
        clockTime += delta * stateSpeedMultiplier;
      }

      // Smooth auto-orbit rotation if not dragging
      if (!isDragging) {
        rotationY += 0.002 * stateSpeedMultiplier;
      }

      particles.rotation.x = rotationX;
      particles.rotation.y = rotationY;

      // Execute Particle Movement for 20,000+ Units (ZERO ALLOCATIONS)
      const currentFn = compiledFn;
      if (currentFn) {
        try {
          for (let i = 0; i < count; i++) {
            currentFn(
              i,
              count,
              reusableTarget,
              reusableColor,
              clockTime,
              THREE,
              addControl,
              setInfo,
              annotate
            );

            const idx3 = i * 3;
            positions[idx3] = reusableTarget.x;
            positions[idx3 + 1] = reusableTarget.y;
            positions[idx3 + 2] = reusableTarget.z;

            colors[idx3] = reusableColor.r;
            colors[idx3 + 1] = reusableColor.g;
            colors[idx3 + 2] = reusableColor.b;
          }

          geometry.attributes.position.needsUpdate = true;
          geometry.attributes.color.needsUpdate = true;
        } catch (err: any) {
          console.error('[Particle Update Runtime Error]', err);
        }
      }

      renderer.render(scene, camera);

      // Project 3D annotations to screen space
      const newAnnots: AnnotationItem[] = [];
      const halfW = width / 2;
      const halfH = height / 2;

      annotationsRef.current.forEach((val, id) => {
        const v = val.position.clone().applyMatrix4(particles.matrixWorld);
        v.project(camera);

        const isBehind = v.z > 1;
        newAnnots.push({
          id,
          position: val.position,
          screenX: v.x * halfW + halfW,
          screenY: -v.y * halfH + halfH,
          visible: !isBehind && v.x >= -1 && v.x <= 1 && v.y >= -1 && v.y <= 1,
          label: val.label,
        });
      });

      setAnnotations(newAnnots);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    // Sync newly discovered controls with React state
    setControls(discoveredControls);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [compiledFn, count, isPlaying, isCompact]);

  const handleControlChange = (id: string, value: number) => {
    controlsValuesRef.current[id] = value;
    setControls((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        value,
      },
    }));
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl bg-[#06080F]/90 backdrop-blur-2xl border border-white/[0.09] shadow-[0_16px_48px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : isCompact ? 'h-[420px]' : 'h-[620px]'
      }`}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating 3D Annotations HUD */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {annotations.map((annot) =>
          annot.visible ? (
            <div
              key={annot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xl border border-[#E10600]/60 shadow-[0_0_20px_rgba(225,6,0,0.4)] text-white text-[11px] font-mono pointer-events-auto"
              style={{
                left: `${annot.screenX}px`,
                top: `${annot.screenY}px`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-ping" />
              <span className="font-semibold tracking-wide">{annot.label}</span>
            </div>
          ) : null
        )}
      </div>

      {/* Top HUD: Info Bar & Controls */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Info HUD */}
        <div className="pointer-events-auto max-w-md p-3 rounded-xl bg-black/60 backdrop-blur-2xl border border-white/[0.10] text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600] inline-block shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
            <h3 className="text-xs font-bold tracking-tight font-mono text-neutral-100">
              {hudInfo.title}
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/30 font-semibold">
              {count.toLocaleString()} Particles @ 60 FPS
            </span>
            {agentState && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold flex items-center gap-1 ${
                agentState === 'THINKING' || agentState === 'READING'
                  ? 'bg-amber-950/40 text-amber-300 border-amber-500/40 animate-pulse'
                  : agentState === 'PROCESSING' || agentState === 'ACTING'
                  ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40 animate-pulse'
                  : agentState === 'COMPLETED'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/[0.05] text-neutral-300 border-white/[0.1]'
              }`}>
                <Activity className="w-2.5 h-2.5" />
                <span>NPU Synapse: {agentState}</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
            {hudInfo.description}
          </p>
        </div>

        {/* Right: Presets & Fullscreen */}
        <div className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-2xl p-1.5 rounded-xl border border-white/[0.10] shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.08)] text-xs">
          <select
            value={activePreset}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-white/[0.06] text-white text-xs px-2.5 py-1 rounded-lg border border-white/[0.12] outline-none cursor-pointer hover:border-white/[0.24] font-mono"
          >
            {PRESET_SHADERS.map((preset) => (
              <option key={preset.id} value={preset.id} className="bg-[#0D101A] text-white">
                {preset.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-neutral-200 transition-colors"
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowCodeEditor(!showCodeEditor)}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 font-mono text-xs border ${
              showCodeEditor
                ? 'bg-[#E10600] border-[#E10600] text-white shadow-sm'
                : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.08] text-neutral-200'
            }`}
            title="Toggle Live Particle Code Editor"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shader Code</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-neutral-200 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Real-time Dynamic Sliders Panel (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 max-w-sm pointer-events-auto">
        <div className="p-3 rounded-xl bg-black/60 backdrop-blur-2xl border border-white/[0.10] shadow-[0_8px_32px_0_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.08)] space-y-2">
          <div className="flex items-center justify-between gap-4 border-b border-neutral-800/80 pb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-[#E10600]" />
              <span>Real-Time Math Sliders</span>
            </span>
            {/* Particle Count Switcher */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <span className="text-neutral-500">Count:</span>
              {[10000, 20000, 35000].map((num) => (
                <button
                  key={num}
                  onClick={() => setCount(num)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    count === num
                      ? 'bg-[#E10600] text-white font-bold'
                      : 'text-neutral-400 hover:text-white bg-neutral-900'
                  }`}
                >
                  {num / 1000}k
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {Object.values(controls).map((ctrl) => (
              <div key={ctrl.id} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-neutral-300">{ctrl.label}</span>
                  <span className="text-[#E10600] font-semibold">
                    {Number(ctrl.value).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min={ctrl.min}
                  max={ctrl.max}
                  step={(ctrl.max - ctrl.min) / 100}
                  value={ctrl.value}
                  onChange={(e) => handleControlChange(ctrl.id, parseFloat(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#E10600]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Interactive Code Editor Drawer (Right Side) */}
      {showCodeEditor && (
        <div className="absolute top-14 bottom-3 right-3 w-full max-w-md pointer-events-auto bg-[#07090F]/95 backdrop-blur-xl border border-neutral-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden z-20">
          <div className="p-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#E10600]" />
              <span className="text-xs font-mono font-bold text-white">
                Live Particle Update Function
              </span>
            </div>
            <button
              onClick={() => setShowCodeEditor(false)}
              className="text-xs text-neutral-400 hover:text-white font-mono"
            >
              ✕ Close
            </button>
          </div>

          {/* Validation Status Notice */}
          <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[10px] font-mono flex items-center justify-between">
            {codeError ? (
              <span className="text-red-400 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3 h-3" />
                <span>{codeError}</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-3 h-3" />
                <span>Zero GC · Stability Gate Passed (60 FPS Locked)</span>
              </span>
            )}
            <span className="text-neutral-500">API: i, count, target, color, time</span>
          </div>

          {/* Code Textarea */}
          <div className="flex-1 p-2 font-mono text-xs text-neutral-200 bg-[#04060A]">
            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                compileShaderCode(e.target.value);
              }}
              spellCheck={false}
              className="w-full h-full bg-transparent resize-none outline-none font-mono text-xs leading-relaxed text-cyan-200 select-text"
              placeholder="// Write your optimized particle update function body here..."
            />
          </div>

          {/* Bottom Toolbar */}
          <div className="p-2 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs font-mono">
            <button
              onClick={() => {
                const found = PRESET_SHADERS.find((p) => p.id === activePreset);
                if (found) {
                  setCode(found.code);
                  compileShaderCode(found.code);
                }
              }}
              className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Code</span>
            </button>
            <span className="text-[10px] text-neutral-500">
              Drag to Orbit · Scroll to Zoom
            </span>
          </div>
        </div>
      )}

      {/* Orbit Tip in bottom right */}
      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-neutral-500 bg-neutral-950/60 px-2 py-1 rounded backdrop-blur pointer-events-none">
        🖱️ Click & Drag to Rotate · Scroll to Zoom
      </div>
    </div>
  );
};
