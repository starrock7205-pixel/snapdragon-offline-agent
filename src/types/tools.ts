export type ToolName = 
  | 'READ_FILE'
  | 'WRITE_FILE'
  | 'SEARCH_FILES'
  | 'LIST_DIRECTORY'
  | 'CREATE_DIRECTORY'
  | 'DELETE_FILE'
  | 'PARSE_PDF'
  | 'TRANSCRIBE_AUDIO'
  | 'ANALYZE_IMAGE'
  | 'RUN_LOCAL_SCRIPT'
  | 'SEARCH_LOCAL_KNOWLEDGE'
  | 'CREATE_NOTE'
  | 'CREATE_REPORT'
  | 'CODE_AST'
  | 'INFER_LLM';

export interface ToolDefinition {
  name: ToolName;
  displayName: string;
  description: string;
  parameters: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    required?: boolean;
  }>;
  isDangerous: boolean;
  requiresApproval: boolean;
}

export interface ToolExecutionResult {
  toolName: ToolName;
  success: boolean;
  output: string;
  data?: any;
  error?: string;
  executionTimeMs: number;
}
