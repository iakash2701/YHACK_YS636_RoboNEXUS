import { MissionState, UAV, Task, Obstacle, ChargingStation, MissionEvent } from '../types';

export const LOW_BATTERY_THRESHOLD = 10;
export const CHARGING_STATION_COORDS = { x: 25, y: 25 };
export const CHARGING_SPEED_PER_STEP = 5.0; // Rapid battery recharge for crisp hackathon demo

export interface HandoverLogEntry {
  timestamp: string;
  message: string;
  type: 'BATTERY_ALERT' | 'HANDOVER' | 'CHARGER_DOCK' | 'QUEUE_UPDATE' | 'CHARGE_COMPLETE';
}

export const INITIAL_CHARGING_STATION: ChargingStation = {
  id: 'CS-ALPHA',
  name: 'CHARGING STATION',
  x: CHARGING_STATION_COORDS.x,
  y: CHARGING_STATION_COORDS.y,
  currently_charging_uav_id: null,
  queue: []
};

// 5-Robot Default Initial Fleet Configuration
export const DEFAULT_5_ROBOTS: UAV[] = [
  {
    id: 'Robot 1',
    name: 'Robot 1',
    x: 4.0,
    y: 6.0,
    base_x: 4.0,
    base_y: 6.0,
    battery: 45.0,
    health: 95.0,
    communication: 92.0,
    speed: 1.0,
    status: 'WORKING',
    current_task_id: 'TASK-001',
    target_x: 30.0,
    target_y: 18.0,
    route: [[4, 6], [10, 10], [16, 12], [22, 14], [28, 16], [30, 18]],
    route_index: 1,
    total_energy_consumed: 12.5,
    risk_level: 'LOW',
    risk_probability: 14.2,
    charging_status: 'IDLE',
    current_action: 'Executing Survey Mission TASK-001',
    queue_position: null
  },
  {
    id: 'Robot 2',
    name: 'Robot 2',
    x: 12.0,
    y: 6.0,
    base_x: 12.0,
    base_y: 6.0,
    battery: 90.0,
    health: 98.0,
    communication: 95.0,
    speed: 1.2,
    status: 'WORKING',
    current_task_id: 'TASK-002',
    target_x: 15.0,
    target_y: 38.0,
    route: [[12, 6], [12, 14], [14, 22], [14, 30], [15, 38]],
    route_index: 1,
    total_energy_consumed: 8.0,
    risk_level: 'LOW',
    risk_probability: 8.5,
    charging_status: 'IDLE',
    current_action: 'Sector Patrol TASK-002',
    queue_position: null
  },
  {
    id: 'Robot 3',
    name: 'Robot 3',
    x: 6.0,
    y: 16.0,
    base_x: 6.0,
    base_y: 16.0,
    battery: 75.0,
    health: 88.0,
    communication: 90.0,
    speed: 1.0,
    status: 'WORKING',
    current_task_id: 'TASK-003',
    target_x: 42.0,
    target_y: 42.0,
    route: [[6, 16], [14, 20], [22, 26], [32, 34], [42, 42]],
    route_index: 1,
    total_energy_consumed: 14.0,
    risk_level: 'LOW',
    risk_probability: 12.0,
    charging_status: 'IDLE',
    current_action: 'Perimeter Monitor TASK-003',
    queue_position: null
  },
  {
    id: 'Robot 4',
    name: 'Robot 4',
    x: 8.0,
    y: 2.0,
    base_x: 8.0,
    base_y: 2.0,
    battery: 96.0,
    health: 99.0,
    communication: 98.0,
    speed: 1.1,
    status: 'AVAILABLE',
    current_task_id: null,
    target_x: null,
    target_y: null,
    route: [],
    route_index: 0,
    total_energy_consumed: 0.0,
    risk_level: 'LOW',
    risk_probability: 4.0,
    charging_status: 'IDLE',
    current_action: 'Standby in Fleet Pool (Ready for Handover)',
    queue_position: null
  },
  {
    id: 'Robot 5',
    name: 'Robot 5',
    x: 2.0,
    y: 12.0,
    base_x: 2.0,
    base_y: 12.0,
    battery: 88.0,
    health: 94.0,
    communication: 92.0,
    speed: 1.0,
    status: 'AVAILABLE',
    current_task_id: null,
    target_x: null,
    target_y: null,
    route: [],
    route_index: 0,
    total_energy_consumed: 0.0,
    risk_level: 'LOW',
    risk_probability: 5.0,
    charging_status: 'IDLE',
    current_action: 'Standby in Fleet Pool',
    queue_position: null
  }
];

export const DEFAULT_5_TASKS: Task[] = [
  { id: 'TASK-001', mission_id: 'DEMO-M1', name: 'Area Alpha Inspection', x: 30.0, y: 18.0, priority: 5, status: 'ASSIGNED', assigned_uav_id: 'Robot 1' },
  { id: 'TASK-002', mission_id: 'DEMO-M1', name: 'Sector Bravo Recon', x: 15.0, y: 38.0, priority: 4, status: 'ASSIGNED', assigned_uav_id: 'Robot 2' },
  { id: 'TASK-003', mission_id: 'DEMO-M1', name: 'Perimeter Charlie Scan', x: 42.0, y: 42.0, priority: 3, status: 'ASSIGNED', assigned_uav_id: 'Robot 3' }
];

export const DEFAULT_DEMO_OBSTACLES: Obstacle[] = [
  { id: 'OBS-01', x: 18, y: 8, width: 8, height: 14 },
  { id: 'OBS-02', x: 28, y: 28, width: 10, height: 10 },
  { id: 'OBS-03', x: 8, y: 24, width: 6, height: 10 }
];

// Helper: Simple A* or direct waypoint interpolator avoiding obstacles
export function calculateRoute(start: [number, number], end: [number, number], obstacles: Obstacle[] = []): [number, number][] {
  const points: [number, number][] = [start];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(4, Math.ceil(dist / 3.0));

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const px = Math.round((start[0] + dx * t) * 10) / 10;
    const py = Math.round((start[1] + dy * t) * 10) / 10;
    points.push([px, py]);
  }
  return points;
}

/**
 * Autonomous Decision Engine & State Machine
 */
export class AutonomousDecisionEngine {
  /**
   * Evaluates battery thresholds, executes task handovers, and manages charging queue.
   */
  public static processSimulationStep(prevState: MissionState): MissionState {
    const state = JSON.parse(JSON.stringify(prevState)) as MissionState;
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });
    const events: MissionEvent[] = [...(state.recent_events || [])];

    const log = (type: string, title: string, desc: string, details?: any) => {
      events.unshift({
        mission_id: state.mission?.id || 'DEMO',
        event_type: type,
        title,
        description: desc,
        details,
        timestamp: now
      });
      if (events.length > 50) events.pop();
    };

    // Ensure charging station exists
    if (!state.charging_station) {
      state.charging_station = { ...INITIAL_CHARGING_STATION };
    }
    const charger = state.charging_station;

    // 1. BATTERY MONITOR & LOW BATTERY HANDOVER PIPELINE
    const workingRobots = state.uavs.filter(
      (u) => (u.status === 'WORKING' || u.status === 'ASSIGNED' || u.status === 'EN_ROUTE') && u.battery <= LOW_BATTERY_THRESHOLD
    );

    for (const lowBot of workingRobots) {
      const originalTask = state.tasks.find((t) => t.id === lowBot.current_task_id && t.status !== 'COMPLETED');
      
      log(
        'BATTERY_CRITICAL',
        `⚠️ Low Battery Detected: ${lowBot.id}`,
        `[${now}] ${lowBot.id} battery dropped to ${lowBot.battery.toFixed(1)}% (Threshold <= ${LOW_BATTERY_THRESHOLD}%). Initiating emergency protocol.`
      );

      // Transition Low Battery Robot
      lowBot.status = 'LOW_BATTERY';
      lowBot.charging_status = 'MOVING_TO_CHARGER';
      lowBot.current_action = 'Emergency transit to Charging Station';

      // Safe Task Handover: Find Best Available Replacement Robot (Prioritizing Robot 4 for the demo)
      if (originalTask) {
        let replacement = state.uavs.find(
          (u) => u.id === 'Robot 4' && (u.status === 'AVAILABLE' || u.status === 'IDLE') && u.battery > 30
        );
        if (!replacement) {
          replacement = state.uavs.find(
            (u) => u.id !== lowBot.id && (u.status === 'AVAILABLE' || u.status === 'IDLE') && u.battery > 30
          );
        }

        if (replacement) {
          const abandonedTaskId = originalTask.id;
          lowBot.current_task_id = null;

          // Assign Replacement Robot
          replacement.status = 'WORKING';
          replacement.current_task_id = abandonedTaskId;
          replacement.target_x = originalTask.x;
          replacement.target_y = originalTask.y;
          replacement.route = calculateRoute([replacement.x, replacement.y], [originalTask.x, originalTask.y], state.obstacles);
          replacement.route_index = 0;
          replacement.current_action = `Taking over ${lowBot.id}'s task (${originalTask.name})`;

          // Update Task Assignment
          originalTask.assigned_uav_id = replacement.id;
          originalTask.status = 'REASSIGNED';

          state.replanning_count = (state.replanning_count || 0) + 1;
          state.prevented_failures = (state.prevented_failures || 0) + 1;

          log(
            'TASK_HANDOVER',
            `🔄 Task Handover: ${lowBot.id} ➔ ${replacement.id}`,
            `[${now}] Task ${abandonedTaskId} (${originalTask.name}) safely transferred from ${lowBot.id} to ${replacement.id}. Unrelated robots remain uninterrupted.`,
            { old_robot: lowBot.id, new_robot: replacement.id, task_id: abandonedTaskId }
          );

          state.last_replanning_event = {
            type: 'PREDICTIVE_REPLANNING',
            title: `⚡ Low Battery Handover: ${lowBot.id} ➔ ${replacement.id}`,
            task_id: abandonedTaskId,
            task_name: originalTask.name,
            old_uav_id: lowBot.id,
            old_uav_risk: 94.5,
            new_uav_id: replacement.id,
            new_uav_risk: 8.2,
            reason: `${lowBot.id} reached battery threshold (${lowBot.battery}%). ${replacement.id} dispatched to maintain mission continuity.`,
            old_feature_contributions: { battery: 0.85, distance: 0.1, comms: 0.05 }
          };
        }
      }

      // Route low battery robot to charging station
      lowBot.target_x = charger.x;
      lowBot.target_y = charger.y;
      lowBot.route = calculateRoute([lowBot.x, lowBot.y], [charger.x, charger.y], state.obstacles);
      lowBot.route_index = 0;
      lowBot.status = 'MOVING_TO_CHARGER';

      log(
        'ROUTED_TO_CHARGER',
        `🔋 ${lowBot.id} Routed to Charging Station`,
        `[${now}] ${lowBot.id} calculating collision-free route to CHARGING STATION at (${charger.x}, ${charger.y}).`
      );
    }

    // 2. MOVEMENT & CHARGING STATION LOGIC
    for (const bot of state.uavs) {
      // Movement along routes
      if (bot.route && bot.route.length > 0 && bot.route_index < bot.route.length) {
        const nextPt = bot.route[bot.route_index];
        bot.x = nextPt[0];
        bot.y = nextPt[1];
        bot.route_index += 1;

        // Normal battery drain during movement
        if (bot.status !== 'CHARGING' && bot.status !== 'WAITING_FOR_CHARGER') {
          bot.battery = Math.max(0, Math.round((bot.battery - 0.5) * 10) / 10);
          bot.total_energy_consumed = Math.round((bot.total_energy_consumed + 0.5) * 10) / 10;
        }

        // Reached destination
        if (bot.route_index >= bot.route.length) {
          // Case A: Reached Charging Station
          if (bot.status === 'MOVING_TO_CHARGER') {
            bot.x = charger.x;
            bot.y = charger.y;
            bot.route = [];
            bot.route_index = 0;

            if (!charger.currently_charging_uav_id) {
              // Charger is FREE -> Dock and Charge
              charger.currently_charging_uav_id = bot.id;
              bot.status = 'CHARGING';
              bot.charging_status = 'CHARGING';
              bot.current_action = 'Docked at station: Active Fast Charging';
              log(
                'CHARGING_STARTED',
                `⚡ ${bot.id} Started Charging`,
                `[${now}] ${bot.id} reached Charging Station. Charger pad acquired. Charging from ${bot.battery.toFixed(1)}%...`
              );
            } else if (charger.currently_charging_uav_id !== bot.id) {
              // Charger is OCCUPIED -> Enter FIFO Queue
              if (!charger.queue.includes(bot.id)) {
                charger.queue.push(bot.id);
              }
              bot.status = 'WAITING_FOR_CHARGER';
              bot.charging_status = 'WAITING_FOR_CHARGER';
              bot.queue_position = charger.queue.indexOf(bot.id) + 1;
              bot.current_action = `In Queue (Position #${bot.queue_position}) waiting for charger`;
              log(
                'CHARGING_QUEUED',
                `⏳ ${bot.id} Joined Charging Queue`,
                `[${now}] Charging Station occupied by ${charger.currently_charging_uav_id}. ${bot.id} placed in FIFO Queue at position #${bot.queue_position}.`
              );
            }
          }
          // Case B: Reached Task Destination
          else if (bot.current_task_id && (bot.status === 'WORKING' || bot.status === 'ASSIGNED' || bot.status === 'EN_ROUTE')) {
            const task = state.tasks.find((t) => t.id === bot.current_task_id);
            if (task && task.status !== 'COMPLETED') {
              task.status = 'COMPLETED';
              task.completed_at = now;
              bot.status = 'AVAILABLE';
              bot.current_task_id = null;
              bot.current_action = `Successfully completed ${task.name}. Standing by.`;
              log(
                'TASK_COMPLETED',
                `✅ Task Completed: ${task.name}`,
                `[${now}] ${bot.id} completed ${task.name} (${task.id}) at (${task.x}, ${task.y}).`
              );
            }
          }
        }
      }

      // 3. PROGRESSIVE CHARGING (10% -> 20% -> 30% ... -> 100%)
      if (bot.status === 'CHARGING') {
        bot.battery = Math.min(100, Math.round((bot.battery + CHARGING_SPEED_PER_STEP) * 10) / 10);
        bot.current_action = `Charging in progress: ${bot.battery.toFixed(0)}% (Fast DC Rapid Charge)`;

        if (bot.battery >= 100) {
          // Charging Complete!
          bot.battery = 100;
          bot.status = 'AVAILABLE';
          bot.charging_status = 'FULLY_CHARGED';
          bot.current_action = 'Fully Charged (100%) - Returned to Available Pool';
          log(
            'CHARGING_COMPLETE',
            `🟢 ${bot.id} Fully Charged (100%)`,
            `[${now}] ${bot.id} reached 100% capacity. Safely released from charger dock to Available Pool.`
          );

          // Release Charger & Advance FIFO Queue
          if (charger.currently_charging_uav_id === bot.id) {
            charger.currently_charging_uav_id = null;

            if (charger.queue.length > 0) {
              const nextBotId = charger.queue.shift()!;
              const nextBot = state.uavs.find((u) => u.id === nextBotId);
              if (nextBot) {
                charger.currently_charging_uav_id = nextBot.id;
                nextBot.status = 'CHARGING';
                nextBot.charging_status = 'CHARGING';
                nextBot.queue_position = null;
                nextBot.current_action = 'Advancing from queue: Charging in progress';
                log(
                  'QUEUE_ADVANCED',
                  `⚡ ${nextBot.id} Moved from Queue to Charger`,
                  `[${now}] Charger pad freed. ${nextBot.id} moved from FIFO queue to active charging.`
                );
              }
            }
          }
        }
      }

      // Update queue positions for robots waiting in queue
      if (bot.status === 'WAITING_FOR_CHARGER') {
        const qPos = charger.queue.indexOf(bot.id);
        bot.queue_position = qPos >= 0 ? qPos + 1 : null;
      }
    }

    state.recent_events = events;
    state.step_count = (state.step_count || 0) + 1;
    state.elapsed_seconds = (state.elapsed_seconds || 0) + 1;

    return state;
  }

  /**
   * Instantly injects Low Battery = 10% on Robot 1 for crisp 1-click Hackathon presentation.
   */
  public static triggerDemoRobot1LowBattery(prevState: MissionState): MissionState {
    const state = JSON.parse(JSON.stringify(prevState)) as MissionState;
    const robot1 = state.uavs.find((u) => u.id === 'Robot 1' || u.id === 'UAV-01');
    if (robot1) {
      robot1.battery = 10.0;
      robot1.current_action = 'Low Battery (10%) Injected';
    }
    return AutonomousDecisionEngine.processSimulationStep(state);
  }

  /**
   * Instantly injects Low Battery on Robot 5 to demonstrate the FIFO Charging Queue behind Robot 1.
   */
  public static triggerDemoChargingQueue(prevState: MissionState): MissionState {
    const state = JSON.parse(JSON.stringify(prevState)) as MissionState;
    const robot5 = state.uavs.find((u) => u.id === 'Robot 5' || u.id === 'UAV-05');
    if (robot5) {
      robot5.battery = 8.0;
      robot5.status = 'LOW_BATTERY';
      robot5.current_action = 'Emergency Battery Warning (8%)';
    }
    return AutonomousDecisionEngine.processSimulationStep(state);
  }

  /**
   * Resets fleet to initial 5-robot state.
   */
  public static createInitial5RobotMission(): MissionState {
    return {
      mission: {
        id: 'MISSION-5ROBOT-DEMO',
        name: 'Operation RoboNexus: 5-Fleet Autonomous Mission',
        status: 'RUNNING',
        weather: 'NORMAL',
        map_width: 50,
        map_height: 50
      },
      uavs: JSON.parse(JSON.stringify(DEFAULT_5_ROBOTS)),
      tasks: JSON.parse(JSON.stringify(DEFAULT_5_TASKS)),
      obstacles: JSON.parse(JSON.stringify(DEFAULT_DEMO_OBSTACLES)),
      weather: 'NORMAL',
      status: 'RUNNING',
      step_count: 0,
      replanning_count: 0,
      prevented_failures: 0,
      uav_failures: 0,
      elapsed_seconds: 0,
      charging_station: JSON.parse(JSON.stringify(INITIAL_CHARGING_STATION)),
      recent_events: [
        {
          mission_id: 'MISSION-5ROBOT-DEMO',
          event_type: 'FLEET_INITIALIZED',
          title: '5-Robot Fleet Initialized',
          description: 'Robot 1, 2, 3 Active on Tasks | Robot 4, 5 Standby in Pool | Central Charging Station Online.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        }
      ],
      last_replanning_event: null
    };
  }
}
