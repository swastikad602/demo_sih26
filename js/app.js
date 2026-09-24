// RECONNECT Main Application Controller & Role Router
// Manages State, Navigation, Games, Reminders, and Multi-Role Dashboards

class ReconnectApp {
  constructor() {
    this.screenHistory = ["screen-welcome"];
    this.currentScreen = "screen-welcome";
    this.currentRole = null;
    this.enteredPin = "";
    this.viewportMode = "mobile";
    this.activeGameType = null;
    this.currentElderLevel = {
      memory: 1,
      attention: 1,
      pattern: 1,
      executive: 1
    };

    window.appState = {
      language: "en", // "en" or "as"
      user: null
    };
  }

  init() {
    // Set up database subscription for real-time online/offline and sync state
    db.subscribe(status => {
      this.updateConnectionUI(status);
      this.refreshActiveScreens();
    });

    // Initial render
    this.updateLanguageUI();
    this.renderRoutineTimeline();
    this.renderFamilyCards();
    this.renderCaregiverDashboard();
    this.renderDoctorDashboard();
    this.renderGovernmentDashboard();
  }

  // ==========================================================================
  // NAVIGATION & VIEWPORT MANAGEMENT
  // ==========================================================================
  navigateTo(screenId, pushHistory = true) {
    const allScreens = document.querySelectorAll(".screen-view");
    allScreens.forEach(s => s.classList.remove("active"));

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add("active");
      if (pushHistory && this.currentScreen !== screenId) {
        this.screenHistory.push(screenId);
      }
      this.currentScreen = screenId;
    }

    // Scroll to top of viewport
    const content = document.getElementById("app-content-viewport");
    if (content) content.scrollTop = 0;

    // Update Header Bar titles and back button visibility
    this.updateHeaderContext(screenId);

    // Refresh context data
    if (screenId === "screen-elder-routine") this.renderRoutineTimeline();
    if (screenId === "screen-elder-people") this.renderFamilyCards();
    if (screenId === "screen-caregiver-home") this.renderCaregiverDashboard();
    if (screenId === "screen-doctor-home") this.renderDoctorDashboard();
    if (screenId === "screen-government-home") this.renderGovernmentDashboard();
  }

  handleBackNavigation() {
    if (this.screenHistory.length > 1) {
      this.screenHistory.pop(); // Remove current
      const prevScreen = this.screenHistory[this.screenHistory.length - 1];
      this.navigateTo(prevScreen, false);
    } else {
      this.navigateTo("screen-welcome", false);
    }
  }

  updateHeaderContext(screenId) {
    const backBtn = document.getElementById("btn-header-back");
    const titleEl = document.getElementById("header-app-title");
    const subEl = document.getElementById("header-app-subtitle");

    if (screenId === "screen-welcome") {
      if (backBtn) backBtn.style.display = "none";
      if (titleEl) titleEl.innerText = "RECONNECT";
      if (subEl) subEl.innerText = "Cognitive Gaming & Routine Assistance";
    } else {
      if (backBtn) backBtn.style.display = "flex";

      if (screenId.includes("elder")) {
        if (titleEl) titleEl.innerText = window.appState.language === "as" ? "ৰিকানেক্ট (মায়া)" : "RECONNECT (Maya)";
        if (subEl) subEl.innerText = window.appState.language === "as" ? "মনোযোগ আৰু নিয়মসূচী" : "Cognitive Care & Routine";
      } else if (screenId.includes("caregiver")) {
        if (titleEl) titleEl.innerText = "Caregiver Hub";
        if (subEl) subEl.innerText = "Maya's Care Coordinator";
      } else if (screenId.includes("doctor")) {
        if (titleEl) titleEl.innerText = "Doctor Portal";
        if (subEl) subEl.innerText = "Clinical Domain Progress";
      } else if (screenId.includes("government")) {
        if (titleEl) titleEl.innerText = "NER Public Health";
        if (subEl) subEl.innerText = "8 States Aggregate Metrics";
      } else if (screenId === "screen-chat-mitra") {
        if (titleEl) titleEl.innerText = window.appState.language === "as" ? "মিত্ৰা এআই সংগী" : "Mitra AI Companion";
        if (subEl) subEl.innerText = window.appState.language === "as" ? "মায়াৰ ব্যক্তিগত সংগী" : "Voice & Memory Assistant";
      } else {
        if (titleEl) titleEl.innerText = "RECONNECT";
        if (subEl) subEl.innerText = "NER Dementia Care Platform";
      }
    }
  }

  setViewportMode(mode) {
    this.viewportMode = mode;
    const shell = document.getElementById("device-shell");
    const btns = {
      mobile: document.getElementById("btn-device-mobile"),
      tablet: document.getElementById("btn-device-tablet"),
      desktop: document.getElementById("btn-device-desktop")
    };

    Object.keys(btns).forEach(k => {
      if (btns[k]) btns[k].classList.toggle("active", k === mode);
    });

    if (shell) {
      shell.className = `device-frame mode-${mode}`;
    }
  }

  quickJumpRole(role) {
    if (!role) return;
    if (role === "welcome") this.navigateTo("screen-welcome");
    else if (role === "role_select") this.navigateTo("screen-role-select");
    else if (role === "login_elder") this.navigateTo("screen-login-elder");
    else if (role === "login_caregiver") this.navigateTo("screen-login-caregiver");
    else if (role === "login_doctor") this.navigateTo("screen-login-doctor");
    else if (role === "login_gov") this.navigateTo("screen-login-government");
    else if (role === "elder_home") this.loginAsRole("elder");
    else if (role === "chat_mitra") { this.loginAsRole("elder"); this.navigateTo("screen-chat-mitra"); }
    else if (role === "caregiver_home") this.loginAsRole("caregiver");
    else if (role === "doctor_home") this.loginAsRole("doctor");
    else if (role === "gov_home") this.loginAsRole("government");

    document.getElementById("quick-role-select").value = "";
  }


  // ==========================================================================
  // SEPARATE DEDICATED LOGIN HANDLERS FOR ALL 4 ROLES
  // ==========================================================================
  handlePinKey(digit) {
    if (this.enteredPin.length < 4) {
      this.enteredPin += digit;
      audioManager.playTone("tap");
      this.updatePinDots();

      if (this.enteredPin.length === 4) {
        setTimeout(() => {
          if (this.enteredPin === "1234") {
            this.loginAsRole("elder");
          } else {
            audioManager.playTone("tap");
            alert("Please enter the demo PIN: 1234 or use 1-Tap Quick Login");
            this.handlePinClear();
          }
        }, 200);
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
      const dot = document.getElementById(`pin-dot-${i}`);
      if (dot) {
        dot.classList.toggle("filled", i <= this.enteredPin.length);
      }
    }
  }

  loginAsRole(role) {
    this.currentRole = role;
    this.handlePinClear();

    if (role === "elder") {
      window.appState.user = db.getUser("elder_maya");
      this.navigateTo("screen-elder-home");
      const lang = window.appState.language;
      audioManager.speak(
        lang === "as" ? "সুপ্ৰভাত মায়া! আজি কি খেলিব বিচাৰিব?" : "Good morning Maya. What would you like to do today?",
        lang
      );
    } else if (role === "caregiver") {
      window.appState.user = db.getUser("caregiver_anita");
      this.renderCaregiverDashboard();
      this.navigateTo("screen-caregiver-home");
    } else if (role === "doctor") {
      window.appState.user = db.getUser("doctor_barua");
      this.renderDoctorDashboard();
      this.navigateTo("screen-doctor-home");
    } else if (role === "government") {
      window.appState.user = db.getUser("gov_admin");
      this.renderGovernmentDashboard();
      this.navigateTo("screen-government-home");
    }
  }

  confirmConsentAndProceed() {
    const chk = document.getElementById("consent-checkbox");
    if (chk && chk.checked) {
      this.navigateTo("screen-role-select");
    } else {
      alert("Please accept the demonstration data consent to proceed.");
    }
  }

  // ==========================================================================
  // LANGUAGE & AUDIO TOGGLING
  // ==========================================================================
  toggleLanguage() {
    window.appState.language = window.appState.language === "en" ? "as" : "en";
    this.updateLanguageUI();
  }

  updateLanguageUI() {
    const lang = window.appState.language;
    
    // Header & Toolbar buttons
    const hdrBtn = document.getElementById("header-lang-btn");
    const tblBtn = document.getElementById("toolbar-lang-text");
    if (hdrBtn) hdrBtn.innerText = lang === "as" ? "English" : "অসমীয়া";
    if (tblBtn) tblBtn.innerText = lang === "as" ? "Language: অসমীয়া" : "Language: English";

    // Update Elder Greeting
    const greetingText = document.getElementById("elder-greeting-text");
    const greetingSub = document.getElementById("elder-greeting-sub");
    if (greetingText) greetingText.innerText = t("greeting_maya", lang);
    if (greetingSub) greetingSub.innerText = t("greeting_subtitle", lang);

    // Update all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.innerText = t(key, lang);
    });

    // Re-render lists
    this.renderRoutineTimeline();
    this.renderFamilyCards();
  }

  // ==========================================================================
  // CONNECTION & OFFLINE-FIRST SYNC ENGINE
  // ==========================================================================
  toggleConnection() {
    const isOnline = db.toggleSimulatedNetwork();
    audioManager.playTone("tap");
  }

  updateConnectionUI(status) {
    const tblPill = document.getElementById("toolbar-connection-pill");
    const tblText = document.getElementById("toolbar-connection-text");
    const hdrBadge = document.getElementById("header-connection-indicator");
    const shellIcon = document.getElementById("shell-status-icon");

    if (status.isOnline) {
      if (tblPill) {
        tblPill.className = "status-pill online";
      }
      if (tblText) {
        tblText.innerText = status.syncStatus === "pending" ? "Syncing..." : "Online — Synced ✓";
      }
      if (hdrBadge) {
        hdrBadge.className = "connection-indicator-badge online";
        hdrBadge.innerText = status.syncStatus === "pending" ? "🟡 Syncing..." : "🟢 Connected";
      }
      if (shellIcon) shellIcon.innerText = "🟢";
    } else {
      if (tblPill) {
        tblPill.className = "status-pill offline";
      }
      if (tblText) {
        tblText.innerText = `Offline — ${status.pendingCount} Saved Locally`;
      }
      if (hdrBadge) {
        hdrBadge.className = "connection-indicator-badge offline";
        hdrBadge.innerText = `🟠 Offline (${status.pendingCount} saved)`;
      }
      if (shellIcon) shellIcon.innerText = "🟠";
    }
  }

  // ==========================================================================
  // 90-SECOND REMINDER RESPONSE WORKFLOW & DEMO TIMER
  // ==========================================================================
  toggleReminderTimerMode() {
    reminderEngine.setDemoMode(!reminderEngine.demoMode);
    const pill = document.getElementById("toolbar-timer-text");
    if (pill) {
      pill.innerText = reminderEngine.demoMode ? "Timer: 10s (Judge Demo)" : "Timer: 90s (Realistic)";
    }
    audioManager.playTone("tap");
  }

  triggerDemoMedicineReminder() {
    const reminder = db.getReminders().find(r => r.category === "Medicine") || db.getReminders()[0];
    const modal = document.getElementById("modal-reminder-workflow");
    const fill = document.getElementById("reminder-timer-fill");
    const label = document.getElementById("reminder-time-remaining-label");
    const title = document.getElementById("modal-reminder-title");

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
        if (label) label.innerText = `${remaining}s remaining (${reminderEngine.demoMode ? 'Demo Mode' : 'Standard 90s'})`;
      },
      result => {
        if (modal) modal.style.display = "none";
        this.renderRoutineTimeline();
        this.renderCaregiverDashboard();

        if (result.action === "timeout") {
          alert(`Follow-up Check: ${result.message}\n\nA gentle notification has been dispatched to Caregiver Anita's dashboard.`);
        }
      }
    );
  }

  // ==========================================================================
  // COGNITIVE GAMES LAUNCH & EXPLAINABLE AI ADAPTATION
  // ==========================================================================
  launchGame(gameType) {
    this.activeGameType = gameType;
    this.navigateTo("screen-game-active");
    const currentLevel = this.currentElderLevel[gameType] || 1;

    const onComplete = sessionMetrics => {
      // 1. Calculate non-clinical Activity Score
      const score = adaptiveEngine.calculateScore(
        sessionMetrics.accuracy,
        sessionMetrics.responseTime,
        sessionMetrics.hintsUsed,
        sessionMetrics.level
      );

      // 2. Evaluate with Explainable Adaptive AI Engine (Rules 1-5)
      const recentSessions = db.getGameSessions();
      const evaluation = adaptiveEngine.evaluateSession(
        {
          accuracy: sessionMetrics.accuracy,
          responseTime: sessionMetrics.responseTime,
          hintsUsed: sessionMetrics.hintsUsed,
          currentLevel: sessionMetrics.level
        },
        recentSessions
      );

      // Update current difficulty level for next session
      this.currentElderLevel[gameType] = evaluation.recommendedLevel;
      const tag = document.getElementById(`level-tag-${gameType}`);
      if (tag) tag.innerText = `Level ${evaluation.recommendedLevel}`;

      // 3. Save Game Session to Firestore Store / Offline Cache
      const savedSession = db.recordGameSession({
        userId: "elder_maya",
        gameType: sessionMetrics.gameType,
        domain: sessionMetrics.domain,
        level: sessionMetrics.level,
        score,
        accuracy: sessionMetrics.accuracy,
        responseTime: sessionMetrics.responseTime,
        hintsUsed: sessionMetrics.hintsUsed,
        attempts: sessionMetrics.attempts,
        recommendedLevel: evaluation.recommendedLevel,
        adaptationReason: evaluation.reason
      });

      // 4. Trigger Caregiver "Needs Review" alert if Rule 5 tripped
      if (evaluation.needsReviewAlert) {
        db.createAlert(
          "needs_review",
          "Activity Review Required",
          "Recent activity performance is lower than the user's previous average. Please review."
        );
      }

      // 5. Present Game Result with Transparent AI Rationale
      this.showGameResults(savedSession, evaluation);
    };

    if (gameType === "memory") {
      window.activeMemoryGame.start(currentLevel, onComplete);
    } else if (gameType === "attention") {
      window.activeAttentionGame.start(currentLevel, onComplete);
    } else if (gameType === "pattern") {
      window.activePatternGame.start(currentLevel, onComplete);
    } else if (gameType === "executive") {
      window.activeExecutiveGame.start(currentLevel, onComplete);
    }
  }

  showGameResults(session, evaluation) {
    const lang = window.appState.language;
    document.getElementById("result-headline").innerText = t("well_done", lang);
    document.getElementById("result-subline").innerText = t("activity_completed", lang);

    document.getElementById("result-score-val").innerText = session.score;
    document.getElementById("result-acc-val").innerText = `${session.accuracy}%`;
    document.getElementById("result-time-val").innerText = `${session.response_time}s`;

    document.getElementById("ai-rule-title").innerText = evaluation.ruleTriggered;
    document.getElementById("ai-rule-details").innerHTML = `
      Previous: <strong>Level ${evaluation.currentLevel}</strong> ➔ Recommended: <strong>Level ${evaluation.recommendedLevel}</strong><br>
      <strong>Why?</strong> "${evaluation.reason}"
    `;

    this.navigateTo("screen-game-result");
  }

  // ==========================================================================
  // ROUTINE & REMINDERS LIST
  // ==========================================================================
  renderRoutineTimeline() {
    const container = document.getElementById("elder-routine-timeline-list");
    if (!container) return;

    const reminders = db.getReminders();
    const lang = window.appState.language;

    container.innerHTML = reminders.map(r => {
      const isDone = r.status === "acknowledged";
      const isMissed = r.status === "missed";
      const isLater = r.status === "postponed";
      const title = lang === "as" ? (r.title_as || r.title) : r.title;

      const badgeColor = isDone ? "#DCFCE7; color:#166534;" : isMissed ? "#FFE4E6; color:#9F1239;" : isLater ? "#FEF3C7; color:#92400E;" : "#EFF6FF; color:#1E40AF;";
      const statusText = isDone ? (lang === "as" ? "হৈ গ'ল ✓" : "Done ✓") : isMissed ? (lang === "as" ? "ছুটিল" : "Missed") : isLater ? (lang === "as" ? "পিছত" : "Later") : (lang === "as" ? "বাকী আছে" : "Pending");

      return `
        <div class="dashboard-section-card" style="margin-bottom:0; display:flex; align-items:center; justify-content:space-between; padding:16px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="font-size:24px;">
              ${r.category === 'Medicine' ? '💊' : r.category === 'Food' ? '🍲' : r.category === 'Activity' ? '🚶‍♀️' : '📞'}
            </div>
            <div>
              <div style="font-size:12px; font-weight:700; color:var(--color-primary-dark);">${r.scheduled_time}</div>
              <div style="font-size:15px; font-weight:700; color:var(--color-text-main); margin-top:2px;">${title}</div>
            </div>
          </div>
          <span style="font-size:12px; font-weight:700; padding:4px 10px; border-radius:var(--radius-full); background:${badgeColor}">
            ${statusText}
          </span>
        </div>
      `;
    }).join('');
  }

  speakRoutineList() {
    const lang = window.appState.language;
    const reminders = db.getReminders();
    const text = reminders.map(r => `${r.scheduled_time}: ${lang === 'as' ? (r.title_as || r.title) : r.title}`).join('. ');
    audioManager.speak(text, lang);
  }

  // ==========================================================================
  // FAMILY MEMORIES (MY PEOPLE)
  // ==========================================================================
  renderFamilyCards() {
    const container = document.getElementById("elder-family-cards-list");
    if (!container) return;

    const cards = db.getMemoryItems();
    const lang = window.appState.language;

    container.innerHTML = cards.map(c => `
      <div class="dashboard-section-card" style="display:flex; align-items:center; gap:16px; padding:18px; margin-bottom:0;">
        <div style="width:64px; height:64px; border-radius:var(--radius-lg); background:#EDE9FE; display:flex; align-items:center; justify-content:center; font-size:36px; flex-shrink:0;">
          ${c.avatar || '👤'}
        </div>
        <div style="flex:1;">
          <h3 style="font-size:18px; font-weight:800; margin-bottom:2px;">${c.name}</h3>
          <p style="font-size:13px; font-weight:600; color:var(--color-primary-dark); margin-bottom:6px;">${c.relationship}</p>
          <p style="font-size:12.5px; color:var(--color-text-secondary); line-height:1.35;">
            ${lang === 'as' ? c.audio_text_as : c.audio_text_en}
          </p>
        </div>
        <button class="btn-back-nav" style="background:#F0FDFA; color:#0D9488; border-color:#99F6E4;" onclick="audioManager.speak('${lang === 'as' ? c.audio_text_as : c.audio_text_en}', '${lang}')" title="Listen Voice">
          🔊
        </button>
      </div>
    `).join('');
  }

  // ==========================================================================
  // ELDER HELP
  // ==========================================================================
  sendHelpAlert() {
    db.createAlert(
      "help_requested",
      "Immediate Assistance Requested",
      "Maya pressed the HELP button on her home screen."
    );

    audioManager.playTone("gentle_chime");
    const lang = window.appState.language;
    audioManager.speak(
      lang === "as" ? "অনিতাৰ ফোনলৈ খবৰ পঠোৱা হ'ল। অতি সোনকালে সহায় আহি আছে।" : "Anita has been notified. Someone is right on the way.",
      lang
    );

    const box = document.getElementById("help-confirmation-box");
    if (box) box.style.display = "block";
  }

  // ==========================================================================
  // CAREGIVER DASHBOARD & ALERTS
  // ==========================================================================
  renderCaregiverDashboard() {
    const alerts = db.getAlerts();
    const reminders = db.getReminders();
    const sessions = db.getGameSessions();

    // KPIs
    const sessEl = document.getElementById("cg-kpi-sessions");
    const lvlEl = document.getElementById("cg-kpi-level");
    const remEl = document.getElementById("cg-kpi-reminders");
    const altEl = document.getElementById("cg-kpi-alerts");
    const badgeEl = document.getElementById("cg-alert-count-badge");

    const ackCount = reminders.filter(r => r.status === "acknowledged").length;
    const activeAlerts = alerts.filter(a => a.status === "active");

    if (sessEl) sessEl.innerText = `${sessions.length} Completed`;
    if (lvlEl) lvlEl.innerText = `Level ${this.currentElderLevel.memory}`;
    if (remEl) remEl.innerText = `${ackCount} / ${reminders.length}`;
    if (altEl) altEl.innerText = activeAlerts.length;
    if (badgeEl) badgeEl.innerText = `${activeAlerts.length} Active`;

    // Alerts Container
    const alertBox = document.getElementById("caregiver-alerts-container");
    if (alertBox) {
      if (activeAlerts.length === 0) {
        alertBox.innerHTML = `<p style="font-size:13px; color:var(--color-text-muted); padding:10px 0;">✓ No pending alerts. Maya's routine is peaceful.</p>`;
      } else {
        alertBox.innerHTML = activeAlerts.map(a => `
          <div class="alert-row-item ${a.type}">
            <div>
              <strong style="font-size:13.5px; display:block; margin-bottom:2px;">${a.title}</strong>
              <span style="font-size:12px; color:var(--color-text-main);">${a.message}</span>
            </div>
            <button class="btn-handle-alert" onclick="app.handleCaregiverAlert('${a.id}')">
              Mark Handled ✓
            </button>
          </div>
        `).join('');
      }
    }

    // Routine timeline overview
    const routineBox = document.getElementById("caregiver-routine-list");
    if (routineBox) {
      routineBox.innerHTML = reminders.map(r => `
        <div style="display:flex; justify-content:space-between; font-size:13px; padding:8px 0; border-bottom:1px solid #F1F5F9;">
          <span><strong>${r.scheduled_time}</strong> — ${r.title}</span>
          <span style="font-weight:700; color:${r.status === 'acknowledged' ? '#16A34A' : r.status === 'missed' ? '#E11D48' : '#D97706'}">
            ${r.status.toUpperCase()}
          </span>
        </div>
      `).join('');
    }
  }

  handleCaregiverAlert(alertId) {
    db.markAlertHandled(alertId);
    audioManager.playTone("tap");
    this.renderCaregiverDashboard();
  }

  openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.style.display = "flex";
  }

  closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.style.display = "none";
  }

  saveCaregiverReminder() {
    const title = document.getElementById("input-rem-title").value;
    const cat = document.getElementById("input-rem-category").value;
    const time = document.getElementById("input-rem-time").value;

    if (title) {
      db.addReminder({ title, category: cat, time });
      this.closeModal("modal-add-reminder");
      this.renderRoutineTimeline();
      this.renderCaregiverDashboard();
      alert("Reminder scheduled successfully!");
    }
  }

  saveCaregiverMemory() {
    const name = document.getElementById("input-mem-name").value;
    const rel = document.getElementById("input-mem-rel").value;
    const avatar = document.getElementById("input-mem-avatar").value || "👤";
    const audio = document.getElementById("input-mem-audio").value;

    if (name && rel) {
      db.addMemoryItem({ name, relationship: rel, avatar, audioEn: audio });
      this.closeModal("modal-add-memory");
      this.renderFamilyCards();
      alert("Family memory card added!");
    }
  }

  saveCaregiverElder() {
    this.closeModal("modal-add-elder");
    alert("Elder profile updated for Maya (72, Assam)!");
  }

  // ==========================================================================
  // DOCTOR DASHBOARD & CLINICAL OBSERVATION NOTES
  // ==========================================================================
  renderDoctorDashboard() {
    const tableBody = document.getElementById("doctor-domain-table-body");
    const notesBox = document.getElementById("doctor-notes-list");

    if (tableBody) {
      const domains = [
        { name: "Memory Recall", sessions: 18, avgAcc: "86%", time: "16s", trend: "Steady (L2)" },
        { name: "Attention & Focus", sessions: 14, avgAcc: "72%", time: "22s", trend: "Stable (L1)" },
        { name: "Pattern Recognition", sessions: 12, avgAcc: "80%", time: "19s", trend: "Improving (L2)" },
        { name: "Executive Function", sessions: 9, avgAcc: "68%", time: "28s", trend: "Comfortable (L1)" }
      ];

      tableBody.innerHTML = domains.map(d => `
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:10px 4px; font-weight:700;">${d.name}</td>
          <td style="padding:10px 4px;">${d.sessions}</td>
          <td style="padding:10px 4px; color:#0D9488; font-weight:700;">${d.avgAcc}</td>
          <td style="padding:10px 4px;">${d.time}</td>
          <td style="padding:10px 4px; color:#0284C7;">${d.trend}</td>
        </tr>
      `).join('');
    }

    if (notesBox) {
      const notes = db.getProfessionalNotes();
      notesBox.innerHTML = notes.map(n => `
        <div style="background:#F8FAFC; border-left:4px solid #0284C7; padding:10px 12px; border-radius:0 var(--radius-md) var(--radius-md) 0;">
          <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748B; margin-bottom:4px;">
            <strong>${n.doctor_name}</strong>
            <span>${new Date(n.created_at).toLocaleDateString()}</span>
          </div>
          <p style="font-size:12.5px; color:#334155; line-height:1.4;">${n.note}</p>
        </div>
      `).join('');
    }
  }

  submitDoctorNote() {
    const input = document.getElementById("input-doctor-note");
    if (input && input.value.trim()) {
      db.addDoctorNote("elder_maya", "doctor_barua", "Dr. B. Barua, MD", input.value.trim());
      input.value = "";
      this.renderDoctorDashboard();
      alert("Clinical observation note saved to patient record!");
    }
  }

  // ==========================================================================
  // GOVERNMENT DASHBOARD (8 NER STATES AGGREGATE)
  // ==========================================================================
  renderGovernmentDashboard() {
    const metrics = db.getNERMetrics();

    // 8 NER State Cards Grid
    const stateGrid = document.getElementById("ner-states-cards-grid");
    if (stateGrid && metrics.states) {
      stateGrid.innerHTML = metrics.states.map(s => `
        <div style="background:var(--color-bg-app); border:1px solid var(--color-border); padding:12px; border-radius:var(--radius-md);">
          <strong style="font-size:13px; display:block; color:var(--color-primary-dark);">${s.state}</strong>
          <div style="font-size:18px; font-weight:800; margin:4px 0;">${s.active_users} <span style="font-size:11px; font-weight:500; color:#64748B;">users</span></div>
          <div style="font-size:11px; color:#64748B;">Ack Rate: <strong>${s.reminder_ack_rate}%</strong></div>
        </div>
      `).join('');
    }

    // District Table
    const distTable = document.getElementById("gov-district-table-body");
    if (distTable && metrics.districts) {
      distTable.innerHTML = metrics.districts.map(d => `
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:8px 6px; font-weight:700;">${d.district}</td>
          <td style="padding:8px 6px; color:#64748B;">${d.state}</td>
          <td style="padding:8px 6px;">${d.active_users}</td>
          <td style="padding:8px 6px;">${d.completed_sessions}</td>
          <td style="padding:8px 6px; font-weight:700; color:#16A34A;">${d.ack_rate}%</td>
        </tr>
      `).join('');
    }
  }

  refreshActiveScreens() {
    if (this.currentScreen === "screen-caregiver-home") this.renderCaregiverDashboard();
    if (this.currentScreen === "screen-doctor-home") this.renderDoctorDashboard();
    if (this.currentScreen === "screen-government-home") this.renderGovernmentDashboard();
    if (this.currentScreen === "screen-elder-routine") this.renderRoutineTimeline();
  }

  // ==========================================================================
  // 5-MINUTE HACKATHON GUIDED JUDGE DEMO
  // ==========================================================================
  startHackathonDemoTour() {
    const steps = [
      "Welcome to the RECONNECT 5-Minute Hackathon Demo!",
      "Step 1: Notice the 4 role interfaces with separate dedicated logins.",
      "Navigating to Elder Login..."
    ];
    alert(steps.join("\n\n"));
    this.navigateTo("screen-login-elder");
  }
}

// Global App Instance
const app = new ReconnectApp();
window.app = app;

document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
