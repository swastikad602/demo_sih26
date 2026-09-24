import unittest
from ai_service import (
    sanitize_patient_context,
    build_patient_system_instruction,
    MODEL_NAME
)
from schemas import ChatRequestSchema, ChatMessageItem, ChatResponseSchema

class TestChatbotBackend(unittest.TestCase):
    def test_pii_sanitization(self):
        raw_patient = {
            "id": "pat-ner-001",
            "name": "Biren Gogoi",
            "age": 72,
            "gender": "Male",
            "state": "Assam",
            "district": "Kamrup Metropolitan",
            "emergency_contact": "+91 98640 12345",
            "condition_stage": "Mild Cognitive Impairment",
            "medications": [{"name": "Donepezil", "dosage": "5 mg"}],
            "favorite_songs": ["O Mur Apunar Dekh", "Borgeet"]
        }

        sanitized = sanitize_patient_context(raw_patient)

        # 1. Ensure first name only
        self.assertEqual(sanitized["first_name"], "Biren")
        self.assertNotIn("Gogoi", sanitized["first_name"])

        # 2. Ensure general region only, no district
        self.assertEqual(sanitized["general_region"], "Assam")
        self.assertNotIn("district", sanitized)
        self.assertNotIn("Kamrup", str(sanitized))

        # 3. Ensure DB ID and contact info are stripped
        self.assertNotIn("id", sanitized)
        self.assertNotIn("pat-ner-001", str(sanitized))
        self.assertNotIn("emergency_contact", sanitized)
        self.assertNotIn("+91", str(sanitized))
        self.assertNotIn("Donepezil", str(sanitized))

    def test_system_instruction_guardrails(self):
        sanitized = {
            "first_name": "Biren",
            "general_region": "Assam",
            "favorite_songs": ["O Mur Apunar Dekh"],
            "cultural_interests": ["Bihu Festival"],
            "favorite_poems": ["Kadamoni"]
        }

        prompt = build_patient_system_instruction(sanitized, "as")

        # Verify Repetition Protocol tweak
        self.assertIn("If the patient repeats a question, answer it with the exact same warmth and patience", prompt)
        self.assertIn("Never point out that they have asked it before", prompt)

        # Verify dementia safety & tone
        self.assertIn("Never provide medical diagnosis", prompt)
        self.assertIn("Dementia Safety & Reassurance", prompt)
        self.assertIn("Voice-Readiness", prompt)

    def test_chat_schema_validation(self):
        req = ChatRequestSchema(
            patient_id="pat-ner-001",
            message="Sing a song for me please",
            language="en",
            conversation_history=[
                ChatMessageItem(role="user", content="Hello Mitra")
            ]
        )
        self.assertEqual(req.patient_id, "pat-ner-001")
        self.assertEqual(len(req.conversation_history), 1)

        res = ChatResponseSchema(
            reply="Hello Biren! Here is a lovely folk tune for you.",
            language="en",
            timestamp="10:30 AM",
            suggested_chips=["Sing a song", "Recite poem"],
            source="offline_fallback"
        )
        self.assertEqual(res.source, "offline_fallback")
        self.assertEqual(len(res.suggested_chips), 2)

if __name__ == "__main__":
    unittest.main()

