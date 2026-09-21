import os
import sys

base_dir = os.path.dirname(os.path.abspath(__file__))
index_html = os.path.join(base_dir, "index.html")

print("Checking RECONNECT Real Application Architecture...")

if not os.path.exists(index_html):
    print("[-] index.html missing!")
    sys.exit(1)

with open(index_html, "r", encoding="utf-8") as f:
    html_content = f.read()

# Check that CSS is linked
if 'rel="stylesheet" href="css/style.css"' not in html_content:
    print("[-] css/style.css not linked!")
    sys.exit(1)

# Check all required scripts are included
scripts = [
    "js/translations.js",
    "js/audio.js",
    "js/seed-data.js",
    "js/firebase-store.js",
    "js/adaptive-engine.js",
    "js/reminder-engine.js",
    "js/games/memory.js",
    "js/games/attention.js",
    "js/games/pattern.js",
    "js/games/executive.js",
    "js/companion.js",
    "js/app.js"
]

all_ok = True
for s in scripts:
    path = os.path.join(base_dir, s)
    if not os.path.exists(path):
        print(f"[-] Missing script file: {s}")
        all_ok = False
    else:
        size = os.path.getsize(path)
        print(f"[OK] Found {s} ({size} bytes)")
        if f'src="{s}"' not in html_content:
            print(f"[-] Script {s} not found in index.html!")
            all_ok = False

# Check screen containers in HTML
expected_screens = [
    "screen-role-select",
    "screen-login-elder",
    "screen-login-caregiver",
    "screen-login-doctor",
    "screen-login-government",
    "screen-elder-home",
    "screen-elder-companion",
    "screen-game-select",
    "screen-game-active",
    "screen-game-result",
    "screen-elder-routine",
    "screen-elder-people",
    "screen-elder-help",
    "screen-caregiver-home",
    "screen-doctor-home",
    "screen-government-home",
    "modal-medication-reminder",
    "modal-add-reminder",
    "modal-add-memory"
]

for sc in expected_screens:
    if f'id="{sc}"' not in html_content:
        print(f"[-] Missing screen/modal ID: {sc}")
        all_ok = False
    else:
        print(f"[OK] Verified UI container: {sc}")

if all_ok:
    print("\n[SUCCESS] All RECONNECT real application screens, separate logins, games, and Personal Voice Companion are verified!")
else:
    print("\n[FAIL] Some components missing!")
    sys.exit(1)
