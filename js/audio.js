// RECONNECT Audio Engine
// 100% Offline Capable Audio Synthesizer and Web Speech Synthesis

class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.synth = window.speechSynthesis || null;
    this.soundEnabled = true;
    this.speechRate = 0.88; // Gentle, warm conversational cadence
    this.cachedVoices = [];

    // Preload available browser speech synthesis voices immediately
    if (this.synth) {
      this.refreshVoices();
      if (typeof this.synth.onvoiceschanged !== "undefined") {
        this.synth.onvoiceschanged = () => this.refreshVoices();
      }
    }
  }

  refreshVoices() {
    if (!this.synth) return [];
    this.cachedVoices = this.synth.getVoices() || [];
    return this.cachedVoices;
  }

  // Pre-process text to remove emojis, markdown, and clutter before speech synthesis
  cleanTextForSpeech(text) {
    if (!text) return "";
    return text
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // Emojis
      .replace(/[*_#`~>\[\]\(\)]/g, " ") // Markdown symbols
      .replace(/\s+/g, " ")
      .trim();
  }

  // Resolve best high-fidelity voice with natural accent priority
  getBestVoice(lang = "en") {
    let voices = this.cachedVoices;
    if (!voices || voices.length === 0) {
      voices = this.refreshVoices();
    }
    if (!voices || voices.length === 0) return null;

    if (lang === "bn") {
      // 1. Natural / Online Indian Bengali voices (Edge / Chrome Natural neural voices)
      const naturalBnIN = voices.find(v => {
        const name = (v.name || "").toLowerCase();
        const vLang = (v.lang || "").toLowerCase();
        return (name.includes("natural") || name.includes("online")) &&
               (name.includes("bengali") || name.includes("bangla") || name.includes("বাংলা") || vLang.includes("bn")) &&
               (vLang.includes("in") || name.includes("india") || name.includes("ভারত"));
      });
      if (naturalBnIN) return naturalBnIN;

      // 2. Google Indian Bengali
      const googleBn = voices.find(v => {
        const name = (v.name || "").toLowerCase();
        const vLang = (v.lang || "").toLowerCase();
        return (name.includes("google") || name.includes("বাংলা")) && 
               (vLang.includes("bn-in") || vLang.includes("bn_in"));
      });
      if (googleBn) return googleBn;

      // 3. Any standard Indian Bengali (bn-IN)
      const bnIn = voices.find(v => {
        const name = (v.name || "").toLowerCase();
        const vLang = (v.lang || "").toLowerCase();
        return vLang === "bn-in" || vLang.startsWith("bn-in") || name.includes("bengali (india)") || name.includes("বাংলা (ভারত)");
      });
      if (bnIn) return bnIn;

      // 4. Any other Bengali voice
      const anyBn = voices.find(v => {
        const name = (v.name || "").toLowerCase();
        const vLang = (v.lang || "").toLowerCase();
        return vLang.startsWith("bn") || name.includes("bengali") || name.includes("bangla") || name.includes("বাংলা");
      });
      if (anyBn) return anyBn;

      // 5. Friendly Indian English/Hindi fallback over US English robotic voice
      return voices.find(v => (v.lang || "").toLowerCase().includes("hi-in")) || null;
    }

    if (lang === "as") {
      // Assamese priority; fallback to Indian Bengali neural voice for closest phonetic match
      const asVoice = voices.find(v => {
        const name = (v.name || "").toLowerCase();
        const vLang = (v.lang || "").toLowerCase();
        return vLang.startsWith("as") || name.includes("assamese") || name.includes("অসমীয়া");
      });
      if (asVoice) return asVoice;
      return this.getBestVoice("bn");
    }

    if (lang === "hi") {
      const naturalHi = voices.find(v => {
        const name = (v.name || "").toLowerCase();
        const vLang = (v.lang || "").toLowerCase();
        return (name.includes("natural") || name.includes("online")) && (vLang.startsWith("hi") || name.includes("hindi"));
      });
      if (naturalHi) return naturalHi;
      return voices.find(v => (v.lang || "").toLowerCase().startsWith("hi")) || null;
    }

    // Default to Indian English or clear English
    const naturalEnIN = voices.find(v => {
      const name = (v.name || "").toLowerCase();
      const vLang = (v.lang || "").toLowerCase();
      return (name.includes("natural") || name.includes("online")) && vLang.includes("en-in");
    });
    if (naturalEnIN) return naturalEnIN;

    return voices.find(v => (v.lang || "").toLowerCase().includes("en-in")) || 
           voices.find(v => (v.lang || "").toLowerCase().startsWith("en")) || null;
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  // Play synthetic gentle harmonic tones for elderly users (no jarring beeps)
  playTone(type = "gentle_chime") {
    try {
      this.initAudio();
      if (!this.audioCtx || !this.soundEnabled) return;
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === "card_flip" || type === "tap") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === "success" || type === "match") {
        // Calming pentatonic three-note chord: C5 -> E5 -> G5
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + idx * 0.12;
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.15, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.36);
        });
      } else if (type === "gentle_chime" || type === "reminder") {
        // Soothing temple bowl chime: fundamental + gentle overtone
        [440, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(i === 0 ? 0.2 : 0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.25);
        });
      } else if (type === "gentle_hint") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(392, now);
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      }
    } catch (e) {
      console.warn("Audio tone error:", e);
    }
  }

  // Speak clear, natural voice prompts with neural server voice priority + offline browser fallback
  speak(text, lang = "en") {
    if (!this.soundEnabled) return;

    try {
      this.stopSpeech();

      const cleanText = this.cleanTextForSpeech(text);
      if (!cleanText) return;

      // Play soft chime before speaking
      this.playTone("gentle_hint");

      // Try server neural voice first for 100% authentic native Bengali / Indian accent
      const ttsUrl = `/api/tts?text=${encodeURIComponent(cleanText.substring(0, 400))}&lang=${encodeURIComponent(lang)}`;
      
      const audio = new Audio(ttsUrl);
      this.currentAudio = audio;

      let playedServerAudio = false;

      audio.onplay = () => {
        playedServerAudio = true;
      };

      audio.onerror = () => {
        if (!playedServerAudio) {
          this.speakBrowserFallback(cleanText, lang);
        }
      };

      audio.play().catch(() => {
        if (!playedServerAudio) {
          this.speakBrowserFallback(cleanText, lang);
        }
      });
    } catch (e) {
      console.warn("Neural audio error, falling back to browser:", e);
      this.speakBrowserFallback(text, lang);
    }
  }

  speakBrowserFallback(cleanText, lang = "en") {
    if (!this.synth) return;
    try {
      const sanitized = this.cleanTextForSpeech(cleanText);
      const utterance = new SpeechSynthesisUtterance(sanitized);
      
      if (lang === "bn" || lang === "as") {
        utterance.rate = 0.88;
        utterance.pitch = 1.02;
        utterance.lang = "bn-IN";
      } else if (lang === "hi") {
        utterance.rate = 0.88;
        utterance.pitch = 1.0;
        utterance.lang = "hi-IN";
      } else {
        utterance.rate = this.speechRate;
        utterance.pitch = 1.04;
        utterance.lang = "en-IN";
      }

      const voice = this.getBestVoice(lang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || utterance.lang;
      }

      this.synth.speak(utterance);
    } catch (err) {
      console.warn("Browser fallback speech synthesis failed:", err);
    }
  }

  stopSpeech() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

const audioManager = new AudioManager();
if (typeof window !== "undefined") {
  window.audioManager = audioManager;
}
