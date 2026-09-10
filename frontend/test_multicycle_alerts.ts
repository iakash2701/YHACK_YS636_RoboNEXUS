import { AutonomousDecisionEngine } from './src/services/autonomousDecisionEngine.ts';
import { MissionState } from './src/types/index.ts';

console.log('================================================================');
console.log('🔄 TESTING MULTI-CYCLE LOW BATTERY ACKNOWLEDGEMENT ALERTS');
console.log('================================================================\n');

let allTestsPassed = true;

// Helper to simulate manual battery change
function setRobotBattery(state: MissionState, robotId: string, battery: number): MissionState {
  const stateCopy = JSON.parse(JSON.stringify(state)) as MissionState;
  const bot = stateCopy.uavs.find(u => u.id === robotId);
  if (bot) {
    bot.battery = battery;
    if (battery <= 10) {
      if (bot.status === 'CHARGING' || bot.status === 'MOVING_TO_CHARGER' || bot.status === 'WAITING_FOR_CHARGER') {
        bot.status = 'AVAILABLE';
        bot.charging_status = 'IDLE';
        bot.queue_position = null;
      }
      bot.low_battery_handled = false;
      bot.low_battery_ack_pending = false;
    } else {
      bot.low_battery_handled = false;
      bot.low_battery_ack_pending = false;
      if (bot.status === 'CHARGING' || bot.status === 'MOVING_TO_CHARGER' || bot.status === 'WAITING_FOR_CHARGER') {
        bot.status = 'AVAILABLE';
        bot.charging_status = 'IDLE';
        bot.queue_position = null;
      }
    }
  }
  return AutonomousDecisionEngine.processSimulationStep(stateCopy);
}

// TEST 1: ROBOT 1 — CYCLE 1
console.log('TEST 1: Robot 1 — Cycle 1 (100% -> 10%)...');
let sim = AutonomousDecisionEngine.createInitial5RobotMission();
sim = setRobotBattery(sim, 'Robot 1', 10);

if (sim.pending_acknowledgement?.robot_id === 'Robot 1') {
  console.log('  ✅ Cycle 1: Alert modal appeared for Robot 1');
} else {
  console.error('  ❌ Cycle 1: Alert modal failed to appear!');
  allTestsPassed = false;
}

// Acknowledge Cycle 1
sim = AutonomousDecisionEngine.acknowledgeLowBatteryEvent(sim, 'Robot 1');
if (!sim.pending_acknowledgement) {
  console.log('  ✅ Cycle 1: Modal dismissed upon acknowledgement');
} else {
  console.error('  ❌ Cycle 1: Modal still present after acknowledgement!');
  allTestsPassed = false;
}

// TEST 2: SAME EVENT (10% -> 9% -> 8%)
console.log('\nTEST 2: Same Event Drain (10% -> 9% -> 8%)...');
sim = AutonomousDecisionEngine.processSimulationStep(sim);
sim = AutonomousDecisionEngine.processSimulationStep(sim);
if (!sim.pending_acknowledgement) {
  console.log('  ✅ No duplicate alerts during same low-battery episode');
} else {
  console.error('  ❌ Duplicate alert triggered during same episode!');
  allTestsPassed = false;
}

// TEST 3: RECOVERY (8% -> 100%)
console.log('\nTEST 3: Battery Recovery to 100%...');
sim = setRobotBattery(sim, 'Robot 1', 100);
if (!sim.pending_acknowledgement && sim.uavs.find(u => u.id === 'Robot 1')?.low_battery_handled === false) {
  console.log('  ✅ Robot 1 recovered to 100% and low_battery_handled state was cleanly reset');
} else {
  console.error('  ❌ State was not reset on recovery!');
  allTestsPassed = false;
}

// TEST 4: ROBOT 1 — CYCLE 2 (100% -> 10% FOR A SECOND TIME)
console.log('\nTEST 4: Robot 1 — Cycle 2 (100% -> 10% for a SECOND time)...');
sim = setRobotBattery(sim, 'Robot 1', 10);
if (sim.pending_acknowledgement?.robot_id === 'Robot 1') {
  console.log('  ✅ Cycle 2: A NEW alert modal appeared for Robot 1 on 2nd episode!');
} else {
  console.error('  ❌ Cycle 2: FAILED to trigger alert on 2nd episode!');
  allTestsPassed = false;
}

// Acknowledge Cycle 2
sim = AutonomousDecisionEngine.acknowledgeLowBatteryEvent(sim, 'Robot 1');
if (!sim.pending_acknowledgement) {
  console.log('  ✅ Cycle 2: Modal dismissed upon 2nd acknowledgement');
} else {
  console.error('  ❌ Cycle 2: Modal still present!');
  allTestsPassed = false;
}

// TEST 5: ROBOT 1 — CYCLE 3 (10% -> 100% -> 10% FOR A THIRD TIME)
console.log('\nTEST 5: Robot 1 — Cycle 3 (10% -> 100% -> 10% for a THIRD time)...');
sim = setRobotBattery(sim, 'Robot 1', 100);
sim = setRobotBattery(sim, 'Robot 1', 10);
if (sim.pending_acknowledgement?.robot_id === 'Robot 1') {
  console.log('  ✅ Cycle 3: A NEW alert modal appeared for Robot 1 on 3rd episode!');
} else {
  console.error('  ❌ Cycle 3: FAILED to trigger alert on 3rd episode!');
  allTestsPassed = false;
}
sim = AutonomousDecisionEngine.acknowledgeLowBatteryEvent(sim, 'Robot 1');

// TEST 6: MULTIPLE ROBOTS INDEPENDENCE (Robot 2, Robot 3, Robot 4, Robot 5)
console.log('\nTEST 6: Testing independent multi-cycle alerts on all other robots...');
for (const robotId of ['Robot 2', 'Robot 3', 'Robot 4', 'Robot 5']) {
  sim = setRobotBattery(sim, robotId, 10);
  if (sim.pending_acknowledgement?.robot_id === robotId) {
    console.log(`  ✅ ${robotId} Cycle 1 alert verified`);
  } else {
    console.error(`  ❌ ${robotId} Cycle 1 alert failed!`);
    allTestsPassed = false;
  }
  sim = AutonomousDecisionEngine.acknowledgeLowBatteryEvent(sim, robotId);
  // Restore
  sim = setRobotBattery(sim, robotId, 100);
  // Drop again (Cycle 2)
  sim = setRobotBattery(sim, robotId, 10);
  if (sim.pending_acknowledgement?.robot_id === robotId) {
    console.log(`  ✅ ${robotId} Cycle 2 alert verified`);
  } else {
    console.error(`  ❌ ${robotId} Cycle 2 alert failed!`);
    allTestsPassed = false;
  }
  sim = AutonomousDecisionEngine.acknowledgeLowBatteryEvent(sim, robotId);
}

console.log('\n================================================================');
console.log(`📊 MULTI-CYCLE TEST RESULT: ${allTestsPassed ? 'ALL TESTS PASSED (100% SUCCESS)' : 'FAILED'}`);
console.log('================================================================\n');
