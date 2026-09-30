import React, { useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  Download, 
  HardDrive, 
  Plus, 
  ShieldCheck, 
  Trash2, 
  Upload, 
  Zap 
} from 'lucide-react';
import { LocalMemoryItem, MemoryCategory, UserPreferences } from '../../types/memory';
import { localMemoryManager } from '../../memory/localMemoryManager';

export const MemoryView: React.FC = () => {
  const [memories, setMemories] = useState<LocalMemoryItem[]>(() => {
    localMemoryManager.init();
    return localMemoryManager.getMemories();
  });
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    localMemoryManager.init();
    return localMemoryManager.getPreferences();
  });
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'ALL'>('ALL');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('NOTE');

  const categories: { id: MemoryCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Items' },
    { id: 'PROJECT', label: 'Projects' },
    { id: 'STUDY_PROGRESS', label: 'Study Progress' },
    { id: 'NOTE', label: 'Notes' },
    { id: 'PREFERENCE', label: 'Preferences' },
    { id: 'TASK_HISTORY', label: 'Task History' },
  ];

  const refreshMemories = () => {
    setMemories(localMemoryManager.getMemories(selectedCategory === 'ALL' ? undefined : selectedCategory));
  };

  const handleCategoryChange = (cat: MemoryCategory | 'ALL') => {
    setSelectedCategory(cat);
    setMemories(localMemoryManager.getMemories(cat === 'ALL' ? undefined : cat));
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    localMemoryManager.addMemory(newCategory, newTitle.trim(), newContent.trim());
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
    refreshMemories();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this local memory item?')) {
      localMemoryManager.deleteMemory(id);
      refreshMemories();
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear ALL local memory? This cannot be undone.')) {
      localMemoryManager.clearAll();
      refreshMemories();
    }
  };

  const handleExport = () => {
    const jsonStr = localMemoryManager.exportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snapdragon_memory_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const text = re.target?.result as string;
        const ok = localMemoryManager.importJson(text);
        if (ok) {
          refreshMemories();
          setPreferences(localMemoryManager.getPreferences());
          alert('Memory imported successfully!');
        } else {
          alert('Failed to parse memory JSON format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="text-[11px] font-mono text-[#E10600] uppercase tracking-wider">
            User-Controlled On-Device Storage
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            Local Memory & Privacy Center
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 rounded-lg transition-colors border border-red-900/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Local By Default Privacy Data-Flow Visualization (as mandated by specification) */}
      <div className="p-5 bg-gradient-to-r from-[#10121A] via-[#141724] to-[#10121A] border border-neutral-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Local By Default Architecture</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">Zero Cloud Egress</span>
        </div>

        <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
          Your documents, lecture recordings, code repositories, study progress, and memory stay exclusively on this laptop. No telemetry or hidden external endpoints.
        </p>

        {/* Data-flow schematic */}
        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-center w-full sm:w-auto">
              <div className="text-neutral-500 text-[10px]">STAGE 1</div>
              <div className="font-semibold text-white mt-0.5">USER DATA</div>
              <div className="text-[10px] text-neutral-400">PDFs, Code, Audio</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#E10600] shrink-0 rotate-90 sm:rotate-0" />
            <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-center w-full sm:w-auto">
              <div className="text-neutral-500 text-[10px]">STAGE 2</div>
              <div className="font-semibold text-white mt-0.5">LOCAL DEVICE</div>
              <div className="text-[10px] text-neutral-400">IndexedDB & VFS</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#E10600] shrink-0 rotate-90 sm:rotate-0" />
            <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-center w-full sm:w-auto">
              <div className="text-neutral-500 text-[10px]">STAGE 3</div>
              <div className="font-semibold text-white mt-0.5">LOCAL MODEL</div>
              <div className="text-[10px] text-neutral-400">Hexagon NPU / INT4 SLM</div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#E10600] shrink-0 rotate-90 sm:rotate-0" />
            <div className="p-3 bg-neutral-900 rounded-lg border border-emerald-500/30 text-center w-full sm:w-auto">
              <div className="text-emerald-500 text-[10px]">FINAL RESULT</div>
              <div className="font-semibold text-emerald-300 mt-0.5">LOCAL RESULT</div>
              <div className="text-[10px] text-neutral-400">Reports, Quizzes, Fixes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Category Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategoryChange(c.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedCategory === c.id
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Add Memory Modal / Box */}
      {isAdding && (
        <form onSubmit={handleAddMemory} className="p-5 bg-[#10121A] border border-neutral-800 rounded-xl space-y-3">
          <div className="text-xs font-semibold text-white">Add New Local Memory</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Memory title..."
              className="px-3 py-2 text-xs bg-neutral-950 text-white rounded-lg border border-neutral-700 outline-none"
              required
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="px-3 py-2 text-xs bg-neutral-950 text-white rounded-lg border border-neutral-700 outline-none"
            >
              <option value="PROJECT">Project</option>
              <option value="STUDY_PROGRESS">Study Progress</option>
              <option value="NOTE">Note</option>
              <option value="PREFERENCE">Preference</option>
            </select>
          </div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Content details..."
            rows={3}
            className="w-full px-3 py-2 text-xs bg-neutral-950 text-white rounded-lg border border-neutral-700 outline-none resize-none"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#E10600] hover:bg-[#C50500] rounded-lg"
            >
              Save Memory
            </button>
          </div>
        </form>
      )}

      {/* Memory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memories.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-[#10121A] border border-neutral-800 rounded-xl space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                <span className="text-[#E10600]">{item.category}</span>
                <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xs font-semibold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">{item.content}</p>
            </div>
            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-end">
              <button
                onClick={() => handleDelete(item.id)}
                className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                title="Delete memory item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
