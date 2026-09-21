// RECONNECT Audio Engine
// 100% Offline Capable Audio Synthesizer, Web Speech Synthesis & Voice Recognition

class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.synth = window.speechSynthesis || null;
    this.soundEnabled = true;
    this.speechRate = 0.85; // Slightly slower, calm cadence for elderly users
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.initRecognition();
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      } catch (e) {
        console.warn("Speech recognition init error:", e);
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

  // Speak clear voice prompts with callbacks for UI animation
  speak(text, lang = "en", onStart = null, onEnd = null) {
    if (!this.soundEnabled || !this.synth) {
      if (onEnd) onEnd();
      return;
    }

    try {
      this.synth.cancel(); // Cancel prior utterances cleanly

      // Play soft chime before speaking
      this.playTone("gentle_hint");

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.speechRate;
        utterance.pitch = 1.05; // Friendly, clear pitch

        // Select voice if available
        const voices = this.synth.getVoices() || [];
        if (lang === "as") {
          const asVoice = voices.find(v => 
            v.lang.includes("as") || 
            v.lang.includes("bn") || 
            v.lang.includes("hi") || 
            v.lang.includes("en-IN")
          );
          if (asVoice) utterance.voice = asVoice;
          utterance.lang = "bn-IN"; // standard phonetics fallback
        } else {
          const enVoice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("en"));
          if (enVoice) utterance.voice = enVoice;
          utterance.lang = "en-IN";
        }

        utterance.onstart = () => {
          this.isSpeaking = true;
          if (onStart) onStart();
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          if (onEnd) onEnd();
        };

        utterance.onerror = () => {
          this.isSpeaking = false;
          if (onEnd) onEnd();
        };

        this.synth.speak(utterance);
      }, 150);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      if (onEnd) onEnd();
    }
  }

  stopSpeech() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  // Voice Recognition (Speech to Text)
  listen(onResult, onStatusChange = null, lang = "en") {
    if (!this.recognition) {
      console.warn("Speech recognition is not supported in this browser.");
      if (onStatusChange) onStatusChange("unsupported");
      return false;
    }

    try {
      this.stopSpeech(); // Stop any ongoing speech before listening

      this.recognition.lang = lang === "as" ? "bn-IN" : "en-IN";
      this.isListening = true;
      if (onStatusChange) onStatusChange("listening");

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        if (onStatusChange) onStatusChange("idle");
        if (onResult) onResult(transcript);
      };

      this.recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        this.isListening = false;
        if (onStatusChange) onStatusChange("error");
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onStatusChange) onStatusChange("idle");
      };

      this.recognition.start();
      return true;
    } catch (e) {
      console.warn("Recognition start failed:", e);
      this.isListening = false;
      if (onStatusChange) onStatusChange("error");
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }
}

const audioManager = new AudioManager();
