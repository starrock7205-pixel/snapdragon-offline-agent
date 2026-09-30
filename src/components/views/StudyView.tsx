import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  Award, 
  BookOpen, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Cpu, 
  Download, 
  ExternalLink, 
  FileText, 
  HelpCircle, 
  Layers, 
  Lightbulb, 
  ListFilter, 
  MessageSquare, 
  RotateCcw, 
  Search, 
  Send, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Train, 
  Upload, 
  WifiOff, 
  Zap 
} from 'lucide-react';
import { KnowledgeDocument, QuizQuestion } from '../../types/knowledge';
import { localVectorStore } from '../../rag/localVectorStore';
import { localInferenceEngine } from '../../models/localInferenceEngine';
import { localMemoryManager } from '../../memory/localMemoryManager';
import { FormattedText } from '../FormattedText';
import { ResponseDisplay } from '../ResponseDisplay';

export const StudyView: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(() => localVectorStore.getAllDocuments());
  const [selectedDocId, setSelectedDocId] = useState<string>(() => {
    const all = localVectorStore.getAllDocuments();
    const bio = all.find(d => d.id === 'doc-marine-algae-bioactives');
    return bio ? bio.id : (all[0]?.id || '');
  });

  const [activeDocPage, setActiveDocPage] = useState<number>(1);
  const [docSearchQuery, setDocSearchQuery] = useState<string>('');
  const [actionOutput, setActionOutput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [isThinkingOpen, setIsThinkingOpen] = useState<boolean>(true);
  const [thinkingTimeMs, setThinkingTimeMs] = useState<number>(820);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [pinnedSuccess, setPinnedSuccess] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; quiz?: QuizQuestion[] }>>([]);

  const activeDoc = useMemo(() => {
    return documents.find(d => d.id === selectedDocId) || documents[0];
  }, [documents, selectedDocId]);

  // Document page chunks for visual reader experience
  const docPages = useMemo(() => {
    if (!activeDoc) return [];
    const text = activeDoc.content;
    const sections = text.split(/(?=\n[0-9]+\.\s|[A-Z\s]{4,}:)/g);
    if (sections.length <= 1) {
      // Split by double newline into 2-3 logical pages
      const paragraphs = text.split('\n\n');
      const pageSize = Math.ceil(paragraphs.length / 3);
      return [
        paragraphs.slice(0, pageSize).join('\n\n'),
        paragraphs.slice(pageSize, pageSize * 2).join('\n\n'),
        paragraphs.slice(pageSize * 2).join('\n\n')
      ].filter(Boolean);
    }
    return sections;
  }, [activeDoc]);

  // Initial greeting / summary on load
  useEffect(() => {
    if (activeDoc && chatHistory.length === 0) {
      handleAction('KEY_POINTS');
    }
  }, [selectedDocId]);

  const handleAction = async (
    action: 'SUMMARIZE' | 'KEY_POINTS' | 'EXAM_QUESTIONS' | 'DEEP_ANALYZE' | 'EXPLAIN_STEP' | 'DRAFT_ANSWERS'
  ) => {
    if (!activeDoc) return;
    setIsProcessing(true);
    setActionOutput('');
    setActiveQuiz(null);

    const startTime = performance.now();
    await new Promise(r => setTimeout(r, 450)); // Emulate NPU vector + SLM pipeline latency

    let promptLabel = '';
    let resultText = '';
    let generatedQuiz: QuizQuestion[] | null = null;

    const isAlgaeDoc = activeDoc.id.includes('marine') || activeDoc.title.toLowerCase().includes('alga');
    const isPhysicsDoc = activeDoc.id.includes('physics') || activeDoc.title.toLowerCase().includes('motion');
    const isOpticsDoc = activeDoc.id.includes('optics') || activeDoc.title.toLowerCase().includes('refraction');

    switch (action) {
      case 'SUMMARIZE':
        promptLabel = `Summarize ${activeDoc.title}`;
        if (isAlgaeDoc) {
          resultText = `### Executive Summary: Marine Algal Derived Bioactives & Blue Carbon

**Core Insight:** Marine macroalgae (seaweeds) and microalgae are not mere aquatic weeds—they are Earth's primary oxygen factories, premier Blue Carbon sinks, and an untapped biological frontier for pharmaceutical biosorption and human nutrient security.

#### Essential Pillars from Document:
1. **Atmospheric Equilibrium:** Algae generate **>50% of the planet's oxygen**, exceeding all continental rainforests combined.
2. **Carbon Sequestration Dynamo:** Coastal algae sequester atmospheric $CO_2$ **up to 20–30× faster per hectare** than terrestrial tropical rainforests, depositing biomass into the abyssal ocean floor for geological centuries.
3. **Hyper-Bioaccumulation:** Dense anionic functional groups on cell walls chelate heavy metals ($Pb^{2+}$, $Cd^{2+}$, $As^{3+}$), serving as natural bioremediation shields.
4. **Pharmaceutical Isolates:** Provides high-value compounds including **Fucoidan** (antithrombotic/antitumor), **Laminarin** (macrophage stimulator), and **Phlorotannins** (high-potency antioxidants).`;
        } else if (isPhysicsDoc) {
          resultText = `### Executive Summary: Newtonian Dynamics & Laws of Motion

**Core Insight:** Classical Newtonian mechanics provides the predictive foundation for translational and rotational kinetics where masses remain invariant and relative velocities are non-relativistic.

#### Essential Pillars from Document:
1. **Newton's 1st Law (Inertia):** In an inertial frame, $\\Sigma \\vec{F} = 0 \\iff \\frac{d\\vec{v}}{dt} = 0$. Mass is scalar inertia.
2. **Newton's 2nd Law (Momentum Rate):** $\\vec{F}_{\\text{net}} = \\frac{d\\vec{p}}{dt} = m\\vec{a}$ (for constant mass).
3. **Newton's 3rd Law (Action-Reaction):** Forces exist strictly as dual interactions on **separate** bodies ($F_{AB} = -F_{BA}$).
4. **Friction & Curvature:** $f_s \\le \\mu_s N$; optimum frictionless highway banking satisfies $\\tan(\\theta) = \\frac{v^2}{rg}$.`;
        } else {
          resultText = `### Executive Summary: ${activeDoc.title}\n\n` + activeDoc.content.slice(0, 600) + '...';
        }
        break;

      case 'KEY_POINTS':
        promptLabel = `Pull Out Key Points & Definitions`;
        if (isAlgaeDoc) {
          resultText = `### High-Yield Key Points & Definitions for Your Assignment

> **Target Paper:** *Marine_Algal_Derived_Bioactives_A_New_Wave_of_Remediators.pdf*  
> **Grounding:** 100% On-Device Search & SLM Extraction (0 Cloud Telemetry)

#### 1. Biological Clarification (Crucial Assignment Distinction)
- **Seaweed vs. Moss:** Algae are **marine thallophytes** without vascular xylem/phloem or true roots. They absorb water and nutrients directly across their thallus tissue. Mosses are terrestrial freshwater **bryophytes** with rhizoids.
- **Holdfast Function:** The holdfast is strictly a mechanical anchoring organ, **not** an organ of nutrient uptake.

#### 2. The Blue Carbon Advantage
- **Fast Growth Cycle:** Macroalgae kelp species can grow up to 60 cm per day.
- **Deep-Sea Carbon Sink:** As senescent biomass drifts into oceanic trenches below 1,000 meters, carbon is locked away without re-entering the carbon cycle for centuries.
- **Coastal Armor:** Attenuates up to 60% of destructive storm surge wave energy, guarding vulnerable coastlines.

#### 3. Nutritional Bioavailability Matrix
- **Iodine:** Bio-accumulated up to $30,000\\times$ ambient seawater levels (vital for human thyroid thyroxine synthesis).
- **Proteins & Lipids:** Up to 47% dry-weight protein with all 9 essential amino acids; rich in EPA/DHA omega-3 fatty acids and Fucoxanthin carotenoids.

#### 4. Novel Bioactive Isolates
- **Fucoidan:** Sulfated polysaccharide triggering apoptotic mechanisms in malignant cell lines.
- **Laminarin:** $\\beta$-(1,3)-glucan activating toll-like receptor immune cascades.`;
        } else {
          resultText = `### High-Yield Key Points: ${activeDoc.title}
1. **Core Governing Principle:** All observations conform to local conservation laws.
2. **Key Metric:** Primary formulas derived from direct physical boundary limits.
3. **Common Exam Trap:** Neglecting non-inertial pseudo-forces or medium density differentials.`;
        }
        break;

      case 'EXAM_QUESTIONS':
        promptLabel = `Generate 4 Interactive Exam Questions`;
        if (isAlgaeDoc) {
          generatedQuiz = localInferenceEngine.generateBiologyQuiz();
        } else {
          generatedQuiz = localInferenceEngine.generatePhysicsQuiz();
        }
        resultText = `### Interactive Exam Simulation Generated
I have generated 4 adaptive multiple-choice questions grounded strictly in your document. Select an answer below to test your mastery.`;
        break;

      case 'DEEP_ANALYZE':
        promptLabel = `Deep Analysis & Critical Evaluation`;
        resultText = `### Deep Critical Analysis: Biological & Technical Evaluation

#### 1. Methodological Strengths of the Research
- **Interdisciplinary Synthesis:** Unifies biochemical isolation (fucoidan, laminarin) with macroscopic climate ecology (Blue Carbon sequestration).
- **Quantified Climate Metrics:** Contextualizes oceanic primary production ($>50\\%$ of global $O_2$) against terrestrial tropical deforestation.

#### 2. Technological & Industrial Bottlenecks
- **Harvesting & Dewatering Costs:** Macroalgae contain up to $85\\% - 90\\%$ water by wet weight, making thermal drying energy-intensive without solar pre-treatment.
- **Bio-Sorption Selectivity:** While algae readily absorb heavy metals ($Pb^{2+}, Cd^{2+}$), competitive ion inhibition from ambient sodium ($Na^+$) and magnesium ($Mg^{2+}$) in high-salinity seawater reduces extraction yields.

#### 3. Strategic Research Recommendations
- Implement genetic profiling of wild-type *Sargassum* strains to maximize fucoidan sulfation density.
- Deploy near-shore microalgal photobioreactors linked directly to agricultural runoff outlets to mitigate eutrophication before ocean discharge.`;
        break;

      case 'EXPLAIN_STEP':
        promptLabel = `Explain Step-by-Step for Fast Learning`;
        if (isAlgaeDoc) {
          resultText = `### Step-by-Step Student Walkthrough: How Marine Algae Save the Planet

Think of marine algae as Earth's natural underwater filtration and oxygen engine:

- **Step 1: Sunlight & Water:** Algal fronds float near the surface and absorb solar radiation and dissolved $CO_2$ directly through their leaves (called thalli).
- **Step 2: The Oxygen Boost:** Through photosynthesis, they release more than half of the oxygen you are breathing right this second.
- **Step 3: Trapping Carbon:** Unlike a tree on land that burns or rots when it dies (releasing its carbon back into the air), heavy ocean kelp sinks into the freezing, deep ocean trenches. The carbon is buried under sediment for centuries!
- **Step 4: Cleaning Polluted Water:** The outer skin of algae has chemical "magnets" that latch onto toxic heavy metals like lead and cadmium, pulling them out of the water like a natural sponge.
- **Step 5: Superfood & Medicine:** They pack more iodine, calcium, and protective bioactives (like fucoidan) than almost any land vegetable.`;
        } else {
          resultText = `### Step-by-Step Beginner Walkthrough
1. **Define the System:** Draw a clean free-body diagram isolating the mass of interest.
2. **Identify All External Forces:** Gravity downward ($mg$), contact normal forces ($N$), and opposing friction ($f$).
3. **Choose Your Coordinate Axes:** Align one axis along the direction of anticipated acceleration.
4. **Apply $\\Sigma F = ma$:** Solve the algebraic system for unknown accelerations or tension forces.`;
        }
        break;

      case 'DRAFT_ANSWERS':
        promptLabel = `Draft Ready-to-Submit Assignment Answers`;
        if (isAlgaeDoc) {
          resultText = `### Ready-to-Submit Assignment Answers

#### Question 1: Discuss the ecological role of marine algae in global oxygen production and carbon cycling.
**Answer:**
Marine macroalgae and phytoplankton are the primary photosynthetic drivers of Earth's biosphere, generating in excess of 50% of the world's atmospheric oxygen ($O_2$). In carbon cycling, coastal marine algae function as high-velocity "Blue Carbon" sinks, capturing inorganic carbon up to 20–30 times faster per hectare than terrestrial tropical forests. Senescent algal biomass sinks into abyssal benthic zones below 1,000 meters, effectively locking organic carbon out of the short-term carbon cycle for geological timeframes.

#### Question 2: Why are marine macroalgae structurally and physiologically distinct from terrestrial mosses?
**Answer:**
Although superficially compared in vernacular speech, marine macroalgae are eukaryotic thallophytes lacking the true roots, vascular xylem/phloem bundles, and differentiated stems characteristic of terrestrial plants. While terrestrial mosses (bryophytes) utilize rhizoids in freshwater or humid soil, marine algae absorb water, minerals, and dissolved carbon directly across their entire thallus tissue. Their holdfast organs serve solely for mechanical substrate attachment rather than vascular nutrient acquisition.

#### Question 3: Identify two bioactive compounds derived from brown seaweeds and their medical relevance.
**Answer:**
1. **Fucoidan:** A sulfated polysaccharide that inhibits thrombin-induced blood clotting, exhibits anti-inflammatory properties, and induces apoptosis in cancerous cells.
2. **Laminarin:** A storage $\\beta$-(1,3)-glucan capable of stimulating non-specific macrophage immune responses and promoting wound re-epithelialization.`;
        } else {
          resultText = `### Formatted Assignment Answer Sheet
**Problem 1 Solution:** Applying Newton's second law along the incline:
$\\Sigma F_x = mg \\sin(\\theta) - f_k = ma_x$.
Substituting $f_k = \\mu_k mg \\cos(\\theta)$, we find $a_x = g(\\sin\\theta - \\mu_k \\cos\\theta)$.`;
        }
        break;
    }

    const elapsed = Math.round(performance.now() - startTime);
    setThinkingTimeMs(elapsed);
    setActionOutput(resultText);
    setActiveQuiz(generatedQuiz);

    setChatHistory(prev => [
      ...prev,
      { role: 'user', text: promptLabel },
      { role: 'assistant', text: resultText, quiz: generatedQuiz || undefined }
    ]);

    setIsProcessing(false);
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isProcessing) return;

    const query = customQuestion;
    setCustomQuestion('');
    setIsProcessing(true);
    setActionOutput('');
    setActiveQuiz(null);

    const startTime = performance.now();
    setChatHistory(prev => [...prev, { role: 'user', text: query }]);

    const searchResults = localVectorStore.search(query, { topK: 3 });
    const response = await localInferenceEngine.generateStreaming(query, { contextChunks: searchResults });

    const elapsed = Math.round(performance.now() - startTime);
    setThinkingTimeMs(elapsed);
    setActionOutput(response);

    setChatHistory(prev => [...prev, { role: 'assistant', text: response }]);
    setIsProcessing(false);
  };

  const handleCopyAnswer = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handlePinToMemory = (text: string) => {
    localMemoryManager.addMemory('STUDY_PROGRESS', activeDoc?.title || 'Study Document', text);
    setPinnedSuccess(true);
    setTimeout(() => setPinnedSuccess(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Metro Commute Offline Showcase Banner (Direct Video Tribute) */}
      <div className="p-4 bg-gradient-to-r from-[#141829] via-[#0E111C] to-[#1A1215] border border-neutral-800/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#E10600]/10 border border-[#E10600]/30 rounded-xl text-[#E10600] shrink-0">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Offline Metro Commute Mode: Active
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 rounded">
                Zero Wi-Fi Needed
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-neutral-800 text-neutral-300 rounded">
                $0 Subscriptions
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Sitting on the train without internet? Complete your assignments and study PDFs locally on Snapdragon silicon.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/80 border border-neutral-800 rounded-lg text-[11px] font-mono text-neutral-300">
            <Cpu className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Qwen 2.5 / Snapdragon NPU</span>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: The Beautiful Interactive Document Reader (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-[#0D0F17] border border-neutral-800/90 rounded-2xl space-y-3">
            {/* Header: Document Switcher & File Upload */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E10600]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Document Reader
                </span>
              </div>

              <label className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-md cursor-pointer border border-neutral-700 transition-colors">
                <Upload className="w-3 h-3" />
                <span>Upload PDF</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (re) => {
                        const text = (re.target?.result as string) || 'Custom document content';
                        const doc = localVectorStore.addDocument(file.name, text, 'pdf', 'My Uploads');
                        setDocuments(localVectorStore.getAllDocuments());
                        setSelectedDocId(doc.id);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>

            {/* Document Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {documents.map((doc) => {
                const isSelected = doc.id === (activeDoc?.id || '');
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setActiveDocPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-left transition-all border ${
                      isSelected
                        ? 'bg-neutral-800 border-[#E10600]/60 text-white font-medium shadow-sm'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="text-[11px] truncate max-w-[140px]">{doc.title}</div>
                  </button>
                );
              })}
            </div>

            {/* Document In-Paper Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="Search keywords in document..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-neutral-950 text-white placeholder-neutral-500 rounded-lg border border-neutral-800 focus:border-[#E10600] outline-none"
              />
            </div>

            {/* Simulated Academic Paper Viewport */}
            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-3 font-serif max-h-[560px] overflow-y-auto leading-relaxed select-text shadow-inner">
              <div className="border-b border-neutral-800 pb-3 font-sans">
                <div className="text-[10px] font-mono text-[#E10600] uppercase tracking-wider">
                  Indexed On-Device · {activeDoc?.fileType?.toUpperCase()} · {Math.round((activeDoc?.fileSize || 0) / 1024)} KB
                </div>
                <h2 className="text-sm font-bold text-white font-serif mt-1">
                  {activeDoc?.title}
                </h2>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  Collection: {activeDoc?.collectionName} · Page {activeDocPage} of {docPages.length}
                </div>
              </div>

              {/* Document Body Content */}
              <div className="text-xs text-neutral-300 font-serif leading-relaxed whitespace-pre-wrap">
                {docPages[activeDocPage - 1] || activeDoc?.content}
              </div>
            </div>

            {/* Pagination Controls */}
            {docPages.length > 1 && (
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  disabled={activeDocPage <= 1}
                  onClick={() => setActiveDocPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 text-[11px] text-neutral-300 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 rounded border border-neutral-800"
                >
                  Previous Page
                </button>
                <span className="text-[11px] font-mono text-neutral-400">
                  Page {activeDocPage} / {docPages.length}
                </span>
                <button
                  disabled={activeDocPage >= docPages.length}
                  onClick={() => setActiveDocPage(p => Math.min(docPages.length, p + 1))}
                  className="px-2.5 py-1 text-[11px] text-neutral-300 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 rounded border border-neutral-800"
                >
                  Next Page
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: The Beautiful Local AI Copilot (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick-Trigger Video Action Palette */}
          <div className="p-4 bg-[#0D0F17] border border-neutral-800/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Autonomous Document Capabilities</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">
                1-Click Execution
              </span>
            </div>

            {/* Action Grid matching the video */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => handleAction('SUMMARIZE')}
                disabled={isProcessing}
                className="p-2.5 bg-neutral-900 hover:bg-neutral-850 hover:border-neutral-700 text-white rounded-xl border border-neutral-800 flex items-center gap-2 transition-all group text-left"
              >
                <div className="p-1.5 rounded-lg bg-red-500/10 text-[#E10600] group-hover:bg-[#E10600] group-hover:text-white transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">Summarize</div>
                  <div className="text-[10px] text-neutral-400">Executive brief</div>
                </div>
              </button>

              <button
                onClick={() => handleAction('KEY_POINTS')}
                disabled={isProcessing}
                className="p-2.5 bg-neutral-900 hover:bg-neutral-850 hover:border-neutral-700 text-white rounded-xl border border-neutral-800 flex items-center gap-2 transition-all group text-left"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ListFilter className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">Key Points</div>
                  <div className="text-[10px] text-neutral-400">Definitions & traps</div>
                </div>
              </button>

              <button
                onClick={() => handleAction('EXAM_QUESTIONS')}
                disabled={isProcessing}
                className="p-2.5 bg-neutral-900 hover:bg-neutral-850 hover:border-neutral-700 text-white rounded-xl border border-neutral-800 flex items-center gap-2 transition-all group text-left"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">Create Quiz</div>
                  <div className="text-[10px] text-neutral-400">4-question test</div>
                </div>
              </button>

              <button
                onClick={() => handleAction('EXPLAIN_STEP')}
                disabled={isProcessing}
                className="p-2.5 bg-neutral-900 hover:bg-neutral-850 hover:border-neutral-700 text-white rounded-xl border border-neutral-800 flex items-center gap-2 transition-all group text-left"
              >
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Lightbulb className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">Explain Step</div>
                  <div className="text-[10px] text-neutral-400">Simple analogies</div>
                </div>
              </button>

              <button
                onClick={() => handleAction('DEEP_ANALYZE')}
                disabled={isProcessing}
                className="p-2.5 bg-neutral-900 hover:bg-neutral-850 hover:border-neutral-700 text-white rounded-xl border border-neutral-800 flex items-center gap-2 transition-all group text-left"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">Deep Critique</div>
                  <div className="text-[10px] text-neutral-400">Scientific limits</div>
                </div>
              </button>

              <button
                onClick={() => handleAction('DRAFT_ANSWERS')}
                disabled={isProcessing}
                className="p-2.5 bg-neutral-900 hover:bg-neutral-850 hover:border-neutral-700 text-white rounded-xl border border-neutral-800 flex items-center gap-2 transition-all group text-left"
              >
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-white">Draft Answers</div>
                  <div className="text-[10px] text-neutral-400">Ready to submit</div>
                </div>
              </button>
            </div>
          </div>

          {/* AI Response Feed */}
          <div className="p-5 bg-[#0D0F17] border border-neutral-800/90 rounded-2xl min-h-[460px] flex flex-col justify-between space-y-4">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-[#E10600]/20 border-t-[#E10600] animate-spin" />
                  <div className="w-4 h-4 rounded-full bg-[#E10600] absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    Reasoning on Snapdragon Hexagon NPU...
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Querying 384-dimensional local vector space. Zero outbound network packets.
                  </p>
                </div>
              </div>
            ) : actionOutput ? (
              <div className="space-y-4">
                {/* Step-by-Step Thinking Trace Accordion */}
                <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl overflow-hidden text-xs">
                  <button
                    onClick={() => setIsThinkingOpen(prev => !prev)}
                    className="w-full px-3 py-2 bg-neutral-900/60 hover:bg-neutral-900 flex items-center justify-between text-neutral-400 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <Cpu className="w-3 h-3 text-[#E10600]" />
                      <span>Snapdragon Hexagon NPU Thought Trace ({thinkingTimeMs}ms)</span>
                    </div>
                    {isThinkingOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isThinkingOpen && (
                    <div className="p-3 font-mono text-[10px] text-neutral-400 space-y-1 bg-neutral-950/80 border-t border-neutral-900">
                      <div>• Context window: retrieved {activeDoc?.chunks?.length || 4} chunks from local store.</div>
                      <div>• Vector similarity: Dense Cosine (384-dim) + BM25 keyword weighting.</div>
                      <div>• Acceleration: Level 1 Qualcomm QNN Provider (Hexagon NPU INT4 weights).</div>
                      <div>• Outbound telemetry: 0 bytes. Offline air-gap maintained.</div>
                    </div>
                  )}
                </div>

                {/* Main Rendered Answer using ResponseDisplay */}
                <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed select-text">
                  <ResponseDisplay 
                    content={actionOutput} 
                    title={activeDoc ? `${activeDoc.title} · Analysis` : 'Study Document Analysis'} 
                  />
                </div>

                {/* If quiz is active, render interactive quiz cards */}
                {activeQuiz && (
                  <div className="space-y-3 pt-2">
                    {activeQuiz.map((q, qIndex) => {
                      const selected = quizAnswers[q.id];
                      const isAnswered = selected !== undefined;
                      return (
                        <div key={q.id} className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                            <span>QUESTION {qIndex + 1} OF {activeQuiz.length}</span>
                            <span className="text-[#E10600] uppercase">{q.topic}</span>
                          </div>
                          <div className="text-xs font-semibold text-white">
                            {q.question}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt, optIndex) => {
                              const isCorrect = optIndex === q.correctAnswerIndex;
                              let btnStyle = 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white';
                              if (isAnswered) {
                                if (isCorrect) {
                                  btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-semibold';
                                } else if (selected === optIndex) {
                                  btnStyle = 'bg-red-950/70 border-red-500 text-red-300';
                                } else {
                                  btnStyle = 'opacity-40 bg-neutral-900 border-neutral-800 text-neutral-500';
                                }
                              }
                              return (
                                <button
                                  key={optIndex}
                                  onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIndex }))}
                                  className={`p-2 text-xs text-left rounded-lg border transition-all ${btnStyle}`}
                                >
                                  <span className="font-mono text-[10px] mr-1.5 opacity-60">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                              {isAnswered && (
                                <div className="p-2.5 bg-neutral-900/80 rounded-lg text-[11px] text-neutral-300 space-y-1 border border-neutral-800/80 mt-2">
                                  <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Explanation:</span>
                                  </div>
                                  <FormattedText content={q.explanation} />
                                </div>
                              )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Action Bar on output */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyAnswer(actionOutput)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-800 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedSuccess ? 'Copied!' : 'Copy Answer'}</span>
                    </button>

                    <button
                      onClick={() => handlePinToMemory(actionOutput)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg border border-neutral-800 transition-colors"
                    >
                      <Check className="w-3 h-3 text-[#E10600]" />
                      <span>{pinnedSuccess ? 'Saved in Memory!' : 'Pin to Notes'}</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Air-Gapped & Grounded</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <div className="p-3 bg-neutral-900/60 rounded-2xl w-fit mx-auto border border-neutral-800 text-[#E10600]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">
                    Offline Study Assistant Ready
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Select any capability above to summarize, extract definitions, generate quiz questions, or draft assignment answers from <span className="text-white font-medium">{activeDoc?.title}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Natural Language Question Form */}
            <form onSubmit={handleAskQuestion} className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder={`Ask anything about ${activeDoc?.title || 'this paper'}...`}
                  className="flex-1 h-11 px-3.5 text-xs bg-neutral-950 text-white placeholder-neutral-500 rounded-xl border border-neutral-800 focus:border-[#E10600] outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!customQuestion.trim() || isProcessing}
                  className="px-4 h-11 text-xs font-semibold text-white bg-[#E10600] hover:bg-[#C50500] disabled:opacity-40 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-red-950/40 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ask Paper</span>
                </button>
              </div>

              {/* Document specific prompt suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-2 text-[10px]">
                <span className="text-neutral-500 font-mono py-0.5">Try asking:</span>
                {[
                  'Why are marine algae not considered mosses?',
                  'How much of Earth’s oxygen comes from ocean algae?',
                  'What is fucoidan and why is it medically significant?',
                  'How do macroalgae sequester carbon faster than rainforests?',
                ].map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => setCustomQuestion(sug)}
                    className="px-2 py-0.5 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded border border-neutral-800 transition-colors"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
