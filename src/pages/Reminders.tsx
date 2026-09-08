import React, { useState, useEffect } from 'react';
import { Plus, Bell, Trash2, CheckCircle2, Clock, X, ToggleLeft, ToggleRight, Sparkles, Pill, Droplets, Utensils, Footprints, Calendar, Phone, ShieldCheck } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { Reminder } from '../data/demoData';
import { useLanguage } from '../context/LanguageContext';
import { getISODateString } from '../utils/dateUtils';
import { getLocalizedReminder, generateTranslations } from '../services/translationService';
import { TimeSelector12h, parseTimeTo12h } from '../components/TimeSelector12h';

const remTranslations: Record<string, Record<string, string>> = {
  English: {
    toastEnabled: 'Reminder enabled',
    toastDisabled: 'Reminder disabled',
    toastMarked: 'Reminder marked as',
    toastDeleted: 'Reminder deleted',
    deleteConfirm: 'Delete this reminder permanently?',
    addReminder: 'Add Reminder',
    remTitle: 'Reminder Title',
    description: 'Description',
    time: 'Time',
    repeatInterval: 'Repeat Interval',
    category: 'Category',
    scheduleBtn: 'Schedule Reminder',
    placeholderTitle: 'e.g. Heart Medicine',
    placeholderDesc: 'Take 1 tablet after food',
    daily: 'Daily',
    weekly: 'Weekly',
    every2h: 'Every 2 hours',
    once: 'Once',
    catMedicine: 'Medicine',
    catHydration: 'Hydration',
    catMeals: 'Meals',
    catExercise: 'Exercise',
    catAppointments: 'Appointments',
    catFamily: 'Family',
    catOther: 'Other',
    alertPastDate: 'You cannot schedule a reminder for a past date.',
    confirmTomorrow: 'That time has already passed today.\nWould you like to schedule this reminder for tomorrow instead?',
    noRemindersTitle: 'No reminders set',
    noRemindersDesc: 'Add reminders to keep your days on track.',
    statusUpcoming: 'Upcoming',
    statusCompleted: 'Completed',
    statusMissed: 'Missed',
    tooltipEnable: 'Enable',
    tooltipDisable: 'Disable',
    tooltipMarkDone: 'Mark Done',
    tooltipDelete: 'Delete',
    toastAdded: 'New reminder scheduled',
    alertLogAdded: 'Reminder added',
    justNow: 'Just now'
  },
  Hindi: {
    toastEnabled: 'रिमाइंडर चालू किया गया',
    toastDisabled: 'रिमाइंडर बंद किया गया',
    toastMarked: 'रिमाइंडर को चिह्नित किया गया:',
    toastDeleted: 'रिमाइंडर हटाया गया',
    deleteConfirm: 'क्या आप इस रिमाइंडर को हमेशा के लिए हटाना चाहते हैं?',
    addReminder: 'रिमाइंडर जोड़ें',
    remTitle: 'रिमाइंडर का शीर्षक',
    description: 'विवरण',
    time: 'समय',
    repeatInterval: 'दोहराव का अंतराल',
    category: 'श्रेणी',
    scheduleBtn: 'रिमाइंडर निर्धारित करें',
    placeholderTitle: 'जैसे- दिल की दवा',
    placeholderDesc: 'भोजन के बाद 1 गोली लें',
    daily: 'दैनिक',
    weekly: 'साप्ताहिक',
    every2h: 'प्रत्येक 2 घंटे में',
    once: 'एक बार',
    catMedicine: 'दवा',
    catHydration: 'पानी/हाइड्रेशन',
    catMeals: 'भोजन',
    catExercise: 'व्यायाम',
    catAppointments: 'अपॉइंटमेंट',
    catFamily: 'परिवार',
    catOther: 'अन्य',
    alertPastDate: 'आप पिछले दिनांक के लिए रिमाइंडर निर्धारित नहीं कर सकते।',
    confirmTomorrow: 'वह समय आज पहले ही बीत चुका है।\nक्या आप इसके बजाय कल के लिए यह रिमाइंडर निर्धारित करना चाहेंगे?',
    noRemindersTitle: 'कोई रिमाइंडर सेट नहीं है',
    noRemindersDesc: 'अपने दिनों को व्यवस्थित रखने के लिए रिमाइंडर जोड़ें।',
    statusUpcoming: 'आगामी',
    statusCompleted: 'पूर्ण',
    statusMissed: 'छूटा हुआ',
    tooltipEnable: 'सक्रिय करें',
    tooltipDisable: 'निष्क्रिय करें',
    tooltipMarkDone: 'पूर्ण चिह्नित करें',
    tooltipDelete: 'हटाएं',
    toastAdded: 'नया रिमाइंडर निर्धारित किया गया',
    alertLogAdded: 'रिमाइंडर जोड़ा गया',
    justNow: 'अभी-अभी'
  },
  Bengali: {
    toastEnabled: 'অনুস্মারক সক্রিয় করা হয়েছে',
    toastDisabled: 'অনুস্মারক নিষ্ক্রিয় করা হয়েছে',
    toastMarked: 'অনুস্মারক চিহ্নিত করা হয়েছে:',
    toastDeleted: 'অনুস্মারকটি মুছে ফেলা হয়েছে',
    deleteConfirm: 'আপনি কি এই অনুস্মারকটি চিরতরে মুছে ফেলতে চান?',
    addReminder: 'অনুস্মারক যোগ করুন',
    remTitle: 'অনুস্মারকের শিরোনাম',
    description: 'বিবরণ',
    time: 'সময়',
    repeatInterval: 'পুনরাবৃত্তি',
    category: 'বিভাগ',
    scheduleBtn: 'অনুস্মারক নির্ধারণ করুন',
    placeholderTitle: 'উদাঃ হৃদরোগের ওষুধ',
    placeholderDesc: 'খাওয়ার পর ১টি ট্যাবলেট নিন',
    daily: 'প্রতিদিন',
    weekly: 'প্রতি সপ্তাহে',
    every2h: 'প্রতি ২ ঘণ্টা অন্তর',
    once: 'একবার',
    catMedicine: 'ওষুধ',
    catHydration: 'জল/হাইড্রেশন',
    catMeals: 'আহার',
    catExercise: 'ব্যায়াম',
    catAppointments: 'সাক্ষাৎকার',
    catFamily: 'পরিবার',
    catOther: 'অন্যান্য',
    alertPastDate: 'আপনি অতীত তারিখের জন্য অনুস্মারক নির্ধারণ করতে পারবেন না।',
    confirmTomorrow: 'সেই সময়টি আজকে ইতিমধ্যেই অতিবাহিত হয়ে গেছে।\nআপনি কি এর পরিবর্তে আগামীকালকের জন্য অনুস্মারকটি নির্ধারণ করতে চান?',
    noRemindersTitle: 'কোনো অনুস্মারক সেট করা নেই',
    noRemindersDesc: 'আপনার দিন ট্র্যাক রাখতে অনুস্মারক যোগ করুন।',
    statusUpcoming: 'আসন্ন',
    statusCompleted: 'সম্পন্ন',
    statusMissed: 'মিসড',
    tooltipEnable: 'সক্রিয় করুন',
    tooltipDisable: 'নিষ্ক্রিয় করুন',
    tooltipMarkDone: 'সম্পন্ন চিহ্নিত করুন',
    tooltipDelete: 'মুছে ফেলুন',
    toastAdded: 'নতুন অনুস্মারক নির্ধারিত হয়েছে',
    alertLogAdded: 'অনুস্মারক যোগ করা হয়েছে',
    justNow: 'এইমাত্র'
  },
  Assamese: {
    toastEnabled: 'অনুস্মাৰক সক্ৰিয় কৰা হ’ল',
    toastDisabled: 'অনুস্মাৰক নিষ্ক্রিয় কৰা হ’ল',
    toastMarked: 'অনুস্মাৰক চিহ্নিত কৰা হ’ল:',
    toastDeleted: 'অনুস্মাৰক মচা হ’ল',
    deleteConfirm: 'আপুনি এই অনুস্মাৰকটো চিৰদিনৰ বাবে মচিব খোজে নেকি?',
    addReminder: 'অনুস্মাৰক যোগ কৰক',
    remTitle: 'অনুস্মাৰকৰ নাম',
    description: 'বৰ্ণনা',
    time: 'সময়',
    repeatInterval: 'পুনৰাবৃত্তিৰ সময়',
    category: 'শ্ৰেণী',
    scheduleBtn: 'অনুস্মাৰক সংৰক্ষণ কৰক',
    placeholderTitle: 'যেনে- হাৰ্টৰ ঔষধ',
    placeholderDesc: 'ভাত খাই ১ টেবলেট খাব',
    daily: 'দৈনিক',
    weekly: 'সাপ্তাহিক',
    every2h: 'প্ৰতি ২ ঘণ্টাত',
    once: 'এবাৰ',
    catMedicine: 'ঔষধ',
    catHydration: 'পানী',
    catMeals: 'আহাৰ',
    catExercise: 'ব্যায়াম',
    catAppointments: 'সাক্ষাৎকাৰ',
    catFamily: 'পৰিয়াল',
    catOther: 'অন্যান্য',
    alertPastDate: 'আপুনি অতীতৰ তাৰিখত অনুস্মাৰক সংৰক্ষণ কৰিব নোৱাৰে।',
    confirmTomorrow: 'সেই সময়টো আজি ইতিমধ্যে পাৰ হৈ গ’ল।\nআপুনি তাৰ পৰিৱৰ্তে কাইলৈৰ বাবে এই অনুস্মাৰকটো ৰাখিব খোজে নেকি?',
    noRemindersTitle: 'কোনো অনুস্মাৰক সংৰক্ষণ কৰা নাই',
    noRemindersDesc: 'আপোনাৰ দিনটো সুচাৰুৰূপে চলাবলৈ অনুস্মাৰক যোগ কৰক।',
    statusUpcoming: 'অনাগত',
    statusCompleted: 'সম্পূৰ্ণ',
    statusMissed: 'ছুটি যোৱা',
    tooltipEnable: 'সক্ৰিয় কৰক',
    tooltipDisable: 'নিষ্ক্ৰিয় কৰক',
    tooltipMarkDone: 'সম্পূৰ্ণ বুলি চিন দিয়ক',
    tooltipDelete: 'মচি পেলাওক',
    toastAdded: 'নতুন অনুস্মাৰক সংৰক্ষণ কৰা হ’ল',
    alertLogAdded: 'অনুস্মাৰক যোগ কৰা হ’ল',
    justNow: 'এইমাত্ৰ'
  },
  Manipuri: {
    toastEnabled: 'রিমাইন্ডার হাঙদোকখ্রে',
    toastDisabled: 'রিমাইন্ডার মুৎখ্রে',
    toastMarked: 'রিমাইন্ডার থমখ্রে:',
    toastDeleted: 'রিমাইন্ডার মুত্থতখ্রে',
    deleteConfirm: 'রিমাইন্ডার অসি মুত্থতপরা?',
    addReminder: 'রিমাইন্ডার হাপ্পা',
    remTitle: 'রিমাইন্ডার টাইটেল',
    description: 'বিবরণ',
    time: 'পুংফম',
    repeatInterval: 'হঞ্জিনবগী পুংফম',
    category: 'ক্যাটাগোরী',
    scheduleBtn: 'রিমাইন্ডার থম্বা',
    placeholderTitle: 'উদাঃ থমোইগী থৌদাং ওষুধ',
    placeholderDesc: 'চা ওইরবা মতুং ১ ট্যাবলেট চাবিউ',
    daily: 'নুমিৎ খুদিংগী',
    weekly: 'চয়োল খুদিংগী',
    every2h: 'পুং ২ খুদিংগী',
    once: 'অমুক্তা',
    catMedicine: 'হিদাক',
    catHydration: 'ঈশিং',
    catMeals: 'চাক',
    catExercise: 'এক্সরসাইজ',
    catAppointments: 'অপয়েন্টমেন্ট',
    catFamily: 'ইমুং',
    catOther: 'অতোপ্পা',
    alertPastDate: 'নহakna হৌখ্রবা তারিক্তা রিমাইন্ডার থম্বা য়াদে।',
    confirmTomorrow: 'পুংফম অসি হৌখ্রে।\nনহাক্না অসি হায়েনগী থম্বা পাম্ব্রা?',
    noRemindersTitle: 'রিমাইন্ডার অমত্তা থমদ্রে',
    noRemindersDesc: 'নুমিৎ খুদিংগী থবকশিং নীংশিংনবা রিমাইন্ডার হাপ্পিউ।',
    statusUpcoming: 'লাক্কদবা',
    statusCompleted: 'লোইখ্রবা',
    statusMissed: 'মাঙখ্রবা',
    tooltipEnable: 'হাঙদোকপা',
    tooltipDisable: 'মুত্থৎপা',
    tooltipMarkDone: 'লোইরে খঙহনবা',
    tooltipDelete: 'মুত্থৎপা',
    toastAdded: 'অনৌবা রিমাইন্ডার থমখ্রে',
    alertLogAdded: 'রিমাইন্ডার হাপখ্রে',
    justNow: 'হৌজিক খক্তা'
  },
  Khasi: {
    toastEnabled: 'Pynbeit la pynneh',
    toastDisabled: 'Pynbeit la pyndam',
    toastMarked: 'Pynbeit la kdiah kum',
    toastDeleted: 'Pynbeit la pyndam noh',
    deleteConfirm: 'Pyndam permanently ia kane ka jingpynkynmaw?',
    addReminder: 'Buh Jingpynkynmaw',
    remTitle: 'Kyrteng ka Jingpynkynmaw',
    description: 'Jingbatai',
    time: 'Por',
    repeatInterval: 'Khasiak',
    category: 'Jait',
    scheduleBtn: 'Buh ia ka Jingpynkynmaw',
    placeholderTitle: 'kd. Dawai shadem',
    placeholderDesc: 'Dih 1 tylli hadien ba la bam ja',
    daily: 'Manta ka sngi',
    weekly: 'Man la ka taiew',
    every2h: 'Man la ka 2 kynta',
    once: 'Shisien',
    catMedicine: 'Dawai',
    catHydration: 'Dih um',
    catMeals: 'Ja',
    catExercise: 'Ksar met',
    catAppointments: 'Appointment',
    catFamily: 'Iing',
    catOther: 'Kiwei',
    alertPastDate: 'Phi kym lah ban buh jingpynkynmaw ia ka sngi ba la dep.',
    confirmTomorrow: 'Kane ka por la dep noh mynta ka sngi.\nPhi kwah ban buh ia kane lashai ka sngi?',
    noRemindersTitle: 'Khlem pat buh jingpynkynmaw',
    noRemindersDesc: 'Buh jingpynkynmaw ban kynmaw ia ki kam ban leh.',
    statusUpcoming: 'Kaba bud',
    statusCompleted: 'La dep',
    statusMissed: 'La lait',
    tooltipEnable: 'Pynneh',
    tooltipDisable: 'Pyndam',
    tooltipMarkDone: 'Chhinchhiah la dep',
    tooltipDelete: 'Pyndam noh',
    toastAdded: 'La buh ia ka jingpynkynmaw bathar',
    alertLogAdded: 'La buh jingpynkynmaw',
    justNow: 'Mynta khala'
  },
  Mizo: {
    toastEnabled: 'Hriatnawnna dah a ni',
    toastDisabled: 'Hriatnawnna tihtop a ni',
    toastMarked: 'Hriatnawnna chhinchhiah a ni:',
    toastDeleted: 'Hriatnawnna nuaibo a ni',
    deleteConfirm: 'He hriatnawnna hi nuaibo i duh em?',
    addReminder: 'Hriatnawnna Thar',
    remTitle: 'Hriatnawnna Hming',
    description: 'Bena',
    time: 'Hun',
    repeatInterval: 'Hun inkar',
    category: 'Category',
    scheduleBtn: 'Hriatnawnna Ruahman',
    placeholderTitle: 'kd. Lung damdawi',
    placeholderDesc: 'Chaw eikhamah mum 1 ei tur',
    daily: 'Nitin',
    weekly: 'Kar tin',
    every2h: 'Darkar 2 tin',
    once: 'Vawi khat',
    catMedicine: 'Damdawi',
    catHydration: 'Tui in',
    catMeals: 'Chaw',
    catExercise: 'Taksa sawizawi',
    catAppointments: 'Appointment',
    catFamily: 'Chhungkua',
    catOther: 'Thil dang',
    alertPastDate: 'Ni liam tawhah hriatnawnna i siam thei lo.',
    confirmTomorrow: 'Vawiin hun a liam tawh e.\nNaktuk atan he hriatnawnna hi siam i duh zawk em?',
    noRemindersTitle: 'Hriatnawnna dah a la awm lo',
    noRemindersDesc: 'Hunruhman vawng tha turin hriatnawnna siam rawh.',
    statusUpcoming: 'La thleng lo',
    statusCompleted: 'Zau zo',
    statusMissed: 'Hmaih',
    tooltipEnable: 'Dah active',
    tooltipDisable: 'Tihtop',
    tooltipMarkDone: 'Tiah chhinchhiah',
    tooltipDelete: 'Nuaibo',
    toastAdded: 'Hriatnawnna thar ruahman a ni',
    alertLogAdded: 'Hriatnawnna dah thar a ni',
    justNow: 'Tun lawmah'
  },
  Nagamese: {
    toastEnabled: 'Reminder active hoise',
    toastDisabled: 'Reminder off hoise',
    toastMarked: 'Reminder marked as',
    toastDeleted: 'Reminder delete hoise',
    deleteConfirm: 'Etu reminder delete kuribole mon ase na?',
    addReminder: 'Reminder active kuribi',
    remTitle: 'Reminder Title',
    description: 'Description',
    time: 'Time',
    repeatInterval: 'Repeat Interval',
    category: 'Category',
    scheduleBtn: 'Reminder schedule kuribi',
    placeholderTitle: 'kd. Heart Medicine',
    placeholderDesc: 'Bhaat khakena 1 tablet khabi',
    daily: 'Daily',
    weekly: 'Weekly',
    every2h: 'Every 2 hours',
    once: 'Once',
    catMedicine: 'Medicine',
    catHydration: 'Water/Hydration',
    catMeals: 'Meals',
    catExercise: 'Exercise',
    catAppointments: 'Appointments',
    catFamily: 'Family',
    catOther: 'Other',
    alertPastDate: 'Apuni jowa din laga reminder active kuribole naparibo.',
    confirmTomorrow: 'Etu time toh aji par hoise.\nApuni etu reminder kali active kuribole mon ase na?',
    noRemindersTitle: 'Reminder active kuribo nai',
    noRemindersDesc: 'Apuni laga din thik pora thakibole reminder logabi.',
    statusUpcoming: 'Ahibole',
    statusCompleted: 'Done',
    statusMissed: 'Miss hoise',
    tooltipEnable: 'On kuribi',
    tooltipDisable: 'Off kuribi',
    tooltipMarkDone: 'Done mark kuribi',
    tooltipDelete: 'Delete',
    toastAdded: 'New reminder logaise',
    alertLogAdded: 'Reminder add hoise',
    justNow: 'Etiya hi'
  },
  Tripuri: {
    toastEnabled: 'Reminder active khailakha',
    toastDisabled: 'Reminder off khailakha',
    toastMarked: 'Reminder marked as',
    toastDeleted: 'Reminder delete khailakha',
    deleteConfirm: 'Permanently delete khailani?',
    addReminder: 'Reminder hapa',
    remTitle: 'Reminder Title',
    description: 'Description',
    time: 'Time',
    repeatInterval: 'Repeat Interval',
    category: 'Category',
    scheduleBtn: 'Reminder schedule khamdi',
    placeholderTitle: 'kd. Heart Medicine',
    placeholderDesc: 'Chak chasi 1 tablet khadi',
    daily: 'Daily',
    weekly: 'Weekly',
    every2h: 'Every 2 hours',
    once: 'Once',
    catMedicine: 'Medicine',
    catHydration: 'Hydration',
    catMeals: 'Meals',
    catExercise: 'Exercise',
    catAppointments: 'Appointments',
    catFamily: 'Family',
    catOther: 'Other',
    alertPastDate: 'Neng jowa dinni reminder phailani naparibo.',
    confirmTomorrow: 'Etu time toh aji par khamkha.\nNeng kali activity hapa khamdi?',
    noRemindersTitle: 'Reminder phailaia',
    noRemindersDesc: 'Nini sal khotom kahm khe logani reminder phailadi.',
    statusUpcoming: 'Phailani',
    statusCompleted: 'Khotom',
    statusMissed: 'Miss khamkha',
    tooltipEnable: 'Active khadi',
    tooltipDisable: 'Off khadi',
    tooltipMarkDone: 'Khotom mark khadi',
    tooltipDelete: 'Delete',
    toastAdded: 'New reminder logadi khamkha',
    alertLogAdded: 'Reminder hapa khamkha',
    justNow: 'Achengon'
  }
};

export const Reminders: React.FC = () => {
  const { t, language } = useLanguage();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New reminder states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('12:00');
  const [date, setDate] = useState(getISODateString());
  const [category, setCategory] = useState<Reminder['category']>('medicine');
  const [repeat, setRepeat] = useState('Daily');

  useEffect(() => {
    storageService.init();
    setReminders(storageService.getReminders());
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleActive = (id: string) => {
    const rt = remTranslations[language] || remTranslations.English;
    const updated = reminders.map(r => {
      if (r.id === id) {
        const nextState = !r.enabled;
        triggerToast(nextState ? rt.toastEnabled : rt.toastDisabled);
        return { ...r, enabled: nextState };
      }
      return r;
    });
    setReminders(updated);
    storageService.saveReminders(updated);
  };

  const handleToggleComplete = (id: string) => {
    const rt = remTranslations[language] || remTranslations.English;
    const updated = reminders.map(r => {
      if (r.id === id) {
        const nextStatus: Reminder['status'] = r.status === 'Completed' ? 'Upcoming' : 'Completed';
        const statusLabel = nextStatus === 'Completed' ? rt.statusCompleted : rt.statusUpcoming;
        triggerToast(`${rt.toastMarked} ${statusLabel}`);
        return { ...r, status: nextStatus } as Reminder;
      }
      return r;
    });
    setReminders(updated);
    storageService.saveReminders(updated);
  };

  const handleDelete = (id: string) => {
    const rt = remTranslations[language] || remTranslations.English;
    if (window.confirm(rt.deleteConfirm)) {
      const updated = reminders.filter(r => r.id !== id);
      setReminders(updated);
      storageService.saveReminders(updated);
      triggerToast(rt.toastDeleted);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const rt = remTranslations[language] || remTranslations.English;

    // Time validation in Asia/Kolkata timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const getVal = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
    const currentYear = getVal('year');
    const currentMonth = getVal('month');
    const currentDay = getVal('day');
    const currentHour = getVal('hour');
    const currentMinute = getVal('minute');

    // Parse chosen date
    const dateParts = date.split('-');
    const targetYear = parseInt(dateParts[0], 10);
    const targetMonth = parseInt(dateParts[1], 10);
    const targetDay = parseInt(dateParts[2], 10);

    // Parse chosen time
    const [targetHourStr, targetMinuteStr] = time.split(':');
    const targetHour = parseInt(targetHourStr, 10);
    const targetMinute = parseInt(targetMinuteStr, 10);

    const isToday = currentYear === targetYear && currentMonth === targetMonth && currentDay === targetDay;
    const isPastTimeToday = isToday && (targetHour < currentHour || (targetHour === currentHour && targetMinute < currentMinute));
    const isPastDate = targetYear < currentYear || 
                     (targetYear === currentYear && targetMonth < currentMonth) || 
                     (targetYear === currentYear && targetMonth === currentMonth && targetDay < currentDay);

    if (isPastDate) {
      alert(rt.alertPastDate);
      return;
    }

    let finalDate = date;
    if (isPastTimeToday) {
      if (window.confirm(rt.confirmTomorrow)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        finalDate = tomorrow.toISOString().split('T')[0];
      } else {
        return; // Stop submission to allow user choice
      }
    }

    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      category,
      title,
      description,
      time,
      date: finalDate,
      status: 'Upcoming',
      repeat,
      enabled: true
    };

    const updated = [newReminder, ...reminders];
    setReminders(updated);
    storageService.saveReminders(updated);
    triggerToast(rt.toastAdded);

    generateTranslations(title, description).then(trans => {
      const allRems = storageService.getReminders();
      const updatedWithTrans = allRems.map(r => r.id === newReminder.id ? { ...r, translations: trans } : r);
      storageService.saveReminders(updatedWithTrans);
      setReminders(updatedWithTrans);
    }).catch(err => {
      console.warn('[Translation] Failed to generate translations for reminder:', err);
    });

    // Notify Caregiver
    const alerts = storageService.getAlerts();
    storageService.saveAlerts([
      { id: `al-${Date.now()}`, type: 'info', title: `${rt.alertLogAdded}: ${title}`, time: rt.justNow },
      ...alerts
    ]);

    // Reset Form
    setTitle('');
    setDescription('');
    setTime('12:00');
    setDate(getISODateString());
    setCategory('medicine');
    setRepeat('Daily');
    setShowAddModal(false);
  };

  return (
    <div className="pb-12 space-y-6 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-brand-navy text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-bounce">
          <Sparkles className="w-5 h-5 text-brand-orange" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy">{t('rem.title')}</h1>
          <p className="text-brand-grayText font-medium mt-1">{t('rem.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-purple text-white hover:bg-opacity-95 py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>{t('rem.add')}</span>
        </button>
      </div>

      {/* Reminders List */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-brand-purpleLight shadow-sm space-y-6">
        {reminders.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-brand-grayText mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-navy">{(remTranslations[language] || remTranslations.English).noRemindersTitle}</h3>
            <p className="text-brand-grayText mt-2">{(remTranslations[language] || remTranslations.English).noRemindersDesc}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => {
              const localizedRem = getLocalizedReminder(reminder, language);
              const getCategoryStyle = (cat: Reminder['category']) => {
                switch (cat) {
                  case 'hydration':
                    return {
                      bg: 'bg-cyan-50 border-cyan-200 text-cyan-700',
                      iconBg: 'bg-cyan-100 text-cyan-600',
                      Icon: Droplets,
                      label: 'Hydration'
                    };
                  case 'exercise':
                    return {
                      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                      iconBg: 'bg-emerald-100 text-emerald-600',
                      Icon: Footprints,
                      label: 'Exercise'
                    };
                  case 'medicine':
                    return {
                      bg: 'bg-purple-50 border-purple-200 text-purple-700',
                      iconBg: 'bg-purple-100 text-purple-600',
                      Icon: Pill,
                      label: 'Medicine'
                    };
                  case 'meals':
                    return {
                      bg: 'bg-amber-50 border-amber-200 text-amber-700',
                      iconBg: 'bg-amber-100 text-amber-600',
                      Icon: Utensils,
                      label: 'Meals'
                    };
                  case 'family':
                    return {
                      bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
                      iconBg: 'bg-indigo-100 text-indigo-600',
                      Icon: Phone,
                      label: 'Family'
                    };
                  case 'appointments':
                    return {
                      bg: 'bg-teal-50 border-teal-200 text-teal-700',
                      iconBg: 'bg-teal-100 text-teal-600',
                      Icon: Calendar,
                      label: 'Appointment'
                    };
                  default:
                    return {
                      bg: 'bg-slate-50 border-slate-200 text-slate-700',
                      iconBg: 'bg-slate-100 text-slate-600',
                      Icon: Bell,
                      label: 'Reminder'
                    };
                }
              };

              const catStyle = getCategoryStyle(reminder.category);
              const CategoryIcon = catStyle.Icon;

              return (
                <div 
                  key={reminder.id}
                  className={`p-5 rounded-2xl border border-[#E6E0D4] bg-gradient-to-br from-[#FAF8F5] via-[#F6F2EC] to-[#EFEAE2] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:shadow-md ${
                    !reminder.enabled ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Category Icon Badge */}
                    <div className={`p-4 rounded-2xl flex-shrink-0 shadow-xs flex items-center justify-center ${catStyle.iconBg}`}>
                      <CategoryIcon className="w-8 h-8" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-xl text-brand-navy">{localizedRem.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                          reminder.status === 'Completed'
                            ? 'bg-brand-greenBg text-brand-green border border-green-200'
                            : 'bg-brand-orangeBg text-brand-orange border border-orange-200'
                        }`}>
                          {reminder.status === 'Completed' ? (remTranslations[language] || remTranslations.English).statusCompleted : reminder.status === 'Missed' ? (remTranslations[language] || remTranslations.English).statusMissed : (remTranslations[language] || remTranslations.English).statusUpcoming}
                        </span>
                        {reminder.isDefault && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Default System
                          </span>
                        )}
                      </div>
                      
                      <p className="text-brand-grayText font-semibold mt-1.5 text-base">{localizedRem.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs font-bold text-brand-purple">
                        <span className="bg-white/90 border border-brand-purpleLight/60 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs text-brand-navy font-black">
                          <Clock className="w-4 h-4 text-brand-purple" /> {(() => {
                            const p = parseTimeTo12h(reminder.time);
                            return `${p.hour}:${p.minute} ${p.ampm}`;
                          })()}
                        </span>
                        <span className={`px-3 py-1 rounded-full capitalize border shadow-xs ${catStyle.bg}`}>
                          {t('rem.labelCategory') || 'Category'}: <b>
                            {(() => {
                              const catDict = {
                                English: { medicine: 'Medicine', hydration: 'Hydration', meals: 'Meals', exercise: 'Exercise', appointments: 'Appointments', family: 'Family', other: 'Other' },
                                Hindi: { medicine: 'दवा', hydration: 'पानी', meals: 'भोजन', exercise: 'व्यायाम', appointments: 'अपॉइंटमेंट', family: 'परिवार', other: 'अन्य' },
                                Bengali: { medicine: 'ওষুধ', hydration: 'জল', meals: 'খাবার', exercise: 'ব্যায়াম', appointments: 'অ্যাপয়েন্টমেন্ট', family: 'পরিবার', other: 'অন্যান্য' },
                                Assamese: { medicine: 'ঔষধ', hydration: 'পানী', meals: 'আহাৰ', exercise: 'ব্যায়াম', appointments: 'নিযুক্তি', family: 'পৰিয়াল', other: 'অন্যান্য' },
                                Manipuri: { medicine: 'হিদাক', hydration: 'ঈশিং', meals: 'চীঞ্জাক', exercise: 'খোঙচৎ', appointments: 'অপয়েন্টমেন্ট', family: 'ইমুং', other: 'অতোপ্পা' },
                                Khasi: { medicine: 'Dawai', hydration: 'Dih Um', meals: 'Bam', exercise: 'Iaiaid', appointments: 'Appointment', family: 'Yung', other: 'Kaba Pher' },
                                Mizo: { medicine: 'Dampui', hydration: 'Tui', meals: 'Chaw', exercise: 'Exercise', appointments: 'Appointment', family: 'Chhungkua', other: 'A dang' },
                                Nagamese: { medicine: 'Dawai', hydration: 'Pani', meals: 'Bhaat', exercise: 'Exercise', appointments: 'Appointment', family: 'Family', other: 'Alag' },
                                Tripuri: { medicine: 'Dawai', hydration: 'Tui', meals: 'Bhaat', exercise: 'Exercise', appointments: 'Appointment', family: 'Family', other: 'Alag' }
                              };
                              const currentCatDict = (catDict as any)[language] || catDict.English;
                              return (currentCatDict as any)[reminder.category] || reminder.category;
                            })()}
                          </b>
                        </span>
                        <span className="bg-white/90 border border-brand-purpleLight/60 px-3 py-1 rounded-full text-brand-navy shadow-xs">
                          {t('rem.labelRepeat') || 'Repeat'}: <b>{
                          reminder.repeat === 'Daily' ? (remTranslations[language] || remTranslations.English).daily :
                          reminder.repeat === 'Weekly' ? (remTranslations[language] || remTranslations.English).weekly :
                          reminder.repeat === 'Every 2 hours' ? (remTranslations[language] || remTranslations.English).every2h :
                          reminder.repeat === 'Once' ? (remTranslations[language] || remTranslations.English).once :
                          reminder.repeat
                        }</b></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {/* Active Toggle */}
                    <button
                      onClick={() => handleToggleActive(reminder.id)}
                      className="p-1.5 rounded-lg hover:bg-brand-lavender transition-all"
                      title={reminder.enabled ? (remTranslations[language] || remTranslations.English).tooltipDisable : (remTranslations[language] || remTranslations.English).tooltipEnable}
                    >
                      {reminder.enabled ? (
                        <ToggleRight className="w-9 h-9 text-brand-purple" />
                      ) : (
                        <ToggleLeft className="w-9 h-9 text-brand-grayText" />
                      )}
                    </button>

                    {/* Mark complete */}
                    <button
                      onClick={() => handleToggleComplete(reminder.id)}
                      className={`p-3 rounded-xl border transition-all ${
                        reminder.status === 'Completed'
                          ? 'bg-brand-green border-brand-green text-white hover:bg-opacity-90'
                          : 'bg-white border-brand-purpleLight text-brand-purple hover:bg-brand-purpleLight'
                      }`}
                      title={(remTranslations[language] || remTranslations.English).tooltipMarkDone}
                    >
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-3 rounded-xl bg-brand-redBg text-brand-red hover:bg-brand-red hover:text-white transition-all"
                      title={(remTranslations[language] || remTranslations.English).tooltipDelete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy bg-opacity-40">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-brand-purpleLight">
            <div className="flex justify-between items-center border-b border-brand-purpleLight pb-4 mb-6">
              <h2 className="font-extrabold text-xl text-brand-navy">{(remTranslations[language] || remTranslations.English).addReminder}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-brand-lavender">
                <X className="w-6 h-6 text-brand-grayText" />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">{(remTranslations[language] || remTranslations.English).remTitle}</label>
                <input
                  type="text"
                  placeholder={(remTranslations[language] || remTranslations.English).placeholderTitle}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">{(remTranslations[language] || remTranslations.English).description}</label>
                <input
                  type="text"
                  placeholder={(remTranslations[language] || remTranslations.English).placeholderDesc}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple text-base"
                />
              </div>

              <div>
                <TimeSelector12h
                  label={(remTranslations[language] || remTranslations.English).time}
                  value={time}
                  onChange={(val24h) => setTime(val24h)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">{(remTranslations[language] || remTranslations.English).repeatInterval}</label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple text-base"
                >
                  <option value="Daily">{(remTranslations[language] || remTranslations.English).daily}</option>
                  <option value="Weekly">{(remTranslations[language] || remTranslations.English).weekly}</option>
                  <option value="Every 2 hours">{(remTranslations[language] || remTranslations.English).every2h}</option>
                  <option value="Once">{(remTranslations[language] || remTranslations.English).once}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">{(remTranslations[language] || remTranslations.English).category}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple text-base"
                >
                  <option value="medicine">{(remTranslations[language] || remTranslations.English).catMedicine}</option>
                  <option value="hydration">{(remTranslations[language] || remTranslations.English).catHydration}</option>
                  <option value="meals">{(remTranslations[language] || remTranslations.English).catMeals}</option>
                  <option value="exercise">{(remTranslations[language] || remTranslations.English).catExercise}</option>
                  <option value="appointments">{(remTranslations[language] || remTranslations.English).catAppointments}</option>
                  <option value="family">{(remTranslations[language] || remTranslations.English).catFamily}</option>
                  <option value="other">{(remTranslations[language] || remTranslations.English).catOther}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-brand-purple text-white py-3.5 rounded-xl font-bold hover:bg-opacity-95"
              >
                {(remTranslations[language] || remTranslations.English).scheduleBtn}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
