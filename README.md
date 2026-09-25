# AI-Based Cognitive Gaming & Memory Assistance Platform (SIH26003)

An offline-first, mobile- and tablet-optimized AI-assisted cognitive gaming and memory assistance platform designed specifically for elderly dementia patients in India's **North Eastern Region (NER)** (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura).

---

## 🌟 Key Architecture & Features

### 1. Four Distinct Role Interfaces & Agents

1. **👴 Patient Interface (Elderly & Dementia-Optimized)**
   - **Tactile High-Accessibility UI**: Extra-large touch targets ($\ge$64–80px), high-contrast text, calming palettes, and physical mobile/tablet simulator viewports.
   - **Voice-First Interaction**: Speech synthesis (TTS) and voice recognition microphone on every interaction screen.
   - **Multilingual Support (NER & National Languages)**:
     - **অসমীয়া (Assamese)**: Authentic regional vocabulary, script support, and cultural grounding.
     - **বাংলা (Bengali)**: Native West Bengal/Kolkata spoken cadence (চলিত মুখের ভাষা) with high-fidelity neural audio.
     - **English (EN)**: Clear, accessible English phrasing.
     - **हिन्दी (Hindi)**: Polite, respectful Indian phrasing.
     - **মৈতৈলোন্ (Manipuri / Meitei)**: Culturally aligned regional script and dialect support.
   - **Mitra AI Personal Companion**:
     - Voice-first companion reciting favorite NER folk songs, poetry, nostalgic stories, and family memories.
     - **Comprehensive Platform Guidance**: Mitra explains the app, games, reminders, and daily routine warmly whenever asked.
     - **Strict Language Isolation**: Contextually separated multilingual conversations preventing cross-language context bleeding.
     - **Native, Clean Companion Experience**: Clean, distraction-free bubble UI without third-party AI watermarks.
     - **Defined & Ergonomic Window**: Crisp `2px solid #7C3AED` border with layered elevation shadow and responsive sizing that fits phone frames without scrollbar clipping.
   - **5 Interactive Culturally Grounded Cognitive Games**:
     1. *Memory Recall*: Flip-card pair matching with authentic cultural items (Jaapi, Xorai, Dhol, Rhino, Lotus).
     2. *Attention & Concentration*: Target identification among distractors.
     3. *Pattern Recognition*: Traditional NER textile weave motifs (Assam Gamosa, Mizo Puan, Manipuri Phanek).
     4. *Family Member Photo Recall*: Personalized family photo recognition with voice hints (Anita, Rahul, Aarav, Priya).
     5. *NER Cultural Heritage*: Authentic heritage objects and festivals across all 8 NER states.
   - **AI Adaptive Difficulty Engine**: Transparent performance tracking (accuracy % and response time latency). Automatically reduces difficulty to prevent frustration and increases for cognitive mastery with an explainability breakdown.
   - **90-Second Non-Intrusive Reminder System**: 90s calm processing window without repetitive alarms, followed by a gentle post-90s follow-up chime and discrepancy audit logging.

2. **🧑‍⚕️ Caregiver Interface**
   - Live Alert Banner flagging noticeable cognitive drops (>20% accuracy decline) or missed medication.
   - Real-time patient progress KPI dashboard and routine timeline.
   - **Single-Delivery Reminders**: Caregivers receive scheduled reminder alerts *only once* (no 90s repeat loop) to avoid alert fatigue.
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
   - AI-assisted resource allocation recommendations (e.g., mobile geriatric clinics in hill districts).
   - One-click de-identified dataset export in both **CSV** and **JSON** formats.

---

### 2. High-Fidelity Dual-Tier Audio & Neural TTS Engine

- **Dedicated Neural TTS API (`/api/tts`)**:
  - Integrated Microsoft Neural Speech Synthesis (`edge-tts`) into the FastAPI backend.
  - **Bengali (`bn-IN`)**: `bn-IN-TanishaaNeural` — authentic West Bengal / Kolkata native tone and warm emotional cadence.
  - **Hindi (`hi-IN`)**: `hi-IN-SwaraNeural` — natural conversational prosody.
  - **English (`en-IN`)**: `en-IN-NeerjaNeural` — clear Indian English accent.
- **Dual-Tier Offline/Online Audio Strategy**:
  - **Online**: Streams high-fidelity neural audio for realistic human companionship.
  - **Offline**: Seamless, instant fallback to browser Web Speech API (`SpeechSynthesisUtterance`), ensuring uninterrupted voice prompts in remote areas.

---

### 3. 📴 Offline-First & Background Sync Engine

- **Local Storage**: IndexedDB database stores all patient records, game sessions, reminder logs, alerts, and doctor notes locally on the device.
- **Sync Outbox Queue**: All offline actions are queued in a local outbox.
- **Background Sync**: Flushes batch updates to `/api/sync/batch` automatically when connectivity returns.
- **Simulated Network Toggle**: Interactive status pill in top navigation allowing one-click testing of Offline vs. Online mode.

---

## 🚀 Quick Start Instructions

### Prerequisites
- **Python 3.10+** (FastAPI, Uvicorn, SQLite3)
- **Node.js 18+** *(optional, for `npm run dev` script)*
- **Google Gemini API Key** *(for Mitra AI companion features)*

---

### 1. Clone & Setup Environment

```bash
git clone https://github.com/swastikad602/demo_sih26.git
cd demo_sih26
```

#### Install Python Dependencies:
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables:
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Open `.env` and set your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

---

### 2. Running the Application

You can start the server using either npm or python:

#### Using npm:
```bash
npm run dev
```

#### Or directly via Python:
```bash
python run_app.py
```

The application will initialize the SQLite database (`backend/dementia_platform.db`) automatically and start the server.

---

### 3. Accessing the Platform

Open your browser and navigate to:

- **Web Application**: [http://localhost:8000](http://localhost:8000) or [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive REST API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative Redoc API Reference**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🧪 Testing & Verification

Run the end-to-end and API verification test suites:

#### End-to-End Suite:
```bash
python verify_e2e.py
```

#### Backend API & Chat Companion Tests:
```bash
python backend/verify_backend.py
python backend/test_chat_api.py
```
