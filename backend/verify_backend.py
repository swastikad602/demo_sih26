import unittest
import json
from app import (
    health_check, get_patients, get_patient, record_game_session,
    record_reminder_log, get_doctor_analytics, get_government_metrics,
    batch_sync, add_doctor_note
)
from schemas import (
    GameSessionCreateSchema, ReminderLogCreateSchema,
    DoctorNoteCreateSchema, BatchSyncPayload
)

class TestNERDementiaPlatformBackendDirect(unittest.TestCase):
    def test_health(self):
        data = health_check()
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["ner_states_supported"], 8)

    def test_get_patients(self):
        patients = get_patients()
        self.assertGreater(len(patients), 0)
        self.assertEqual(patients[0]["state"], "Assam")

    def test_get_patient_detail(self):
        pat = get_patient("pat-ner-001")
        self.assertEqual(pat["name"], "Biren Gogoi")
        self.assertIn("family_members", pat)
        self.assertGreater(len(pat["family_members"]), 0)

    def test_game_sessions_and_adaptive_ai(self):
        # 1. High accuracy & fast response -> elevates to Level 2
        payload = GameSessionCreateSchema(
            patient_id="pat-ner-001",
            game_type="cultural_objects",
            difficulty_level=1,
            score=10,
            max_score=10,
            accuracy_pct=100.0,
            avg_response_time_sec=6.2
        )
        res = record_game_session(payload)
        self.assertEqual(res["difficulty_adjusted_to"], 2)
        self.assertIn("Difficulty elevated", res["adaptation_reason"])

        # 2. Lower accuracy & slow response -> adapts to Level 1
        payload_dip = GameSessionCreateSchema(
            patient_id="pat-ner-001",
            game_type="memory_recall",
            difficulty_level=2,
            score=4,
            max_score=10,
            accuracy_pct=40.0,
            avg_response_time_sec=18.5
        )
        res_dip = record_game_session(payload_dip)
        self.assertEqual(res_dip["difficulty_adjusted_to"], 1)

    def test_reminder_log_90s_discrepancy(self):
        payload = ReminderLogCreateSchema(
            patient_id="pat-ner-001",
            category="medication",
            title="Test Evening Pill",
            scheduled_time="2026-09-01 20:00:00",
            acknowledged_at="2026-09-01 20:01:45",
            response_time_sec=105.0,
            status="acknowledged_after_followup",
            followup_sent=1,
            discrepancy_note="Acknowledged after 90s gentle prompt chime."
        )
        res = record_reminder_log(payload)
        self.assertEqual(res["message"], "Reminder log recorded")

    def test_doctor_analytics(self):
        # 1-Week view
        d1w = get_doctor_analytics("pat-ner-001", timeframe="1w")
        self.assertEqual(d1w["timeframe"], "1w")
        self.assertIn("domain_analysis", d1w)
        self.assertIn("summary", d1w)

        # 1-Month view
        d1m = get_doctor_analytics("pat-ner-001", timeframe="1m")
        self.assertEqual(d1m["timeframe"], "1m")
        self.assertGreater(d1m["summary"]["total_games_played"], 0)

    def test_government_metrics(self):
        data = get_government_metrics()
        self.assertEqual(data["states_count"], 8)
        self.assertIn("policy_recommendations", data)

    def test_batch_sync(self):
        sync_payload = BatchSyncPayload(
            game_sessions=[
                {
                    "id": "gs-offline-sync-01",
                    "patient_id": "pat-ner-001",
                    "game_type": "pattern_recognition",
                    "difficulty_level": 1,
                    "score": 9,
                    "max_score": 10,
                    "accuracy_pct": 90.0,
                    "avg_response_time_sec": 7.5,
                    "level_adjusted_to": 2,
                    "adaptation_reason": "Offline session synced: Level 2"
                }
            ],
            reminder_logs=[
                {
                    "id": "rem-offline-sync-01",
                    "patient_id": "pat-ner-001",
                    "category": "hydration",
                    "title": "Offline Hydration Check",
                    "scheduled_time": "2026-09-01 15:00:00",
                    "acknowledged_at": "2026-09-01 15:00:28",
                    "response_time_sec": 28.0,
                    "status": "acknowledged_on_time"
                }
            ]
        )
        res = batch_sync(sync_payload)
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["synced_counts"]["game_sessions"], 1)
        self.assertEqual(res["synced_counts"]["reminder_logs"], 1)

if __name__ == "__main__":
    unittest.main()
