import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Circle, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { Activity } from '../data/demoData';
import { useLanguage } from '../context/LanguageContext';
import { getFormattedDate } from '../utils/dateUtils';
import { getLocalizedActivity, generateTranslations } from '../services/translationService';
import { TimeSelector12h } from '../components/TimeSelector12h';

// Helper to determine if an activity time has been reached based on IST (Asia/Kolkata)
const isActivityActive = (timeStr: string, dateStr?: string): boolean => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const getVal = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
    
    const currentYear = getVal('year');
    const currentMonth = getVal('month'); // 1-12
    const currentDay = getVal('day');
    const currentHour = getVal('hour');
    const currentMinute = getVal('minute');

    const cleanTime = timeStr.trim().toUpperCase();
    const matches = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
    if (!matches) return true; // Safe fallback
    
    let hours = parseInt(matches[1], 10);
    const minutes = parseInt(matches[2], 10);
    const modifier = matches[3];
    
    if (hours === 12) hours = 0;
    if (modifier === 'PM') hours += 12;

    let targetYear = currentYear;
    let targetMonth = currentMonth;
    let targetDay = currentDay;

    if (dateStr) {
      const dateParts = dateStr.split('-');
      if (dateParts.length === 3) {
        targetYear = parseInt(dateParts[0], 10);
        targetMonth = parseInt(dateParts[1], 10);
        targetDay = parseInt(dateParts[2], 10);
      }
    }

    if (currentYear > targetYear) return true;
    if (currentYear < targetYear) return false;
    
    if (currentMonth > targetMonth) return true;
    if (currentMonth < targetMonth) return false;
    
    if (currentDay > targetDay) return true;
    if (currentDay < targetDay) return false;

    if (currentHour > hours) return true;
    if (currentHour < hours) return false;
    return currentMinute >= minutes;
  } catch (e) {
    return true; // Safe fallback
  }
};

const getCategoryEmoji = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('med') || t.includes('pill') || t.includes('tablet') || t.includes('dawai')) return '💊';
  if (t.includes('water') || t.includes('drink') || t.includes('hydration') || t.includes('pani')) return '💧';
  if (t.includes('walk') || t.includes('exerc') || t.includes('run') || t.includes('berabo')) return '🚶';
  if (t.includes('breakfast') || t.includes('lunch') || t.includes('dinner') || t.includes('meal') || t.includes('eat') || t.includes('bhaat') || t.includes('chaw')) return '🍱';
  if (t.includes('bath') || t.includes('wash') || t.includes('shower')) return '🛁';
  if (t.includes('sleep') || t.includes('bed') || t.includes('rest')) return '💤';
  if (t.includes('call') || t.includes('phone') || t.includes('family')) return '📞';
  return '📅';
};

const dayTranslations: Record<string, Record<string, string>> = {
  English: {
    deleteConfirm: 'Delete this scheduled item?',
    upcoming: 'Upcoming',
    addActivity: 'Add Daily Activity',
    editActivity: 'Edit Activity',
    activityName: 'Activity Name',
    scheduledTime: 'Scheduled Time',
    scheduleBtn: 'Schedule Activity',
    saveBtn: 'Save Changes',
    placeholderName: 'e.g. Evening Walk',
    placeholderTime: 'e.g. 06:00 PM',
    completed: 'Completed',
    next: 'Do This Next',
    missed: 'Missed',
    later: 'Later Today',
    journeyTitle: 'Your Daily Journey'
  },
  Hindi: {
    deleteConfirm: 'क्या आप इस निर्धारित गतिविधि को हटाना चाहते हैं?',
    upcoming: 'आने वाला',
    addActivity: 'दैनिक गतिविधि जोड़ें',
    editActivity: 'गतिविधि संपादित करें',
    activityName: 'गतिविधि का नाम',
    scheduledTime: 'निर्धारित समय',
    scheduleBtn: 'गतिविधि निर्धारित करें',
    saveBtn: 'बदलाव सहेजें',
    placeholderName: 'जैसे- शाम की सैर',
    placeholderTime: 'जैसे- 06:00 PM',
    completed: 'पूर्ण हुआ',
    next: 'अगला काम करें',
    missed: 'छूट गया',
    later: 'आज बाद में',
    journeyTitle: 'आपकी दैनिक यात्रा'
  },
  Bengali: {
    deleteConfirm: 'আপনি কি এই নির্ধারিত কাজটি মুছে ফেলতে চান?',
    upcoming: 'আসন্ন',
    addActivity: 'দৈনিক কাজ যোগ করুন',
    editActivity: 'কাজ সম্পাদন করুন',
    activityName: 'কাজের নাম',
    scheduledTime: 'নির্ধারিত সময়',
    scheduleBtn: 'কাজ নির্ধারণ করুন',
    saveBtn: 'পরিবর্তন সংরক্ষণ করুন',
    placeholderName: 'উদাঃ বিকেলে হাঁটা',
    placeholderTime: 'উদাঃ ০৬:০০ PM',
    completed: 'সম্পন্ন',
    next: 'পরবর্তী কাজ',
    missed: 'মিস হয়েছে',
    later: 'আজ পরে',
    journeyTitle: 'আপনার দৈনন্দিন যাত্রা'
  },
  Assamese: {
    deleteConfirm: 'আপুনি এই কাৰ্যসূচীটো মচিব খোজে নেকি?',
    upcoming: 'অনাগত',
    addActivity: 'দৈনিক কাৰ্যসূচী যোগ কৰক',
    editActivity: 'কাৰ্যসূচী সম্পাদনা কৰক',
    activityName: 'কাৰ্যসূচীৰ নাম',
    scheduledTime: 'নিৰ্ধাৰিত সময়',
    scheduleBtn: 'কাৰ্যসূচী প্ৰস্তুত কৰক',
    saveBtn: 'সংৰক্ষণ কৰক',
    placeholderName: 'যেনে- সন্ধিয়া ফুৰিবলৈ যোৱা',
    placeholderTime: 'যেনে- ০৬:০০ PM',
    completed: 'সম্পূৰ্ণ হ’ল',
    next: 'পৰৱৰ্তী কাম',
    missed: 'পাৰ হৈ গ’ল',
    later: 'আজি পিছত',
    journeyTitle: 'আপোনাৰ দৈনন্দিন যাত্ৰা'
  },
  Manipuri: {
    deleteConfirm: 'অসি মফম অসিদগী মুত্থতপরা?',
    upcoming: 'লাক্কদ্রিবা',
    addActivity: 'নুমিৎসিগী থবক হাপ্পা',
    editActivity: 'থবক শেমদোকপা',
    activityName: 'থবককী টাইটেল',
    scheduledTime: 'শেম্লবা পুংফম',
    scheduleBtn: 'থবক থম্বা',
    saveBtn: 'শেমদোকপা থম্বা',
    placeholderName: 'উদাঃ নুমিদাংগী খোঙ চৎপা',
    placeholderTime: 'উদাঃ ০৬:০০ PM',
    completed: 'লোইখ্রে',
    next: 'মথংগী থবক',
    missed: 'মাংখ্রে',
    later: 'তুংদা',
    journeyTitle: 'নহাগী নুমিৎসিগী খোঙচৎ'
  },
  Khasi: {
    deleteConfirm: 'Pyndam ia kane ka kam ba la buh?',
    upcoming: 'Ban dang wan',
    addActivity: 'Buh Kam Kaba Man La Ka Sngi',
    editActivity: 'Pynkylla ia ka Kam',
    activityName: 'Kyrteng ka Kam',
    scheduledTime: 'Por ba la buh',
    scheduleBtn: 'Buh ia ka Kam',
    saveBtn: 'Pynsah ia ki Jingkylla',
    placeholderName: 'kd. Ka jingleit iad',
    placeholderTime: 'kd. 06:00 PM',
    completed: 'La dep',
    next: 'Leh ia kane bud',
    missed: 'La lait',
    later: 'Hadien mynta',
    journeyTitle: 'Ka Jingleit jong phi Mynta'
  },
  Mizo: {
    deleteConfirm: 'He thil ruahman hi nuaibo i duh em?',
    upcoming: 'La thleng lo',
    addActivity: 'Nitin Hna Dahna',
    editActivity: 'Hna Siamṭhatna',
    activityName: 'Hna Hming',
    scheduledTime: 'Hun Ruahman',
    scheduleBtn: 'Hna Ruahman Dahna',
    saveBtn: 'Siamṭhatna Dahna',
    placeholderName: 'kd. Tlai chheih kal',
    placeholderTime: 'kd. 06:00 PM',
    completed: 'Zawh tawh',
    next: 'A dawt hna',
    missed: 'Hmaih tawh',
    later: 'Nakinah',
    journeyTitle: 'Vawiin I Zin kawng'
  },
  Nagamese: {
    deleteConfirm: 'Etu schedule delete kuribole mon ase na?',
    upcoming: 'Ahibole thaka',
    addActivity: 'Daily Schedule Bachabi',
    editActivity: 'Schedule Edit Kuribi',
    activityName: 'Schedule Hming',
    scheduledTime: 'Time scheduled',
    scheduleBtn: 'Schedule Kuribi',
    saveBtn: 'Bhal pora thakibi',
    placeholderName: 'kd. Tlai berabo',
    placeholderTime: 'kd. 06:00 PM',
    completed: 'Khatam hoise',
    next: 'Akhe kaam kuribi',
    missed: 'Miss hoise',
    later: 'Pise te',
    journeyTitle: 'Aji laga Journey'
  },
  Tripuri: {
    deleteConfirm: 'Etu activity delete khailani?',
    upcoming: 'Phai tongma',
    addActivity: 'Dinni kam hapa',
    editActivity: 'Kam chopha khailadi',
    activityName: 'Kam Title',
    scheduledTime: 'Time hiladi',
    scheduleBtn: 'Kam hiladi',
    saveBtn: 'Hilama khamdi',
    placeholderName: 'kd. Aphi chhor',
    placeholderTime: 'kd. 06:00 PM',
    completed: 'Complete khawkha',
    next: 'Uli samung khadi',
    missed: 'Miss khamkha',
    later: 'Uli tei',
    journeyTitle: 'Dinni Re-mung Journey'
  }
};

export const MyDay: React.FC = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [schedule, setSchedule] = useState<Activity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);
  
  const [, setTimeTick] = useState(0);

  useEffect(() => {
    storageService.init();
    setSchedule(storageService.getSchedule());

    if (location.state?.highlightTaskId) {
      setHighlightTaskId(location.state.highlightTaskId);
      const timer = setTimeout(() => {
        setHighlightTaskId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }

    const timer = setInterval(() => {
      setTimeTick(t => t + 1);
    }, 15000);
    return () => clearInterval(timer);
  }, [location.state]);

  const handleToggleComplete = (id: string) => {
    const act = schedule.find(a => a.id === id);
    if (!act) return;

    if (!act.completed && !isActivityActive(act.time, act.date)) {
      console.warn(`[My Day] Activity "${act.title}" is locked until ${act.time} IST.`);
      return;
    }

    const updated = schedule.map(a => {
      if (a.id === id) {
        if (!a.completed) {
          const alerts = storageService.getAlerts();
          storageService.saveAlerts([
            { id: `al-${Date.now()}`, type: 'success', title: `Task completed: ${a.title}`, time: 'Just now' },
            ...alerts
          ]);
        }
        return { ...a, completed: !a.completed };
      }
      return a;
    });
    setSchedule(updated);
    storageService.saveSchedule(updated);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      time: newTime,
      title: newTitle,
      completed: false,
      date: todayStr
    };

    const updated = [...schedule, newAct].sort((a, b) => {
      const toMinutes = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (hours === 12) hours = 0;
        if (modifier === 'PM') hours += 12;
        return hours * 60 + (minutes || 0);
      };
      return toMinutes(a.time) - toMinutes(b.time);
    });

    setSchedule(updated);
    storageService.saveSchedule(updated);
    setNewTitle('');
    setShowAddModal(false);

    generateTranslations(newTitle, '').then(trans => {
      const currentSch = storageService.getSchedule();
      const updatedWithTrans = currentSch.map(s => s.id === newAct.id ? { ...s, translations: trans } : s);
      storageService.saveSchedule(updatedWithTrans);
      setSchedule(updatedWithTrans);
    }).catch(err => {
      console.warn('[Translation] Failed to generate translations for activity:', err);
    });
  };

  const handleDeleteActivity = (id: string) => {
    const dt = dayTranslations[language] || dayTranslations.English;
    if (window.confirm(dt.deleteConfirm)) {
      const updated = schedule.filter(act => act.id !== id);
      setSchedule(updated);
      storageService.saveSchedule(updated);
    }
  };

  const handleEditActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity || !editingActivity.title.trim()) return;

    const updated = schedule.map(act => 
      act.id === editingActivity.id ? editingActivity : act
    );
    setSchedule(updated);
    storageService.saveSchedule(updated);
    setEditingActivity(null);

    generateTranslations(editingActivity.title, '').then(trans => {
      const currentSch = storageService.getSchedule();
      const updatedWithTrans = currentSch.map(s => s.id === editingActivity.id ? { ...s, translations: trans } : s);
      storageService.saveSchedule(updatedWithTrans);
      setSchedule(updatedWithTrans);
    }).catch(err => {
      console.warn('[Translation] Failed to generate translations for edited activity:', err);
    });
  };

  // Find the first uncompleted activity ID to mark as "next"
  const firstUncompletedItem = schedule.find(item => !item.completed);
  const nextItemId = firstUncompletedItem ? firstUncompletedItem.id : null;

  const completedCount = schedule.filter(s => s.completed).length;
  const completedPct = schedule.length ? Math.round((completedCount / schedule.length) * 100) : 0;

  const dict = dayTranslations[language] || dayTranslations.English;

  return (
    <div className="pb-16 space-y-6 max-w-4xl mx-auto px-2 sm:px-4">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-navy tracking-tight">{t('nav.myDay')}</h1>
          <p className="text-brand-grayText font-bold text-base mt-1">{getFormattedDate(new Date(), language)}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-purple text-white hover:bg-opacity-95 py-3 px-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-base"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>{t('day.add')}</span>
        </button>
      </div>

      {/* Main Journey Card with Warm Senior-Friendly Background */}
      <div className="bg-gradient-to-br from-[#FAF8F5] via-[#F5F1E9] to-[#EFEAE1] p-5 sm:p-8 rounded-3xl border border-[#E6E0D3] shadow-sm space-y-6">
        
        {/* Journey Progress Summary Bar */}
        <div className="bg-white/90 p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-black text-stone-800 flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-base">
              <span>🧭</span> {dict.journeyTitle}
            </span>
            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              {completedCount} of {schedule.length} Completed ({completedPct}%)
            </span>
          </div>
          <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden border border-stone-200">
            <div 
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-full transition-all duration-700 rounded-full"
              style={{ width: `${completedPct}%` }}
            />
          </div>
        </div>

        {/* Vertical Connected Journey Timeline */}
        <div className="relative ml-2 sm:ml-4 space-y-8 py-2">
          {schedule.map((item, index) => {
            const isCompleted = item.completed;
            const timePassed = isActivityActive(item.time, item.date);
            const isNext = !isCompleted && item.id === nextItemId;
            const isMissed = !isCompleted && !isNext && timePassed;
            const isUpcoming = !isCompleted && !isNext && !timePassed;

            const isHighlighted = item.id === highlightTaskId;

            return (
              <div key={item.id} className={`relative pl-9 sm:pl-12 group transition-all duration-300 ${isHighlighted ? 'ring-2 ring-emerald-500 rounded-2xl p-2 bg-emerald-50/60 shadow-md' : ''}`}>
                {/* Timeline vertical connecting line segment */}
                {index < schedule.length - 1 && (
                  <div 
                    className={`absolute left-[15px] sm:left-[17px] top-10 bottom-0 w-1 rounded-full transition-all duration-500 ${
                      isCompleted 
                        ? 'bg-emerald-500' 
                        : isNext 
                        ? 'bg-gradient-to-b from-amber-400 to-amber-200 animate-pulse' 
                        : isMissed
                        ? 'bg-rose-200'
                        : 'bg-stone-300'
                    }`} 
                  />
                )}

                {/* Timeline Marker Button */}
                <button 
                  onClick={() => handleToggleComplete(item.id)}
                  className={`absolute left-0 top-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 shadow-sm focus:outline-none ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-300 text-white scale-105 hover:bg-emerald-700'
                      : isNext
                      ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 border-amber-200 text-white scale-110 shadow-md shadow-amber-500/30 animate-pulse'
                      : isMissed
                      ? 'bg-rose-100 border-rose-300 text-rose-700 hover:bg-rose-200'
                      : 'bg-white border-stone-300 text-stone-400 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                  title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : isNext ? (
                    <span className="text-base font-black animate-bounce">→</span>
                  ) : isMissed ? (
                    <X className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Circle className="w-4 h-4 stroke-[2]" />
                  )}
                </button>

                {/* Activity Card */}
                <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-emerald-50/80 border-emerald-200/90 shadow-2xs'
                    : isNext
                    ? 'bg-gradient-to-r from-amber-50/95 via-orange-50/90 to-amber-50/95 border-amber-400 shadow-md shadow-amber-500/10 scale-[1.01]'
                    : isMissed
                    ? 'bg-rose-50/80 border-rose-200/90 text-rose-950'
                    : 'bg-white/90 border-stone-200/80 hover:border-indigo-200 shadow-2xs'
                }`}>
                  <div className="space-y-1.5">
                    {/* Top Status & Time Badge row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black tracking-wider text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                        {item.time}
                      </span>
                      {isCompleted && (
                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                          ✓ {dict.completed}
                        </span>
                      )}
                      {isNext && (
                        <span className="text-[11px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 rounded-full shadow-2xs animate-pulse uppercase tracking-wider flex items-center gap-1">
                          <span>→</span> {dict.next}
                        </span>
                      )}
                      {isMissed && (
                        <span className="text-[11px] font-black text-rose-800 bg-rose-100/90 px-2.5 py-0.5 rounded-full border border-rose-200 uppercase tracking-wider">
                          ✕ {dict.missed}
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="text-[11px] font-extrabold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          ○ {dict.later}
                        </span>
                      )}
                    </div>

                    {/* Activity Title */}
                    <h3 className={`font-black text-lg md:text-xl text-stone-900 flex items-center gap-2.5 mt-1 ${
                      isCompleted ? 'line-through opacity-75 text-emerald-950' : ''
                    }`}>
                      <span className="text-2xl flex-shrink-0">
                        {getCategoryEmoji(item.title)}
                      </span>
                      <span>{getLocalizedActivity(item, language).title}</span>
                    </h3>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleComplete(item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 shadow-2xs ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                          : isNext
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-95 shadow-xs animate-pulse'
                          : isMissed
                          ? 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200'
                          : 'bg-stone-100 text-stone-800 border border-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {isCompleted 
                        ? dict.completed 
                        : isNext 
                        ? `Mark Complete` 
                        : isMissed 
                        ? `Mark Done` 
                        : `Complete`}
                    </button>

                    <button
                      onClick={() => setEditingActivity(item)}
                      className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 hover:text-indigo-600 transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(item.id)}
                      className="p-2 rounded-xl hover:bg-rose-100 text-rose-600 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy bg-opacity-40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl border border-brand-purpleLight">
            <div className="flex justify-between items-center border-b border-brand-purpleLight pb-4 mb-6">
              <h2 className="font-extrabold text-xl text-brand-navy">{dict.addActivity}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-brand-lavender">
                <X className="w-6 h-6 text-brand-grayText" />
              </button>
            </div>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">{dict.activityName}</label>
                <input
                  type="text"
                  placeholder={dict.placeholderName}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple text-base"
                  required
                />
              </div>
              <div>
                <TimeSelector12h
                  label={dict.scheduledTime}
                  value={newTime}
                  onChange={(_val24h, val12h) => setNewTime(val12h)}
                />
              </div>
              <button
                type="submit"
                className="w-full mt-6 bg-brand-purple text-white py-3.5 rounded-xl font-bold hover:bg-opacity-95"
              >
                {dict.scheduleBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy bg-opacity-40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl border border-brand-purpleLight">
            <div className="flex justify-between items-center border-b border-brand-purpleLight pb-4 mb-6">
              <h2 className="font-extrabold text-xl text-brand-navy">{dict.editActivity}</h2>
              <button onClick={() => setEditingActivity(null)} className="p-1 rounded-lg hover:bg-brand-lavender">
                <X className="w-6 h-6 text-brand-grayText" />
              </button>
            </div>
            <form onSubmit={handleEditActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">{dict.activityName}</label>
                <input
                  type="text"
                  value={editingActivity.title}
                  onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple text-base"
                  required
                />
              </div>
              <div>
                <TimeSelector12h
                  label={dict.scheduledTime}
                  value={editingActivity.time}
                  onChange={(_val24h, val12h) => setEditingActivity({ ...editingActivity, time: val12h })}
                />
              </div>
              <button
                type="submit"
                className="w-full mt-6 bg-brand-purple text-white py-3.5 rounded-xl font-bold hover:bg-opacity-95"
              >
                {dict.saveBtn}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

