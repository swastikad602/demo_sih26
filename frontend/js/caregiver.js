// Caregiver monitoring dashboard and recurring alarm manager.

const CaregiverView = {
  async init() { await this.refresh(); },

  async refresh() {
    const container = document.getElementById('caregiver-content');
    if (!container) return;
    const patient = AppState.currentPatient || {};
    const patientId = patient.id || 'pat-ner-001';
    const [allAlerts, allSessions, allLogs, allSchedules] = await Promise.all([
      DB.getAllItems('alerts'), DB.getAllItems('game_sessions'), DB.getAllItems('reminder_logs'), DB.getAllItems('scheduled_reminders')
    ]);
    const patientAlerts = allAlerts.filter(item => item.patient_id === patientId);
    const patientSessions = allSessions.filter(item => item.patient_id === patientId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const patientLogs = allLogs.filter(item => item.patient_id === patientId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const schedules = allSchedules.filter(item => item.patient_id === patientId).sort((a, b) => a.reminder_time.localeCompare(b.reminder_time));
    const unreadAlerts = patientAlerts.filter(item => !item.is_read);
    const completed = patientLogs.filter(item => this.isCompleted(item.status)).length;
    const adherence = patientLogs.length ? Math.round((completed / patientLogs.length) * 100) : 0;
    const averageAccuracy = patientSessions.length ? Math.round(patientSessions.reduce((total, item) => total + item.accuracy_pct, 0) / patientSessions.length) : 0;

    container.innerHTML = `
      <div class="caregiver-header-banner">
        <div><h2 style="margin:0 0 4px; font-size:1.6rem; color:var(--text-primary);">Caregiver Hub: Monitoring <strong>${this.escapeHtml(patient.name || 'Patient')}</strong></h2><p style="margin:0; color:var(--text-secondary);">Set alarms, review task outcomes, and act on missed reminders.</p></div>
        <div class="caregiver-quick-actions"><button class="btn btn-outline" onclick="CaregiverView.openReminderEditor()">Manage alarms & reminders</button><button class="btn btn-primary" onclick="CaregiverView.triggerNextReminder()">Test patient reminder</button></div>
      </div>
      ${unreadAlerts.length ? `<div class="caregiver-alert-box warning"><div class="alert-box-header"><span class="alert-bell-icon">!</span><div><h3 style="margin:0;">Caregiver notifications (${unreadAlerts.length})</h3><p style="margin:4px 0 0;">A patient needs attention or has missed a task.</p></div></div><div class="alert-list-items">${unreadAlerts.map(alert => `<div class="alert-item-card ${alert.severity}"><div><strong>${this.escapeHtml(alert.title)}</strong><p style="margin:4px 0;">${this.escapeHtml(alert.message)}</p><small>${alert.timestamp}</small></div><button class="btn btn-sm btn-outline" onclick="CaregiverView.markAlertRead('${alert.id}')">Mark read</button></div>`).join('')}</div></div>` : `<div class="caregiver-alert-box good-standing"><strong>All clear:</strong>&nbsp; no unread task or wellbeing alerts for ${this.escapeHtml(patient.name || 'this patient')}.</div>`}
      <div class="kpi-grid">
        <div class="kpi-card"><span class="kpi-title">Active alarms</span><span class="kpi-val primary">${schedules.filter(item => item.is_enabled).length}</span><span class="kpi-sub">${schedules.length} configured</span></div>
        <div class="kpi-card"><span class="kpi-title">Task adherence</span><span class="kpi-val green">${adherence}%</span><span class="kpi-sub">${completed} completed of ${patientLogs.length} recorded</span></div>
        <div class="kpi-card"><span class="kpi-title">Cognitive accuracy</span><span class="kpi-val amber">${averageAccuracy}%</span><span class="kpi-sub">Across ${patientSessions.length} sessions</span></div>
        <div class="kpi-card"><span class="kpi-title">Emergency contact</span><span class="kpi-val" style="font-size:1rem; color:var(--text-primary);">${this.escapeHtml(patient.emergency_contact || 'Not set')}</span></div>
      </div>
      <section class="panel-card reminder-manager-panel">
        <div class="panel-header"><div><h3 style="margin:0; font-size:1.3rem;">Alarms & Daily Task Reminders</h3><p style="margin:4px 0 0; color:var(--text-secondary); font-size:.92rem;">Recurring patient reminders for walks, brain gym, medicines, hydration, appointments, meals, and custom tasks.</p></div><button class="btn btn-primary" onclick="CaregiverView.openReminderEditor()">+ Add reminder</button></div>
        <div id="caregiver-reminder-form"></div>
        <div class="scheduled-reminder-list">${schedules.length ? schedules.map(reminder => `<article class="scheduled-reminder-card ${reminder.is_enabled ? '' : 'is-paused'}"><label class="schedule-toggle" title="Enable or pause"><input type="checkbox" ${reminder.is_enabled ? 'checked' : ''} onchange="CaregiverView.toggleScheduledReminder('${reminder.id}', this.checked)"><span></span></label><div class="scheduled-time">${this.displayTime(reminder.reminder_time)}</div><div class="scheduled-reminder-details"><strong>${this.escapeHtml(reminder.title)}</strong><span>${this.escapeHtml(reminder.category.replaceAll('_', ' '))} · ${this.displayDays(reminder.days_of_week)}</span>${reminder.description ? `<small>${this.escapeHtml(reminder.description)}</small>` : ''}</div><div class="scheduled-reminder-actions"><button class="btn btn-sm btn-outline" onclick="CaregiverView.openReminderEditor('${reminder.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="CaregiverView.deleteScheduledReminder('${reminder.id}')">Delete</button></div></article>`).join('') : `<div class="empty-reminders">No reminders set yet. Add an alarm to begin the daily routine.</div>`}</div>
      </section>
      <div class="caregiver-two-col">
        <section class="panel-card"><div class="panel-header"><h3 style="margin:0;">Recent task outcomes</h3><span class="badge">${patientLogs.length} recorded</span></div><div class="reminder-outcome-list">${patientLogs.length ? patientLogs.slice(0, 8).map(log => `<div class="reminder-outcome ${this.isCompleted(log.status) ? 'completed' : 'missed'}"><div><strong>${this.escapeHtml(log.title)}</strong><small>${log.acknowledged_at || log.timestamp}</small></div><span>${this.statusLabel(log.status)}</span></div>`).join('') : '<p style="color:var(--text-secondary);">Completion and missed-task reports will appear here.</p>'}</div></section>
        <section class="panel-card"><div class="panel-header"><h3 style="margin:0;">Recent cognitive activity</h3><span class="badge">${patientSessions.length} recorded</span></div><div class="reminder-outcome-list">${patientSessions.length ? patientSessions.slice(0, 6).map(session => `<div class="reminder-outcome completed"><div><strong>${this.escapeHtml(session.game_type.replaceAll('_', ' '))}</strong><small>${session.timestamp}</small></div><span>${Math.round(session.accuracy_pct)}%</span></div>`).join('') : '<p style="color:var(--text-secondary);">No game sessions recorded yet.</p>'}</div></section>
      </div>`;
  },

  displayTime(time) {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return time || 'No time';
    const [hour, minute] = time.split(':').map(Number);
    return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
  },
  displayDays(days) { return !days || !days.length ? 'Every day' : days.join(', '); },
  isCompleted(status) { return ['acknowledged_on_time', 'acknowledged_after_followup'].includes(status); },
  statusLabel(status) { return ({ acknowledged_on_time: 'Completed on time', acknowledged_after_followup: 'Completed after follow-up', confused_response: 'Needs help', no_response_90s: 'Missed', missed: 'Missed' })[status] || status.replaceAll('_', ' '); },

  async markAlertRead(alertId) {
    const alert = await DB.getItem('alerts', alertId);
    if (!alert) return;
    alert.is_read = 1;
    await DB.queueForSync('alert', alert);
    fetch(`/api/alerts/${alertId}/read`, { method: 'PUT' }).catch(() => {});
    await this.refresh();
  },
  async triggerNextReminder() {
    const patientId = AppState.currentPatient?.id || 'pat-ner-001';
    const schedules = (await DB.getAllItems('scheduled_reminders')).filter(item => item.patient_id === patientId && item.is_enabled);
    ReminderSystem.triggerReminder(schedules[0] || { category: 'routine', title: 'Sample daily routine reminder', description: 'This is how a patient task reminder will appear.' });
  },
  async openReminderEditor(reminderId = null) {
    const formContainer = document.getElementById('caregiver-reminder-form');
    if (!formContainer) return;
    const schedules = await DB.getAllItems('scheduled_reminders');
    const existing = schedules.find(item => item.id === reminderId) || { category: 'routine', title: '', description: '', reminder_time: '08:00', days_of_week: [] };
    const categories = ['routine', 'medication', 'hydration', 'brain_gym', 'appointment', 'walk', 'meal'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    formContainer.innerHTML = `<form class="reminder-editor-form" onsubmit="CaregiverView.saveScheduledReminder(event, '${reminderId || ''}')"><div class="reminder-form-heading">${reminderId ? 'Edit reminder' : 'New reminder'}</div><div class="reminder-form-grid"><label>Task / alarm name<input id="schedule-title" class="form-input" required maxlength="100" value="${this.escapeHtml(existing.title)}" placeholder="e.g. Morning walk"></label><label>Time<input id="schedule-time" class="form-input" required type="time" value="${existing.reminder_time}"></label><label>Category<select id="schedule-category" class="form-select">${categories.map(category => `<option value="${category}" ${existing.category === category ? 'selected' : ''}>${category.replaceAll('_', ' ')}</option>`).join('')}</select></label><label>Details (optional)<input id="schedule-description" class="form-input" maxlength="180" value="${this.escapeHtml(existing.description || '')}" placeholder="e.g. Walk in the garden for 15 minutes"></label></div><fieldset class="repeat-days"><legend>Repeat on <small>(leave empty for every day)</small></legend>${days.map(day => `<label><input type="checkbox" value="${day}" ${existing.days_of_week?.includes(day) ? 'checked' : ''}>${day}</label>`).join('')}</fieldset><div class="reminder-form-actions"><button type="button" class="btn btn-secondary" onclick="CaregiverView.closeReminderEditor()">Cancel</button><button type="submit" class="btn btn-primary">${reminderId ? 'Save changes' : 'Create reminder'}</button></div></form>`;
  },
  closeReminderEditor() { const node = document.getElementById('caregiver-reminder-form'); if (node) node.innerHTML = ''; },
  async saveScheduledReminder(event, reminderId) {
    event.preventDefault();
    const days = [...document.querySelectorAll('#caregiver-reminder-form .repeat-days input:checked')].map(input => input.value);
    const reminder = { id: reminderId || `sched-${Date.now()}`, patient_id: AppState.currentPatient?.id || 'pat-ner-001', title: document.getElementById('schedule-title').value.trim(), reminder_time: document.getElementById('schedule-time').value, category: document.getElementById('schedule-category').value, description: document.getElementById('schedule-description').value.trim(), days_of_week: days, is_enabled: true };
    await DB.queueForSync('scheduled_reminder', reminder);
    this.closeReminderEditor();
    await this.refresh();
  },
  async toggleScheduledReminder(reminderId, isEnabled) {
    const reminder = await DB.getItem('scheduled_reminders', reminderId);
    if (!reminder) return;
    reminder.is_enabled = isEnabled;
    await DB.queueForSync('scheduled_reminder', reminder);
    await this.refresh();
  },
  async deleteScheduledReminder(reminderId) {
    const reminder = await DB.getItem('scheduled_reminders', reminderId);
    if (!reminder || !confirm(`Delete the reminder "${reminder.title}"?`)) return;
    await DB.deleteScheduledReminder(reminder);
    await this.refresh();
  },
  escapeHtml(value) { return String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
};
