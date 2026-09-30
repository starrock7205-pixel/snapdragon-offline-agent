export interface VFile {
  path: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  size: number;
  updatedAt: number;
  isReadOnly?: boolean;
}

const STORAGE_KEY = 'snapdragon_vfs_storage_v1';

class VirtualFileSystem {
  private files: Map<string, VFile> = new Map();
  private initialized = false;

  public init() {
    if (this.initialized) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: VFile[] = JSON.parse(saved);
        for (const f of parsed) {
          this.files.set(f.path, f);
        }
      }
    } catch (e) {
      console.warn('VFS storage load error', e);
    }

    if (this.files.size === 0) {
      this.seedDefaultFiles();
      this.persist();
    }

    this.initialized = true;
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.files.values())));
    } catch (e) {
      console.warn('Failed to persist VFS', e);
    }
  }

  private seedDefaultFiles() {
    this.createDirectory('/workspace');
    this.createDirectory('/workspace/physics');
    this.createDirectory('/workspace/project');
    this.createDirectory('/workspace/project/src');
    this.createDirectory('/workspace/notes');

    this.writeFile('/workspace/physics/Laws_of_Motion_Summary.pdf', `[BINARY PDF EXTRACT: Newtonian Dynamics & Laws of Motion Summary]
Chapter 4: Principles of Mechanics.
- Law 1: Net force = 0 => acceleration = 0.
- Law 2: F_net = m * a.
- Law 3: Action = -Reaction on separate interacting bodies.
- Static friction: f_s <= μ_s * N.
- Kinetic friction: f_k = μ_k * N.
- Centripetal force: F_c = m * v² / r.`);

    this.writeFile('/workspace/physics/Refraction_and_Optics_Notes.txt', `Snell's Law of Refraction:
n1 * sin(θ1) = n2 * sin(θ2)
Total Internal Reflection:
Critical angle sin(θ_c) = n2 / n1 (when n1 > n2).
Prism deviation angle:
n = sin((A + δ_m) / 2) / sin(A / 2).`);

    this.writeFile('/workspace/physics/Lecture_04_Kinematics_Transcript.md', `# Lecture 04: Advanced Kinematics & Momentum Conservation
Instructor: Prof. Raman
Key points:
- Non-inertial reference frame introduces pseudo-force = -m * a_frame.
- 2D projectile on inclined plane: Maximum range condition θ = π/4 - α/2.
- Inelastic collision: Kinetic energy dissipated, linear momentum conserved.
- Coefficient of restitution: e = (v2 - v1) / (u1 - u2).`);

    this.writeFile('/workspace/physics/Past_Questions_2025.txt', `Exam Archive 2025:
1. Banked curve safe speed with icy friction.
2. Glass prism submerged in water critical angle.
3. Atwood machine in accelerating rocket.`);

    this.writeFile('/workspace/project/README.md', `# Offline Search & Ranking Engine
High-throughput BM25 keyword matching engine designed for zero-latency local document retrieval on edge devices.`);

    this.writeFile('/workspace/project/src/search_engine.py', `import math
from typing import List, Dict, Tuple

class OfflineSearchEngine:
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.doc_lengths: Dict[str, int] = {}
        self.avg_doc_len: float = 0.0
        self.inverted_index: Dict[str, Dict[str, int]] = {}
        self.documents: Dict[str, str] = {}

    def add_document(self, doc_id: str, text: str) -> None:
        tokens = text.lower().split()
        self.documents[doc_id] = text
        self.doc_lengths[doc_id] = len(tokens)
        
        for token in tokens:
            if token not in self.inverted_index:
                self.inverted_index[token] = {}
            self.inverted_index[token][doc_id] = self.inverted_index[token].get(doc_id, 0) + 1
            
        # BUG: Off-by-one division error causes ZeroDivisionError when len == 1
        total_len = sum(self.doc_lengths.values())
        self.avg_doc_len = total_len / (len(self.doc_lengths) - 1)

    def query(self, query_text: str, top_k: int = 5) -> List[Tuple[str, float]]:
        scores: Dict[str, float] = {}
        query_terms = query_text.lower().split()
        N = len(self.documents)
        for term in query_terms:
            if term not in self.inverted_index:
                continue
            df = len(self.inverted_index[term])
            idf = math.log((N - df + 0.5) / (df + 0.5) + 1.0)
            for doc_id, tf in self.inverted_index[term].items():
                doc_len = self.doc_lengths.get(doc_id, 1)
                denom = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / max(1.0, self.avg_doc_len)))
                score_term = idf * (tf * (self.k1 + 1.0)) / denom
                scores[doc_id] = scores.get(doc_id, 0.0) + score_term
        return sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
`);

    this.writeFile('/workspace/notes/study_goals.txt', `Target: Score 95+ in Physics Midterm
Weak areas to revise:
- Atwood machine pseudo forces
- Prism minimum deviation formula
- Coefficient of restitution in 2D collisions`);
  }

  public listDirectory(dirPath: string = '/workspace'): VFile[] {
    const normalized = dirPath.endsWith('/') && dirPath !== '/' ? dirPath.slice(0, -1) : dirPath;
    const results: VFile[] = [];
    for (const [p, file] of this.files.entries()) {
      if (p === normalized) continue;
      const parent = p.substring(0, p.lastIndexOf('/')) || '/';
      if (parent === normalized) {
        results.push(file);
      }
    }
    return results.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'directory' ? -1 : 1));
  }

  public readFile(path: string): string | null {
    const file = this.files.get(path);
    if (!file || file.type === 'directory') return null;
    return file.content || '';
  }

  public writeFile(path: string, content: string): boolean {
    const name = path.split('/').filter(Boolean).pop() || 'unnamed';
    const file: VFile = {
      path,
      name,
      type: 'file',
      content,
      size: new Blob([content]).size,
      updatedAt: Date.now(),
    };
    this.files.set(path, file);
    this.persist();
    return true;
  }

  public createDirectory(path: string): boolean {
    const name = path.split('/').filter(Boolean).pop() || 'dir';
    const dir: VFile = {
      path,
      name,
      type: 'directory',
      size: 0,
      updatedAt: Date.now(),
    };
    this.files.set(path, dir);
    this.persist();
    return true;
  }

  public deleteFile(path: string): boolean {
    const deleted = this.files.delete(path);
    if (deleted) this.persist();
    return deleted;
  }

  public searchFiles(query: string): VFile[] {
    const q = query.toLowerCase();
    const results: VFile[] = [];
    for (const file of this.files.values()) {
      if (file.name.toLowerCase().includes(q) || (file.content && file.content.toLowerCase().includes(q))) {
        results.push(file);
      }
    }
    return results;
  }

  public getAllFiles(): VFile[] {
    return Array.from(this.files.values());
  }

  public resetToDefaults() {
    this.files.clear();
    this.seedDefaultFiles();
    this.persist();
  }
}

export const virtualFileSystem = new VirtualFileSystem();
