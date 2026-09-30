export type HardwareTier = 
  | 'LEVEL_1_SNAPDRAGON_NPU' 
  | 'LEVEL_2_SNAPDRAGON_GPU_CPU' 
  | 'LEVEL_3_HOST_CPU_FALLBACK';

export interface HardwareInfo {
  detectedPlatform: string;
  isQualcommSnapdragon: boolean;
  snapdragonModel?: string; // e.g., 'Snapdragon X Elite', 'Snapdragon 8 Gen 3', etc.
  npuAvailable: boolean;
  npuEngineName: string; // e.g. 'Hexagon NPU (QNN/WebNN)', 'Emulated / Not Detected'
  gpuAvailable: boolean;
  gpuRenderer?: string;
  cpuCores: number;
  deviceMemoryGB: number;
  webAssemblySimd: boolean;
  webGpuSupported: boolean;
  webNnSupported: boolean;
  activeTier: HardwareTier;
  activeAccelerator: 'NPU' | 'GPU' | 'CPU';
  runtimeEngine: string; // e.g. 'Qualcomm AI Runtime / QNN', 'WebGPU Direct', 'WASM SIMD Fallback'
}

export interface BenchmarkResult {
  timestamp: number;
  accelerator: 'NPU' | 'GPU' | 'CPU';
  modelPrecision: 'INT4' | 'INT8' | 'FP16' | 'FP32';
  measuredLatencyMs: number;
  measuredTokensPerSec: number;
  measuredMemoryMb: number;
  vectorSimilarityOpsPerSec: number;
  samplePrompt: string;
  generatedTokens: number;
}
