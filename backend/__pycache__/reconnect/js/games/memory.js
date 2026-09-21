// RECONNECT Memory Recall Game
// Culturally Authentic Picture Matching with NER Familiar Objects

class MemoryGame {
  constructor() {
    this.level = 1; // 1: 4 cards (2 pairs), 2: 6 cards (3 pairs), 3: 8 cards (4 pairs)
    this.cards = [];
    this.flippedIndices = [];
    this.matchedPairs = 0;
    this.totalPairs = 2;
    this.attempts = 0;
    this.startTime = null;
    this.endTime = null;
    this.hintsUsed = 0;
    this.isLocked = false;
    this.onFinish = null;
  }

  start(level = 1, onFinish) {
    this.level = Math.max(1, Math.min(3, level));
    this.onFinish = onFinish;
    this.flippedIndices = [];
    this.matchedPairs = 0;
    this.attempts = 0;
    this.hintsUsed = 0;
    this.isLocked = false;
    this.startTime = Date.now();

    // Number of pairs based on level
    this.totalPairs = this.level === 1 ? 2 : this.level === 2 ? 3 : 4;

    // Pick cultural items
    const allItems = [...SEED_DATA.cultural_items];
    // Shuffle items
    allItems.sort(() => 0.5 - Math.random());
    const selectedItems = allItems.slice(0, this.totalPairs);

    // Create paired cards
    let deck = [];
    selectedItems.forEach((item, idx) => {
      deck.push({ id: idx, key: item.id, item, flipped: false, matched: false });
      deck.push({ id: idx, key: item.id, item, flipped: false, matched: false });
    });

    // Shuffle deck
    deck.sort(() => 0.5 - Math.random());
    this.cards = deck;

    this.render();

    // Announce activity
    const lang = window.appState ? window.appState.language : "en";
    audioManager.speak(
      lang === "as"
        ? "ছবিৰ যোৰ মিলাওক। কাৰ্ড স্পৰ্শ কৰক।"
        : "Match familiar pictures. Tap cards to find pairs.",
      lang
    );
  }

  handleCardClick(index) {
    if (this.isLocked) return;
    const card = this.cards[index];
    if (card.flipped || card.matched) return;

    audioManager.playTone("card_flip");
    card.flipped = true;
    this.flippedIndices.push(index);
    this.render();

    if (this.flippedIndices.length === 2) {
      this.attempts += 1;
      this.isLocked = true;
      const [idx1, idx2] = this.flippedIndices;
      const card1 = this.cards[idx1];
      const card2 = this.cards[idx2];

      if (card1.key === card2.key) {
        // Matched!
        setTimeout(() => {
          audioManager.playTone("match");
          card1.matched = true;
          card2.matched = true;
          this.matchedPairs += 1;
          this.flippedIndices = [];
          this.isLocked = false;
          this.render();

          // Check for completion
          if (this.matchedPairs >= this.totalPairs) {
            this.completeGame();
          }
        }, 400);
      } else {
        // Not a match, flip back gently
        setTimeout(() => {
          card1.flipped = false;
          card2.flipped = false;
          this.flippedIndices = [];
          this.isLocked = false;
          this.render();
        }, 900);
      }
    }
  }

  giveHint() {
    if (this.isLocked || this.matchedPairs >= this.totalPairs) return;
    this.hintsUsed += 1;
    audioManager.playTone("gentle_hint");

    // Temporarily reveal an unmatched pair for 1.2s
    const unmatched = this.cards.filter(c => !c.matched);
    if (unmatched.length > 0) {
      const targetKey = unmatched[0].key;
      this.cards.forEach(c => {
        if (c.key === targetKey && !c.matched) {
          c.flipped = true;
        }
      });
      this.render();
      setTimeout(() => {
        this.cards.forEach(c => {
          if (c.key === targetKey && !c.matched) {
            c.flipped = false;
          }
        });
        this.render();
      }, 1200);
    }
  }

  completeGame() {
    this.endTime = Date.now();
    const responseTimeSec = Math.max(5, Math.round((this.endTime - this.startTime) / 1000));
    
    // Accuracy calculation: totalPairs / attempts (max 100%)
    const rawAcc = Math.round((this.totalPairs / Math.max(this.totalPairs, this.attempts)) * 100);
    const accuracy = Math.min(100, Math.max(40, rawAcc));

    audioManager.playTone("success");
    const lang = window.appState ? window.appState.language : "en";
    setTimeout(() => {
      audioManager.speak(
        lang === "as" ? "বৰ সুন্দৰ মায়া! আপুনি সকলো যোৰ মিলালে।" : "Well done, Maya! You matched all pairs!",
        lang
      );
    }, 300);

    if (this.onFinish) {
      this.onFinish({
        gameType: "memory",
        domain: "Memory Recall",
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
    const totalCards = this.cards.length;
    const gridCols = totalCards <= 4 ? "grid-cols-2" : totalCards <= 6 ? "grid-cols-3" : "grid-cols-4";

    let html = `
      <div class="game-board-container animate-fade-in">
        <div class="game-header-bar">
          <div class="game-badge-pill">
            <span>🧠 ${t("game_memory_title", lang)}</span>
            <span class="badge-level">${t("level_badge", lang)} ${this.level}</span>
          </div>
          <button class="btn-audio-hint" onclick="window.activeMemoryGame.giveHint()" title="Gentle Hint">
            💡 ${lang === "as" ? "সহায়" : "Hint"}
          </button>
        </div>

        <p class="game-instruction-text">
          ${t("card_flip_prompt", lang)} (${this.matchedPairs}/${this.totalPairs} ${lang === "as" ? "যোৰ" : "pairs"})
        </p>

        <div class="memory-grid ${gridCols}">
          ${this.cards.map((card, idx) => `
            <div class="memory-card-wrapper">
              <button 
                class="memory-card ${card.flipped ? 'is-flipped' : ''} ${card.matched ? 'is-matched' : ''}" 
                onclick="window.activeMemoryGame.handleCardClick(${idx})"
                ${card.matched ? 'disabled' : ''}
                aria-label="Card ${idx + 1}"
              >
                <div class="card-inner">
                  <div class="card-front">
                    <span class="card-hidden-icon">🌸</span>
                  </div>
                  <div class="card-back" style="background: ${card.item.color}15; border-color: ${card.item.color}">
                    <span class="card-item-icon">${card.item.icon}</span>
                    <span class="card-item-label">${lang === 'as' ? card.item.name_as : card.item.name_en}</span>
                  </div>
                </div>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}

window.activeMemoryGame = new MemoryGame();
