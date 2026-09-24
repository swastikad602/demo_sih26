// RECONNECT Explainable AI Adaptive Difficulty Engine
// Implements deterministic, transparent rules based on cognitive engagement metrics.
// Strictly adheres to non-diagnostic medical boundaries.

class ExplainableAdaptiveEngine {
  constructor() {
    this.minLevel = 1;
    this.maxLevel = 3;
  }

  // Calculate simple non-clinical Activity Score (0 - 100)
  calculateScore(accuracy, responseTimeSeconds, hintsUsed = 0, currentLevel = 1) {
    // Base score from accuracy (60% weight)
    let score = (accuracy * 0.6);

    // Speed bonus/penalty (30% weight) - optimum is 10-25 seconds
    if (responseTimeSeconds <= 20) {
      score += 30;
    } else if (responseTimeSeconds <= 45) {
      score += 20;
    } else if (responseTimeSeconds <= 60) {
      score += 10;
    } else {
      score += 5;
    }

    // Hint penalty (up to -10%)
    score -= Math.min(hintsUsed * 5, 10);

    // Level bonus (10% weight)
    score += (currentLevel * 3.33);

    // Clamp between 20 and 100
    return Math.round(Math.max(25, Math.min(100, score)));
  }

  // Choose next level with complete explainability metadata
  evaluateSession(sessionData, recentSessions = []) {
    const accuracy = Number(sessionData.accuracy);
    const avgTime = Number(sessionData.responseTime);
    const hints = Number(sessionData.hintsUsed || 0);
    const currentLevel = Number(sessionData.currentLevel || 1);

    let nextLevel = currentLevel;
    let ruleTriggered = "";
    let reason = "";
    let suggestion = null;
    let needsReviewAlert = false;

    // Rule 1 — Increase difficulty
    if (accuracy >= 80 && avgTime < 20) {
      nextLevel = Math.min(currentLevel + 1, this.maxLevel);
      ruleTriggered = "Rule 1: High Accuracy & Fast Response";
      reason = "Strong recent performance — activity difficulty increased slightly.";
    }
    // Rule 3 — Reduce difficulty
    else if (accuracy < 50 || avgTime > 60) {
      nextLevel = Math.max(currentLevel - 1, this.minLevel);
      ruleTriggered = "Rule 3: Low Accuracy or Extended Latency";
      reason = "Let's make the next activity easier and more comfortable.";
      suggestion = "Recommended simpler exercise or gentle break.";
    }
    // Rule 2 — Maintain difficulty
    else {
      nextLevel = currentLevel;
      ruleTriggered = "Rule 2: Stable Performance";
      reason = "Performance is stable — keeping the current activity level.";
    }

    // Rule 4 — Repeated long response check
    if (avgTime > 45 || hints >= 2) {
      suggestion = "A gentle hint or short rest was suggested during the activity.";
    }

    // Rule 5 — Repeated poor recent sessions (last 3 sessions below historical average)
    if (recentSessions.length >= 3) {
      const recentAccs = recentSessions.slice(0, 3).map(s => Number(s.accuracy || 0));
      const recentAvg = recentAccs.reduce((a, b) => a + b, 0) / recentAccs.length;
      
      // If last 3 sessions averaged under 50%
      if (recentAvg < 50 && accuracy < 50) {
        needsReviewAlert = true;
      }
    }

    return {
      currentLevel,
      recommendedLevel: nextLevel,
      accuracy,
      responseTime: avgTime,
      ruleTriggered,
      reason,
      suggestion,
      needsReviewAlert,
      explanationCard: {
        previousLevelText: `Level ${currentLevel}`,
        accuracyText: `${accuracy}%`,
        responseTimeText: `${avgTime}s`,
        recommendationText: `Level ${nextLevel}`,
        whyTitle: "Why did the AI adjust this?",
        whyDescription: reason
      }
    };
  }
}

const adaptiveEngine = new ExplainableAdaptiveEngine();
