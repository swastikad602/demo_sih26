import os
import sys
import subprocess
from pathlib import Path

root_dir = Path(__file__).resolve().parent
reconnect_dir = root_dir / "reconnect"
if not reconnect_dir.exists():
    reconnect_dir = root_dir / "backend" / "__pycache__" / "reconnect"

server_file = reconnect_dir / "server.py"

if not server_file.exists():
    print(f"[!] Could not find RECONNECT at {server_file}")
    sys.exit(1)

print("[*] Launching RECONNECT Hackathon Prototype...")
subprocess.run([sys.executable, str(server_file)])
