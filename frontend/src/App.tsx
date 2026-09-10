import React, { useState } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { UAVGrid } from './components/UAVGrid';
import { MissionMap } from './components/MissionMap';
import { TaskPanel } from './components/TaskPanel';
import { RiskPanel } from './components/RiskPanel';
import { AIDecisionPanel } from './components/AIDecisionPanel';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { SimulationControls } from './components/SimulationControls';
import { MissionTimeline } from './components/MissionTimeline';
import { ComparisonPanel } from './components/ComparisonPanel';
import { MLMetricsPanel } from './components/MLMetricsPanel';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { ReplanningNotificationModal } from './components/ReplanningNotificationModal';
import { MissionConfigModal } from './components/MissionConfigModal';
import { PresetScenariosModal } from './components/PresetScenariosModal';
import { MissionExportModal } from './components/MissionExportModal';
import { tacticalAudio } from './services/soundEffects';
import { api } from './services/api';

import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Zap,
  Timer,
} from 'lucide-react';

export function App() {
  const {
    missionState,
    mlMetrics,
    comparison,
    analytics,
    selectedUAV,
    selectedUAVId,
    setSelectedUAVId,
    simulationSpeed,
    setSimulationSpeed,
    isPlaying,
    loading,
    error,
    replanningNotification,
    setReplanningNotification,
    handlePlanMission,
    handleStartSimulation,
    handlePauseSimulation,
    handleResetSimulation,
    handleReplanNow,
    handleRefreshComparison,
    triggerLowBattery,
    triggerCommLoss,
    triggerFailure,
    triggerWeather,
    triggerObstacle,
    stepSimulation,
    initialize,
  } = useSimulation();

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'analytics' | 'evaluation' | 'ml'>('control');

  // Trigger sound effect on replanning notification
  React.useEffect(() => {
    if (replanningNotification) {
      tacticalAudio.playAlertBeep('critical');
      tacticalAudio.speak(
        `Warning: High failure risk predicted on ${replanningNotification.old_uav_id}. Predictive replanning engaged. Reassigning to ${replanningNotification.new_uav_id}.`
      );
    }
  }, [replanningNotification]);

  if (loading && !missionState) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-cyan-400 font-mono gap-3">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <div className="text-sm uppercase tracking-widest font-bold">
          Initializing Autonomous Mission Control Center...
        </div>
      </div>
    );
  }

  // Format elapsed time MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeUavCount =
    missionState?.uavs.filter(
      (u) => u.status === 'ASSIGNED' || u.status === 'EN_ROUTE' || u.status === 'RETURNING'
    ).length || 0;
  const totalUavCount = missionState?.uavs.length || 0;
  const completedTasks = missionState?.tasks.filter((t) => t.status === 'COMPLETED').length || 0;
  const totalTasks = missionState?.tasks.length || 0;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const avgRisk = missionState?.uavs.length
    ? Math.round(
        missionState.uavs.reduce((acc, u) => acc + (u.risk_probability || 0), 0) /
          missionState.uavs.length
      )
    : 0;

  const totalEnergy = missionState?.uavs.length
    ? Math.round(missionState.uavs.reduce((acc, u) => acc + u.total_energy_consumed, 0))
    : 0;

  const handleCreateNewMission = async (payload: any) => {
    try {
      tacticalAudio.playAlertBeep('click');
      await api.createMission(payload);
      await initialize();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartWithSound = () => {
    tacticalAudio.playAlertBeep('success');
    tacticalAudio.speak('Mission started. Fleet en route.');
    handleStartSimulation();
  };

  const handlePlanWithSound = () => {
    tacticalAudio.playAlertBeep('click');
    tacticalAudio.speak('Mission planned. A star collision free routes calculated.');
    handlePlanMission();
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <Header
        missionState={missionState}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Error Alert if any */}
        {error && (
          <div className="glass-panel border-rose-500/50 bg-rose-500/10 p-3 rounded-xl text-rose-300 font-mono text-xs flex items-center justify-between">
            <span>ERROR: {error}</span>
            <button onClick={() => initialize()} className="text-cyan-400 underline hover:text-cyan-300">
              Retry Sync
            </button>
          </div>
        )}

        {/* 1. TOP METRIC CARDS (6 Key Metrics) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            title="Active UAVs"
            value={`${activeUavCount} / ${totalUavCount}`}
            subtitle="Fleet Deployment"
            icon={Layers}
            accentColor="cyan"
          />
          <MetricCard
            title="Mission Completion"
            value={`${completionPct}%`}
            subtitle={`${completedTasks} of ${totalTasks} Tasks`}
            icon={CheckCircle2}
            trend={completionPct === 100 ? 'SUCCESS' : 'IN PROGRESS'}
            accentColor="emerald"
          />
          <MetricCard
            title="Average Risk"
            value={`${avgRisk}%`}
            subtitle="ML Predicted Failure"
            icon={AlertTriangle}
            accentColor={avgRisk > 60 ? 'rose' : avgRisk > 35 ? 'amber' : 'emerald'}
          />
          <MetricCard
            title="Replanning Events"
            value={missionState?.replanning_count || 0}
            subtitle={`${missionState?.prevented_failures || 0} Failures Prevented`}
            icon={RotateCw}
            accentColor="blue"
          />
          <MetricCard
            title="Energy Consumed"
            value={`${totalEnergy} Units`}
            subtitle="Simulation Energy Model"
            icon={Zap}
            accentColor="amber"
          />
          <MetricCard
            title="Mission Time"
            value={formatTime(missionState?.elapsed_seconds || 0)}
            subtitle={`Step #${missionState?.step_count || 0}`}
            icon={Timer}
            accentColor="cyan"
          />
        </div>

        {/* 2. TAB CONTROLS */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('control')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'control'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>Tactical Airspace & Control</span>
            </button>
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'evaluation'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>Reactive vs Predictive Evaluation</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>Telemetry & Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('ml')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'ml'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>ML Risk Model Diagnostics</span>
            </button>
          </div>
        </div>

        {/* 3. SIMULATION CONTROLS BAR */}
        <SimulationControls
          isPlaying={isPlaying}
          status={missionState?.status || 'CONFIGURED'}
          speed={simulationSpeed}
          onStart={handleStartWithSound}
          onPause={handlePauseSimulation}
          onReset={handleResetSimulation}
          onPlan={handlePlanWithSound}
          onReplan={handleReplanNow}
          onStep={stepSimulation}
          onSpeedChange={setSimulationSpeed}
        />

        {/* 4. MAIN TAB CONTENT */}
        {activeTab === 'control' && (
          <div className="space-y-6">
            {/* Top Row: Map (Left) + Right Telemetry Column */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Left Column: Interactive Map */}
              <div className="xl:col-span-8 flex flex-col gap-6">
                <MissionMap
                  uavs={missionState?.uavs || []}
                  tasks={missionState?.tasks || []}
                  obstacles={missionState?.obstacles || []}
                  weather={missionState?.weather}
                  mapWidth={missionState?.mission.map_width || 50}
                  mapHeight={missionState?.mission.map_height || 50}
                  selectedUAVId={selectedUAVId}
                  onSelectUAV={setSelectedUAVId}
                  onAddObstacleAt={(x, y) =>
                    triggerObstacle({
                      id: `OBS-CUSTOM-${Date.now().toString().slice(-4)}`,
                      x: Math.max(0, x - 4),
                      y: Math.max(0, y - 4),
                      width: 8,
                      height: 8,
                    })
                  }
                  onAddTaskAt={async (x, y) => {
                    if (!missionState?.mission.id) return;
                    await api.createMission({
                      ...missionState.mission,
                      tasks: [
                        ...missionState.tasks,
                        { name: `Target Sector ${missionState.tasks.length + 1}`, x, y, priority: 4 },
                      ],
                    });
                    await initialize();
                  }}
                />

                {/* What-If Scenario Injector */}
                <WhatIfSimulator
                  uavs={missionState?.uavs || []}
                  selectedUAVId={selectedUAVId}
                  onSimulateLowBattery={(id, bat) => {
                    tacticalAudio.playAlertBeep('warning');
                    triggerLowBattery(id, bat);
                  }}
                  onSimulateCommLoss={(id, comm) => {
                    tacticalAudio.playAlertBeep('warning');
                    triggerCommLoss(id, comm);
                  }}
                  onSimulateFailure={(id) => {
                    tacticalAudio.playAlertBeep('critical');
                    triggerFailure(id);
                  }}
                  onSimulateWeather={(w) => {
                    tacticalAudio.playAlertBeep('click');
                    triggerWeather(w);
                  }}
                  onSimulateObstacle={(obs) => {
                    tacticalAudio.playAlertBeep('click');
                    triggerObstacle(obs);
                  }}
                />
              </div>

              {/* Right Column: Fleet Grid, Risk & AI XAI Panel, Tasks, Timeline */}
              <div className="xl:col-span-4 flex flex-col gap-6">
                {/* Explainable AI Risk Panel */}
                <RiskPanel selectedUAV={selectedUAV} />

                {/* AI Decision Panel */}
                <AIDecisionPanel
                  lastReplanningEvent={missionState?.last_replanning_event}
                  replanningCount={missionState?.replanning_count || 0}
                  preventedFailures={missionState?.prevented_failures || 0}
                />

                {/* Tasks Status */}
                <TaskPanel tasks={missionState?.tasks || []} />
              </div>
            </div>

            {/* Bottom Row: Fleet UAV Cards & Event Stream */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8">
                <UAVGrid
                  uavs={missionState?.uavs || []}
                  selectedUAVId={selectedUAVId}
                  onSelectUAV={setSelectedUAVId}
                  onSimulateLowBattery={(id) => triggerLowBattery(id, 20)}
                  onSimulateCommLoss={(id) => triggerCommLoss(id, 12)}
                  onSimulateFailure={triggerFailure}
                />
              </div>
              <div className="xl:col-span-4">
                <MissionTimeline events={missionState?.recent_events || []} />
              </div>
            </div>
          </div>
        )}

        {/* 5. EVALUATION TAB: REACTIVE VS PREDICTIVE */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            <ComparisonPanel comparison={comparison} onRefresh={handleRefreshComparison} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AIDecisionPanel
                lastReplanningEvent={missionState?.last_replanning_event}
                replanningCount={missionState?.replanning_count || 0}
                preventedFailures={missionState?.prevented_failures || 0}
              />
              <MLMetricsPanel metrics={mlMetrics} />
            </div>
          </div>
        )}

        {/* 6. ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <AnalyticsCharts
              uavs={missionState?.uavs || []}
              analytics={analytics}
              stepCount={missionState?.step_count || 0}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComparisonPanel comparison={comparison} onRefresh={handleRefreshComparison} />
              <MissionTimeline events={missionState?.recent_events || []} />
            </div>
          </div>
        )}

        {/* 7. ML RISK MODEL DIAGNOSTICS TAB */}
        {activeTab === 'ml' && (
          <div className="space-y-6">
            <MLMetricsPanel metrics={mlMetrics} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RiskPanel selectedUAV={selectedUAV} />
              <AIDecisionPanel
                lastReplanningEvent={missionState?.last_replanning_event}
                replanningCount={missionState?.replanning_count || 0}
                preventedFailures={missionState?.prevented_failures || 0}
              />
            </div>
          </div>
        )}
      </main>

      {/* Prominent Replanning Notification Modal */}
      <ReplanningNotificationModal
        event={replanningNotification}
        onClose={() => setReplanningNotification(null)}
      />

      {/* Preset Scenarios Modal */}
      <PresetScenariosModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleCreateNewMission}
      />

      {/* Mission Export Debrief Modal */}
      <MissionExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        missionState={missionState}
        comparison={comparison}
        mlMetrics={mlMetrics}
      />

      {/* Mission Config Modal */}
      <MissionConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onCreateMission={handleCreateNewMission}
      />
    </div>
  );
}

export default App;
