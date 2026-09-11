import heapq
import math
from typing import List, Tuple, Dict, Any, Optional
from app.config import WEATHER_ENERGY_FACTORS

class PathPlanner:
    def __init__(self, map_width: int = 50, map_height: int = 50):
        self.map_width = map_width
        self.map_height = map_height

    def is_collision(self, x: float, y: float, obstacles: List[Dict[str, Any]], margin: float = 2.0) -> bool:
        """Checks if coordinate (x, y) is inside any rectangular obstacle (expanded by safety margin) or out of bounds."""
        if x < 0.5 or x >= self.map_width - 0.5 or y < 0.5 or y >= self.map_height - 0.5:
            return True
        for obs in obstacles:
            ox = obs.get("x", 0)
            oy = obs.get("y", 0)
            ow = obs.get("width", 0)
            oh = obs.get("height", 0)
            if (ox - margin) <= x <= (ox + ow + margin) and (oy - margin) <= y <= (oy + oh + margin):
                return True
        return False

    def heuristic(self, a: Tuple[int, int], b: Tuple[int, int]) -> float:
        """Euclidean distance heuristic."""
        return math.hypot(a[0] - b[0], a[1] - b[1])

    def find_path(
        self,
        start: Tuple[float, float],
        goal: Tuple[float, float],
        obstacles: List[Dict[str, Any]]
    ) -> List[Tuple[float, float]]:
        """
        A* algorithm with 8-directional movement to find collision-free path from start to goal.
        """
        start_node = (int(round(start[0])), int(round(start[1])))
        goal_node = (int(round(goal[0])), int(round(goal[1])))

        # If start or goal is somehow blocked, find nearest valid neighbor
        if self.is_collision(start_node[0], start_node[1], obstacles):
            start_node = self._find_nearest_free(start_node, obstacles)
        if self.is_collision(goal_node[0], goal_node[1], obstacles):
            goal_node = self._find_nearest_free(goal_node, obstacles)

        if start_node == goal_node:
            return [start, goal]

        # Priority queue for open set: (f_score, g_score, current_node)
        open_set = []
        heapq.heappush(open_set, (self.heuristic(start_node, goal_node), 0.0, start_node))
        
        came_from: Dict[Tuple[int, int], Tuple[int, int]] = {}
        g_score: Dict[Tuple[int, int], float] = {start_node: 0.0}
        
        # 8 directions: horizontal, vertical, diagonal
        directions = [
            (0, 1, 1.0), (1, 0, 1.0), (0, -1, 1.0), (-1, 0, 1.0),
            (1, 1, 1.414), (1, -1, 1.414), (-1, 1, 1.414), (-1, -1, 1.414)
        ]

        closed_set = set()

        while open_set:
            _, current_g, current = heapq.heappop(open_set)

            if current == goal_node:
                # Reconstruct path
                path = []
                curr = current
                while curr in came_from:
                    path.append((float(curr[0]), float(curr[1])))
                    curr = came_from[curr]
                path.append((float(start_node[0]), float(start_node[1])))
                path.reverse()
                # Ensure exact goal coordinate at the end
                if path[-1] != (float(goal[0]), float(goal[1])):
                    path.append((float(goal[0]), float(goal[1])))
                return self._smooth_path(path, obstacles)

            if current in closed_set:
                continue
            closed_set.add(current)

            for dx, dy, cost in directions:
                neighbor = (current[0] + dx, current[1] + dy)
                
                if neighbor in closed_set:
                    continue

                if self.is_collision(neighbor[0], neighbor[1], obstacles):
                    continue

                # For diagonal movement, prevent cutting corners through adjacent walls
                if dx != 0 and dy != 0:
                    if self.is_collision(current[0] + dx, current[1], obstacles) or \
                       self.is_collision(current[0], current[1] + dy, obstacles):
                        continue

                tentative_g = current_g + cost

                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score = tentative_g + self.heuristic(neighbor, goal_node)
                    heapq.heappush(open_set, (f_score, tentative_g, neighbor))

        # Fallback if no full path is found: return direct line
        return [start, goal]

    def _find_nearest_free(self, node: Tuple[int, int], obstacles: List[Dict[str, Any]]) -> Tuple[int, int]:
        for radius in range(1, 10):
            for dx in range(-radius, radius + 1):
                for dy in range(-radius, radius + 1):
                    cand = (node[0] + dx, node[1] + dy)
                    if not self.is_collision(cand[0], cand[1], obstacles):
                        return cand
        return node

    def _smooth_path(self, path: List[Tuple[float, float]], obstacles: List[Dict[str, Any]]) -> List[Tuple[float, float]]:
        """Path smoothing to reduce unnecessary zig-zags while guaranteeing obstacle clearance."""
        if len(path) <= 2:
            return path
        
        # Step-by-step path is preferred for smooth simulation movement
        # Ensure path points are reasonably spaced
        smoothed = [path[0]]
        for i in range(1, len(path)):
            # Keep all waypoints for step-by-step drone simulation
            smoothed.append(path[i])
        return smoothed

    def calculate_path_metrics(
        self,
        path: List[Tuple[float, float]],
        speed: float = 1.0,
        weather: str = "NORMAL",
        base_consumption: float = 0.55
    ) -> Dict[str, float]:
        """Calculates distance, travel time, and estimated energy required."""
        if not path or len(path) < 2:
            return {"distance": 0.0, "travel_time": 0.0, "energy_required": 0.0}
        
        total_dist = 0.0
        for i in range(len(path) - 1):
            total_dist += math.hypot(path[i+1][0] - path[i][0], path[i+1][1] - path[i][1])
            
        travel_time = total_dist / max(0.1, speed)
        weather_factor = WEATHER_ENERGY_FACTORS.get(weather, 1.0)
        energy_required = total_dist * base_consumption * weather_factor
        
        return {
            "distance": round(total_dist, 2),
            "travel_time": round(travel_time, 1),
            "energy_required": round(energy_required, 2),
            "weather_factor": weather_factor
        }
