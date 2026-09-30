export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  text: string;
  tokensCount: number;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  fileType: 'pdf' | 'txt' | 'md' | 'code' | 'transcript' | 'json';
  fileSize: number;
  uploadedAt: number;
  content: string;
  chunks: DocumentChunk[];
  collectionName: string; // e.g., 'Physics', 'Computer Science', 'Lecture Notes'
  isIndexed: boolean;
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number; // 0 to 1
  bm25Score: number;
  vectorScore: number;
  snippet: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizArtifact {
  title: string;
  topic: string;
  questions: QuizQuestion[];
  generatedAt: number;
}

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  sourceChunk?: string;
}
