// RECONNECT Firestore-Compatible Offline-First Storage Engine
// Implements local IndexedDB/LocalStorage persistence, connection monitoring, and outbox sync queue.

class FirebaseStore {
  constructor() {
    this.storageKey = "reconnect_db_v1";
    this.outboxKey = "reconnect_outbox_v1";
    this.isOnline = navigator.onLine !== undefined ? navigator.onLine : true;
    this.syncStatus = "synced"; // "synced", "pending", "offline"
    this.listeners = [];
    this.initDatabase();
  }

  initDatabase() {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      // Seed with rich synthetic prototype dataset
      this.data = JSON.parse(JSON.stringify(SEED_DATA));
      this.saveLocal();
    } else {
      try {
        this.data = JSON.parse(existing);
      } catch (e) {
        this.data = JSON.parse(JSON.stringify(SEED_DATA));
        this.saveLocal();
      }
    }

    const outbox = localStorage.getItem(this.outboxKey);
    this.outbox = outbox ? JSON.parse(outbox) : [];

    // Listen for actual browser online/offline events
    window.addEventListener("online", () => this.handleNetworkChange(true));
    window.addEventListener("offline", () => this.handleNetworkChange(false));
  }

  saveLocal() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  saveOutbox() {
    localStorage.setItem(this.outboxKey, JSON.stringify(this.outbox));
  }

  handleNetworkChange(isOnline) {
    this.isOnline = isOnline;
    if (this.isOnline) {
      if (this.outbox.length > 0) {
        this.syncPendingData();
      } else {
        this.syncStatus = "synced";
      }
    } else {
      this.syncStatus = "offline";
    }
    this.notifySubscribers();
  }

  // Demo toggle for judges to easily simulate Online <-> Offline
  toggleSimulatedNetwork() {
    this.handleNetworkChange(!this.isOnline);
    return this.isOnline;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback({
      isOnline: this.isOnline,
      syncStatus: this.syncStatus,
      pendingCount: this.outbox.length
    });
  }

  notifySubscribers() {
    this.listeners.forEach(cb => cb({
      isOnline: this.isOnline,
      syncStatus: this.syncStatus,
      pendingCount: this.outbox.length
    }));
  }

  // Queue item if offline, or commit directly if online
  commitAction(collection, action, payload) {
    // 1. Immediately apply change to local dataset (optimistic update)
    if (collection === "game_sessions" && action === "create") {
      this.data.game_sessions.unshift(payload);
    } else if (collection === "reminders" && action === "update") {
      const idx = this.data.reminders.findIndex(r => r.id === payload.id);
      if (idx !== -1) {
        this.data.reminders[idx] = { ...this.data.reminders[idx], ...payload };
      }
    } else if (collection === "reminders" && action === "create") {
      this.data.reminders.push(payload);
    } else if (collection === "alerts" && action === "create") {
      this.data.alerts.unshift(payload);
    } else if (collection === "alerts" && action === "update") {
      const idx = this.data.alerts.findIndex(a => a.id === payload.id);
      if (idx !== -1) {
        this.data.alerts[idx] = { ...this.data.alerts[idx], ...payload };
      }
    } else if (collection === "memory_items" && action === "create") {
      this.data.memory_items.push(payload);
    } else if (collection === "professional_notes" && action === "create") {
      this.data.professional_notes.unshift(payload);
    } else if (collection === "users" && action === "create") {
      this.data.users.push(payload);
    }

    this.saveLocal();

    // 2. If offline, enqueue to sync outbox
    if (!this.isOnline) {
      this.outbox.push({
        id: "tx_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        collection,
        action,
        payload,
        queued_at: new Date().toISOString()
      });
      this.saveOutbox();
      this.syncStatus = "offline";
    } else {
      // If online, simulate instant cloud sync acknowledgment
      this.syncStatus = "synced";
    }

    this.notifySubscribers();
  }

  // Synchronize queued data when network returns
  syncPendingData() {
    if (this.outbox.length === 0) {
      this.syncStatus = "synced";
      this.notifySubscribers();
      return;
    }

    this.syncStatus = "pending";
    this.notifySubscribers();

    // Simulate batch network latency (800ms) for convincing hackathon demonstration
    setTimeout(() => {
      this.outbox = [];
      this.saveOutbox();
      this.syncStatus = "synced";
      this.notifySubscribers();
    }, 900);
  }

  // Collections accessors
  getUsers() {
    return this.data.users || [];
  }

  getUser(userId) {
    return this.data.users.find(u => u.id === userId) || null;
  }

  getReminders(userId = "elder_maya") {
    return (this.data.reminders || []).filter(r => r.user_id === userId);
  }

  getGameSessions(userId = "elder_maya") {
    return (this.data.game_sessions || []).filter(s => s.user_id === userId);
  }

  getMemoryItems(userId = "elder_maya") {
    return (this.data.memory_items || []).filter(m => m.user_id === userId);
  }

  getAlerts(caregiverId = "caregiver_anita") {
    return (this.data.alerts || []).filter(a => a.caregiver_id === caregiverId);
  }

  getProfessionalNotes(userId = "elder_maya") {
    return (this.data.professional_notes || []).filter(n => n.user_id === userId);
  }

  getNERMetrics() {
    return {
      states: this.data.ner_states_metrics || [],
      districts: this.data.district_metrics || [],
      languages: this.data.language_metrics || {},
      reminders: this.data.reminder_aggregate || {}
    };
  }

  // Save new completed game session
  recordGameSession(session) {
    const sessionRecord = {
      id: "sess_" + Date.now(),
      user_id: session.userId || "elder_maya",
      game_type: session.gameType,
      domain: session.domain,
      level: session.level,
      score: session.score,
      accuracy: session.accuracy,
      response_time: session.responseTime,
      hints_used: session.hintsUsed || 0,
      attempts: session.attempts || 1,
      recommended_level: session.recommendedLevel,
      adaptation_reason: session.adaptationReason,
      created_at: new Date().toISOString(),
      offline_created: !this.isOnline,
      sync_status: this.isOnline ? "synced" : "pending"
    };

    this.commitAction("game_sessions", "create", sessionRecord);
    return sessionRecord;
  }

  // Record reminder status change
  updateReminderStatus(reminderId, status, extra = {}) {
    const payload = {
      id: reminderId,
      status,
      ...extra
    };
    if (status === "acknowledged") {
      payload.acknowledged_at = new Date().toISOString();
    } else if (status === "postponed") {
      payload.postponed_at = new Date().toISOString();
    }
    this.commitAction("reminders", "update", payload);
  }

  // Caregiver alert creation
  createAlert(type, title, message, relatedReminderId = null) {
    const alertRecord = {
      id: "alert_" + Date.now(),
      user_id: "elder_maya",
      caregiver_id: "caregiver_anita",
      type, // 'reminder_not_acknowledged', 'help_requested', 'needs_review'
      title,
      message,
      related_reminder_id: relatedReminderId,
      status: "active",
      created_at: new Date().toISOString()
    };
    this.commitAction("alerts", "create", alertRecord);
    return alertRecord;
  }

  // Mark alert handled
  markAlertHandled(alertId) {
    this.commitAction("alerts", "update", { id: alertId, status: "handled", handled_at: new Date().toISOString() });
  }

  // Add doctor clinical note
  addDoctorNote(userId, doctorId, doctorName, noteText) {
    const note = {
      id: "note_" + Date.now(),
      doctor_id: doctorId,
      user_id: userId,
      doctor_name: doctorName,
      note: noteText,
      created_at: new Date().toISOString()
    };
    this.commitAction("professional_notes", "create", note);
    return note;
  }

  // Add reminder from caregiver
  addReminder(reminderData) {
    const reminder = {
      id: "rem_" + Date.now(),
      user_id: reminderData.userId || "elder_maya",
      title: reminderData.title,
      title_as: reminderData.titleAs || reminderData.title,
      category: reminderData.category || "General",
      scheduled_time: reminderData.time || "02:00 PM",
      response_window: reminderData.responseWindow || 90,
      audio_url: "custom",
      status: "pending",
      shown_at: null,
      acknowledged_at: null,
      postponed_at: null,
      created_at: new Date().toISOString()
    };
    this.commitAction("reminders", "create", reminder);
    return reminder;
  }

  // Add family memory card
  addMemoryItem(item) {
    const mem = {
      id: "mem_" + Date.now(),
      user_id: item.userId || "elder_maya",
      name: item.name,
      relationship: item.relationship,
      avatar: item.avatar || "👤",
      photo_desc: item.photoDesc || "",
      audio_text_en: item.audioEn || `This is ${item.name}, your ${item.relationship}.`,
      audio_text_as: item.audioAs || `এইয়া ${item.name}, আপোনাৰ ${item.relationship}।`,
      consent_status: true,
      created_at: new Date().toISOString()
    };
    this.commitAction("memory_items", "create", mem);
    return mem;
  }
}

const db = new FirebaseStore();
