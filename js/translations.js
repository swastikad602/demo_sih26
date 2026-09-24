// RECONNECT Bilingual Translation Dictionary
// Supports English (en) and Assamese (as) for elderly users across NER

const TRANSLATIONS = {
  // Common & Branding
  app_name: {
    en: "RECONNECT",
    as: "ৰিকানেক্ট (RECONNECT)"
  },
  tagline: {
    en: "Connect. Remember. Engage.",
    as: "সংযোগ কৰক। মনত পেলাওক। আনন্দ লওক।"
  },
  demo_badge: {
    en: "DEMO DATA",
    as: "নমুনা তথ্য (DEMO)"
  },
  connected_status: {
    en: "Connected",
    as: "সংযোগ হৈছে"
  },
  offline_status: {
    en: "Offline — Saved on Device",
    as: "ইণ্টাৰনেট নাই — ডিভাইচত সংৰক্ষিত"
  },
  sync_pending: {
    en: "Sync Pending...",
    as: "সংযোজন বাকী আছে..."
  },
  synced: {
    en: "Synced ✓",
    as: "সংযোজিত হৈছে ✓"
  },

  // Greetings
  greeting_maya: {
    en: "Good morning, Maya",
    as: "সুপ্ৰভাত, মায়া"
  },
  greeting_subtitle: {
    en: "What would you like to do today?",
    as: "আজি আপুনি কি কৰিব বিচাৰিব?"
  },

  // Elder Home 4 Primary Buttons
  btn_play: {
    en: "PLAY",
    as: "খেলক"
  },
  btn_play_sub: {
    en: "Fun mind activities",
    as: "মগজুৰ আনন্দদায়ক খেল"
  },
  btn_routine: {
    en: "MY ROUTINE",
    as: "মোৰ নিয়মসূচী"
  },
  btn_routine_sub: {
    en: "Today's reminders & meals",
    as: "আজিৰ ঔষধ আৰু কামৰ তালিকা"
  },
  btn_people: {
    en: "MY PEOPLE",
    as: "মোৰ পৰিয়াল"
  },
  btn_people_sub: {
    en: "Family memories & photos",
    as: "পৰিয়ালৰ স্মৃতি আৰু ফটো"
  },
  btn_help: {
    en: "HELP",
    as: "সহায়"
  },
  btn_help_sub: {
    en: "Ask caregiver for assistance",
    as: "পৰিচর্যাকাৰীক মাতক"
  },

  // Games Selection
  game_title: {
    en: "Cognitive Activities",
    as: "মনোযোগ আৰু স্মৃতি খেল"
  },
  game_memory_title: {
    en: "Memory Recall",
    as: "স্মৃতি শক্তি"
  },
  game_memory_desc: {
    en: "Match familiar pictures & objects",
    as: "পৰিচিত ছবিৰ যোৰ মিলাওক"
  },
  game_attention_title: {
    en: "Attention & Focus",
    as: "মনোযোগ আৰু লক্ষ্য"
  },
  game_attention_desc: {
    en: "Find the matching special object",
    as: "নিৰ্দিষ্ট বস্তুটো চিনাক্ত কৰক"
  },
  game_pattern_title: {
    en: "Pattern Recognition",
    as: "ক্ৰম বা সজ্জা চিনাক্তকৰণ"
  },
  game_pattern_desc: {
    en: "Complete the natural sequence",
    as: "পৰৱৰ্তী সঠিক চিত্ৰটো বাছক"
  },
  game_routine_title: {
    en: "My Daily Routine",
    as: "দৈনন্দিন কামৰ ক্ৰম"
  },
  game_routine_desc: {
    en: "Arrange morning tasks in order",
    as: "কামসমূহ সঠিক ক্ৰমত সজাওক"
  },
  level_badge: {
    en: "Level",
    as: "স্তৰ"
  },

  // In-Game Strings
  card_flip_prompt: {
    en: "Tap cards to find pairs",
    as: "ছবিৰ যোৰ বিচাৰিবলৈ কাৰ্ড স্পৰ্শ কৰক"
  },
  attention_prompt_flower: {
    en: "Tap the red flower (জবা ফুল)",
    as: "ৰঙা ফুলটো স্পৰ্শ কৰক (জবা ফুল)"
  },
  attention_prompt_tea: {
    en: "Tap the cup of Assam Tea (চাহৰ কাপ)",
    as: "অসম চাহৰ কাপটো স্পৰ্শ কৰক"
  },
  attention_prompt_jaapi: {
    en: "Tap the traditional Jaapi (জাপি)",
    as: "পৰম্পৰাগত জাপিটো স্পৰ্শ কৰক"
  },
  pattern_prompt: {
    en: "Which comes next?",
    as: "ইয়াৰ পিছত কি আহিব?"
  },
  routine_prompt: {
    en: "What should Maya do first, next, and last?",
    as: "প্ৰথমে, তাৰ পিছত, আৰু শেষত কি কৰা উচিত?"
  },

  // Feedback
  well_done: {
    en: "Well done!",
    as: "বৰ ভাল হৈছে!"
  },
  great_job: {
    en: "Great job, Maya!",
    as: "খুব সুন্দৰ, মায়া!"
  },
  activity_completed: {
    en: "Activity completed happily.",
    as: "কামটো সফলভাৱে সম্পূৰ্ণ হ'ল।"
  },
  try_again: {
    en: "Let's try again calmly.",
    as: "আহক আকৌ এবাৰ চেষ্টা কৰোঁ।"
  },
  make_easier: {
    en: "Let's make the next one a little easier.",
    as: "পৰৱৰ্তী খেলটো আৰু সহজ কৰোঁ আহক।"
  },

  // Game Results & AI Explanation
  activity_score: {
    en: "Activity Score",
    as: "কাৰ্যকলাপৰ নম্বৰ"
  },
  accuracy: {
    en: "Accuracy",
    as: "সঠিকতা"
  },
  response_time: {
    en: "Response Time",
    as: "সময়"
  },
  ai_adjustment: {
    en: "Explainable AI Adaptation",
    as: "AI স্তৰ নিৰ্ধাৰণ কাৰণ"
  },
  play_again: {
    en: "Play Another",
    as: "আকৌ খেলক"
  },
  back_home: {
    en: "Back to Home",
    as: "মূল পৃষ্ঠালৈ যাওক"
  },

  // Reminders & Routine
  routine_header: {
    en: "Today's Schedule",
    as: "আজিৰ নিয়মসূচী"
  },
  reminder_banner: {
    en: "Gentle Reminder",
    as: "বিনম্ৰ সোঁৱৰণী"
  },
  medicine_prompt: {
    en: "It is time for your afternoon medicine, Maya.",
    as: "মায়া, আপোনাৰ দুপৰীয়াৰ ঔষধ খোৱাৰ সময় হৈছে।"
  },
  btn_done: {
    en: "DONE ✓",
    as: "হৈ গ'ল ✓"
  },
  btn_later: {
    en: "REMIND ME LATER",
    as: "পিছত ক'ব"
  },
  btn_need_help: {
    en: "I NEED HELP",
    as: "মোক সহায় লাগে"
  },
  follow_up_reminder: {
    en: "Just checking in, Maya. We are here if you need help with your medicine.",
    as: "মায়া, ঔষধ খাবলৈ আপোনাক কাৰোবাৰ সহায়ৰ প্ৰয়োজন আছে নেকি?"
  },

  // Family & People
  people_header: {
    en: "My Loved Ones",
    as: "মোৰ মৰমৰ পৰিয়াল"
  },
  anita_desc: {
    en: "Anita — Your caring daughter. Lives in Guwahati.",
    as: "অনিতা — আপোনাৰ মৰমৰ জীয়ৰী। গুৱাহাটীত থাকে।"
  },
  rahul_desc: {
    en: "Rahul — Your son. Call him on Sundays.",
    as: "ৰাহুল — আপোনাৰ পুত্ৰ। দেওবাৰে কথা পাতে।"
  },
  aarav_desc: {
    en: "Aarav — Your grandson. Loves your pitha!",
    as: "আৰৱ — আপোনাৰ নাতি। আপোনাৰ হাতৰ পিঠা ভাল পায়!"
  },

  // Help Screen
  help_title: {
    en: "Ask for Caregiver",
    as: "পৰিচর্যাকাৰীৰ সহায় লওক"
  },
  help_sub: {
    en: "Anita has been notified. Someone is right here with you.",
    as: "অনিক খবৰ দিয়া হৈছে। অতি সোনকালে সহায় আহি আছে।"
  },
  help_btn_call: {
    en: "NOTIFY ANITA NOW",
    as: "অনিক জনাওক"
  },

  // Cultural Items
  jaapi: { en: "Assam Jaapi (জাপি)", as: "অসমৰ জাপি" },
  assam_tea: { en: "Cup of Assam Tea (চাহৰ কাপ)", as: "একাপ অসম চাহ" },
  hibiscus: { en: "Red Hibiscus (জবা ফুল)", as: "ৰঙা জবা ফুল" },
  rhino: { en: "Kaziranga Rhino (এশিঙীয়া গঁড়)", as: "এশিঙীয়া গঁড়" },
  bamboo: { en: "Bamboo Basket (বাঁহৰ খৰাহী)", as: "বাঁহৰ খৰাহী" },
  pitha: { en: "Til Pitha (তিল পিঠা)", as: "তিল পিঠা" },
  muga: { en: "Muga Silk Gamosa (মুগা গামোচা)", as: "মুগা গামোচা" },
  kopou: { en: "Kopou Orchid (কপৌ ফুল)", as: "কপৌ ফুল" }
};

function t(key, lang = "en") {
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang];
  }
  if (TRANSLATIONS[key] && TRANSLATIONS[key].en) {
    return TRANSLATIONS[key].en;
  }
  return key;
}
