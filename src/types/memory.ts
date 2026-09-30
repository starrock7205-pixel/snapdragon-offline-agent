export type MemoryCategory = 
  | 'PREFERENCE' 
  | 'PROJECT' 
  | 'STUDY_PROGRESS' 
  | 'NOTE' 
  | 'TASK_HISTORY' 
  | 'KNOWLEDGE_INDEX';

export interface LocalMemoryItem {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface UserPreferences {
  userName: string;
  studyField: string;
  preferredTone: 'concise' | 'socratic' | 'comprehensive';
  autoApproveSafeTools: boolean;
  networkLockEnabled: boolean;
  preferredAccelerator: 'AUTO' | 'NPU' | 'GPU' | 'CPU';
  theme: 'dark';
}
