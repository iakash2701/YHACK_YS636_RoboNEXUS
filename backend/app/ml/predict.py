import os
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from app.ml.train import get_or_train_model, FEATURE_COLUMNS
from app.config import DEFAULT_RISK_HIGH_THRESHOLD, DEFAULT_RISK_MEDIUM_THRESHOLD

class RiskPredictor:
    def __init__(self):
        self.model, self.metrics = get_or_train_model()
        self.feature_importances = self.metrics.get("feature_importances", {})

    def predict_risk(
        self,
        battery_percentage: float,
        distance_to_task: float,
        distance_to_base: float,
        uav_health: float,
        communication_quality: float,
        speed: float = 1.0,
        task_priority: int = 3,
        estimated_energy_required: float = 20.0,
        weather_factor: float = 1.0
    ) -> Dict[str, Any]:
        """
        Runs ML Random Forest model inference to predict failure risk probability (0-100%)
        and calculates honest explainable feature contributions.
        """
        feature_dict = {
            "battery_percentage": float(battery_percentage),
            "distance_to_task": float(distance_to_task),
            "distance_to_base": float(distance_to_base),
            "uav_health": float(uav_health),
            "communication_quality": float(communication_quality),
            "speed": float(speed),
            "task_priority": int(task_priority),
            "estimated_energy_required": float(estimated_energy_required),
            "weather_factor": float(weather_factor)
        }
        
        df_input = pd.DataFrame([feature_dict])[FEATURE_COLUMNS]
        
        # Random Forest failure probability
        prob_array = self.model.predict_proba(df_input)[0]
        failure_prob = float(prob_array[1]) if len(prob_array) > 1 else 0.0
        risk_probability = round(failure_prob * 100.0, 1)
        
        # Categorize risk level
        if risk_probability >= DEFAULT_RISK_HIGH_THRESHOLD:
            risk_level = "HIGH"
        elif risk_probability >= DEFAULT_RISK_MEDIUM_THRESHOLD:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
            
        # Feature contribution calculation (Transparent Explainable AI)
        # We calculate the normalized risk stress contribution of each feature
        # 1. Low Battery Margin relative to required energy
        battery_deficit = max(0.0, (estimated_energy_required + 15.0) - battery_percentage)
        battery_stress = min(1.0, battery_deficit / 50.0) if battery_deficit > 0 else 0.0
        if battery_percentage < 30.0:
            battery_stress += (30.0 - battery_percentage) / 30.0 * 0.5
        
        # 2. Travel Distance stress
        distance_stress = min(1.0, (distance_to_task + distance_to_base) / 100.0)
        
        # 3. Comms stress
        comm_stress = max(0.0, (70.0 - communication_quality) / 70.0)
        
        # 4. Health stress
        health_stress = max(0.0, (80.0 - uav_health) / 80.0)
        
        # 5. Energy requirement stress
        energy_stress = min(1.0, estimated_energy_required / 80.0)
        
        # 6. Weather stress
        weather_stress = max(0.0, (weather_factor - 1.0) / 0.6)
        
        raw_contributions = {
            "Battery level": battery_stress * (self.feature_importances.get("battery_percentage", 0.35) * 1.5),
            "Distance to task": distance_stress * self.feature_importances.get("distance_to_task", 0.20),
            "Estimated energy": energy_stress * self.feature_importances.get("estimated_energy_required", 0.15),
            "Communication quality": comm_stress * self.feature_importances.get("communication_quality", 0.12),
            "UAV health": health_stress * self.feature_importances.get("uav_health", 0.10),
            "Weather conditions": weather_stress * self.feature_importances.get("weather_factor", 0.08)
        }
        
        total_stress = sum(raw_contributions.values())
        if total_stress > 0:
            feature_contributions = {
                k: round((v / total_stress) * 100.0, 1) for k, v in raw_contributions.items()
            }
        else:
            feature_contributions = {
                "Battery level": 25.0,
                "Distance to task": 25.0,
                "Estimated energy": 20.0,
                "Communication quality": 15.0,
                "UAV health": 10.0,
                "Weather conditions": 5.0
            }
            
        # Recommendation generation
        recommendation = self._generate_recommendation(risk_level, feature_contributions, battery_percentage, communication_quality, uav_health)
        
        return {
            "risk_probability": risk_probability,
            "risk_level": risk_level,
            "feature_contributions": feature_contributions,
            "recommendation": recommendation,
            "metrics": self.metrics
        }
        
    def _generate_recommendation(
        self,
        risk_level: str,
        contributions: Dict[str, float],
        battery: float,
        comm: float,
        health: float
    ) -> str:
        if risk_level == "LOW":
            return "Mission parameters are optimal. UAV is cleared for route execution."
        
        top_factor = max(contributions.items(), key=lambda x: x[1])[0]
        if risk_level == "MEDIUM":
            return f"Caution advised: elevated stress on {top_factor.lower()}. Continue active monitoring."
        
        # HIGH risk
        reasons = []
        if battery < 35:
            reasons.append("insufficient battery reserve")
        if comm < 40:
            reasons.append("degraded telemetry link")
        if health < 50:
            reasons.append("structural/motor wear")
        if not reasons:
            reasons.append(f"critical impact from {top_factor.lower()}")
            
        return f"CRITICAL: Predictive Replanning recommended due to {', '.join(reasons)}."

_predictor_instance = None

def get_risk_predictor() -> RiskPredictor:
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = RiskPredictor()
    return _predictor_instance
