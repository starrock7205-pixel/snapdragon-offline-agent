import React from 'react';
import { PlannedTask } from '../types/agent';
import { AlertTriangle, CheckCircle, ShieldAlert, X } from 'lucide-react';

interface ApprovalModalProps {
  task: PlannedTask | null;
  isOpen: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  task,
  isOpen,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#11131A] border border-red-500/30 rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Top header */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Permission Gate: Consequential Action
              </h3>
              <p className="text-xs text-neutral-400">
                Snapdragon Local Security Policy requires explicit user confirmation.
              </p>
            </div>
          </div>
          <button
            onClick={onReject}
            className="text-neutral-400 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Details */}
        <div className="space-y-3 mb-6">
          <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Task Step {task.stepNumber}</span>
              <span className="font-mono text-red-400">{task.toolName || 'SYSTEM_ACTION'}</span>
            </div>
            <div className="text-sm font-medium text-white mb-1">{task.title}</div>
            <p className="text-xs text-neutral-300">{task.description}</p>
          </div>

          {/* Tool Arguments / Diff Preview */}
          {task.toolArgs && (
            <div className="p-3 bg-black/60 rounded-lg border border-neutral-800/80">
              <div className="text-[11px] font-mono text-neutral-400 mb-1.5 uppercase tracking-wider">
                Target Operation Parameters
              </div>
              {task.toolArgs.path && (
                <div className="text-xs font-mono text-neutral-200 mb-1">
                  <span className="text-neutral-500">File: </span>{task.toolArgs.path}
                </div>
              )}
              {task.toolArgs.command && (
                <div className="text-xs font-mono text-neutral-200 mb-1">
                  <span className="text-neutral-500">Command: </span>{task.toolArgs.command}
                </div>
              )}
              {task.toolArgs.content && (
                <div className="mt-2 text-xs font-mono text-neutral-300 max-h-36 overflow-y-auto bg-neutral-950 p-2.5 rounded border border-neutral-800">
                  <pre className="whitespace-pre-wrap">{task.toolArgs.content.slice(0, 400)}...</pre>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-500/10 p-2.5 rounded border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>This action modifies your local workspace files. No cloud backup is involved.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onReject}
            className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onApprove}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#E10600] hover:bg-[#C50500] rounded-lg transition-colors shadow-lg shadow-red-900/30"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approve Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
