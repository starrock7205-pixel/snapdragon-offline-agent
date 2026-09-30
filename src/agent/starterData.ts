import { AgentExecutionPlan, AgentTimelineEntry, ChatMessage } from '../types/agent';

export function getStarterData(): {
  initialPlan: AgentExecutionPlan | null;
  initialTimeline: AgentTimelineEntry[];
  initialMessages: ChatMessage[];
} {
  const initialTimeline: AgentTimelineEntry[] = [
    {
      id: 'tl_init_ready',
      timestamp: Date.now() - 5000,
      phase: 'GOAL',
      summary: 'Snapdragon Neural Compute Engine Initialized',
      detail: 'Qualcomm Hexagon NPU (45 TOPS) active. Zero cloud network egress verified.',
      status: 'success',
    },
  ];

  const initialMessages: ChatMessage[] = [
    {
      id: 'msg_welcome',
      role: 'agent',
      content: `### Welcome to Snapdragon Offline Copilot

Hello! I am your on-device AI assistant, running 100% locally on Qualcomm Snapdragon neural silicon (Hexagon NPU).

Because I execute completely on-device, **no data ever leaves your laptop**—providing absolute privacy, zero latency lag, and full offline autonomy without requiring Wi-Fi.

#### What I Can Help You With:
- **Everyday Conversation & Greetings:** Say hello, ask how I'm doing, or brainstorm ideas together.
- **Answer Any Question:** Science, coding, world facts, math, technology, history, or philosophy.
- **Judge & Evaluate:** Ask me to *"Judge this project"* or critique any hackathon prototype or proposal.
- **Local File Intelligence:** Summarize your documents, extract formulas, generate study quizzes, or audit code for bugs.

How can I help you today? Ask me any question below!`,
      timestamp: Date.now() - 2000,
      mode: 'CORE',
      artifacts: [
        {
          type: 'quiz',
          title: 'Interactive Knowledge Check: Snapdragon Edge AI (2 Questions)',
          data: [
            {
              id: 'starter_q1',
              question: 'How many TOPS of dedicated neural compute does the Qualcomm Snapdragon X Elite Hexagon NPU deliver?',
              options: [
                '10 TOPS',
                '45 TOPS',
                '100 TOPS',
                'Zero (CPU only)'
              ],
              correctAnswerIndex: 1,
              explanation: 'The Qualcomm Snapdragon X Elite Hexagon NPU delivers 45 TOPS of dedicated hardware tensor acceleration specifically architected for Microsoft Copilot+ PC on-device AI workloads.',
              topic: 'Hardware Architecture',
              difficulty: 'easy'
            },
            {
              id: 'starter_q2',
              question: 'What is the primary advantage of 100% offline edge AI over conventional cloud-based models?',
              options: [
                'Zero cloud network egress, total data privacy, and sub-20ms first-token latency',
                'Requires continuous Wi-Fi connection',
                'Charges per-token subscription fees',
                'Slower response times'
              ],
              correctAnswerIndex: 0,
              explanation: 'Edge AI processes all weights and prompts locally on silicon, ensuring complete data privacy (0 bytes cloud egress), zero subscription costs, and instant deterministic latency.',
              topic: 'Edge AI Privacy',
              difficulty: 'easy'
            }
          ]
        }
      ]
    },
  ];

  return {
    initialPlan: null,
    initialTimeline,
    initialMessages,
  };
}
