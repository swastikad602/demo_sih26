// Multilingual Localization Dictionary for NER Dementia Care Platform
// Supports: English (en), Assamese (as), Bengali (bn), Manipuri/Meitei (mn), Hindi (hi)

const I18N = {
  currentLang: 'en',
  
  translations: {
    en: {
      app_title: "NER Cognitive & Memory Care",
      role_patient: "Patient",
      role_caregiver: "Caregiver",
      role_doctor: "Doctor / Clinician",
      role_govt: "Government Health",
      onboarding_btn: "+ Onboard New Patient",
      offline_status: "Offline Mode (Local)",
      online_status: "Online (Cloud Synced)",
      voice_active: "Voice Mode: ON",
      voice_inactive: "Voice Mode: OFF",
      
      // Patient Interface
      patient_welcome: "Welcome, {name}!",
      patient_subtitle: "Let us exercise our memory and enjoy our day together.",
      todays_routine: "Today's Schedule & Routine",
      cognitive_gym: "Cognitive Games",
      companion_chat: "Talk with Mitra (Companion)",
      speak_to_me: "Tap to Speak",
      listening: "Listening...",
      stop_listening: "Tap when done speaking",
      
      // Games
      game_memory: "Memory Recall",
      game_memory_desc: "Find matching picture pairs",
      game_attention: "Attention & Focus",
      game_attention_desc: "Spot the target object quickly",
      game_pattern: "Pattern Weaves",
      game_pattern_desc: "Complete traditional NER textile patterns",
      game_family: "Family Photo Recall",
      game_family_desc: "Recognize your beloved family members",
      game_culture: "NER Cultural Heritage",
      game_culture_desc: "Identify authentic North East items & festivals",
      
      difficulty_label: "Difficulty Level",
      score_label: "Score",
      accuracy_label: "Accuracy",
      time_label: "Response Time",
      why_adaptive_btn: "Why did my level change?",
      adaptive_modal_title: "AI Adaptive Personalization Explanation",
      play_again: "Play Again",
      back_home: "Back to Home",
      great_job: "Wonderful job! You completed the exercise!",
      
      // Reminders
      reminder_banner_title: "Gentle Reminder for You",
      reminder_processing_note: "Please take your time. There is no rush.",
      reminder_acknowledge: "I Have Completed This",
      reminder_need_help: "I Need Help / Confused",
      reminder_followup_voice: "Hello, did you get a chance to complete this instruction?",
      
      // Caregiver
      caregiver_portal: "Caregiver Monitoring Dashboard",
      active_alerts: "Active Alerts & Notifications",
      patient_progress: "Patient Progress Overview",
      routine_adherence: "Routine Adherence Rate",
      mark_read: "Mark Read",
      edit_routine: "Edit Routine & Meds",
      
      // Doctor
      doctor_portal: "Clinical Neurological Monitoring",
      timeframe_1w: "1-Week Summary",
      timeframe_1m: "1-Month Summary",
      discrepancy_logs: "Reminder Discrepancy Audit Log",
      domain_breakdown: "Cognitive Domain Breakdown",
      add_clinical_note: "Add Clinical Consultation Note",
      
      // Government
      govt_portal: "NER Geriatric Health & Dementia Analytics",
      enrolled_ner_patients: "Enrolled NER Patients",
      stability_rate: "Avg Cognitive Stability",
      rural_coverage: "Rural Coverage Rate",
      export_data: "Export De-Identified Data (CSV/JSON)",
      recommended_allocations: "AI Resource Allocation Recommendations"
    },
    
    as: { // Assamese
      app_title: "উত্তৰ-পূৰ্বাঞ্চল স্মৃতি আৰু জ্ঞান সেৱা",
      role_patient: "ৰোগী / জেষ্ঠ",
      role_caregiver: "শুশ্ৰূষাকাৰী",
      role_doctor: "চিকিৎসক",
      role_govt: "চৰকাৰী স্বাস্থ্য বিভাগ",
      onboarding_btn: "+ নতুন ৰোগী অন্তৰ্ভুক্ত কৰক",
      offline_status: "অফলাইন মোড (স্থানীয়)",
      online_status: "অনলাইন (সংযুক্ত)",
      voice_active: "কণ্ঠস্বৰ মোড: সক্ৰিয়",
      voice_inactive: "কণ্ঠস্বৰ মোড: নিষ্ক্ৰিয়",
      
      patient_welcome: "নমস্কাৰ, {name} ডাঙৰীয়া!",
      patient_subtitle: "আহক আজি আমি একেলগে আমাৰ স্মৃতি সতেজ কৰোঁ।",
      todays_routine: "আজিৰ দিনলিপি আৰু সময়সূচী",
      cognitive_gym: "স্মৃতি আৰু জ্ঞানৰ খেল",
      companion_chat: "মিত্ৰৰ সৈতে কথা পাতক",
      speak_to_me: "কথা ক'বলৈ স্পৰ্শ কৰক",
      listening: "শুনি আছোঁ...",
      stop_listening: "কোৱা শেষ হ'লে স্পৰ্শ কৰক",
      
      game_memory: "স্মৃতি খেল",
      game_memory_desc: "মিলা ছবিৰ জোৰা বিচাৰক",
      game_attention: "মনোযোগ খেল",
      game_attention_desc: "সঠিক বস্তুটো সোনকালে চিনাক্ত কৰক",
      game_pattern: "শিপিনীৰ আৰ্হি খেল",
      game_pattern_desc: "পৰম্পৰাগত কাপোৰৰ আৰ্হি সম্পূৰ্ণ কৰক",
      game_family: "পৰিয়ালৰ ছবি চিনাক্তকৰণ",
      game_family_desc: "আপোনাৰ আত্মীয়সকলক চিনক",
      game_culture: "অসম আৰু উত্তৰ-পূৰ্বাঞ্চলৰ ঐতিহ্য",
      game_culture_desc: "জাপী, গামোচা আৰু ঐতিহ্য চিনাক্ত কৰক",
      
      difficulty_label: "কঠিনতাৰ স্তৰ",
      score_label: "নম্বৰ",
      accuracy_label: "শুদ্ধতা",
      time_label: "সময়",
      why_adaptive_btn: "মোৰ স্তৰ কিয় সলনি হ'ল?",
      adaptive_modal_title: "কৃত্ৰিম বুদ্ধিমত্তা স্তৰ পৰিবৰ্তনৰ ব্যাখ্যা",
      play_again: "পুনৰ খেলক",
      back_home: "মুখ্য পৃষ্ঠালৈ যাওক",
      great_job: "বৰ সুন্দৰ! আপুনি খেলটো সম্পূৰ্ণ কৰিলে!",
      
      reminder_banner_title: "আপোনাৰ বাবে সোঁৱৰণী",
      reminder_processing_note: "ধীৰে-সুস্থে কৰক, কোনো খৰখেদা নাই।",
      reminder_acknowledge: "মই এইটো সম্পূৰ্ণ কৰিলোঁ",
      reminder_need_help: "মই বুজি পোৱা নাই / সহায় লাগে",
      reminder_followup_voice: "নমস্কাৰ, আপুনি ঔষধ বা পানী খালে নে?",
      
      caregiver_portal: "শুশ্ৰূষাকাৰীৰ ডেশ্ববৰ্ড",
      active_alerts: "সতৰ্কবাৰ্তা আৰু জাননী",
      patient_progress: "ৰোগীৰ অগ্ৰগতি",
      routine_adherence: "নিয়ম পালনৰ হাৰ",
      mark_read: "পঢ়া হ'ল",
      edit_routine: "দিনলিপি পৰিবৰ্তন কৰক",
      
      doctor_portal: "চিকিৎসাগত স্নায়ৱিক নিৰীক্ষণ",
      timeframe_1w: "১ সপ্তাহৰ সাৰাংশ",
      timeframe_1m: "১ মাহৰ সাৰাংশ",
      discrepancy_logs: "সোঁৱৰণী সঁহাৰিৰ তথ্য",
      domain_breakdown: "জ্ঞান ক্ষমতাৰ বিভাগসমূহ",
      add_clinical_note: "চিকিৎসকৰ মন্তব্য যোগ কৰক",
      
      govt_portal: "উত্তৰ-পূৰ্বাঞ্চল ডিমেনচিয়া স্বাস্থ্য তথ্য",
      enrolled_ner_patients: "পঞ্জীকৃত ৰোগীৰ সংখ্যা",
      stability_rate: "স্মৃতি স্থিৰতাৰ গড় হাৰ",
      rural_coverage: "গ্ৰাম্য অঞ্চলৰ হাৰ",
      export_data: "তথ্য ডাউনলোড কৰক (CSV/JSON)",
      recommended_allocations: "সম্পদ আবণ্টনৰ পৰামৰ্শ"
    },
    
    bn: { // Bengali
      app_title: "উত্তর-পূর্ব স্মৃতি ও বোধশক্তি সেবা",
      role_patient: "রোগী / প্রবীণ",
      role_caregiver: "সেবাকারী",
      role_doctor: "চিকিৎসক",
      role_govt: "সরকারি স্বাস্থ্য দপ্তর",
      onboarding_btn: "+ নতুন রোগী নথিভুক্ত করুন",
      offline_status: "অফলাইন মোড",
      online_status: "অনলাইন (যুক্ত)",
      voice_active: "কণ্ঠস্বর মোড: চালু",
      voice_inactive: "কণ্ঠস্বর মোড: বন্ধ",
      
      patient_welcome: "নমস্কার, {name}!",
      patient_subtitle: "আসুন আজ আমরা স্মৃতি ও আনন্দের সাথে সময় কাটাই।",
      todays_routine: "আজকের সময়সূচী ও নিয়ম",
      cognitive_gym: "স্মৃতি ও মেধার খেলা",
      companion_chat: "মিত্রের সাথে কথা বলুন",
      speak_to_me: "কথা বলতে স্পর্শ করুন",
      listening: "শুনছি...",
      stop_listening: "বলা শেষ হলে স্পর্শ করুন",
      
      game_memory: "স্মৃতি খেলা",
      game_memory_desc: "ছবির জোড়া মেলাও",
      game_attention: "মনোযোগ খেলা",
      game_attention_desc: "সঠিক বস্তুটি দ্রুত চিহ্নিত করুন",
      game_pattern: "ঐতিহ্য নকশা খেলা",
      game_pattern_desc: "বস্ত্র ও কারুকার্যের নকশা সম্পূর্ণ করুন",
      game_family: "পরিবারের ছবি চেনা",
      game_family_desc: "আপনার প্রিয়জনদের ছবি চিনুন",
      game_culture: "উত্তর-পূর্বের সাংস্কৃতিক ঐতিহ্য",
      game_culture_desc: "ঐতিহ্যবাহী উৎসব ও উপকরণ শনাক্ত করুন",
      
      difficulty_label: "কাঠিন্যের স্তর",
      score_label: "স্কোর",
      accuracy_label: "সঠিকতা",
      time_label: "সময়",
      why_adaptive_btn: "স্তর কেন পরিবর্তিত হলো?",
      adaptive_modal_title: "এআই স্তর পরিবর্তনের ব্যাখ্যা",
      play_again: "আবার খেলুন",
      back_home: "মূল পাতায় ফিরুন",
      great_job: "খুব সুন্দর! আপনি খেলাটি সফলভাবে সম্পন্ন করেছেন!",
      
      reminder_banner_title: "আপনার জন্য একটি স্মারক",
      reminder_processing_note: "ধীরে সুস্থে ভাবুন, কোনো তাড়াহুড়ো নেই।",
      reminder_acknowledge: "আমি এটি সম্পন্ন করেছি",
      reminder_need_help: "সাহায্য প্রয়োজন / বুঝতে পারছি না",
      reminder_followup_voice: "নমস্কার, আপনি কি ওষুধ বা জল খেয়েছেন?",
      
      caregiver_portal: "সেবাকারীর ড্যাশবোর্ড",
      active_alerts: "সতর্কবার্তা",
      patient_progress: "রোগীর উন্নতির চিত্র",
      routine_adherence: "নিয়ম পালনের হার",
      mark_read: "পড়া হয়েছে",
      edit_routine: "সময়সূচী সম্পাদনা",
      
      doctor_portal: "চিকিৎসকের পর্যবেক্ষণ ড্যাশবোর্ড",
      timeframe_1w: "১ সপ্তাহের বিবরণ",
      timeframe_1m: "১ মাসের বিবরণ",
      discrepancy_logs: "স্মারক প্রতিক্রিয়া নিরীক্ষণ",
      domain_breakdown: "মানসিক ক্ষমতার বিশ্লেষণ",
      add_clinical_note: "পরামর্শ ও নোট যোগ করুন",
      
      govt_portal: "উত্তর-পূর্ব রাজ্য স্বাস্থ্য পরিসংখ্যান",
      enrolled_ner_patients: "মোট নিবন্ধিত রোগী",
      stability_rate: "স্মৃতি স্থিতিশীলতা হার",
      rural_coverage: "গ্রামীণ সেবার হার",
      export_data: "তথ্য ডাউনলোড (CSV/JSON)",
      recommended_allocations: "সম্পদ বণ্টনের সুপারিশ"
    },
    
    mn: { // Manipuri / Meiteilon
      app_title: "অৱাং নোংপোক নীংশিং অমসুং ৱাখলগী মতেং",
      role_patient: "অহল / অনাবা",
      role_caregiver: "য়োকখৎপীবা",
      role_doctor: "লাইয়েংবা",
      role_govt: "লৈঙাক্কী হকশেল",
      onboarding_btn: "+ অনৌবা মীওই হাপচিনবা",
      offline_status: "ওফলাইন মোদ",
      online_status: "ওনলাইন মোদ",
      voice_active: "খোন্থোক মোদ: য়াওরে",
      voice_inactive: "খোন্থোক মোদ: য়াওদে",
      
      patient_welcome: "খুরুমজরি, {name}!",
      patient_subtitle: "ঙসি ঐখোয় পুন্না নীংশিংবা ফগৎহনসি অমসুং নুংঙাইনা লৈসি।",
      todays_routine: "ঙসিগী থৌরম অমসুং মতম",
      cognitive_gym: "ৱাখল অমসুং নীংশিং সান্নপোৎ",
      companion_chat: "মিত্রাগা ৱারী শাবা",
      speak_to_me: "ৱা ঙাংনবগীদমক নম্বিয়ু",
      listening: "তাজরি...",
      stop_listening: "ঙাংবা লোইরবদি নম্বিয়ু",
      
      game_memory: "নীংশিংবা সান্নপোৎ",
      game_memory_desc: "মান্নবা ফোতো পরেং থিদোকপা",
      game_attention: "ৱাখল চঙবা সান্নপোৎ",
      game_attention_desc: "চপ চাবা পোৎশক অদু অথুschemaবা মশক খঙদোকপা",
      game_pattern: "ফীশা-লোনশা মোতিফ সান্নপোৎ",
      game_pattern_desc: "মণিপুরী অমসুং অৱাং নোংপোক্কী ফী মশক লোইশিনবা",
      game_family: "ইমুংগী মীওই মশক খঙদোকপা",
      game_family_desc: "নহাক্কী নুংশিবা ইমুংগী মীওইশিং খঙদোকপা",
      game_culture: "মণিপুৰ অমসুং অৱাং নোংপোক্কী ইনাক খুনবা",
      game_culture_desc: "পুং, রাস লীলা, লোকতাক অমসুং হেরিতেজ খঙদোকপা",
      
      difficulty_label: "অকনবা থাক",
      score_label: "পয়েন্ট",
      accuracy_label: "চুম্বগী চাং",
      time_label: "মতম",
      why_adaptive_btn: "ঐগী থাক অসি করিগী হোংখিবগে?",
      adaptive_modal_title: "AI থাক হোংদোকপগী মরম",
      play_again: "অমুক হন্না শান্নবা",
      back_home: "য়ুমলৈফমদা হঞ্জিনবা",
      great_job: "য়াম্না ফরে! নহাক্না থৌরম অসি লোইশিনখ্রে!",
      
      reminder_banner_title: "নহাক্কীদমক নীংশিংবা ৱাফম",
      reminder_processing_note: "তপথনা তৌবিয়ু, করিগুম্বা খোঙজেল য়াংশিনবগী দরকার লৈতে।",
      reminder_acknowledge: "ঐনা অসি তৌরে",
      reminder_need_help: "ঐনা খঙদে / মতেং দরকার লৈ",
      reminder_followup_voice: "খুরুমজরি, নহাক হিদাক নত্রগা ঈশিং চাবা লোইরব্ৰা?",
      
      caregiver_portal: "য়োকখৎপীবগী দেশবোর্দ",
      active_alerts: "চেকশিনৱা",
      patient_progress: "অনাবগী ফগৎলকপগী চাং",
      routine_adherence: "নিয়ম ঙাকপগী চাং",
      mark_read: "পাখ্রে",
      edit_routine: "থৌরম শেমদোকপা",
      
      doctor_portal: "লাইয়েংবগী য়েংশিন দেশবোর্দ",
      timeframe_1w: "চয়োল ১ গী ৱাফম",
      timeframe_1m: "থা ১ গী ৱাফম",
      discrepancy_logs: "নীংশিংবা পাউখুমগী রেকোর্দ",
      domain_breakdown: "ৱাখলগী শক্তিগী কাইথোকপা",
      add_clinical_note: "লাইয়েংবগী নোদ হাপচিনবা",
      
      govt_portal: "অৱাং নোংপোক রাজ্য হকশেলগী রেকোর্দ",
      enrolled_ner_patients: "লৈরিবা অনাবশিং",
      stability_rate: "নীংশিংবা লেংদনা লৈবগী চাং",
      rural_coverage: "খুঙ্গংগী চাং",
      export_data: "রেকোর্দ পুথোকপা (CSV/JSON)",
      recommended_allocations: "মতেং পাংবগী পাউতাক"
    },
    
    hi: { // Hindi
      app_title: "पूर्वोत्तर स्मृति एवं संज्ञान देखभाल",
      role_patient: "मरीज / बुजुर्ग",
      role_caregiver: "देखभालकर्ता",
      role_doctor: "चिकित्सक",
      role_govt: "सरकारी स्वास्थ्य विभाग",
      onboarding_btn: "+ नया मरीज जोड़ें",
      offline_status: "ऑफलाइन मोड",
      online_status: "ऑनलाइन (सिंक)",
      voice_active: "वॉइस मोड: चालू",
      voice_inactive: "वॉइस मोड: बंद",
      
      patient_welcome: "नमस्ते, {name} जी!",
      patient_subtitle: "आइए आज हम अपनी याददाश्त को तरोताजा करें और आनंद लें।",
      todays_routine: "आज की दिनचर्या और समय",
      cognitive_gym: "स्मृति एवं दिमागी खेल",
      companion_chat: "मित्र (एआई साथी) से बात करें",
      speak_to_me: "बोलने के लिए स्पर्श करें",
      listening: "सुन रहे हैं...",
      stop_listening: "बोलना समाप्त होने पर स्पर्श करें",
      
      game_memory: "स्मृति खेल",
      game_memory_desc: "चित्रों के जोड़े मिलाएं",
      game_attention: "एकाग्रता खेल",
      game_attention_desc: "सही वस्तु को शीघ्र पहचानें",
      game_pattern: "पारंपरिक पैटर्न खेल",
      game_pattern_desc: "पूर्वोत्तर बुनाई पैटर्न पूरा करें",
      game_family: "परिवार के सदस्य पहचानें",
      game_family_desc: "अपने प्रियजनों की तस्वीर पहचानें",
      game_culture: "पूर्वोत्तर सांस्कृतिक धरोहर",
      game_culture_desc: "जापी, गमोसा व सांस्कृतिक वस्तुएं पहचानें",
      
      difficulty_label: "कठिनाई स्तर",
      score_label: "अंक",
      accuracy_label: "सटीकता",
      time_label: "समय",
      why_adaptive_btn: "मेरा स्तर क्यों बदला?",
      adaptive_modal_title: "एआई कठिनाई बदलाव का स्पष्टीकरण",
      play_again: "पुनः खेलें",
      back_home: "मुख्य पृष्ठ पर जाएं",
      great_job: "बहुत बढ़िया! आपने यह अभ्यास पूरा किया!",
      
      reminder_banner_title: "आपके लिए एक सौम्य स्मरण",
      reminder_processing_note: "कृपया आराम से समय लें, कोई जल्दबाजी नहीं है।",
      reminder_acknowledge: "मैंने यह कार्य पूरा कर लिया",
      reminder_need_help: "मुझे सहायता चाहिए / समझ नहीं आया",
      reminder_followup_voice: "नमस्ते, क्या आपने अपनी दवा या पानी ले लिया है?",
      
      caregiver_portal: "देखभालकर्ता डैशबोर्ड",
      active_alerts: "सक्रिय अलर्ट",
      patient_progress: "मरीज की प्रगति",
      routine_adherence: "नियम पालन दर",
      mark_read: "पढ़ा गया",
      edit_routine: "दिनचर्या संपादित करें",
      
      doctor_portal: "चिकित्सक अवलोकन डैशबोर्ड",
      timeframe_1w: "1-सप्ताह का सारांश",
      timeframe_1m: "1-महीने का सारांश",
      discrepancy_logs: "स्मरण प्रतिक्रिया ऑडिट लॉग",
      domain_breakdown: "संज्ञानात्मक क्षमता विश्लेषण",
      add_clinical_note: "चिकित्सीय परामर्श नोट जोड़ें",
      
      govt_portal: "पूर्वोत्तर स्वास्थ्य सांख्यिकी",
      enrolled_ner_patients: "कुल पंजीकृत मरीज",
      stability_rate: "संज्ञानात्मक स्थिरता दर",
      rural_coverage: "ग्रामीण कवरेज दर",
      export_data: "डेटा निर्यात (CSV/JSON)",
      recommended_allocations: "संसाधन आवंटन अनुशंसाएं"
    }
  },
  
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('ner_pref_lang', lang);
      this.applyTranslations();
    }
  },
  
  t(key, params = {}) {
    const dict = this.translations[this.currentLang] || this.translations.en;
    let str = dict[key] || this.translations.en[key] || key;
    for (const [pKey, pVal] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal);
    }
    return str;
  },
  
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
      const key = elem.getAttribute('data-i18n');
      elem.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
      const key = elem.getAttribute('data-i18n-placeholder');
      elem.placeholder = this.t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(elem => {
      const key = elem.getAttribute('data-i18n-title');
      elem.title = this.t(key);
    });
  }
};
