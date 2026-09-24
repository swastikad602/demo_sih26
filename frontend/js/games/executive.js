// RECONNECT Executive Function Game
// "Arrange My Routine" - Step Sequencing with Accessible Tactile Controls

class ExecutiveGame {
  constructor() {
    this.level = 1; // 1: 3 steps, 2: 4 steps, 3: 5 steps
    this.currentRoutine = null;
    this.userSteps = [];
    this.attempts = 0;
    this.startTime = null;
    this.hintsUsed = 0;
    this.onFinish = null;
  }

  getRoutines() {
    return [
      {
        id: "morning_routine",
        level: 1,
        title_en: "Morning Routine",
        title_as: "পুৱাৰ কাম-কাজ",
        correctSteps: [
          { id: 1, icon: "⏰", name_en: "Wake Up", name_as: "টোপনিৰ পৰা উঠা" },
          { id: 2, icon: "🪥", name_en: "Brush Teeth", name_as: "দাঁত ঘঁহা" },
          { id: 3, icon: "🥣", name_en: "Eat Breakfast", name_as: "পুৱাৰ আহাৰ খোৱা" }
        ]
      },
      {
        id: "lunch_prep",
        level: 2,
        title_en: "Midday Meal Routine",
        title_as: "দুপৰীয়াৰ ভাতৰ নিয়ম",
        correctSteps: [
          { id: 1, icon: "🧼", name_en: "Wash Hands", name_as: "হাত ধোৱা" },
          { id: 2, icon: "🍚", name_en: "Cook Rice", name_as: "ভাত ৰন্ধা" },
          { id: 3, icon: "🍛", name_en: "Serve Lunch", name_as: "ভাত বাঢ়ি খোৱা" },
          { id: 4, icon: "🧽", name_en: "Clean Plates", name_as: "কাঁহী-বাতি ধোৱা" }
        ]
      },
      {
        id: "wellness_routine",
        level: 3,
        title_en: "Daily Wellness Steps",
        title_as: "সুস্বাস্থ্যৰ নিয়ম",
        correctSteps: [
          { id: 1, icon: "🌅", name_en: "Wake Up Early", name_as: "পুৱা সাৰ পোৱা" },
          { id: 2, icon: "🚶‍♀️", name_en: "Walk in Garden", name_as: "ফুলনিত খোজ কঢ়া" },
          { id: 3, icon: "🥛", name_en: "Drink Warm Water", name_as: "কুহুমীয়া পানী খোৱা" },
          { id: 4, icon: "💊", name_en: "Take Medicine", name_as: "ঔষধ খোৱা" },
          { id: 5, icon: "🛋️", name_en: "Rest Happily", name_as: "আৰাম কৰা" }
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

    const routines = this.getRoutines();
    this.currentRoutine = routines.find(r => r.level === this.level) || routines[0];

    // Create shuffled copy of steps for user to order
    let shuffled = [...this.currentRoutine.correctSteps].sort(() => 0.5 - Math.random());
    // Ensure it's not already in exact correct order
    if (JSON.stringify(shuffled.map(s => s.id)) === JSON.stringify(this.currentRoutine.correctSteps.map(s => s.id))) {
      shuffled.reverse();
    }

    this.userSteps = shuffled;
    this.render();

    const lang = window.appState ? window.appState.language : "en";
    audioManager.speak(
      lang === "as" 
        ? "কামসমূহ সঠিক ক্ৰমত সজাওক। প্ৰথমে কি কৰিব?" 
        : "Arrange the routine in the right order. What comes first?",
      lang
    );
  }

  moveStep(index, direction) {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= this.userSteps.length) return;

    audioManager.playTone("tap");
    const temp = this.userSteps[index];
    this.userSteps[index] = this.userSteps[newIdx];
    this.userSteps[newIdx] = temp;

    this.render();
  }

  giveHint() {
    this.hintsUsed += 1;
    audioManager.playTone("gentle_hint");
    const lang = window.appState ? window.appState.language : "en";

    // Place the first step into the correct position if not already
    const firstStep = this.currentRoutine.correctSteps[0];
    const currentIdx = this.userSteps.findIndex(s => s.id === firstStep.id);
    if (currentIdx !== 0) {
      this.userSteps.splice(currentIdx, 1);
      this.userSteps.unshift(firstStep);
      this.render();
    }

    const firstLabel = lang === "as" ? firstStep.name_as : firstStep.name_en;
    audioManager.speak(
      lang === "as" ? `প্ৰথম কামটো হ'ল: ${firstLabel}` : `The first step is: ${firstLabel}`,
      lang
    );
  }

  checkOrder() {
    this.attempts += 1;
    const isCorrect = this.userSteps.every((step, idx) => step.id === this.currentRoutine.correctSteps[idx].id);

    if (isCorrect) {
      audioManager.playTone("success");
      const lang = window.appState ? window.appState.language : "en";
      audioManager.speak(lang === "as" ? "অসাধাৰণ! আপোনাৰ নিয়মসূচী নিখুঁত হ'ল।" : "Fantastic, Maya! Your routine is perfectly arranged.", lang);
      this.completeGame(true);
    } else {
      audioManager.playTone("tap");
      const lang = window.appState ? window.appState.language : "en";
      audioManager.speak(lang === "as" ? "আকৌ এবাৰ ক্ৰমটো চাওক।" : "Take another look at the order.", lang);
      
      const container = document.getElementById("routine-steps-list");
      if (container) {
        container.classList.add("option-shake");
        setTimeout(() => container.classList.remove("option-shake"), 600);
      }
    }
  }

  completeGame(success) {
    const endTime = Date.now();
    const responseTimeSec = Math.max(5, Math.round((endTime - this.startTime) / 1000));
    
    // Accuracy calculation
    const accuracy = this.attempts === 1 ? 100 : this.attempts === 2 ? 75 : 50;

    if (this.onFinish) {
      this.onFinish({
        gameType: "executive",
        domain: "Executive Function",
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

    const html = `
      <div class="game-board-container animate-fade-in">
        <div class="game-header-bar">
          <div class="game-badge-pill">
            <span>📋 ${t("game_routine_title", lang)}</span>
            <span class="badge-level">${t("level_badge", lang)} ${this.level}</span>
          </div>
          <button class="btn-audio-hint" onclick="window.activeExecutiveGame.giveHint()" title="Gentle Hint">
            💡 ${lang === "as" ? "সহায়" : "Hint"}
          </button>
        </div>

        <p class="game-instruction-text">${t("routine_prompt", lang)}</p>

        <div id="routine-steps-list" class="routine-steps-container">
          ${this.userSteps.map((step, idx) => `
            <div class="routine-step-row">
              <div class="step-order-number">${idx + 1}</div>
              <div class="step-card-content">
                <span class="step-icon">${step.icon}</span>
                <span class="step-name">${lang === "as" ? step.name_as : step.name_en}</span>
              </div>
              <div class="step-actions">
                <button 
                  class="btn-step-move" 
                  onclick="window.activeExecutiveGame.moveStep(${idx}, -1)" 
                  ${idx === 0 ? 'disabled' : ''}
                  aria-label="Move Up"
                >🔼</button>
                <button 
                  class="btn-step-move" 
                  onclick="window.activeExecutiveGame.moveStep(${idx}, 1)" 
                  ${idx === this.userSteps.length - 1 ? 'disabled' : ''}
                  aria-label="Move Down"
                >🔽</button>
              </div>
            </div>
          `).join('')}
        </div>

        <button class="btn-check-routine" onclick="window.activeExecutiveGame.checkOrder()">
          ✓ ${lang === "as" ? "ক্ৰম পৰীক্ষা কৰক" : "Check My Routine"}
        </button>
      </div>
    `;

    container.innerHTML = html;
  }
}

window.activeExecutiveGame = new ExecutiveGame();
