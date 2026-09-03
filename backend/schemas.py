from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FamilyMemberSchema(BaseModel):
    id: Optional[str] = None
    patient_id: Optional[str] = None
    name: str
    relationship: str
    photo_url: str
    voice_hint: Optional[str] = None

class PatientCreateSchema(BaseModel):
    id: Optional[str] = None
    name: str
    age: int
    gender: str
    photo_url: Optional[str] = None
    state: str
    district: Optional[str] = None
    language: Optional[str] = "en"
    condition_stage: str
    favorite_songs: Optional[List[str]] = []
    cultural_interests: Optional[List[str]] = []
    favorite_poems: Optional[List[str]] = []
    medications: Optional[List[Dict[str, Any]]] = []
    daily_routine: Optional[List[Dict[str, Any]]] = []
    baseline_difficulty: Optional[int] = 1
    current_difficulty: Optional[int] = 1
    emergency_contact: Optional[str] = None
    family_members: Optional[List[FamilyMemberSchema]] = []

class GameSessionCreateSchema(BaseModel):
    id: Optional[str] = None
    patient_id: str
    game_type: str
    difficulty_level: int
    score: int
    max_score: int
    accuracy_pct: float
    avg_response_time_sec: float
    level_adjusted_to: Optional[int] = None
    adaptation_reason: Optional[str] = None
    timestamp: Optional[str] = None

class ReminderLogCreateSchema(BaseModel):
    id: Optional[str] = None
    patient_id: str
    category: str
    title: str
    description: Optional[str] = None
    scheduled_time: str
    acknowledged_at: Optional[str] = None
    response_time_sec: Optional[float] = None
    status: str
    followup_sent: Optional[int] = 0
    discrepancy_note: Optional[str] = None
    timestamp: Optional[str] = None

class AlertCreateSchema(BaseModel):
    id: Optional[str] = None
    patient_id: str
    alert_type: str
    title: str
    message: str
    severity: str
    is_read: Optional[int] = 0
    timestamp: Optional[str] = None

class DoctorNoteCreateSchema(BaseModel):
    id: Optional[str] = None
    patient_id: str
    doctor_name: str
    note_text: str
    recommendation: Optional[str] = None
    timestamp: Optional[str] = None

class BatchSyncPayload(BaseModel):
    patients: Optional[List[Dict[str, Any]]] = []
    game_sessions: Optional[List[Dict[str, Any]]] = []
    reminder_logs: Optional[List[Dict[str, Any]]] = []
    alerts: Optional[List[Dict[str, Any]]] = []
    doctor_notes: Optional[List[Dict[str, Any]]] = []
