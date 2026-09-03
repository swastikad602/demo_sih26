import sqlite3
import json
import uuid
from datetime import datetime, timedelta
import random
from database import get_db_connection, init_db

NER_STATES_DATA = [
    {
        "state_code": "AS",
        "state_name": "Assam",
        "enrolled_patients": 1420,
        "active_caregivers": 1380,
        "cognitive_stability_rate": 78.4,
        "medication_adherence_rate": 86.2,
        "rural_coverage_pct": 72.5,
        "geriatric_centers_count": 28,
        "recommended_resource_actions": json.dumps([
            "Deploy 6 Mobile Geriatric Memory Clinics to Majuli & Barak Valley",
            "Conduct Anganwadi worker cognitive screening workshops in Kamrup & Dibrugarh",
            "Subsidize digital tablet distribution for rural elder care"
        ])
    },
    {
        "state_code": "AR",
        "state_name": "Arunachal Pradesh",
        "enrolled_patients": 460,
        "active_caregivers": 435,
        "cognitive_stability_rate": 74.8,
        "medication_adherence_rate": 81.5,
        "rural_coverage_pct": 84.0,
        "geriatric_centers_count": 12,
        "recommended_resource_actions": json.dumps([
            "Establish satellite telemedicine memory hubs in Tawang & Ziro",
            "Translate cognitive voice assistance into Nyishi, Adi, and Monpa dialects",
            "Emergency caregiver respite volunteer networks in high-altitude zones"
        ])
    },
    {
        "state_code": "MN",
        "state_name": "Manipur",
        "enrolled_patients": 680,
        "active_caregivers": 660,
        "cognitive_stability_rate": 76.2,
        "medication_adherence_rate": 84.0,
        "rural_coverage_pct": 68.0,
        "geriatric_centers_count": 16,
        "recommended_resource_actions": json.dumps([
            "Expand community day-care memory hubs in Bishnupur & Churachandpur",
            "Integrate traditional Meitei music & dance therapy into digital routine",
            "Mobile battery backup kits for tablet-based offline usage in valley districts"
        ])
    },
    {
        "state_code": "ML",
        "state_name": "Meghalaya",
        "enrolled_patients": 540,
        "active_caregivers": 520,
        "cognitive_stability_rate": 79.1,
        "medication_adherence_rate": 87.3,
        "rural_coverage_pct": 79.5,
        "geriatric_centers_count": 14,
        "recommended_resource_actions": json.dumps([
            "Khasi & Garo matrilineal family caregiver peer support circles in East Khasi Hills",
            "Community walking and cognitive agility trails in Cherrapunjee & Tura",
            "Offline speech synthesis pack rollouts for remote villages"
        ])
    },
    {
        "state_code": "MZ",
        "state_name": "Mizoram",
        "enrolled_patients": 390,
        "active_caregivers": 385,
        "cognitive_stability_rate": 82.5,
        "medication_adherence_rate": 91.0,
        "rural_coverage_pct": 65.0,
        "geriatric_centers_count": 10,
        "recommended_resource_actions": json.dumps([
            "Partner with local YMA (Young Mizo Association) for community elder companionship",
            "Mobile memory assessment van for southern districts (Lunglei, Saiha)",
            "Choral & folk melody memory stimulation library expansion"
        ])
    },
    {
        "state_code": "NL",
        "state_name": "Nagaland",
        "enrolled_patients": 410,
        "active_caregivers": 395,
        "cognitive_stability_rate": 75.6,
        "medication_adherence_rate": 83.2,
        "rural_coverage_pct": 81.0,
        "geriatric_centers_count": 11,
        "recommended_resource_actions": json.dumps([
            "Tribal elder cultural storytelling archive integration in Kohima & Mokokchung",
            "Primary Health Centre nurse training on dementia reminder discrepancy logs",
            "Solar charging kits for community tablets in remote hill villages"
        ])
    },
    {
        "state_code": "SK",
        "state_name": "Sikkim",
        "enrolled_patients": 320,
        "active_caregivers": 315,
        "cognitive_stability_rate": 83.0,
        "medication_adherence_rate": 92.4,
        "rural_coverage_pct": 62.0,
        "geriatric_centers_count": 9,
        "recommended_resource_actions": json.dumps([
            "Integrate Buddhist mindfulness & Thangka visual recall puzzles for mental focus",
            "Geriatric physiotherapy and memory care integration at Gangtok Central Hospital",
            "Home-visit nurse alert monitoring system expansion"
        ])
    },
    {
        "state_code": "TR",
        "state_name": "Tripura",
        "enrolled_patients": 610,
        "active_caregivers": 590,
        "cognitive_stability_rate": 77.0,
        "medication_adherence_rate": 85.8,
        "rural_coverage_pct": 74.0,
        "geriatric_centers_count": 15,
        "recommended_resource_actions": json.dumps([
            "Kokborok & Bengali bilingual cognitive interface deployment in Dhalai & Gomati",
            "Community memory cafes in Agartala municipal parks",
            "Caregiver stress management & counseling hotline service"
        ])
    }
]

SAMPLE_PATIENTS = [
    {
        "id": "pat-ner-001",
        "name": "Biren Gogoi",
        "age": 72,
        "gender": "Male",
        "photo_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
        "state": "Assam",
        "district": "Kamrup Metropolitan (Guwahati)",
        "language": "as",
        "condition_stage": "Mild Cognitive Impairment",
        "favorite_songs": json.dumps([
            "O Mur Apunar Dekh (Bhupen Hazarika)",
            "Borgeet - Madhavdev composition",
            "Bihu folk melody (Bordoisila)"
        ]),
        "cultural_interests": json.dumps([
            "Majuli Mask Making",
            "Assam Tea Gardens & Picking",
            "Bihu Dhol & Pepa",
            "Kaziranga Rhino Wildlife",
            "Assamese Jaapi & Gamosa"
        ]),
        "favorite_poems": json.dumps([
            "Kadamoni - Lakshminath Bezbaroa",
            "Bistirno Parore - Bhupen Hazarika"
        ]),
        "medications": json.dumps([
            {"id": "med-1", "name": "Donepezil", "dosage": "5 mg", "time": "08:00 AM", "instructions": "Take with water after breakfast"},
            {"id": "med-2", "name": "Multivitamin Senior", "dosage": "1 tablet", "time": "01:00 PM", "instructions": "Take after lunch"},
            {"id": "med-3", "name": "Amlodipine (BP)", "dosage": "5 mg", "time": "08:30 PM", "instructions": "Take with warm water after dinner"}
        ]),
        "daily_routine": json.dumps([
            {"time": "07:00 AM", "activity": "Morning Garden Walk & Sunlight", "icon": "walk"},
            {"time": "08:00 AM", "activity": "Breakfast & Morning Medication", "icon": "medication"},
            {"time": "10:30 AM", "activity": "Cognitive Gaming & Memory Brain Gym", "icon": "game"},
            {"time": "01:00 PM", "activity": "Lunch & Hydration Check", "icon": "food"},
            {"time": "02:00 PM", "activity": "Rest & Relaxing Traditional Music", "icon": "rest"},
            {"time": "05:00 PM", "activity": "Evening Assam Tea & Mitra AI Chat", "icon": "chat"},
            {"time": "08:00 PM", "activity": "Dinner & Night Medication", "icon": "medication"},
            {"time": "09:30 PM", "activity": "Calm Bedtime Wind-Down", "icon": "sleep"}
        ]),
        "baseline_difficulty": 1,
        "current_difficulty": 1,
        "emergency_contact": "+91 98640 12345 (Son: Siddhartha Gogoi)"
    },
    {
        "id": "pat-ner-002",
        "name": "Thoidingjam Devi",
        "age": 68,
        "gender": "Female",
        "photo_url": "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=300&auto=format&fit=crop&q=80",
        "state": "Manipur",
        "district": "Imphal West",
        "language": "mn",
        "condition_stage": "Early Dementia",
        "favorite_songs": json.dumps([
            "Nat Sankirtan melody",
            "Pena traditional violin tune",
            "Nupi Pala devotional song"
        ]),
        "cultural_interests": json.dumps([
            "Manipuri Classical Raas Leela",
            "Loktak Lake & Phumdis",
            "Phanek Handloom Weaving",
            "Kangla Fort Heritage"
        ]),
        "favorite_poems": json.dumps([
            "Khamba Thoibi Epic Ballads",
            "Hijam Anganghal verses"
        ]),
        "medications": json.dumps([
            {"id": "med-4", "name": "Memantine", "dosage": "10 mg", "time": "09:00 AM", "instructions": "Take after morning meal"},
            {"id": "med-5", "name": "Calcium + Vitamin D3", "dosage": "500 mg", "time": "01:30 PM", "instructions": "Take after lunch"}
        ]),
        "daily_routine": json.dumps([
            {"time": "06:30 AM", "activity": "Morning Prayer & Tulsi worship", "icon": "prayer"},
            {"time": "08:30 AM", "activity": "Breakfast & Medicine", "icon": "medication"},
            {"time": "11:00 AM", "activity": "Cognitive Memory Games", "icon": "game"},
            {"time": "01:00 PM", "activity": "Nutritious Lunch", "icon": "food"},
            {"time": "04:30 PM", "activity": "Handloom Pattern Recall & Mitra Chat", "icon": "chat"},
            {"time": "08:30 PM", "activity": "Dinner & Rest", "icon": "sleep"}
        ]),
        "baseline_difficulty": 2,
        "current_difficulty": 2,
        "emergency_contact": "+91 94360 88990 (Daughter: Ibemhal Devi)"
    },
    {
        "id": "pat-ner-003",
        "name": "Lalrinawma Sailo",
        "age": 75,
        "gender": "Male",
        "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
        "state": "Mizoram",
        "district": "Aizawl",
        "language": "en",
        "condition_stage": "Moderate Dementia",
        "favorite_songs": json.dumps([
            "Lalruanga Folk Ballad",
            "Chawngchen Zai",
            "Mizo Gospel Hymns"
        ]),
        "cultural_interests": json.dumps([
            "Chapchar Kut Spring Festival",
            "Cheraw Bamboo Dance",
            "Reiek Tlang Hill Trails",
            "Mizo Puan weaving motifs"
        ]),
        "favorite_poems": json.dumps([
            "Mizo Hills Song of the Pine",
            "Laltheri leh Chutphunga"
        ]),
        "medications": json.dumps([
            {"id": "med-6", "name": "Galantamine", "dosage": "8 mg", "time": "08:30 AM", "instructions": "With morning meal"},
            {"id": "med-7", "name": "Melatonin", "dosage": "3 mg", "time": "09:30 PM", "instructions": "30 mins before bedtime"}
        ]),
        "daily_routine": json.dumps([
            {"time": "07:30 AM", "activity": "Balcony fresh air & light mobility", "icon": "walk"},
            {"time": "08:30 AM", "activity": "Breakfast & Morning Pill", "icon": "medication"},
            {"time": "10:00 AM", "activity": "Family Photo & Cultural Recognition", "icon": "game"},
            {"time": "01:00 PM", "activity": "Lunch with family", "icon": "food"},
            {"time": "05:00 PM", "activity": "Gentle Music & Storytelling with Mitra", "icon": "chat"},
            {"time": "08:00 PM", "activity": "Dinner & Night Pill", "icon": "medication"}
        ]),
        "baseline_difficulty": 1,
        "current_difficulty": 1,
        "emergency_contact": "+91 98623 44556 (Caregiver: Zodingliana)"
    }
]

SAMPLE_FAMILY_MEMBERS = [
    {
        "id": "fam-1",
        "patient_id": "pat-ner-001",
        "name": "Siddhartha Gogoi",
        "relationship": "Son",
        "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80",
        "voice_hint": "This is your elder son Siddhartha who works as an engineer in Guwahati."
    },
    {
        "id": "fam-2",
        "patient_id": "pat-ner-001",
        "name": "Ananya Gogoi",
        "relationship": "Daughter-in-law",
        "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
        "voice_hint": "This is your daughter-in-law Ananya who cooks your favorite Khar and fish curry."
    },
    {
        "id": "fam-3",
        "patient_id": "pat-ner-001",
        "name": "Aarav Gogoi",
        "relationship": "Grandson",
        "photo_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80",
        "voice_hint": "This is your 10-year-old grandson Aarav who loves playing chess with you."
    },
    {
        "id": "fam-4",
        "patient_id": "pat-ner-002",
        "name": "Ibemhal Devi",
        "relationship": "Daughter",
        "photo_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80",
        "voice_hint": "This is your daughter Ibemhal who takes you to the Govindaji temple on Sundays."
    },
    {
        "id": "fam-5",
        "patient_id": "pat-ner-002",
        "name": "Tomba Singh",
        "relationship": "Brother",
        "photo_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80",
        "voice_hint": "This is your younger brother Tomba who lives near Loktak Lake."
    }
]

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Seed Government Regional Stats
    cursor.execute("DELETE FROM government_regional_stats")
    for row in NER_STATES_DATA:
        cursor.execute("""
        INSERT INTO government_regional_stats 
        (state_code, state_name, enrolled_patients, active_caregivers, cognitive_stability_rate, medication_adherence_rate, rural_coverage_pct, geriatric_centers_count, recommended_resource_actions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            row["state_code"], row["state_name"], row["enrolled_patients"], row["active_caregivers"],
            row["cognitive_stability_rate"], row["medication_adherence_rate"], row["rural_coverage_pct"],
            row["geriatric_centers_count"], row["recommended_resource_actions"]
        ))

    # Seed Patients
    cursor.execute("DELETE FROM patients")
    for pat in SAMPLE_PATIENTS:
        cursor.execute("""
        INSERT INTO patients 
        (id, name, age, gender, photo_url, state, district, language, condition_stage, favorite_songs, cultural_interests, favorite_poems, medications, daily_routine, baseline_difficulty, current_difficulty, emergency_contact)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pat["id"], pat["name"], pat["age"], pat["gender"], pat["photo_url"], pat["state"],
            pat["district"], pat["language"], pat["condition_stage"], pat["favorite_songs"],
            pat["cultural_interests"], pat["favorite_poems"], pat["medications"], pat["daily_routine"],
            pat["baseline_difficulty"], pat["current_difficulty"], pat["emergency_contact"]
        ))

    # Seed Family Members
    cursor.execute("DELETE FROM family_members")
    for fam in SAMPLE_FAMILY_MEMBERS:
        cursor.execute("""
        INSERT INTO family_members (id, patient_id, name, relationship, photo_url, voice_hint)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (fam["id"], fam["patient_id"], fam["name"], fam["relationship"], fam["photo_url"], fam["voice_hint"]))

    # Generate 1-Month of Historical Game Sessions for Patient 1 (Biren Gogoi)
    cursor.execute("DELETE FROM game_sessions")
    now = datetime.now()
    game_types = ["memory_recall", "attention_focus", "pattern_recognition", "family_photo", "cultural_objects"]
    
    for day_offset in range(30, -1, -1):
        session_time = now - timedelta(days=day_offset, hours=random.randint(1, 4), minutes=random.randint(5, 55))
        # 1-2 games per day
        sessions_today = random.randint(1, 2)
        for _ in range(sessions_today):
            gtype = random.choice(game_types)
            diff = 1 if day_offset > 15 else random.choice([1, 2])
            
            # Simulate high stability with occasional minor dip
            if day_offset in [3, 4]:
                acc = random.uniform(50.0, 65.0)
                rt = random.uniform(14.0, 19.5)
                score = int(acc / 10)
                adj = 1
                reason = "Reduced difficulty from Level 2 to Level 1 due to lower accuracy (<60%) and response time (16.8s)."
            else:
                acc = random.uniform(75.0, 100.0)
                rt = random.uniform(6.5, 11.0)
                score = int(acc / 10)
                adj = 2 if acc > 85 and rt < 8.5 else diff
                reason = "Performance consistent with Level 1 baseline" if adj == 1 else "Elevated difficulty to Level 2 based on fast response (<8.5s) and 90%+ accuracy."

            cursor.execute("""
            INSERT INTO game_sessions 
            (id, patient_id, game_type, difficulty_level, score, max_score, accuracy_pct, avg_response_time_sec, level_adjusted_to, adaptation_reason, timestamp, synced_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"gs-{uuid.uuid4().hex[:8]}", "pat-ner-001", gtype, diff, score, 10,
                round(acc, 1), round(rt, 1), adj, reason,
                session_time.strftime("%Y-%m-%d %H:%M:%S"),
                session_time.strftime("%Y-%m-%d %H:%M:%S")
            ))

    # Generate Reminder Logs (with 90s rule discrepancy tracking)
    cursor.execute("DELETE FROM reminder_logs")
    categories = ["medication", "hydration", "food", "doctor_appointment"]
    
    for day_offset in range(30, -1, -1):
        day_date = now - timedelta(days=day_offset)
        
        # Morning Med
        m_time = day_date.replace(hour=8, minute=0, second=0)
        # Most on time within 90s, some after followup, occasional delay
        roll = random.random()
        if roll < 0.75:
            stat = "acknowledged_on_time"
            rt = random.uniform(15.0, 75.0)
            note = "Patient took medication within 90s processing window without interruption."
            f_sent = 0
            ack_at = (m_time + timedelta(seconds=int(rt))).strftime("%Y-%m-%d %H:%M:%S")
        elif roll < 0.90:
            stat = "acknowledged_after_followup"
            rt = random.uniform(95.0, 140.0)
            note = "Follow-up chime played at 90s. Patient acknowledged following gentle reminder."
            f_sent = 1
            ack_at = (m_time + timedelta(seconds=int(rt))).strftime("%Y-%m-%d %H:%M:%S")
        elif roll < 0.96:
            stat = "no_response_90s"
            rt = 180.0
            note = "No response after initial 90s window and follow-up. Caregiver notified."
            f_sent = 1
            ack_at = None
        else:
            stat = "confused_response"
            rt = 110.0
            note = "Patient indicated confusion about morning pill name. Caregiver stepped in."
            f_sent = 1
            ack_at = (m_time + timedelta(seconds=int(rt))).strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute("""
        INSERT INTO reminder_logs 
        (id, patient_id, category, title, description, scheduled_time, acknowledged_at, response_time_sec, status, followup_sent, discrepancy_note, timestamp, synced_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"rem-{uuid.uuid4().hex[:8]}", "pat-ner-001", "medication", "Morning Donepezil 5mg",
            "Take with water after breakfast", m_time.strftime("%Y-%m-%d %H:%M:%S"),
            ack_at, round(rt, 1) if rt else None, stat, f_sent, note,
            m_time.strftime("%Y-%m-%d %H:%M:%S"), m_time.strftime("%Y-%m-%d %H:%M:%S")
        ))

        # Afternoon Hydration
        h_time = day_date.replace(hour=14, minute=30, second=0)
        cursor.execute("""
        INSERT INTO reminder_logs 
        (id, patient_id, category, title, description, scheduled_time, acknowledged_at, response_time_sec, status, followup_sent, discrepancy_note, timestamp, synced_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"rem-{uuid.uuid4().hex[:8]}", "pat-ner-001", "hydration", "Hydration - Glass of Warm Water",
            "Drink 1 full glass of water or herbal tea", h_time.strftime("%Y-%m-%d %H:%M:%S"),
            (h_time + timedelta(seconds=35)).strftime("%Y-%m-%d %H:%M:%S"),
            35.2, "acknowledged_on_time", 0, "Patient acknowledged promptly.",
            h_time.strftime("%Y-%m-%d %H:%M:%S"), h_time.strftime("%Y-%m-%d %H:%M:%S")
        ))

    # Seed Caregiver Alerts
    cursor.execute("DELETE FROM alerts")
    alerts_data = [
        {
            "id": "alt-1",
            "patient_id": "pat-ner-001",
            "alert_type": "performance_decline",
            "title": "Cognitive Accuracy Shift Detected",
            "message": "Biren's memory recall game accuracy dipped to 55% during yesterday's evening session. AI adaptive difficulty has lowered level to Level 1 to prevent frustration.",
            "severity": "medium",
            "is_read": 0,
            "timestamp": (now - timedelta(days=2, hours=3)).strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "id": "alt-2",
            "patient_id": "pat-ner-001",
            "alert_type": "missed_medication",
            "title": "Medication Follow-up Alert",
            "message": "Morning Donepezil 5mg required a 90-second follow-up prompt before confirmation was logged.",
            "severity": "low",
            "is_read": 1,
            "timestamp": (now - timedelta(days=5, hours=6)).strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "id": "alt-3",
            "patient_id": "pat-ner-001",
            "alert_type": "routine_gap",
            "title": "Great Routine Adherence This Week!",
            "message": "Biren completed 6 out of 7 scheduled cognitive game sessions this week (85.7% weekly adherence).",
            "severity": "low",
            "is_read": 0,
            "timestamp": (now - timedelta(hours=8)).strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
    for alt in alerts_data:
        cursor.execute("""
        INSERT INTO alerts (id, patient_id, alert_type, title, message, severity, is_read, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (alt["id"], alt["patient_id"], alt["alert_type"], alt["title"], alt["message"], alt["severity"], alt["is_read"], alt["timestamp"]))

    # Seed Doctor Notes
    cursor.execute("DELETE FROM doctor_notes")
    doc_notes = [
        {
            "id": "dn-1",
            "patient_id": "pat-ner-001",
            "doctor_name": "Dr. Pranjal Baruah, MD (Geriatric Neurologist, GMCH Guwahati)",
            "note_text": "Reviewed 1-month cognitive trajectory. Patient maintains stable visual recall in NER cultural games (Jaapi/Bihu motifs). 90-second response latency remains steady around 10-14 seconds.",
            "recommendation": "Continue Donepezil 5mg. Maintain daily 15-minute voice companion interaction and morning sunlight routine. Next clinical review in 4 weeks.",
            "timestamp": (now - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "id": "dn-2",
            "patient_id": "pat-ner-001",
            "doctor_name": "Dr. Pranjal Baruah, MD",
            "note_text": "Initial baseline calibration completed. Assigned difficulty Level 1. Caregiver instructed on 90s uninterrupted reminder window protocol.",
            "recommendation": "Prescribed Donepezil 5mg post breakfast. Caregiver briefed on non-intrusive reminder tracking.",
            "timestamp": (now - timedelta(days=32)).strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
    for dn in doc_notes:
        cursor.execute("""
        INSERT INTO doctor_notes (id, patient_id, doctor_name, note_text, recommendation, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (dn["id"], dn["patient_id"], dn["doctor_name"], dn["note_text"], dn["recommendation"], dn["timestamp"]))

    conn.commit()
    conn.close()
    print("Database seeded with rich NER dementia datasets successfully.")

if __name__ == "__main__":
    seed_database()
