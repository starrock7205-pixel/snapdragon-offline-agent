import { AgentMode } from '../types/agent';

export interface IntentResult {
  intent: string;
  recommendedMode: AgentMode;
  targetTopics: string[];
  requiresFiles: boolean;
  isMultiStep: boolean;
}

export function classifyUserIntent(goal: string): IntentResult {
  const g = goal.toLowerCase().trim();

  // 1. Casual Greetings & Conversational Queries
  const isGreeting = 
    /^(hi|hello|hey|hiya|greetings|howdy|hola|good morning|good afternoon|good evening|good day|sup|yo)\b/i.test(g) ||
    /^(how are you|how do you do|who are you|what is your name|what can you do|help me|tell me about yourself|introduce yourself)\b/i.test(g) ||
    /^(thanks|thank you|appreciate it|bye|goodbye|see you)\b/i.test(g);

  if (isGreeting) {
    return {
      intent: 'GREETING_CONVERSATION',
      recommendedMode: 'CORE',
      targetTopics: ['Conversational AI', 'Snapdragon Assistant', 'Local Intelligence'],
      requiresFiles: false,
      isMultiStep: false,
    };
  }

  // 2. Specific Physics Exam Prep (Only when explicitly asked)
  if (
    (g.includes('physics') && (g.includes('exam') || g.includes('prep') || g.includes('syllabus') || g.includes('quiz'))) ||
    g.includes('laws of motion') ||
    g.includes('atwood machine')
  ) {
    return {
      intent: 'STUDY_EXAM_PREPARATION',
      recommendedMode: 'STUDY',
      targetTopics: ['Newton\'s Laws', 'Optics & Snell Refraction', 'Kinematics', 'Momentum Conservation'],
      requiresFiles: true,
      isMultiStep: true,
    };
  }

  // 3. Code Analysis & Debugging
  if (
    g.includes('search_engine.py') || 
    (g.includes('code') && (g.includes('bug') || g.includes('fix') || g.includes('defect') || g.includes('error') || g.includes('patch')))
  ) {
    return {
      intent: 'CODE_ANALYSIS_BUG_FIX',
      recommendedMode: 'CODE',
      targetTopics: ['search_engine.py', 'ZeroDivisionError', 'OfflineSearchEngine'],
      requiresFiles: true,
      isMultiStep: true,
    };
  }

  // 4. Video / Audio Media Analysis
  if (g.includes('lecture recording') || (g.includes('video') && g.includes('transcribe')) || (g.includes('audio') && g.includes('transcript'))) {
    return {
      intent: 'MEDIA_TRANSCRIPTION_AND_SUMMARY',
      recommendedMode: 'VOICE',
      targetTopics: ['Lecture 04 Audio', 'Timestamps', 'Chapter Markers'],
      requiresFiles: true,
      isMultiStep: true,
    };
  }

  // 5. Vision / Diagram Analysis
  if (g.includes('diagram') || g.includes('screenshot') || (g.includes('image') && g.includes('ocr'))) {
    return {
      intent: 'VISION_DOCUMENT_ANALYSIS',
      recommendedMode: 'VISION',
      targetTopics: ['Diagram Recognition', 'Text OCR'],
      requiresFiles: true,
      isMultiStep: true,
    };
  }

  // 6. Creative Writing
  if (g.includes('poem') || g.includes('story') || g.includes('script') || g.includes('outline') || g.includes('write an essay') || g.includes('draft a')) {
    return {
      intent: 'CREATIVE_SYNTHESIS',
      recommendedMode: 'CREATE',
      targetTopics: ['Creative Synthesis', 'Narrative', 'Stylistic Drafting'],
      requiresFiles: false,
      isMultiStep: true,
    };
  }

  // 7. Judicial Review / Evaluation - STRICT RULE:
  // DO NOT default to a rigid "Judge Evaluation Report" unless the user explicitly types "judge this project" or "/truth mode".
  const isExplicitJudge = 
    g.includes('judge this project') || 
    g.includes('/truth mode') || 
    g.includes('judge prototype') || 
    g.includes('judge this app') ||
    g === 'judge' ||
    g.startsWith('judge this') ||
    g === '/judge' ||
    (g.startsWith('judge') && (g.includes('hackathon') || g.includes('project') || g.includes('prototype')));

  if (isExplicitJudge) {
    return {
      intent: 'JUDGE_EVALUATION',
      recommendedMode: 'JUDGE',
      targetTopics: ['Architectural Rubric', 'Local Execution Rigor', 'Zero Cloud Feasibility', 'Final Verdict'],
      requiresFiles: false,
      isMultiStep: true,
    };
  }

  // 8. Math, Physics & Science Numerical Calculations
  if (
    g.includes('calculate') ||
    g.includes('solve') ||
    g.includes('derive') ||
    g.includes('numerical') ||
    g.includes('velocity') ||
    g.includes('acceleration') ||
    g.includes('incline') ||
    g.includes('kinetic energy') ||
    g.includes('potential energy') ||
    g.includes('friction') ||
    g.includes('projectile') ||
    g.includes('equation') ||
    /\b\d+\s*[\+\-\*\/]\s*\d+\b/.test(g) ||
    /\b(f\s*=\s*m\s*a|e\s*=\s*m\s*c|v\s*=\s*u\s*\+\s*a\s*t)\b/i.test(g)
  ) {
    return {
      intent: 'MATH_PHYSICS_CALCULATION',
      recommendedMode: 'STUDY',
      targetTopics: ['Step-by-Step Derivation', 'Formula Application', 'Units & Dimensional Verification'],
      requiresFiles: false,
      isMultiStep: true,
    };
  }

  // 9. Science Concepts & Explanations
  if (
    g.includes('why is') ||
    g.includes('how does') ||
    g.includes('what causes') ||
    g.includes('explain') ||
    g.includes('sky blue') ||
    g.includes('photosynthesis') ||
    g.includes('gravity') ||
    g.includes('quantum') ||
    g.includes('relativity') ||
    g.includes('plane fly') ||
    g.includes('airplane') ||
    g.includes('black hole')
  ) {
    return {
      intent: 'SCIENCE_CONCEPT',
      recommendedMode: 'CORE',
      targetTopics: ['Fundamental Mechanisms', 'Scientific Principles', 'Step-by-Step Explanation'],
      requiresFiles: false,
      isMultiStep: true,
    };
  }

  // 10. General Intelligence & Open Universal Inquiries (Default)
  return {
    intent: 'GENERAL_INTELLIGENCE',
    recommendedMode: 'CORE',
    targetTopics: ['Universal Knowledge', 'On-Device Reasoning', 'Instant Response'],
    requiresFiles: false,
    isMultiStep: true,
  };
}
