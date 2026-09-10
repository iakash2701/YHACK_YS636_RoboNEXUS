import { useState, useEffect, useRef, useCallback } from 'react';
import { MissionState, MLMetrics, PlannerComparisonResult, AnalyticsData, UAV, Task } from '../types';
import { api } from '../services/api';

export function useSimulation() {
  const [missionState, setMissionState] = useState<MissionState | null>(null);
  const [mlMetrics, setMlMetrics] = useState<MLMetrics | null>(null);
  const [comparison, setComparison] = useState<PlannerComparisonResult | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedUAVId, setSelectedUAVId] = useState<string | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1); // 1x, 2x, 5x, 10x
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [replanningNotification, setReplanningNotification] = useState<any | null>(null);

  const speedIntervalRef = useRef<number>(1000);
  const timerRef = useRef<any>(null);

  // Initialize or fetch initial mission
  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load missions
      const missions = await api.listMissions();
      let state: MissionState;
      
      if (missions.length > 0) {
        state = await api.getMissionStatus(missions[0].id);
      } else {
        state = await api.createMission({
          name: "Demo Operation: Sector Alpha Surveillance",
          weather: "NORMAL",
          map_width: 50,
          map_height: 50
        });
      }
      
      setMissionState(state);
      if (state.uavs.length > 0) {
        setSelectedUAVId(state.uavs[0].id);
      }
      
      // Load ML Metrics
      const metrics = await api.getMLMetrics();
      setMlMetrics(metrics);
      
      // Load Analytics
      const analyticsData = await api.getAnalytics(state.mission.id);
      setAnalytics(analyticsData);
      
      // Load initial comparison
      const comp = await api.getComparison(state.mission.id);
      setComparison(comp);
      
    } catch (err: any) {
      console.error("Initialization error:", err);
      setError(err.message || 'Failed to initialize simulation');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Update speed interval
  useEffect(() => {
    speedIntervalRef.current = Math.max(80, Math.floor(1000 / simulationSpeed));
  }, [simulationSpeed]);

  // Simulation step ticker
  const tickStep = useCallback(async () => {
    if (!missionState?.mission.id) return;
    try {
      const updated = await api.stepSimulation(missionState.mission.id);
      setMissionState(updated);
      
      // Check if predictive replanning just triggered
      if (updated.last_replanning_event && updated.last_replanning_event !== missionState.last_replanning_event) {
        setReplanningNotification(updated.last_replanning_event);
      }
      
      // Auto-pause if mission completed
      if (updated.status === 'COMPLETED') {
        setIsPlaying(false);
      }
      
      // Refresh analytics
      const analyticsData = await api.getAnalytics(missionState.mission.id);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Tick error:", err);
    }
  }, [missionState]);

  // Simulation Loop
  useEffect(() => {
    if (isPlaying && missionState?.status === 'RUNNING') {
      timerRef.current = setInterval(tickStep, speedIntervalRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, missionState?.status, simulationSpeed, tickStep]);

  // Controls
  const handlePlanMission = async () => {
    if (!missionState?.mission.id) return;
    try {
      const planned = await api.planMission(missionState.mission.id);
      setMissionState(planned);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStartSimulation = async () => {
    if (!missionState?.mission.id) return;
    try {
      const started = await api.startMission(missionState.mission.id);
      setMissionState(started);
      setIsPlaying(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePauseSimulation = async () => {
    if (!missionState?.mission.id) return;
    try {
      const paused = await api.pauseMission(missionState.mission.id);
      setMissionState(paused);
      setIsPlaying(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetSimulation = async () => {
    if (!missionState?.mission.id) return;
    try {
      setIsPlaying(false);
      const reset = await api.resetMission(missionState.mission.id);
      setMissionState(reset);
      setReplanningNotification(null);
      const comp = await api.getComparison(missionState.mission.id);
      setComparison(comp);
      const analyticsData = await api.getAnalytics(missionState.mission.id);
      setAnalytics(analyticsData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReplanNow = async () => {
    if (!missionState?.mission.id) return;
    try {
      const replanned = await api.replanMission(missionState.mission.id);
      setMissionState(replanned);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRefreshComparison = async () => {
    if (!missionState?.mission.id) return;
    try {
      const comp = await api.getComparison(missionState.mission.id);
      setComparison(comp);
    } catch (err: any) {
      console.error(err);
    }
  };

  // What-If Triggers
  const triggerLowBattery = async (uavId: string, battery: number = 22) => {
    if (!missionState?.mission.id) return;
    try {
      const updated = await api.simulateLowBattery(missionState.mission.id, uavId, battery);
      setMissionState(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const triggerCommLoss = async (uavId: string, comm: number = 15) => {
    if (!missionState?.mission.id) return;
    try {
      const updated = await api.simulateCommunicationLoss(missionState.mission.id, uavId, comm);
      setMissionState(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const triggerFailure = async (uavId: string) => {
    if (!missionState?.mission.id) return;
    try {
      const updated = await api.simulateFailure(missionState.mission.id, uavId);
      setMissionState(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const triggerWeather = async (weather: string) => {
    if (!missionState?.mission.id) return;
    try {
      const updated = await api.simulateWeather(missionState.mission.id, weather);
      setMissionState(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const triggerObstacle = async (obstacle: any) => {
    if (!missionState?.mission.id) return;
    try {
      const updated = await api.simulateObstacle(missionState.mission.id, obstacle);
      setMissionState(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const selectedUAV: UAV | undefined = missionState?.uavs.find(u => u.id === selectedUAVId);

  return {
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
    stepSimulation: tickStep,
    initialize
  };
}
