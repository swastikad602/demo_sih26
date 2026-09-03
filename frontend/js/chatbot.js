// Personal Companion Chatbot ("Mitra" / "Xubha" / "Sathi") - Voice-First AI Companion

const ChatbotCompanion = {
  chatHistory: [],
  
  init() {
    this.chatHistory = [
      {
        sender: 'mitra',
        text: "Namaskar! I am Mitra, your companion. We can talk about your favorite songs, poems from the hills, or your daily routine. How are you feeling today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  },
  
  openChat() {
    document.getElementById('patient-home-view').style.display = 'none';
    document.getElementById('patient-chat-view').style.display = 'block';
    this.renderChatMessages();
    
    // Voice prompt opening
    VoiceEngine.speak("Hello! I am Mitra. What would you like to talk about or listen to today?", I18N.currentLang);
  },
  
  closeChat() {
    VoiceEngine.stopSpeaking();
    document.getElementById('patient-chat-view').style.display = 'none';
    document.getElementById('patient-home-view').style.display = 'block';
  },
  
  renderChatMessages() {
    const chatContainer = document.getElementById('chat-messages-container');
    if (!chatContainer) return;
    
    chatContainer.innerHTML = this.chatHistory.map(msg => `
      <div class="chat-bubble-row ${msg.sender === 'patient' ? 'user' : 'bot'}">
        ${msg.sender === 'mitra' ? '<div class="avatar-companion pulse-slow">🌺</div>' : ''}
        <div class="chat-bubble">
          <p class="msg-text">${msg.text}</p>
          <span class="msg-time">${msg.timestamp}</span>
        </div>
        ${msg.sender === 'mitra' ? `
          <button class="btn btn-audio-repeat" onclick="VoiceEngine.speak('${msg.text.replace(/'/g, "\\'")}', I18N.currentLang)" title="Read out again">
            🔊
          </button>
        ` : ''}
      </div>
    `).join('');
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
  },
  
  async handleUserInput(textInput = null) {
    let query = textInput;
    if (!query) {
      const inputElem = document.getElementById('chat-text-input');
      query = inputElem ? inputElem.value.trim() : '';
      if (inputElem) inputElem.value = '';
    }
    
    if (!query) return;
    
    // Add patient message
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.chatHistory.push({
      sender: 'patient',
      text: query,
      timestamp: nowStr
    });
    this.renderChatMessages();
    
    // Generate companion response using stored patient context
    const responseText = this.generateCompanionResponse(query);
    
    // Simulate natural thinking delay
    setTimeout(() => {
      this.chatHistory.push({
        sender: 'mitra',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.renderChatMessages();
      
      // Voice-First Response Priority: Speak response out loud immediately!
      VoiceEngine.speak(responseText, I18N.currentLang);
    }, 600);
  },
  
  // Voice Mic Input
  startVoiceQuery() {
    VoiceEngine.listen((transcript) => {
      if (transcript) {
        this.handleUserInput(transcript);
      }
    }, I18N.currentLang);
  },
  
  // Grounded Companion NLP Logic referencing patient profile context
  generateCompanionResponse(query) {
    const q = query.toLowerCase();
    const patient = AppState.currentPatient || {};
    const name = patient.name || "friend";
    const songs = patient.favorite_songs || ["O Mur Apunar Dekh", "Borgeet"];
    const interests = patient.cultural_interests || ["Bihu Festival", "Majuli Art", "Assam Tea"];
    const poems = patient.favorite_poems || ["Kadamoni by Lakshminath Bezbaroa"];
    
    if (q.includes('song') || q.includes('sing') || q.includes('music') || q.includes('গান') || q.includes('গীত') || q.includes('ঈশৈ')) {
      const song = songs[Math.floor(Math.random() * songs.length)] || "O Mur Apunar Dekh";
      return `I love singing for you! Here is a melody from your favorite collection: "${song}". "O Mur Apunar Dekh, O Mur Sikuni Dekh..." Music always brings warmth to our memories!`;
    }
    
    if (q.includes('poem') || q.includes('poetry') || q.includes('কবিতা') || q.includes('কাব্য')) {
      const poem = poems[Math.floor(Math.random() * poems.length)] || "Kadamoni";
      return `Let me recite lines from your favorite poem, "${poem}": "The sweet breeze blows over the Brahmaputra hills, whispering memories of joy and timeless peace." Beautiful words from our heritage.`;
    }
    
    if (q.includes('culture') || q.includes('festival') || q.includes('bihu') || q.includes('hornbill') || q.includes('losar') || q.includes('raas') || q.includes('উৎসব') || q.includes('মেলা')) {
      const interest = interests[Math.floor(Math.random() * interests.length)] || "Bihu";
      return `Ah, you always enjoyed ${interest}! Remember the cheerful beats of the Dhol, the red muga silk, and the scent of sweet pitha prepared with family? Those joyful traditions stay with us forever.`;
    }
    
    if (q.includes('medicine') || q.includes('medication') || q.includes('pill') || q.includes('ঔষধ') || q.includes('ওষুধ') || q.includes('হিদাক')) {
      const meds = patient.medications || [];
      const medList = meds.map(m => `${m.name} (${m.dosage}) at ${m.time}`).join(', ');
      return `Your doctor has prescribed: ${medList || "Morning and evening medications"}. Remember, I will give you a gentle reminder with 90 seconds to take them at your own relaxed pace.`;
    }
    
    if (q.includes('routine') || q.includes('schedule') || q.includes('today') || q.includes('দিনলিপি') || q.includes('সময়')) {
      return `Today is going smoothly, ${name}. You have morning walks, memory games, and evening tea with soothing music planned. Everything is on schedule!`;
    }
    
    if (q.includes('hello') || q.includes('hi') || q.includes('namaskar') || q.includes('নমস্কাৰ') || q.includes('নমস্কার') || q.includes('খুরুমজরি')) {
      return `Namaskar ${name}! It is wonderful to hear your voice. Would you like to hear a nostalgic story, play a memory game, or listen to a tune from ${patient.state || 'the North East'}?`;
    }
    
    if (q.includes('family') || q.includes('son') || q.includes('daughter') || q.includes('grandson') || q.includes('পৰিয়াল') || q.includes('পরিবার')) {
      return `Your family loves you very dearly, ${name}. They are always checking your progress and wishing you comfort and smiles throughout the day.`;
    }
    
    // Default comforting response
    return `Thank you for sharing that with me, ${name}. The hills, rivers, and traditions of ${patient.state || 'our home'} remind us of peaceful times. Would you like to hear your favorite tune "${songs[0] || 'folk melody'}"?`;
  }
};
