/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ActiveNavTab, TopBar } from './components/TopBar';
import { ApprovalModal } from './components/ApprovalModal';
import { SetupWizardModal } from './components/SetupWizardModal';
import { AudioTranscriptionModal } from './components/AudioTranscriptionModal';

// Views
import { WorkstationView } from './components/views/WorkstationView';
import { StudyView } from './components/views/StudyView';
import { LectureView } from './components/views/LectureView';
import { CodeView } from './components/views/CodeView';
import { CreateView } from './components/views/CreateView';
import { FilesView } from './components/views/FilesView';
import { MemoryView } from './components/views/MemoryView';
import { OfflineLabView } from './components/views/OfflineLabView';
import { HardwareView } from './components/views/HardwareView';
import { DemosView } from './components/views/DemosView';

// Types & Services
import { 
  AgentExecutionPlan, 
  AgentMode, 
  AgentState, 
  AgentTimelineEntry, 
  ChatMessage, 
  PlannedTask 
} from './types/agent';
import { HardwareInfo } from './types/hardware';
import { detectHardwareCapabilities, getDefaultHardwareInfo } from './hardware/hardwareDetector';
import { agentOrchestrator } from './agent/agentOrchestrator';
import { getStarterData } from './agent/starterData';

const starter = getStarterData();

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('workstation');
  const [networkLock, setNetworkLock] = useState<boolean>(true); // Offline-by-default
  const [hardware, setHardware] = useState<HardwareInfo>(getDefaultHardwareInfo);
  const [selectedMode, setSelectedMode] = useState<AgentMode>('CORE');
  const [agentState, setAgentState] = useState<AgentState>('IDLE');
  const [currentPlan, setCurrentPlan] = useState<AgentExecutionPlan | null>(starter.initialPlan);
  const [timeline, setTimeline] = useState<AgentTimelineEntry[]>(starter.initialTimeline);
  const [messages, setMessages] = useState<ChatMessage[]>(starter.initialMessages);

  // Modals
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isTranscribeOpen, setIsTranscribeOpen] = useState<boolean>(false);
  const [pendingApproval, setPendingApproval] = useState<{
    task: PlannedTask;
    onApprove: () => void;
    onReject: () => void;
  } | null>(null);

  // Initialize backend systems & listeners
  useEffect(() => {
    agentOrchestrator.init();

    agentOrchestrator.registerListeners({
      onStateChange: (state) => setAgentState(state),
      onTimelineUpdate: (entry) => setTimeline((prev) => [...prev, entry]),
      onPlanUpdate: (plan) => setCurrentPlan(plan),
      onApprovalRequired: (task, onApprove, onReject) => {
        setPendingApproval({
          task,
          onApprove: () => {
            setPendingApproval(null);
            onApprove();
          },
          onReject: () => {
            setPendingApproval(null);
            onReject();
          },
        });
      },
    });

    // Detect hardware asynchronously
    detectHardwareCapabilities().then(info => setHardware(info));
  }, []);

  const handleRefreshHardware = async () => {
    const updated = await detectHardwareCapabilities();
    setHardware(updated);
  };

  const handleExecuteGoal = async (goal: string) => {
    // Switch to workstation to see execution
    setActiveTab('workstation');

    // Add user message
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: goal,
      timestamp: Date.now(),
      mode: selectedMode,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const agentMsg = await agentOrchestrator.executeGoal(goal, selectedMode);
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      console.error(err);
      setAgentState('IDLE');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#06080F] text-neutral-100 flex flex-col font-sans antialiased selection:bg-[#E10600]/30 selection:text-white">
      {/* Sophisticated Frosted-Glass Atmospheric Ambient Lights & Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep Snapdragon Crimson Ambient Light */}
        <div 
          className="absolute -top-[15%] left-[15%] w-[680px] h-[680px] rounded-full bg-gradient-to-br from-[#E10600]/12 via-[#E10600]/4 to-transparent blur-[140px] opacity-80" 
          aria-hidden="true" 
        />
        {/* High-Tech Indigo/Cyan Atmospheric Resonance */}
        <div 
          className="absolute top-[40%] -right-[10%] w-[620px] h-[620px] rounded-full bg-gradient-to-tl from-cyan-600/8 via-indigo-600/6 to-transparent blur-[150px] opacity-70" 
          aria-hidden="true" 
        />
        {/* Emerald Offline Grounding Light */}
        <div 
          className="absolute -bottom-[10%] left-[25%] w-[580px] h-[580px] rounded-full bg-gradient-to-tr from-emerald-500/5 via-teal-900/4 to-transparent blur-[140px] opacity-60" 
          aria-hidden="true" 
        />
        {/* Precision Sub-Pixel Micro-Grid Drafting Pattern */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:28px_28px] opacity-70" 
          aria-hidden="true" 
        />
        {/* Vignette Overlay for Depth */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#06080F]/90" 
          aria-hidden="true" 
        />
      </div>

      {/* 3-Zone Frosted-Glass Top Bar */}
      <div className="relative z-40">
        <TopBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          networkLock={networkLock}
          onToggleNetworkLock={() => setNetworkLock((prev) => !prev)}
          hardware={hardware}
          onOpenSetup={() => setIsSetupOpen(true)}
          onOpenTranscribe={() => setIsTranscribeOpen(true)}
        />
      </div>

      {/* Main View Area with Frosted Glass Surface */}
      <main className="relative z-10 flex-1 pb-16 pt-2">
        {activeTab === 'workstation' && (
          <WorkstationView
            agentState={agentState}
            currentPlan={currentPlan}
            timeline={timeline}
            messages={messages}
            hardware={hardware}
            networkLock={networkLock}
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            onSubmitGoal={handleExecuteGoal}
            onCancelTask={(taskId) => agentOrchestrator.cancelTask(taskId)}
            onReorderTasks={(fromIdx, toIdx) => agentOrchestrator.reorderTasks(fromIdx, toIdx)}
            onSetTaskPriority={(taskId, priority) => agentOrchestrator.setTaskPriority(taskId, priority)}
            onSortByPriority={() => agentOrchestrator.sortByPriority()}
            onToggleExecutionMode={() => agentOrchestrator.toggleExecutionMode()}
            onRollbackToCheckpoint={() => agentOrchestrator.rollbackToCheckpoint()}
          />
        )}

        {activeTab === 'study' && <StudyView />}
        {activeTab === 'lecture' && <LectureView />}
        {activeTab === 'code' && <CodeView />}
        {activeTab === 'create' && <CreateView />}
        {activeTab === 'files' && <FilesView />}
        {activeTab === 'memory' && <MemoryView />}
        {activeTab === 'lab' && (
          <OfflineLabView hardware={hardware} networkLock={networkLock} />
        )}
        {activeTab === 'hardware' && (
          <HardwareView
            hardware={hardware}
            onRefreshHardware={handleRefreshHardware}
          />
        )}
        {activeTab === 'demos' && (
          <DemosView
            onRunDemoGoal={handleExecuteGoal}
            onToggleNetworkLock={() => setNetworkLock((prev) => !prev)}
            networkLock={networkLock}
          />
        )}
      </main>

      {/* Monochromatic Frosted-Glass Workstation Footer */}
      <footer className="relative z-20 w-full border-t border-white/[0.06] bg-[#070912]/50 backdrop-blur-xl py-3 px-6 text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[#E10600] inline-block shadow-[0_0_8px_rgba(225,6,0,0.8)]" />
          <span className="text-white font-semibold">Snapdragon Workstation Engine</span>
          <span className="text-neutral-600">·</span>
          <span>Hexagon NPU (45 TOPS)</span>
          <span className="text-neutral-600">·</span>
          <span className="text-emerald-400 font-medium">100% Offline Air-Gapped</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-500">
          <span>Glassmorphic Modern UI</span>
          <span>·</span>
          <span>Zero Subscriptions</span>
          <span>·</span>
          <span className="text-neutral-300 font-medium">Boya Yashwanth Kumar</span>
        </div>
      </footer>

      {/* Approval Permission Gate Modal */}
      <ApprovalModal
        task={pendingApproval?.task || null}
        isOpen={Boolean(pendingApproval)}
        onApprove={() => pendingApproval?.onApprove()}
        onReject={() => pendingApproval?.onReject()}
      />

      {/* 7-Step Model & Hardware Setup Wizard Modal */}
      <SetupWizardModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        hardware={hardware}
      />

      {/* Global Audio Transcription Studio Modal (gemini-3.5-transcribe) */}
      <AudioTranscriptionModal
        isOpen={isTranscribeOpen}
        onClose={() => setIsTranscribeOpen(false)}
        onSendToWorkstation={(transcript) => handleExecuteGoal(transcript)}
      />
    </div>
  );
}
