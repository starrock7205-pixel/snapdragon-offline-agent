import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Copy, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Save, 
  Sparkles, 
  Video 
} from 'lucide-react';
import { virtualFileSystem } from '../../tools/virtualFileSystem';

export const CreateView: React.FC = () => {
  const [creativeType, setCreativeType] = useState<'SCRIPT' | 'OUTLINE' | 'STORYBOARD' | 'STUDY_GUIDE'>('SCRIPT');
  const [prompt, setPrompt] = useState<string>('Physics educational video script explaining non-inertial frames and pseudo-forces for high school students');
  const [generatedContent, setGeneratedContent] = useState<string>(`# Video Script: Why You Feel Heavier in Elevators (Non-Inertial Reference Frames)
Format: 2-Minute Educational Short
Presenter: Solo Instructor with Chalkboard Animation

---

[SCENE 1: HOOK (00:00 - 00:25)]
(Visual: Fast zoom onto an elevator floor. A bathroom scale reads 70 kg, then jumps to 90 kg as the elevator surges upwards.)
PRESENTER (On-camera, energetic):
"Ever stepped into a high-speed elevator, pushed floor 40, and suddenly felt your stomach drop into your shoes? You aren't imagining things. For about 3 seconds, you actually weigh more. But gravity didn't get stronger... so what happened?"

[SCENE 2: THE INERTIAL CONFLICT (00:26 - 01:05)]
(Visual: Split screen. Left: Observer outside watching elevator accelerate at a = 2.5 m/s². Right: Passenger inside experiencing pseudo-force -m*a.)
PRESENTER (Voiceover with chalkboard overlay):
"To someone standing in the hallway, Newton's second law is simple: the floor pushes UP on your feet with force N = m(g + a) to accelerate your body.
But to YOU inside that closed metal box, you aren't moving relative to the walls. To make physics work from your viewpoint, you have to invent an inertial phantom: the Pseudo-Force.
F_pseudo = -m * a."

[SCENE 3: THE CALCULATION & WRAP (01:06 - 01:50)]
(Visual: Large glowing formula: W_apparent = m(g + a).)
PRESENTER (Holding marker):
"If mass is 70 kg and acceleration is 2.5 m/s²:
Effective gravity is 9.8 + 2.5 = 12.3 m/s².
Your scale reads 861 Newtons—an apparent weight increase of 25%!
Remember this for tomorrow's midterm: never forget the minus sign on the frame acceleration vector!"

[END CARD (01:51 - 02:00)]
(Text on screen: Generated locally on Snapdragon Offline Workstation. No cloud connection used.)`);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 600));

    if (creativeType === 'OUTLINE') {
      setGeneratedContent(`# Presentation Outline: High-Speed Edge AI on Qualcomm Snapdragon

## Slide 1: Title & Vision
- Snapdragon Offline Agent: Local Intelligence, Zero Connectivity Required
- Shifting intelligence from hyperscale datacenters onto student workstations

## Slide 2: The Hexagon NPU Advantage
- Dedicated INT4 tensor cores vs. CPU SIMD fallback
- Thermal efficiency: Running 1.2B SLM at sub-5W power envelope

## Slide 3: Architecture: Understand → Think → Plan → Act → Remember
- Intent classification & local vector retrieval (Local RAG)
- Permissioned local tools & virtual filesystem boundary
- Local user memory stored in browser IndexedDB

## Slide 4: Real-World Scenarios
- Offline lecture transcription in low-connectivity hostels
- Private PDF study assistant with automated quiz synthesis
- Local code bug fixing with interactive diff approval`);
    } else if (creativeType === 'STORYBOARD') {
      setGeneratedContent(`# Storyboard & Shot List: The Disconnected Classroom

## Shot 1: Wide establishing shot
- **Setting:** Crowded university lecture hall during a thunderstorm.
- **Action:** Campus Wi-Fi disconnects. Laptops display connection error screens.
- **Audio:** Ambient rain, student murmuring.

## Shot 2: Close-up on Snapdragon Laptop
- **Visual:** Screen shows "OFFLINE ● INTERNET: DISCONNECTED".
- **Action:** Student clicks "Start Lecture Recording". Real-time transcript streams immediately with zero latency.
- **Audio:** Clear voice of professor discussing Snell's Law.

## Shot 3: Agent Timeline Execution
- **Visual:** The Offline Intelligence Core pulses. The agent automatically indexes the lecture transcript, extracts 4 exam formulas, and writes a Markdown study guide to local storage.`);
    }

    setIsGenerating(false);
  };

  const handleSaveToWorkspace = () => {
    const filename = `/workspace/notes/creative_${creativeType.toLowerCase()}_${Date.now()}.md`;
    virtualFileSystem.writeFile(filename, generatedContent);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="text-[11px] font-mono text-[#E10600] uppercase tracking-wider">
            Local Text Synthesis & Document Transformation
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            Offline Creation Workspace
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToWorkspace}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedStatus ? 'Saved to /workspace' : 'Save to Workspace'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Creative Options & Notice */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-[#10121A] border border-neutral-800 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Creative Format
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'SCRIPT', label: 'Video Script' },
                { id: 'OUTLINE', label: 'Presentation' },
                { id: 'STORYBOARD', label: 'Storyboard' },
                { id: 'STUDY_GUIDE', label: 'Study Guide' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setCreativeType(fmt.id as any)}
                  className={`p-2.5 rounded-lg text-xs font-medium transition-colors text-center border ${
                    creativeType === fmt.id
                      ? 'bg-white text-neutral-900 border-white'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-mono text-neutral-400 uppercase">Topic / Instructions</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs bg-neutral-950 text-white rounded-lg border border-neutral-800 focus:border-[#E10600] outline-none resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-white bg-[#E10600] hover:bg-[#C50500] disabled:opacity-40 rounded-lg transition-colors shadow-md shadow-red-950/40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Locally</span>
            </button>
          </div>

          {/* Honest Notice as mandated by specification */}
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Image & Video Diffusion Status</span>
            </div>
            <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 text-[11px] font-mono text-neutral-400">
              LOCAL GENERATION MODEL NOT INSTALLED
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Text, scripts, outlines, and documents run 100% locally on the Snapdragon SLM. Heavy on-device text-to-image diffusion requires downloading an optional 4GB ONNX checkpoint.
            </p>
          </div>
        </div>

        {/* Right Column: Editor / Preview */}
        <div className="lg:col-span-8">
          <div className="p-4 bg-[#10121A] border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
              <span className="font-mono text-white">Document Preview ({creativeType})</span>
              <span className="text-[10px] font-mono text-emerald-400">Zero Cloud Dependency</span>
            </div>

            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              rows={18}
              className="w-full p-4 bg-neutral-950 text-xs sm:text-sm font-mono text-neutral-200 rounded-lg border border-neutral-800 focus:border-[#E10600] outline-none leading-relaxed resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
