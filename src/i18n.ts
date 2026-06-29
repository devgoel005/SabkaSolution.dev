import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app_name: "SabkaSolution",
      tagline: "Apni Awaaz, Apna Haq",
      subtitle: "Hyperlocal Civic Issue Resolver for India",
      select_language: "Select Language / भाषा चुनें",
      phone_placeholder: "Enter Indian Mobile Number",
      send_otp: "Send OTP via SMS",
      enter_otp: "Enter 6-digit OTP",
      verify_otp: "Verify OTP & Continue",
      bypass_info: "Demo Login: Use +91 9999999999 with OTP 123456",
      setup_profile: "Setup Your Profile",
      full_name: "Full Name",
      ward: "Ward / Area",
      city: "City",
      state: "State",
      role: "Select Your Role",
      citizen: "Citizen",
      volunteer: "Volunteer",
      citizen_desc: "Report issues in your ward, verify other reports, and earn civic points.",
      volunteer_desc: "Help validate local reports, coordinate community action, and escalate with authorities.",
      save_profile: "Complete Registration",
      login_full_name: "Full Name",
      login_name_placeholder: "Enter your registered name (e.g., Amit Kumar)",
      login_state: "State",
      login_city: "City",
      login_ward: "Municipal Ward",
      login_ward_placeholder: "e.g. Ward 150 (Bellandur)",
      login_role: "Citizen Role",
      login_role_citizen: "Standard Citizen",
      login_role_volunteer: "Volunteer / Auditor",
      login_phone: "Phone Number",
      login_phone_placeholder: "Enter 10-digit number",
      login_security_check: "Are you human?",
      login_solve_math: "Sum",
      login_captcha_caption: "Quick solve to verify:",
      login_submit_btn: "Secure Citizen Authentication",
      login_verifying_seal: "Verifying Integrity Seal...",
      login_or_connect: "or connect securely",
      login_digilocker: "Verified Login with DigiLocker",
      login_biometric_success: "Verified! Redirecting...",
      login_biometric_failed: "Authentication Failed",
      login_biometric_prompt: "Login with FaceID / TouchID",
      login_biometric_enroll: "TouchID (Enroll after OTP)",
      login_bypass_title: "🔑 DEMO BYPASS GATEWAY",
      login_bypass_desc: "Click here to auto-fill credentials and bypass with security checks passed",
      login_mandatory_signin: "🛡️ MANDATORY SECURE SIGN-IN",
      otp_sent_to: "OTP sent to",
      otp_expires_in: "OTP security code expires in",
      otp_seconds: "seconds",
      otp_verifying: "Verifying Credentials...",
      otp_change_number: "Change Number",
      otp_resend_in: "Resend in",
      otp_resend_btn: "Resend OTP",
      
      // Tabs
      tab_home: "Feed",
      tab_map: "Radar Map",
      tab_report: "Report",
      tab_verify: "Verify (Swipe)",
      tab_community: "Community",
      tab_dashboard: "Impact",
      tab_profile: "Profile",

      // Home Feed
      reported_stat: "Issues Reported",
      resolved_stat: "Resolved Now",
      active_vols: "Active Volunteers",
      filters: "Filters",
      all: "All",
      infrastructure: "Infrastructure",
      waste: "Waste Management",
      electricity: "Electricity",
      corruption: "Corruption",
      road: "Road Damage",
      water: "Water Leak",
      streetlight: "Streetlight",
      drainage: "Drainage",
      encroachment: "Encroachment",
      other: "Other",
      severity: "Severity",
      status: "Status",
      no_issues: "No issues reported in this category yet.",

      // Statuses
      PENDING: "Pending Verification",
      VERIFIED: "Verified",
      IN_PROGRESS: "In Progress",
      RESOLVED: "Resolved",
      ESCALATED: "Escalated",
      REJECTED: "Rejected",

      // Map View
      heatmap: "Heatmap Mode",
      radar_pulse: "Radar scan active around your area",
      view_details: "View Details",

      // Report Form
      report_title: "Report a Civic Issue",
      step_capture: "1. Capture",
      step_describe: "2. Describe",
      step_location: "3. Location",
      step_authority: "4. Authority",
      step_submit: "5. Submit",
      image_upload: "Upload Photo/Video of the Issue",
      drag_drop: "Drag & drop or click to upload",
      ai_analyzing: "AI Categorization Agent analyzing photo...",
      ai_success: "AI Categorization Agent suggestions loaded!",
      issue_title: "Issue Title",
      issue_desc: "Detailed Description",
      severity_1: "Minor",
      severity_5: "Emergency",
      anonymous_report: "Report anonymously (hide my profile details from public feed)",
      detect_gps: "Auto-detect GPS Location",
      pincode: "Pincode",
      authority_detected: "Auto-Escalation Agent lookup success!",
      authority_will_notify: "This complaint will be routed directly to:",
      email_preview: "Formal Email Draft (Hindi & English)",
      tweet_preview: "Twitter Handle to Tag",
      submit_report: "Submit Citizen Report",
      report_success: "Report Submitted Successfully!",
      ticket_id: "Citizen Token ID:",

      // Swipe Verify
      swipe_title: "Verify Hyperlocal Reports",
      swipe_right: "Swipe Right / Tap Check: Real Issue",
      swipe_left: "Swipe Left / Tap Cross: Fake/Duplicate",
      swipe_empty: "No unverified reports near you! Check back later.",
      streak_counter: "Daily Streak: {{streak}} days",
      earn_hint: "Earn 10 Reputation Points for each honest verification.",

      // Community
      campaign_title: "Community Campaigns",
      petition_letter: "Petition Letter",
      sign_petition: "Sign Petition",
      whatsapp_invite: "Share Group via WhatsApp",
      campaign_start: "Start a Civic Campaign",
      members: "members",
      signed_count: "{{count}} citizen signatures collected",

      // Dashboard
      reputation: "Reputation Points",
      leaderboard: "Ward Leaderboard",
      monthly_resolved_chart: "Issues Resolved (Monthly)",
      partners: "Partner Rewards & Vouchers",
      redeem: "Redeem for {{points}} pts",
      redeemed: "Redeemed! Code: {{code}}",
      privacy_policy: "Privacy Policy",
      copyright_text: "© 2026 SabkaSolution. All Rights Reserved. National Grievance Protocol Registry. Managed by National Informatics Commission."
    }
  },
  hi: {
    translation: {
      app_name: "सबकासॉल्यूशन",
      tagline: "अपनी आवाज़, अपना हक़",
      subtitle: "भारत के लिए स्थानीय नागरिक समस्या निवारण मंच",
      select_language: "भाषा चुनें",
      phone_placeholder: "भारतीय मोबाइल नंबर दर्ज करें",
      send_otp: "ओटीपी भेजें",
      enter_otp: "6-अंकों का ओटीपी दर्ज करें",
      verify_otp: "ओटीपी सत्यापित करें",
      bypass_info: "डेमो लॉगिन: +91 9999999999 ओटीपी 123456 के साथ",
      setup_profile: "अपना प्रोफाइल सेट करें",
      full_name: "पूरा नाम",
      ward: "वार्ड / क्षेत्र",
      city: "शहर",
      state: "राज्य",
      role: "अपनी भूमिका चुनें",
      citizen: "नागरिक",
      volunteer: "स्वयंसेवक",
      citizen_desc: "अपने वार्ड में समस्याओं की रिपोर्ट करें, दूसरों की समस्याओं की पुष्टि करें, और अंक अर्जित करें।",
      volunteer_desc: "स्थानीय रिपोर्टों की पुष्टि करने, सामुदायिक कार्रवाई का समन्वय करने और अधिकारियों से संपर्क करने में सहायता करें।",
      save_profile: "पंजीकरण पूरा करें",
      login_full_name: "पूरा नाम",
      login_name_placeholder: "अपना नाम दर्ज करें (उदा. अमित कुमार)",
      login_state: "राज्य",
      login_city: "शहर",
      login_ward: "नगर पालिका वार्ड / क्षेत्र",
      login_ward_placeholder: "उदा. वार्ड 150 (बेलंदूर)",
      login_role: "नागरिक भूमिका",
      login_role_citizen: "सामान्य नागरिक",
      login_role_volunteer: "स्वयंसेवक / लेखा परीक्षक (ऑडिटर)",
      login_phone: "फ़ोन नंबर",
      login_phone_placeholder: "10-अंकों का नंबर दर्ज करें",
      login_security_check: "क्या आप इंसान हैं?",
      login_solve_math: "योग",
      login_captcha_caption: "पुष्टि करने के लिए हल करें:",
      login_submit_btn: "सुरक्षित नागरिक प्रमाणीकरण",
      login_verifying_seal: "सुरक्षा सील की पुष्टि की जा रही है...",
      login_or_connect: "या सुरक्षित रूप से कनेक्ट करें",
      login_digilocker: "डिजीलॉकर के साथ सत्यापित लॉगिन",
      login_biometric_success: "सत्यापित! रीडायरेक्ट किया जा रहा है...",
      login_biometric_failed: "प्रमाणीकरण विफल रहा",
      login_biometric_prompt: "फ़ेसआईडी (FaceID) / टचआईडी (TouchID) से लॉगिन करें",
      login_biometric_enroll: "टचआईडी (ओटीपी के बाद नामांकन करें)",
      login_bypass_title: "🔑 डेमो बाईपास गेटवे",
      login_bypass_desc: "सुरक्षा जांच के साथ क्रेडेंशियल ऑटो-फिल करने और बाईपास करने के लिए यहां क्लिक करें",
      login_mandatory_signin: "🛡️ अनिवार्य सुरक्षित लॉगिन",
      otp_sent_to: "ओटीपी भेजा गया",
      otp_expires_in: "ओटीपी सुरक्षा कोड समाप्त हो जाएगा",
      otp_seconds: "सेकंड में",
      otp_verifying: "प्रमाणिकता सत्यापित की जा रही है...",
      otp_change_number: "नंबर बदलें",
      otp_resend_in: "पुनः भेजें",
      otp_resend_btn: "ओटीपी पुनः भेजें",
      
      tab_home: "फ़ीड",
      tab_map: "रडार मैप",
      tab_report: "रिपोर्ट",
      tab_verify: "सत्यापित करें",
      tab_community: "समुदाय",
      tab_dashboard: "प्रभाव",
      tab_profile: "प्रोफ़ाइल",

      reported_stat: "दर्ज समस्याएं",
      resolved_stat: "समाधान हुआ",
      active_vols: "सक्रिय स्वयंसेवक",
      filters: "फ़िल्टर",
      all: "सभी",
      infrastructure: "बुनियादी ढांचा",
      waste: "कचरा प्रबंधन",
      electricity: "बिजली समस्या",
      corruption: "भ्रष्टाचार / रिश्वत",
      road: "सड़क क्षति",
      water: "पानी का रिसाव",
      streetlight: "स्ट्रीटलाइट",
      drainage: "नाली की समस्या",
      encroachment: "अतिक्रमण",
      other: "अन्य",
      severity: "गंभीरता",
      status: "स्थिति",
      no_issues: "इस श्रेणी में अभी तक कोई समस्या दर्ज नहीं की गई है।",

      PENDING: "सत्यापन लंबित",
      VERIFIED: "सत्यापित",
      IN_PROGRESS: "प्रगति पर है",
      RESOLVED: "समाधान हुआ",
      ESCALATED: "अधिकारियों को प्रेषित",
      REJECTED: "अस्वीकृत",

      heatmap: "हीटमैप मोड",
      radar_pulse: "आपके क्षेत्र में रडार स्कैन सक्रिय है",
      view_details: "विवरण देखें",

      report_title: "समस्या की रिपोर्ट करें",
      step_capture: "1. फ़ोटो",
      step_describe: "2. विवरण",
      step_location: "3. स्थान",
      step_authority: "4. अधिकारी",
      step_submit: "5. सबमिट",
      image_upload: "समस्या का फ़ोटो/वीडियो अपलोड करें",
      drag_drop: "फ़ाइल यहाँ खींचें या अपलोड करने के लिए क्लिक करें",
      ai_analyzing: "एआई वर्गीकरण एजेंट फ़ोटो का विश्लेषण कर रहा है...",
      ai_success: "एआई एजेंट के सुझाव सफलतापूर्वक लोड हुए!",
      issue_title: "समस्या का शीर्षक",
      issue_desc: "विस्तृत विवरण",
      severity_1: "मामूली",
      severity_5: "आपातकालीन",
      anonymous_report: "गुमनाम रूप से रिपोर्ट करें (सार्वजनिक फ़ीड से अपना नाम छुपाएं)",
      detect_gps: "जीपीएस स्थान का पता लगाएं",
      pincode: "पिनकोड",
      authority_detected: "ऑटो-एस्केलेशन एजेंट ने अधिकारी खोज लिया!",
      authority_will_notify: "यह शिकायत सीधे इस अधिकारी को भेजी जाएगी:",
      email_preview: "औपचारिक ईमेल प्रारूप (हिंदी और अंग्रेजी)",
      tweet_preview: "टैग करने के लिए ट्विटर हैंडल",
      submit_report: "नागरिक रिपोर्ट सबमिट करें",
      report_success: "रिपोर्ट सफलतापूर्वक सबमिट की गई!",
      ticket_id: "नागरिक टोकन आईडी:",

      swipe_title: "समस्याओं का सत्यापन करें",
      swipe_right: "दाएं स्वाइप / सही पर टैप: वास्तविक समस्या",
      swipe_left: "बाएं स्वाइप / गलत पर टैप: नकली/दोहरी रिपोर्ट",
      swipe_empty: "आपके पास सत्यापित करने के लिए कोई समस्या नहीं है!",
      streak_counter: "दैनिक स्ट्रीक: {{streak}} दिन",
      earn_hint: "प्रत्येक ईमानदार सत्यापन के लिए 10 प्रतिष्ठा अंक अर्जित करें।",

      campaign_title: "सामुदायिक अभियान",
      petition_letter: "याचिका पत्र",
      sign_petition: "याचिका पर हस्ताक्षर करें",
      whatsapp_invite: "व्हाट्सएप के माध्यम से साझा करें",
      campaign_start: "नागरिक अभियान शुरू करें",
      members: "सदस्य",
      signed_count: "{{count}} नागरिकों के हस्ताक्षर एकत्रित हुए",

      reputation: "प्रतिष्ठा अंक",
      leaderboard: "वार्ड लीडरबोर्ड",
      monthly_resolved_chart: "मासिक समाधान चार्ट",
      partners: "पार्टनर पुरस्कार और वाउचर",
      redeem: "{{points}} अंकों के लिए रिडीम करें",
      redeemed: "सफलतापूर्वक रिडीम किया गया! कोड: {{code}}",
      privacy_policy: "गोपनीयता नीति",
      copyright_text: "© 2026 सबकासॉल्यूशन। सर्वाधिकार सुरक्षित। राष्ट्रीय शिकायत प्रोटोकॉल रजिस्ट्री। राष्ट्रीय सूचना विज्ञान आयोग द्वारा प्रबंधित।"
    }
  },
  ta: {
    translation: {
      app_name: "சப்காசொல்யூஷன்",
      tagline: "நமது குரல், நமது உரிமை",
      subtitle: "உள்ளூர் குடிமைப் பிரச்சனைகளைத் தீர்க்கும் தளம்",
      select_language: "மொழியைத் தேர்ந்தெடுக்கவும்"
    }
  },
  te: {
    translation: {
      app_name: "సబ్కాసొల్యూషన్",
      tagline: "మన గొంతు, మన హక్కు",
      subtitle: "స్థానిక పౌర సమస్యల పరిష్కార వేదిక",
      select_language: "భాషను ఎంచుకోండి"
    }
  },
  bn: {
    translation: {
      app_name: "সবকাসলিউশন",
      tagline: "নিজের আওয়াজ, নিজের অধিকার",
      subtitle: "স্থানীয় নাগরিক সমস্যা সমাধান প্ল্যাটফর্ম",
      select_language: "ভাষা নির্বাচন করুন"
    }
  },
  mr: {
    translation: {
      app_name: "सबकासोल्युशन",
      tagline: "आपला आवाज, आपला हक्क",
      subtitle: "स्थानिक नागरी समस्या निवारण मंच",
      select_language: "भाषा निवडा"
    }
  },
  kn: {
    translation: {
      app_name: "ಸಬ್ಕಾಸೊಲ್ಯೂಷನ್",
      tagline: "ನಮ್ಮ ಧ್ವನಿ, ನಮ್ಮ ಹಕ್ಕು",
      subtitle: "ಸ್ಥಳೀಯ ನಾಗರಿಕ ಸಮಸ್ಯೆ ನಿವಾರಣಾ ವೇದಿಕೆ",
      select_language: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ"
    }
  }
};

// Fallbacks for regional languages that we don't fully translate
// We will merge english keys to prevent empty UI
const fallbackLangs = ['ta', 'te', 'bn', 'mr', 'kn'];
fallbackLangs.forEach(lang => {
  if (resources[lang]) {
    resources[lang].translation = {
      ...resources.en.translation,
      ...resources[lang].translation
    };
  }
});

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('sabka_solution_lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
