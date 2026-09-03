// Adaptive AI Difficulty Engine (Transparent, Explainable Rule-Based ML Model)

const AdaptiveAI = {
  // Threshold constants
  SLOW_TIME_THRESHOLD_SEC: 14.0,
  FAST_TIME_THRESHOLD_SEC: 8.5,
  LOW_ACCURACY_THRESHOLD_PCT: 60.0,
  HIGH_ACCURACY_THRESHOLD_PCT: 85.0,
  
  // Evaluate performance and determine next difficulty level
  evaluateSession(currentLevel, accuracyPct, avgResponseTimeSec, recentSessions = []) {
    let newLevel = currentLevel;
    let adjustment = 'none'; // 'increased', 'decreased', 'maintained'
    let explanation = '';
    let factors = [];
    
    // Check for downward adaptation (ease cognitive frustration)
    if (accuracyPct < this.LOW_ACCURACY_THRESHOLD_PCT || avgResponseTimeSec > this.SLOW_TIME_THRESHOLD_SEC) {
      newLevel = Math.max(1, currentLevel - 1);
      if (newLevel < currentLevel) {
        adjustment = 'decreased';
        factors.push(`Accuracy (${accuracyPct.toFixed(0)}%) was below the 60% comfort threshold`);
        if (avgResponseTimeSec > this.SLOW_TIME_THRESHOLD_SEC) {
          factors.push(`Average response time (${avgResponseTimeSec.toFixed(1)}s) exceeded ${this.SLOW_TIME_THRESHOLD_SEC}s`);
        }
        explanation = `To keep exercises enjoyable and prevent fatigue, the system gently adjusted the difficulty to Level ${newLevel} (larger visual cues and simpler choices).`;
      } else {
        explanation = `Maintaining at Level 1 (Foundational) to ensure maximum comfort and confidence.`;
      }
    } 
    // Check for upward progression (healthy cognitive engagement)
    else if (accuracyPct >= this.HIGH_ACCURACY_THRESHOLD_PCT && avgResponseTimeSec <= this.FAST_TIME_THRESHOLD_SEC) {
      newLevel = Math.min(3, currentLevel + 1);
      if (newLevel > currentLevel) {
        adjustment = 'increased';
        factors.push(`High accuracy (${accuracyPct.toFixed(0)}%) demonstrated strong recall`);
        factors.push(`Quick response time (${avgResponseTimeSec.toFixed(1)}s) indicates smooth processing`);
        explanation = `Great progress! Based on high accuracy and prompt responses, difficulty has progressed to Level ${newLevel} for richer memory stimulation.`;
      } else {
        explanation = `Maintaining at Level 3 (Mastery) with consistent outstanding performance!`;
      }
    } 
    // Balanced performance
    else {
      explanation = `Current performance is stable and well-balanced. Continuing at Level ${currentLevel}.`;
      factors.push(`Accuracy (${accuracyPct.toFixed(0)}%) is within the optimal training band (60%-84%)`);
      factors.push(`Response time (${avgResponseTimeSec.toFixed(1)}s) is steady`);
    }
    
    return {
      previousLevel: currentLevel,
      newLevel: newLevel,
      adjustment: adjustment,
      factors: factors,
      explanation: explanation,
      metrics: {
        accuracy: accuracyPct,
        responseTime: avgResponseTimeSec
      },
      disclaimer: "This adaptation is for game engagement and difficulty calibration only. It does not constitute or replace a clinical diagnosis."
    };
  },
  
  // Show transparent explanation modal
  showExplanationModal(evalResult) {
    const modal = document.getElementById('adaptive-ai-modal');
    if (!modal) return;
    
    const content = document.getElementById('adaptive-ai-modal-content');
    if (content) {
      const levelNames = { 1: "Level 1: Gentle & Visual", 2: "Level 2: Balanced Recall", 3: "Level 3: Active Mastery" };
      
      content.innerHTML = `
        <div class="ai-badge-header">
          <span class="ai-sparkle-icon">✨</span>
          <div>
            <h3 style="margin:0; font-size:1.4rem; color:var(--text-primary);">Adaptive AI Personalization</h3>
            <p style="margin:4px 0 0 0; color:var(--text-secondary); font-size:0.95rem;">Transparent explainability report for patient and caregiver</p>
          </div>
        </div>
        
        <div class="level-transition-card">
          <div class="level-pill ${evalResult.previousLevel === evalResult.newLevel ? 'current' : 'prev'}">
            <span class="label">Previous</span>
            <span class="val">${levelNames[evalResult.previousLevel] || `Level ${evalResult.previousLevel}`}</span>
          </div>
          <div class="arrow-indicator">➔</div>
          <div class="level-pill active">
            <span class="label">Current Level</span>
            <span class="val">${levelNames[evalResult.newLevel] || `Level ${evalResult.newLevel}`}</span>
          </div>
        </div>
        
        <div class="metric-row-box">
          <div class="m-card">
            <span class="m-label">Session Accuracy</span>
            <span class="m-val ${evalResult.metrics.accuracy >= 80 ? 'green' : 'amber'}">${evalResult.metrics.accuracy.toFixed(0)}%</span>
          </div>
          <div class="m-card">
            <span class="m-label">Avg Response Time</span>
            <span class="m-val">${evalResult.metrics.responseTime.toFixed(1)} sec</span>
          </div>
        </div>
        
        <div class="reasoning-box">
          <h4 style="margin:0 0 8px 0; color:var(--primary-dark);">Why was this level chosen?</h4>
          <p style="font-size:1.05rem; line-height:1.5; color:var(--text-primary); margin:0 0 10px 0;">${evalResult.explanation}</p>
          <ul style="margin:0; padding-left:20px; color:var(--text-secondary); font-size:0.95rem;">
            ${evalResult.factors.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
        
        <div class="clinical-disclaimer-box">
          <strong>⚠️ Clinical Note:</strong> ${evalResult.disclaimer}
        </div>
        
        <button class="btn btn-primary" style="width:100%; margin-top:16px; padding:14px; font-size:1.1rem;" onclick="document.getElementById('adaptive-ai-modal').classList.remove('active')">
          Understood / Close
        </button>
      `;
    }
    
    modal.classList.add('active');
  }
};
