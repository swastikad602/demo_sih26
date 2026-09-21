// RECONNECT Pattern Recognition Game
// Sequence Completion with Cultural & Natural Progressions

class PatternGame {
  constructor() {
    this.level = 1;
    this.currentSequence = null;
    this.attempts = 0;
    this.startTime = null;
    this.hintsUsed = 0;
    this.onFinish = null;
  }

  getSequences() {
    return [
      {
        id: "time_of_day",
        title_en: "Daily Cycle",
        title_as: "দিনটোৰ সময়",
        steps: [
          { icon: "🌅", name_en: "Morning", name_as: "পুৱা" },
          { icon: "☀️", name_en: "Afternoon", name_as: "দুপৰীয়া" }
        ],
        correct: { icon: "🌙", name_en: "Night", name_as: "ৰাতি" },
        distractors: [
          { icon: "🌧️", name_en: "Rain", name_as: "বৰষুণ" },
          { icon: "❄️", name_en: "Snow", name_as: "বৰফ" },
          { icon: "⚡", name_en: "Lightning", name_as: "বিজুলী" }
        ]
      },
      {
        id: "plant_growth",
        title_en: "Plant Growth",
        title_as: "উদ্ভিদৰ বিকাশ",
        steps: [
          { icon: "🌱", name_en: "Seed", name_as: "বীজ" },
          { icon: "🌿", name_en: "Sprout", name_as: "অঙ্কুৰ" }
        ],
        correct: { icon: "🌺", name_en: "Bloom", name_as: "ফুল" },
        distractors: [
          { icon: "🪵", name_en: "Wood", name_as: "কাঠ" },
          { icon: "🍂", name_en: "Fallen Leaf", name_as: "শুকান পাত" },
          { icon: "🪨", name_en: "Stone", name_as: "শিল" }
        ]
      },
      {
        id: "tea_making",
        title_en: "Assam Tea Journey",
        title_as: "অসম চাহৰ প্ৰস্তুতি",
        steps: [
          { icon: "🍃", name_en: "Fresh Leaves", name_as: "কেঁচা পাত" },
          { icon: "☀️", name_en: "Sun Drying", name_as: "ৰ'দত শুকুওৱা" }
        ],
        correct: { icon: "☕", name_en: "Hot Tea Cup", name_as: "গৰম চাহ" },
        distractors: [
          { icon: "🧊", name_en: "Ice Cube", name_as: "বৰফ" },
          { icon: "🌾", name_en: "Rice", name_as: "ধান" },
          { icon: "🥥", name_en: "Coconut", name_as: "নাৰিকল" }
        ]
      },
      {
        id: "weaving",
        title_en: "Weaving Gamosa",
        title_as: "তাঁতশাল আৰু গামোচা",
        steps: [
          { icon: "🧵", name_en: "Silk Thread", name_as: "মুগা সূতা" },
          { icon: "🧶", name_en: "Loom Shuttle", name_as: "তাঁতশাল" }
        ],
        correct: { icon: "🧣", name_en: "Woven Gamosa", name_as: "মুগা গামোচা" },
        distractors: [
          { icon: "🪓", name_en: "Axe", name_as: "কুঠাৰ" },
          { icon: "🪴", name_en: "Pot", name_as: "টাব" },
          { icon: "🪞", name_en: "Mirror", name_as: "দাপোন" }
        ]
      }
    ];
  }

  start(level = 1, onFinish) {
    this.level = Math.max(1, Math.min(3, level));
    this.onFinish = onFinish;
    this.attempts = 0;
    this.hintsUsed = 0;
    this.startTime = Date.now();

    const sequences = this.getSequences();
    this.currentSequence = sequences[Math.floor(Math.random() * sequences.length)];

    // Number of choices: Level 1 -> 2 choices, Level 2 -> 3 choices, Level 3 -> 4 choices
    const choicesCount = this.level === 1 ? 2 : this.level === 2 ? 3 : 4;
    const distractors = this.currentSequence.distractors.slice(0, choicesCount - 1);
    
    this.choices = [this.currentSequence.correct, ...distractors].sort(() => 0.5 - Math.random());
    this.render();

    const lang = window.appState ? window.appState.language : "en";
    audioManager.speak(
      lang === "as" ? "ক্ৰমটো মন কৰক। ইয়াৰ পিছত কি আহিব?" : "Look at the sequence. What comes next?",
      lang
    );
  }

  handleChoice(choice) {
    this.attempts += 1;

    if (choice.name_en === this.currentSequence.correct.name_en) {
      // Correct!
      audioManager.playTone("success");
      const lang = window.appState ? window.appState.language : "en";
      audioManager.speak(lang === "as" ? "বৰ ধুনীয়া! সঠিক ক্ৰম।" : "Wonderful! That completes the sequence.", lang);
      this.completeGame(true);
    } else {
      // Incorrect choice
      audioManager.playTone("tap");
      const el = document.getElementById(`pattern-choice-${choice.icon}`);
      if (el) {
        el.classList.add("option-shake");
        setTimeout(() => el.classList.remove("option-shake"), 600);
      }
    }
  }

  giveHint() {
    this.hintsUsed += 1;
    audioManager.playTone("gentle_hint");
    const lang = window.appState ? window.appState.language : "en";
    
    // Highlight correct choice
    const correctEl = document.getElementById(`pattern-choice-${this.currentSequence.correct.icon}`);
    if (correctEl) {
      correctEl.classList.add("option-highlight-hint");
      setTimeout(() => correctEl.classList.remove("option-highlight-hint"), 1500);
    }

    const hintWord = lang === "as" ? this.currentSequence.correct.name_as : this.currentSequence.correct.name_en;
    audioManager.speak(
      lang === "as" ? `ভাবক: ${hintWord}` : `Think about: ${hintWord}`,
      lang
    );
  }

  completeGame(success) {
    const endTime = Date.now();
    const responseTimeSec = Math.max(4, Math.round((endTime - this.startTime) / 1000));
    
    // Accuracy based on attempts
    const accuracy = this.attempts === 1 ? 100 : this.attempts === 2 ? 70 : 45;

    if (this.onFinish) {
      this.onFinish({
        gameType: "pattern",
        domain: "Pattern Recognition",
        level: this.level,
        accuracy,
        responseTime: responseTimeSec,
        attempts: this.attempts,
        hintsUsed: this.hintsUsed
      });
    }
  }

  render() {
    const container = document.getElementById("game-active-area");
    if (!container) return;

    const lang = window.appState ? window.appState.language : "en";
    const seq = this.currentSequence;

    const html = `
      <div class="game-board-container animate-fade-in">
        <div class="game-header-bar">
          <div class="game-badge-pill">
            <span>🔷 ${t("game_pattern_title", lang)}</span>
            <span class="badge-level">${t("level_badge", lang)} ${this.level}</span>
          </div>
          <button class="btn-audio-hint" onclick="window.activePatternGame.giveHint()" title="Gentle Hint">
            💡 ${lang === "as" ? "সহায়" : "Hint"}
          </button>
        </div>

        <p class="game-instruction-text">${t("pattern_prompt", lang)}</p>

        <!-- Sequence Row -->
        <div class="pattern-sequence-row">
          ${seq.steps.map((step, idx) => `
            <div class="pattern-step-card">
              <span class="pattern-step-icon">${step.icon}</span>
              <span class="pattern-step-label">${lang === "as" ? step.name_as : step.name_en}</span>
            </div>
            <div class="pattern-arrow">➔</div>
          `).join('')}

          <div class="pattern-step-card pattern-step-mystery">
            <span class="pattern-mystery-icon">❓</span>
            <span class="pattern-step-label">${lang === "as" ? "পৰৱৰ্তী কি?" : "Next?"}</span>
          </div>
        </div>

        <!-- Choice Options -->
        <p class="pattern-options-title">${lang === "as" ? "তলৰ পৰা শুদ্ধটো বাছক:" : "Choose the right next step:"}</p>
        <div class="pattern-choices-grid">
          ${this.choices.map(choice => `
            <button 
              id="pattern-choice-${choice.icon}"
              class="pattern-choice-btn"
              onclick="window.activePatternGame.handleChoice(${JSON.stringify(choice).replace(/"/g, '&quot;')})"
            >
              <span class="choice-icon">${choice.icon}</span>
              <span class="choice-label">${lang === "as" ? choice.name_as : choice.name_en}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}

window.activePatternGame = new PatternGame();
