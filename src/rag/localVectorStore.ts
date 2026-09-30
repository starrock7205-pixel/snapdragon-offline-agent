import { DocumentChunk, KnowledgeDocument, SearchResult } from '../types/knowledge';
import { chunkDocument, cosineSimilarity, generateLocalEmbedding } from './documentParser';
import { DEFAULT_OFFLINE_DOCUMENTS } from './defaultKnowledge';

const STORAGE_KEY = 'snapdragon_offline_knowledge_docs_v1';

class LocalVectorStore {
  private documents: Map<string, KnowledgeDocument> = new Map();
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: KnowledgeDocument[] = JSON.parse(saved);
        for (const doc of parsed) {
          this.documents.set(doc.id, doc);
        }
      }
    } catch (e) {
      console.warn('Could not load saved knowledge from localStorage, using defaults', e);
    }

    // Ensure all default documents (including new marine algae assignment paper) are present
    for (const raw of DEFAULT_OFFLINE_DOCUMENTS) {
      if (!this.documents.has(raw.id)) {
        const chunks = chunkDocument(raw.id, raw.title, raw.content);
        const doc: KnowledgeDocument = {
          ...raw,
          chunks,
        };
        this.documents.set(doc.id, doc);
      }
    }
    this.persist();

    this.initialized = true;
  }

  private persist() {
    try {
      const arr = Array.from(this.documents.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Failed to persist local vector store', e);
    }
  }

  public getAllDocuments(): KnowledgeDocument[] {
    return Array.from(this.documents.values());
  }

  public getDocumentById(id: string): KnowledgeDocument | undefined {
    return this.documents.get(id);
  }

  public addDocument(
    title: string,
    content: string,
    fileType: KnowledgeDocument['fileType'],
    collectionName: string = 'General'
  ): KnowledgeDocument {
    const id = 'doc_' + Math.random().toString(36).substring(2, 9);
    const chunks = chunkDocument(id, title, content);
    const doc: KnowledgeDocument = {
      id,
      title,
      fileType,
      fileSize: new Blob([content]).size,
      uploadedAt: Date.now(),
      content,
      chunks,
      collectionName,
      isIndexed: true,
    };
    this.documents.set(id, doc);
    this.persist();
    return doc;
  }

  public removeDocument(id: string): boolean {
    const deleted = this.documents.delete(id);
    if (deleted) this.persist();
    return deleted;
  }

  public clearAll(): void {
    this.documents.clear();
    this.persist();
  }

  // Hybrid Search: BM25 keyword score + Dense Vector Cosine Similarity
  public search(query: string, options?: { topK?: number; collectionName?: string }): SearchResult[] {
    const topK = options?.topK || 5;
    const queryVec = generateLocalEmbedding(query);
    const queryTerms = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);

    const candidates: SearchResult[] = [];

    for (const doc of this.documents.values()) {
      if (options?.collectionName && doc.collectionName !== options.collectionName) {
        continue;
      }

      for (const chunk of doc.chunks) {
        // 1. Vector cosine similarity
        let vectorScore = 0;
        if (chunk.embedding && chunk.embedding.length > 0) {
          vectorScore = cosineSimilarity(queryVec, chunk.embedding);
        }

        // 2. BM25 / Keyword term matching
        const textLower = chunk.text.toLowerCase();
        let keywordMatches = 0;
        for (const term of queryTerms) {
          if (textLower.includes(term)) {
            keywordMatches += 1;
          }
        }
        const bm25Score = queryTerms.length > 0 ? keywordMatches / queryTerms.length : 0;

        // Weighted hybrid score: 65% dense semantic vector + 35% exact keyword
        const score = parseFloat((0.65 * vectorScore + 0.35 * bm25Score).toFixed(4));

        if (score > 0.25 || keywordMatches > 0) {
          candidates.push({
            chunk,
            score,
            bm25Score,
            vectorScore,
            snippet: chunk.text.slice(0, 240) + '...',
          });
        }
      }
    }

    // Sort descending by hybrid score
    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, topK);
  }
}

export const localVectorStore = new LocalVectorStore();
