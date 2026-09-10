import { AutonomousDecisionEngine, DEFAULT_DEMO_OBSTACLES } from './src/services/autonomousDecisionEngine.ts';
import { calculateSafeReturnPath, isPointInAnyObstacle } from './src/services/pathPlanner.ts';

console.log('================================================================');
console.log('⚡ TESTING LOW-BATTERY RETURN-TO-CHARGING PATHS (ROBOTS 1 - 5)');
console.log('================================================================\n');

const chargingPort: [number, number] = [25, 25];
const obstacles = DEFAULT_DEMO_OBSTACLES;

function testReturn(robotName: string, startPos: [number, number]) {
  console.log(`[${robotName}] Testing Return from (${startPos[0]}, ${startPos[1]}) -> Charging Port (${chargingPort[0]}, ${chargingPort[1]})...`);
  const route = calculateSafeReturnPath(startPos, chargingPort, obstacles);
  
  if (!route || route.length === 0) {
    console.error(`  ❌ FAILED: No route generated for ${robotName}!`);
    return false;
  }

  // Check end point reaches charging port
  const finalPt = route[route.length - 1];
  const distToPort = Math.hypot(finalPt[0] - chargingPort[0], finalPt[1] - chargingPort[1]);
  if (distToPort > 0.5) {
    console.error(`  ❌ FAILED: Route ends at (${finalPt[0]}, ${finalPt[1]}) instead of charging port (${chargingPort[0]}, ${chargingPort[1]})!`);
    return false;
  }

  // Check collision with any red NO-FLY building
  let collisionCount = 0;
  for (let i = 0; i < route.length; i++) {
    const pt = route[i];
    if (isPointInAnyObstacle(pt[0], pt[1], obstacles, 0.0)) {
      console.error(`  ❌ COLLISION: Waypoint #${i} (${pt[0]}, ${pt[1]}) is inside a red NO-FLY building!`);
      collisionCount++;
    }
  }

  if (collisionCount > 0) return false;

  // Calculate total path length
  let totalLength = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalLength += Math.hypot(route[i + 1][0] - route[i][0], route[i + 1][1] - route[i][1]);
  }

  const directDist = Math.hypot(chargingPort[0] - startPos[0], chargingPort[1] - startPos[1]);
  console.log(`  ✅ PASSED: Route generated with ${route.length} steps. Total length: ${totalLength.toFixed(1)} (Direct dist: ${directDist.toFixed(1)}). Zero collisions in red zones.`);
  return true;
}

let allPassed = true;

// Test Case 1: Robot 1 from Area Alpha (30, 18)
if (!testReturn('Robot 1', [30, 18])) allPassed = false;

// Test Case 2: Robot 2 from Sector Bravo (15, 38)
if (!testReturn('Robot 2', [15, 38])) allPassed = false;

// Test Case 3: Robot 3 from Perimeter Charlie (42, 42)
if (!testReturn('Robot 3', [42, 42])) allPassed = false;

// Test Case 4: Robot 4 from Standby / Task Position (8, 2)
if (!testReturn('Robot 4', [8, 2])) allPassed = false;

// Test Case 5: Robot 5 from Standby Pool (2, 12)
if (!testReturn('Robot 5', [2, 12])) allPassed = false;

// Test Full Workflow Simulation: Robot 1 Low Battery -> Acknowledge -> Return -> Charge -> 100%
console.log('\n[SIMULATION WORKFLOW TEST] Executing Full Low Battery Return Workflow...');
let state = AutonomousDecisionEngine.createInitial5RobotMission();
// Set Robot 1 to 10%
state = AutonomousDecisionEngine.triggerDemoRobot1LowBattery(state);
console.log(`- Triggered 10% Low Battery on Robot 1: Pending Ack Modal = ${state.pending_acknowledgement?.robot_id}`);

// Acknowledge event
state = AutonomousDecisionEngine.acknowledgeLowBatteryEvent(state, 'Robot 1');
const r1 = state.uavs.find(u => u.id === 'Robot 1');
console.log(`- Operator Acknowledged: Robot 1 status = ${r1?.status}, route length = ${r1?.route?.length}`);
const r4 = state.uavs.find(u => u.id === 'Robot 4');
console.log(`- Handover Executed: Robot 4 assigned to = ${r4?.current_task_id}, status = ${r4?.status}`);

// Simulate ticks until Robot 1 reaches charger
let ticks = 0;
while (r1 && r1.status === 'MOVING_TO_CHARGER' && ticks < 40) {
  state = AutonomousDecisionEngine.processSimulationStep(state);
  ticks++;
}
const r1Charged = state.uavs.find(u => u.id === 'Robot 1');
console.log(`- After ${ticks} ticks: Robot 1 status = ${r1Charged?.status}, docked at = (${r1Charged?.x}, ${r1Charged?.y})`);

if (r1Charged?.status === 'CHARGING' || r1Charged?.status === 'WAITING_FOR_CHARGER') {
  console.log('  ✅ FULL WORKFLOW TEST PASSED: Robot 1 returned cleanly and docked at Charging Station.');
} else {
  console.error(`  ❌ FULL WORKFLOW FAILED: Robot 1 status is ${r1Charged?.status}`);
  allPassed = false;
}

console.log('\n================================================================');
console.log(`📊 FINAL RESULT: ${allPassed ? 'ALL RETURN PATH TESTS PASSED (100%)' : 'SOME TESTS FAILED'}`);
console.log('================================================================\n');
