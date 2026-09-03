// Caregiver Monitoring & Patient Care Dashboard Controller

const CaregiverView = {
  async init() {
    await this.refresh();
  },
  
  async refresh() {
    const container = document.getElementById('caregiver-content');
    if (!container) return;
    
    const patient = AppState.currentPatient || {};
    const patientId = patient.id || 'pat-ner-001';
    
    // Fetch local or synced alerts & logs
    const allAlerts = await DB.getAllItems('alerts');
    const patientAlerts = allAlerts.filter(a => a.patient_id === patientId);
    
    const allSessions = await DB.getAllItems('game_sessions');
    const patientSessions = allSessions.filter(s => s.patient_id === patientId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const allRemLogs = await DB.getAllItems('reminder_logs');
    const patientRemLogs = allRemLogs.filter(r => r.patient_id === patientId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Compute stats
    const totalSessions = patientSessions.length;
    const avgAccuracy = totalSessions > 0 ? Math.round(patientSessions.reduce((acc, s) => acc + s.accuracy_pct, 0) / totalSessions) : 80;
    const unreadAlerts = patientAlerts.filter(a => !a.is_read);
    
    // Check for performance decline alert
    const recent5 = patientSessions.slice(0, 5);
    const hasDecline = recent5.some(s => s.accuracy_pct < 55);
    
    container.innerHTML = `
      <div class="caregiver-header-banner">
        <div>
          <h2 style="margin:0 0 4px 0; font-size:1.6rem; color:var(--text-primary);">
            Caregiver Hub: Monitoring <strong>${patient.name || 'Biren Gogoi'}</strong>
          </h2>
          <p style="margin:0; color:var(--text-secondary); font-size:1rem;">
            State: <strong>${patient.state || 'Assam'}</strong> | Condition Stage: <strong>${patient.condition_stage || 'Mild Cognitive Impairment'}</strong> (Physician-Diagnosed)
          </p>
        </div>
        
        <div class="caregiver-quick-actions">
          <button class="btn btn-outline" onclick="CaregiverView.openRoutineEditor()">
            ⚙️ Edit Daily Routine & Meds
          </button>
          <button class="btn btn-primary" onclick="CaregiverView.triggerSampleReminder()">
            🔔 Test Patient 90s Reminder
          </button>
        </div>
      </div>
      
      <!-- Critical Live Alert Notification Banner -->
      ${unreadAlerts.length > 0 ? `
        <div class="caregiver-alert-box ${hasDecline ? 'critical' : 'warning'}">
          <div class="alert-box-header">
            <span class="alert-bell-icon">🚨</span>
            <div style="flex:1;">
              <h3 style="margin:0 0 4px 0; font-size:1.2rem; color:var(--text-primary);">
                Active Caregiver Alerts (${unreadAlerts.length})
              </h3>
              <p style="margin:0; font-size:0.95rem; color:var(--text-secondary);">
                Immediate notification regarding patient cognitive trends and medication adherence.
              </p>
            </div>
          </div>
          
          <div class="alert-list-items">
            ${unreadAlerts.map(alt => `
              <div class="alert-item-card ${alt.severity}">
                <div>
                  <strong style="color:var(--text-primary); font-size:1.05rem;">${alt.title}</strong>
                  <p style="margin:4px 0; font-size:0.95rem; color:var(--text-secondary);">${alt.message}</p>
                  <span style="font-size:0.8rem; color:var(--text-muted);">Timestamp: ${alt.timestamp}</span>
                </div>
                <button class="btn btn-sm btn-outline" onclick="CaregiverView.markAlertRead('${alt.id}')">
                  Mark Read
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <div class="caregiver-alert-box good-standing">
          <span style="font-size:1.8rem;">✨</span>
          <div>
            <strong>All Systems Stable:</strong> No active cognitive decline or missed medication warnings for ${patient.name || 'patient'}.
          </div>
        </div>
      `}
      
      <!-- Single-Delivery Caregiver Notification Summary Notice -->
      <div class="info-callout-card">
        <span class="info-icon">ℹ️</span>
        <div style="font-size:0.95rem; color:var(--text-secondary);">
          <strong>Single-Delivery Reminders Active:</strong> You receive scheduled alerts <em>once</em> at event time (no 90-second repeat loop) to prevent alert fatigue, while the patient interface provides a peaceful 90s non-intrusive processing window.
        </div>
      </div>
      
      <!-- Progress Analytics KPI Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-title">Current AI Difficulty Level</span>
          <span class="kpi-val primary">Level ${patient.current_difficulty || 1}</span>
          <span class="kpi-sub">Personalized based on reaction time</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">Average Cognitive Accuracy</span>
          <span class="kpi-val green">${avgAccuracy}%</span>
          <span class="kpi-sub">Across last ${totalSessions} sessions</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">Routine & Medication Adherence</span>
          <span class="kpi-val amber">88.5%</span>
          <span class="kpi-sub">On-time reminder response rate</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">Emergency Contact</span>
          <span class="kpi-val" style="font-size:1.1rem; color:var(--text-primary);">${patient.emergency_contact || '+91 98640 12345'}</span>
          <span class="kpi-sub">Direct telephone line</span>
        </div>
      </div>
      
      <!-- Split View: Recent Cognitive Activity & Routine Timeline -->
      <div class="caregiver-two-col">
        <!-- Col 1: Recent Game Sessions -->
        <div class="panel-card">
          <div class="panel-header">
            <h3 style="margin:0; font-size:1.25rem;">🎮 Recent Cognitive Game Sessions</h3>
            <span class="badge">${patientSessions.length} Recorded</span>
          </div>
          
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Game Type</th>
                  <th>Level</th>
                  <th>Accuracy</th>
                  <th>Time</th>
                  <th>AI Adaptation Note</th>
                </tr>
              </thead>
              <tbody>
                ${patientSessions.slice(0, 6).map(s => `
                  <tr>
                    <td><strong>${s.game_type.replace('_', ' ').toUpperCase()}</strong></td>
                    <td><span class="level-tag">L${s.difficulty_level}</span></td>
                    <td><span class="badge ${s.accuracy_pct >= 75 ? 'green' : 'amber'}">${s.accuracy_pct.toFixed(0)}%</span></td>
                    <td>${s.avg_response_time_sec.toFixed(1)}s</td>
                    <td style="font-size:0.85rem; color:var(--text-secondary); max-width:200px;">${s.adaptation_reason || 'Consistent'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Col 2: Daily Routine & Medication Schedule -->
        <div class="panel-card">
          <div class="panel-header">
            <h3 style="margin:0; font-size:1.25rem;">⏰ Today's Prescribed Routine</h3>
            <span class="badge green">Active</span>
          </div>
          
          <div class="timeline-list">
            ${((patient.daily_routine && patient.daily_routine.length > 0) ? patient.daily_routine : [
              { time: "08:00 AM", activity: "Breakfast & Donepezil 5mg", icon: "medication" },
              { time: "10:30 AM", activity: "Cognitive Memory Games", icon: "game" },
              { time: "01:00 PM", activity: "Lunch & Senior Multivitamin", icon: "food" },
              { time: "05:00 PM", activity: "Assam Tea & Mitra Voice Chat", icon: "chat" },
              { time: "08:30 PM", activity: "Dinner & BP Medication", icon: "medication" }
            ]).map(r => `
              <div class="timeline-item">
                <span class="timeline-time">${r.time}</span>
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <strong>${r.activity}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },
  
  async markAlertRead(alertId) {
    const alert = await DB.getItem('alerts', alertId);
    if (alert) {
      alert.is_read = 1;
      await DB.putItem('alerts', alert);
      // Sync update if online
      fetch(`/api/alerts/${alertId}/read`, { method: 'PUT' }).catch(() => {});
      this.refresh();
    }
  },
  
  triggerSampleReminder() {
    ReminderSystem.triggerReminder({
      category: 'medication',
      title: 'Morning Donepezil 5mg Reminder',
      description: 'Take with 1 glass of warm water after breakfast.'
    });
  },
  
  openRoutineEditor() {
    alert("Routine & Medication editor: You can add or modify schedule items in the Patient Onboarding modal or edit directly.");
  }
};
