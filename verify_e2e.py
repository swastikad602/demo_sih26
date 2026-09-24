import urllib.request
import json
import time
import subprocess
import sys
from pathlib import Path

def test_e2e():
    print("[*] Starting backend server for E2E verification...")
    proc = subprocess.Popen([sys.executable, "run_app.py"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(5) # Wait for server to bind to port 8000

    
    try:
        # 1. Test Static Index serving
        req = urllib.request.urlopen("http://127.0.0.1:8000/")
        assert req.status == 200, f"Expected 200, got {req.status}"
        html_content = req.read().decode('utf-8')
        assert "RECONNECT" in html_content
        print("[OK] Static index.html served successfully (RECONNECT original UI).")


        # 2. Test API Health
        req_health = urllib.request.urlopen("http://127.0.0.1:8000/api/health")
        assert req_health.status == 200
        health_data = json.loads(req_health.read().decode('utf-8'))
        assert health_data["status"] == "online"
        assert health_data["ner_states_supported"] == 8
        print("[OK] REST API Health check passed.")

        # 3. Test Patients Endpoint
        req_pats = urllib.request.urlopen("http://127.0.0.1:8000/api/patients")
        assert req_pats.status == 200
        pats_data = json.loads(req_pats.read().decode('utf-8'))
        assert len(pats_data) >= 1
        print(f"[OK] Successfully retrieved {len(pats_data)} patient records from database.")

        # 4. Test Doctor 1-Week & 1-Month Analytics
        req_doc_1w = urllib.request.urlopen("http://127.0.0.1:8000/api/doctor/analytics/pat-ner-001?timeframe=1w")
        assert req_doc_1w.status == 200
        doc_1w = json.loads(req_doc_1w.read().decode('utf-8'))
        assert doc_1w["timeframe"] == "1w"
        assert len(doc_1w["domain_analysis"]) == 5
        print("[OK] Doctor 1-Week clinical analytics endpoint validated.")

        req_doc_1m = urllib.request.urlopen("http://127.0.0.1:8000/api/doctor/analytics/pat-ner-001?timeframe=1m")
        assert req_doc_1m.status == 200
        doc_1m = json.loads(req_doc_1m.read().decode('utf-8'))
        assert doc_1m["timeframe"] == "1m"
        print("[OK] Doctor 1-Month longitudinal analytics endpoint validated.")

        # 5. Test Government 8 NER States Endpoint
        req_govt = urllib.request.urlopen("http://127.0.0.1:8000/api/government/metrics")
        assert req_govt.status == 200
        govt_data = json.loads(req_govt.read().decode('utf-8'))
        assert govt_data["states_count"] == 8
        assert len(govt_data["states_breakdown"]) == 8
        print("[OK] Government 8 NER states metrics endpoint validated.")

        # 6. Test Static Assets (Original UI CSS and JS)
        req_css = urllib.request.urlopen("http://127.0.0.1:8000/css/style.css")
        assert req_css.status == 200
        req_js = urllib.request.urlopen("http://127.0.0.1:8000/js/app.js")
        assert req_js.status == 200
        print("[OK] Original UI CSS & JS assets (css/style.css, js/app.js) served correctly.")


        # 7. Test AI Chatbot Endpoint (POST /api/chat)
        chat_payload = json.dumps({
            "patient_id": "pat-ner-001",
            "message": "Sing a song for me please",
            "language": "as",
            "conversation_history": [
                {"role": "user", "content": "Hello Mitra"}
            ]
        }).encode("utf-8")
        req_chat = urllib.request.Request(
            "http://127.0.0.1:8000/api/chat",
            data=chat_payload,
            headers={"Content-Type": "application/json"}
        )
        chat_resp = urllib.request.urlopen(req_chat)
        assert chat_resp.status == 200
        chat_data = json.loads(chat_resp.read().decode("utf-8"))
        assert "reply" in chat_data
        assert chat_data["language"] == "as"
        assert len(chat_data["suggested_chips"]) > 0
        print(f"[OK] AI Chatbot companion endpoint validated successfully (source: {chat_data.get('source')}).")

        print("\n=== ALL END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY! ===")


    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    test_e2e()
