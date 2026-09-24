// 90-Second Non-Intrusive Reminder System with Discrepancy Tracking

const ReminderSystem = {
  currentReminder: null,
  countdownTimer: null,
  startTime: null,
  totalWindowSec: 90,
  isFollowupActive: false,
  scheduleCheckTimer: null,
  triggeredOccurrences: new Set(),

  // Checks the caregiver's recurring schedule while the patient interface is
  // open. Each enabled item can trigger once per matching day and minute.
  startScheduleMonitor() {
    if (this.scheduleCheckTimer) return;
    this.checkScheduledReminders();
    this.scheduleCheckTimer = setInterval(() => this.checkScheduledReminders(), 15000);
  },

  async checkScheduledReminders() {
    if (AppState.currentRole !== 'patient' || this.currentReminder) return;
    const patientId = AppState.currentPatient?.id || 'pat-ner-001';
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const schedules = await DB.getAllItems('scheduled_reminders');
    const dueReminder = schedules.find(item => {
      const occurrenceKey = `${item.id}-${date}`;
      return item.patient_id === patientId && item.is_enabled && item.reminder_time === currentTime &&
        (!item.days_of_week || !item.days_of_week.length || item.days_of_week.includes(day)) &&
        !this.triggeredOccurrences.has(occurrenceKey);
    });
    if (dueReminder) {
      this.triggeredOccurrences.add(`${dueReminder.id}-${date}`);
      this.triggerReminder(dueReminder);
    }
  },
  
  // Trigger a reminder
  triggerReminder(reminderData) {
    // If a reminder is already active in its 90-second processing window, DO NOT interrupt!
    if (this.currentReminder) {
      console.log('90s comprehension window active for ongoing reminder. Queueing or ignoring interruption.');
      return;
    }
    
    this.currentReminder = reminderData;
    this.startTime = Date.now();
    this.isFollowupActive = false;
    
    const modal = document.getElementById('reminder-modal');
    const content = document.getElementById('reminder-modal-content');
    if (!modal || !content) return;
    
    // Play gentle audio chime
    VoiceEngine.playChime('gentle_reminder');
    
    // Category icons
    const icons = {
      'medication': '💊',
      'hydration': '💧',
      'food': '🍲',
      'doctor_appointment': '🩺',
      'routine': '⏰'
    };
    
    const catIcon = icons[reminderData.category] || '⏰';
    
    content.innerHTML = `
      <div class="reminder-modal-card">
        <div class="reminder-icon-large pulse-slow">${catIcon}</div>
        
        <h2 class="reminder-title" style="margin:12px 0 6px 0; font-size:1.8rem; color:var(--text-primary);">
          ${reminderData.title}
        </h2>
        
        <p class="reminder-desc" style="font-size:1.25rem; color:var(--text-secondary); margin:0 0 16px 0;">
          ${reminderData.description || 'Please follow this routine step when ready.'}
        </p>
        
        <!-- 90-Second Calm Processing Window Indicator -->
        <div class="processing-window-card">
          <div class="window-header">
            <span class="shield-icon">⏳</span>
            <span class="window-text"><strong>90-Second Uninterrupted Window</strong> — Take all the time you need.</span>
          </div>
          <div class="progress-bar-track">
            <div id="reminder-progress-fill" class="progress-bar-fill"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.9rem; color:var(--text-muted); margin-top:6px;">
            <span>Peaceful time to process</span>
            <span id="reminder-time-remaining">90s remaining</span>
          </div>
        </div>
        
        <!-- Large High-Contrast Tactile Action Buttons -->
        <div class="reminder-actions-grid">
          <button class="btn btn-action-large primary" onclick="ReminderSystem.acknowledgeReminder('acknowledged_on_time')">
            <span class="btn-icon">✅</span>
            <span class="btn-text" data-i18n="reminder_acknowledge">${I18N.t('reminder_acknowledge')}</span>
          </button>
          
          <button class="btn btn-action-large secondary" onclick="ReminderSystem.acknowledgeReminder('confused_response')">
            <span class="btn-icon">❓</span>
            <span class="btn-text" data-i18n="reminder_need_help">${I18N.t('reminder_need_help')}</span>
          </button>
          <button class="btn btn-action-large secondary" onclick="ReminderSystem.acknowledgeReminder('missed')">
            <span class="btn-icon">X</span>
            <span class="btn-text">I could not complete this</span>
          </button>
        </div>
      </div>
    `;
    
    modal.classList.add('active');
    
    // Voice prompt read-out
    const spokenText = `${reminderData.title}. ${reminderData.description || ''}. Please take your time.`;
    VoiceEngine.speak(spokenText, I18N.currentLang);
    
    // Start the 90-second non-intrusive timer
    this.start90SecondTimer();
  },
  
  start90SecondTimer() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    
    let secondsLeft = this.totalWindowSec;
    const progressFill = document.getElementById('reminder-progress-fill');
    const timeRemainingText = document.getElementById('reminder-time-remaining');
    
    this.countdownTimer = setInterval(() => {
      secondsLeft--;
      
      const pct = ((this.totalWindowSec - secondsLeft) / this.totalWindowSec) * 100;
      if (progressFill) progressFill.style.width = `${pct}%`;
      if (timeRemainingText) timeRemainingText.textContent = `${secondsLeft}s remaining`;
      
      // 90s expired without patient acknowledgment -> Trigger gentle follow-up
      if (secondsLeft <= 0) {
        clearInterval(this.countdownTimer);
        this.handle90SecondExpiry();
      }
    }, 1000);
  },
  
  // When 90s window expires without response
  handle90SecondExpiry() {
    this.isFollowupActive = true;
    
    // Play gentle chime
    VoiceEngine.playChime('gentle_reminder');
    
    // Announce follow-up voice prompt
    const followupMsg = I18N.t('reminder_followup_voice');
    VoiceEngine.speak(followupMsg, I18N.currentLang);
    
    const timeRemainingText = document.getElementById('reminder-time-remaining');
    if (timeRemainingText) {
      timeRemainingText.innerHTML = `<span style="color:var(--amber-dark); font-weight:bold;">Follow-up check active</span>`;
    }
    
    // If still no response after an additional 60 seconds, auto-log as no_response_90s and alert caregiver
    this.countdownTimer = setTimeout(() => {
      if (this.currentReminder) {
        this.acknowledgeReminder('no_response_90s', 'No response received after 90s window and follow-up prompt.');
      }
    }, 60000);
  },
  
  // Acknowledge reminder
  async acknowledgeReminder(status, customNote = null) {
    if (!this.currentReminder) return;
    
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      clearTimeout(this.countdownTimer);
    }
    
    const elapsedSec = (Date.now() - this.startTime) / 1000;
    let finalStatus = status;
    
    if (this.isFollowupActive && status === 'acknowledged_on_time') {
      finalStatus = 'acknowledged_after_followup';
    }
    
    let note = customNote || '';
    if (finalStatus === 'acknowledged_on_time') {
      note = `Acknowledged promptly within ${elapsedSec.toFixed(1)} seconds.`;
    } else if (finalStatus === 'acknowledged_after_followup') {
      note = `Acknowledged after 90s follow-up prompt at ${elapsedSec.toFixed(1)} seconds.`;
    } else if (finalStatus === 'confused_response') {
      note = `Patient tapped 'Need Help / Confused' at ${elapsedSec.toFixed(1)} seconds. Caregiver notified.`;
    } else if (finalStatus === 'missed') {
      note = `Patient reported that this task was not completed after ${elapsedSec.toFixed(1)} seconds. Caregiver notified.`;
    }
    
    const logItem = {
      id: `rem-${Date.now()}`,
      patient_id: AppState.currentPatient ? AppState.currentPatient.id : 'pat-ner-001',
      category: this.currentReminder.category || 'medication',
      title: this.currentReminder.title,
      description: this.currentReminder.description || '',
      scheduled_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      acknowledged_at: finalStatus !== 'no_response_90s' ? new Date().toISOString().replace('T', ' ').slice(0, 19) : null,
      response_time_sec: Math.round(elapsedSec * 10) / 10,
      status: finalStatus,
      followup_sent: this.isFollowupActive ? 1 : 0,
      discrepancy_note: note,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    
    // Save locally and queue for sync
    await DB.queueForSync('reminder_log', logItem);

    // The caregiver sees an immediate local notification even when the app is
    // offline; it will be synchronized with the outcome when online.
    if (['no_response_90s', 'confused_response', 'missed'].includes(finalStatus)) {
      const alert = {
        id: `alt-rem-${Date.now()}`,
        patient_id: logItem.patient_id,
        alert_type: finalStatus === 'confused_response' ? 'routine_help_needed' : 'routine_missed',
        title: finalStatus === 'confused_response' ? 'Patient needs help with a reminder' : 'Daily task missed',
        message: `${logItem.title}: ${note}`,
        severity: finalStatus === 'confused_response' ? 'medium' : 'high',
        is_read: 0,
        timestamp: logItem.timestamp
      };
      await DB.queueForSync('alert', alert);
    }
    
    // Positive audio feedback if completed
    if (finalStatus !== 'no_response_90s') {
      VoiceEngine.playChime('game_correct');
      VoiceEngine.speak("Thank you! Recorded successfully.", I18N.currentLang);
    }
    
    // Close modal
    const modal = document.getElementById('reminder-modal');
    if (modal) modal.classList.remove('active');
    
    this.currentReminder = null;
    this.isFollowupActive = false;
    if (AppState.currentRole === 'patient') AppState.renderPatientHome();
    
    // Refresh caregiver view if active
    if (window.CaregiverView) CaregiverView.refresh();
  }
};
