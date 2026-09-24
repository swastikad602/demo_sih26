// Voice-First Interaction Engine: Speech Synthesis (TTS), Speech Recognition (STT), & Sound Synthesizer

const VoiceEngine = {
  ttsEnabled: true,
  isSpeaking: false,
  isListening: false,
  recognition: null,
  audioCtx: null,

  init() {
    // Initialize Web Audio Context on first user gesture
    const initAudio = () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      document.removeEventListener("click", initAudio);
      document.removeEventListener("touchstart", initAudio);
    };
    document.addEventListener("click", initAudio, { once: true });
    document.addEventListener("touchstart", initAudio, { once: true });

    // Initialize Speech Recognition
    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateMicVisualizer(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateMicVisualizer(false);
      };

      this.recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e.error);
        this.isListening = false;
        this.updateMicVisualizer(false);
      };
    }
  },

  // Synthesize Speech (TTS) with Robust Language Fallback (e.g. Assamese/Manipuri -> Bengali/Hindi/English)
  speak(text, lang = null, onEnd = null) {
    if (!this.ttsEnabled || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing utterance
    window.speechSynthesis.cancel();

    const targetLang = lang || I18N.currentLang || "en";
    const voices = window.speechSynthesis.getVoices() || [];

    // Fallback hierarchy: try requested -> nearest regional -> Hindi -> English
    const fallbackChain = {
      as: ["as-IN", "as", "bn-IN", "bn", "hi-IN", "hi", "en-IN", "en-US"],
      mn: ["mn-IN", "mn", "hi-IN", "hi", "bn-IN", "bn", "en-IN", "en-US"],
      bn: ["bn-IN", "bn", "hi-IN", "hi", "en-IN", "en-US"],
      hi: ["hi-IN", "hi", "en-IN", "en-US"],
      en: ["en-IN", "en-GB", "en-US", "en"],
    };

    const candidates = fallbackChain[targetLang] || ["en-IN", "en-US", "hi-IN"];

    // Find first supported voice from candidate chain
    let selectedVoice = null;
    let selectedLangCode = "en-IN";

    for (const code of candidates) {
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase() === code.toLowerCase() ||
          v.lang.toLowerCase().startsWith(code.toLowerCase()),
      );
      if (match) {
        selectedVoice = match;
        selectedLangCode = match.lang;
        break;
      }
    }

    if (!selectedVoice && voices.length > 0) {
      // Find any Indian accent voice or default to first voice
      selectedVoice = voices.find((v) => v.lang.includes("IN")) || voices[0];
      selectedLangCode = selectedVoice ? selectedVoice.lang : "en-IN";
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLangCode;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 0.88; // Slower, calmer rate tailored for dementia patients
    utterance.pitch = 1.0;

    this.isSpeaking = true;
    this.showSpeakingWaveform(true);

    utterance.onend = () => {
      this.isSpeaking = false;
      this.showSpeakingWaveform(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn(
        `[VoiceEngine] Speech error with lang ${selectedLangCode}. Retrying with universal English/Hindi fallback:`,
        err,
      );
      this.isSpeaking = false;
      this.showSpeakingWaveform(false);

      // Secondary fallback retry to avoid silent failure
      if (selectedLangCode !== "en-IN" && selectedLangCode !== "hi-IN") {
        const retryUtterance = new SpeechSynthesisUtterance(text);
        retryUtterance.lang = "hi-IN";
        retryUtterance.rate = 0.88;
        retryUtterance.onend = () => {
          if (onEnd) onEnd();
        };
        retryUtterance.onerror = () => {
          if (onEnd) onEnd();
        };
        window.speechSynthesis.speak(retryUtterance);
      } else if (onEnd) {
        onEnd();
      }
    };

    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.showSpeakingWaveform(false);
    }
  },

  // Listen for Voice Input
  listen(onResult, targetLang = null) {
    if (!this.recognition) {
      console.warn("Speech recognition not supported in this browser.");
      alert(
        "Voice input is not supported in this browser. You can type or tap choices!",
      );
      return;
    }

    this.stopSpeaking();

    const lang = targetLang || I18N.currentLang;
    const langMap = {
      en: "en-IN",
      as: "bn-IN",
      bn: "bn-IN",
      mn: "hi-IN",
      hi: "hi-IN",
    };
    this.recognition.lang = langMap[lang] || "en-IN";

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition start exception:", e);
    }
  },

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
      this.updateMicVisualizer(false);
    }
  },

  // Sound Effects Generator via Web Audio
  playChime(type = "gentle_reminder") {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === "suspended") this.audioCtx.resume();

      const now = this.audioCtx.currentTime;

      if (type === "gentle_reminder") {
        // Soft calming two-tone bell (E5 -> G#5)
        this.createTone(659.25, now, 0.6, 0.15);
        this.createTone(830.61, now + 0.25, 0.9, 0.2);
      } else if (type === "game_correct") {
        // Joyful chime (C5 -> E5 -> G5)
        this.createTone(523.25, now, 0.2, 0.15);
        this.createTone(659.25, now + 0.12, 0.2, 0.15);
        this.createTone(783.99, now + 0.24, 0.5, 0.2);
      } else if (type === "game_try_again") {
        // Soft encouraging low tone (F4 -> D4)
        this.createTone(349.23, now, 0.3, 0.1);
        this.createTone(293.66, now + 0.18, 0.4, 0.1);
      } else if (type === "celebration") {
        // Festive arpeggio
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          this.createTone(freq, now + idx * 0.1, 0.4, 0.18);
        });
      }
    } catch (e) {
      console.warn("Audio synthesis warning:", e);
    }
  },

  createTone(frequency, startTime, duration, gainLevel = 0.15) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  },

  showSpeakingWaveform(show) {
    const indicator = document.getElementById("voice-speaking-indicator");
    if (indicator) {
      indicator.style.display = show ? "flex" : "none";
    }
  },

  updateMicVisualizer(isListening) {
    const micBtns = document.querySelectorAll(".mic-btn");
    micBtns.forEach((btn) => {
      if (isListening) {
        btn.classList.add("recording-pulse");
      } else {
        btn.classList.remove("recording-pulse");
      }
    });
  },
};
