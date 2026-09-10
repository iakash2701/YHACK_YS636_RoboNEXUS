import numpy as np
import pandas as pd
from typing import Tuple

def generate_synthetic_mission_dataset(num_samples: int = 8000, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic simulation dataset for UAV mission risk prediction.
    
    Features:
    - battery_percentage (0 - 100)
    - distance_to_task (grid units: 2 - 80)
    - distance_to_base (grid units: 2 - 80)
    - uav_health (0 - 100)
    - communication_quality (0 - 100)
    - speed (units/step: 0.5 - 2.5)
    - task_priority (1 - 5)
    - estimated_energy_required (energy %: 5 - 120)
    - weather_factor (1.0 = NORMAL, 1.25 = WINDY, 1.60 = STORM)
    
    Target:
    - mission_failure (0 = Success / Safe, 1 = Failed to complete safely)
    """
    np.random.seed(random_state)
    
    battery = np.random.uniform(15, 100, num_samples)
    distance_to_task = np.random.uniform(5, 70, num_samples)
    distance_to_base = np.random.uniform(5, 70, num_samples)
    uav_health = np.random.uniform(20, 100, num_samples)
    communication_quality = np.random.uniform(10, 100, num_samples)
    speed = np.random.uniform(0.8, 2.0, num_samples)
    task_priority = np.random.randint(1, 6, num_samples)
    
    # Weather distribution: 60% Normal, 25% Windy, 15% Storm
    weather_choices = [1.0, 1.25, 1.60]
    weather_factor = np.random.choice(weather_choices, size=num_samples, p=[0.60, 0.25, 0.15])
    
    # Simulation energy required: (distance_to_task + return_base_factor * distance_to_base) * base_rate * weather
    base_consumption_rate = 0.55
    total_distance = distance_to_task + 0.7 * distance_to_base
    estimated_energy_required = total_distance * base_consumption_rate * weather_factor + np.random.normal(0, 2, num_samples)
    estimated_energy_required = np.clip(estimated_energy_required, 5, 120)
    
    # Failure condition modeling based on realistic aeronautical simulation constraints:
    # 1. Battery Margin: Remaining battery after completing mission must exceed safe reserve (~15%)
    # 2. Health degradation increases power drain and risk of motor stall
    # 3. Low communication causes lost link & failsafe return
    # 4. Severe weather amplifies all risks
    
    battery_margin = battery - estimated_energy_required
    
    # Risk logit calculation
    risk_score = (
        - 0.08 * battery_margin
        - 0.04 * (uav_health - 50)
        - 0.03 * (communication_quality - 50)
        + 0.03 * (estimated_energy_required - 30)
        + 1.5 * (weather_factor - 1.0)
        + 0.15 * (task_priority - 3)
        + np.random.normal(0, 0.5, num_samples)
    )
    
    # Convert risk_score to probability via sigmoid
    prob = 1.0 / (1.0 + np.exp(-risk_score))
    
    # Deterministic failure triggers:
    # If battery < energy required + 5%, or health < 25%, or comms < 15% in storm
    hard_failure = (
        (battery < (estimated_energy_required + 3)) |
        (uav_health < 25) |
        ((communication_quality < 20) & (weather_factor > 1.2))
    )
    
    mission_failure = np.where(hard_failure, 1, (prob > 0.48).astype(int))
    
    df = pd.DataFrame({
        "battery_percentage": battery,
        "distance_to_task": distance_to_task,
        "distance_to_base": distance_to_base,
        "uav_health": uav_health,
        "communication_quality": communication_quality,
        "speed": speed,
        "task_priority": task_priority,
        "estimated_energy_required": estimated_energy_required,
        "weather_factor": weather_factor,
        "mission_failure": mission_failure
    })
    
    return df
