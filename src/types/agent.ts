export type AgentMode = 
  | 'CORE' 
  | 'JUDGE'
  | 'STUDY' 
  | 'RESEARCH' 
  | 'VISION' 
  | 'CODE' 
  | 'CREATE' 
  | 'AGENT' 
  | 'VOICE';

export type AgentState = 
  | 'IDLE' 
  | 'THINKING' 
  | 'READING' 
  | 'LISTENING' 
  | 'PROCESSING' 
  | 'ACTING' 
  | 'OFFLINE' 
  | 'COMPLETED'
  | 'ERROR';

export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'AWAITING_APPROVAL' | 'CANCELLED';

export interface PlannedTask {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
  batchId?: string;
  batchNumber?: number;
  dependsOn?: string[]; // IDs of tasks that must finish before this task can execute
  toolName?: string;
  toolArgs?: Record<string, any>;
  status: TaskStatus;
  output?: string;
  observation?: string;
  startedAt?: number;
  completedAt?: number;
  requiresApproval?: boolean;
}

export interface TaskBatch {
  id: string;
  batchNumber: number;
  title: string;
  taskIds: string[];
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  canRunInParallel: boolean;
  startedAt?: number;
  completedAt?: number;
}

export interface AgentTimelineEntry {
  id: string;
  timestamp: number;
  phase: 'GOAL' | 'UNDERSTANDING' | 'PLANNING' | 'TOOL_INVOCATION' | 'OBSERVATION' | 'REASONING' | 'ACTION' | 'VALIDATION' | 'COMPLETED';
  summary: string;
  detail?: string;
  toolName?: string;
  toolInput?: Record<string, any>;
  toolOutput?: string;
  status: 'info' | 'success' | 'warning' | 'error';
}

export interface AgentExecutionPlan {
  id: string;
  userGoal: string;
  detectedIntent: string;
  recommendedMode: AgentMode;
  contextSources: string[];
  tasks: PlannedTask[];
  batches?: TaskBatch[]; // Grouped batches of tasks for parallel execution
  executionMode?: 'BATCH_PARALLEL' | 'SEQUENTIAL'; // Allows toggling between parallel batching & sequential
  currentBatchIndex?: number;
  currentTaskIndex: number;
  status: 'PLANNING' | 'EXECUTING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'CANCELLED';
  startedAt: number;
  completedAt?: number;
  finalResult?: string;
  rollbackCheckpointId?: string;
  rollbackAvailable?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system' | 'tool';
  content: string;
  timestamp: number;
  mode?: AgentMode;
  timeline?: AgentTimelineEntry[];
  plan?: AgentExecutionPlan;
  citations?: Array<{
    sourceTitle: string;
    chunkId: string;
    textSnippet: string;
  }>;
  artifacts?: Array<{
    type: 'report' | 'quiz' | 'code_diff' | 'flashcards' | 'transcript' | 'summary';
    title: string;
    data: any;
  }>;
}
