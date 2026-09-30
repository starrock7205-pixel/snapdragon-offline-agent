import { DocumentChunk, KnowledgeDocument } from '../types/knowledge';

export function estimateTokenCount(text: string): number {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length * 1.3));
}

// Generate a deterministic 384-dimensional dense semantic embedding vector completely offline
export function generateLocalEmbedding(text: string): number[] {
  const dim = 384;
  const vector = new Float32Array(dim);
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(w => w.length > 1);

  // Hash-based n-gram and semantic term projection
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0x811c9dc5;
    for (let c = 0; c < word.length; c++) {
      hash ^= word.charCodeAt(c);
      hash = Math.imul(hash, 0x01000193);
    }
    
    // Spread hash across dimensions
    const baseIdx = Math.abs(hash) % dim;
    const sign = (hash & 1) === 0 ? 1.0 : -1.0;
    const weight = 1.0 / Math.sqrt(word.length + 1);
    
    vector[baseIdx] += sign * weight;
    vector[(baseIdx + 37) % dim] += sign * 0.5 * weight;
    vector[(baseIdx + 113) % dim] += -sign * 0.3 * weight;

    // Character trigrams
    for (let t = 0; t < word.length - 2; t++) {
      const tri = word.slice(t, t + 3);
      let triHash = 0;
      for (let tc = 0; tc < 3; tc++) triHash = (triHash << 5) - triHash + tri.charCodeAt(tc);
      const triIdx = Math.abs(triHash) % dim;
      vector[triIdx] += 0.25;
    }
  }

  // L2 normalization for accurate unit-sphere cosine similarity
  let norm = 0;
  for (let d = 0; d < dim; d++) norm += vector[d] * vector[d];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let d = 0; d < dim; d++) vector[d] /= norm;
  }

  return Array.from(vector);
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, (dot + 1) / 2)); // normalize between 0 and 1
}

export function chunkDocument(
  docId: string,
  docTitle: string,
  content: string,
  maxTokensPerChunk: number = 320,
  overlapTokens: number = 40
): DocumentChunk[] {
  const paragraphs = content.split(/\n\s*\n/);
  const chunks: DocumentChunk[] = [];
  let currentText = '';
  let currentTokenCount = 0;
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    if (!para) continue;
    const pTokens = estimateTokenCount(para);

    if (currentTokenCount + pTokens > maxTokensPerChunk && currentText) {
      const chunkId = `${docId}_chk_${chunkIndex}`;
      chunks.push({
        id: chunkId,
        documentId: docId,
        documentTitle: docTitle,
        chunkIndex,
        text: currentText.trim(),
        tokensCount: currentTokenCount,
        embedding: generateLocalEmbedding(currentText),
      });
      chunkIndex++;

      // Retain last words for overlap
      const words = currentText.split(/\s+/);
      const overlapWords = words.slice(Math.max(0, words.length - Math.round(overlapTokens * 0.75))).join(' ');
      currentText = overlapWords + '\n\n' + para;
      currentTokenCount = estimateTokenCount(currentText);
    } else {
      currentText = currentText ? `${currentText}\n\n${para}` : para;
      currentTokenCount += pTokens;
    }
  }

  if (currentText.trim()) {
    const chunkId = `${docId}_chk_${chunkIndex}`;
    chunks.push({
      id: chunkId,
      documentId: docId,
      documentTitle: docTitle,
      chunkIndex,
      text: currentText.trim(),
      tokensCount: currentTokenCount,
      embedding: generateLocalEmbedding(currentText),
    });
  }

  return chunks;
}
