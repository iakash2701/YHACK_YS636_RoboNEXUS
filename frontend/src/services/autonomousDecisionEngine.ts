import { MissionState, UAV, Task, Obstacle, ChargingStation, MissionEvent, LowBatteryAlert } from '../types/index.ts';
import { calculateSafeRoute, calculateSafeReturnPath, isPointInAnyObstacle, isSegmentBlockedByObstacle, isDirectPathClear, ROBOT_SAFETY_MARGIN } from './pathPlanner.ts';

export const LOW_BATTERY_THRESHOLD = 10;
export const CHARGING_STATION_COORDS = { x: 25, y: 25 };
export const CHARGING_SPEED_PER_STEP = 5.0; // Rapid battery recharge for crisp hackathon demo

export const INITIAL_CHARGING_STATION: ChargingStation = {
  id: 'CS-ALPHA',
  name: 'CHARGING STATION',
  x: CHARGING_STATION_COORDS.x,
  y: CHARGING_STATION_COORDS.y,
  currently_charging_uav_id: null,
  queue: []
};



export const DEFAULT_DEMO_OBSTACLES: Obstacle[] = [
  { id: 'OBS-01', x: 18, y: 8, width: 8, height: 14 },
  { id: 'OBS-02', x: 28, y: 28, width: 10, height: 10 },
  { id: 'OBS-03', x: 8, y: 24, width: 6, height: 10 }
];

export function calculateRoute(
  start: [number, number],
  end: [number, number],
  obstacles: Obstacle[] = []
): [number, number][] {
  return calculateSafeRoute(start, end, obstacles);
}

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
    route: calculateSafeRoute([4.0, 6.0], [30.0, 18.0], DEFAULT_DEMO_OBSTACLES),
    route_index: 1,
    total_energy_consumed: 12.5,
    risk_level: 'LOW',
    risk_probability: 14.2,
    charging_status: 'IDLE',
    current_action: 'Executing Survey Mission TASK-001',
    queue_position: null,
    low_battery_handled: false,
    low_battery_ack_pending: false
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
    route: calculateSafeRoute([12.0, 6.0], [15.0, 38.0], DEFAULT_DEMO_OBSTACLES),
    route_index: 1,
    total_energy_consumed: 8.0,
    risk_level: 'LOW',
    risk_probability: 8.5,
    charging_status: 'IDLE',
    current_action: 'Sector Patrol TASK-002',
    queue_position: null,
    low_battery_handled: false,
    low_battery_ack_pending: false
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
    route: calculateSafeRoute([6.0, 16.0], [42.0, 42.0], DEFAULT_DEMO_OBSTACLES),
    route_index: 1,
    total_energy_consumed: 14.0,
    risk_level: 'LOW',
    risk_probability: 12.0,
    charging_status: 'IDLE',
    current_action: 'Perimeter Monitor TASK-003',
    queue_position: null,
    low_battery_handled: false,
    low_battery_ack_pending: false
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
    queue_position: null,
    low_battery_handled: false,
    low_battery_ack_pending: false
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
    queue_position: null,
    low_battery_handled: false,
    low_battery_ack_pending: false
  }
];

export const DEFAULT_5_TASKS: Task[] = [
  { id: 'TASK-001', mission_id: 'DEMO-M1', name: 'Area Alpha Inspection', x: 30.0, y: 18.0, priority: 5, status: 'ASSIGNED', assigned_uav_id: 'Robot 1' },
  { id: 'TASK-002', mission_id: 'DEMO-M1', name: 'Sector Bravo Recon', x: 15.0, y: 38.0, priority: 4, status: 'ASSIGNED', assigned_uav_id: 'Robot 2' },
  { id: 'TASK-003', mission_id: 'DEMO-M1', name: 'Perimeter Charlie Scan', x: 42.0, y: 42.0, priority: 3, status: 'ASSIGNED', assigned_uav_id: 'Robot 3' }
];

export class AutonomousDecisionEngine {
  /**
   * Evaluates available fleet and selects the best candidate for task handover.
   * Ranks candidates based on battery level, proximity to task, and lowest risk score.
   */
  public static findBestReplacementRobot(
    state: MissionState,
    excludeRobotId?: string,
    targetTask?: Task | null
  ): UAV | null {
    const candidates = state.uavs.filter(
      (u) =>
        u.id !== excludeRobotId &&
        (u.status === 'AVAILABLE' || u.status === 'IDLE') &&
        u.battery > 30
    );

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((a, b) => {
      let scoreA = a.battery * 1.5 - (a.risk_probability || 0) * 0.5;
      let scoreB = b.battery * 1.5 - (b.risk_probability || 0) * 0.5;

      if (targetTask) {
        const distA = Math.hypot(a.x - targetTask.x, a.y - targetTask.y);
        const distB = Math.hypot(b.x - targetTask.x, b.y - targetTask.y);
        scoreA -= distA * 1.0;
        scoreB -= distB * 1.0;
      }

      return scoreB - scoreA;
    });

    return candidates[0];
  }

  /**
   * Reassigns unassigned/interrupted tasks to available standby robots dynamically.
   */
  public static reassignTasksToAvailableRobots(state: MissionState): void {
    const unassignedTasks = state.tasks.filter(
      (t) => t.status !== 'COMPLETED' && (!t.assigned_uav_id || !state.uavs.some((u) => u.current_task_id === t.id && u.status === 'WORKING'))
    );

    for (const task of unassignedTasks) {
      const bestBot = AutonomousDecisionEngine.findBestReplacementRobot(state, undefined, task);
      if (bestBot) {
        bestBot.status = 'WORKING';
        bestBot.current_task_id = task.id;
        bestBot.target_x = task.x;
        bestBot.target_y = task.y;
        bestBot.route = calculateSafeRoute([bestBot.x, bestBot.y], [task.x, task.y], state.obstacles);
        bestBot.route_index = 0;
        bestBot.current_action = `Assigned task: ${task.name}`;

        task.assigned_uav_id = bestBot.id;
        task.status = 'ASSIGNED';
      }
    }
  }

  /**
   * Evaluates simulation state, movement, and progressive charging.
   * STRICT GUARD: Low battery events trigger ONE acknowledgement modal and will NEVER loop.
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

    if (!state.charging_station) {
      state.charging_station = { ...INITIAL_CHARGING_STATION };
    }
    const charger = state.charging_station;

    // 0. PREDICTIVE FAILURE RISK ENGINE EVALUATION (PREDICT BEFORE 10% FAILURE)
    for (const bot of state.uavs) {
      if ((bot.status === 'WORKING' || bot.status === 'ASSIGNED' || bot.status === 'EN_ROUTE') && bot.current_task_id) {
        const task = state.tasks.find((t) => t.id === bot.current_task_id && t.status !== 'COMPLETED');
        if (task) {
          const dx = task.x - bot.x;
          const dy = task.y - bot.y;
          const distToTask = Math.hypot(dx, dy);
          const distToBase = Math.hypot(task.x - bot.base_x, task.y - bot.base_y);

          // Deterministic explainable risk score calculation (0 - 100%)
          const batteryFactor = bot.battery < 40 ? ((40 - bot.battery) / 40) * 60 : ((100 - bot.battery) / 100) * 15;
          const distanceFactor = Math.min(25, (distToTask + distToBase) * 0.4);
          const workloadFactor = (task.priority || 3) * 3;

          const rawRisk = Math.min(98, Math.round(batteryFactor + distanceFactor + workloadFactor));
          bot.risk_probability = rawRisk;

          if (rawRisk >= 60) {
            bot.risk_level = 'HIGH';
          } else if (rawRisk >= 35) {
            bot.risk_level = 'MEDIUM';
          } else {
            bot.risk_level = 'LOW';
          }

          // Calculate estimated minutes remaining before critical battery failure (<=10%)
          const reserveBattery = Math.max(0, bot.battery - 10.0);
          const estimatedDrainPerMin = 6.4; // ~6.4% per min on active flight
          bot.predicted_failure_minutes = Math.max(0.1, Math.round((reserveBattery / estimatedDrainPerMin) * 10) / 10);

          // PREDICTIVE RISK TRIGGER (BEFORE 10% EMERGENCY BATTERY)
          const isPredictiveHighRisk = (rawRisk >= 60 || bot.battery <= 32) && bot.battery > 10;

          if (isPredictiveHighRisk && !bot.predictive_risk_handled && !bot.predictive_risk_ack_pending) {
            bot.predictive_risk_ack_pending = true;
            bot.status = 'HIGH_RISK';
            bot.current_action = `⚠️ Predicted Mission Failure Risk (${rawRisk}% HIGH) - Preventive Action Recommended`;

            const replacementCandidate = AutonomousDecisionEngine.findBestReplacementRobot(state, bot.id, task);

            state.pending_predictive_alert = {
              robot_id: bot.id,
              robot_name: bot.name || bot.id,
              battery: bot.battery,
              risk_probability: rawRisk,
              risk_level: bot.risk_level,
              task_id: task.id,
              task_name: task.name,
              replacement_id: replacementCandidate?.id || 'Robot 4',
              predicted_failure_minutes: bot.predicted_failure_minutes,
              timestamp: `${now}.${Date.now().toString().slice(-4)}`,
              reason: `Predictive AI Model forecasts failure risk on ${bot.id} (${bot.battery.toFixed(1)}% battery, ${rawRisk}% risk). Preventive reassignment recommended before failure occurs.`
            };

            log(
              'PREDICTIVE_FAILURE_RISK_DETECTED',
              `⚠️ PREDICTED MISSION FAILURE: ${bot.id}`,
              `[${now}] ${bot.id} is predicted to be unable to safely complete ${task.name}. Risk: ${rawRisk}% HIGH (Est. Failure: ~${bot.predicted_failure_minutes} min).`,
              { robot_id: bot.id, battery: bot.battery, risk_score: rawRisk, task_id: task.id }
            );
          }
        }
      }
    }

    // 1. PER-ROBOT 10% EMERGENCY BATTERY MONITOR (FALLBACK SAFETY NET)
    for (const bot of state.uavs) {
      const isLow = bot.battery <= LOW_BATTERY_THRESHOLD;
      const isNotInChargingFlow =
        bot.status !== 'CHARGING' &&
        bot.status !== 'MOVING_TO_CHARGER' &&
        bot.status !== 'WAITING_FOR_CHARGER' &&
        bot.status !== 'RETURNING';

      // RECOVERY RESET: If robot battery has recovered above threshold (> 10%), reset low-battery & predictive locks for next cycle!
      if (!isLow && isNotInChargingFlow) {
        bot.low_battery_handled = false;
        bot.low_battery_ack_pending = false;
        bot.predictive_risk_handled = false;
        bot.predictive_risk_ack_pending = false;
      }

      // Detect transition to emergency low battery requiring ONE-TIME acknowledgement per cycle
      if (isLow && !bot.low_battery_handled && !bot.low_battery_ack_pending && isNotInChargingFlow) {
        bot.low_battery_ack_pending = true;
        bot.status = 'AWAITING_ACK';
        bot.current_action = 'Low Battery Emergency (<= 10%) - Awaiting Acknowledgment';

        const task = state.tasks.find((t) => t.id === bot.current_task_id && t.status !== 'COMPLETED');

        // Identify suggested replacement candidate dynamically using priority ranking
        const replacementCandidate = AutonomousDecisionEngine.findBestReplacementRobot(state, bot.id, task);

        state.pending_acknowledgement = {
          robot_id: bot.id,
          robot_name: bot.name || bot.id,
          battery: bot.battery,
          task_id: task?.id || null,
          task_name: task?.name || null,
          replacement_id: replacementCandidate?.id || 'Standby Robot',
          timestamp: `${now}.${Date.now().toString().slice(-4)}`,
          reason: `${bot.id} reached battery threshold (${bot.battery.toFixed(1)}%). Requires charging station dispatch.`
        };

        console.log(`[LOW_BATTERY_CYCLE_FIRED] Robot=${bot.id} Battery=${bot.battery}% Time=${now}`);

        log(
          'BATTERY_ALERT_TRIGGERED',
          `⚠️ Emergency Low Battery Alert: ${bot.id}`,
          `[${now}] ${bot.id} battery reached ${bot.battery.toFixed(1)}%. One-time emergency acknowledgement modal generated.`,
          { robot_id: bot.id, battery: bot.battery }
        );
      }
    }

    // 2. MOVEMENT & CHARGING STATION LOGIC WITH CONTINUOUS NO-FLY ZONE SAFETY GUARD
    for (const bot of state.uavs) {
      // Movement along routes
      if (bot.route && bot.route.length > 0 && bot.route_index < bot.route.length) {
        const nextPt = bot.route[bot.route_index];

        // Continuous Movement Safety Guard: Prevent robot from entering any NO-FLY zone
        const isNextBlocked =
          isPointInAnyObstacle(nextPt[0], nextPt[1], state.obstacles, ROBOT_SAFETY_MARGIN * 0.4) ||
          !isDirectPathClear([bot.x, bot.y], nextPt, state.obstacles, ROBOT_SAFETY_MARGIN * 0.4);

        if (isNextBlocked) {
          // Blocked by dynamic obstacle/NFZ! Hold position and replan safely
          if (bot.status === 'MOVING_TO_CHARGER' && state.charging_station) {
            bot.route = calculateSafeReturnPath([bot.x, bot.y], [charger.x, charger.y], state.obstacles);
            bot.route_index = 0;
            bot.current_action = '⚠️ Rerouted return path around dynamic NO-FLY zone';
          } else if (typeof bot.target_x === 'number' && typeof bot.target_y === 'number') {
            bot.route = calculateSafeRoute([bot.x, bot.y], [bot.target_x, bot.target_y], state.obstacles);
            bot.route_index = 0;
            bot.current_action = '⚠️ Rerouted mission route around dynamic NO-FLY zone';
          }
          continue; // Hold current position on this step
        }

        bot.x = nextPt[0];
        bot.y = nextPt[1];
        bot.route_index += 1;

        // Normal battery drain during movement
        if (bot.status !== 'CHARGING' && bot.status !== 'WAITING_FOR_CHARGER') {
          bot.battery = Math.max(0, Math.round((bot.battery - 0.4) * 10) / 10);
          bot.total_energy_consumed = Math.round((bot.total_energy_consumed + 0.4) * 10) / 10;
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
                `[${now}] ${bot.id} docked at Charging Station. Fast recharge in progress from ${bot.battery.toFixed(1)}%...`
              );
            } else if (charger.currently_charging_uav_id !== bot.id) {
              // Charger is OCCUPIED -> Enter FIFO Queue
              if (!charger.queue.includes(bot.id)) {
                charger.queue.push(bot.id);
              }
              bot.status = 'WAITING_FOR_CHARGER';
              bot.charging_status = 'WAITING_FOR_CHARGER';
              bot.queue_position = charger.queue.indexOf(bot.id) + 1;
              bot.current_action = `In FIFO Queue (Position #${bot.queue_position}) waiting for dock`;
              log(
                'CHARGING_QUEUED',
                `⏳ ${bot.id} Entered Charging Queue`,
                `[${now}] Charging Station occupied by ${charger.currently_charging_uav_id}. ${bot.id} joined FIFO Queue at position #${bot.queue_position}.`
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
              bot.charging_status = 'IDLE';
              bot.current_task_id = null;
              bot.current_action = `Completed ${task.name}. Standing by in pool.`;
              log(
                'TASK_COMPLETED',
                `✅ Task Completed: ${task.name}`,
                `[${now}] ${bot.id} completed ${task.name} (${task.id}) at (${task.x}, ${task.y}).`
              );
            }
          }
        }
      }

      // 3. PROGRESSIVE CHARGING (10% -> 20% -> 30% ... -> 100%) - REUSABLE ACROSS ALL CYCLES
      if (bot.status === 'CHARGING') {
        bot.battery = Math.min(100, Math.round((bot.battery + CHARGING_SPEED_PER_STEP) * 10) / 10);
        bot.current_action = `Charging: ${bot.battery.toFixed(0)}% (Fast DC Rapid Charge)`;

        if (bot.battery >= 100) {
          // Charging Complete!
          bot.battery = 100;
          bot.status = 'AVAILABLE';
          bot.charging_status = 'FULLY_CHARGED';
          // Cleanly reset all charging and risk locks so subsequent cycles 2, 3, etc. work repeatedly
          bot.low_battery_handled = false;
          bot.low_battery_ack_pending = false;
          bot.predictive_risk_handled = false;
          bot.predictive_risk_ack_pending = false;
          bot.queue_position = null;
          bot.current_action = 'Fully Charged (100%) - Returned to Available Pool';
          log(
            'CHARGING_COMPLETE',
            `🟢 ${bot.id} Fully Charged (100%)`,
            `[${now}] ${bot.id} reached 100% capacity. Released from dock to Available Pool.`
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
                nextBot.current_action = 'Advanced from queue: Charging in progress';
                log(
                  'QUEUE_ADVANCED',
                  `⚡ ${nextBot.id} Moved from Queue to Charger`,
                  `[${now}] Charger pad freed. ${nextBot.id} moved from FIFO queue to active charging.`
                );
              }
            }
          }

          // Automatically reassign pending active tasks to this freshly charged available robot
          AutonomousDecisionEngine.reassignTasksToAvailableRobots(state);
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
   * Executes the one-time user acknowledgement:
   * 1. Closes the alert permanently for this event.
   * 2. Marks the specific robot as acknowledged & handled.
   * 3. Selects replacement robot and transfers active task without data loss.
   * 4. Dispatches low battery robot toward charging station via clean safe return path.
   */
  public static acknowledgeLowBatteryEvent(prevState: MissionState, robotId: string): MissionState {
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

    const lowBot = state.uavs.find((u) => u.id === robotId);
    if (!lowBot) return state;

    // Guard against rapid duplicate clicks
    if (lowBot.low_battery_handled && !lowBot.low_battery_ack_pending) {
      state.pending_acknowledgement = null;
      return state;
    }

    console.log(`[LOW_BATTERY_HANDOVER_STARTED] Robot=${lowBot.id} Time=${now}`);

    // 1. Mark event handled on this specific robot
    lowBot.low_battery_ack_pending = false;
    lowBot.low_battery_handled = true;
    lowBot.status = 'MOVING_TO_CHARGER';
    lowBot.charging_status = 'MOVING_TO_CHARGER';
    lowBot.current_action = 'Emergency transit to Charging Station';

    // Clear active pending modal
    state.pending_acknowledgement = null;

    if (!state.charging_station) {
      state.charging_station = { ...INITIAL_CHARGING_STATION };
    }
    const charger = state.charging_station;

    // 2. SAFE TASK HANDOVER VIA DYNAMIC PRIORITY QUEUE
    const originalTask = state.tasks.find((t) => t.id === lowBot.current_task_id && t.status !== 'COMPLETED');
    if (originalTask) {
      const replacement = AutonomousDecisionEngine.findBestReplacementRobot(state, lowBot.id, originalTask);

      if (replacement) {
        const abandonedTaskId = originalTask.id;
        lowBot.current_task_id = null;

        // Assign Replacement Robot
        replacement.status = 'WORKING';
        replacement.charging_status = 'IDLE';
        replacement.current_task_id = abandonedTaskId;
        replacement.target_x = originalTask.x;
        replacement.target_y = originalTask.y;
        replacement.route = calculateSafeRoute([replacement.x, replacement.y], [originalTask.x, originalTask.y], state.obstacles);
        replacement.route_index = 0;
        replacement.current_action = `Taking over ${lowBot.id}'s task (${originalTask.name})`;

        // Update Task Assignment
        originalTask.assigned_uav_id = replacement.id;
        originalTask.status = 'REASSIGNED';

        state.replanning_count = (state.replanning_count || 0) + 1;
        state.prevented_failures = (state.prevented_failures || 0) + 1;
        state.last_replanning_event = {
          type: 'BATTERY_REROUTE',
          title: `Task Handover: ${lowBot.id} ➔ ${replacement.id}`,
          task_id: abandonedTaskId,
          task_name: originalTask.name,
          old_uav_id: lowBot.id,
          old_uav_risk: lowBot.risk_probability || 0,
          new_uav_id: replacement.id,
          new_uav_risk: replacement.risk_probability || 0,
          reason: 'Autonomous Low Battery Handover',
          new_route: replacement.route
        };

        console.log(`[LOW_BATTERY_HANDOVER_COMPLETED] Retired=${lowBot.id} Assigned=${replacement.id} Task=${abandonedTaskId} Time=${now}`);

        log(
          'TASK_HANDOVER_ACKNOWLEDGED',
          `🔄 Task Handover: ${lowBot.id} ➔ ${replacement.id}`,
          `[${now}] User acknowledged low battery on ${lowBot.id}. Task ${abandonedTaskId} (${originalTask.name}) transferred to ${replacement.id}. Other robots continue normally.`,
          { old_robot: lowBot.id, new_robot: replacement.id, task_id: abandonedTaskId }
        );
      }
    }

    // 3. ROUTE LOW BATTERY ROBOT TO CHARGING STATION VIA CLEAN SAFE PATH (NEVER CROSSES NO-FLY ZONE)
    lowBot.target_x = charger.x;
    lowBot.target_y = charger.y;
    lowBot.route = calculateSafeReturnPath([lowBot.x, lowBot.y], [charger.x, charger.y], state.obstacles);
    lowBot.route_index = 0;

    console.log(`[LOW_BATTERY_REROUTE_COMPLETED] Robot=${lowBot.id} RouteWaypoints=${lowBot.route.length} Time=${now}`);

    log(
      'ROUTED_TO_CHARGER',
      `🔋 ${lowBot.id} Routed to Charging Station`,
      `[${now}] ${lowBot.id} in transit to Charging Station at (${charger.x}, ${charger.y}).`
    );

    state.recent_events = events;
    return state;
  }

  /**
   * Executes PREDICT -> PREVENT -> REASSIGN -> REPLAN workflow:
   * 1. Acknowledges predictive risk event before failure occurs.
   * 2. Reassigns task from high-risk robot to best available replacement.
   * 3. Recalculates collision-free A* route for replacement robot.
   * 4. Safe transit for original robot to charging station avoiding NO-FLY zones.
   */
  public static acknowledgePredictiveRiskEvent(prevState: MissionState, robotId: string): MissionState {
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

    const lowBot = state.uavs.find((u) => u.id === robotId);
    if (!lowBot) return state;

    lowBot.predictive_risk_ack_pending = false;
    lowBot.predictive_risk_handled = true;
    lowBot.status = 'MOVING_TO_CHARGER';
    lowBot.charging_status = 'MOVING_TO_CHARGER';
    lowBot.current_action = 'Preventive Transit to Charging Station (Zero Failure)';

    state.pending_predictive_alert = null;

    if (!state.charging_station) {
      state.charging_station = { ...INITIAL_CHARGING_STATION };
    }
    const charger = state.charging_station;

    // SAFE TASK REASSIGNMENT VIA DYNAMIC PRIORITY QUEUE
    const originalTask = state.tasks.find((t) => t.id === lowBot.current_task_id && t.status !== 'COMPLETED');
    if (originalTask) {
      const replacement = AutonomousDecisionEngine.findBestReplacementRobot(state, lowBot.id, originalTask);

      if (replacement) {
        const abandonedTaskId = originalTask.id;
        lowBot.current_task_id = null;

        replacement.status = 'WORKING';
        replacement.charging_status = 'IDLE';
        replacement.current_task_id = abandonedTaskId;
        replacement.target_x = originalTask.x;
        replacement.target_y = originalTask.y;
        replacement.route = calculateSafeRoute([replacement.x, replacement.y], [originalTask.x, originalTask.y], state.obstacles);
        replacement.route_index = 0;
        replacement.current_action = `Preventive Takeover: Continuing ${originalTask.name}`;

        originalTask.assigned_uav_id = replacement.id;
        originalTask.status = 'REASSIGNED';

        state.replanning_count = (state.replanning_count || 0) + 1;
        state.prevented_failures = (state.prevented_failures || 0) + 1;

        // 5 Sequential Hackathon Event Stream Logs
        log(
          'PREVENTIVE_ACTION_INITIATED',
          '🛡️ Preventive Action Initiated',
          `[${now}] Operator approved preventive intervention for ${lowBot.id}. Halting failure before occurrence.`
        );

        log(
          'REPLACEMENT_ROBOT_SELECTED',
          `🤖 Replacement Robot Selected: ${replacement.id}`,
          `[${now}] ${replacement.id} selected as optimal replacement (Battery: ${replacement.battery}%, Ready in Pool).`
        );

        log(
          'PREDICTIVE_TASK_REASSIGNED',
          `🔄 Task Reassigned: ${lowBot.id} ➔ ${replacement.id}`,
          `[${now}] ${originalTask.name} reassigned from ${lowBot.id} to ${replacement.id}.`
        );

        log(
          'PREDICTIVE_MISSION_REPLANNED',
          '🗺️ Mission Replanned (A* Route Calculated)',
          `[${now}] Collision-free A* route calculated for ${replacement.id} around NO-FLY zones.`
        );
      }
    }

    // ROUTE ORIGINAL ROBOT SAFELY BACK TO CHARGING STATION VIA CLEAN SAFE RETURN PATH
    lowBot.target_x = charger.x;
    lowBot.target_y = charger.y;
    lowBot.route = calculateSafeReturnPath([lowBot.x, lowBot.y], [charger.x, charger.y], state.obstacles);
    lowBot.route_index = 0;

    log(
      'PREVENTIVE_ROUTED_TO_CHARGER',
      `🔋 ${lowBot.id} Returning to Charging Station`,
      `[${now}] ${lowBot.id} in safe transit to Charging Station at (${charger.x}, ${charger.y}). Mission continues with 0 downtime.`
    );

    state.recent_events = events;
    return state;
  }

  /**
   * Instantly sets Robot 1 battery = 28% while on TASK-001 to trigger PREDICT -> PREVENT -> REASSIGN -> REPLAN demo.
   */
  public static triggerDemoPredictiveRiskSurge(prevState: MissionState): MissionState {
    const state = JSON.parse(JSON.stringify(prevState)) as MissionState;
    const robot1 = state.uavs.find((u) => u.id === 'Robot 1' || u.id === 'UAV-01');
    if (robot1) {
      robot1.battery = 28.0;
      robot1.predictive_risk_handled = false; // Reset lock for new demo run
      robot1.predictive_risk_ack_pending = false;
      robot1.low_battery_handled = true; // Prevent emergency modal conflict
      if (!robot1.current_task_id) {
        robot1.current_task_id = 'TASK-001';
        robot1.status = 'WORKING';
      }
    }
    return AutonomousDecisionEngine.processSimulationStep(state);
  }

  /**
   * Instantly sets Robot 1 battery = 10% for crisp 1-click Hackathon presentation.
   */
  public static triggerDemoRobot1LowBattery(prevState: MissionState): MissionState {
    const state = JSON.parse(JSON.stringify(prevState)) as MissionState;
    const robot1 = state.uavs.find((u) => u.id === 'Robot 1' || u.id === 'UAV-01');
    if (robot1) {
      if (robot1.status === 'CHARGING' || robot1.status === 'MOVING_TO_CHARGER' || robot1.status === 'WAITING_FOR_CHARGER') {
        robot1.status = 'WORKING';
        robot1.charging_status = 'IDLE';
        robot1.queue_position = null;
        if (state.charging_station?.currently_charging_uav_id === robot1.id) {
          state.charging_station.currently_charging_uav_id = null;
        }
      }
      robot1.battery = 10.0;
      robot1.low_battery_handled = false; // Trigger new event
      robot1.low_battery_ack_pending = false;
    }
    return AutonomousDecisionEngine.processSimulationStep(state);
  }

  /**
   * Instantly sets Robot 5 battery low to demonstrate the FIFO Charging Queue behind Robot 1.
   */
  public static triggerDemoChargingQueue(prevState: MissionState): MissionState {
    const state = JSON.parse(JSON.stringify(prevState)) as MissionState;
    const robot5 = state.uavs.find((u) => u.id === 'Robot 5' || u.id === 'UAV-05');
    if (robot5) {
      if (robot5.status === 'CHARGING' || robot5.status === 'MOVING_TO_CHARGER' || robot5.status === 'WAITING_FOR_CHARGER') {
        robot5.status = 'AVAILABLE';
        robot5.charging_status = 'IDLE';
        robot5.queue_position = null;
        if (state.charging_station?.currently_charging_uav_id === robot5.id) {
          state.charging_station.currently_charging_uav_id = null;
        }
      }
      robot5.battery = 8.0;
      robot5.low_battery_handled = false;
      robot5.low_battery_ack_pending = false;
    }
    return AutonomousDecisionEngine.processSimulationStep(state);
  }

  /**
   * Resets fleet to initial 5-robot state.
   */
  public static createInitial5RobotMission(): MissionState {
    const obstacles: Obstacle[] = JSON.parse(JSON.stringify(DEFAULT_DEMO_OBSTACLES));
    const uavs: UAV[] = JSON.parse(JSON.stringify(DEFAULT_5_ROBOTS));
    const tasks: Task[] = JSON.parse(JSON.stringify(DEFAULT_5_TASKS));

    // Calculate guaranteed collision-free routes avoiding all red NO-FLY zones
    for (const bot of uavs) {
      if (bot.current_task_id && typeof bot.target_x === 'number' && typeof bot.target_y === 'number') {
        bot.route = calculateSafeRoute([bot.x, bot.y], [bot.target_x, bot.target_y], obstacles);
        bot.route_index = 0;
      }
    }

    return {
      mission: {
        id: 'MISSION-5ROBOT-DEMO',
        name: 'Operation RoboNexus: 5-Fleet Autonomous Mission',
        status: 'RUNNING',
        weather: 'NORMAL',
        map_width: 50,
        map_height: 50
      },
      uavs,
      tasks,
      obstacles,
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
      last_replanning_event: null,
      pending_acknowledgement: null
    };
  }
}
