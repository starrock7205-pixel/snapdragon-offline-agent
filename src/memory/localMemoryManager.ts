import { LocalMemoryItem, MemoryCategory, UserPreferences } from '../types/memory';

const MEMORY_STORAGE_KEY = 'snapdragon_local_memory_v1';
const PREFS_STORAGE_KEY = 'snapdragon_user_prefs_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  userName: 'Alex Chen',
  studyField: 'Applied Physics & Computational Engineering',
  preferredTone: 'concise',
  autoApproveSafeTools: true,
  networkLockEnabled: true,
  preferredAccelerator: 'AUTO',
  theme: 'dark',
};

const DEFAULT_MEMORIES: LocalMemoryItem[] = [
  {
    id: 'mem_physics_midterm',
    category: 'PROJECT',
    title: 'Physics Midterm Prep (October 2026)',
    content: 'Target score: 95+. Key focus on Laws of Motion, Non-inertial Reference Frames, Snell Refraction, and Ballistic Inelastic Collisions.',
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'mem_weak_topics',
    category: 'STUDY_PROGRESS',
    title: 'Recorded Weak Areas in Physics',
    content: '1. Atwood machine pseudo-forces in upward accelerated frame.\n2. Prism minimum deviation formula derivation.\n3. Coefficient of restitution calculation under 2D oblique collisions.',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'mem_student_pref',
    category: 'PREFERENCE',
    title: 'Learning Style Preference',
    content: 'Prefers step-by-step mathematical derivations followed by practical numerical practice problems and self-quizzing.',
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 259200000,
  },
  {
    id: 'mem_coding_project',
    category: 'PROJECT',
    title: 'Local Edge Search Engine Project',
    content: 'High-speed Python BM25 indexer located in /workspace/project. Testing suite requires fixing off-by-one division bug.',
    createdAt: Date.now() - 345600000,
    updatedAt: Date.now() - 86400000,
  },
];

class LocalMemoryManager {
  private memories: Map<string, LocalMemoryItem> = new Map();
  private preferences: UserPreferences = { ...DEFAULT_PREFERENCES };
  private initialized = false;

  public init(): void {
    if (this.initialized) return;

    try {
      const savedMem = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (savedMem) {
        const parsed: LocalMemoryItem[] = JSON.parse(savedMem);
        for (const m of parsed) this.memories.set(m.id, m);
      } else {
        for (const m of DEFAULT_MEMORIES) this.memories.set(m.id, m);
        this.persistMemories();
      }

      const savedPrefs = localStorage.getItem(PREFS_STORAGE_KEY);
      if (savedPrefs) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) };
      }
    } catch (e) {
      console.warn('Memory load error', e);
      for (const m of DEFAULT_MEMORIES) this.memories.set(m.id, m);
    }

    this.initialized = true;
  }

  private persistMemories(): void {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(Array.from(this.memories.values())));
    } catch (e) {
      console.warn('Memory persist error', e);
    }
  }

  private persistPrefs(): void {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (e) {
      console.warn('Prefs persist error', e);
    }
  }

  public getMemories(category?: MemoryCategory): LocalMemoryItem[] {
    const list = Array.from(this.memories.values());
    if (category) return list.filter(m => m.category === category);
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public addMemory(category: MemoryCategory, title: string, content: string, metadata?: Record<string, any>): LocalMemoryItem {
    const id = 'mem_' + Math.random().toString(36).substring(2, 9);
    const item: LocalMemoryItem = {
      id,
      category,
      title,
      content,
      metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.memories.set(id, item);
    this.persistMemories();
    return item;
  }

  public updateMemory(id: string, title: string, content: string): boolean {
    const existing = this.memories.get(id);
    if (!existing) return false;
    existing.title = title;
    existing.content = content;
    existing.updatedAt = Date.now();
    this.persistMemories();
    return true;
  }

  public deleteMemory(id: string): boolean {
    const ok = this.memories.delete(id);
    if (ok) this.persistMemories();
    return ok;
  }

  public clearAll(): void {
    this.memories.clear();
    this.persistMemories();
  }

  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(partial: Partial<UserPreferences>): UserPreferences {
    this.preferences = { ...this.preferences, ...partial };
    this.persistPrefs();
    return { ...this.preferences };
  }

  public exportJson(): string {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      preferences: this.preferences,
      memories: Array.from(this.memories.values()),
    }, null, 2);
  }

  public importJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.memories && Array.isArray(data.memories)) {
        this.memories.clear();
        for (const m of data.memories) {
          this.memories.set(m.id, m);
        }
        if (data.preferences) {
          this.preferences = { ...DEFAULT_PREFERENCES, ...data.preferences };
          this.persistPrefs();
        }
        this.persistMemories();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const localMemoryManager = new LocalMemoryManager();
