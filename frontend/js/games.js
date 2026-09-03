// 5 Interactive Cognitive Games & Baseline Calibration Engine for NER Dementia Care

const GamesModule = {
  activeGame: null,
  gameStartTime: null,
  currentLevel: 1,
  currentScore: 0,
  maxScore: 10,
  timerInterval: null,
  isCalibrationMode: false,
  calibrationQuestions: [],
  calibrationIndex: 0,
  calibrationResults: [],
  
  // Game 1: Memory Recall Pairs
  startMemoryGame(level = 1) {
    this.initGameSession('memory_recall', level);
    
    // Items with authentic cultural symbols
    const allSymbols = [
      { id: 'jaapi', label: 'Jaapi (Hat)', icon: '👒', color: '#FDE68A' },
      { id: 'tea', label: 'Assam Tea', icon: '🍵', color: '#BBF7D0' },
      { id: 'dhol', label: 'Bihu Dhol', icon: '🥁', color: '#FED7AA' },
      { id: 'lotus', label: 'Lotus Flower', icon: '🪷', color: '#FBCFE8' },
      { id: 'rhino', label: 'One-Horn Rhino', icon: '🦏', color: '#E2E8F0' },
      { id: 'bamboo', label: 'Bamboo Flute', icon: '🎋', color: '#A7F3D0' }
    ];
    
    const pairCount = level === 1 ? 2 : (level === 2 ? 3 : 4);
    const selected = allSymbols.slice(0, pairCount);
    const cards = [...selected, ...selected]
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({ ...item, cardId: idx, isFlipped: false, isMatched: false }));
      
    let flippedCards = [];
    let matchesFound = 0;
    
    const gameArea = document.getElementById('game-play-area');
    gameArea.innerHTML = `
      <div class="game-instruction-banner">
        <span class="game-icon">🧩</span>
        <div>
          <h3 style="margin:0; font-size:1.4rem;">Memory Recall: Pair Matching</h3>
          <p style="margin:4px 0 0 0; color:var(--text-secondary);">Tap cards to find matching pairs.</p>
        </div>
      </div>
      
      <div class="memory-grid grid-cols-${pairCount <= 2 ? '2' : '3'}">
        ${cards.map(c => `
          <button class="memory-card" id="card-${c.cardId}" onclick="GamesModule.handleMemoryCardFlip(${c.cardId})">
            <span class="card-back">❓</span>
            <span class="card-front" style="display:none; font-size:3.2rem;">${c.icon}</span>
          </button>
        `).join('')}
      </div>
    `;
    
    VoiceEngine.speak("Find the matching picture pairs. Take your time.", I18N.currentLang);
    
    this.memoryState = {
      cards,
      flippedCards: [],
      matchesFound: 0,
      totalPairs: pairCount,
      attempts: 0
    };
  },
  
  handleMemoryCardFlip(cardId) {
    const state = this.memoryState;
    if (!state || state.flippedCards.length >= 2) return;
    
    const card = state.cards.find(c => c.cardId === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    // Flip card visually
    const cardElem = document.getElementById(`card-${cardId}`);
    cardElem.classList.add('flipped');
    cardElem.querySelector('.card-back').style.display = 'none';
    cardElem.querySelector('.card-front').style.display = 'block';
    card.isFlipped = true;
    state.flippedCards.push(card);
    
    if (state.flippedCards.length === 2) {
      state.attempts++;
      const [c1, c2] = state.flippedCards;
      
      if (c1.id === c2.id) {
        // Matched!
        VoiceEngine.playChime('game_correct');
        c1.isMatched = true;
        c2.isMatched = true;
        state.matchesFound++;
        state.flippedCards = [];
        
        if (state.matchesFound >= state.totalPairs) {
          // Completed game!
          const durationSec = (Date.now() - this.gameStartTime) / 1000;
          const accuracy = Math.min(100, Math.round((state.totalPairs / state.attempts) * 100));
          setTimeout(() => this.finishGameSession(10, 10, accuracy, durationSec), 800);
        }
      } else {
        // Not matched -> Flip back after delay
        VoiceEngine.playChime('game_try_again');
        setTimeout(() => {
          [c1, c2].forEach(c => {
            c.isFlipped = false;
            const el = document.getElementById(`card-${c.cardId}`);
            if (el) {
              el.classList.remove('flipped');
              el.querySelector('.card-back').style.display = 'block';
              el.querySelector('.card-front').style.display = 'none';
            }
          });
          state.flippedCards = [];
        }, 1200);
      }
    }
  },
  
  // Game 2: Attention & Concentration (Spot the Target)
  startAttentionGame(level = 1) {
    this.initGameSession('attention_focus', level);
    
    const questions = [
      {
        target: { name: 'Assam Golden Jaapi', icon: '👒', isTarget: true },
        distractors: [
          { name: 'Red Cap', icon: '🧢' },
          { name: 'Bowler Hat', icon: '🎩' },
          { name: 'Helmet', icon: '⛑️' }
        ],
        prompt: "Find and tap the traditional Assam Jaapi hat!"
      },
      {
        target: { name: 'Great Indian Hornbill', icon: '🦅', isTarget: true },
        distractors: [
          { name: 'Sparrow', icon: '🐦' },
          { name: 'Duck', icon: '🦆' },
          { name: 'Owl', icon: '🦉' }
        ],
        prompt: "Find and tap the Hornbill bird from Nagaland!"
      },
      {
        target: { name: 'Bihu Dhol Drum', icon: '🥁', isTarget: true },
        distractors: [
          { name: 'Guitar', icon: '🎸' },
          { name: 'Bell', icon: '🔔' },
          { name: 'Trumpet', icon: '🎺' }
        ],
        prompt: "Find and tap the traditional Bihu Dhol drum!"
      }
    ];
    
    const q = questions[Math.floor(Math.random() * questions.length)];
    const itemCount = level === 1 ? 4 : (level === 2 ? 6 : 9);
    
    let items = [q.target];
    while (items.length < itemCount) {
      const dist = q.distractors[Math.floor(Math.random() * q.distractors.length)];
      items.push({ ...dist, id: Math.random() });
    }
    items = items.sort(() => Math.random() - 0.5);
    
    const gameArea = document.getElementById('game-play-area');
    gameArea.innerHTML = `
      <div class="game-instruction-banner">
        <span class="game-icon">🎯</span>
        <div>
          <h3 style="margin:0; font-size:1.4rem;">Attention & Concentration</h3>
          <p style="margin:4px 0 0 0; font-size:1.15rem; color:var(--primary-dark); font-weight:600;">${q.prompt}</p>
        </div>
      </div>
      
      <div class="attention-grid grid-cols-${level === 1 ? '2' : '3'}">
        ${items.map((item, idx) => `
          <button class="choice-target-card" onclick="GamesModule.handleAttentionPick(${item.isTarget ? 'true' : 'false'}, ${level})">
            <span style="font-size:3.8rem;">${item.icon}</span>
          </button>
        `).join('')}
      </div>
    `;
    
    VoiceEngine.speak(q.prompt, I18N.currentLang);
  },
  
  handleAttentionPick(isCorrect, level) {
    const durationSec = (Date.now() - this.gameStartTime) / 1000;
    if (isCorrect) {
      VoiceEngine.playChime('game_correct');
      const accuracy = 100.0;
      this.finishGameSession(10, 10, accuracy, durationSec);
    } else {
      VoiceEngine.playChime('game_try_again');
      VoiceEngine.speak("That was close! Let us try again.", I18N.currentLang);
      const accuracy = 50.0;
      this.finishGameSession(5, 10, accuracy, durationSec + 3.0);
    }
  },
  
  // Game 3: Pattern Recognition (Traditional Weaves & Motifs)
  startPatternGame(level = 1) {
    this.initGameSession('pattern_recognition', level);
    
    const patterns = [
      {
        sequence: ['🔴 Gamosa Red Motif', '⚪ White Border', '🔴 Gamosa Red Motif'],
        missing: '⚪ White Border',
        options: ['⚪ White Border', '🟡 Yellow Dot', '🔵 Blue Stripe'],
        context: "Traditional Assam Gamosa Weaving Rhythm"
      },
      {
        sequence: ['⬛ Mizo Puan Black', '🟥 Red Diamond', '⬛ Mizo Puan Black'],
        missing: '🟥 Red Diamond',
        options: ['🟥 Red Diamond', '🟢 Green Circle', '⚪ White Star'],
        context: "Mizoram Traditional Puan Textile Motif"
      },
      {
        sequence: ['🌸 Manipuri Lotus', '🍃 Green Vine', '🌸 Manipuri Lotus'],
        missing: '🍃 Green Vine',
        options: ['🍃 Green Vine', '⭐ Golden Star', '🟤 Brown Earth'],
        context: "Manipuri Handloom Phanek Border"
      }
    ];
    
    const p = patterns[Math.floor(Math.random() * patterns.length)];
    const gameArea = document.getElementById('game-play-area');
    
    gameArea.innerHTML = `
      <div class="game-instruction-banner">
        <span class="game-icon">🧵</span>
        <div>
          <h3 style="margin:0; font-size:1.4rem;">Pattern Recognition: ${p.context}</h3>
          <p style="margin:4px 0 0 0; font-size:1.1rem; color:var(--text-secondary);">What comes next in the sequence?</p>
        </div>
      </div>
      
      <div class="pattern-sequence-row">
        ${p.sequence.map(s => `<div class="pattern-cell">${s}</div>`).join('')}
        <div class="pattern-cell missing-target">❓</div>
      </div>
      
      <div class="pattern-options-row">
        ${p.options.sort(() => Math.random() - 0.5).map(opt => `
          <button class="btn btn-pattern-choice" onclick="GamesModule.handlePatternChoice('${opt.replace(/'/g, "\\'")}', '${p.missing.replace(/'/g, "\\'")}', ${level})">
            ${opt}
          </button>
        `).join('')}
      </div>
    `;
    
    VoiceEngine.speak(`Look at the pattern: ${p.sequence.join(', then ')}. What comes next?`, I18N.currentLang);
  },
  
  handlePatternChoice(selected, correct, level) {
    const durationSec = (Date.now() - this.gameStartTime) / 1000;
    const isCorrect = selected === correct;
    
    if (isCorrect) {
      VoiceEngine.playChime('game_correct');
      this.finishGameSession(10, 10, 100.0, durationSec);
    } else {
      VoiceEngine.playChime('game_try_again');
      this.finishGameSession(5, 10, 50.0, durationSec + 2.0);
    }
  },
  
  // Game 4: Family Member Photo Recognition
  startFamilyGame(level = 1) {
    this.initGameSession('family_photo', level);
    
    const patient = AppState.currentPatient;
    const familyMembers = (patient && patient.family_members && patient.family_members.length > 0)
      ? patient.family_members
      : [
          {
            name: "Siddhartha Gogoi",
            relationship: "Son",
            photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=350&auto=format&fit=crop&q=80",
            voice_hint: "This is your elder son Siddhartha who visits you every Sunday."
          },
          {
            name: "Ananya Gogoi",
            relationship: "Daughter-in-law",
            photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=350&auto=format&fit=crop&q=80",
            voice_hint: "This is your daughter-in-law Ananya."
          },
          {
            name: "Aarav Gogoi",
            relationship: "Grandson",
            photo_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=350&auto=format&fit=crop&q=80",
            voice_hint: "This is your 10-year-old grandson Aarav."
          }
        ];
        
    const target = familyMembers[Math.floor(Math.random() * familyMembers.length)];
    const distractors = ["Dr. Baruah (Doctor)", "Ramesh (Neighbor)", "Sunil (Old Friend)"];
    const options = [target.name, distractors[0], distractors[1]].sort(() => Math.random() - 0.5);
    
    const gameArea = document.getElementById('game-play-area');
    gameArea.innerHTML = `
      <div class="game-instruction-banner">
        <span class="game-icon">👨‍👩‍👧‍👦</span>
        <div>
          <h3 style="margin:0; font-size:1.4rem;">Family Member Recognition</h3>
          <p style="margin:4px 0 0 0; font-size:1.1rem; color:var(--text-secondary);">Who is this in the photo?</p>
        </div>
      </div>
      
      <div class="family-photo-center">
        <img src="${target.photo_url}" alt="Family Photo" class="family-img-large" />
      </div>
      
      <div class="family-options-list">
        ${options.map(opt => `
          <button class="btn btn-action-large secondary" onclick="GamesModule.handleFamilyChoice('${opt.replace(/'/g, "\\'")}', '${target.name.replace(/'/g, "\\'")}', '${(target.voice_hint || '').replace(/'/g, "\\'")}', ${level})">
            <span class="btn-text" style="font-size:1.3rem;">${opt}</span>
          </button>
        `).join('')}
      </div>
    `;
    
    VoiceEngine.speak("Who is this beloved person in the photo?", I18N.currentLang);
  },
  
  handleFamilyChoice(selected, correct, hint, level) {
    const durationSec = (Date.now() - this.gameStartTime) / 1000;
    const isCorrect = selected === correct;
    
    if (isCorrect) {
      VoiceEngine.playChime('game_correct');
      const voicePraise = `Yes! That is right! ${hint || selected}`;
      VoiceEngine.speak(voicePraise, I18N.currentLang);
      setTimeout(() => this.finishGameSession(10, 10, 100.0, durationSec), 1500);
    } else {
      VoiceEngine.playChime('game_try_again');
      VoiceEngine.speak(`This is your ${correct}. Let us remember them together.`, I18N.currentLang);
      setTimeout(() => this.finishGameSession(6, 10, 60.0, durationSec + 3.0), 1800);
    }
  },
  
  // Game 5: Cultural Heritage Identification (All 8 NER States)
  startCulturalGame(level = 1) {
    this.initGameSession('cultural_objects', level);
    
    const culturalItems = [
      {
        state: "Assam",
        title: "Assamese Jaapi & Gamosa",
        image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&auto=format&fit=crop&q=80",
        icon: "👒",
        options: ["Assamese Jaapi & Gamosa", "Mysore Silk Turban", "Kashmiri Pashmina"],
        correct: "Assamese Jaapi & Gamosa",
        story: "The Jaapi is a conical hat made from tightly woven bamboo and tokou leaves, symbolizing honor and hospitality in Assam."
      },
      {
        state: "Manipur",
        title: "Manipuri Pung Drum & Raas Leela",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80",
        icon: "🥁",
        options: ["Manipuri Pung & Raas Dance", "Kathakali Mask", "Garba Sticks"],
        correct: "Manipuri Pung & Raas Dance",
        story: "Manipuri Raas Leela celebrates graceful devotion with delicate hand movements and the rhythmic beats of the Pung drum."
      },
      {
        state: "Nagaland",
        title: "Hornbill Festival Heritage",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop&q=80",
        icon: "🦅",
        options: ["Nagaland Hornbill Festival", "Pongal Harvest", "Pushkar Camel Fair"],
        correct: "Nagaland Hornbill Festival",
        story: "The Hornbill Festival unites all 16 tribes of Nagaland in vibrant traditional attires, folk music, and celebrations."
      },
      {
        state: "Meghalaya",
        title: "Living Root Bridges of Cherrapunjee",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80",
        icon: "🌉",
        options: ["Meghalaya Living Root Bridge", "Howrah Bridge", "Pamban Bridge"],
        correct: "Meghalaya Living Root Bridge",
        story: "Handmade from aerial roots of rubber fig trees by Khasi and Jaintia tribes over generations."
      },
      {
        state: "Mizoram",
        title: "Cheraw Bamboo Dance",
        image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&auto=format&fit=crop&q=80",
        icon: "🎋",
        options: ["Mizoram Cheraw Bamboo Dance", "Bhangra", "Lavani"],
        correct: "Mizoram Cheraw Bamboo Dance",
        story: "Cheraw is an energetic traditional Mizo dance stepping gracefully between rhythmic clapping bamboo staves."
      },
      {
        state: "Sikkim",
        title: "Rumtek Monastery & Thangka Art",
        image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&auto=format&fit=crop&q=80",
        icon: "🏯",
        options: ["Sikkim Rumtek Monastery", "Ajanta Caves", "Sun Temple"],
        correct: "Sikkim Rumtek Monastery",
        story: "Rumtek Monastery in Sikkim is a treasure of Buddhist spiritual philosophy, golden murals, and intricate Thangkas."
      },
      {
        state: "Tripura",
        title: "Ujjayanta Palace & Neermahal",
        image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&auto=format&fit=crop&q=80",
        icon: "🏰",
        options: ["Tripura Ujjayanta Palace", "Mysore Palace", "Hawa Mahal"],
        correct: "Tripura Ujjayanta Palace",
        story: "Built in 1901 by Maharaja Radha Kishore Manikya, Ujjayanta Palace stands in Agartala as a magnificent symbol of Tripura's royal history."
      }
    ];
    
    const item = culturalItems[Math.floor(Math.random() * culturalItems.length)];
    const options = item.options.sort(() => Math.random() - 0.5);
    
    const gameArea = document.getElementById('game-play-area');
    gameArea.innerHTML = `
      <div class="game-instruction-banner">
        <span class="game-icon">🏛️</span>
        <div>
          <h3 style="margin:0; font-size:1.4rem;">NER Cultural Heritage (${item.state})</h3>
          <p style="margin:4px 0 0 0; font-size:1.1rem; color:var(--text-secondary);">Recognize this treasured North East tradition.</p>
        </div>
      </div>
      
      <div class="cultural-card-hero">
        <div style="font-size:4.5rem; text-align:center; padding:16px;">${item.icon}</div>
        <div style="background:var(--surface-color); padding:12px; border-radius:12px; font-size:1.15rem; color:var(--text-primary); text-align:center;">
          State: <strong>${item.state}</strong>
        </div>
      </div>
      
      <div class="cultural-options-grid">
        ${options.map(opt => `
          <button class="btn btn-action-large secondary" onclick="GamesModule.handleCulturalChoice('${opt.replace(/'/g, "\\'")}', '${item.correct.replace(/'/g, "\\'")}', '${item.story.replace(/'/g, "\\'")}', ${level})">
            <span class="btn-text" style="font-size:1.25rem;">${opt}</span>
          </button>
        `).join('')}
      </div>
    `;
    
    VoiceEngine.speak(`Can you recognize this cultural heritage item from ${item.state}?`, I18N.currentLang);
  },
  
  handleCulturalChoice(selected, correct, story, level) {
    const durationSec = (Date.now() - this.gameStartTime) / 1000;
    const isCorrect = selected === correct;
    
    if (isCorrect) {
      VoiceEngine.playChime('game_correct');
      VoiceEngine.speak(`Excellent! ${correct}. ${story}`, I18N.currentLang);
      setTimeout(() => this.finishGameSession(10, 10, 100.0, durationSec), 2000);
    } else {
      VoiceEngine.playChime('game_try_again');
      VoiceEngine.speak(`This is the famous ${correct}. ${story}`, I18N.currentLang);
      setTimeout(() => this.finishGameSession(6, 10, 60.0, durationSec + 3.0), 2200);
    }
  },
  
  // Helper to start game tracking
  initGameSession(gameType, level) {
    this.activeGame = gameType;
    this.currentLevel = level;
    this.gameStartTime = Date.now();
    
    // Switch to game screen
    document.getElementById('patient-home-view').style.display = 'none';
    document.getElementById('patient-game-view').style.display = 'block';
  },
  
  // Finish game session & trigger adaptive AI evaluation
  async finishGameSession(score, maxScore, accuracyPct, durationSec) {
    const patientId = AppState.currentPatient ? AppState.currentPatient.id : 'pat-ner-001';
    
    // Run Adaptive AI Evaluation
    const evalResult = AdaptiveAI.evaluateSession(this.currentLevel, accuracyPct, durationSec);
    this.lastEvalResult = evalResult;
    
    const sessionRecord = {
      id: `gs-${Date.now()}`,
      patient_id: patientId,
      game_type: this.activeGame,
      difficulty_level: this.currentLevel,
      score: score,
      max_score: maxScore,
      accuracy_pct: accuracyPct,
      avg_response_time_sec: Math.round(durationSec * 10) / 10,
      level_adjusted_to: evalResult.newLevel,
      adaptation_reason: evalResult.explanation,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    
    // Save to IndexedDB & queue for sync
    await DB.queueForSync('game_session', sessionRecord);
    
    // Update local patient current difficulty
    if (AppState.currentPatient) {
      AppState.currentPatient.current_difficulty = evalResult.newLevel;
      await DB.putItem('patients', AppState.currentPatient);
    }
    
    // Render Results Screen
    VoiceEngine.playChime('celebration');
    VoiceEngine.speak(I18N.t('great_job'), I18N.currentLang);
    
    const gameArea = document.getElementById('game-play-area');
    gameArea.innerHTML = `
      <div class="game-results-card">
        <div class="results-trophy pulse-slow">🏆</div>
        <h2 style="margin:8px 0; font-size:2rem; color:var(--text-primary);" data-i18n="great_job">${I18N.t('great_job')}</h2>
        
        <div class="results-stats-row">
          <div class="r-stat">
            <span class="r-label" data-i18n="score_label">${I18N.t('score_label')}</span>
            <span class="r-val">${score} / ${maxScore}</span>
          </div>
          <div class="r-stat">
            <span class="r-label" data-i18n="accuracy_label">${I18N.t('accuracy_label')}</span>
            <span class="r-val green">${accuracyPct.toFixed(0)}%</span>
          </div>
          <div class="r-stat">
            <span class="r-label" data-i18n="time_label">${I18N.t('time_label')}</span>
            <span class="r-val">${durationSec.toFixed(1)}s</span>
          </div>
        </div>
        
        <!-- Adaptive AI Level Badge with Explainability Button -->
        <div class="ai-difficulty-pill-card">
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="sparkle">✨</span>
            <div>
              <div style="font-size:0.95rem; color:var(--text-secondary);">Adaptive AI Engine</div>
              <strong style="font-size:1.15rem; color:var(--primary-dark);">Difficulty: Level ${evalResult.newLevel}</strong>
            </div>
          </div>
          
          <button class="btn btn-outline" style="font-size:0.95rem; padding:8px 14px;" onclick="AdaptiveAI.showExplanationModal(GamesModule.lastEvalResult)">
            ℹ️ <span data-i18n="why_adaptive_btn">${I18N.t('why_adaptive_btn')}</span>
          </button>
        </div>
        
        <div class="results-actions-row">
          <button class="btn btn-primary btn-large" onclick="GamesModule.replayCurrentGame()">
            🔄 <span data-i18n="play_again">${I18N.t('play_again')}</span>
          </button>
          
          <button class="btn btn-secondary btn-large" onclick="GamesModule.exitToHome()">
            🏠 <span data-i18n="back_home">${I18N.t('back_home')}</span>
          </button>
        </div>
      </div>
    `;
    
    // Refresh caregiver & doctor data if active
    if (window.CaregiverView) CaregiverView.refresh();
  },
  
  replayCurrentGame() {
    const level = (AppState.currentPatient && AppState.currentPatient.current_difficulty) || 1;
    if (this.activeGame === 'memory_recall') this.startMemoryGame(level);
    else if (this.activeGame === 'attention_focus') this.startAttentionGame(level);
    else if (this.activeGame === 'pattern_recognition') this.startPatternGame(level);
    else if (this.activeGame === 'family_photo') this.startFamilyGame(level);
    else if (this.activeGame === 'cultural_objects') this.startCulturalGame(level);
  },
  
  exitToHome() {
    document.getElementById('patient-game-view').style.display = 'none';
    document.getElementById('patient-home-view').style.display = 'block';
  },
  
  // Calibration Mini-Game (Run once at onboarding)
  startCalibrationTest(onComplete) {
    this.isCalibrationMode = true;
    this.calibrationResults = [];
    this.onCalibrationComplete = onComplete;
    this.runNextCalibrationStep();
  },
  
  runNextCalibrationStep() {
    const calibContainer = document.getElementById('calibration-step-container');
    if (!calibContainer) return;
    
    const steps = [
      {
        q: "Tap the traditional Assam Tea Cup 🍵",
        target: "🍵",
        options: ["🍵", "🍎", "🚗"]
      },
      {
        q: "Find the matching pair: 🥁 or 👒",
        target: "👒",
        options: ["👒", "🚲", "⚽"]
      },
      {
        q: "Tap the flower 🌸",
        target: "🌸",
        options: ["🌸", "🔨", "📦"]
      }
    ];
    
    const currentStep = steps[this.calibrationResults.length];
    if (!currentStep) {
      // Completed all 3 steps! Calculate baseline level
      const avgTime = this.calibrationResults.reduce((acc, r) => acc + r.time, 0) / this.calibrationResults.length;
      const allCorrect = this.calibrationResults.every(r => r.correct);
      
      let baselineLevel = 1;
      if (allCorrect && avgTime <= 6.0) baselineLevel = 2;
      if (allCorrect && avgTime <= 3.5) baselineLevel = 3;
      
      if (this.onCalibrationComplete) {
        this.onCalibrationComplete(baselineLevel, avgTime);
      }
      return;
    }
    
    const stepStart = Date.now();
    VoiceEngine.speak(currentStep.q, I18N.currentLang);
    
    calibContainer.innerHTML = `
      <div style="text-align:center; padding:16px;">
        <h3 style="font-size:1.3rem; margin:0 0 12px 0;">Calibration Step ${this.calibrationResults.length + 1} of 3</h3>
        <p style="font-size:1.2rem; color:var(--primary-dark); font-weight:bold;">${currentStep.q}</p>
        
        <div style="display:flex; justify-content:center; gap:16px; margin-top:20px;">
          ${currentStep.options.sort(() => Math.random() - 0.5).map(opt => `
            <button class="choice-target-card" style="width:100px; height:100px; font-size:3.5rem;" onclick="GamesModule.recordCalibrationChoice('${opt}', '${currentStep.target}', ${stepStart})">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },
  
  recordCalibrationChoice(picked, target, stepStart) {
    const elapsed = (Date.now() - stepStart) / 1000;
    const isCorrect = picked === target;
    
    if (isCorrect) VoiceEngine.playChime('game_correct');
    else VoiceEngine.playChime('game_try_again');
    
    this.calibrationResults.push({ correct: isCorrect, time: elapsed });
    setTimeout(() => this.runNextCalibrationStep(), 600);
  }
};
