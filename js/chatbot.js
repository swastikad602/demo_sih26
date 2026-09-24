// RECONNECT "Mitra" AI Companion Controller
// Integrates with Backend Gemini Chat API, Multilingual Selector, Voice Synthesis, & Speech Recognition

const ChatbotCompanion = {
  chatHistory: [],
  isWaitingResponse: false,
  isWidgetOpen: false,
  recognition: null,
  currentLang: "as", // Default priority: Assamese

  langConfig: {
    as: {
      name: "অসমীয়া",
      speechCode: "bn-IN", // Eastern Indic voice cascade matches Assamese phonetics
      placeholder: "মিত্ৰাক কিবা সোধক বা কথা পাতক...",
      greeting: "নমস্কাৰ মায়া! মই মিত্ৰা, আপোনাৰ সংগী। আপোনাৰ প্রিয় গান, কবিতা বা দিনলিপিৰ বিষয়ে আমি কথা পাতিব পাৰোঁ। আজি আপোনাৰ মনটো কেনে আছে?",
      switchNotice: "নমস্কাৰ মায়া, এতিয়া আমি অসমীয়াত কথা পাতোঁ।",
      chips: [
        { label: "🎵 এটা গীত গোৱা", query: "এটা গীত গোৱা 🎵" },
        { label: "📖 এটা কবিতা কোৱা", query: "এটা কবিতা কোৱা 📖" },
        { label: "🌺 বিহুৰ স্মৃতি", query: "বিহুৰ স্মৃতি 🌺" },
        { label: "📋 আজিৰ ৰুটিন", query: "আজিৰ ৰুটিন 📋" }
      ]
    },
    bn: {
      name: "বাংলা",
      speechCode: "bn-IN",
      placeholder: "মিত্রাকে কিছু বলুন বা জিজ্ঞাসা করুন...",
      greeting: "নমস্কার মায়া! আমি আপনার বন্ধু মিত্রা। গান, কবিতা, পুরনো দিনের গল্প বা আপনার দিনলিপি নিয়ে আমরা কথা বলতে পারি। কেমন আছেন আপনি?",
      switchNotice: "নমস্কার মায়া, আমরা এখন বাংলায় কথা বলব।",
      chips: [
        { label: "🎵 একটি প্রিয় গান", query: "একটি প্রিয় গান গাও 🎵" },
        { label: "📖 একটি কবিতা", query: "একটি কবিতা শোনাও 📖" },
        { label: "🌺 পুরনো স্মৃতি", query: "পুরনো দিনের স্মৃতি 🌺" },
        { label: "📋 আজকের রুটিন", query: "আজকের রুটিন 📋" }
      ]
    },
    en: {
      name: "English",
      speechCode: "en-IN",
      placeholder: "Ask Mitra something or tap mic...",
      greeting: "Hello Maya! I am Mitra, your caring companion. We can talk about your favorite songs, poems, or your daily routine. How are you feeling today?",
      switchNotice: "Hello Maya, we can now speak in English.",
      chips: [
        { label: "🎵 Sing a song", query: "Sing a song for me 🎵" },
        { label: "📖 Recite poem", query: "Recite a poem 📖" },
        { label: "🌺 Memories", query: "Cultural memories 🌺" },
        { label: "📋 Routine", query: "What is my routine today? 📋" }
      ]
    },
    hi: {
      name: "हिन्दी",
      speechCode: "hi-IN",
      placeholder: "मित्रा से कुछ पूछें या बात करें...",
      greeting: "नमस्ते माया! मैं आपकी साथी मित्रा हूँ। हम आपके पसंदीदा गीतों, पुरानी यादों या दिनचर्या के बारे में बात कर सकते हैं। आप कैसी हैं?",
      switchNotice: "नमस्ते माया, अब हम हिन्दी में बात करेंगे।",
      chips: [
        { label: "🎵 एक प्यारा गीत", query: "एक प्यारा गीत गाओ 🎵" },
        { label: "📖 एक कविता", query: "एक कविता सुनाओ 📖" },
        { label: "🌺 पुरानी यादें", query: "पुरानी यादें 🌺" },
        { label: "📋 आज की दिनचर्या", query: "आज की दिनचर्या 📋" }
      ]
    },
    mn: {
      name: "মৈতৈলোন্",
      speechCode: "bn-IN",
      placeholder: "মিত্রাগা ৱারী শানবা...",
      greeting: "খুরুমজরি মায়া! ঐ মিত্রানি, অদোমগী মরূপনি। অদোমগা লোয়ননা ঐ ঈশৈ, শৈরেং অমসুং অদোমগী নুমিৎ খুদিংগী থবকশিংগী মরমদা ৱারী শানবা য়াই।",
      switchNotice: "খুরুমজরি মায়া, হৌজিক ঐখোয় মৈতৈলোন্দা ৱারী শানসি।",
      chips: [
        { label: "🎵 ঈশৈ শাকউ", query: "ঈশৈ অমা শাকউ 🎵" },
        { label: "📖 শৈরেং তাকউ", query: "শৈরেং অমা তাকউ 📖" },
        { label: "🌺 নাৎকী ৱারী", query: "নাৎকী ৱারী 🌺" },
        { label: "📋 রুতিন য়েংবা", query: "রুতিন য়েংবা 📋" }
      ]
    }
  },

  init() {
    // Check if app has language preset
    if (window.appState && window.appState.language && this.langConfig[window.appState.language]) {
      this.currentLang = window.appState.language;
    }

    const cfg = this.langConfig[this.currentLang] || this.langConfig.as;
    this.chatHistory = [
      {
        sender: "mitra",
        role: "assistant",
        text: cfg.greeting,
        source: "ai_model",
        lang: this.currentLang,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];

    this.initSpeechRecognition();
    this.bindDOMEvents();
    this.updateLanguageUI(false);
    console.log("[Mitra] Multilingual companion initialized with priority:", this.currentLang);
  },

  setLanguage(langCode, announce = true) {
    if (!this.langConfig[langCode]) return;
    const previousLang = this.currentLang;
    this.currentLang = langCode;

    if (previousLang !== langCode) {
      const cfg = this.langConfig[this.currentLang] || this.langConfig.as;
      this.chatHistory.push({
        sender: "mitra",
        role: "assistant",
        text: cfg.switchNotice,
        source: "ai_model",
        lang: this.currentLang,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
      this.renderChatMessages();
    }

    this.updateLanguageUI(announce);
  },

  updateLanguageUI(announce = true) {
    const cfg = this.langConfig[this.currentLang] || this.langConfig.as;

    // 1. Update active button state
    document.querySelectorAll(".chat-lang-btn").forEach(btn => {
      if (btn.getAttribute("data-lang") === this.currentLang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // 2. Update inputs placeholders
    const inputs = [document.getElementById("chat-text-input"), document.getElementById("floating-chat-input")];
    inputs.forEach(inp => {
      if (inp) inp.placeholder = cfg.placeholder;
    });

    // 3. Update quick chips
    const chipContainers = [
      document.getElementById("main-mitra-quick-chips"),
      document.getElementById("floating-mitra-quick-chips")
    ];
    chipContainers.forEach(container => {
      if (!container) return;
      container.innerHTML = cfg.chips.map(c => `
        <button class="mitra-chip-btn" onclick="ChatbotCompanion.handleUserInput('${c.query.replace(/'/g, "\\'")}')">
          ${c.label}
        </button>
      `).join('');
    });

    // 4. Update speech recognition lang
    if (this.recognition) {
      this.recognition.lang = cfg.speechCode;
    }

    // 5. Optional voice announcement
    if (announce) {
      this.speakWithVoiceFallback(cfg.switchNotice, this.currentLang);
    }
  },

  bindDOMEvents() {
    const fab = document.getElementById("floating-chat-fab");
    if (fab) {
      fab.onclick = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        this.toggleFloatingWidget();
      };
    }

    const closeBtn = document.getElementById("btn-close-floating-chat");
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        this.toggleFloatingWidget(false);
      };
    }
  },

  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = (this.langConfig[this.currentLang] || this.langConfig.as).speechCode;

      this.recognition.onstart = () => {
        const micBtns = [document.getElementById("mitra-mic-btn"), document.getElementById("floating-mic-btn")];
        micBtns.forEach(btn => { if (btn) btn.classList.add("listening"); });
      };

      this.recognition.onend = () => {
        const micBtns = [document.getElementById("mitra-mic-btn"), document.getElementById("floating-mic-btn")];
        micBtns.forEach(btn => { if (btn) btn.classList.remove("listening"); });
      };

      this.recognition.onerror = (e) => {
        console.warn("[Mitra] Speech recognition error:", e.error);
        const micBtns = [document.getElementById("mitra-mic-btn"), document.getElementById("floating-mic-btn")];
        micBtns.forEach(btn => { if (btn) btn.classList.remove("listening"); });
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          this.handleUserInput(transcript);
        }
      };
    }
  },

  toggleFloatingWidget(forceState = null) {
    this.isWidgetOpen = forceState !== null ? forceState : !this.isWidgetOpen;
    const popup = document.getElementById("floating-chat-popup");
    if (popup) {
      if (this.isWidgetOpen) {
        popup.classList.add("active");
        popup.style.setProperty("display", "flex", "important");
        this.renderChatMessages();
        const input = document.getElementById("floating-chat-input");
        if (input) setTimeout(() => input.focus(), 100);
      } else {
        popup.classList.remove("active");
        popup.style.setProperty("display", "none", "important");
      }
    }
  },

  openChat() {
    if (window.app && typeof window.app.navigateTo === "function") {
      window.app.navigateTo("screen-chat-mitra");
    }
    this.renderChatMessages();
    const cfg = this.langConfig[this.currentLang] || this.langConfig.as;
    this.speakWithVoiceFallback(cfg.greeting, this.currentLang);
  },

  renderChatMessages() {
    const targetContainers = ["chat-messages-container", "floating-chat-messages"];

    targetContainers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = this.chatHistory.map(msg => {
        const isBot = msg.role === 'assistant' || msg.sender === 'mitra';
        const langLabel = this.langConfig[msg.lang] ? this.langConfig[msg.lang].name : "";
        return `
          <div class="chat-bubble-row ${isBot ? 'bot' : 'user'}">
            ${isBot ? '<div class="elder-companion-avatar" style="width:34px; height:34px; font-size:16px;">🌺</div>' : ''}
            <div class="chat-bubble">
              <p class="msg-text">${msg.text || msg.content}</p>
              <div style="display:flex; align-items:center; justify-content:flex-end; margin-top:4px;">
                <span class="msg-time" style="margin-top:0;">${msg.timestamp}</span>
              </div>
            </div>
            ${isBot ? `
              <button class="btn-audio-repeat" style="width:30px; height:30px; font-size:13px; margin-left:4px;" onclick="ChatbotCompanion.speakWithVoiceFallback('${(msg.text || msg.content || '').replace(/'/g, "\\'")}', '${msg.lang || this.currentLang}')" title="Read again">
                🔊
              </button>
            ` : ''}
          </div>
        `;
      }).join('');

      container.scrollTop = container.scrollHeight;
    });
  },

  setTypingState(isTyping) {
    this.isWaitingResponse = isTyping;
    const indicators = [
      document.getElementById("mitra-typing-indicator"),
      document.getElementById("floating-typing-indicator")
    ];
    const cfg = this.langConfig[this.currentLang] || this.langConfig.as;
    const labelText = this.currentLang === "as" ? "মিত্ৰাই ভাবি আছে..." : (this.currentLang === "bn" ? "মিত্রা ভাবছে..." : "Mitra is thinking...");

    indicators.forEach(ind => {
      if (ind) {
        ind.style.display = isTyping ? "flex" : "none";
        const label = ind.querySelector(".typing-label");
        if (label) label.textContent = labelText;
      }
    });
  },

  speakWithVoiceFallback(text, requestedLang) {
    if (window.audioManager && typeof window.audioManager.speak === "function") {
      window.audioManager.speak(text, requestedLang);
      return;
    }

    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const targetLang = requestedLang || this.currentLang || "as";
    const voices = window.speechSynthesis.getVoices() || [];

    // Fallback cascade for Northeast & Indian languages
    const fallbackCodes = targetLang === "as" 
      ? ["as-IN", "as", "bn-IN", "bn", "hi-IN", "hi", "en-IN", "en-US"]
      : targetLang === "bn"
      ? ["bn-IN", "bn", "as-IN", "hi-IN", "en-IN"]
      : targetLang === "hi"
      ? ["hi-IN", "hi", "en-IN", "en-US"]
      : ["en-IN", "en-GB", "en-US", "hi-IN"];

    let voice = null;
    let code = (targetLang === "bn" || targetLang === "as") ? "bn-IN" : (targetLang === "hi" ? "hi-IN" : "en-IN");
    for (const c of fallbackCodes) {
      const match = voices.find(v => v.lang.toLowerCase().startsWith(c.toLowerCase()));
      if (match) {
        voice = match;
        code = match.lang;
        break;
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = code;
    if (voice) utterance.voice = voice;
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  },

  startVoiceQuery() {
    if (!this.recognition) {
      alert("Microphone voice recognition is not supported in this browser. Please type your message!");
      return;
    }
    const cfg = this.langConfig[this.currentLang] || this.langConfig.as;
    this.recognition.lang = cfg.speechCode;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition already started or error:", e);
    }
  },

  async handleUserInput(presetText = null) {
    if (this.isWaitingResponse) return;

    let query = presetText;
    if (!query) {
      const mainInput = document.getElementById("chat-text-input");
      const floatInput = document.getElementById("floating-chat-input");

      if (this.isWidgetOpen && floatInput && floatInput.value && floatInput.value.trim()) {
        query = floatInput.value.trim();
        floatInput.value = "";
      } else if (mainInput && mainInput.value && mainInput.value.trim()) {
        query = mainInput.value.trim();
        mainInput.value = "";
      } else if (floatInput && floatInput.value && floatInput.value.trim()) {
        query = floatInput.value.trim();
        floatInput.value = "";
      }
    }

    if (!query) return;

    // Precise script & language detection
    let detectedLang = this.currentLang;
    if (/[ৰৱ]/.test(query)) {
      detectedLang = "as"; // Distinct Assamese Ra / Wa
    } else if (/[র]/.test(query)) {
      detectedLang = "bn"; // Distinct Bengali Ra
    } else if (/[\u0900-\u097F]/.test(query)) {
      detectedLang = "hi"; // Devanagari Hindi
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Add user message
    this.chatHistory.push({
      sender: "patient",
      role: "user",
      text: query,
      content: query,
      lang: detectedLang,
      timestamp: timeStr
    });
    this.renderChatMessages();
    this.setTypingState(true);

    let responseText = "";
    let source = "ai_model";

    try {
      // Strictly isolate history to the active language to prevent cross-language confusion
      const historyPayload = this.chatHistory
        .filter(m => !m.lang || m.lang === detectedLang)
        .slice(-6)
        .map(m => ({
          role: m.role || "user",
          content: m.text || m.content,
          timestamp: m.timestamp
        }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const endpoint = this.getApiUrl();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: "elder_maya",
          message: query,
          language: detectedLang,
          conversation_history: historyPayload
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      responseText = data.reply;
      source = data.source || "ai_model";
    } catch (err) {
      console.warn("[Mitra] Chat API error:", err);
      responseText = detectedLang === "as"
        ? "মায়া, মোৰ সেৱাৰ সৈতে ক্ষন্তেক সংযোগ বিচ্ছিন্ন হৈছে। অনুগ্ৰহ কৰি আকৌ এবাৰ সোধক।"
        : (detectedLang === "bn"
        ? "মায়া, সংযোগে একটু সমস্যা হয়েছে। অনুগ্রহ করে আর একবার বলুন।"
        : "I am having trouble connecting right now. Please ensure the server is running on http://localhost:8000 and try again.");
      source = "connection_error";
    } finally {
      this.setTypingState(false);
    }

    // 2. Append assistant response
    this.chatHistory.push({
      sender: "mitra",
      role: "assistant",
      text: responseText,
      content: responseText,
      source: source,
      lang: detectedLang,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });
    this.renderChatMessages();

    // 3. Speak response out loud
    this.speakWithVoiceFallback(responseText, detectedLang);
  },

  getApiUrl() {
    if (window.location && window.location.port === "8000") {
      return "/api/chat";
    }
    return "http://localhost:8000/api/chat";
  }
};

window.ChatbotCompanion = ChatbotCompanion;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    ChatbotCompanion.init();
  });
} else {
  ChatbotCompanion.init();
}
