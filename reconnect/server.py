import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def main():
    print("=" * 70)
    print("   RECONNECT -- AI-Assisted Cognitive Gaming & Caregiver Platform")
    print("   Hackathon MVP Prototype (Northeast Region India)")
    print("=" * 70)
    print(f"\n[+] Local Server running at: http://127.0.0.1:{PORT}")
    print("[+] Mobile & Tablet Frame Simulator enabled")
    print("[+] 4 Roles with SEPARATE Dedicated Logins: Elder, Caregiver, Doctor, Gov")
    print("[+] 4 Cognitive Games: Memory, Attention, Pattern, Executive Function")
    print("[+] Explainable AI Adaptive Engine active (Rules 1-5)")
    print("[+] 90-Second Reminder Workflow with 10s Demo Timer")
    print("[+] Bilingual Support: English + Assamese")
    print("[+] Offline-First Sync Queue active\n")

    url = f"http://127.0.0.1:{PORT}/index.html"
    try:
        webbrowser.open(url)
    except Exception:
        pass

    # Allow address reuse so stopping and restarting doesn't raise OSError: [Errno 98]
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"[*] Serving files from: {DIRECTORY}")
        print(f"[*] Open in your browser: {url}")
        print("[*] Press Ctrl+C to stop the server\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[!] Stopping server...")
            httpd.server_close()

if __name__ == "__main__":
    main()
