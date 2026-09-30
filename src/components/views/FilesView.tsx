import React, { useState, useRef } from 'react';
import { 
  File, 
  FileText, 
  Folder, 
  FolderPlus, 
  Plus, 
  RotateCcw, 
  Save, 
  Search, 
  Trash2, 
  Upload,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { VFile, virtualFileSystem } from '../../tools/virtualFileSystem';
import { localVectorStore } from '../../rag/localVectorStore';

export const FilesView: React.FC = () => {
  const [currentDir, setCurrentDir] = useState<string>('/workspace');
  const [files, setFiles] = useState<VFile[]>(() => {
    virtualFileSystem.init();
    return virtualFileSystem.listDirectory('/workspace');
  });
  const [selectedFile, setSelectedFile] = useState<VFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newFileName, setNewFileName] = useState<string>('');
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshFiles = (dir: string = currentDir) => {
    virtualFileSystem.init();
    setFiles(virtualFileSystem.listDirectory(dir));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    let count = 0;
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      try {
        const text = await file.text();
        const targetPath = `${currentDir}/${file.name}`;
        
        // 1. Write to local virtual file system
        virtualFileSystem.writeFile(targetPath, text);

        // 2. Automatically index into offline vector store for RAG
        const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
        const fileType = ext === 'pdf' ? 'pdf' : ext === 'md' ? 'md' : ext === 'py' || ext === 'ts' || ext === 'js' ? 'code' : 'txt';
        localVectorStore.addDocument(file.name, text, fileType, 'User Uploads');
        count++;
      } catch (err) {
        console.error('Failed to read file:', file.name, err);
      }
    }

    refreshFiles();
    setUploadStatus(`Successfully imported & vector-indexed ${count} file${count > 1 ? 's' : ''} (100% offline)!`);
    setTimeout(() => setUploadStatus(null), 4000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectFile = (file: VFile) => {
    if (file.type === 'directory') {
      setCurrentDir(file.path);
      refreshFiles(file.path);
      setSelectedFile(null);
    } else {
      setSelectedFile(file);
      const content = virtualFileSystem.readFile(file.path) || '';
      setFileContent(content);
    }
  };

  const handleSaveFile = () => {
    if (!selectedFile) return;
    virtualFileSystem.writeFile(selectedFile.path, fileContent);
    refreshFiles();
  };

  const handleDeleteFile = (path: string) => {
    if (confirm(`Permanently delete ${path}?`)) {
      virtualFileSystem.deleteFile(path);
      if (selectedFile?.path === path) setSelectedFile(null);
      refreshFiles();
    }
  };

  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const path = `${currentDir}/${newFileName.trim()}`;
    virtualFileSystem.writeFile(path, '# New File\n');
    setNewFileName('');
    setIsCreatingFile(false);
    refreshFiles();
  };

  const handleResetDefaults = () => {
    virtualFileSystem.resetToDefaults();
    setCurrentDir('/workspace');
    refreshFiles('/workspace');
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="text-[11px] font-mono text-[#E10600] uppercase tracking-wider">
            Permissioned Workspace File System
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            Local Workspace Explorer
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.md,.py,.js,.ts,.tsx,.json,.pdf,.csv"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#E10600] hover:bg-[#C50500] rounded-lg transition-colors shadow-md shadow-red-950/40"
            title="Import real files from your local computer (zero cloud upload)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Local Files</span>
          </button>
          <button
            onClick={() => setIsCreatingFile(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New File</span>
          </button>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-800"
            title="Reset workspace to default study & code files"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Directory Tree & Files */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-[#10121A] border border-neutral-800 rounded-xl space-y-3">
            {/* Breadcrumb / Nav */}
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-1 truncate">
                <span
                  onClick={() => {
                    setCurrentDir('/workspace');
                    refreshFiles('/workspace');
                  }}
                  className="cursor-pointer hover:text-white"
                >
                  /workspace
                </span>
                {currentDir !== '/workspace' && (
                  <span>{currentDir.replace('/workspace', '')}</span>
                )}
              </div>
              {currentDir !== '/workspace' && (
                <button
                  onClick={() => {
                    const parent = currentDir.substring(0, currentDir.lastIndexOf('/')) || '/workspace';
                    setCurrentDir(parent);
                    refreshFiles(parent);
                  }}
                  className="text-neutral-400 hover:text-white text-[11px]"
                >
                  Up
                </button>
              )}
            </div>

            {/* Create file inline input */}
            {isCreatingFile && (
              <form onSubmit={handleCreateNewFile} className="flex gap-2 pb-2 border-b border-neutral-800">
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="filename.txt..."
                  className="flex-1 px-2.5 py-1 text-xs bg-neutral-950 text-white rounded border border-neutral-700 outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 text-xs bg-[#E10600] text-white rounded hover:bg-[#C50500]"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingFile(false)}
                  className="px-2 py-1 text-xs text-neutral-400"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* File List */}
            <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
              {files.map((file) => (
                <div
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors group ${
                    selectedFile?.path === file.path
                      ? 'bg-neutral-800 text-white font-medium border border-neutral-700'
                      : 'hover:bg-neutral-900 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.type === 'directory' ? (
                      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}
                    <span className="truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-neutral-500">
                      {file.type === 'file' ? `${file.size} B` : 'DIR'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.path);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: File Content Editor */}
        <div className="lg:col-span-7">
          <div className="p-4 bg-[#10121A] border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
              <span className="font-mono text-white truncate max-w-sm">
                {selectedFile ? selectedFile.path : 'No file selected'}
              </span>
              {selectedFile && (
                <button
                  onClick={handleSaveFile}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-[#E10600] hover:bg-[#C50500] rounded transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              )}
            </div>

            {selectedFile ? (
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                rows={18}
                className="w-full p-4 bg-neutral-950 font-mono text-xs text-neutral-200 rounded-lg border border-neutral-800 focus:border-[#E10600] outline-none resize-y leading-relaxed"
              />
            ) : (
              <div className="text-center py-24 text-xs text-neutral-500">
                Click a file on the left to read or edit its contents.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
