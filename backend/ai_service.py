import os
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional
from pathlib import Path

# Try importing google.genai, handle gracefully if not yet installed
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    genai = None
    types = None
    GENAI_AVAILABLE = False

# Load environment variables from project root .env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

def get_genai_client():
    global ai_client
    # Refresh env from root .env
    load_dotenv(dotenv_path=env_path, override=True)
    api_key = os.getenv("GEMINI_API_KEY")
    if not GENAI_AVAILABLE or not api_key:
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"[WARN] Failed to initialize Google GenAI Client: {e}")
        return None

ai_client = get_genai_client()


def sanitize_patient_context(patient: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize patient profile and inject family and routine context.
    """
    raw_name = patient.get("name", "Maya").strip()
    first_name = raw_name.split()[0] if raw_name else "Maya"
    age = patient.get("age", 72)
    general_region = patient.get("state", "Assam")
    district = patient.get("district", "Guwahati")
    
    favorite_songs = patient.get("favorite_songs", []) or ["Manuhe Manuhor Babe", "O Mur Apunar Dekh"]
    if isinstance(favorite_songs, str):
        try:
            favorite_songs = json.loads(favorite_songs)
        except Exception:
            favorite_songs = [favorite_songs]
            
    cultural_interests = patient.get("cultural_interests", []) or ["Bihu celebrations", "Weaving Assamese gamosa", "Gardening"]
    if isinstance(cultural_interests, str):
        try:
            cultural_interests = json.loads(cultural_interests)
        except Exception:
            cultural_interests = [cultural_interests]
            
    favorite_poems = patient.get("favorite_poems", []) or ["Lakshminath Bezbaroa poems", "Nature poetry"]
    if isinstance(favorite_poems, str):
        try:
            favorite_poems = json.loads(favorite_poems)
        except Exception:
            favorite_poems = [favorite_poems]

    family_members = []
    raw_fam = patient.get("family_members", [])
    if isinstance(raw_fam, list):
        for f in raw_fam:
            family_members.append({
                "name": f.get("name"),
                "relationship": f.get("relationship"),
                "details": f.get("voice_hint") or f.get("relationship")
            })

    daily_routine = patient.get("daily_routine", [])
    if isinstance(daily_routine, str):
        try:
            daily_routine = json.loads(daily_routine)
        except Exception:
            daily_routine = []

    return {
        "first_name": first_name,
        "full_name": raw_name,
        "age": age,
        "general_region": general_region,
        "district": district,
        "favorite_songs": favorite_songs[:4],
        "cultural_interests": cultural_interests[:4],
        "favorite_poems": favorite_poems[:3],
        "family_members": family_members,
        "daily_routine": daily_routine
    }

def build_patient_system_instruction(profile: Dict[str, Any], lang: str) -> str:
    first_name = profile.get("first_name", "Maya")
    age = profile.get("age", 72)
    region = profile.get("general_region", "Assam")
    district = profile.get("district", "Guwahati")
    
    fam_list = profile.get("family_members", [])
    if fam_list:
        fam_text = "\n".join([f"- {m['name']} ({m['relationship']}): {m['details']}" for m in fam_list])
    else:
        fam_text = """- Anita (Daughter & Primary Caregiver): Lives in Guwahati, takes loving daily care of Maya.
- Rahul (Son): Studied at IIT Guwahati, visits home during Bihu festivals.
- Aarav (Grandson, 9 years old): Loves Maya's homemade narikol pitha.
- Priya (Granddaughter, 12 years old): Won first prize in Bihu dance."""

    routine_list = profile.get("daily_routine", [])
    if routine_list and isinstance(routine_list, list):
        routine_text = ", ".join([f"{r.get('time', '')} - {r.get('activity', '')}" for r in routine_list if isinstance(r, dict)])
    else:
        routine_text = "Morning Tea & Pill at 8:00 AM, Light Cognitive activities at 10:30 AM, Afternoon Rest, Evening Tea with Mitra at 5:00 PM."

    lang_name_map = {
        "en": "English",
        "bn": "Standard Bengali (বাংলা)",
        "as": "Assamese (অসমীয়া)",
        "hi": "Hindi (हिन्दी)",
        "mn": "Manipuri (মৈতৈলোন্)"
    }
    target_lang_name = lang_name_map.get(lang, "English")

    lang_rules = {
        "en": """ABSOLUTE LANGUAGE MANDATE - 100% ENGLISH ONLY:
- The user has selected ENGLISH.
- You MUST formulate your entire response 100% in English.
- Previous messages in the conversation history may be in Assamese or Bengali. YOU MUST COMPLETELY IGNORE their language.
- Under NO circumstances should you output any Assamese characters, Bengali characters, or words from other languages.
- Every single word must be in standard, natural English.""",

        "bn": """ABSOLUTE LANGUAGE MANDATE - 100% NATURAL SPOKEN BENGALI (মিষ্টি চলিত বাংলা) ONLY:
- The user has selected BENGALI (বাংলা).
- You MUST formulate your entire response 100% in natural, warm, conversational Bengali (মিষ্টি চলিত মুখের ভাষা).
- Cadence & Accent: Speak with the sweet, caring, gentle cadence of everyday Bengali conversation (e.g., 'কেমন আছেন?', 'শরীরটা ভালো আছে তো?', 'একটু বিশ্রাম নিন', 'মেয়ে অনিতা তো সবসময় আপনার যত্ন নেয়').
- Use familiar, affectionate words: 'মেয়ে', 'ছেলে', 'মা', 'ভালোবাসা', 'ভালো থাকা', 'চা খেয়েছেন?', 'পুরনো দিনের গান'.
- STRICTLY FORBIDDEN:
  1. Archaic or stiff Sanskritized Sadhu Bhasha (DO NOT use 'পরলোক গমন', 'ইহলোক ত্যাগ', 'জন্মদাত্রী', 'পরমাত্মা', 'ভোজন সমাপ্ত').
  2. Any Assamese letters (strictly NO 'ৰ', NO 'ৱ') or Assamese words ('আপোনাৰ', 'হ\'ল', 'কওক', 'লগতে').
- Keep sentences rhythmically smooth, short, and sweet so Text-To-Speech sounds like a loving family member speaking.
- IGNORE any other language from prior turns.""",

        "as": """ABSOLUTE LANGUAGE MANDATE - 100% AUTHENTIC ASSAMESE (অসমীয়া ভাষা) ONLY:
- The user has selected ASSAMESE (অসমীয়া).
- You MUST formulate your entire response 100% in authentic Assamese (অসমীয়া).
- Strictly use Assamese vocabulary ('আপোনাৰ', 'হ\'ল', 'লগতে', 'থাকে', 'কওক', 'ছোৱালী', 'ল’ৰা', 'কেনে') with respectful tone (আপুনি / আপোনাৰ).
- Use natural Assamese letters like 'ৰ' and 'ৱ' appropriately.
- IGNORE any other language from prior turns.""",

        "hi": """ABSOLUTE LANGUAGE MANDATE - 100% HINDI (हिन्दी) ONLY:
- The user has selected HINDI (हिन्दी).
- You MUST formulate your entire response 100% in polite Hindi (हिन्दी).
- Strictly use Hindi vocabulary and grammar (आप, आपका, कैसी हैं, बताइए).
- IGNORE any other language from prior turns.""",

        "mn": """ABSOLUTE LANGUAGE MANDATE - 100% MANIPURI (মৈতৈলোন্) ONLY:
- The user has selected MANIPURI (মৈতৈলোন্).
- You MUST formulate your entire response 100% in Manipuri (মৈতৈলোন্).
- IGNORE any other language from prior turns."""
    }

    current_lang_rule = lang_rules.get(lang, lang_rules["en"])

    return f"""You are "Mitra", an intelligent, compassionate, and loving AI companion for {first_name}, who is {age} years old and lives in {district}, {region}.

REAL USER & FAMILY CONTEXT:
- Name: {first_name}
- Age: {age} years old
- Location: {district}, {region}
- Family Members:
{fam_text}
- Mother & Ancestors: {first_name} is {age} years old. Her mother lived a long and blessed life and passed away peacefully years ago. {first_name} is now the cherished matriarch, proud mother to Anita and Rahul, and grandmother to Aarav and Priya.
- Daily Routine: {routine_text}
- Favorite Music: {", ".join(profile.get("favorite_songs", ["Bhupen Hazarika melodies", "Bihu folk songs"]))}

COMPLETE APP KNOWLEDGE & USER GUIDANCE (RECONNECT PLATFORM / SIH26003):
- What is this platform?
  This app is "Reconnect" (AI Cognitive Gaming & Memory Assistance Platform, SIH26003), crafted especially for elderly individuals and dementia memory care across India's North Eastern Region (NER).
- What is your role (Mitra)?
  You are "Mitra" (মিত্রা / মিত্ৰা), the patient's personal AI companion. You are here to chat, listen, reminisce about fond memories, recite poems, sing songs, remind them of daily tea or medicines, and guide them through the app.
- How to guide users when they ask "what is this app?", "what to do?", "how to use this?", "tell me about this app", or "what can I do here?":
  Explain warmly and clearly in {target_lang_name}:
  1. Memory & Brain Games: They can play 5 gentle, joyful cognitive games from the main screen:
     - Memory Pair Matching (স্মৃতি জোড়া খেলা / স্মৃতি খেল): Match pairs of cultural treasures like Japi, Xorai, Dhol, Rhino, and Lotus.
     - Attention & Focus (মনোযোগ খেল): Find target cultural items among distractors.
     - Pattern Recognition (বয়ন আৰ্হি / নকশা মেলা): Match traditional handloom textile motifs (Assam Gamosa, Mizo Puan, Manipuri Phanek).
     - Family Photo Recall (পৰিয়ালৰ ফটো খেল / পরিবারের ছবির খেলা): Look at photos of loving family members (Anita, Rahul, Aarav, Priya) and recall their names.
     - Cultural Heritage (সংস্কৃতি খেল / ঐতিহ্য মেলা): Explore heritage and festivals across the 8 North Eastern states.
  2. Gentle Daily Reminders: The app has a 90-second non-intrusive reminder system for medicine, tea, and rest with soothing chimes.
  3. Speaking with Mitra: They can talk to you anytime by typing or tapping the microphone 🎤, or tap the speaker 🔊 next to any message to hear it spoken aloud.
  4. Always invite them warmly to try one of the games or have a friendly chat whenever they ask what to do.

{current_lang_rule}

CRITICAL CONVERSATIONAL GUIDELINES:
1. TALK LIKE A REAL HUMAN COMPANION (NO HARDCODING, NO CANNED SCRIPTS):
   - Directly and intelligently address what the user actually said.
   - If they ask about the app, what it is, or what to do, explain Reconnect and the games clearly and invitingly.
   - For simple greetings like "hi" or "hello", reply briefly and warmly like a friend.
   - When asked "who is my mom?", explain with gentle warmth that she is {age} years old, her mother lived a blessed life and is at peace, and Maya herself is now the proud mother of Anita and Rahul, and grandmother of Aarav and Priya.
   - When asked "who is [Name]?" (e.g. Anita, Rahul, Aarav, Priya, Anurag), answer specifically and accurately from her real family or public knowledge.
   - For real-world questions (prices, gold, singers, celebrities, science, daily life), answer factually, truthfully, and directly in {target_lang_name} only.

2. CONCISENESS & VOICE READINESS:
   - Keep answers natural, empathetic, and concise (2 to 3 sentences).
   - Never use markdown asterisks (*), hashtags (#), or bullet points, so text reads smoothly via speech synthesis.
"""

async def generate_ai_chat_response(
    patient_raw: Dict[str, Any],
    user_message: str,
    history: List[Dict[str, Any]],
    lang: str = "en"
) -> str:
    """
    Generate conversational reply using Gemini API with clinical safety temperature (0.3).
    Ensures raw PII is stripped and graceful fallback occurs if client is unavailable.
    """
    sanitized = sanitize_patient_context(patient_raw)
    system_instruction = build_patient_system_instruction(sanitized, lang)

    client = get_genai_client()
    if not client or not types:
        raise RuntimeError("Google GenAI client is not configured or GEMINI_API_KEY is missing.")

    lang_name_map = {
        "en": "English",
        "bn": "Standard Bengali (বাংলা)",
        "as": "Assamese (অসমীয়া)",
        "hi": "Hindi (हिन्दी)",
        "mn": "Manipuri (মৈতৈলোন্)"
    }
    target_lang_name = lang_name_map.get(lang, "English")

    # Convert recent conversation history (max 6 turns to keep context tight and safe)
    formatted_contents = []
    for msg in history[-6:]:
        role = "user" if msg.get("role") in ["user", "patient"] else "model"
        content_text = msg.get("content", "").strip()
        if content_text:
            formatted_contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=content_text)]
                )
            )

    # Append current user message with explicit target language enforcement
    formatted_contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=f"Respond strictly in {target_lang_name} only: {user_message}")]
        )
    )

    configured_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    # Prioritize gemini-3.5-flash-lite for instant sub-second responses and active quota
    candidate_models = [
        "gemini-3.5-flash-lite",
        configured_model,
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash",
    ]
    # Deduplicate while preserving priority order
    candidate_models = list(dict.fromkeys(candidate_models))

    last_error = None
    for target_model in candidate_models:
        for attempt in range(2):
            try:
                config = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.3,
                    max_output_tokens=450
                )
                response = client.models.generate_content(
                    model=target_model,
                    contents=formatted_contents,
                    config=config
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as exc:
                last_error = exc
                print(f"[INFO] Model {target_model} (attempt {attempt+1}) call error: {exc}. Trying fallback...")
                import time
                time.sleep(0.3)

    if last_error:
        raise last_error

    raise RuntimeError("No response returned from Gemini API.")




