// RECONNECT Seed Data & Fictional Demonstation Datasets
// All patient records, statistics, and clinical metrics are strictly synthetic demo data.

const SEED_DATA = {
  users: [
    {
      id: "elder_maya",
      name: "Maya",
      age: 72,
      role: "elder",
      language: "as",
      state: "Assam",
      district: "Kamrup Metropolitan (Guwahati)",
      caregiver_id: "caregiver_anita",
      doctor_id: "doctor_barua",
      avatar: "👵",
      pin: "1234",
      email: "elder@reconnect.demo",
      consent_status: true,
      created_at: "2026-08-10T08:00:00Z"
    },
    {
      id: "caregiver_anita",
      name: "Anita",
      role: "caregiver",
      relationship: "Daughter",
      elder_id: "elder_maya",
      avatar: "👩‍💼",
      email: "caregiver@reconnect.demo",
      password: "demo",
      state: "Assam",
      district: "Kamrup Metropolitan",
      created_at: "2026-08-10T08:00:00Z"
    },
    {
      id: "doctor_barua",
      name: "Dr. B. Barua, MD",
      role: "doctor",
      specialty: "Geriatric & Cognitive Care",
      hospital: "Guwahati Medical College & Hospital (GMCH)",
      email: "doctor@reconnect.demo",
      license_id: "NER-MED-8492",
      password: "demo",
      created_at: "2026-08-01T08:00:00Z"
    },
    {
      id: "gov_admin",
      name: "NER Public Health Directorate",
      role: "government",
      department: "Ministry of Development of North Eastern Region (DoNER)",
      email: "government@reconnect.demo",
      password: "demo",
      created_at: "2026-07-01T08:00:00Z"
    }
  ],

  // Culturally authentic NER familiar items with SVG icons & photos
  cultural_items: [
    { id: "jaapi", name_en: "Assam Jaapi", name_as: "অসমৰ জাপি", category: "heritage", icon: "👒", color: "#D97706" },
    { id: "assam_tea", name_en: "Assam Tea Cup", name_as: "একাপ অসম চাহ", category: "food", icon: "☕", color: "#92400E" },
    { id: "hibiscus", name_en: "Red Hibiscus", name_as: "ৰঙা জবা ফুল", category: "flower", icon: "🌺", color: "#DC2626" },
    { id: "rhino", name_en: "Kaziranga Rhino", name_as: "এশিঙীয়া গঁড়", category: "wildlife", icon: "🦏", color: "#4B5563" },
    { id: "bamboo", name_en: "Bamboo Basket", name_as: "বাঁহৰ খৰাহী", category: "household", icon: "🧺", color: "#B45309" },
    { id: "pitha", name_en: "Til Pitha", name_as: "তিল পিঠা", category: "food", icon: "🥟", color: "#78350F" },
    { id: "muga", name_en: "Muga Silk Gamosa", name_as: "মুগা গামোচা", category: "heritage", icon: "🧣", color: "#EF4444" },
    { id: "kopou", name_en: "Kopou Orchid", name_as: "কপৌ ফুল", category: "flower", icon: "🌸", color: "#EC4899" }
  ],

  // Family Memory Cards for Maya
  memory_items: [
    {
      id: "mem_1",
      user_id: "elder_maya",
      name: "Anita",
      relationship: "Daughter (জীয়ৰী)",
      avatar: "👩‍💼",
      photo_desc: "Anita in Guwahati garden",
      audio_text_en: "This is Anita, your loving daughter. She lives in Guwahati and calls you every evening.",
      audio_text_as: "এইয়া অনিতা, আপোনাৰ মৰমৰ জীয়ৰী। তেওঁ গুৱাহাটীত থাকে আৰু প্ৰতি সন্ধিয়া ফোন কৰে।",
      consent_status: true,
      created_at: "2026-08-11T09:00:00Z"
    },
    {
      id: "mem_2",
      user_id: "elder_maya",
      name: "Rahul",
      relationship: "Son (পুত্ৰ)",
      avatar: "👨‍💻",
      photo_desc: "Rahul at IIT Guwahati",
      audio_text_en: "This is Rahul, your son. He visits every Bihu festival.",
      audio_text_as: "এইয়া ৰাহুল, আপোনাৰ পুত্ৰ। প্ৰতি বিহুত ঘৰলৈ আহে।",
      consent_status: true,
      created_at: "2026-08-11T09:05:00Z"
    },
    {
      id: "mem_3",
      user_id: "elder_maya",
      name: "Aarav",
      relationship: "Grandson (নাতি)",
      avatar: "👦",
      photo_desc: "Aarav holding a cricket bat",
      audio_text_en: "This is Aarav, your 9-year-old grandson. He loves your homemade narikol pitha.",
      audio_text_as: "এইয়া আৰৱ, আপোনাৰ ৯ বছৰীয়া নাতি। আপোনাৰ হাতৰ নাৰিকলৰ পিঠা ভাল পায়।",
      consent_status: true,
      created_at: "2026-08-11T09:10:00Z"
    },
    {
      id: "mem_4",
      user_id: "elder_maya",
      name: "Priya",
      relationship: "Granddaughter (নাতিনী)",
      avatar: "👧",
      photo_desc: "Priya in school uniform",
      audio_text_en: "This is Priya, your granddaughter. She won first prize in Bihu dance!",
      audio_text_as: "এইয়া প্ৰিয়া, আপোনাৰ নাতিনী। বিহু নৃত্যত প্ৰথম স্থান পাইছে!",
      consent_status: true,
      created_at: "2026-08-11T09:15:00Z"
    }
  ],

  // Routine Timelines for Maya
  reminders: [
    {
      id: "rem_1",
      user_id: "elder_maya",
      title: "Wake up & Warm Water",
      title_as: "টোপনিৰ পৰা উঠা আৰু কুহুমীয়া পানী",
      category: "Activity",
      scheduled_time: "07:30 AM",
      response_window: 90,
      audio_url: "wake_up",
      status: "acknowledged",
      shown_at: "2026-09-16T07:30:00Z",
      acknowledged_at: "2026-09-16T07:31:12Z",
      postponed_at: null,
      created_at: "2026-09-15T18:00:00Z"
    },
    {
      id: "rem_2",
      user_id: "elder_maya",
      title: "Breakfast & Assam Tea",
      title_as: "পুৱাৰ আহাৰ আৰু চাহ",
      category: "Food",
      scheduled_time: "08:30 AM",
      response_window: 90,
      audio_url: "breakfast",
      status: "acknowledged",
      shown_at: "2026-09-16T08:30:00Z",
      acknowledged_at: "2026-09-16T08:31:45Z",
      postponed_at: null,
      created_at: "2026-09-15T18:00:00Z"
    },
    {
      id: "rem_3",
      user_id: "elder_maya",
      title: "Blood Pressure Medicine (Amlodipine 5mg)",
      title_as: "ৰক্তচাপৰ ঔষধ (এমলোডিপাইন ৫মি.গ্ৰা.)",
      category: "Medicine",
      scheduled_time: "09:00 AM",
      response_window: 90,
      audio_url: "medicine",
      status: "pending",
      shown_at: null,
      acknowledged_at: null,
      postponed_at: null,
      created_at: "2026-09-15T18:00:00Z"
    },
    {
      id: "rem_4",
      user_id: "elder_maya",
      title: "Lunch (Rice, Dal & Masor Tenga)",
      title_as: "দুপৰীয়াৰ ভাত আৰু মাছৰ টেঙা",
      category: "Food",
      scheduled_time: "01:00 PM",
      response_window: 90,
      audio_url: "lunch",
      status: "pending",
      shown_at: null,
      acknowledged_at: null,
      postponed_at: null,
      created_at: "2026-09-15T18:00:00Z"
    },
    {
      id: "rem_5",
      user_id: "elder_maya",
      title: "Evening Call with Anita",
      title_as: "সন্ধিয়া অনিতাৰ সৈতে কথা-বতৰা",
      category: "Family",
      scheduled_time: "05:00 PM",
      response_window: 90,
      audio_url: "family_call",
      status: "pending",
      shown_at: null,
      acknowledged_at: null,
      postponed_at: null,
      created_at: "2026-09-15T18:00:00Z"
    }
  ],

  // Seed Game Sessions (demonstrating adaptive level progression)
  game_sessions: [
    {
      id: "sess_1",
      user_id: "elder_maya",
      game_type: "memory",
      domain: "Memory Recall",
      level: 1,
      score: 65,
      accuracy: 55,
      response_time: 42,
      hints_used: 1,
      attempts: 5,
      recommended_level: 1,
      adaptation_reason: "Performance is stable — keeping the current activity level.",
      created_at: "2026-09-14T10:15:00Z",
      offline_created: false,
      sync_status: "synced"
    },
    {
      id: "sess_2",
      user_id: "elder_maya",
      game_type: "attention",
      domain: "Attention & Focus",
      level: 1,
      score: 74,
      accuracy: 68,
      response_time: 30,
      hints_used: 0,
      attempts: 4,
      recommended_level: 1,
      adaptation_reason: "Performance is stable — keeping the current activity level.",
      created_at: "2026-09-14T16:20:00Z",
      offline_created: false,
      sync_status: "synced"
    },
    {
      id: "sess_3",
      user_id: "elder_maya",
      game_type: "memory",
      domain: "Memory Recall",
      level: 1,
      score: 92,
      accuracy: 86,
      response_time: 15,
      hints_used: 0,
      attempts: 2,
      recommended_level: 2,
      adaptation_reason: "Strong recent performance — activity difficulty increased slightly.",
      created_at: "2026-09-15T10:30:00Z",
      offline_created: false,
      sync_status: "synced"
    },
    {
      id: "sess_4",
      user_id: "elder_maya",
      game_type: "pattern",
      domain: "Pattern Recognition",
      level: 2,
      score: 50,
      accuracy: 45,
      response_time: 65,
      hints_used: 2,
      attempts: 6,
      recommended_level: 1,
      adaptation_reason: "Let's make the next activity easier and more comfortable.",
      created_at: "2026-09-15T17:45:00Z",
      offline_created: false,
      sync_status: "synced"
    },
    {
      id: "sess_5",
      user_id: "elder_maya",
      game_type: "executive",
      domain: "Executive Function",
      level: 1,
      score: 82,
      accuracy: 80,
      response_time: 19,
      hints_used: 0,
      attempts: 3,
      recommended_level: 2,
      adaptation_reason: "Strong recent performance — activity difficulty increased slightly.",
      created_at: "2026-09-16T09:45:00Z",
      offline_created: false,
      sync_status: "synced"
    }
  ],

  // Caregiver Alerts
  alerts: [
    {
      id: "alert_1",
      user_id: "elder_maya",
      caregiver_id: "caregiver_anita",
      type: "needs_review",
      title: "Activity Pattern Review",
      message: "Recent activity performance is lower than the user's previous average. Please review.",
      related_reminder_id: null,
      status: "active",
      created_at: "2026-09-15T17:50:00Z"
    }
  ],

  // Professional Doctor Notes
  professional_notes: [
    {
      id: "note_1",
      doctor_id: "doctor_barua",
      user_id: "elder_maya",
      doctor_name: "Dr. B. Barua, MD",
      note: "Observed steady engagement during morning memory recall exercises. Responsive to daughter's audio reminders. Maintained 80%+ accuracy on familiar cultural symbols.",
      created_at: "2026-09-12T11:30:00Z"
    },
    {
      id: "note_2",
      doctor_id: "doctor_barua",
      user_id: "elder_maya",
      doctor_name: "Dr. B. Barua, MD",
      note: "Recommended keeping afternoon tasks at Level 1 to avoid fatigue. Caregiver Anita reported calm routine adherence with 90s gentle chime.",
      created_at: "2026-09-15T14:20:00Z"
    }
  ],

  // NER Aggregate Public Health Statistics (8 States)
  ner_states_metrics: [
    { state: "Assam", active_users: 120, completed_sessions: 980, reminder_ack_rate: 86, stability_rate: 88, centers: 14 },
    { state: "Meghalaya", active_users: 80, completed_sessions: 640, reminder_ack_rate: 84, stability_rate: 85, centers: 8 },
    { state: "Manipur", active_users: 55, completed_sessions: 420, reminder_ack_rate: 83, stability_rate: 82, centers: 6 },
    { state: "Arunachal Pradesh", active_users: 50, completed_sessions: 390, reminder_ack_rate: 81, stability_rate: 80, centers: 5 },
    { state: "Nagaland", active_users: 45, completed_sessions: 350, reminder_ack_rate: 82, stability_rate: 83, centers: 5 },
    { state: "Tripura", active_users: 40, completed_sessions: 310, reminder_ack_rate: 87, stability_rate: 86, centers: 4 },
    { state: "Mizoram", active_users: 35, completed_sessions: 280, reminder_ack_rate: 89, stability_rate: 89, centers: 4 },
    { state: "Sikkim", active_users: 30, completed_sessions: 240, reminder_ack_rate: 85, stability_rate: 87, centers: 3 }
  ],

  // District Activity breakdown
  district_metrics: [
    { district: "Kamrup Metro (Guwahati)", state: "Assam", active_users: 48, completed_sessions: 412, ack_rate: 88 },
    { district: "Dibrugarh", state: "Assam", active_users: 32, completed_sessions: 254, ack_rate: 84 },
    { district: "East Khasi Hills (Shillong)", state: "Meghalaya", active_users: 45, completed_sessions: 360, ack_rate: 85 },
    { district: "Imphal West", state: "Manipur", active_users: 35, completed_sessions: 280, ack_rate: 82 },
    { district: "Kohima", state: "Nagaland", active_users: 28, completed_sessions: 215, ack_rate: 83 },
    { district: "Aizawl", state: "Mizoram", active_users: 25, completed_sessions: 198, ack_rate: 90 },
    { district: "West Tripura (Agartala)", state: "Tripura", active_users: 26, completed_sessions: 205, ack_rate: 86 },
    { district: "Papum Pare (Itanagar)", state: "Arunachal", active_users: 28, completed_sessions: 210, ack_rate: 81 }
  ],

  // Language adoption aggregate statistics
  language_metrics: {
    assamese: 54,
    english: 32,
    bengali: 8,
    manipuri: 4,
    other: 2
  },

  // Aggregate reminder statistics
  reminder_aggregate: {
    total_scheduled: 4120,
    acknowledged: 3481, // 84.5%
    postponed: 412,    // 10.0%
    missed: 227        // 5.5%
  }
};
