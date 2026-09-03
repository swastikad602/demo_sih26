import os
import sys
import uvicorn
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

from database import init_db
from seed_data import seed_database

def main():
    print("=" * 70)
    print("   AI Cognitive Gaming & Memory Assistance Platform (SIH26003)")
    print("   Dementia Care for India's North Eastern Region (NER)")
    print("=" * 70)
    
    # Initialize database & seed initial data
    db_file = backend_dir / "dementia_platform.db"
    if not db_file.exists():
        print("[+] Initializing and seeding SQLite database...")
        seed_database()
    else:
        print("[+] Database verified at:", db_file)
        
    print("\n[+] Starting FastAPI Web Server & REST API...")
    print("[*] Local Web App URL: http://127.0.0.1:8000")
    print("[*] API Docs (Swagger): http://127.0.0.1:8000/docs")
    print("[*] 4 Roles Supported: Patient, Caregiver, Doctor, Government")
    print("[*] 8 NER States Supported: AS, AR, MN, ML, MZ, NL, SK, TR")
    print("[*] Offline-First PWA with IndexedDB & Background Cloud Sync\n")
    
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False, app_dir=str(backend_dir))

if __name__ == "__main__":
    main()
