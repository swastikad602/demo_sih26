# AI-Based Cognitive Gaming & Memory Assistance Platform (SIH26003)

An offline-first, mobile and tablet-optimized AI-assisted cognitive gaming and memory assistance platform designed specifically for elderly dementia patients in India's **North Eastern Region (NER)** (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura).

---

## 🌟 Key Architecture & Features

### 1. Four Distinct Role Interfaces & Agents
1. **👴 Patient Interface (Elderly & Dementia-Optimized)**
   - **Tactile High-Accessibility UI**: Extra-large touch targets (>=64-80px), high-contrast text, calming palettes.
   - **Voice-First Interaction**: Web Speech Synthesis (TTS) and voice recognition mic on every screen.
   - **Multilingual NER Support**: English, Assamese (অসমীয়া), Bengali (বাংলা), Manipuri / Meitei (মৈতৈলোন্), Hindi (हिन्दी).
   - **5 Interactive Cognitive Games**:
     1. *Memory Recall*: Flip card pair-matching with authentic cultural items.
     2. *Attention & Concentration*: Target identification among distractors.
     3. *Pattern Recognition*: Traditional NER textile weave motifs (Gamosa, Mizo Puan, Manipuri Phanek).
     4. *Family Member Photo Recall*: Personalized family photo recognition with voice hints.
     5. *NER Cultural Heritage*: Authentic heritage objects and festivals across all 8 NER states.
   - **AI Adaptive Difficulty Engine**: Transparent performance tracking (accuracy % and response time latency). Automatically reduces difficulty to prevent frustration and increases for cognitive mastery with an explainability modal.
   - **90-Second Non-Intrusive Reminder System**: 90s calm processing window without interruptions, followed by post-90s follow-up chime and discrepancy audit logging.
   - **Mitra AI Personal Companion**: Voice-first companion reciting favorite NER songs, poems, and nostalgic stories.

2. **🧑‍⚕️ Caregiver Interface**
   - Live Alert Banner flagging noticeable cognitive drops (>20% accuracy decline) or missed medication.
   - Real-time patient progress KPI dashboard and routine timeline.
   - **Single-Delivery Reminders**: Caregiver receives scheduled reminder alerts *only once* (no 90s repeat loop) to avoid alert fatigue.
   - Profile & routine management.

3. **🩺 Doctor / Healthcare Provider Interface**
   - Time-based clinical monitoring: **1-Week** and **1-Month** longitudinal progress summaries.
   - Cognitive domain breakdown across all 5 cognitive exercise areas.
   - **Discrepancy Audit Log Inspector**: In-depth audit table tracking reminder reaction latencies, delays, and confusion occurrences.
   - Clinical consultation notes recorder with prescription adjustment notes.
   - Statutory Clinical Decision Support disclaimer.

4. **🏛️ Government & Public Health Interface**
   - Aggregate, de-identified population analytics across all **8 NER States** (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura).
   - Interactive regional state cards, cognitive stability rates, rural coverage metrics, and memory center counts.
   - AI-assisted resource allocation recommendations (e.g. mobile geriatric clinics in hill districts).
   - One-click de-identified dataset export in both **CSV** and **JSON** formats.

---

## 📴 Offline-First & Background Sync Engine
- **Local Storage**: IndexedDB database stores all patient records, game sessions, reminder logs, alerts, and doctor notes locally on the device.
- **Sync Outbox Queue**: All offline actions are queued in a local outbox.
- **Background Sync**: Flushes batch updates to `/api/sync/batch` automatically when connectivity returns.
- **Simulated Network Toggle**: Interactive status pill in top navigation allowing one-click testing of Offline vs Online mode.

---

## 🚀 Quick Start Instructions

### Prerequisites
- Python 3.10+ (FastAPI, Uvicorn, SQLite3)

### Running the Application
```bash
python run_app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:8000
```

- Web App: `http://127.0.0.1:8000`
- REST API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`

---

## 🧪 Testing & Verification
Run the automated test suite:
```bash
python backend/verify_backend.py
```
