import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Type, Eye, Globe, Trash2, ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { PatientSettings } from '../data/demoData';
import { useLanguage } from '../context/LanguageContext';
import type { LanguageKey } from '../services/translationService';

interface SettingsProps {
  onSettingsChange: (settings: PatientSettings) => void;
  onLogout?: () => void;
}

const setTranslations: Record<string, Record<string, string>> = {
  English: {
    resetConfirm: 'Reset all application data back to default seed? This will delete your custom memories and reminders.',
    resetSuccess: 'Data reset successfully! Refreshing view...',
    importInvalid: 'The selected file is not a valid Second Brain backup.',
    importSuccess: 'Data imported successfully! Reloading...',
    textScalingDesc: 'Adjust scaling for all buttons, menus, and text cards.',
    textNormal: 'Normal',
    textLarge: 'Large',
    textExtraLarge: 'Extra Large',
    dbLocallyDesc: 'Your Second Brain data is stored locally on this device. You can manage your offline database cache below.',
    privacyNotice: 'Second Brain operates entirely on your local machine. No patient files, memory uploads, or game metrics are uploaded to cloud servers or remote databases.',
    profileSession: 'Profile Session',
    logoutDesc: 'Log out from your current profile session. This will not delete your saved memories, schedules, or progression.',
    logoutConfirm: 'Do you want to log out?',
    logoutBtn: 'Log Out Profile'
  },
  Hindi: {
    resetConfirm: 'क्या आप सभी डेटा को डिफ़ॉल्ट रूप में रीसेट करना चाहते हैं? इससे आपकी व्यक्तिगत यादें और रिमाइंडर्स हट जाएंगे।',
    resetSuccess: 'डेटा रीसेट सफल! रीलोड हो रहा है...',
    importInvalid: 'चुनी गई फ़ाइल एक मान्य सेकंड ब्रेन बैकअप नहीं है।',
    importSuccess: 'डेटा सफलतापूर्वक इम्पोर्ट किया गया! रीलोड हो रहा है...',
    textScalingDesc: 'सभी बटनों, मेनू और टेक्स्ट कार्ड के लिए आकार समायोजित करें।',
    textNormal: 'सामान्य',
    textLarge: 'बड़ा',
    textExtraLarge: 'बहुत बड़ा',
    dbLocallyDesc: 'आपका सेकंड ब्रेन डेटा इस डिवाइस पर स्थानीय रूप से सुरक्षित है। आप नीचे अपने ऑफलाइन डेटाबेस का प्रबंधन कर सकते हैं।',
    privacyNotice: 'सेकंड ब्रेन पूरी तरह से आपके लोकल डिवाइस पर चलता है। कोई भी मरीज की जानकारी, यादें या गेम प्रदर्शन क्लाउड सर्वर या रिमोट डेटाबेस पर नहीं भेजी जाती है।',
    profileSession: 'प्रोफ़ाइल सत्र',
    logoutDesc: 'अपने वर्तमान प्रोफ़ाइल सत्र से लॉग आउट करें। इससे आपकी सहेजी गई यादें, शेड्यूल या प्रगति नहीं हटेगी।',
    logoutConfirm: 'क्या आप लॉग आउट करना चाहते हैं?',
    logoutBtn: 'प्रोफ़ाइल लॉग आउट करें'
  },
  Bengali: {
    resetConfirm: 'সব ডেটা কি ডিফল্ট রূপে রিসেট করতে চান? এর ফলে আপনার ব্যক্তিগত স্মৃতি ও অনুস্মারকগুলি মুছে যাবে।',
    resetSuccess: 'ডেটা রিসেট সফল! রিলোড হচ্ছে...',
    importInvalid: 'নির্বাচিত ফাইলটি একটি সঠিক সেকেন্ড ব্রেন ব্যাকআপ ফাইল নয়।',
    importSuccess: 'ডেটা সফলভাবে ইম্পোর্ট করা হয়েছে! রিলোড হচ্ছে...',
    textScalingDesc: 'সব বোতাম, মেনু এবং টেক্সট কার্ডের জন্য অক্ষরের আকার নির্ধারণ করুন।',
    textNormal: 'স্বাভাবিক',
    textLarge: 'বড়',
    textExtraLarge: 'অত্যন্ত বড়',
    dbLocallyDesc: 'আপনার সেকেন্ড ব্রেন ডেটা এই ডিভাইসে স্থানীয়ভাবে সংরক্ষিত আছে। আপনি নিচে আপনার অফলাইন ডেটাবেস পরিচালনা করতে পারেন।',
    privacyNotice: 'সেকেন্ড ব্রেন সম্পূর্ণভাবে আপনার নিজস্ব ডিভাইসে চলে। কোনো রোগীর তথ্য, আপলোড করা স্মৃতি বা গেমের ফলাফল ক্লাউড সার্ভারে পাঠানো হয় না।',
    profileSession: 'প্রোফাইল সেশন',
    logoutDesc: 'আপনার বর্তমান প্রোফাইল সেশন থেকে লগ আউট করুন। এটি আপনার সংরক্ষিত স্মৃতি, সময়সূচী বা অগ্রগতি মুছে ফেলবে না।',
    logoutConfirm: 'আপনি কি লগ আউট করতে চান?',
    logoutBtn: 'লগ আউট প্রোফাইল'
  },
  Assamese: {
    resetConfirm: 'আপুনি সকলো তথ্য মচিব খোজে নেকি? ইয়াৰ ফলত আপোনাৰ নিজা স্মৃতি আৰু অনুস্মাৰকসমূহ মচি যাব।',
    resetSuccess: 'তথ্য মচা সফল হ’ল! পুনৰ আৰম্ভ হৈছে...',
    importInvalid: 'নিৰ্বাচিত ফাইলটো এটা বৈধ চেকেণ্ড ব্ৰেইন বেকআপ নহয়।',
    importSuccess: 'তথ্য সফলতাৰে আমদানি কৰা হ’ল! পুনৰ আৰম্ভ হৈছে...',
    textScalingDesc: 'বুটাম আৰু লিখনীসমূহৰ আকাৰ সলনি কৰক।',
    textNormal: 'স্বাভাৱিক',
    textLarge: 'ডাঙৰ',
    textExtraLarge: 'অতি ডাঙৰ',
    dbLocallyDesc: 'আপোনাৰ তথ্যসমূহ এই ডিভাইচতে স্থানীয়ভাৱে সংৰক্ষিত হৈ থাকে। তলত আপোনাৰ অফলাইন ডাটাবেচ পৰিচালনা কৰিব পাৰে।',
    privacyNotice: 'চেকেণ্ড ব্ৰেইন সম্পূৰ্ণৰূপে আপোনাৰ স্থানীয় ডিভাইচত চলে। কোনো তথ্য ক্লাউড চাৰ্ভাৰলৈ প্ৰেৰণ কৰা নহয়।',
    profileSession: 'প্ৰফাইল সেশন',
    logoutDesc: 'আপোনাৰ সাম্প্ৰতিক সেশনৰ পৰা বাহিৰ হওক। ইয়াৰ দ্বাৰা স্মৃতি বা কাৰ্যসূচী মচি নাযায়।',
    logoutConfirm: 'আপুনি বাহিৰ হ’ব খোজে নেকি?',
    logoutBtn: 'লগ আউট কৰক'
  },
  Manipuri: {
    deleteConfirm: 'মুত্থতপা পাম্ব্রा?',
    resetConfirm: 'রিসেট তৌবা पাম্ব্রা?',
    resetSuccess: 'রিসেট তৌখ্রে!',
    importInvalid: 'ফাইল অসি চুমদে।',
    importSuccess: 'মায় পাক্না হাপখ্রে!',
    textScalingDesc: 'অক্ষরগী সাইজ চুমथোকপা।',
    textNormal: 'চুম্বা',
    textLarge: 'চাওবা',
    textExtraLarge: 'য়াম্না চাওবা',
    dbLocallyDesc: 'মেমোরী অসি অদোমগী ডিভাইচতা থম্মী।',
    privacyNotice: 'সেকেন্ড ব্রেন অসি অদোমগী লোকাল ডিভাইচ খক্তদা থবক তৌই। ক্লাউডতা অমত্তা চৎদে।',
    profileSession: 'প্রোফাইল সেসন',
    logoutDesc: 'সেসন অসিদগী লগ আউত তৌবা।',
    logoutConfirm: 'লগ আউত তৌবা পাম্ব্রা?',
    logoutBtn: 'লগ আউত প্রোফাইল'
  },
  Khasi: {
    resetConfirm: 'Kynriah ia ki data baroh? Kane kan pyndam ia ki jingkynmaw baroh.',
    resetSuccess: 'Pynbeit data khiah! Pynkylla thymmai...',
    importInvalid: 'U file um dei u backup ALPINE ba thikna.',
    importSuccess: 'Import data khiah! Pynkylla thymmai...',
    textScalingDesc: 'Pynkylla ia ka size akhar ha ki button bad ki card baroh.',
    textNormal: 'Kaba lah',
    textLarge: 'Kaba heh',
    textExtraLarge: 'Kaba heh bha',
    dbLocallyDesc: 'Ki data ALPINE jong phi ki sah ha kane ka kor. Phi lah ban pynbeit ia ki offline database hangne.',
    privacyNotice: 'U Second Brain u treikam tang ha ka kor jong phi. Ym don data ba phah sha ki cloud server.',
    profileSession: 'Profile Session',
    logoutDesc: 'Mih noh na ka profile session. Kane ka jingleit kan ym pyndam ia ki jingkynmaw bad ki schedule.',
    logoutConfirm: 'Phi kwah ban mih noh?',
    logoutBtn: 'Mih na ka Profile'
  },
  Mizo: {
    resetConfirm: 'I data zawng zawng nuaibo i duh em? He hian i hriatna dah te a nuaibo vek ang.',
    resetSuccess: 'Data nuaibo zawh a ni! Thlir thar leh e...',
    importInvalid: 'He file hi backup dik tak a ni lo.',
    importSuccess: 'Data lak luh zawh a ni! Thlir thar leh e...',
    textScalingDesc: 'Tawng leh thumal lian te i duh danin thlang rawh.',
    textNormal: 'Pangngai',
    textLarge: 'Lian',
    textExtraLarge: 'Lian over',
    dbLocallyDesc: 'I hriatna te hi i phone-ah hian an awm e. I duh hunah i nuaibo thei ang.',
    privacyNotice: 'Second Brain hi i phone chhung chauhva hnathawk a ni. Cloud server-ah engmah a thawn lo.',
    profileSession: 'Profile ruahman',
    logoutDesc: 'I session kal lai atang hian chhuak rawh. Hian i hriatna dah a nuaibo lo vang.',
    logoutConfirm: 'I chhuak duh tak zet em?',
    logoutBtn: 'Profile atanga Chhuahna'
  },
  Nagamese: {
    deleteConfirm: 'Sob delete kuribole mon ase na?',
    resetConfirm: 'Sob data reset kuribole mon ase na?',
    resetSuccess: 'Reset hoise! Reload kuri ase...',
    importInvalid: 'Etu file toh thik backup nohoi.',
    importSuccess: 'Import hoise! Reload kuri ase...',
    textScalingDesc: 'Akhar khan laga size chutu-dangor kuribi.',
    textNormal: 'Sadharon',
    textLarge: 'Dangor',
    textExtraLarge: 'Bisi dangor',
    dbLocallyDesc: 'Apuni laga data device te save hoikena ase.',
    privacyNotice: 'Etu Second Brain apuni laga local device te he chole. Cloud te kuila save nohoi.',
    profileSession: 'Profile Samay',
    logoutDesc: 'Lout out kuribi. Apuni laga yaad aro schedule delete nohoibo.',
    logoutConfirm: 'Log out kuribole mon ase na?',
    logoutBtn: 'Profile Out Kuribi'
  },
  Tripuri: {
    deleteConfirm: 'Jotoni delete khailani?',
    resetConfirm: 'Jotoni data reset khailani?',
    resetSuccess: 'Reset khailakha! Reload chikhai...',
    importInvalid: 'Etu file backup nohoi.',
    importSuccess: 'Import khailakha! Reload chikhai...',
    textScalingDesc: 'Akhar size chuny-chokh khailadi.',
    textNormal: 'Chuny',
    textLarge: 'Chokh',
    textExtraLarge: 'Bisi chokh',
    dbLocallyDesc: 'Nini data offline device te tongkhase.',
    privacyNotice: 'Second Brain nini local machine te he chole. Cloud server te chichi phai tongya.',
    profileSession: 'Profile Kok',
    logoutDesc: 'Log out khamdi. Yaad chichi delete khailakhai.',
    logoutConfirm: 'Log out khailani?',
    logoutBtn: 'Profile Log Out Khaimani'
  }
};

export const Settings: React.FC<SettingsProps> = ({ onSettingsChange, onLogout }) => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState<PatientSettings | null>(null);

  useEffect(() => {
    storageService.init();
    setSettings(storageService.getSettings());
  }, []);

  const updateSetting = <K extends keyof PatientSettings>(key: K, value: PatientSettings[K]) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    storageService.saveSettings(updated);
    onSettingsChange(updated);
  };

  const handleResetData = () => {
    const st = setTranslations[language] || setTranslations.English;
    if (window.confirm(st.resetConfirm)) {
      localStorage.clear();
      storageService.init();
      const freshSettings = storageService.getSettings();
      setSettings(freshSettings);
      onSettingsChange(freshSettings);
      alert(st.resetSuccess);
      window.location.reload();
    }
  };

  if (!settings) return null;

  const languagesList: { code: LanguageKey; label: string }[] = [
    { code: 'English', label: 'English' },
    { code: 'Assamese', label: 'অসমীয়া — Assamese' },
    { code: 'Bengali', label: 'বাংলা — Bengali' },
    { code: 'Hindi', label: 'हिन्दी — Hindi' },
    { code: 'Manipuri', label: 'মৈতৈলোন — Manipuri' },
    { code: 'Khasi', label: 'Khasi' },
    { code: 'Mizo', label: 'Mizo' },
    { code: 'Nagamese', label: 'Nagamese' },
    { code: 'Tripuri', label: 'Kokborok / Tripuri' }
  ];

  const currentUser = storageService.getCurrentUser();
  const isCaregiver = currentUser?.role === 'Caregiver';

  return (
    <div className={`max-w-3xl mx-auto pb-12 space-y-6 ${isCaregiver ? 'caregiver-dashboard caregiver-settings' : ''}`}>
      {/* Header */}
      <div className={`flex items-center gap-3 border-b pb-4 ${isCaregiver ? 'border-slate-200/80' : 'border-brand-purpleLight'}`}>
        <button 
          onClick={() => navigate(-1)} 
          className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
            isCaregiver 
              ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200' 
              : 'hover:bg-white text-brand-purple'
          }`}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className={`text-3xl font-black tracking-tight flex items-center gap-2.5 ${isCaregiver ? 'text-slate-900' : 'text-brand-navy'}`}>
            {t('set.title')} <SettingsIcon className={`w-8 h-8 ${isCaregiver ? 'text-sky-600' : 'text-brand-purple'}`} />
          </h1>
          <p className={`font-extrabold mt-1 ${isCaregiver ? 'text-slate-500' : 'text-brand-grayText'}`}>{t('set.subtitle')}</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Accessibility Controls */}
        <div className={`p-6 sm:p-7 rounded-3xl space-y-6 shadow-sm ${isCaregiver ? 'cg-shimmer-border cg-card' : 'bg-white border border-brand-purpleLight'}`}>
          <h2 className={`text-xl font-black flex items-center gap-2 ${isCaregiver ? 'text-slate-900' : 'text-brand-navy'}`}>
            <Eye className={`w-6 h-6 ${isCaregiver ? 'text-sky-600' : 'text-brand-purple'}`} />
            <span>{t('set.accessibility')}</span>
          </h2>

          <div className={`space-y-6 divide-y ${isCaregiver ? 'divide-slate-100' : 'divide-brand-purpleLight'}`}>
            
            {/* Text size selector */}
            <div className="pt-4 first:pt-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className={`font-black text-lg flex items-center gap-2 ${isCaregiver ? 'text-slate-900' : 'text-brand-navy'}`}>
                  <Type className={`w-5 h-5 flex-shrink-0 ${isCaregiver ? 'text-slate-500' : 'text-brand-grayText'}`} />
                  <span>{t('set.textSize')}</span>
                </h3>
                <p className={`text-sm mt-0.5 font-extrabold ${isCaregiver ? 'text-slate-500' : 'text-brand-grayText'}`}>{(setTranslations[language] || setTranslations.English).textScalingDesc}</p>
              </div>
              <div className={`flex flex-wrap sm:flex-nowrap p-1.5 rounded-2xl border w-full lg:w-auto min-w-0 flex-shrink-0 gap-1.5 ${isCaregiver ? 'bg-slate-100 border-slate-200' : 'bg-brand-lavender border-brand-purpleLight'}`}>
                {(['normal', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting('textSize', size)}
                    className={`flex-1 min-w-[85px] sm:min-w-[95px] px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black capitalize transition-all cursor-pointer text-center whitespace-normal break-words leading-tight ${
                      settings.textSize === size
                        ? (isCaregiver 
                            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm' 
                            : 'bg-brand-purple text-white shadow-sm')
                        : (isCaregiver 
                            ? 'text-slate-700 hover:text-sky-700 hover:bg-slate-200/60' 
                            : 'text-brand-navy hover:text-brand-purple')
                    }`}
                  >
                    {size === 'normal' && (setTranslations[language] || setTranslations.English).textNormal}
                    {size === 'large' && (setTranslations[language] || setTranslations.English).textLarge}
                    {size === 'xlarge' && (setTranslations[language] || setTranslations.English).textExtraLarge}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Regional NER Language Selection */}
        <div className={`p-6 sm:p-7 rounded-3xl space-y-6 shadow-sm ${isCaregiver ? 'cg-shimmer-border cg-card' : 'bg-white border border-brand-purpleLight'}`}>
          <h2 className={`text-xl font-black flex items-center gap-2 ${isCaregiver ? 'text-slate-900' : 'text-brand-navy'}`}>
            <Globe className={`w-6 h-6 ${isCaregiver ? 'text-sky-600' : 'text-brand-purple'}`} />
            <span>{t('set.language')}</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {languagesList.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  updateSetting('language', lang.code);
                  setLanguage(lang.code);
                }}
                className={`px-4 py-3.5 rounded-2xl border text-sm font-black text-center transition-all cursor-pointer ${
                  settings.language === lang.code
                    ? (isCaregiver 
                        ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-transparent shadow-sm' 
                        : 'bg-brand-purpleLight border-brand-purple text-brand-purple')
                    : (isCaregiver 
                        ? 'bg-slate-50/80 border-slate-200 hover:bg-sky-50 hover:border-sky-300 text-slate-800' 
                        : 'border-brand-purpleLight hover:bg-brand-lavender text-brand-navy')
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Data Management */}
        <div className={`p-6 sm:p-7 rounded-3xl space-y-6 shadow-sm ${isCaregiver ? 'cg-shimmer-border cg-card' : 'bg-white border border-brand-purpleLight'}`}>
          <h2 className={`text-xl font-black flex items-center gap-2 ${isCaregiver ? 'text-slate-900' : 'text-brand-navy'}`}>
            <Trash2 className={`w-6 h-6 ${isCaregiver ? 'text-rose-600' : 'text-brand-red'}`} />
            <span>{t('set.data')}</span>
          </h2>
          <p className={`text-base font-extrabold ${isCaregiver ? 'text-slate-600' : 'text-brand-grayText'}`}>
            {(setTranslations[language] || setTranslations.English).dbLocallyDesc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <button
              onClick={handleResetData}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-white font-black transition-all shadow-sm cursor-pointer active:scale-95 ${
                isCaregiver ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-red hover:bg-opacity-95'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
              <span>{t('set.reset')}</span>
            </button>

            <button
              onClick={() => {
                const keys = [
                  'sb_settings', 'sb_profile', 'sb_caregiver_profile', 
                  'sb_reminders', 'sb_schedule', 'sb_memories', 
                  'sb_contacts', 'sb_games', 'sb_alerts', 'sb_mood'
                ];
                const backup: Record<string, any> = {};
                keys.forEach(k => {
                  const val = localStorage.getItem(k);
                  if (val) backup[k] = JSON.parse(val);
                });
                const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `second_brain_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-white font-black transition-all shadow-sm cursor-pointer active:scale-95 ${
                isCaregiver ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-95' : 'bg-brand-purple hover:bg-opacity-95'
              }`}
            >
              <span>{t('set.export')}</span>
            </button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
                      const requiredKeys = ['sb_settings', 'sb_profile', 'sb_reminders', 'sb_schedule'];
                      const hasKeys = requiredKeys.every(k => k in data);
                      if (!hasKeys) {
                        alert((setTranslations[language] || setTranslations.English).importInvalid);
                        return;
                      }
                      Object.entries(data).forEach(([key, val]) => {
                        localStorage.setItem(key, JSON.stringify(val));
                      });
                      alert((setTranslations[language] || setTranslations.English).importSuccess);
                      window.location.reload();
                    } catch (err) {
                      alert((setTranslations[language] || setTranslations.English).importInvalid);
                    }
                  };
                  reader.readAsText(file);
                }}
                className="hidden"
                id="import-file-input"
              />
              <label
                htmlFor="import-file-input"
                className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-black text-center transition-all shadow-sm cursor-pointer active:scale-95 ${
                  isCaregiver 
                    ? 'bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white border border-sky-200' 
                    : 'bg-brand-purpleLight text-brand-purple hover:bg-brand-purple hover:text-white'
                }`}
              >
                <span>{t('set.import')}</span>
              </label>
            </div>
          </div>

          <div className={`p-4 rounded-2xl text-xs space-y-1 ${
            isCaregiver ? 'bg-sky-50/80 border border-sky-200/80 text-slate-600' : 'bg-brand-lavender border border-brand-purpleLight text-brand-grayText'
          }`}>
            <p className={`font-black ${isCaregiver ? 'text-slate-900' : 'text-brand-navy'}`}>{t('set.privacy')}</p>
            <p className="font-extrabold">{(setTranslations[language] || setTranslations.English).privacyNotice}</p>
          </div>
        </div>

        {/* Section 4: Profile Session */}
        <div className={`p-6 sm:p-7 rounded-3xl space-y-6 shadow-sm ${isCaregiver ? 'cg-shimmer-border cg-card' : 'bg-white border border-brand-purpleLight'}`}>
          <h2 className={`text-xl font-black flex items-center gap-2 ${isCaregiver ? 'text-slate-900' : 'text-brand-navy'}`}>
            <LogOut className={`w-6 h-6 ${isCaregiver ? 'text-rose-600' : 'text-brand-red'}`} />
            <span>{(setTranslations[language] || setTranslations.English).profileSession}</span>
          </h2>
          <p className={`text-base font-extrabold ${isCaregiver ? 'text-slate-600' : 'text-brand-grayText'}`}>
            {(setTranslations[language] || setTranslations.English).logoutDesc}
          </p>
          <button
            onClick={() => {
              if (window.confirm((setTranslations[language] || setTranslations.English).logoutConfirm)) {
                storageService.logout();
                if (onLogout) {
                  onLogout();
                } else {
                  window.location.reload();
                }
              }
            }}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-black transition-all shadow-sm cursor-pointer active:scale-95 ${
              isCaregiver ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-red hover:bg-opacity-95'
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span>{(setTranslations[language] || setTranslations.English).logoutBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

