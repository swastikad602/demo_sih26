// Master App Controller: Role Switching, Patient Onboarding, Language, & Offline Management

const AppState = {
  currentRole: 'patient', // 'patient', 'caregiver', 'doctor', 'govt'
  currentPatient: null,
  allPatients: [],
  
  async init() {
    // 1. Initialize IndexedDB
    await DB.init();
    
    // 2. Initialize Voice Engine
    VoiceEngine.init();
    
    // 3. Initialize Chatbot Companion
    ChatbotCompanion.init();
    
    // 4. Load Patients
    await this.loadPatients();
    
    // 5. Restore saved language
    const savedLang = localStorage.getItem('ner_pref_lang') || 'en';
    I18N.setLanguage(savedLang);
    const langSelect = document.getElementById('lang-selector');
    if (langSelect) langSelect.value = savedLang;
    
    // 6. Set initial role view
    this.switchRole('patient');
    ReminderSystem.startScheduleMonitor();
    
    // Register Service Worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/static/sw.js').then(reg => {
        console.log('ServiceWorker registered:', reg.scope);
      }).catch(err => {
        console.log('ServiceWorker registration skipped or unsupported:', err);
      });
    }
  },
  
  async loadPatients() {
    this.allPatients = await DB.getAllItems('patients');
    if (this.allPatients.length === 0) {
      // Create default patient if empty
      const defaultPat = {
        id: "pat-ner-001",
        name: "Biren Gogoi",
        age: 72,
        gender: "Male",
        photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
        state: "Assam",
        district: "Kamrup Metropolitan",
        language: "as",
        condition_stage: "Mild Cognitive Impairment",
        favorite_songs: ["O Mur Apunar Dekh (Bhupen Hazarika)", "Borgeet - Madhavdev"],
        cultural_interests: ["Bihu Festival", "Majuli Mask Craft", "Assam Tea Gardens", "Assamese Jaapi & Gamosa"],
        favorite_poems: ["Kadamoni - Lakshminath Bezbaroa"],
        medications: [
          { id: "med-1", name: "Donepezil", dosage: "5 mg", time: "08:00 AM", instructions: "Take with water after breakfast" },
          { id: "med-2", name: "Multivitamin Senior", dosage: "1 tablet", time: "01:00 PM", instructions: "Take after lunch" }
        ],
        daily_routine: [
          { time: "07:00 AM", activity: "Morning Garden Walk & Sunlight", icon: "walk" },
          { time: "08:00 AM", activity: "Breakfast & Morning Medication", icon: "medication" },
          { time: "10:30 AM", activity: "Cognitive Gaming & Memory Brain Gym", icon: "game" },
          { time: "01:00 PM", activity: "Lunch & Hydration Check", icon: "food" },
          { time: "05:00 PM", activity: "Evening Assam Tea & Mitra AI Chat", icon: "chat" }
        ],
        baseline_difficulty: 1,
        current_difficulty: 1,
        emergency_contact: "+91 98640 12345 (Son: Siddhartha Gogoi)"
      };
      await DB.putItem('patients', defaultPat);
      const defaultSchedules = [
        { id: 'sched-default-walk', patient_id: defaultPat.id, category: 'walk', title: 'Morning Garden Walk', description: 'Take a gentle walk and enjoy some sunlight.', reminder_time: '07:00', days_of_week: [], is_enabled: true },
        { id: 'sched-default-medicine', patient_id: defaultPat.id, category: 'medication', title: 'Morning Donepezil', description: 'Take Donepezil 5 mg with water after breakfast.', reminder_time: '08:00', days_of_week: [], is_enabled: true },
        { id: 'sched-default-brain-gym', patient_id: defaultPat.id, category: 'brain_gym', title: 'Brain Gym Time', description: 'Spend a few minutes with your memory exercises.', reminder_time: '10:30', days_of_week: [], is_enabled: true },
        { id: 'sched-default-hydration', patient_id: defaultPat.id, category: 'hydration', title: 'Hydration Check', description: 'Please drink a glass of water with lunch.', reminder_time: '13:00', days_of_week: [], is_enabled: true }
      ];
      for (const schedule of defaultSchedules) await DB.queueForSync('scheduled_reminder', schedule);
      this.allPatients = [defaultPat];
    }
    
    this.currentPatient = this.allPatients[0];
    this.updatePatientSelectorUI();
  },
  
  updatePatientSelectorUI() {
    const sel = document.getElementById('global-patient-selector');
    if (!sel) return;
    sel.innerHTML = this.allPatients.map(p => `
      <option value="${p.id}" ${this.currentPatient && this.currentPatient.id === p.id ? 'selected' : ''}>
        ${p.name} (${p.state} - ${p.condition_stage})
      </option>
    `).join('');
  },
  
  async handlePatientChange(patientId) {
    const p = this.allPatients.find(item => item.id === patientId);
    if (p) {
      this.currentPatient = p;
      if (DoctorView) DoctorView.activePatientId = p.id;
      this.renderCurrentRoleView();
    }
  },
  
  switchRole(role) {
    this.currentRole = role;
    
    // Update role navigation buttons
    document.querySelectorAll('.role-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-role') === role);
    });
    
    // Hide all role containers
    document.getElementById('patient-role-container').style.display = 'none';
    document.getElementById('caregiver-role-container').style.display = 'none';
    document.getElementById('doctor-role-container').style.display = 'none';
    document.getElementById('govt-role-container').style.display = 'none';
    
    // Show active container
    const activeCont = document.getElementById(`${role}-role-container`);
    if (activeCont) activeCont.style.display = 'block';
    
    this.renderCurrentRoleView();
  },
  
  renderCurrentRoleView() {
    if (this.currentRole === 'patient') {
      this.renderPatientHome();
    } else if (this.currentRole === 'caregiver') {
      CaregiverView.init();
    } else if (this.currentRole === 'doctor') {
      DoctorView.init();
    } else if (this.currentRole === 'govt') {
      GovtView.init();
    }
  },
  
  async renderPatientHome() {
    const p = this.currentPatient || {};
    const welcomeTitle = document.getElementById('patient-welcome-name');
    if (welcomeTitle) {
      welcomeTitle.textContent = I18N.t('patient_welcome', { name: p.name || 'Friend' });
    }
    
    // Render Daily Schedule
    const scheduleList = document.getElementById('patient-routine-list');
    if (scheduleList) {
      const scheduledReminders = (await DB.getAllItems('scheduled_reminders'))
        .filter(item => item.patient_id === p.id && item.is_enabled)
        .sort((a, b) => a.reminder_time.localeCompare(b.reminder_time));
      const routine = scheduledReminders.length ? scheduledReminders.map(item => ({
        time: this.formatReminderTime(item.reminder_time), activity: item.title, icon: item.category
      })) : (p.daily_routine && p.daily_routine.length > 0) ? p.daily_routine : [
        { time: "08:00 AM", activity: "Breakfast & Morning Pill", icon: "medication" },
        { time: "10:30 AM", activity: "Memory Games", icon: "game" },
        { time: "01:00 PM", activity: "Nutritious Lunch", icon: "food" },
        { time: "05:00 PM", activity: "Assam Tea & Mitra Chat", icon: "chat" }
      ];
      
      const iconMap = {
        'walk': '🚶‍♂️',
        'medication': '💊',
        'game': '🧩',
        'food': '🍲',
        'rest': '🛋️',
        'chat': '💬',
        'sleep': '🌙',
        'prayer': '🙏'
      };
      
      scheduleList.innerHTML = routine.map(item => `
        <div class="patient-schedule-card">
          <div class="schedule-icon-circle">${iconMap[item.icon] || '⏰'}</div>
          <div class="schedule-details">
            <span class="schedule-time">${item.time}</span>
            <strong class="schedule-act">${item.activity}</strong>
          </div>
          <button class="btn btn-schedule-voice" onclick="VoiceEngine.speak('${item.time}: ${item.activity}', I18N.currentLang)" title="Listen">
            🔊
          </button>
        </div>
      `).join('');
    }
    
    // Ensure home view is active
    document.getElementById('patient-home-view').style.display = 'block';
    document.getElementById('patient-game-view').style.display = 'none';
    document.getElementById('patient-chat-view').style.display = 'none';
  },

  formatReminderTime(time) {
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return time || '';
    const [hour, minute] = time.split(':').map(Number);
    return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
  },
  
  // Voice Synthesis Toggle
  toggleVoiceMode() {
    VoiceEngine.ttsEnabled = !VoiceEngine.ttsEnabled;
    const btn = document.getElementById('voice-toggle-btn');
    if (btn) {
      if (VoiceEngine.ttsEnabled) {
        btn.classList.add('active');
        btn.innerHTML = `🔊 <span data-i18n="voice_active">${I18N.t('voice_active')}</span>`;
        VoiceEngine.speak("Voice guidance enabled.", I18N.currentLang);
      } else {
        btn.classList.remove('active');
        btn.innerHTML = `🔇 <span data-i18n="voice_inactive">${I18N.t('voice_inactive')}</span>`;
        VoiceEngine.stopSpeaking();
      }
    }
  },
  
  // Language Change
  handleLanguageChange(lang) {
    I18N.setLanguage(lang);
    this.renderCurrentRoleView();
  },
  
  // Onboarding Modal Flow
  openOnboardingModal() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) {
      modal.classList.add('active');
      this.resetOnboardingForm();
    }
  },
  
  closeOnboardingModal() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.classList.remove('active');
  },
  
  resetOnboardingForm() {
    document.getElementById('onboard-step-1').style.display = 'block';
    document.getElementById('onboard-step-2').style.display = 'none';
    document.getElementById('onboard-step-3').style.display = 'none';
  },
  
  goToOnboardStep(stepNum) {
    document.getElementById('onboard-step-1').style.display = stepNum === 1 ? 'block' : 'none';
    document.getElementById('onboard-step-2').style.display = stepNum === 2 ? 'block' : 'none';
    document.getElementById('onboard-step-3').style.display = stepNum === 3 ? 'block' : 'none';
    
    if (stepNum === 3) {
      // Start Calibration Mini-Game
      GamesModule.startCalibrationTest((baselineLevel, avgTime) => {
        this.tempBaselineLevel = baselineLevel;
        document.getElementById('calibration-step-container').innerHTML = `
          <div class="calib-success-card">
            <span style="font-size:3.5rem;">🎯</span>
            <h3 style="font-size:1.6rem; color:var(--primary-dark); margin:8px 0;">Baseline Calibration Complete!</h3>
            <p style="font-size:1.1rem; color:var(--text-secondary);">
              Average response reaction: <strong>${avgTime.toFixed(1)} seconds</strong>.
            </p>
            <div class="badge-large primary" style="font-size:1.3rem; padding:10px 20px; display:inline-block; margin:10px 0;">
              Assigned Baseline: <strong>Level ${baselineLevel}</strong>
            </div>
            <p style="font-size:0.95rem; color:var(--text-muted);">
              (Difficulty will adapt progressively based on ongoing comfort and accuracy).
            </p>
            
            <button class="btn btn-primary btn-large" style="width:100%; margin-top:16px;" onclick="AppState.finalizeOnboarding()">
              ✨ Complete & Save Patient Profile
            </button>
          </div>
        `;
      });
    }
  },
  
  async finalizeOnboarding() {
    const name = document.getElementById('onboard-name').value.trim() || 'New Patient';
    const age = parseInt(document.getElementById('onboard-age').value) || 70;
    const gender = document.getElementById('onboard-gender').value;
    const state = document.getElementById('onboard-state').value;
    const district = document.getElementById('onboard-district').value || '';
    const lang = document.getElementById('onboard-lang').value || 'en';
    const stage = document.getElementById('onboard-stage').value;
    const songsRaw = document.getElementById('onboard-songs').value;
    const interestsRaw = document.getElementById('onboard-interests').value;
    const medName = document.getElementById('onboard-med-name').value || 'Prescribed Medication';
    const medDose = document.getElementById('onboard-med-dose').value || 'Standard';
    const medTime = document.getElementById('onboard-med-time').value || '08:00 AM';
    const emergencyContact = document.getElementById('onboard-contact').value || '+91 98640 00000';
    
    const newPatient = {
      id: `pat-ner-${Date.now()}`,
      name: name,
      age: age,
      gender: gender,
      photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
      state: state,
      district: district,
      language: lang,
      condition_stage: stage,
      favorite_songs: songsRaw ? songsRaw.split(',').map(s => s.trim()) : ["Traditional Folk Melody"],
      cultural_interests: interestsRaw ? interestsRaw.split(',').map(s => s.trim()) : ["NER Cultural Heritage"],
      favorite_poems: ["Traditional Verses"],
      medications: [
        { id: `med-${Date.now()}`, name: medName, dosage: medDose, time: medTime, instructions: "Take with water as directed" }
      ],
      daily_routine: [
        { time: "08:00 AM", activity: `Breakfast & ${medName}`, icon: "medication" },
        { time: "10:30 AM", activity: "Cognitive Memory Games", icon: "game" },
        { time: "01:00 PM", activity: "Lunch & Hydration", icon: "food" },
        { time: "05:00 PM", activity: "Evening Tea & Mitra Chat", icon: "chat" }
      ],
      baseline_difficulty: this.tempBaselineLevel || 1,
      current_difficulty: this.tempBaselineLevel || 1,
      emergency_contact: emergencyContact
    };
    
    // Save to IndexedDB & sync
    await DB.queueForSync('patient', newPatient);
    this.allPatients.push(newPatient);
    this.currentPatient = newPatient;
    this.updatePatientSelectorUI();
    
    this.closeOnboardingModal();
    this.switchRole('patient');
    
    VoiceEngine.speak(`Welcome ${newPatient.name}! Your profile and calibration are ready.`, newPatient.language);
  }
};

// Global startup listener
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
});
