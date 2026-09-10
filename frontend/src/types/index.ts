export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UAV {
  id: string;
  mission_id?: string;
  x: number;
  y: number;
  base_x: number;
  base_y: number;
  battery: number;
  health: number;
  communication: number;
  speed: number;
  status: 'IDLE' | 'ASSIGNED' | 'EN_ROUTE' | 'EXECUTING' | 'RETURNING' | 'COMPLETED' | 'FAILED' | 'LOW_BATTERY' | string;
  current_task_id?: string | null;
  target_x?: number | null;
  target_y?: number | null;
  route: [number, number][];
  route_index: number;
  total_energy_consumed: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_probability?: number;
  feature_contributions?: Record<string, number>;
}

export interface Task {
  id: string;
  mission_id: string;
  name: string;
  x: number;
  y: number;
  priority: number;
  status: 'PENDING' | 'ASSIGNED' | 'REASSIGNED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  assigned_uav_id?: string | null;
  completed_at?: string | null;
}

export interface MissionEvent {
  id?: number;
  mission_id: string;
  event_type: string;
  title: string;
  description: string;
  details?: any;
  timestamp: string;
}

export interface ReplanningEventDetails {
  type: string;
  title: string;
  task_id: string;
  task_name: string;
  old_uav_id: string;
  old_uav_risk: number;
  new_uav_id: string;
  new_uav_risk: number;
  reason: string;
  old_feature_contributions?: Record<string, number>;
  new_route?: [number, number][];
}

export interface MissionState {
  mission: {
    id: string;
    name: string;
    status: string;
    weather: 'NORMAL' | 'WINDY' | 'STORM';
    map_width: number;
    map_height: number;
    obstacles_json?: string;
  };
  uavs: UAV[];
  tasks: Task[];
  obstacles: Obstacle[];
  weather: 'NORMAL' | 'WINDY' | 'STORM';
  status: string;
  step_count: number;
  replanning_count: number;
  prevented_failures: number;
  uav_failures: number;
  elapsed_seconds: number;
  recent_events: MissionEvent[];
  last_replanning_event?: ReplanningEventDetails | null;
}

export interface MLMetrics {
  model_name: string;
  dataset_samples: number;
  train_samples: number;
  test_samples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  feature_importances: Record<string, number>;
  feature_names: string[];
}

export interface PlannerComparisonResult {
  reactive: {
    planner_mode: string;
    completion_rate: number;
    tasks_completed: number;
    total_tasks: number;
    uav_failures: number;
    prevented_failures: number;
    total_energy_consumed: number;
    mission_duration_seconds: number;
    replanning_events: number;
    failure_prevention_rate: number;
  };
  predictive: {
    planner_mode: string;
    completion_rate: number;
    tasks_completed: number;
    total_tasks: number;
    uav_failures: number;
    prevented_failures: number;
    total_energy_consumed: number;
    mission_duration_seconds: number;
    replanning_events: number;
    failure_prevention_rate: number;
  };
  summary: {
    completion_advantage: number;
    energy_savings_pct: number;
    time_savings_seconds: number;
    failures_prevented: number;
  };
}

export interface AnalyticsData {
  mission_id?: string;
  completion_rate: number;
  completed_tasks: number;
  total_tasks: number;
  active_uavs: number;
  total_uavs: number;
  average_risk: number;
  total_energy_consumed: number;
  replanning_events: number;
  prevented_failures: number;
  uav_failures: number;
  risk_breakdown: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}
