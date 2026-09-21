// RECONNECT Attention & Focus Game
// Culturally Grounded Target Identification with Progressive Distractor Complexity

class AttentionGame {
  constructor() {
    this.level = 1;
    this.targetItem = null;
    this.options = [];
    this.attempts = 0;
    this.wrongTaps = 0;
    this.startTime = null;
    this.hintsUsed = 0;
    this.onFinish = null;
  }

  start(level = 1, onFinish) {
    this.level = Math.max(1, Math.min(3, level));
    this.onFinish = onFinish;
    this.attempts = 0;
    this.wrongTaps = 0;
    this.hintsUsed = 0;
    this.startTime = Date.now();

    const totalCount = this.level === 1 ? 3 : this.level === 2 ? 4 : 6;
    
    // Pick cultural items
    const all = [...SEED_DATA.cultural_items].sort(() => 0.5 - Math.random());
    this.targetItem = all[0];
    this.options = all.slice(0, totalCount).sort(() => 0.5 - Math.random());

    this.render();

    // Voice prompt
    const lang = window.appState ? window.appState.language : "en";
    const targetName = lang === "as" ? this.targetItem.name_as : this.targetItem.name_en;
    const promptText = lang === "as" 
      ? `${targetName} ক'ত আছে? স্পৰ্শ কৰক।` 
      : `Where is the ${targetName}? Tap it.`;

    audioManager.speak(promptText, lang);
  }

  handleOptionClick(item) {
    this.attempts += 1;

    if (item.id === this.targetItem.id) {
      // Correct!
      audioManager.playTone("success");
      const lang = window.appState ? window.appState.language : "en";
      audioManager.speak(lang === "as" ? "বৰ ভাল! শুদ্ধ উত্তৰ।" : "Well done! That is correct.", lang);
      this.completeGame();
    } else {
      // Incorrect tap
      this.wrongTaps += 1;
      audioManager.playTone("tap");
      const lang = window.appState ? window.appState.language : "en";
      const hintMsg = lang === "as" ? "আকৌ এবাৰ চেষ্টা কৰক।" : "Let's look closely and try again.";
      
      const el = document.getElementById(`opt-${item.id}`);
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
    
    // Highlight target subtly
    const targetEl = document.getElementById(`opt-${this.targetItem.id}`);
    if (targetEl) {
      targetEl.classList.add("option-highlight-hint");
      setTimeout(() => targetEl.classList.remove("option-highlight-hint"), 1500);
    }

    audioManager.speak(
      lang === "as" 
        ? `মনোযোগ দিয়ক: ${this.targetItem.name_as}`
        : `Look for: ${this.targetItem.name_en}`,
      lang
    );
  }

  completeGame() {
    const endTime = Date.now();
    const responseTimeSec = Math.max(3, Math.round((endTime - this.startTime) / 1000));
    
    // Accuracy based on wrong taps
    const accuracy = this.wrongTaps === 0 ? 100 : this.wrongTaps === 1 ? 75 : Math.max(40, 60 - this.wrongTaps * 10);

    if (this.onFinish) {
      this.onFinish({
        gameType: "attention",
        domain: "Attention & Focus",
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
    const targetName = lang === "as" ? this.targetItem.name_as : this.targetItem.name_en;

    const html = `
      <div class="game-board-container animate-fade-in">
        <div class="game-header-bar">
          <div class="game-badge-pill">
            <span>👀 ${t("game_attention_title", lang)}</span>
            <span class="badge-level">${t("level_badge", lang)} ${this.level}</span>
          </div>
          <button class="btn-audio-hint" onclick="window.activeAttentionGame.giveHint()" title="Gentle Hint">
            💡 ${lang === "as" ? "সহায়" : "Hint"}
          </button>
        </div>

        <div class="target-prompt-card" style="border-left: 6px solid ${this.targetItem.color}">
          <p class="target-title-label">${lang === "as" ? "নিৰ্দিষ্ট বস্তুটো বাছক:" : "Find this item:"}</p>
          <h2 class="target-name">${targetName}</h2>
          <button class="btn-audio-repeat" onclick="audioManager.speak('${targetName}', '${lang}')">
            🔊 ${lang === "as" ? "পুনৰ শুনক" : "Listen"}
          </button>
        </div>

        <div class="attention-options-grid ${this.options.length > 4 ? 'grid-cols-3' : 'grid-cols-2'}">
          ${this.options.map(opt => `
            <button 
              id="opt-${opt.id}"
              class="attention-card-btn"
              onclick="window.activeAttentionGame.handleOptionClick(SEED_DATA.cultural_items.find(x => x.id === '${opt.id}'))"
            >
              <span class="attention-card-icon">${opt.icon}</span>
              <span class="attention-card-label">${lang === "as" ? opt.name_as : opt.name_en}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}

window.activeAttentionGame = new AttentionGame();
