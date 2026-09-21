// RECONNECT Personal Voice Companion ("Mitra" / "মিত্ৰ")
// Voice-first conversational companion referencing stored patient context for emotional & cognitive wellness.

class PersonalCompanion {
  constructor() {
    this.isActive = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.currentCaption = "";
    this.storedPatientContext = {
      name: "Maya Borah",
      preferredName: "Maya",
      preferredName_as: "মায়া",
      age: 72,
      location: "Guwahati, Assam",
      favorite_songs: [
        { title: "O Mur Apunar Dekh (অ' মোৰ আপোনাৰ দেশ)", lyrics: "O Mur Apunar Dekh, O Mur Sikuni Dekh, Enekhon Suwola, Enekhon Suwola, Enekhon Moromor Dekh..." },
        { title: "Goalparia Lokageet (হস্তীৰ কন্যা)", lyrics: "Hokole jikire gaan, Goalparia shanti monor botaah..." },
        { title: "Borgeet (জয় জয় জগপতি)", lyrics: "Jaya jaya jagapati bhava bhaya harana, Madhava Madhava Madhusudana..." }
      ],
      favorite_poems: [
        { title: "Kadamoni (কদমনী) by Lakshminath Bezbaroa", lines: "The gentle morning breeze over the Brahmaputra hills, whispering memories of joy, tranquility and eternal peace." }
      ],
      cultural_interests: [
        "Bokul and Kopou orchids blooming in springtime",
        "The rhythm of the Dhol, Pepa, and Bihu dance with family",
        "Fresh hot Til Pitha prepared on Magh Bihu morning",
        "The golden sheen of traditional Muga Silk weaving"
      ],
      family_members: [
        { name: "Anita", relationship: "Daughter (জীয়ৰী)", detail: "Lives in Guwahati, calls you every evening at 5:00 PM." },
        { name: "Rahul", relationship: "Son (পুত্ৰ)", detail: "Your elder son, visits every Bihu festival." },
        { name: "Aarav", relationship: "Grandson (নাতি, Age 9)", detail: "Loves your homemade narikol pitha and tells you school stories." },
        { name: "Priya", relationship: "Granddaughter (নাতিনী)", detail: "Won first prize in traditional Bihu dance!" }
      ],
      medication_schedule: "Blood Pressure medicine (Amlodipine 5mg) after morning tea, and gentle afternoon rest."
    };
  }

  openCompanion() {
    this.isActive = true;
    const lang = window.appState ? window.appState.language : "en";
    
    app.navigateTo("screen-elder-companion");
    this.renderCompanionUI();

    // Voice-First Opening Greeting
    const greeting = lang === "as"
      ? "নমস্কাৰ মায়া! মই মিত্ৰ, আপোনাৰ সংগী। আজি আপোনাৰ প্ৰিয় গান, কবিতা বা পৰিয়ালৰ কথা পাতোঁ আহক। আপুনি কি শুনিব বিচাৰিব?"
      : "Namaskar Maya! I am Mitra, your personal companion. Would you like to listen to your favorite song, recite a poem, or talk about family?";

    this.speakResponse(greeting);
  }

  closeCompanion() {
    this.isActive = false;
    audioManager.stopSpeech();
    audioManager.stopListening();
    app.navigateTo("screen-elder-home");
  }

  // Handle user input via Speech Recognition or quick topic chip
  startVoiceListening() {
    const lang = window.appState ? window.appState.language : "en";
    const statusLabel = document.getElementById("companion-status-text");
    const avatarRing = document.getElementById("companion-avatar-ring");

    if (avatarRing) avatarRing.classList.add("listening-pulse");
    if (statusLabel) statusLabel.innerText = lang === "as" ? "শুনি আছোঁ... কওক" : "Listening... speak now";

    audioManager.playTone("tap");

    const success = audioManager.listen(
      (transcript) => {
        if (avatarRing) avatarRing.classList.remove("listening-pulse");
        if (transcript) {
          this.processUserInput(transcript);
        }
      },
      (status) => {
        if (status === "idle" || status === "error") {
          if (avatarRing) avatarRing.classList.remove("listening-pulse");
          if (statusLabel) statusLabel.innerText = lang === "as" ? "কথা ক'বলৈ স্পৰ্শ কৰক" : "Tap microphone to speak";
        }
      },
      lang
    );

    if (!success) {
      if (avatarRing) avatarRing.classList.remove("listening-pulse");
      if (statusLabel) statusLabel.innerText = lang === "as" ? "তলৰ বিকল্প স্পৰ্শ কৰক" : "Choose a topic below";
    }
  }

  processUserInput(userInput) {
    const lang = window.appState ? window.appState.language : "en";
    const response = this.generateContextualResponse(userInput, lang);
    this.speakResponse(response);
  }

  // Generate personalized, empathetic response using stored patient context
  generateContextualResponse(query, lang = "en") {
    const q = (query || "").toLowerCase();
    const ctx = this.storedPatientContext;
    const name = lang === "as" ? ctx.preferredName_as : ctx.preferredName;

    // 1. Songs & Music
    if (q.includes("song") || q.includes("sing") || q.includes("music") || q.includes("গান") || q.includes("গীত") || q.includes("শুনাওক")) {
      const song = ctx.favorite_songs[0];
      if (lang === "as") {
        return `আপোনাৰ প্ৰিয় গানটো গাওঁ আহক, মায়া: "${song.title}"। "${song.lyrics}" সঙ্গীতৰ সুৰে সদায় মনলৈ শান্তি আৰু আনন্দ আনে।`;
      }
      return `I would love to sing your favorite song, ${name}! "${song.title}": "${song.lyrics}" Music always brings peace and joyful memories to our hearts.`;
    }

    // 2. Poems & Literature
    if (q.includes("poem") || q.includes("poetry") || q.includes("কবিতা") || q.includes("সাহিত্য")) {
      const poem = ctx.favorite_poems[0];
      if (lang === "as") {
        return `ৰসৰাজ লক্ষ্মীনাথ বেজবৰুৱাৰ "${poem.title}" কবিতাৰ কেইটামান শাৰী মনত পেলাওঁ: "ব্ৰহ্মপুত্ৰৰ বতাহে আনে কদমনীৰ সুবাস, মনত পেলাই অতীতৰ মধুৰ আনন্দময় স্মৃতি।" বৰ শুৱলা শব্দ!`;
      }
      return `Let us recite from your favorite poem, "${poem.title}": "${poem.lines}" The literature of Assam holds so much timeless serenity.`;
    }

    // 3. Family Members (Anita, Rahul, Aarav, Priya)
    if (q.includes("family") || q.includes("anita") || q.includes("daughter") || q.includes("son") || q.includes("aarav") || q.includes("grandson") || q.includes("পৰিয়াল") || q.includes("অনিতা") || q.includes("ল'ৰা-ছোৱালী")) {
      if (lang === "as") {
        return `আপোনাৰ পৰিয়ালে আপোনাক বৰ মৰম কৰে, মায়া। আপোনাৰ জীয়ৰী অনিতাই গুৱাহাটীৰ পৰা প্ৰতি সন্ধিয়া ৫ বজাত খবৰ লয়। আৰু নাতি আৰৱে কাইলৈ আপোনাৰ হাতৰ নাৰিকলৰ পিঠা খাবলৈ বৰকৈ মন কৰিছে!`;
      }
      return `Your family loves you dearly, ${name}. Your daughter Anita calls you every evening from Guwahati at 5:00 PM, and your grandson Aarav is always asking for your homemade narikol pitha!`;
    }

    // 4. Cultural Heritage & Bihu Festival
    if (q.includes("bihu") || q.includes("culture") || q.includes("festival") || q.includes("tea") || q.includes("বিহু") || q.includes("সংস্কৃতি") || q.includes("পিঠা")) {
      if (lang === "as") {
        return `বিহুৰ কথা মনত পৰিলে আনন্দ লাগে, নহয়নে মায়া? নতুন মুগা গামোচা, ঢোল-পেঁপাৰ মাতি, আৰু ঘৰৰ সকলোৱে একেলগে খোৱা তিল পিঠা। সেই আনন্দময় স্মৃতিবোৰ সদায় আমাৰ হৃদয়ত উজ্জ্বল হৈ থাকে।`;
      }
      return `Thinking of Bihu always brings a warm smile, ${name}! The sound of the Dhol and Pepa, the bright red Muga silk, and preparing fresh Til Pitha with family are moments full of joy.`;
    }

    // 5. Daily Routine & Medication
    if (q.includes("medicine") || q.includes("routine") || q.includes("doctor") || q.includes("ঔষধ") || q.includes("ডাক্তৰ") || q.includes("সময়")) {
      if (lang === "as") {
        return `আজিৰ সকলো কাম সুন্দৰভাৱে চলি আছে, মায়া। পুৱাৰ চাহৰ পিছত আপোনাৰ ৰক্তচাপৰ ঔষধ খাইছে। দিনৰ আহাৰ আৰু সন্ধিয়া অনিতাৰ সৈতে কথা পতাৰ কাৰণে মই আপোনাক শান্তভাৱে মনত পেলাই দিম।`;
      }
      return `Everything is right on track today, ${name}. Your blood pressure medication was taken with morning tea. I will give you a gentle reminder when it is time for lunch and evening tea.`;
    }

    // 6. Default Warm Reassurance
    if (lang === "as") {
      return `ধন্যবাদ মায়া, আপোনাৰ কথা শুনি বৰ ভাল লাগিল। আপুনি আপোনাৰ প্ৰিয় গান "${ctx.favorite_songs[0].title}" শুনিব বিচাৰে নে অনিতাৰ কথা মনত পেলাব বিচাৰে?`;
    }
    return `Thank you for sharing that with me, ${name}. It is wonderful conversing with you. Would you like to hear your favorite song "${ctx.favorite_songs[0].title}" or talk about your family?`;
  }

  // Voice-First Output: Speaks response out loud immediately with live audio waveform animation
  speakResponse(text) {
    this.currentCaption = text;
    const lang = window.appState ? window.appState.language : "en";
    
    const captionEl = document.getElementById("companion-caption-text");
    const avatarRing = document.getElementById("companion-avatar-ring");
    const statusLabel = document.getElementById("companion-status-text");

    if (captionEl) captionEl.innerText = text;
    if (statusLabel) statusLabel.innerText = lang === "as" ? "মিত্ৰই কৈ আছে..." : "Mitra is speaking...";
    if (avatarRing) avatarRing.classList.add("speaking-wave");

    audioManager.speak(
      text,
      lang,
      () => {
        if (avatarRing) avatarRing.classList.add("speaking-wave");
      },
      () => {
        if (avatarRing) avatarRing.classList.remove("speaking-wave");
        if (statusLabel) statusLabel.innerText = lang === "as" ? "কথা ক'বলৈ স্পৰ্শ কৰক" : "Tap microphone to speak";
      }
    );
  }

  renderCompanionUI() {
    const container = document.getElementById("companion-ui-container");
    if (!container) return;

    const lang = window.appState ? window.appState.language : "en";

    container.innerHTML = `
      <div class="companion-layout-card animate-fade-in">
        <!-- Close & Back Button -->
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">🌺</span>
            <strong style="font-size:16px; color:var(--brand-primary-dark);">Mitra (মিত্ৰ)</strong>
          </div>
          <button class="btn-secondary-link" onclick="window.mitraCompanion.closeCompanion()">
            ✕ ${lang === "as" ? "বন্ধ কৰক" : "Close"}
          </button>
        </div>

        <!-- Animated Avatar & Waveform -->
        <div class="companion-avatar-wrapper">
          <div id="companion-avatar-ring" class="companion-avatar-halo">
            <div class="companion-avatar-center">
              🌺
            </div>
          </div>
          <div id="companion-status-text" class="companion-status-subtext">
            ${lang === "as" ? "আপোনাৰ সংগী সক্ৰিয়" : "Your Companion is Ready"}
          </div>
        </div>

        <!-- Voice-First Central Large Mic Action Button -->
        <div class="companion-mic-action-area">
          <button class="btn-large-talk-mic" onclick="window.mitraCompanion.startVoiceListening()" title="Speak to Mitra">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
          <span class="talk-mic-label">${lang === "as" ? "কথা ক'বলৈ স্পৰ্শ কৰক" : "Tap to Speak"}</span>
        </div>

        <!-- Supporting Live Caption Card (Secondary to Voice) -->
        <div class="companion-caption-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">
              ${lang === "as" ? "মিত্ৰৰ বাৰ্তা (Caption)" : "Voice Response Caption"}
            </span>
            <button class="btn-audio-speak" style="width:32px; height:32px; font-size:14px;" onclick="window.mitraCompanion.speakResponse(window.mitraCompanion.currentCaption)" title="Replay Voice">
              🔊
            </button>
          </div>
          <p id="companion-caption-text" class="companion-caption-body">
            ${lang === "as" ? "নমস্কাৰ মায়া! মই আপোনাৰ সংগী মিত্ৰ।" : "Namaskar Maya! I am Mitra, your personal companion."}
          </p>
        </div>

        <!-- Familiar Personal Topic Prompt Chips -->
        <div class="companion-topics-container">
          <span style="font-size:12px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:8px; text-align:left;">
            ${lang === "as" ? "প্ৰিয় বিষয়বোৰ:" : "Favorite Topics:"}
          </span>
          <div class="topic-chips-grid">
            <button class="topic-chip-btn" onclick="window.mitraCompanion.processUserInput('sing favorite song')">
              🎵 ${lang === "as" ? "গান শুনাওক (O Mur Apunar Dekh)" : "Sing Favorite Song"}
            </button>
            <button class="topic-chip-btn" onclick="window.mitraCompanion.processUserInput('recite a poem')">
              📖 ${lang === "as" ? "কবিতা মনত পেলাওক (Kadamoni)" : "Recite Poem"}
            </button>
            <button class="topic-chip-btn" onclick="window.mitraCompanion.processUserInput('tell me about family anita aarav')">
              👨‍👩‍👧 ${lang === "as" ? "অনিতা আৰু আৰৱৰ কথা" : "Anita & Aarav"}
            </button>
            <button class="topic-chip-btn" onclick="window.mitraCompanion.processUserInput('bihu festival memories')">
              🌸 ${lang === "as" ? "বিহুৰ স্মৃতি" : "Bihu Memories"}
            </button>
            <button class="topic-chip-btn" onclick="window.mitraCompanion.processUserInput('check my medicine routine')">
              💊 ${lang === "as" ? "আজিৰ ঔষধৰ নিয়ম" : "Medication Check"}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

window.mitraCompanion = new PersonalCompanion();
