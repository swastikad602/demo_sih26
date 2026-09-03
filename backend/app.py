from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pathlib import Path

from database import get_db_connection, init_db
from schemas import (
    PatientCreateSchema, GameSessionCreateSchema, ReminderLogCreateSchema,
    AlertCreateSchema, DoctorNoteCreateSchema, BatchSyncPayload, FamilyMemberSchema
)

app = FastAPI(
    title="AI-Based Cognitive Gaming & Memory Assistance Platform (SIH26003)",
    description="Offline-capable AI cognitive training & memory assistance platform for dementia patients in North Eastern Region (NER) of India",
    version="1.0.0"
)

# Enable CORS for cross-origin or local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

def row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    # Parse JSON fields if present
    for json_field in ["favorite_songs", "cultural_interests", "favorite_poems", "medications", "daily_routine", "recommended_resource_actions"]:
        if json_field in d and isinstance(d[json_field], str):
            try:
                d[json_field] = json.loads(d[json_field])
            except Exception:
                pass
    return d

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "SIH26003 NER Dementia Platform API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "ner_states_supported": 8,
        "offline_sync_ready": True
    }

# --- Patient Endpoints ---

@app.get("/api/patients")
def get_patients():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients ORDER BY name ASC")
    rows = cursor.fetchall()
    patients = [row_to_dict(r) for r in rows]
    conn.close()
    return patients

@app.get("/api/patients/{patient_id}")
def get_patient(patient_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")
    patient = row_to_dict(row)
    
    # Fetch family members
    cursor.execute("SELECT * FROM family_members WHERE patient_id = ?", (patient_id,))
    fam_rows = cursor.fetchall()
    patient["family_members"] = [dict(f) for f in fam_rows]
    conn.close()
    return patient

@app.post("/api/patients")
def create_patient(payload: PatientCreateSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    pat_id = payload.id or f"pat-ner-{uuid.uuid4().hex[:6]}"
    
    cursor.execute("""
    INSERT OR REPLACE INTO patients 
    (id, name, age, gender, photo_url, state, district, language, condition_stage, 
     favorite_songs, cultural_interests, favorite_poems, medications, daily_routine, 
     baseline_difficulty, current_difficulty, emergency_contact, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        pat_id, payload.name, payload.age, payload.gender, payload.photo_url,
        payload.state, payload.district, payload.language, payload.condition_stage,
        json.dumps(payload.favorite_songs or []),
        json.dumps(payload.cultural_interests or []),
        json.dumps(payload.favorite_poems or []),
        json.dumps(payload.medications or []),
        json.dumps(payload.daily_routine or []),
        payload.baseline_difficulty, payload.current_difficulty,
        payload.emergency_contact, datetime.now().isoformat()
    ))
    
    # Save family members
    if payload.family_members:
        cursor.execute("DELETE FROM family_members WHERE patient_id = ?", (pat_id,))
        for fam in payload.family_members:
            fam_id = fam.id or f"fam-{uuid.uuid4().hex[:6]}"
            cursor.execute("""
            INSERT INTO family_members (id, patient_id, name, relationship, photo_url, voice_hint)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (fam_id, pat_id, fam.name, fam.relationship, fam.photo_url, fam.voice_hint))
            
    conn.commit()
    conn.close()
    return {"message": "Patient saved successfully", "id": pat_id}

@app.put("/api/patients/{patient_id}")
def update_patient(patient_id: str, payload: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")
        
    current = dict(existing)
    for key, val in payload.items():
        if key in ["favorite_songs", "cultural_interests", "favorite_poems", "medications", "daily_routine"]:
            current[key] = json.dumps(val) if not isinstance(val, str) else val
        elif key in current:
            current[key] = val
            
    cursor.execute("""
    UPDATE patients SET 
        name = ?, age = ?, gender = ?, photo_url = ?, state = ?, district = ?,
        language = ?, condition_stage = ?, favorite_songs = ?, cultural_interests = ?,
        favorite_poems = ?, medications = ?, daily_routine = ?, baseline_difficulty = ?,
        current_difficulty = ?, emergency_contact = ?, updated_at = ?
    WHERE id = ?
    """, (
        current["name"], current["age"], current["gender"], current["photo_url"],
        current["state"], current["district"], current["language"], current["condition_stage"],
        current["favorite_songs"], current["cultural_interests"], current["favorite_poems"],
        current["medications"], current["daily_routine"], current["baseline_difficulty"],
        current["current_difficulty"], current["emergency_contact"], datetime.now().isoformat(),
        patient_id
    ))
    conn.commit()
    conn.close()
    return {"message": "Patient updated successfully", "id": patient_id}

@app.get("/api/patients/{patient_id}/family")
def get_family_members(patient_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM family_members WHERE patient_id = ?", (patient_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# --- Game Sessions & Adaptive AI Engine ---

@app.get("/api/games/sessions")
def get_game_sessions(patient_id: Optional[str] = None, days: Optional[int] = 30):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM game_sessions"
    params = []
    
    conditions = []
    if patient_id:
        conditions.append("patient_id = ?")
        params.append(patient_id)
    if days:
        cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d %H:%M:%S")
        conditions.append("timestamp >= ?")
        params.append(cutoff)
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY timestamp DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/games/sessions")
def record_game_session(payload: GameSessionCreateSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    session_id = payload.id or f"gs-{uuid.uuid4().hex[:8]}"
    ts = payload.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Adaptive AI difficulty rule evaluation
    # Target rules:
    # 1. If accuracy < 60% or avg response time > 15.0s -> reduce difficulty (min Level 1)
    # 2. If accuracy >= 85% and avg response time < 8.5s -> increase difficulty (max Level 3)
    # 3. Otherwise -> maintain current difficulty
    adjusted_level = payload.difficulty_level
    reason = "Maintaining difficulty level based on balanced performance."
    
    if payload.accuracy_pct < 60.0 or payload.avg_response_time_sec > 15.0:
        adjusted_level = max(1, payload.difficulty_level - 1)
        reason = f"Difficulty adjusted to Level {adjusted_level} because accuracy was {payload.accuracy_pct:.1f}% (<60%) or response time was {payload.avg_response_time_sec:.1f}s (>15s threshold)."
    elif payload.accuracy_pct >= 85.0 and payload.avg_response_time_sec < 8.5:
        adjusted_level = min(3, payload.difficulty_level + 1)
        reason = f"Difficulty elevated to Level {adjusted_level} due to high accuracy ({payload.accuracy_pct:.1f}%) and swift response time ({payload.avg_response_time_sec:.1f}s)."

    level_to_save = payload.level_adjusted_to or adjusted_level
    reason_to_save = payload.adaptation_reason or reason

    cursor.execute("""
    INSERT OR REPLACE INTO game_sessions 
    (id, patient_id, game_type, difficulty_level, score, max_score, accuracy_pct, 
     avg_response_time_sec, level_adjusted_to, adaptation_reason, timestamp, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        session_id, payload.patient_id, payload.game_type, payload.difficulty_level,
        payload.score, payload.max_score, payload.accuracy_pct, payload.avg_response_time_sec,
        level_to_save, reason_to_save, ts, datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    
    # Update current difficulty in patient profile
    cursor.execute("UPDATE patients SET current_difficulty = ? WHERE id = ?", (level_to_save, payload.patient_id))
    
    # If noticeable decline detected, automatically post a caregiver alert
    if payload.accuracy_pct < 50.0:
        alt_id = f"alt-{uuid.uuid4().hex[:6]}"
        cursor.execute("""
        INSERT INTO alerts (id, patient_id, alert_type, title, message, severity, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            alt_id, payload.patient_id, "performance_decline",
            "Cognitive Performance Dip Alert",
            f"Patient scored {payload.accuracy_pct:.1f}% on {payload.game_type.replace('_', ' ').title()}. System reduced difficulty to Level {level_to_save} to ease mental load.",
            "medium", ts
        ))
        
    conn.commit()
    conn.close()
    
    return {
        "message": "Game session recorded",
        "session_id": session_id,
        "difficulty_adjusted_to": level_to_save,
        "adaptation_reason": reason_to_save
    }

# --- Reminders & Discrepancy Logging ---

@app.get("/api/reminders/logs")
def get_reminder_logs(patient_id: Optional[str] = None, days: Optional[int] = 30):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM reminder_logs"
    params = []
    conditions = []
    
    if patient_id:
        conditions.append("patient_id = ?")
        params.append(patient_id)
    if days:
        cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d %H:%M:%S")
        conditions.append("timestamp >= ?")
        params.append(cutoff)
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY timestamp DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/reminders/logs")
def record_reminder_log(payload: ReminderLogCreateSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    log_id = payload.id or f"rem-{uuid.uuid4().hex[:8]}"
    ts = payload.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute("""
    INSERT OR REPLACE INTO reminder_logs 
    (id, patient_id, category, title, description, scheduled_time, acknowledged_at,
     response_time_sec, status, followup_sent, discrepancy_note, timestamp, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        log_id, payload.patient_id, payload.category, payload.title, payload.description,
        payload.scheduled_time, payload.acknowledged_at, payload.response_time_sec,
        payload.status, payload.followup_sent, payload.discrepancy_note, ts,
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    
    # If no response after 90s follow-up or confused response, create caregiver alert
    if payload.status in ["no_response_90s", "confused_response"]:
        alt_id = f"alt-{uuid.uuid4().hex[:6]}"
        cursor.execute("""
        INSERT INTO alerts (id, patient_id, alert_type, title, message, severity, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            alt_id, payload.patient_id, "missed_medication" if payload.category == "medication" else "routine_gap",
            f"Reminder Discrepancy: {payload.title}",
            f"Status: {payload.status.replace('_', ' ').title()}. Note: {payload.discrepancy_note or 'No acknowledgment recorded within 90s window'}",
            "high" if payload.category == "medication" else "medium", ts
        ))
        
    conn.commit()
    conn.close()
    return {"message": "Reminder log recorded", "log_id": log_id}

# --- Alerts & Notifications ---

@app.get("/api/alerts")
def get_alerts(patient_id: Optional[str] = None, unread_only: bool = False):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM alerts"
    params = []
    conditions = []
    
    if patient_id:
        conditions.append("patient_id = ?")
        params.append(patient_id)
    if unread_only:
        conditions.append("is_read = 0")
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY timestamp DESC"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.put("/api/alerts/{alert_id}/read")
def mark_alert_read(alert_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET is_read = 1 WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()
    return {"message": "Alert marked as read", "alert_id": alert_id}

# --- Doctor / Healthcare Provider Analytics ---

@app.get("/api/doctor/analytics/{patient_id}")
def get_doctor_analytics(patient_id: str, timeframe: str = Query("1w", pattern="^(1w|1m)$")):
    days = 7 if timeframe == "1w" else 30
    cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d %H:%M:%S")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Patient info
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    p_row = cursor.fetchone()
    if not p_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")
    patient = row_to_dict(p_row)
    
    # 2. Game sessions in timeframe
    cursor.execute("""
    SELECT * FROM game_sessions 
    WHERE patient_id = ? AND timestamp >= ? 
    ORDER BY timestamp ASC
    """, (patient_id, cutoff))
    sessions = [dict(r) for r in cursor.fetchall()]
    
    # 3. Reminder logs in timeframe
    cursor.execute("""
    SELECT * FROM reminder_logs 
    WHERE patient_id = ? AND timestamp >= ? 
    ORDER BY timestamp DESC
    """, (patient_id, cutoff))
    reminder_logs = [dict(r) for r in cursor.fetchall()]
    
    # 4. Doctor Notes
    cursor.execute("""
    SELECT * FROM doctor_notes 
    WHERE patient_id = ? 
    ORDER BY timestamp DESC
    """, (patient_id,))
    notes = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    # Compute Aggregates & Domain Breakdown
    total_games = len(sessions)
    avg_accuracy = round(sum(s["accuracy_pct"] for s in sessions) / total_games, 1) if total_games > 0 else 0.0
    avg_latency = round(sum(s["avg_response_time_sec"] for s in sessions) / total_games, 1) if total_games > 0 else 0.0
    
    # Domain breakdown
    domain_map = {
        "memory_recall": {"name": "Memory & Recall", "scores": []},
        "attention_focus": {"name": "Attention & Concentration", "scores": []},
        "pattern_recognition": {"name": "Pattern Recognition", "scores": []},
        "family_photo": {"name": "Family Recognition", "scores": []},
        "cultural_objects": {"name": "Cultural Heritage Recall", "scores": []}
    }
    for s in sessions:
        gtype = s["game_type"]
        if gtype in domain_map:
            domain_map[gtype]["scores"].append(s["accuracy_pct"])
            
    domain_analysis = []
    for gtype, data in domain_map.items():
        count = len(data["scores"])
        avg_score = round(sum(data["scores"]) / count, 1) if count > 0 else 75.0
        domain_analysis.append({
            "game_type": gtype,
            "domain_name": data["name"],
            "sessions_count": count,
            "average_accuracy": avg_score,
            "status": "Stable" if avg_score >= 70 else "Needs Monitoring"
        })
        
    # Discrepancy summary
    total_reminders = len(reminder_logs)
    on_time = sum(1 for r in reminder_logs if r["status"] == "acknowledged_on_time")
    after_followup = sum(1 for r in reminder_logs if r["status"] == "acknowledged_after_followup")
    no_response = sum(1 for r in reminder_logs if r["status"] == "no_response_90s")
    confused = sum(1 for r in reminder_logs if r["status"] == "confused_response")
    
    compliance_pct = round(((on_time + after_followup) / total_reminders * 100), 1) if total_reminders > 0 else 100.0

    return {
        "patient": patient,
        "timeframe": timeframe,
        "days": days,
        "summary": {
            "total_games_played": total_games,
            "overall_accuracy_pct": avg_accuracy,
            "avg_response_latency_sec": avg_latency,
            "current_difficulty_level": patient.get("current_difficulty", 1),
            "medication_routine_compliance_pct": compliance_pct,
            "discrepancy_counts": {
                "on_time_within_90s": on_time,
                "acknowledged_after_90s_followup": after_followup,
                "no_response_missed": no_response,
                "confusion_discrepancies": confused
            }
        },
        "domain_analysis": domain_analysis,
        "daily_trend": sessions,
        "recent_discrepancies": [r for r in reminder_logs if r["status"] != "acknowledged_on_time"][:10],
        "all_reminder_logs": reminder_logs[:20],
        "doctor_notes": notes,
        "clinical_disclaimer": "This dashboard is a clinical decision-support and monitoring aid. It does not replace medical diagnosis."
    }

@app.post("/api/doctor/notes")
def add_doctor_note(payload: DoctorNoteCreateSchema):
    conn = get_db_connection()
    cursor = conn.cursor()
    note_id = payload.id or f"dn-{uuid.uuid4().hex[:6]}"
    ts = payload.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute("""
    INSERT INTO doctor_notes (id, patient_id, doctor_name, note_text, recommendation, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (note_id, payload.patient_id, payload.doctor_name, payload.note_text, payload.recommendation, ts))
    conn.commit()
    conn.close()
    return {"message": "Doctor clinical note saved", "note_id": note_id}

# --- Government / Regional Health Dashboard ---

@app.get("/api/government/metrics")
def get_government_metrics():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM government_regional_stats ORDER BY enrolled_patients DESC")
    rows = cursor.fetchall()
    states = [row_to_dict(r) for r in rows]
    conn.close()
    
    total_enrolled = sum(s["enrolled_patients"] for s in states)
    total_caregivers = sum(s["active_caregivers"] for s in states)
    avg_stability = round(sum(s["cognitive_stability_rate"] for s in states) / len(states), 1) if states else 0.0
    avg_adherence = round(sum(s["medication_adherence_rate"] for s in states) / len(states), 1) if states else 0.0
    total_centers = sum(s["geriatric_centers_count"] for s in states)
    
    return {
        "region": "North Eastern Region (NER), India",
        "states_count": len(states),
        "overall_summary": {
            "total_enrolled_patients": total_enrolled,
            "active_caregivers": total_caregivers,
            "avg_cognitive_stability_rate": avg_stability,
            "avg_medication_adherence_rate": avg_adherence,
            "total_geriatric_centers": total_centers,
            "de_identified": True
        },
        "states_breakdown": states,
        "policy_recommendations": [
            {
                "priority": "High",
                "title": "Arunachal & Nagaland Mobile Memory Clinics",
                "description": "Deploy solar-powered satellite vans with offline tablets to hill districts (Tawang, Mokokchung, Ziro) to boost rural coverage."
            },
            {
                "priority": "Medium",
                "title": "NER Vernacular Audio Dialect Expansion",
                "description": "Incorporate audio synthesizers in Kokborok (Tripura), Monpa (Arunachal), and Khasi (Meghalaya) into public health center tablets."
            },
            {
                "priority": "High",
                "title": "Anganwadi & ASHA Worker Training on Reminder Discrepancy Tracking",
                "description": "Train 2,500 grassroots community health workers across Assam and Manipur to audit 90-second reminder response discrepancies."
            }
        ]
    }

# --- Batch Sync Endpoint (For Local-First IndexedDB Outbox) ---

@app.post("/api/sync/batch")
def batch_sync(payload: BatchSyncPayload):
    conn = get_db_connection()
    cursor = conn.cursor()
    synced_counts = {
        "patients": 0,
        "game_sessions": 0,
        "reminder_logs": 0,
        "alerts": 0,
        "doctor_notes": 0
    }
    
    # Sync Patients
    if payload.patients:
        for p in payload.patients:
            cursor.execute("""
            INSERT OR REPLACE INTO patients 
            (id, name, age, gender, photo_url, state, district, language, condition_stage,
             favorite_songs, cultural_interests, favorite_poems, medications, daily_routine,
             baseline_difficulty, current_difficulty, emergency_contact, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"], p["name"], p["age"], p["gender"], p.get("photo_url"),
                p["state"], p.get("district"), p.get("language", "en"), p["condition_stage"],
                json.dumps(p.get("favorite_songs", [])),
                json.dumps(p.get("cultural_interests", [])),
                json.dumps(p.get("favorite_poems", [])),
                json.dumps(p.get("medications", [])),
                json.dumps(p.get("daily_routine", [])),
                p.get("baseline_difficulty", 1), p.get("current_difficulty", 1),
                p.get("emergency_contact"), datetime.now().isoformat()
            ))
            synced_counts["patients"] += 1

    # Sync Game Sessions
    if payload.game_sessions:
        for gs in payload.game_sessions:
            cursor.execute("""
            INSERT OR REPLACE INTO game_sessions 
            (id, patient_id, game_type, difficulty_level, score, max_score, accuracy_pct,
             avg_response_time_sec, level_adjusted_to, adaptation_reason, timestamp, synced_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                gs["id"], gs["patient_id"], gs["game_type"], gs["difficulty_level"],
                gs["score"], gs["max_score"], gs["accuracy_pct"], gs["avg_response_time_sec"],
                gs.get("level_adjusted_to", gs["difficulty_level"]),
                gs.get("adaptation_reason", ""),
                gs.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            ))
            synced_counts["game_sessions"] += 1

    # Sync Reminder Logs
    if payload.reminder_logs:
        for rem in payload.reminder_logs:
            cursor.execute("""
            INSERT OR REPLACE INTO reminder_logs 
            (id, patient_id, category, title, description, scheduled_time, acknowledged_at,
             response_time_sec, status, followup_sent, discrepancy_note, timestamp, synced_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                rem["id"], rem["patient_id"], rem["category"], rem["title"], rem.get("description"),
                rem["scheduled_time"], rem.get("acknowledged_at"), rem.get("response_time_sec"),
                rem["status"], rem.get("followup_sent", 0), rem.get("discrepancy_note"),
                rem.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            ))
            synced_counts["reminder_logs"] += 1

    # Sync Alerts
    if payload.alerts:
        for alt in payload.alerts:
            cursor.execute("""
            INSERT OR REPLACE INTO alerts 
            (id, patient_id, alert_type, title, message, severity, is_read, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                alt["id"], alt["patient_id"], alt["alert_type"], alt["title"], alt["message"],
                alt["severity"], alt.get("is_read", 0),
                alt.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            ))
            synced_counts["alerts"] += 1

    # Sync Doctor Notes
    if payload.doctor_notes:
        for dn in payload.doctor_notes:
            cursor.execute("""
            INSERT OR REPLACE INTO doctor_notes 
            (id, patient_id, doctor_name, note_text, recommendation, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (
                dn["id"], dn["patient_id"], dn["doctor_name"], dn["note_text"],
                dn.get("recommendation"),
                dn.get("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            ))
            synced_counts["doctor_notes"] += 1

    conn.commit()
    conn.close()
    
    return {
        "status": "success",
        "synced_counts": synced_counts,
        "synced_at": datetime.now().isoformat()
    }

# --- Static Frontend Serving ---
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

@app.get("/")
def serve_index():
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "Frontend static file will be available shortly."}
