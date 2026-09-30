import { PlannedTask, TaskBatch } from '../types/agent';
import { IntentResult } from './intentClassifier';

export function buildBatchesForTasks(tasks: PlannedTask[]): { tasks: PlannedTask[]; batches: TaskBatch[] } {
  if (tasks.length === 0) return { tasks: [], batches: [] };

  // Parallel Ingestion Tools (can safely run concurrently with zero race conditions)
  const PARALLEL_INGESTION_TOOLS = new Set([
    'SEARCH_FILES',
    'PARSE_PDF',
    'TRANSCRIBE_AUDIO',
    'LIST_DIRECTORY',
    'READ_FILE',
    'SCAN_WORKSPACE',
  ]);

  // Parallel Synthesis & Artifact Generation Tools
  const PARALLEL_PERSISTENCE_TOOLS = new Set([
    'CREATE_NOTE',
    'CREATE_REPORT',
    'WRITE_FILE',
    'SAVE_NOTES',
  ]);

  const batchMap: Map<number, PlannedTask[]> = new Map();
  const batchTitles: Map<number, string> = new Map();
  const batchParallelFlags: Map<number, boolean> = new Map();

  // Strategy: Group tasks into logical execution stages
  // If task list has <= 2 tasks, single or dual batch
  if (tasks.length <= 2) {
    tasks.forEach((t, i) => {
      const bNum = i + 1;
      t.batchNumber = bNum;
      t.batchId = `batch-${bNum}`;
      batchMap.set(bNum, [t]);
      batchTitles.set(bNum, `Stage ${bNum}: ${t.title}`);
      batchParallelFlags.set(bNum, false);
    });
  } else {
    // Stage 1: Ingestion / File Discovery
    const stage1: PlannedTask[] = [];
    // Stage 2: Retrieval / Execution / Diagnosis
    const stage2: PlannedTask[] = [];
    // Stage 3: Neural Synthesis / Reasoning / Quiz
    const stage3: PlannedTask[] = [];
    // Stage 4: Artifact Persistence / Verification
    const stage4: PlannedTask[] = [];

    tasks.forEach(task => {
      if (task.toolName && PARALLEL_INGESTION_TOOLS.has(task.toolName)) {
        stage1.push(task);
      } else if (
        task.toolName === 'SEARCH_LOCAL_KNOWLEDGE' ||
        task.toolName === 'RUN_LOCAL_SCRIPT' ||
        task.title.toLowerCase().includes('inspect') ||
        task.title.toLowerCase().includes('diagnose')
      ) {
        stage2.push(task);
      } else if (
        task.toolName && PARALLEL_PERSISTENCE_TOOLS.has(task.toolName) ||
        task.title.toLowerCase().includes('save') ||
        task.title.toLowerCase().includes('record')
      ) {
        stage4.push(task);
      } else {
        // Reasoning / Synthesis / Quiz / Proofs
        stage3.push(task);
      }
    });

    let currentBatchNum = 1;
    if (stage1.length > 0) {
      batchMap.set(currentBatchNum, stage1);
      batchTitles.set(
        currentBatchNum,
        `Batch ${currentBatchNum}: Parallel Ingestion & Audio Discovery (${stage1.length} Tasks Concurrent)`
      );
      batchParallelFlags.set(currentBatchNum, stage1.length > 1);
      stage1.forEach(t => {
        t.batchNumber = currentBatchNum;
        t.batchId = `batch-${currentBatchNum}`;
      });
      currentBatchNum++;
    }

    if (stage2.length > 0) {
      batchMap.set(currentBatchNum, stage2);
      batchTitles.set(
        currentBatchNum,
        `Batch ${currentBatchNum}: Grounded Retrieval & Diagnostic Traceback (${stage2.length} Task${stage2.length > 1 ? 's' : ''})`
      );
      batchParallelFlags.set(currentBatchNum, stage2.length > 1);
      stage2.forEach(t => {
        t.batchNumber = currentBatchNum;
        t.batchId = `batch-${currentBatchNum}`;
      });
      currentBatchNum++;
    }

    if (stage3.length > 0) {
      batchMap.set(currentBatchNum, stage3);
      batchTitles.set(
        currentBatchNum,
        `Batch ${currentBatchNum}: Concurrent Neural Synthesis & Quiz Formulation (${stage3.length} Tasks Concurrent)`
      );
      batchParallelFlags.set(currentBatchNum, stage3.length > 1);
      stage3.forEach(t => {
        t.batchNumber = currentBatchNum;
        t.batchId = `batch-${currentBatchNum}`;
      });
      currentBatchNum++;
    }

    if (stage4.length > 0) {
      batchMap.set(currentBatchNum, stage4);
      batchTitles.set(
        currentBatchNum,
        `Batch ${currentBatchNum}: Persistence & Verification Pipeline (${stage4.length} Tasks Concurrent)`
      );
      batchParallelFlags.set(currentBatchNum, stage4.length > 1);
      stage4.forEach(t => {
        t.batchNumber = currentBatchNum;
        t.batchId = `batch-${currentBatchNum}`;
      });
      currentBatchNum++;
    }
  }

  const batches: TaskBatch[] = [];
  Array.from(batchMap.keys()).sort((a, b) => a - b).forEach(bNum => {
    const bTasks = batchMap.get(bNum)!;
    batches.push({
      id: `batch-${bNum}`,
      batchNumber: bNum,
      title: batchTitles.get(bNum) || `Batch ${bNum}`,
      taskIds: bTasks.map(t => t.id),
      status: 'PENDING',
      canRunInParallel: batchParallelFlags.get(bNum) ?? (bTasks.length > 1),
    });
  });

  return { tasks, batches };
}

export function planTasksForGoal(goal: string, intentResult: IntentResult): PlannedTask[] {
  switch (intentResult.intent) {
    case 'STUDY_EXAM_PREPARATION':
      return [
        {
          id: 'task-1',
          stepNumber: 1,
          title: 'Detect and Locate Local Study Documents',
          description: 'Scan /workspace/physics for relevant PDFs, notes, and past exam question papers.',
          toolName: 'SEARCH_FILES',
          toolArgs: { query: 'physics' },
          status: 'PENDING',
        },
        {
          id: 'task-2',
          stepNumber: 2,
          title: 'Extract Content from Laws of Motion PDF',
          description: 'Parse text sections, formulas, and definitions from Laws_of_Motion_Summary.pdf.',
          toolName: 'PARSE_PDF',
          toolArgs: { path: '/workspace/physics/Laws_of_Motion_Summary.pdf' },
          status: 'PENDING',
        },
        {
          id: 'task-3',
          stepNumber: 3,
          title: 'Transcribe and Index Lecture 04 Kinematics Recording',
          description: 'Process the audio transcript for Professor Raman\'s midterm exam warnings and tips.',
          toolName: 'TRANSCRIBE_AUDIO',
          toolArgs: { path: '/workspace/physics/Lecture_04_Kinematics_Transcript.md' },
          status: 'PENDING',
        },
        {
          id: 'task-4',
          stepNumber: 4,
          title: 'Query Local Knowledge Base for High-Yield Topics',
          description: 'Hybrid retrieval over vector index for Atwood machines, Snell refraction, and restitution.',
          toolName: 'SEARCH_LOCAL_KNOWLEDGE',
          toolArgs: { query: 'Laws of motion Atwood machine pseudo force Snell refraction critical angle', collection: 'Physics Prep' },
          status: 'PENDING',
        },
        {
          id: 'task-5',
          stepNumber: 5,
          title: 'Synthesize Multi-Topic Revision Explanations',
          description: 'Use local neural engine to generate clear step-by-step mathematical proofs and summaries.',
          status: 'PENDING',
        },
        {
          id: 'task-6',
          stepNumber: 6,
          title: 'Generate Practice Questions & Adaptive Quiz',
          description: 'Construct 4 targeted multiple-choice exam questions testing high-frequency past mistakes.',
          status: 'PENDING',
        },
        {
          id: 'task-7',
          stepNumber: 7,
          title: 'Record Identified Weak Areas to Local Memory',
          description: 'Log non-inertial pseudo forces and inclined projectiles into persistent student memory.',
          toolName: 'CREATE_NOTE',
          toolArgs: {
            title: 'Midterm Weak Areas: Pseudo Forces & Incline Range',
            content: 'Review Atwood effective gravity (g_eff = g + a) and maximum range angle (θ = π/4 - α/2).',
          },
          status: 'PENDING',
        },
        {
          id: 'task-8',
          stepNumber: 8,
          title: 'Save Preparation Report to Workspace',
          description: 'Write complete markdown study guide to /workspace/notes/Physics_Midterm_Preparation_Report.md.',
          toolName: 'CREATE_REPORT',
          toolArgs: {
            title: 'Physics Midterm Preparation Report',
            path: '/workspace/notes/Physics_Midterm_Preparation_Report.md',
            content: `# Physics Midterm Complete Preparation Report
Generated locally by Snapdragon Offline Agent.
Zero connectivity required.

## Key Formulas
- Non-inertial frame: F_pseudo = -m * a_frame
- Inclined plane max range: θ = π/4 - α/2
- Snell's Law: n1 * sin(θ1) = n2 * sin(θ2)
- Total Internal Reflection: sin(θ_c) = n2 / n1 (for n1 > n2)
- Inelastic collision: Momentum conserved, KE dissipated.`,
          },
          status: 'PENDING',
        },
      ];

    case 'CODE_ANALYSIS_BUG_FIX':
      return [
        {
          id: 'code-1',
          stepNumber: 1,
          title: 'Search Workspace Project Repository',
          description: 'Scan repository files in /workspace/project/src.',
          toolName: 'SEARCH_FILES',
          toolArgs: { query: 'search_engine.py' },
          status: 'PENDING',
        },
        {
          id: 'code-2',
          stepNumber: 2,
          title: 'Parse PDF Technical Specifications',
          description: 'Extract search architecture specs from technical documentation.',
          toolName: 'PARSE_PDF',
          toolArgs: { path: '/workspace/physics/Laws_of_Motion_Summary.pdf' },
          status: 'PENDING',
        },
        {
          id: 'code-3',
          stepNumber: 3,
          title: 'Inspect Code AST & Semantic Defect',
          description: 'Static AST inspection reveals ZeroDivisionError on line 25 of search_engine.py.',
          toolName: 'CODE_AST',
          toolArgs: { path: '/workspace/project/src/search_engine.py' },
          status: 'PENDING',
        },
        {
          id: 'code-4',
          stepNumber: 4,
          title: 'Synthesize Patch Diff & Interactive Quiz via NPU',
          description: 'Formulate safe patch diff avoiding division by zero and generate practice quiz.',
          toolName: 'INFER_LLM',
          toolArgs: { prompt: 'patch ZeroDivisionError in search_engine.py' },
          status: 'PENDING',
        },
      ];

    case 'MEDIA_TRANSCRIPTION_AND_SUMMARY':
      return [
        {
          id: 'media-1',
          stepNumber: 1,
          title: 'Extract Local Audio Track',
          description: 'Demux audio channel from local lecture video recording.',
          status: 'PENDING',
        },
        {
          id: 'media-2',
          stepNumber: 2,
          title: 'Transcribe Speech Using Local Acoustic Model',
          description: 'Process speech frames entirely offline via Snapdragon Hexagon NPU pipeline.',
          toolName: 'TRANSCRIBE_AUDIO',
          toolArgs: { path: '/workspace/physics/Lecture_04_Kinematics_Transcript.md' },
          status: 'PENDING',
        },
        {
          id: 'media-3',
          stepNumber: 3,
          title: 'Generate Timed Chapter Markers',
          description: 'Cluster speech segments into thematic lecture sections.',
          status: 'PENDING',
        },
        {
          id: 'media-4',
          stepNumber: 4,
          title: 'Save Lecture Summary and Study Notes',
          description: 'Export structured lecture notes to /workspace/notes/Lecture_04_Summary.md.',
          toolName: 'CREATE_REPORT',
          toolArgs: {
            title: 'Lecture 04 Summary & Chapters',
            path: '/workspace/notes/Lecture_04_Summary.md',
            content: `# Lecture 04: Advanced Kinematics Summary
Extracted locally from student video recording.

## Chapters
- 00:00 - Midterm scope
- 04:30 - Pseudo forces in accelerating frames
- 12:15 - Inclined projectile maximum range proof
- 21:40 - Inelastic collision momentum conservation`,
          },
          status: 'PENDING',
        },
      ];

    case 'JUDGE_EVALUATION':
      return [
        {
          id: 'judge-1',
          stepNumber: 1,
          title: 'Convene Expert Judicial Panel & Inspect Local Evidence',
          description: 'Establish rigorous evaluation criteria: Technical Merit, Hardware Acceleration, Offline Independence, and Production Polish.',
          status: 'PENDING',
        },
        {
          id: 'judge-2',
          stepNumber: 2,
          title: 'Audit Zero Cloud Egress & Hardware Utilization',
          description: 'Verify 0 external network requests, Hexagon NPU / Adreno GPU accelerator engagement, and sub-20ms latency.',
          status: 'PENDING',
        },
        {
          id: 'judge-3',
          stepNumber: 3,
          title: 'Evaluate Strengths, Critical Vulnerabilities & Defensibility',
          description: 'Conduct deep-dive stress test across architectural claims, user utility, and execution realism.',
          status: 'PENDING',
        },
        {
          id: 'judge-4',
          stepNumber: 4,
          title: 'Deliver Official Judicial Verdict & Final Scorecard',
          description: 'Formulate definitive grade (out of 100), key highlights, and actionable recommendations.',
          status: 'PENDING',
        },
      ];

    case 'MATH_PHYSICS_CALCULATION':
      return [
        {
          id: 'calc-1',
          stepNumber: 1,
          title: 'Search Reference Formulas & Physical Constants',
          description: 'Scan on-device formula repository for relevant governing equations and constants.',
          toolName: 'SEARCH_FILES',
          toolArgs: { query: 'physics formulas kinematics laws of motion' },
          status: 'PENDING',
        },
        {
          id: 'calc-2',
          stepNumber: 2,
          title: 'Extract Numerical Parameters & Boundary Conditions',
          description: 'Parse given variables, units, and constraints from local scientific knowledge base.',
          toolName: 'PARSE_PDF',
          toolArgs: { path: '/workspace/physics/Laws_of_Motion_Summary.pdf' },
          status: 'PENDING',
        },
        {
          id: 'calc-3',
          stepNumber: 3,
          title: 'Validate Symbolic Constraints & Units',
          description: 'AST parser verifies dimensional consistency and mathematical operators.',
          toolName: 'CODE_AST',
          toolArgs: { path: '/workspace/physics/Laws_of_Motion_Summary.pdf' },
          status: 'PENDING',
        },
        {
          id: 'calc-4',
          stepNumber: 4,
          title: 'Hexagon Neural Inference & Quiz Generation',
          description: 'Execute forward pass on Hexagon NPU and append 2-question interactive quiz.',
          toolName: 'INFER_LLM',
          toolArgs: { prompt: goal },
          status: 'PENDING',
        },
      ];

    case 'SCIENCE_CONCEPT':
      return [
        {
          id: 'sci-1',
          stepNumber: 1,
          title: 'Scan Local Scientific Literature & Vector Index',
          description: 'Retrieve fundamental physical, biological, or chemical principles with zero cloud egress.',
          toolName: 'SEARCH_FILES',
          toolArgs: { query: 'science principles' },
          status: 'PENDING',
        },
        {
          id: 'sci-2',
          stepNumber: 2,
          title: 'Parse Domain References & Core Mechanisms',
          description: 'Extract empirical models and diagrams from local document corpus.',
          toolName: 'PARSE_PDF',
          toolArgs: { path: '/workspace/physics/Laws_of_Motion_Summary.pdf' },
          status: 'PENDING',
        },
        {
          id: 'sci-3',
          stepNumber: 3,
          title: 'Inspect Conceptual Dependency Tree',
          description: 'Parse relationship graphs and semantic chains on device.',
          toolName: 'CODE_AST',
          toolArgs: { path: '/workspace/physics/Laws_of_Motion_Summary.pdf' },
          status: 'PENDING',
        },
        {
          id: 'sci-4',
          stepNumber: 4,
          title: 'Synthesize Step-by-Step Explanation & Practice Quiz',
          description: 'Execute Hexagon NPU inference and formulate 2-question interactive quiz.',
          toolName: 'INFER_LLM',
          toolArgs: { prompt: goal },
          status: 'PENDING',
        },
      ];

    case 'GREETING_CONVERSATION':
      return [
        {
          id: 'greet-1',
          stepNumber: 1,
          title: 'Acknowledge User & Parse Dialogue Context',
          description: 'Recognize conversational intent, tone, and contextual parameters locally on-device.',
          toolName: 'CODE_AST',
          toolArgs: { path: '/workspace/dialogue' },
          status: 'PENDING',
        },
        {
          id: 'greet-2',
          stepNumber: 2,
          title: 'Generate Snapdragon Conversational Response & Quiz',
          description: 'Synthesize helpful, natural, and intelligent dialogue via Hexagon NPU inference.',
          toolName: 'INFER_LLM',
          toolArgs: { prompt: goal },
          status: 'PENDING',
        },
      ];

    default:
      return [
        {
          id: 'gen-1',
          stepNumber: 1,
          title: 'Scan Local Indexed Workspace & Files',
          description: 'Check local documents and indexed knowledge vectors for query context.',
          toolName: 'SEARCH_FILES',
          toolArgs: { query: goal.slice(0, 30) },
          status: 'PENDING',
        },
        {
          id: 'gen-2',
          stepNumber: 2,
          title: 'Parse Contextual Knowledge & Reference Data',
          description: 'Inspect extracted document sections and semantic relationships.',
          toolName: 'PARSE_PDF',
          toolArgs: { path: '/workspace/physics/Laws_of_Motion_Summary.pdf' },
          status: 'PENDING',
        },
        {
          id: 'gen-3',
          stepNumber: 3,
          title: 'Multi-Step Neural Reasoning & AST Validation',
          description: 'Execute high-precision reasoning across offline weights on Qualcomm Hexagon NPU.',
          toolName: 'CODE_AST',
          toolArgs: { path: '/workspace/project/src' },
          status: 'PENDING',
        },
        {
          id: 'gen-4',
          stepNumber: 4,
          title: 'Synthesize Answer & Generate 1-Click Interactive Quiz',
          description: 'Deliver structured step-by-step answer and append 2-question interactive MCQ.',
          toolName: 'INFER_LLM',
          toolArgs: { prompt: goal },
          status: 'PENDING',
        },
      ];
  }
}
