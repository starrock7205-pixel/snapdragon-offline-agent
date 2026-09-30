import React, { useState } from 'react';
import { 
  AlertCircle, 
  Bug, 
  Check, 
  CheckCircle, 
  Code, 
  FileCode, 
  Folder, 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles 
} from 'lucide-react';
import { virtualFileSystem } from '../../tools/virtualFileSystem';
import { ResponseDisplay } from '../ResponseDisplay';

const CODE_ARCH_IMG = '/src/assets/images/code_diff_architecture_1790106495253.jpg';

export const CodeView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('/workspace/project/src/search_engine.py');
  const [fileContent, setFileContent] = useState<string>(() => {
    virtualFileSystem.init();
    return virtualFileSystem.readFile('/workspace/project/src/search_engine.py') || '';
  });
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [pendingPatch, setPendingPatch] = useState<string | null>(null);
  const [patchApplied, setPatchApplied] = useState<boolean>(false);

  const projectFiles = [
    { path: '/workspace/project/README.md', name: 'README.md' },
    { path: '/workspace/project/src/search_engine.py', name: 'search_engine.py' },
  ];

  const handleSelectFile = (path: string) => {
    setSelectedFile(path);
    const content = virtualFileSystem.readFile(path);
    setFileContent(content || '');
    setPendingPatch(null);
    setAnalysisReport(null);
  };

  const handleFindBug = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 550)); // Local AST & lint probe

    setAnalysisReport(`### Local Code Inspection: /workspace/project/src/search_engine.py

**Severity:** High (Runtime Crash)
**Identified Flaw:** \`ZeroDivisionError\` in \`OfflineSearchEngine.add_document()\`

\`\`\`python
# Faulty logic:
total_len = sum(self.doc_lengths.values())
self.avg_doc_len = total_len / (len(self.doc_lengths) - 1)
\`\`\`

**Explanation:**
When indexing a single document or the initial file in a repository (\`len == 1\`), subtracting 1 results in division by zero. Furthermore, calculating the true average document length requires dividing by the total document count (\`len(self.doc_lengths)\`).`);

    setPendingPatch(`--- a/workspace/project/src/search_engine.py
+++ b/workspace/project/src/search_engine.py
@@ -23,3 +23,4 @@
-        self.avg_doc_len = total_len / (len(self.doc_lengths) - 1)
+        doc_count = len(self.doc_lengths)
+        self.avg_doc_len = (total_len / doc_count) if doc_count > 0 else 0.0`);

    setIsAnalyzing(false);
  };

  const handleApproveAndApply = () => {
    if (!pendingPatch) return;
    const fixedContent = fileContent.replace(
      'self.avg_doc_len = total_len / (len(self.doc_lengths) - 1)',
      `doc_count = len(self.doc_lengths)\n        self.avg_doc_len = (total_len / doc_count) if doc_count > 0 else 0.0`
    );
    virtualFileSystem.writeFile(selectedFile, fixedContent);
    setFileContent(fixedContent);
    setPatchApplied(true);
    setPendingPatch(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="text-[11px] font-mono text-[#E10600] uppercase tracking-wider">
            Offline Code Agent · Workspace Analysis & AST Inspector
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            Local Code Agent
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFindBug}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#E10600] hover:bg-[#C50500] disabled:opacity-40 rounded-lg transition-colors shadow-md shadow-red-950/40"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Analyze Code & Find Bugs</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Repository Tree & Pipeline View */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-[#10121A] border border-neutral-800 rounded-xl space-y-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Folder className="w-3.5 h-3.5 text-neutral-400" />
              <span>Project Directory: /workspace/project</span>
            </div>
            <div className="space-y-1">
              {projectFiles.map((f) => (
                <button
                  key={f.path}
                  onClick={() => handleSelectFile(f.path)}
                  className={`w-full text-left p-2 rounded text-xs flex items-center gap-2 transition-colors ${
                    selectedFile === f.path
                      ? 'bg-neutral-800 text-white font-medium border border-neutral-700'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="truncate">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Architecture Visual */}
          <div className="p-4 bg-[#10121A] border border-neutral-800 rounded-xl space-y-2">
            <div className="text-xs font-semibold text-white">Neural Execution Pipeline</div>
            <div className="relative rounded-lg overflow-hidden border border-neutral-800 aspect-video">
              <img
                src={CODE_ARCH_IMG}
                alt="Local edge pipeline architecture"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              Task decomposition and AST verification running in on-device memory without cloud egress.
            </p>
          </div>
        </div>

        {/* Right Column: Code Editor & Patch Review */}
        <div className="lg:col-span-8 space-y-4">
          {/* File Editor Display */}
          <div className="p-4 bg-[#10121A] border border-neutral-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800">
              <span className="font-mono text-neutral-400">{selectedFile}</span>
              {patchApplied && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>PATCH APPLIED LOCALLY</span>
                </span>
              )}
            </div>
            <div className="bg-neutral-950 p-4 rounded-lg font-mono text-xs text-neutral-300 overflow-x-auto max-h-80 border border-neutral-800/80">
              <pre className="whitespace-pre">{fileContent}</pre>
            </div>
          </div>

          {/* Analysis & Permission Gate */}
          {analysisReport && (
            <div className="p-5 bg-[#0F1118] border border-neutral-800 rounded-xl space-y-4 animate-in fade-in">
              <ResponseDisplay 
                content={analysisReport} 
                title="AST Diagnostic Report · Search Engine Bug" 
              />

              {pendingPatch && (
                <div className="p-4 bg-neutral-950 rounded-xl border border-red-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#E10600]" />
                      <span>Proposed Unified Diff Patch (Requires User Approval)</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">Permission Gate</span>
                  </div>

                  <pre className="p-3 bg-neutral-900 rounded font-mono text-xs text-neutral-200 overflow-x-auto border border-neutral-800">
                    {pendingPatch}
                  </pre>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setPendingPatch(null)}
                      className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={handleApproveAndApply}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#E10600] hover:bg-[#C50500] rounded-lg transition-colors shadow-md shadow-red-950/40"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Changes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
