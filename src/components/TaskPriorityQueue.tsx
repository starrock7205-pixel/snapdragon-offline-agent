import React, { useState } from 'react';
import { 
  PlannedTask, 
  AgentExecutionPlan, 
  TaskBatch 
} from '../types/agent';
import { 
  ArrowDown, 
  ArrowUp, 
  Ban, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Flame, 
  Layers, 
  ListOrdered, 
  PlayCircle, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  Wrench, 
  Zap, 
  X,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

interface TaskPriorityQueueProps {
  plan: AgentExecutionPlan;
  onCancelTask?: (taskId: string) => void;
  onReorderTasks?: (fromIndex: number, toIndex: number) => void;
  onSetTaskPriority?: (taskId: string, priority: 'HIGH' | 'NORMAL' | 'LOW') => void;
  onSortByPriority?: () => void;
  onToggleExecutionMode?: () => void;
  onRollbackToCheckpoint?: () => void;
}

export const TaskPriorityQueue: React.FC<TaskPriorityQueueProps> = ({
  plan,
  onCancelTask,
  onReorderTasks,
  onSetTaskPriority,
  onSortByPriority,
  onToggleExecutionMode,
  onRollbackToCheckpoint,
}) => {
  const [viewMode, setViewMode] = useState<'queue' | 'compact'>('queue');

  const pendingCount = plan.tasks.filter(t => t.status === 'PENDING').length;
  const runningCount = plan.tasks.filter(t => t.status === 'RUNNING').length;
  const completedCount = plan.tasks.filter(t => t.status === 'COMPLETED').length;
  const cancelledCount = plan.tasks.filter(t => t.status === 'CANCELLED').length;

  const isParallelMode = plan.executionMode !== 'SEQUENTIAL';

  const handleMoveUp = (index: number) => {
    if (index > 0 && onReorderTasks) {
      onReorderTasks(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < plan.tasks.length - 1 && onReorderTasks) {
      onReorderTasks(index, index + 1);
    }
  };

  const renderTaskCard = (task: PlannedTask, index: number) => {
    const isPending = task.status === 'PENDING';
    const isRunning = task.status === 'RUNNING';
    const isCompleted = task.status === 'COMPLETED';
    const isCancelled = task.status === 'CANCELLED';
    const isAwaitingApproval = task.status === 'AWAITING_APPROVAL';

    const currentPriority = task.priority || 'NORMAL';

    return (
      <div
        key={task.id}
        className={`p-3.5 rounded-xl border backdrop-blur-xl transition-all ${
          isRunning
            ? 'bg-gradient-to-r from-[#E10600]/15 via-white/[0.04] to-white/[0.02] border-[#E10600]/60 shadow-[0_8px_24px_rgba(225,6,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
            : isCompleted
            ? 'bg-white/[0.015] border-white/[0.06] opacity-90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
            : isCancelled
            ? 'bg-white/[0.01] border-white/[0.04] opacity-50'
            : isAwaitingApproval
            ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_4px_16px_rgba(245,158,11,0.1)]'
            : 'bg-white/[0.025] hover:bg-white/[0.045] border-white/[0.08] hover:border-white/[0.14] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Step indicator, title & description */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex flex-col items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs font-bold text-neutral-300">
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : isRunning ? (
                <span className="w-2 h-2 rounded-full bg-[#E10600] animate-ping" />
              ) : isCancelled ? (
                <Ban className="w-3.5 h-3.5 text-neutral-500" />
              ) : (
                <span>#{task.stepNumber}</span>
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold ${
                  isCancelled ? 'line-through text-neutral-500' : 'text-white'
                }`}>
                  {task.title}
                </span>

                {/* Status Badge */}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase ${
                  isRunning
                    ? 'bg-red-500/20 text-[#E10600] border border-red-500/40 animate-pulse'
                    : isCompleted
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : isCancelled
                    ? 'bg-neutral-800 text-neutral-500'
                    : isAwaitingApproval
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-neutral-800/90 text-neutral-300'
                }`}>
                  {task.status}
                </span>

                {/* Tool Identifier */}
                {task.toolName && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-cyan-300 border border-neutral-800 flex items-center gap-1">
                    <Wrench className="w-2.5 h-2.5" />
                    <span>{task.toolName}</span>
                  </span>
                )}

                {/* Parallel Tag */}
                {isParallelMode && task.batchNumber && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" />
                    <span>Batch #{task.batchNumber}</span>
                  </span>
                )}
              </div>

              <p className={`text-xs ${
                isCancelled ? 'text-neutral-600' : 'text-neutral-400'
              }`}>
                {task.description}
              </p>

              {task.output && (
                <div className="mt-1 text-[11px] font-mono text-neutral-400 bg-neutral-950/70 p-2 rounded border border-neutral-800/60">
                  {task.output}
                </div>
              )}
            </div>
          </div>

          {/* Right: Priority Selector, Move Up/Down, & Cancel Button */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Priority Selector Tag (Active for Pending & Running tasks) */}
            {!isCompleted && !isCancelled && onSetTaskPriority && (
              <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800 text-xs">
                <span className="text-[10px] font-mono text-neutral-500 uppercase mr-1">
                  Priority:
                </span>
                <button
                  onClick={() => onSetTaskPriority(task.id, 'HIGH')}
                  disabled={!isPending}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                    currentPriority === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  title="High Priority"
                >
                  HIGH
                </button>
                <button
                  onClick={() => onSetTaskPriority(task.id, 'NORMAL')}
                  disabled={!isPending}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                    currentPriority === 'NORMAL'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  title="Normal Priority"
                >
                  NORM
                </button>
                <button
                  onClick={() => onSetTaskPriority(task.id, 'LOW')}
                  disabled={!isPending}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                    currentPriority === 'LOW'
                      ? 'bg-neutral-800 text-neutral-300'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  title="Low Priority"
                >
                  LOW
                </button>
              </div>
            )}

            {/* Move Up / Move Down Reordering Controls */}
            {isPending && onReorderTasks && (
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Move step up in execution priority"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === plan.tasks.length - 1}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="Move step down in execution priority"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Cancel Task Button */}
            {isPending && onCancelTask && (
              <button
                onClick={() => onCancelTask(task.id)}
                className="p-1.5 text-neutral-400 hover:text-red-400 bg-neutral-950 hover:bg-red-950/30 rounded-lg border border-neutral-800 hover:border-red-900/50 transition-colors"
                title="Cancel this pending step"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 bg-white/[0.025] hover:bg-white/[0.035] backdrop-blur-2xl border border-white/[0.09] rounded-2xl space-y-4 shadow-[0_16px_40px_0_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all">
      {/* Top Header & Priority Queue Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
            <span className="text-[10px] font-mono text-[#E10600] uppercase tracking-wider font-semibold">
              Snapdragon DAG Engine · Task Batching & Priority Queue
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white mt-0.5">
            {plan.userGoal}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-neutral-400">
            <span className="text-amber-400 font-semibold">{pendingCount} in Queue</span>
            <span>·</span>
            <span className="text-cyan-400 font-semibold">{runningCount} Running</span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold">{completedCount} Completed</span>
            {cancelledCount > 0 && (
              <>
                <span>·</span>
                <span className="text-red-400 font-semibold">{cancelledCount} Cancelled</span>
              </>
            )}
            {plan.batches && (
              <>
                <span>·</span>
                <span className="text-purple-400 font-semibold">
                  {plan.batches.length} Execution Batches
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Batch Parallel / Sequential Toggle */}
          {onToggleExecutionMode && (
            <button
              onClick={onToggleExecutionMode}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border shadow-sm ${
                isParallelMode
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 hover:bg-cyan-900/60'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
              title="Toggle between parallel multi-task batching and single-threaded sequential execution"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isParallelMode ? '⚡ Batch Parallel' : '🔄 Sequential'}</span>
            </button>
          )}

          {pendingCount > 1 && onSortByPriority && (
            <button
              onClick={onSortByPriority}
              className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/80 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm"
              title="Auto-sort pending tasks: HIGH > NORMAL > LOW"
            >
              <Flame className="w-3 h-3 text-[#E10600]" />
              <span>Sort by Priority</span>
            </button>
          )}

          <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800 text-xs">
            <button
              onClick={() => setViewMode('queue')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === 'queue'
                  ? 'bg-[#E10600] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Priority Queue
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === 'compact'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Compact Grid
            </button>
          </div>
        </div>
      </div>

      {/* Execution Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
          <span className="flex items-center gap-1.5">
            <span>PIPELINE PROGRESS</span>
            {isParallelMode && (
              <span className="text-cyan-400 font-semibold">(Multi-threaded Parallel Batching)</span>
            )}
          </span>
          <span>
            {Math.round((completedCount / Math.max(1, plan.tasks.length)) * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-neutral-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#E10600] via-cyan-500 to-emerald-400 transition-all duration-500"
            style={{
              width: `${Math.round(
                (completedCount / Math.max(1, plan.tasks.length)) * 100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Atomic Checkpoint & Fault Isolation Bar */}
      {plan.rollbackAvailable && (
        <div className="p-3 bg-white/[0.03] backdrop-blur-xl rounded-xl border border-white/[0.1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-medium text-white flex items-center gap-2">
                <span>Checkpoint State: <span className="text-emerald-400">{plan.rollbackCheckpointId || 'ACTIVE_SNAPSHOT'}</span></span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold">
                  Atomic Isolated
                </span>
              </div>
              <div className="text-[10px] text-neutral-400 font-mono">
                Memory state & artifacts snapshot preserved. No uncommitted mutations.
              </div>
            </div>
          </div>

          {onRollbackToCheckpoint && (
            <button
              onClick={onRollbackToCheckpoint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-amber-300 border border-amber-500/30 transition-all shrink-0"
              title="Revert uncommitted batch tasks back to clean checkpoint state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rollback to Checkpoint</span>
            </button>
          )}
        </div>
      )}

      {/* View Mode: Interactive Priority Queue with Batch Stages */}
      {viewMode === 'queue' ? (
        <div className="space-y-4">
          {plan.batches && plan.batches.length > 0 ? (
            /* Render Grouped by Batches */
            plan.batches.map((batch) => {
              const batchTasks = plan.tasks.filter(t => batch.taskIds.includes(t.id));
              const isBatchRunning = batch.status === 'RUNNING';
              const isBatchCompleted = batch.status === 'COMPLETED';

              return (
                <div
                  key={batch.id}
                  className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
                    isBatchRunning
                      ? 'bg-neutral-900/60 border-cyan-500/40 shadow-md'
                      : isBatchCompleted
                      ? 'bg-neutral-950/40 border-neutral-800/60'
                      : 'bg-neutral-950/20 border-neutral-800/40'
                  }`}
                >
                  {/* Batch Stage Header */}
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-neutral-800/50">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        isBatchRunning
                          ? 'bg-cyan-400 animate-ping'
                          : isBatchCompleted
                          ? 'bg-emerald-400'
                          : 'bg-neutral-600'
                      }`} />
                      <span className="font-mono text-xs font-bold text-white">
                        {batch.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      {batch.canRunInParallel && batchTasks.length > 1 && (
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          <span>Concurrent Dispatch ({batchTasks.length} tasks)</span>
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded font-semibold uppercase ${
                        isBatchRunning
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : isBatchCompleted
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {batch.status}
                      </span>
                    </div>
                  </div>

                  {/* Tasks inside this batch */}
                  <div className="space-y-2">
                    {batchTasks.map((task) => {
                      const globalIndex = plan.tasks.findIndex(t => t.id === task.id);
                      return renderTaskCard(task, globalIndex);
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            /* Flat list fallback if no batches */
            <div className="space-y-2">
              {plan.tasks.map((task, index) => renderTaskCard(task, index))}
            </div>
          )}
        </div>
      ) : (
        /* Compact Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {plan.tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-xl border transition-all ${
                task.status === 'RUNNING'
                  ? 'bg-neutral-900 border-[#E10600]/40'
                  : task.status === 'COMPLETED'
                  ? 'bg-neutral-950/70 border-neutral-800/80'
                  : task.status === 'CANCELLED'
                  ? 'bg-neutral-950/30 border-neutral-900 text-neutral-600 line-through'
                  : 'bg-neutral-950/40 border-neutral-800/40 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-neutral-500">#{task.stepNumber}</span>
                  <span className="font-medium text-white">{task.title}</span>
                </div>
                {task.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[10px] font-mono text-neutral-500">
                    {task.toolName || 'REASONING'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">{task.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
