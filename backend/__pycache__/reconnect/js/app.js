// RECONNECT Application Controller
// Production-grade client architecture with authentic authentication, CST exercises, and clinical dashboards

class ReconnectApp {
  constructor() {
    this.screenHistory = ["screen-role-select"];
    this.currentScreen = "screen-role-select";
    this.enteredPin = "";
    this.activeUser = null;
    this.activeGameType = null;
    this.cognitiveLevels = {
      memory: 1,
      attention: 1,
      pattern: 1,
      executive: 1
    };

    window.appState = {
      language: "en",
      user: null
    };
  }

  init() {
    // Subscribe to DB state
    db.subscribe(status => {
      this.updateConnectionStatusBadge(status);
      this.refreshActiveScreenData();
    });

    // Populate initial data
    this.renderPatientRoutine();
    this.renderPatientFamilyMemories();
    this.renderCaregiverHub();
    this.renderDoctorWorkspace();
    this.renderPublicHealthDashboard();
    this.updateLanguageUI();
  }

  // ==========================================================================
  // NAVIGATION ROUTER
  // ==========================================================================
  navigateTo(screenId, pushHistory = true) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add("active");
      if (pushHistory && this.currentScreen !== screenId) {
        this.screenHistory.push(screenId);
      }
      this.currentScreen = screenId;
    }

    // Scroll viewport to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Update bottom navigation visibility
    const bottomNav = document.getElementById("app-bottom-nav");
    if (bottomNav) {
      const isLoginOrSelect = screenId.startsWith("screen-login") || screenId === "screen-role-select";
      bottomNav.style.display = isLoginOrSelect ? "none" : "";

      // Update active tab in bottom nav
      document.querySelectorAll(".tab-nav-item").forEach(item => item.classList.remove("active"));
      if (screenId.includes("elder")) {
        bottomNav.children[0]?.classList.add("active");
      } else if (screenId.includes("caregiver")) {
        bottomNav.children[1]?.classList.add("active");
      } else if (screenId.includes("doctor")) {
        bottomNav.children[2]?.classList.add("active");
      } else if (screenId.includes("government")) {
        bottomNav.children[3]?.classList.add("active");
      }
    }

    // Update Header
    this.updateHeaderBar(screenId);

    // Refresh views if needed
    if (screenId === "screen-elder-routine") this.renderPatientRoutine();
    if (screenId === "screen-elder-people") this.renderPatientFamilyMemories();
    if (screenId === "screen-caregiver-home") this.renderCaregiverHub();
    if (screenId === "screen-doctor-home") this.renderDoctorWorkspace();
    if (screenId === "screen-government-home") this.renderPublicHealthDashboard();
  }

  updateHeaderBar(screenId) {
    const titleEl = document.getElementById("app-nav-title");
    const subEl = document.getElementById("app-nav-subtitle");
    const avatarIcon = document.getElementById("top-avatar-icon");

    if (screenId.includes("elder")) {
      titleEl.innerText = window.appState.language === "as" ? "ৰিকানেক্ট • মায়া বৰা" : "RECONNECT • Maya Borah";
      subEl.innerText = window.appState.language === "as" ? "দৈনন্দিন নিয়মসূচী আৰু স্মৃতি অনুশীলন" : "Cognitive Care & Daily Wellness";
      if (avatarIcon) avatarIcon.innerText = "👵";
    } else if (screenId.includes("caregiver")) {
      titleEl.innerText = "Caregiver Hub";
      subEl.innerText = "Maya Borah • Primary Family Caregiver";
      if (avatarIcon) avatarIcon.innerText = "👩‍💼";
    } else if (screenId.includes("doctor")) {
      titleEl.innerText = "GMCH Clinical Workspace";
      subEl.innerText = "Dr. B. Barua, MD • Geriatrics";
      if (avatarIcon) avatarIcon.innerText = "🩺";
    } else if (screenId.includes("government")) {
      titleEl.innerText = "NER Public Health Surveillance";
      subEl.innerText = "DoNER & State Health Missions";
      if (avatarIcon) avatarIcon.innerText = "🏛️";
    } else {
      titleEl.innerText = "RECONNECT";
      subEl.innerText = "Cognitive Wellness & Caregiver Coordination";
      if (avatarIcon) avatarIcon.innerText = "👤";
    }
  }

  // ==========================================================================
  // AUTHENTICATION LOGIC FOR 4 SEPARATE ROLES
  // ==========================================================================
  handlePinDigit(digit) {
    if (this.enteredPin.length < 4) {
      this.enteredPin += digit;
      audioManager.playTone("tap");
      this.updatePinDots();

      if (this.enteredPin.length === 4) {
        setTimeout(() => {
          if (this.enteredPin === "1234") {
            audioManager.playTone("success");
            this.activeUser = db.getUser("elder_maya");
            window.appState.user = this.activeUser;
            this.handlePinClear();
            this.navigateTo("screen-elder-home");

            const lang = window.appState.language;
            audioManager.speak(
              lang === "as" ? "সুপ্ৰভাত মায়া। আজি আপুনি কি কৰিব বিচাৰিব?" : "Good morning Maya. What would you like to do today?",
              lang
            );
          } else {
            audioManager.playTone("gentle_hint");
            alert("Incorrect PIN. Please enter your 4-digit code (Demo PIN: 1234)");
            this.handlePinClear();
          }
        }, 180);
      }
    }
  }

  handlePinBackspace() {
    if (this.enteredPin.length > 0) {
      audioManager.playTone("tap");
      this.enteredPin = this.enteredPin.slice(0, -1);
      this.updatePinDots();
    }
  }

  handlePinClear() {
    this.enteredPin = "";
    this.updatePinDots();
  }

  updatePinDots() {
    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`pin-slot-${i}`);
      if (dot) {
        dot.classList.toggle("filled", i <= this.enteredPin.length);
      }
    }
  }

  authenticateCaregiver() {
    audioManager.playTone("success");
    this.activeUser = db.getUser("caregiver_anita");
    window.appState.user = this.activeUser;
    this.renderCaregiverHub();
    this.navigateTo("screen-caregiver-home");
  }

  authenticateDoctor() {
    audioManager.playTone("success");
    this.activeUser = db.getUser("doctor_barua");
    window.appState.user = this.activeUser;
    this.renderDoctorWorkspace();
    this.navigateTo("screen-doctor-home");
  }

  authenticateGov() {
    audioManager.playTone("success");
    this.activeUser = db.getUser("gov_admin");
    window.appState.user = this.activeUser;
    this.renderPublicHealthDashboard();
    this.navigateTo("screen-government-home");
  }

  // ==========================================================================
  // LANGUAGE & CONNECTION STATE
  // ==========================================================================
  toggleLanguage() {
    window.appState.language = window.appState.language === "en" ? "as" : "en";
    this.updateLanguageUI();
  }

  updateLanguageUI() {
    const lang = window.appState.language;
    const label = document.getElementById("label-lang-toggle");
    if (label) {
      label.innerText = lang === "as" ? "English" : "অসমীয়া (Assamese)";
    }

    const greetingName = document.getElementById("patient-greeting-name");
    const greetingSub = document.getElementById("patient-greeting-sub");
    if (greetingName) greetingName.innerText = t("greeting_maya", lang);
    if (greetingSub) greetingSub.innerText = t("greeting_subtitle", lang);

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.innerText = t(key, lang);
    });

    this.renderPatientRoutine();
    this.renderPatientFamilyMemories();
  }

  toggleConnection() {
    const isOnline = db.toggleSimulatedNetwork();
    audioManager.playTone("tap");
  }

  updateConnectionStatusBadge(status) {
    const badge = document.getElementById("badge-network-status");
    const text = document.getElementById("text-network-status");

    if (status.isOnline) {
      if (badge) badge.className = "connection-pill online";
      if (text) text.innerText = status.syncStatus === "pending" ? "Syncing..." : "Connected";
    } else {
      if (badge) badge.className = "connection-pill offline";
      if (text) text.innerText = `Offline (${status.pendingCount} queued)`;
    }
  }

  // ==========================================================================
  // COGNITIVE THERAPY ACTIVITIES (GAMES)
  // ==========================================================================
  startCognitiveGame(gameType) {
    this.activeGameType = gameType;
    this.navigateTo("screen-game-active");
    const currentLevel = this.cognitiveLevels[gameType] || 1;

    const onFinish = sessionData => {
      // 1. Calculate Activity Score
      const score = adaptiveEngine.calculateScore(
        sessionData.accuracy,
        sessionData.responseTime,
        sessionData.hintsUsed,
        sessionData.level
      );

      // 2. Evaluate with Explainable AI Engine
      const recentSessions = db.getGameSessions();
      const evaluation = adaptiveEngine.evaluateSession(
        {
          accuracy: sessionData.accuracy,
          responseTime: sessionData.responseTime,
          hintsUsed: sessionData.hintsUsed,
          currentLevel: sessionData.level
        },
        recentSessions
      );

      this.cognitiveLevels[gameType] = evaluation.recommendedLevel;
      const lvlBadge = document.getElementById(`badge-lvl-${gameType}`);
      if (lvlBadge) lvlBadge.innerText = `Level ${evaluation.recommendedLevel}`;

      // 3. Save session
      const saved = db.recordGameSession({
        userId: "elder_maya",
        gameType: sessionData.gameType,
        domain: sessionData.domain,
        level: sessionData.level,
        score,
        accuracy: sessionData.accuracy,
        responseTime: sessionData.responseTime,
        hintsUsed: sessionData.hintsUsed,
        attempts: sessionData.attempts,
        recommendedLevel: evaluation.recommendedLevel,
        adaptationReason: evaluation.reason
      });

      // 4. Trigger review alert if indicated
      if (evaluation.needsReviewAlert) {
        db.createAlert(
          "needs_review",
          "Cognitive Adherence Alert",
          "Recent exercise accuracy is lower than Maya's baseline average. Please review."
        );
      }

      // 5. Present Results
      this.presentGameResults(saved, evaluation);
    };

    if (gameType === "memory") {
      window.activeMemoryGame.start(currentLevel, onFinish);
    } else if (gameType === "attention") {
      window.activeAttentionGame.start(currentLevel, onFinish);
    } else if (gameType === "pattern") {
      window.activePatternGame.start(currentLevel, onFinish);
    } else if (gameType === "executive") {
      window.activeExecutiveGame.start(currentLevel, onFinish);
    }
  }

  presentGameResults(session, evaluation) {
    const lang = window.appState.language;
    document.getElementById("result-headline").innerText = t("well_done", lang);
    document.getElementById("result-subline").innerText = t("activity_completed", lang);

    document.getElementById("result-score-val").innerText = session.score;
    document.getElementById("result-acc-val").innerText = `${session.accuracy}%`;
    document.getElementById("result-time-val").innerText = `${session.response_time}s`;

    document.getElementById("ai-rule-title").innerText = evaluation.ruleTriggered;
    document.getElementById("ai-rule-details").innerHTML = `
      Current Level: <strong>Level ${evaluation.currentLevel}</strong> ➔ Recommended: <strong>Level ${evaluation.recommendedLevel}</strong><br>
      <strong>Clinical Rationale:</strong> "${evaluation.reason}"
    `;

    this.navigateTo("screen-game-result");
  }

  // ==========================================================================
  // PATIENT ROUTINE & MEDICATIONS
  // ==========================================================================
  renderPatientRoutine() {
    const list = document.getElementById("patient-routine-timeline-list");
    if (!list) return;

    const reminders = db.getReminders();
    const lang = window.appState.language;

    list.innerHTML = reminders.map(r => {
      const isDone = r.status === "acknowledged";
      const isMissed = r.status === "missed";
      const isLater = r.status === "postponed";
      const title = lang === "as" ? (r.title_as || r.title) : r.title;

      const badgeStyle = isDone
        ? "background:#DCFCE7; color:#15803D;"
        : isMissed
        ? "background:#FFE4E6; color:#BE123C;"
        : isLater
        ? "background:#FEF3C7; color:#B45309;"
        : "background:#EFF6FF; color:#0284C7;";

      const statusLabel = isDone
        ? (lang === "as" ? "হৈ গ'ল ✓" : "Completed ✓")
        : isMissed
        ? (lang === "as" ? "ছুটিল" : "Unacknowledged")
        : isLater
        ? (lang === "as" ? "পিছত" : "Postponed")
        : (lang === "as" ? "বাকী আছে" : "Upcoming");

      return `
        <div class="content-section-card" style="margin-bottom:0; display:flex; align-items:center; justify-content:space-between; padding:16px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="font-size:26px;">
              ${r.category === 'Medicine' ? '💊' : r.category === 'Food' ? '🍲' : r.category === 'Activity' ? '🚶‍♀️' : '📞'}
            </div>
            <div>
              <div style="font-size:12.5px; font-weight:700; color:var(--brand-primary);">${r.scheduled_time}</div>
              <div style="font-size:15px; font-weight:700; color:var(--text-primary); margin-top:2px;">${title}</div>
            </div>
          </div>
          <span style="font-size:12px; font-weight:700; padding:4px 12px; border-radius:var(--radius-full); ${badgeStyle}">
            ${statusLabel}
          </span>
        </div>
      `;
    }).join('');
  }

  triggerMedicationReminder() {
    const reminder = db.getReminders().find(r => r.category === "Medicine") || db.getReminders()[0];
    const modal = document.getElementById("modal-medication-reminder");
    const fill = document.getElementById("med-reminder-progress-fill");
    const label = document.getElementById("med-reminder-seconds-label");
    const title = document.getElementById("med-reminder-title");

    const lang = window.appState.language;
    if (title) {
      title.innerText = lang === "as" ? (reminder.title_as || reminder.title) : reminder.title;
    }

    if (modal) modal.style.display = "flex";

    reminderEngine.triggerReminder(
      reminder,
      (remaining, total) => {
        const pct = Math.max(0, (remaining / total) * 100);
        if (fill) fill.style.width = `${pct}%`;
        if (label) label.innerText = `${remaining}s remaining`;
      },
      result => {
        if (modal) modal.style.display = "none";
        this.renderPatientRoutine();
        this.renderCaregiverHub();

        if (result.action === "timeout") {
          alert(`Gentle check-in: The reminder has timed out. Caregiver Anita has been informed.`);
        }
      }
    );
  }

  // ==========================================================================
  // PATIENT FAMILY MEMORIES (REMINISCENCE)
  // ==========================================================================
  renderPatientFamilyMemories() {
    const list = document.getElementById("patient-family-cards-list");
    if (!list) return;

    const cards = db.getMemoryItems();
    const lang = window.appState.language;

    list.innerHTML = cards.map(c => `
      <div class="content-section-card" style="display:flex; align-items:center; gap:16px; padding:18px; margin-bottom:0;">
        <div style="width:60px; height:60px; border-radius:var(--radius-lg); background:#EDE9FE; display:flex; align-items:center; justify-content:center; font-size:32px; flex-shrink:0;">
          ${c.avatar || '👤'}
        </div>
        <div style="flex:1;">
          <h4 style="font-size:17px; font-weight:800; color:var(--text-primary); margin-bottom:2px;">${c.name}</h4>
          <span style="font-size:12px; font-weight:700; color:var(--brand-primary); display:block; margin-bottom:4px;">${c.relationship}</span>
          <p style="font-size:13px; color:var(--text-secondary); line-height:1.4;">
            ${lang === 'as' ? c.audio_text_as : c.audio_text_en}
          </p>
        </div>
        <button class="btn-audio-speak" style="width:44px; height:44px; font-size:18px;" onclick="audioManager.speak('${lang === 'as' ? c.audio_text_as : c.audio_text_en}', '${lang}')" title="Play Voice Memo">
          🔊
        </button>
      </div>
    `).join('');
  }

  sendPatientEmergencyAlert() {
    db.createAlert(
      "help_requested",
      "Assistance Requested",
      "Maya Borah requested help from her patient dashboard."
    );

    audioManager.playTone("gentle_chime");
    const lang = window.appState.language;
    audioManager.speak(
      lang === "as" ? "অনিতাৰ ফোনলৈ খবৰ পঠোৱা হ'ল। অতি সোনকালে সহায় আহি আছে।" : "Anita has been notified. Someone is right on the way.",
      lang
    );

    const box = document.getElementById("patient-help-sent-box");
    if (box) box.style.display = "block";
  }

  // ==========================================================================
  // CAREGIVER HUB ACTIONS & MODALS
  // ==========================================================================
  renderCaregiverHub() {
    const alerts = db.getAlerts();
    const reminders = db.getReminders();
    const sessions = db.getGameSessions();

    const sessEl = document.getElementById("cg-kpi-sessions");
    const lvlEl = document.getElementById("cg-kpi-level");
    const remEl = document.getElementById("cg-kpi-reminders");
    const altEl = document.getElementById("cg-kpi-alerts");
    const badgeEl = document.getElementById("cg-active-alert-badge");

    const ackCount = reminders.filter(r => r.status === "acknowledged").length;
    const activeAlerts = alerts.filter(a => a.status === "active");

    if (sessEl) sessEl.innerText = `${sessions.length} / 4`;
    if (lvlEl) lvlEl.innerText = `Level ${this.cognitiveLevels.memory}`;
    if (remEl) remEl.innerText = `${ackCount} / ${reminders.length}`;
    if (altEl) altEl.innerText = activeAlerts.length;
    if (badgeEl) badgeEl.innerText = `${activeAlerts.length} Active`;

    // Alerts Feed
    const feed = document.getElementById("caregiver-alerts-feed");
    if (feed) {
      if (activeAlerts.length === 0) {
        feed.innerHTML = `<p style="font-size:13.5px; color:var(--text-muted); padding:10px 0;">✓ All clear. No active alerts for Maya.</p>`;
      } else {
        feed.innerHTML = activeAlerts.map(a => `
          <div class="alert-feed-item ${a.type}">
            <div>
              <strong style="font-size:14px; display:block; margin-bottom:3px; color:var(--text-primary);">${a.title}</strong>
              <span style="font-size:12.5px; color:var(--text-secondary);">${a.message}</span>
            </div>
            <button class="btn-lang-toggle" style="background:#FFF; border-color:var(--border-subtle); color:var(--text-primary);" onclick="app.handleCaregiverAlert('${a.id}')">
              Mark Resolved ✓
            </button>
          </div>
        `).join('');
      }
    }

    // Caregiver Schedule
    const sched = document.getElementById("caregiver-schedule-timeline");
    if (sched) {
      sched.innerHTML = reminders.map(r => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #F1F5F9; font-size:13.5px;">
          <div>
            <strong>${r.scheduled_time}</strong> — ${r.title}
          </div>
          <span style="font-weight:700; font-size:12px; color:${r.status === 'acknowledged' ? 'var(--brand-success)' : r.status === 'missed' ? 'var(--brand-danger)' : 'var(--brand-warning)'}">
            ${r.status.toUpperCase()}
          </span>
        </div>
      `).join('');
    }
  }

  handleCaregiverAlert(alertId) {
    db.markAlertHandled(alertId);
    audioManager.playTone("tap");
    this.renderCaregiverHub();
  }

  openCaregiverModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.style.display = "flex";
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.style.display = "none";
  }

  saveNewMedication() {
    const title = document.getElementById("new-rem-title").value;
    const cat = document.getElementById("new-rem-category").value;
    const time = document.getElementById("new-rem-time").value;

    if (title) {
      db.addReminder({ title, category: cat, time });
      this.closeModal("modal-add-reminder");
      this.renderPatientRoutine();
      this.renderCaregiverHub();
      alert("Medication scheduled in Maya's daily regimen.");
    }
  }

  saveNewMemoryCard() {
    const name = document.getElementById("new-mem-name").value;
    const rel = document.getElementById("new-mem-rel").value;
    const voice = document.getElementById("new-mem-voice").value;

    if (name && rel) {
      db.addMemoryItem({ name, relationship: rel, audioEn: voice });
      this.closeModal("modal-add-memory");
      this.renderPatientFamilyMemories();
      alert("New reminiscence memory card added to Maya's album.");
    }
  }

  // ==========================================================================
  // DOCTOR CLINICAL WORKSPACE
  // ==========================================================================
  renderDoctorWorkspace() {
    const table = document.getElementById("doctor-domain-table");
    const notesBox = document.getElementById("doctor-consultation-notes-list");

    if (table) {
      const domains = [
        { name: "Visual Memory Recall", sessions: 18, acc: "86%", latency: "16s", trend: "Steady (L2)" },
        { name: "Selective Attention & Search", sessions: 14, acc: "72%", latency: "22s", trend: "Stable (L1)" },
        { name: "Pattern & Sequence Logic", sessions: 12, acc: "80%", latency: "19s", trend: "Improving (L2)" },
        { name: "Executive Function Sequencer", sessions: 9, acc: "68%", latency: "28s", trend: "Comfortable (L1)" }
      ];

      table.innerHTML = domains.map(d => `
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:10px 6px; font-weight:700; color:var(--text-primary);">${d.name}</td>
          <td style="padding:10px 6px;">${d.sessions}</td>
          <td style="padding:10px 6px; font-weight:700; color:var(--brand-primary);">${d.acc}</td>
          <td style="padding:10px 6px;">${d.latency}</td>
          <td style="padding:10px 6px; color:var(--brand-secondary); font-weight:600;">${d.trend}</td>
        </tr>
      `).join('');
    }

    if (notesBox) {
      const notes = db.getProfessionalNotes();
      notesBox.innerHTML = notes.map(n => `
        <div style="background:var(--bg-subtle); border-left:4px solid var(--brand-secondary); padding:12px 14px; border-radius:0 var(--radius-md) var(--radius-md) 0;">
          <div style="display:flex; justify-content:space-between; font-size:11.5px; color:var(--text-muted); margin-bottom:4px;">
            <strong>${n.doctor_name}</strong>
            <span>${new Date(n.created_at).toLocaleDateString()}</span>
          </div>
          <p style="font-size:13px; color:var(--text-primary); line-height:1.45;">${n.note}</p>
        </div>
      `).join('');
    }
  }

  submitDoctorClinicalNote() {
    const input = document.getElementById("doctor-new-note-input");
    if (input && input.value.trim()) {
      db.addDoctorNote("elder_maya", "doctor_barua", "Dr. B. Barua, MD", input.value.trim());
      input.value = "";
      this.renderDoctorWorkspace();
      alert("Clinical consultation note saved to patient electronic chart.");
    }
  }

  // ==========================================================================
  // PUBLIC HEALTH INFORMATICS & DATA EXPORT
  // ==========================================================================
  renderPublicHealthDashboard() {
    const metrics = db.getNERMetrics();

    const grid = document.getElementById("ner-states-participation-grid");
    if (grid && metrics.states) {
      grid.innerHTML = metrics.states.map(s => `
        <div style="background:var(--bg-subtle); border:1px solid var(--border-subtle); padding:14px; border-radius:var(--radius-lg);">
          <strong style="font-size:13.5px; color:var(--brand-primary-dark); display:block;">${s.state}</strong>
          <div style="font-size:22px; font-weight:800; margin:4px 0;">${s.active_users} <span style="font-size:12px; font-weight:500; color:var(--text-muted);">patients</span></div>
          <div style="font-size:11.5px; color:var(--text-secondary);">Adherence: <strong>${s.reminder_ack_rate}%</strong></div>
        </div>
      `).join('');
    }

    const table = document.getElementById("ner-district-table-body");
    if (table && metrics.districts) {
      table.innerHTML = metrics.districts.map(d => `
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:10px 6px; font-weight:700;">${d.district}</td>
          <td style="padding:10px 6px; color:var(--text-muted);">${d.state}</td>
          <td style="padding:10px 6px;">${d.active_users}</td>
          <td style="padding:10px 6px;">${d.completed_sessions}</td>
          <td style="padding:10px 6px; font-weight:700; color:var(--brand-success);">${d.ack_rate}%</td>
        </tr>
      `).join('');
    }
  }

  exportNERDatasetCSV() {
    const metrics = db.getNERMetrics();
    const rows = [
      ["District", "State", "Active_Patients", "Completed_Sessions", "Adherence_Rate_Pct"]
    ];

    metrics.districts.forEach(d => {
      rows.push([d.district, d.state, d.active_users, d.completed_sessions, d.ack_rate]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "RECONNECT_NER_DeIdentified_Analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  refreshActiveScreenData() {
    if (this.currentScreen === "screen-caregiver-home") this.renderCaregiverHub();
    if (this.currentScreen === "screen-doctor-home") this.renderDoctorWorkspace();
    if (this.currentScreen === "screen-government-home") this.renderPublicHealthDashboard();
    if (this.currentScreen === "screen-elder-routine") this.renderPatientRoutine();
  }
}

// Global instance
const app = new ReconnectApp();
window.app = app;

document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
