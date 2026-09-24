import sqlite3
import os
import json
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "dementia_platform.db"

def get_db_connection():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Table: Patients
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        photo_url TEXT,
        state TEXT NOT NULL,
        district TEXT,
        language TEXT DEFAULT 'en',
        condition_stage TEXT NOT NULL,
        favorite_songs TEXT,
        cultural_interests TEXT,
        favorite_poems TEXT,
        medications TEXT,
        daily_routine TEXT,
        baseline_difficulty INTEGER DEFAULT 1,
        current_difficulty INTEGER DEFAULT 1,
        emergency_contact TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Table: Family Members (for Photo Recognition Game)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS family_members (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        photo_url TEXT NOT NULL,
        voice_hint TEXT,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
    """)

    # Table: Game Sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS game_sessions (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        game_type TEXT NOT NULL,
        difficulty_level INTEGER NOT NULL,
        score INTEGER NOT NULL,
        max_score INTEGER NOT NULL,
        accuracy_pct REAL NOT NULL,
        avg_response_time_sec REAL NOT NULL,
        level_adjusted_to INTEGER,
        adaptation_reason TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
    """)

    # Table: Reminder Logs (With 90s rule discrepancy tracking)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reminder_logs (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        scheduled_time TEXT NOT NULL,
        acknowledged_at TEXT,
        response_time_sec REAL,
        status TEXT NOT NULL,
        followup_sent INTEGER DEFAULT 0,
        discrepancy_note TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
    """)

    # Caregiver-managed recurring alarms and reminders.  These are kept
    # separately from reminder_logs: a schedule is the instruction, while a
    # log is the patient's outcome for one occurrence of that instruction.
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS scheduled_reminders (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        reminder_time TEXT NOT NULL,
        days_of_week TEXT DEFAULT '[]',
        is_enabled INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
    """)

    # Table: Caregiver Alerts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
    """)

    # Table: Doctor Notes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS doctor_notes (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        note_text TEXT NOT NULL,
        recommendation TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
    """)

    # Table: Government Regional Aggregates (8 NER States)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS government_regional_stats (
        state_code TEXT PRIMARY KEY,
        state_name TEXT NOT NULL,
        enrolled_patients INTEGER NOT NULL,
        active_caregivers INTEGER NOT NULL,
        cognitive_stability_rate REAL NOT NULL,
        medication_adherence_rate REAL NOT NULL,
        rural_coverage_pct REAL NOT NULL,
        geriatric_centers_count INTEGER NOT NULL,
        recommended_resource_actions TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
