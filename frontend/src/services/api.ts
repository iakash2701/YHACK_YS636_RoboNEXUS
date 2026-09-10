import { MissionState, MLMetrics, PlannerComparisonResult, AnalyticsData, MissionEvent } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Missions
  listMissions: async () => {
    const res = await fetch(`${API_BASE}/missions`);
    return res.json();
  },

  createMission: async (payload: any): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/missions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create mission');
    return res.json();
  },

  getMissionStatus: async (missionId: string): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/missions/${missionId}/status`);
    if (!res.ok) throw new Error('Failed to get mission status');
    return res.json();
  },

  planMission: async (missionId: string): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/missions/${missionId}/plan`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to plan mission');
    return res.json();
  },

  startMission: async (missionId: string): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/missions/${missionId}/start`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to start mission');
    return res.json();
  },

  pauseMission: async (missionId: string): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/missions/${missionId}/pause`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to pause mission');
    return res.json();
  },

  resetMission: async (missionId: string): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/missions/${missionId}/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset mission');
    return res.json();
  },

  replanMission: async (missionId: string): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/missions/${missionId}/replan`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to trigger replan');
    return res.json();
  },

  getComparison: async (missionId: string): Promise<PlannerComparisonResult> => {
    const res = await fetch(`${API_BASE}/missions/${missionId}/compare`);
    if (!res.ok) throw new Error('Failed to get comparison');
    return res.json();
  },

  // Simulation step & triggers
  stepSimulation: async (missionId: string): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/simulation/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission_id: missionId }),
    });
    if (!res.ok) throw new Error('Failed to step simulation');
    return res.json();
  },

  simulateLowBattery: async (missionId: string, uavId: string, battery: number = 22): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/simulation/low-battery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission_id: missionId, uav_id: uavId, battery }),
    });
    return res.json();
  },

  simulateCommunicationLoss: async (missionId: string, uavId: string, communication: number = 15): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/simulation/communication-loss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission_id: missionId, uav_id: uavId, communication }),
    });
    return res.json();
  },

  simulateFailure: async (missionId: string, uavId: string): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/simulation/failure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission_id: missionId, uav_id: uavId }),
    });
    return res.json();
  },

  simulateWeather: async (missionId: string, weather: string): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/simulation/weather`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission_id: missionId, weather }),
    });
    return res.json();
  },

  simulateObstacle: async (missionId: string, obstacle: any): Promise<MissionState> => {
    const res = await fetch(`${API_BASE}/simulation/obstacle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mission_id: missionId, obstacle }),
    });
    return res.json();
  },

  // Analytics & ML
  getEvents: async (missionId?: string): Promise<MissionEvent[]> => {
    const url = missionId ? `${API_BASE}/events?mission_id=${missionId}` : `${API_BASE}/events`;
    const res = await fetch(url);
    return res.json();
  },

  getAnalytics: async (missionId?: string): Promise<AnalyticsData> => {
    const url = missionId ? `${API_BASE}/analytics?mission_id=${missionId}` : `${API_BASE}/analytics`;
    const res = await fetch(url);
    return res.json();
  },

  getMLMetrics: async (): Promise<MLMetrics> => {
    const res = await fetch(`${API_BASE}/ml/metrics`);
    if (!res.ok) throw new Error('Failed to get ML metrics');
    return res.json();
  },

  predictRisk: async (payload: any) => {
    const res = await fetch(`${API_BASE}/ml/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
