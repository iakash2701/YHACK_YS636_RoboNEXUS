import sqlite3
import json
from typing import Dict, Any, List, Optional
from app.config import DATABASE_PATH

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Missions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS missions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        weather TEXT NOT NULL DEFAULT 'NORMAL',
        map_width INTEGER NOT NULL DEFAULT 50,
        map_height INTEGER NOT NULL DEFAULT 50,
        obstacles_json TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # UAVs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS uavs (
        id TEXT PRIMARY KEY,
        mission_id TEXT,
        x REAL NOT NULL,
        y REAL NOT NULL,
        base_x REAL NOT NULL,
        base_y REAL NOT NULL,
        battery REAL NOT NULL,
        health REAL NOT NULL,
        communication REAL NOT NULL,
        speed REAL NOT NULL DEFAULT 1.0,
        status TEXT NOT NULL DEFAULT 'IDLE',
        current_task_id TEXT,
        target_x REAL,
        target_y REAL,
        route_json TEXT DEFAULT '[]',
        route_index INTEGER DEFAULT 0,
        total_energy_consumed REAL DEFAULT 0.0,
        FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
    )
    """)
    
    # Tasks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        mission_id TEXT,
        name TEXT NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        priority INTEGER NOT NULL DEFAULT 3,
        status TEXT NOT NULL DEFAULT 'PENDING',
        assigned_uav_id TEXT,
        completed_at TIMESTAMP,
        FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
    )
    """)
    
    # Assignments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mission_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        uav_id TEXT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assignment_score REAL,
        status TEXT DEFAULT 'ACTIVE',
        FOREIGN KEY (mission_id) REFERENCES missions(id)
    )
    """)
    
    # Risk predictions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS risk_predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mission_id TEXT NOT NULL,
        uav_id TEXT NOT NULL,
        task_id TEXT,
        risk_probability REAL NOT NULL,
        risk_level TEXT NOT NULL,
        feature_contributions_json TEXT,
        predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mission_id) REFERENCES missions(id)
    )
    """)
    
    # Mission events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mission_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mission_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        details_json TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mission_id) REFERENCES missions(id)
    )
    """)
    
    # Mission results table (comparing runs)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mission_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mission_id TEXT NOT NULL,
        planner_mode TEXT NOT NULL,
        completion_rate REAL NOT NULL,
        tasks_completed INTEGER NOT NULL,
        total_tasks INTEGER NOT NULL,
        uav_failures INTEGER NOT NULL,
        prevented_failures INTEGER NOT NULL,
        total_energy_consumed REAL NOT NULL,
        mission_duration_seconds REAL NOT NULL,
        replanning_events INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    conn.close()

def execute_query(query: str, params: tuple = ()) -> None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    conn.close()

def fetch_one(query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def fetch_all(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Ensure tables exist
init_db()
