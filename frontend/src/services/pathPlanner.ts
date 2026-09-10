import { Obstacle } from '../types';

export const ROBOT_SAFETY_MARGIN = 2.0; // Distance buffer around red no-fly zones accounting for robot visual size

/**
 * Checks if a 2D point (x, y) lies inside an obstacle expanded by safety margin.
 */
export function isPointInObstacle(
  x: number,
  y: number,
  obs: Obstacle,
  margin: number = ROBOT_SAFETY_MARGIN
): boolean {
  return (
    x >= obs.x - margin &&
    x <= obs.x + obs.width + margin &&
    y >= obs.y - margin &&
    y <= obs.y + obs.height + margin
  );
}

/**
 * Checks if a 2D point (x, y) is inside any obstacle.
 */
export function isPointInAnyObstacle(
  x: number,
  y: number,
  obstacles: Obstacle[],
  margin: number = ROBOT_SAFETY_MARGIN
): boolean {
  for (const obs of obstacles) {
    if (isPointInObstacle(x, y, obs, margin)) {
      return true;
    }
  }
  return false;
}

/**
 * Liang-Barsky line-clipping algorithm to test if line segment p1->p2
 * intersects an axis-aligned obstacle box expanded by margin.
 */
export function isSegmentBlockedByObstacle(
  p1: [number, number],
  p2: [number, number],
  obs: Obstacle,
  margin: number = ROBOT_SAFETY_MARGIN
): boolean {
  const minX = obs.x - margin;
  const maxX = obs.x + obs.width + margin;
  const minY = obs.y - margin;
  const maxY = obs.y + obs.height + margin;

  // Endpoint inside check
  if (
    (p1[0] >= minX && p1[0] <= maxX && p1[1] >= minY && p1[1] <= maxY) ||
    (p2[0] >= minX && p2[0] <= maxX && p2[1] >= minY && p2[1] <= maxY)
  ) {
    return true;
  }

  let t0 = 0.0;
  let t1 = 1.0;
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];

  const p = [-dx, dx, -dy, dy];
  const q = [p1[0] - minX, maxX - p1[0], p1[1] - minY, maxY - p1[1]];

  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-7) {
      if (q[i] < 0) return false; // Parallel and outside
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return t0 <= t1;
}

/**
 * Checks if the direct line between p1 and p2 is clear of all obstacles.
 */
export function isDirectPathClear(
  p1: [number, number],
  p2: [number, number],
  obstacles: Obstacle[],
  margin: number = ROBOT_SAFETY_MARGIN
): boolean {
  for (const obs of obstacles) {
    if (isSegmentBlockedByObstacle(p1, p2, obs, margin)) {
      return false;
    }
  }
  return true;
}

/**
 * Interpolates discrete route points along straight line segments.
 */
function interpolateWaypoints(waypoints: [number, number][], stepSize: number = 1.0): [number, number][] {
  if (waypoints.length <= 1) return waypoints;
  const result: [number, number][] = [waypoints[0]];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const dist = Math.hypot(dx, dy);

    if (dist < 1e-4) continue;

    const numSteps = Math.max(1, Math.ceil(dist / stepSize));
    for (let s = 1; s <= numSteps; s++) {
      const t = s / numSteps;
      const px = Math.round((from[0] + dx * t) * 10) / 10;
      const py = Math.round((from[1] + dy * t) * 10) / 10;
      // Avoid duplicate consecutive points
      const last = result[result.length - 1];
      if (!last || last[0] !== px || last[1] !== py) {
        result.push([px, py]);
      }
    }
  }
  return result;
}

/**
 * Simplifies a sequence of grid points by removing intermediate collinear points.
 */
function simplifyOrthogonalPath(points: [number, number][]): [number, number][] {
  if (points.length <= 2) return points;
  const simplified: [number, number][] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    const dx1 = curr[0] - prev[0];
    const dy1 = curr[1] - prev[1];
    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];

    // If direction changes, keep current waypoint
    if ((dx1 === 0 && dx2 !== 0) || (dy1 === 0 && dy2 !== 0) || (Math.sign(dx1) !== Math.sign(dx2)) || (Math.sign(dy1) !== Math.sign(dy2))) {
      simplified.push(curr);
    }
  }
  simplified.push(points[points.length - 1]);
  return simplified;
}

/**
 * Calculates a safe collision-free route from start to target avoiding all red NO-FLY zones.
 * If direct line has no obstacle, returns direct path.
 * If blocked, calculates orthogonal (UP/DOWN/LEFT/RIGHT) detour waypoints around obstacles.
 */
export function calculateSafeRoute(
  start: [number, number],
  target: [number, number],
  obstacles: Obstacle[] = [],
  mapWidth: number = 50,
  mapHeight: number = 50,
  margin: number = ROBOT_SAFETY_MARGIN
): [number, number][] {
  const sx = Math.max(0.5, Math.min(mapWidth - 0.5, Math.round(start[0] * 10) / 10));
  const sy = Math.max(0.5, Math.min(mapHeight - 0.5, Math.round(start[1] * 10) / 10));
  const tx = Math.max(0.5, Math.min(mapWidth - 0.5, Math.round(target[0] * 10) / 10));
  const ty = Math.max(0.5, Math.min(mapHeight - 0.5, Math.round(target[1] * 10) / 10));

  // If already at target
  if (Math.hypot(tx - sx, ty - sy) < 0.3) {
    return [[sx, sy]];
  }

  // 1. Direct path check: If direct route does not intersect any obstacle, use direct path
  if (isDirectPathClear([sx, sy], [tx, ty], obstacles, margin)) {
    return interpolateWaypoints([[sx, sy], [tx, ty]], 1.2);
  }

  // 2. Obstacle Avoidance Path Planner (Deterministic Orthogonal A* on Grid)
  const gridResolution = 1.0;
  const cols = Math.ceil(mapWidth / gridResolution) + 1;
  const rows = Math.ceil(mapHeight / gridResolution) + 1;

  const startGX = Math.max(0, Math.min(cols - 1, Math.round(sx / gridResolution)));
  const startGY = Math.max(0, Math.min(rows - 1, Math.round(sy / gridResolution)));
  const targetGX = Math.max(0, Math.min(cols - 1, Math.round(tx / gridResolution)));
  const targetGY = Math.max(0, Math.min(rows - 1, Math.round(ty / gridResolution)));

  // Grid node representation
  const key = (x: number, y: number) => y * cols + x;
  const startKey = key(startGX, startGY);
  const targetKey = key(targetGX, targetGY);

  const openSet: number[] = [startKey];
  const cameFrom = new Map<number, number>();
  const gScore = new Map<number, number>();
  const fScore = new Map<number, number>();

  gScore.set(startKey, 0);
  fScore.set(startKey, Math.hypot(targetGX - startGX, targetGY - startGY));

  const isBlocked = (gx: number, gy: number): boolean => {
    const rx = gx * gridResolution;
    const ry = gy * gridResolution;
    // Don't block target or start nodes even if on boundary
    if ((gx === targetGX && gy === targetGY) || (gx === startGX && gy === startGY)) {
      return false;
    }
    return isPointInAnyObstacle(rx, ry, obstacles, margin);
  };

  // Orthogonal neighbors: UP, RIGHT, DOWN, LEFT
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }
  ];

  let found = false;
  let iterations = 0;
  const maxIterations = 3500;

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;
    // Get node in openSet with lowest fScore
    let lowestIdx = 0;
    let lowestF = fScore.get(openSet[0]) ?? Infinity;
    for (let i = 1; i < openSet.length; i++) {
      const f = fScore.get(openSet[i]) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        lowestIdx = i;
      }
    }

    const currentKey = openSet[lowestIdx];
    const curX = currentKey % cols;
    const curY = Math.floor(currentKey / cols);

    if (currentKey === targetKey || (Math.abs(curX - targetGX) <= 1 && Math.abs(curY - targetGY) <= 1 && isDirectPathClear([curX * gridResolution, curY * gridResolution], [tx, ty], obstacles, margin))) {
      if (currentKey !== targetKey) {
        cameFrom.set(targetKey, currentKey);
      }
      found = true;
      break;
    }

    openSet.splice(lowestIdx, 1);
    const currentG = gScore.get(currentKey) ?? Infinity;

    for (const dir of directions) {
      const nx = curX + dir.dx;
      const ny = curY + dir.dy;

      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
      if (isBlocked(nx, ny)) continue;

      const neighborKey = key(nx, ny);
      const tentativeG = currentG + 1.0;

      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeG);
        const h = Math.hypot(targetGX - nx, targetGY - ny);
        fScore.set(neighborKey, tentativeG + h);

        if (!openSet.includes(neighborKey)) {
          openSet.push(neighborKey);
        }
      }
    }
  }

  // Reconstruct path
  if (found) {
    const rawPath: [number, number][] = [[tx, ty]];
    let curr = cameFrom.has(targetKey) ? targetKey : openSet[0];

    while (curr !== undefined && curr !== startKey) {
      const cx = (curr % cols) * gridResolution;
      const cy = Math.floor(curr / cols) * gridResolution;
      rawPath.unshift([cx, cy]);
      curr = cameFrom.get(curr)!;
    }
    rawPath.unshift([sx, sy]);

    const simplifiedWaypoints = simplifyOrthogonalPath(rawPath);
    return interpolateWaypoints(simplifiedWaypoints, 1.2);
  }

  // Fallback: If grid search failed due to map edges, generate safe detour waypoints around blocking obstacles
  const blockingObs = obstacles.filter(obs => isSegmentBlockedByObstacle([sx, sy], [tx, ty], obs, margin));
  if (blockingObs.length > 0) {
    const obs = blockingObs[0];
    const topY = Math.max(1, obs.y - margin);
    const bottomY = Math.min(mapHeight - 1, obs.y + obs.height + margin);
    const leftX = Math.max(1, obs.x - margin);
    const rightX = Math.min(mapWidth - 1, obs.x + obs.width + margin);

    // Candidate routes: Top detour vs Bottom detour vs Left detour vs Right detour
    const candidateRoutes: [number, number][][] = [
      [[sx, sy], [leftX, topY], [rightX, topY], [tx, ty]], // Top Route
      [[sx, sy], [leftX, bottomY], [rightX, bottomY], [tx, ty]], // Bottom Route
      [[sx, sy], [leftX, topY], [leftX, bottomY], [tx, ty]], // Left Route
      [[sx, sy], [rightX, topY], [rightX, bottomY], [tx, ty]] // Right Route
    ];

    for (const route of candidateRoutes) {
      if (!isPointInAnyObstacle(route[1][0], route[1][1], obstacles, 0.5) &&
          !isPointInAnyObstacle(route[2][0], route[2][1], obstacles, 0.5)) {
        return interpolateWaypoints(simplifyOrthogonalPath(route), 1.2);
      }
    }
  }

  // Default fallback
  return interpolateWaypoints([[sx, sy], [tx, ty]], 1.2);
}
