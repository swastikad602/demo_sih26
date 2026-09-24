// RECONNECT 90-Second Reminder Response Engine
// Non-intrusive response window with instant 10s Hackathon Demo Mode toggle.

class ReminderEngine {
  constructor() {
    this.demoMode = true; // Default to 10s demo mode for easy judge testing, toggleable to real 90s
    this.activeTimer = null;
    this.currentReminder = null;
    this.remainingSeconds = 90;
    this.totalSeconds = 90;
    this.onTickCallback = null;
    this.onCompleteCallback = null;
  }

  setDemoMode(isDemo) {
    this.demoMode = isDemo;
  }

  getResponseWindow() {
    return this.demoMode ? 10 : 90;
  }

  // Trigger interactive reminder popup
  triggerReminder(reminder, onTick, onComplete) {
    this.clearTimer();
    this.currentReminder = reminder;
    this.totalSeconds = this.getResponseWindow();
    this.remainingSeconds = this.totalSeconds;
    this.onTickCallback = onTick;
    this.onCompleteCallback = onComplete;

    // Play gentle chime and vocalize
    audioManager.playTone("reminder");
    const lang = window.appState ? window.appState.language : "en";
    const title = lang === "as" ? (reminder.title_as || reminder.title) : reminder.title;
    const promptText = lang === "as"
      ? `মায়া, আপোনাৰ সোঁৱৰণী: ${title}`
      : `Maya, gentle reminder for ${title}`;
    
    setTimeout(() => {
      audioManager.speak(promptText, lang);
    }, 400);

    // Start calm, non-intrusive countdown
    this.activeTimer = setInterval(() => {
      this.remainingSeconds -= 1;
      if (this.onTickCallback) {
        this.onTickCallback(this.remainingSeconds, this.totalSeconds);
      }

      if (this.remainingSeconds <= 0) {
        this.handleTimeout();
      }
    }, 1000);
  }

  handleTimeout() {
    this.clearTimer();
    const reminder = this.currentReminder;
    if (!reminder) return;

    // 1. Mark reminder as missed / not acknowledged
    db.updateReminderStatus(reminder.id, "missed");

    // 2. Play gentle follow-up tone
    audioManager.playTone("gentle_hint");

    // 3. Create Caregiver Alert strictly adhering to non-diagnostic standard
    // Spec: "Reminder was not acknowledged. Do NOT say Patient did not take medicine."
    db.createAlert(
      "reminder_not_acknowledged",
      "Reminder Not Acknowledged",
      `Routine reminder "${reminder.title}" scheduled for ${reminder.scheduled_time} was not acknowledged.`,
      reminder.id
    );

    if (this.onCompleteCallback) {
      this.onCompleteCallback({
        action: "timeout",
        reminder,
        message: "Reminder was not acknowledged. Caregiver has been gently informed."
      });
    }
  }

  respondDone() {
    this.clearTimer();
    if (this.currentReminder) {
      db.updateReminderStatus(this.currentReminder.id, "acknowledged");
      audioManager.playTone("success");
      const lang = window.appState ? window.appState.language : "en";
      audioManager.speak(lang === "as" ? "বৰ ভাল, মায়া!" : "Well done, Maya! Recorded.", lang);
    }
    if (this.onCompleteCallback) {
      this.onCompleteCallback({ action: "done", reminder: this.currentReminder });
    }
  }

  respondLater() {
    this.clearTimer();
    if (this.currentReminder) {
      db.updateReminderStatus(this.currentReminder.id, "postponed");
      audioManager.playTone("tap");
      const lang = window.appState ? window.appState.language : "en";
      audioManager.speak(lang === "as" ? "ঠিক আছে, পিছত মনত পেলাই দিম।" : "Understood. We will remind you shortly.", lang);
    }
    if (this.onCompleteCallback) {
      this.onCompleteCallback({ action: "later", reminder: this.currentReminder });
    }
  }

  respondNeedHelp() {
    this.clearTimer();
    if (this.currentReminder) {
      db.createAlert(
        "help_requested",
        "Assistance Requested",
        `Maya requested assistance regarding: ${this.currentReminder.title}.`,
        this.currentReminder.id
      );
      audioManager.playTone("gentle_chime");
      const lang = window.appState ? window.appState.language : "en";
      audioManager.speak(
        lang === "as"
          ? "অনিক জনোৱা হৈছে। সহায় আহি আছে।"
          : "Anita has been notified. Someone is right on the way.",
        lang
      );
    }
    if (this.onCompleteCallback) {
      this.onCompleteCallback({ action: "help", reminder: this.currentReminder });
    }
  }

  clearTimer() {
    if (this.activeTimer) {
      clearInterval(this.activeTimer);
      this.activeTimer = null;
    }
  }
}

const reminderEngine = new ReminderEngine();
