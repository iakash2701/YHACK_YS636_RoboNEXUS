import os
import json
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from app.config import MODEL_FILE_PATH, METRICS_FILE_PATH
from app.ml.dataset import generate_synthetic_mission_dataset

FEATURE_COLUMNS = [
    "battery_percentage",
    "distance_to_task",
    "distance_to_base",
    "uav_health",
    "communication_quality",
    "speed",
    "task_priority",
    "estimated_energy_required",
    "weather_factor"
]

def train_and_save_risk_model(num_samples: int = 8000) -> dict:
    print(f"Generating synthetic dataset with {num_samples} samples...")
    df = generate_synthetic_mission_dataset(num_samples=num_samples)
    
    X = df[FEATURE_COLUMNS]
    y = df["mission_failure"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=1
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    accuracy = float(accuracy_score(y_test, y_pred))
    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_prob))
    
    feature_importances = {
        feat: float(imp) for feat, imp in zip(FEATURE_COLUMNS, model.feature_importances_)
    }
    
    metrics = {
        "model_name": "RandomForestClassifier",
        "dataset_samples": num_samples,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "feature_importances": feature_importances,
        "feature_names": FEATURE_COLUMNS
    }
    
    os.makedirs(os.path.dirname(MODEL_FILE_PATH), exist_ok=True)
    joblib.dump(model, MODEL_FILE_PATH)
    print(f"Model saved to {MODEL_FILE_PATH}")
    
    with open(METRICS_FILE_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved to {METRICS_FILE_PATH}")
    
    return metrics

def get_or_train_model():
    if os.path.exists(MODEL_FILE_PATH) and os.path.exists(METRICS_FILE_PATH):
        try:
            model = joblib.load(MODEL_FILE_PATH)
            with open(METRICS_FILE_PATH, "r") as f:
                metrics = json.load(f)
            return model, metrics
        except Exception as e:
            print(f"Error loading existing model: {e}. Retraining...")
    
    metrics = train_and_save_risk_model()
    model = joblib.load(MODEL_FILE_PATH)
    return model, metrics

if __name__ == "__main__":
    train_and_save_risk_model()
