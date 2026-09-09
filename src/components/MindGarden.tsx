import React, { useEffect, useState } from 'react';
import { CheckCircle2, X, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { storageService } from '../services/storageService';

// Multilingual dictionary for Mind Garden across all 9 supported languages
const gardenTranslations: Record<string, {
  title: string;
  subtitle: string;
  headerQuote: string;
  signMessageHigh: string;
  signMessageMed: string;
  signMessageLow: string;
  categories: {
    memory: string;
    cognitive: string;
    activities: string;
    mood: string;
    health: string;
  };
  modalTitle: string;
  close: string;
  recentActivity: string;
  nurtureTip: string;
  memoryTip: string;
  cognitiveTip: string;
  activitiesTip: string;
  moodTip: string;
  healthTip: string;
  noActivityYet: string;
}> = {
  English: {
    title: 'Mind Garden',
    subtitle: 'Your efforts today help your garden grow.',
    headerQuote: '“A healthier mind blooms every day”',
    signMessageHigh: 'Keep Going\nYou’re Growing!',
    signMessageMed: 'Every Small Step\nHelps Your Garden Bloom',
    signMessageLow: 'A Gentle Start\nYour Garden Welcomes You',
    categories: {
      memory: 'Memory',
      cognitive: 'Cognitive Games',
      activities: 'Daily Activities',
      mood: 'Mood',
      health: 'Medication'
    },
    modalTitle: 'Plant Details',
    close: 'Close',
    recentActivity: 'Recorded Progress & Activity',
    nurtureTip: 'Garden Care Advice',
    memoryTip: 'Viewing family photos and recalling special memories keeps memory blossoms vibrant.',
    cognitiveTip: 'Playing 10 minutes of brain puzzles keeps cognitive roots strong and deep.',
    activitiesTip: 'Completing morning walks and daily tasks feeds your garden flowers with sunshine.',
    moodTip: 'Expressing your feelings and staying peaceful brings warm light to your garden.',
    healthTip: 'Taking timely medicine and drinking water keeps your leaves fresh and green.',
    noActivityYet: 'No activities completed yet today. Start with a gentle task!'
  },
  Hindi: {
    title: 'माइंड गार्डन',
    subtitle: 'आज के प्रयास आपके बगीचे को बढ़ाने में मदद करते हैं।',
    headerQuote: '“एक स्वस्थ मन हर दिन खिलता है”',
    signMessageHigh: 'आगे बढ़ते रहें,\nआप बढ़ रहे हैं!',
    signMessageMed: 'हर छोटा कदम\nबगीचे को महकाता है',
    signMessageLow: 'शांत शुरुआत,\nबगीचा आपका स्वागत करता है',
    categories: {
      memory: 'स्मृति (यादें)',
      cognitive: 'दिमागी खेल',
      activities: 'दैनिक गतिविधियां',
      mood: 'मनोदशा (Mood)',
      health: 'दवा व दिनचर्या'
    },
    modalTitle: 'पौधे की जानकारी',
    close: 'बंद करें',
    recentActivity: 'दर्ज की गई प्रगति',
    nurtureTip: 'बगीचे की देखभाल',
    memoryTip: 'पारिवारिक तस्वीरें देखना और पुरानी यादें ताज़ा करना यादों के फूलों को खिलाए रखता है।',
    cognitiveTip: 'प्रतिदिन 10 मिनट दिमागी खेल खेलने से मानसिक क्षमता मजबूत होती है।',
    activitiesTip: 'सुबह की सैर और कार्य पूरा करने से बगीचा खिलता है।',
    moodTip: 'शांत रहना और प्रसन्न रहना बगीचे में धूप लाता है।',
    healthTip: 'समय पर दवा लेना और जलपान करना पत्तियों को हरा-भरा रखता है।',
    noActivityYet: 'आज अभी तक कोई कार्य पूरा नहीं हुआ है। एक छोटे कार्य से शुरुआत करें!'
  },
  Bengali: {
    title: 'মাইন্ড গার্ডেন',
    subtitle: 'আজকের প্রচেষ্টা আপনার বাগানকে সুন্দর করে তোলে।',
    headerQuote: '“একটি সুস্থ মন প্রতিদিন ফুটে ওঠে”',
    signMessageHigh: 'এগিয়ে চলুন,\nআপনার বাগান বাড়ছে!',
    signMessageMed: 'প্রতিটি ছোট পদক্ষেপ\nবাগানকে প্রস্ফুটিত করে',
    signMessageLow: 'শান্ত সূচনা,\nবাগান আপনাকে স্বাগত জানায়',
    categories: {
      memory: 'স্মৃতিশক্তি',
      cognitive: 'মস্তিষ্কের খেলা',
      activities: 'দৈনন্দিন কাজ',
      mood: 'মনের ভাব',
      health: 'ওষুধ ও রুটিন'
    },
    modalTitle: 'গাছের বিবরণ',
    close: 'বন্ধ করুন',
    recentActivity: 'সাম্প্রতিক অগ্রগতি',
    nurtureTip: 'বাগানের যত্ন',
    memoryTip: 'পরিবারের ছবি দেখা ও পুরনো স্মৃতি মনে করা ফুলকে সতেজ রাখে।',
    cognitiveTip: 'প্রতিদিন ১০ মিনিট ব্রেন গেম খেললে স্মৃতিশক্তি মজবুত হয়।',
    activitiesTip: 'সকালের হাঁটা ও কাজ শেষ করলে বাগানের ফুল ভালো থাকে।',
    moodTip: 'মনের কথা শেয়ার করা ও শান্ত থাকা বাগানে রোদ্দুর এনে দেয়।',
    healthTip: 'সঠিক সময়ে ওষুধ খাওয়া ও জল পান করা পাতা সবুজ রাখে।',
    noActivityYet: 'আজ এখনও কোনো কাজ সম্পন্ন হয়নি। একটি ছোট কাজ দিয়ে শুরু করুন!'
  },
  Assamese: {
    title: 'মাইনড গাৰ্ডেন',
    subtitle: 'আজিৰ প্ৰচেষ্টাই আপোনাৰ বাগানখন বিকশিত কৰে।',
    headerQuote: '“এটা সুস্থ মন প্ৰতিদিনে ফুলি উঠে”',
    signMessageHigh: 'আগুৱাই যাওক,\nবাগানখন বাঢ়িছে!',
    signMessageMed: 'প্ৰতিটো সৰু পদক্ষেপে\nবাগানখন সজীৱ কৰে',
    signMessageLow: 'শান্ত আৰম্ভণি,\nবাগানখনে আদৰণি জনাইছে',
    categories: {
      memory: 'স্মৃতি',
      cognitive: 'মানসিক খেল',
      activities: 'দৈনিক কাম',
      mood: 'মনৰ অৱস্থা',
      health: 'ঔষধ আৰু রুটিন'
    },
    modalTitle: 'গছৰ বিৱৰণ',
    close: 'বন্ধ কৰক',
    recentActivity: 'সম্পূৰ্ণ কৰা কাম',
    nurtureTip: 'যতন লোৱাৰ পৰামৰ্শ',
    memoryTip: 'পৰিয়ালৰ ছবি চোৱা স্মৃতিৰ ফুলবোৰৰ বাবে উপকাৰী।',
    cognitiveTip: 'দিনে ১০ মিনিট মানসিক খেল খেলিলে মগজু সক্ৰিয় থাকে।',
    activitiesTip: 'পুৱাৰ খোজ কঢ়া আৰু দৈনিক কামে বাগানখন সজীৱ ৰাখে।',
    moodTip: 'মনৰ ভাব প্ৰকাশ কৰা আৰু শান্ত থকা মানে বাগানত ৰ’দ পৰা।',
    healthTip: 'সময়মতে ঔষধ খোৱাটো স্বাস্থ্যৰ বাবে প্ৰয়োজনীয়।',
    noActivityYet: 'আজি এতিয়ালৈকে কোনো কাম সম্পূৰ্ণ হোৱা নাই। এটা সৰু কামেৰে আৰম্ভ কৰক!'
  },
  Manipuri: {
    title: 'মাইন্দ গার্দেন',
    subtitle: 'ঙসিগী হোৎনবনা লৈকোনবু চাউখৎহল্লি।',
    headerQuote: '“অফবা পুকনিংনা নুমিৎ খুদিং লৈফোংহল্লি”',
    signMessageHigh: 'মখা চৎথবীউ,\nলৈকোন চাউখৎলক্লি!',
    signMessageMed: 'খোংথাং খুদিংমকনা\nলৈকোনবু লৈফোংহল্লি',
    signMessageLow: 'তপ্না হৌবা,\nলৈকোননা ওকচরি',
    categories: {
      memory: 'নিংশিংবা',
      cognitive: 'লৌশিং শান্নবা',
      activities: 'নুমিৎ খুদিংগী থবক',
      mood: 'পুকনিং ফিভম',
      health: 'হিদাঅ অমসুং হকচাং'
    },
    modalTitle: 'পাম্বীগী অকুপ্পা মরোল',
    close: 'থিংজিনবা',
    recentActivity: 'লোইশিনখ্রবা থবক',
    nurtureTip: 'লৈকোন শেন্নবগী পাওタック',
    memoryTip: 'ইমুংগী ফটো য়েংবা নিংশিং মপাঙ্গল কালহনগনি।',
    cognitiveTip: 'লৌশিং শান্নবা শান্নবনা লৌশিং হেনগৎহনগনি।',
    activitiesTip: 'নুমিৎ খুদিংগী থবক লোইশিনবনা লৈকোনবু মপাঙ্গল কালহনগনি।',
    moodTip: 'নুংাইবা অমসুং শান্ত ওইবনা লৈকোনদা নুমিৎ থোকহনগনি।',
    healthTip: 'মতম চানা হিদাঅ চাবনা হকচাং ফাহনগনি।',
    noActivityYet: 'ঙসি থবক অমত্তা লোইশিন্দ্রি। অপিকপা থবক অমদগী হৌবীয়ু!'
  },
  Khasi: {
    title: 'Mind Garden',
    subtitle: 'Ki kam jong phi mynta ki pynsan ia u kper.',
    headerQuote: '“Ka jingmut kaba koit ka phuh man ka sengi”',
    signMessageHigh: 'Iaai shaid,\nu kper u san bha!',
    signMessageMed: 'Man ka mawjam\nka pynphuh ia u kper',
    signMessageLow: 'Ka jingsdang ba jai-jai',
    categories: {
      memory: 'Jingkynmaw',
      cognitive: 'Jingialehkai Mind',
      activities: 'Ki Kam Minti',
      mood: 'Jingsngew',
      health: 'Dawai bad Jingkoit'
    },
    modalTitle: 'Jingtip shaphang u Dieng',
    close: 'Khang',
    recentActivity: 'Ki Kam ba la pyndep',
    nurtureTip: 'Kine ki Jingmut pynsan',
    memoryTip: 'Peit dur ing bad kynmaw ia ki jingrwai ka pynkyndit bor jingmut.',
    cognitiveTip: 'Jingialehkai 10 minites man ka sengi ka pynshait ia ka bor mentali.',
    activitiesTip: 'Pyndep ia ki kam ba man ka sengi ka pynim ia u kper.',
    moodTip: 'Ka jingsuk u kper ka wallam shai ding sngi.',
    healthTip: 'Buh por dieng dawai bad dih um bha.',
    noActivityYet: 'Hymda pat don kam ba la pyndep mynta. Sdang na ka kam barit!'
  },
  Mizo: {
    title: 'Mind Garden',
    subtitle: 'Vawiina i beihna hian i huan a titheng thui e.',
    headerQuote: '“Rilru hrisel a par chhuak nitin e”',
    signMessageHigh: 'Kal zel rawh,\ni huan a thang mek e!',
    signMessageMed: 'Pen tin te chuan\nhuan mawi an siam',
    signMessageLow: 'Bul tanna muangchang',
    categories: {
      memory: 'Hriatrengna',
      cognitive: 'Rilru Game-te',
      activities: 'Ni Tin Routine',
      mood: 'Rilru Veivang',
      health: 'Damdawi & Routine'
    },
    modalTitle: 'Thing Chi Chanchin',
    close: 'Khar rawh',
    recentActivity: 'Thil tih zawh tawhte',
    nurtureTip: 'Chawmna Thurawn',
    memoryTip: 'Chhungkaw thlalak thlir leh hla ngaihthlak ten hriatrengna an pui.',
    cognitiveTip: 'Ni tin min 10 chhung game khelh hian rilru a tichak.',
    activitiesTip: 'Ni tin thiltih zawh hian huan par a tivul.',
    moodTip: 'Rilru muang tak leh hlim tak a awm hian ni a chhuah tir.',
    healthTip: 'Hun tak ah damdawi ei leh tui in hriselna a siam.',
    noActivityYet: 'Vawiin ah thil tih zawh a la awm lo. Bul tan rawh le!'
  },
  Nagamese: {
    title: 'Mind Garden',
    subtitle: 'Apuni laga aji laga activity pora garden bhal bane.',
    headerQuote: '“Bhal mind har din phule ase”',
    signMessageHigh: 'Aage jaikode,\ngarden growth hoikena ase!',
    signMessageMed: 'Chota step pora\ngarden ke phulaye',
    signMessageLow: 'Nawa start,\ngarden te welcome ase',
    categories: {
      memory: 'Memory',
      cognitive: 'Cognitive Games',
      activities: 'Daily Activities',
      mood: 'Mood',
      health: 'Medication'
    },
    modalTitle: 'Plant Details',
    close: 'Bandh koribi',
    recentActivity: 'Completed Activity',
    nurtureTip: 'Nurture Advice',
    memoryTip: 'Family photo chai kena aru purana gana suni kena memory bhal thake.',
    cognitiveTip: 'Daily 10 mins mind game play korile brain sharp thake.',
    activitiesTip: 'Daily task complete korile garden phulisena thake.',
    moodTip: 'Peaceful aru happy thakile garden te rop ahe.',
    healthTip: 'Time te dawai khabi aru pani khabi.',
    noActivityYet: 'Aji ekko activity kora nai. Ekta chota task pora start koribi!'
  },
  Tripuri: {
    title: 'Mind Garden',
    subtitle: 'Nini aji samung bai garden phulipha.',
    headerQuote: '“Bhal mind aji phulipha”',
    signMessageHigh: 'Aste aste growth khamdi,\ngarden growth kha!',
    signMessageMed: 'Chota step bai\ngarden phulipha',
    signMessageLow: 'Nawa morning start',
    categories: {
      memory: 'Memory',
      cognitive: 'Cognitive Games',
      activities: 'Daily Activities',
      mood: 'Mood',
      health: 'Medication'
    },
    modalTitle: 'Plant Details',
    close: 'Close',
    recentActivity: 'Completed Progress',
    nurtureTip: 'Care Advice',
    memoryTip: 'Family photo and music memory keeps memory fresh.',
    cognitiveTip: '10 mins brain game keeps brain strong.',
    activitiesTip: 'Daily task completion feeds garden flowers.',
    moodTip: 'Peaceful feeling brings sunshine to garden.',
    healthTip: 'Timely medicine keeps health leaves green.',
    noActivityYet: 'No activity completed today. Start now!'
  }
};

interface PlantDetailModalProps {
  categoryKey: 'memory' | 'cognitive' | 'activities' | 'mood' | 'health' | 'tree';
  percentage: number;
  onClose: () => void;
  lang: string;
  activitiesList: string[];
}

const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  categoryKey,
  percentage,
  onClose,
  lang,
  activitiesList
}) => {
  const dict = gardenTranslations[lang] || gardenTranslations.English;

  let title = dict.modalTitle;
  let icon = '🌳';
  let tip = dict.memoryTip;

  if (categoryKey === 'memory') {
    title = dict.categories.memory;
    icon = '🌻';
    tip = dict.memoryTip;
  } else if (categoryKey === 'cognitive') {
    title = dict.categories.cognitive;
    icon = '🌺';
    tip = dict.cognitiveTip;
  } else if (categoryKey === 'activities') {
    title = dict.categories.activities;
    icon = '🌸';
    tip = dict.activitiesTip;
  } else if (categoryKey === 'mood') {
    title = dict.categories.mood;
    icon = '🌼';
    tip = dict.moodTip;
  } else if (categoryKey === 'health') {
    title = dict.categories.health;
    icon = '🪻';
    tip = dict.healthTip;
  } else if (categoryKey === 'tree') {
    title = 'Central Heritage Tree';
    icon = '🌳';
    tip = dict.signMessageHigh;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-amber-50 via-emerald-50 to-teal-50 rounded-3xl border-4 border-amber-400 shadow-2xl max-w-md w-full p-6 relative overflow-hidden text-slate-900">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl filter drop-shadow-md">{icon}</span>
            <div>
              <h3 className="text-xl font-black text-emerald-950 tracking-tight">{title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-28 bg-emerald-200 h-2.5 rounded-full overflow-hidden border border-emerald-300">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-xs font-black text-emerald-950">{percentage}%</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-amber-200/80 text-amber-950 flex items-center justify-center hover:bg-amber-300 transition-colors font-bold shadow-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content body */}
        <div className="space-y-4 text-left">
          {/* Section 1: Recent Progress Log */}
          <div className="bg-white/90 p-4 rounded-2xl border border-emerald-200 shadow-xs">
            <h4 className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              {dict.recentActivity}
            </h4>
            {activitiesList.length > 0 ? (
              <ul className="space-y-1.5">
                {activitiesList.map((act, idx) => (
                  <li key={idx} className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs font-semibold text-slate-600 italic">
                {dict.noActivityYet}
              </p>
            )}
          </div>

          {/* Section 2: Caregiver & Self Tip */}
          <div className="bg-amber-100/90 p-4 rounded-2xl border border-amber-300 shadow-xs">
            <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider flex items-center gap-1.5 mb-1.5">
              <Info className="w-4 h-4 text-amber-800 stroke-[2.5]" />
              {dict.nurtureTip}
            </h4>
            <p className="text-xs font-medium text-amber-950 leading-relaxed">
              {tip}
            </p>
          </div>
        </div>

        {/* Bottom action button */}
        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-sm shadow-md transition-all active:scale-[0.98]"
          >
            {dict.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export const MindGarden: React.FC = () => {
  const { language } = useLanguage();
  const dict = gardenTranslations[language] || gardenTranslations.English;

  // Real metric states computed from storageService
  const [memoryScore, setMemoryScore] = useState<number>(80);
  const [cognitiveScore, setCognitiveScore] = useState<number>(100);
  const [activitiesScore, setActivitiesScore] = useState<number>(60);
  const [moodScore, setMoodScore] = useState<number>(85);
  const [healthScore, setHealthScore] = useState<number>(40);

  // Activity logs for modal details
  const [memoryLogs, setMemoryLogs] = useState<string[]>([]);
  const [cognitiveLogs, setCognitiveLogs] = useState<string[]>([]);
  const [activitiesLogs, setActivitiesLogs] = useState<string[]>([]);
  const [moodLogs, setMoodLogs] = useState<string[]>([]);
  const [healthLogs, setHealthLogs] = useState<string[]>([]);

  // Selected modal plant
  const [selectedPlant, setSelectedPlant] = useState<'memory' | 'cognitive' | 'activities' | 'mood' | 'health' | 'tree' | null>(null);

  const loadGardenData = () => {
    try {
      const schedule = storageService.getSchedule() || [];
      const reminders = storageService.getReminders() || [];
      const games = storageService.getGames() || [];
      const memories = storageService.getMemories() || [];
      const currentMood = storageService.getMood() || 'Content';

      // 1. Memory Calculation
      const memCount = memories.length;
      const favCount = memories.filter((m: any) => m.isFavorite || m.category === 'family').length;
      const memGame = games.find(g => g.gameId === 'game-1' || g.gameName?.toLowerCase().includes('memory'));
      const memBest = memGame?.bestScore || 0;
      const computedMemory = Math.min(100, Math.max(30, Math.round((memCount * 15) + (favCount * 10) + (memBest > 0 ? 35 : 15))));
      setMemoryScore(computedMemory);

      const memList: string[] = [];
      if (memCount > 0) memList.push(`${memCount} memories saved in photo journal`);
      if (favCount > 0) memList.push(`${favCount} favorite moments marked`);
      if (memBest > 0) memList.push(`Memory Match top score: ${memBest} pts`);
      if (memList.length === 0) memList.push('Add family photos or record memories to nourish');
      setMemoryLogs(memList);

      // 2. Cognitive Calculation
      const gamesPlayed = games.filter(g => (g.bestScore && g.bestScore > 0) || g.completedToday).length;
      const maxScore = Math.max(...games.map(g => g.bestScore || 0), 0);
      const maxLevel = Math.max(...games.map(g => g.unlockedLevel || 1), 1);
      const computedCognitive = Math.min(100, Math.max(25, Math.round((gamesPlayed * 15) + (maxScore > 0 ? 30 : 0) + (maxLevel * 10))));
      setCognitiveScore(computedCognitive);

      const cogList: string[] = [];
      if (gamesPlayed > 0) cogList.push(`${gamesPlayed} brain games played & active`);
      if (maxScore > 0) cogList.push(`Highest score achieved: ${maxScore} pts`);
      if (maxLevel > 1) cogList.push(`Unlocked Level ${maxLevel} challenge`);
      if (cogList.length === 0) cogList.push('Play a 5-minute brain puzzle to boost cognition');
      setCognitiveLogs(cogList);

      // 3. Daily Activities Calculation
      const completedSched = schedule.filter(s => s.completed).length;
      const totalSched = schedule.length;
      const computedActivities = totalSched > 0
        ? Math.min(100, Math.max(20, Math.round((completedSched / totalSched) * 100)))
        : 60;
      setActivitiesScore(computedActivities);

      const actList: string[] = [];
      if (totalSched > 0) {
        actList.push(`${completedSched} of ${totalSched} daily activities finished today`);
        schedule.filter(s => s.completed).slice(0, 2).forEach(s => actList.push(`✓ ${s.title}`));
      } else {
        actList.push('Morning walk & routine tasks ready in My Day');
      }
      setActivitiesLogs(actList);

      // 4. Mood & Well-being Calculation
      const completedTotal = completedSched + reminders.filter(r => r.status === 'Completed').length;
      const computedMood = Math.min(100, Math.max(40, Math.round(50 + (completedTotal * 10))));
      setMoodScore(computedMood);

      const moodList: string[] = [];
      moodList.push(`Current mood logged: ${currentMood}`);
      if (completedTotal > 0) moodList.push(`Productive state: ${completedTotal} achievements today`);
      moodList.push('Daily positivity & calm reflection');
      setMoodLogs(moodList);

      // 5. Medication & Health Calculation
      const completedRem = reminders.filter(r => r.status === 'Completed').length;
      const totalRem = reminders.length;
      const computedHealth = totalRem > 0
        ? Math.min(100, Math.max(30, Math.round((completedRem / totalRem) * 100)))
        : 75;
      setHealthScore(computedHealth);

      const healthList: string[] = [];
      if (totalRem > 0) {
        healthList.push(`${completedRem} of ${totalRem} medicines & health routines taken`);
        reminders.filter(r => r.status === 'Completed').slice(0, 2).forEach(r => healthList.push(`✓ ${r.title}`));
      } else {
        healthList.push('All health schedules monitored safely');
      }
      setHealthLogs(healthList);

    } catch (e) {
      console.warn('Error reading storageService in MindGarden:', e);
    }
  };

  useEffect(() => {
    loadGardenData();
    const interval = setInterval(loadGardenData, 2500);
    const handleStorage = () => loadGardenData();
    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Overall Progress Percentage
  const overallProgress = Math.round((memoryScore + cognitiveScore + activitiesScore + moodScore + healthScore) / 5);

  // Motivational Sign Text
  const signMessage = overallProgress >= 75
    ? dict.signMessageHigh
    : overallProgress >= 55
    ? dict.signMessageMed
    : dict.signMessageLow;

  return (
    <section className="w-full bg-white rounded-3xl border-4 border-emerald-400 shadow-2xl overflow-hidden relative text-slate-800 p-4 sm:p-6 md:p-7">
      
      {/* 1. TOP HEADER MATCHING REFERENCE IMAGE 100% */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-200">
        {/* Left Side: Leaf Icon + Mind Garden Title + Subtitle */}
        <div className="flex items-center gap-3">
          <span className="text-3xl sm:text-4xl filter drop-shadow-xs">🌱</span>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight drop-shadow-xs">
              {dict.title}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
              {dict.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Floating Script Quote in Emerald Pill Container */}
        <div className="self-stretch sm:self-auto text-right">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 shadow-2xs">
            <span className="text-emerald-700 text-sm sm:text-base">🍃</span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 italic tracking-wide">
              {dict.headerQuote}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN VIRTUAL GARDEN VIEWPORT WITH EXACT REFERENCE ILLUSTRATION & OVERLAY PLAQUES */}
      <div className="relative w-full aspect-[4/3.4] sm:aspect-[16/10.5] rounded-2xl overflow-hidden border-2 border-amber-800/40 shadow-inner flex items-center justify-center select-none">
        
        {/* Exact Illustrated Reference Background Image */}
        <img 
          src="/mind_garden_bg.jpg" 
          alt="Mind Garden Landscape" 
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* CENTRAL TREE CLICK AREA */}
        <div 
          onClick={() => setSelectedPlant('tree')}
          className="absolute top-[12%] left-[28%] right-[28%] bottom-[48%] cursor-pointer z-10 group"
          title="Central Heritage Tree"
        />

        {/* CENTRAL WOODEN SIGNPOST (DYNAMIC OVERLAY) */}
        <div className="absolute top-[53%] sm:top-[59%] lg:top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-auto">
          <div 
            onClick={() => setSelectedPlant('tree')}
            className="bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#d97706] border-2 sm:border-4 border-[#78350f] rounded-xl sm:rounded-2xl shadow-2xl px-2.5 py-1.5 sm:px-7 sm:py-3.5 text-center min-w-[130px] xs:min-w-[155px] sm:min-w-[220px] max-w-[200px] sm:max-w-xs transition-transform hover:scale-105 cursor-pointer relative"
          >
            <p className="text-[10px] xs:text-xs sm:text-base font-black text-[#451a03] tracking-wide whitespace-pre-line leading-tight drop-shadow-xs">
              {signMessage}
            </p>
            {/* Red Heart Accent on bottom-right corner */}
            <span className="absolute -bottom-1 -right-1 text-xs sm:text-lg leading-none">❤️</span>
          </div>
        </div>

        {/* LEFT DECORATIVE MOTIVATIONAL WOODEN SIGN (UPPER-LEFT MOUNTAIN/SKY REGION) */}
        <div className="hidden sm:flex absolute sm:top-[10%] lg:top-[10%] left-[16%] md:left-[18%] lg:left-[20%] -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center pointer-events-none">
          <div className="bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#d97706] border-2 sm:border-3 border-[#78350f] rounded-xl sm:rounded-2xl shadow-xl px-2.5 py-1.5 sm:px-4 sm:py-2 text-center min-w-[130px] sm:min-w-[155px] md:min-w-[170px] max-w-[180px] relative">
            <p className="text-[10px] sm:text-xs font-black text-[#451a03] tracking-wide leading-tight drop-shadow-xs whitespace-pre-line">
              {"Small Steps\nMake a Big Difference!"}
            </p>
            {/* Green Leaf Accent on bottom center */}
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-xs sm:text-sm leading-none">🍃</span>
          </div>
        </div>

        {/* RIGHT DECORATIVE MOTIVATIONAL WOODEN SIGN (UPPER-RIGHT MOUNTAIN/SKY REGION) */}
        <div className="hidden sm:flex absolute sm:top-[10%] lg:top-[10%] right-[16%] md:right-[18%] lg:right-[20%] translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center pointer-events-none">
          <div className="bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#d97706] border-2 sm:border-3 border-[#78350f] rounded-xl sm:rounded-2xl shadow-xl px-2.5 py-1.5 sm:px-4 sm:py-2 text-center min-w-[130px] sm:min-w-[155px] md:min-w-[170px] max-w-[180px] relative">
            <p className="text-[10px] sm:text-xs font-black text-[#451a03] tracking-wide leading-tight drop-shadow-xs whitespace-pre-line">
              {"A Brighter\nMind Tomorrow!"}
            </p>
            {/* Green Leaf Accent on bottom center */}
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-xs sm:text-sm leading-none">🍃</span>
          </div>
        </div>

        {/* FIVE CATEGORY PLANTS & WOODEN STAKE PLAQUES */}

        {/* 1. Memory (Top-Left on Mobile, Mid-Left Sunflower Area on Desktop) */}
        <div 
          onClick={() => setSelectedPlant('memory')}
          className="absolute top-[3%] sm:top-[56%] lg:top-[55%] left-[1.5%] sm:left-[4%] lg:left-[6%] sm:-translate-y-1/2 z-20 cursor-pointer group flex flex-col items-center transition-transform hover:scale-105"
        >
          <div className="bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#f59e0b] border border-[#78350f] sm:border-2 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg px-1.5 xs:px-2 sm:px-4 py-0.5 sm:py-2 w-[32vw] min-w-[92px] max-w-[145px] sm:w-auto sm:min-w-[180px] md:min-w-[210px] sm:max-w-none flex flex-col items-center gap-0.5 sm:gap-1">
            <div className="flex items-center justify-between gap-0.5 sm:gap-2 w-full">
              <span className="text-[8px] xs:text-[9.5px] sm:text-sm font-black text-[#451a03] flex items-center gap-0.5 sm:gap-1.5 min-w-0 truncate">
                <span className="flex-shrink-0">🧠</span>
                <span className="truncate">{dict.categories.memory}</span>
              </span>
              <span className="text-[7.5px] xs:text-[9px] sm:text-sm font-black text-[#451a03] font-mono flex-shrink-0 ml-auto pl-0.5">
                {memoryScore}%
              </span>
            </div>
            {/* Animated Capsule Progress Bar */}
            <div className="w-full bg-white/90 rounded-full h-1 sm:h-2.5 p-0.5 border border-[#92400e] overflow-hidden flex items-center">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${memoryScore}%` }} 
              />
            </div>
          </div>
        </div>

        {/* 2. Cognitive Games (Top-Right on Mobile, Mid-Right Hibiscus Area on Desktop) */}
        <div 
          onClick={() => setSelectedPlant('cognitive')}
          className="absolute top-[3%] sm:top-[56%] lg:top-[55%] right-[1.5%] sm:right-[4%] lg:right-[6%] sm:-translate-y-1/2 z-20 cursor-pointer group flex flex-col items-center transition-transform hover:scale-105"
        >
          <div className="bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#f59e0b] border border-[#78350f] sm:border-2 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg px-1.5 xs:px-2 sm:px-4 py-0.5 sm:py-2 w-[34vw] min-w-[98px] max-w-[155px] sm:w-auto sm:min-w-[185px] md:min-w-[215px] sm:max-w-none flex flex-col items-center gap-0.5 sm:gap-1">
            <div className="flex items-center justify-between gap-0.5 sm:gap-2 w-full">
              <span className="text-[8px] xs:text-[9.5px] sm:text-sm font-black text-[#451a03] flex items-center gap-0.5 sm:gap-1.5 min-w-0 leading-tight">
                <span className="flex-shrink-0">🎮</span>
                <span className="truncate sm:whitespace-normal">{dict.categories.cognitive}</span>
              </span>
              <span className="text-[7.5px] xs:text-[9px] sm:text-sm font-black text-[#451a03] font-mono flex-shrink-0 ml-auto pl-0.5">
                {cognitiveScore}%
              </span>
            </div>
            {/* Animated Capsule Progress Bar */}
            <div className="w-full bg-white/90 rounded-full h-1 sm:h-2.5 p-0.5 border border-[#92400e] overflow-hidden flex items-center">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${cognitiveScore}%` }} 
              />
            </div>
          </div>
        </div>

        {/* 3. Daily Activities (Middle-Low on Mobile, Bottom-Left on Desktop) */}
        <div 
          onClick={() => setSelectedPlant('activities')}
          className="absolute top-[71%] sm:top-auto sm:bottom-[6%] left-1/2 -translate-x-1/2 sm:left-[4%] lg:left-[6%] sm:translate-x-0 z-20 cursor-pointer group flex flex-col items-center transition-transform hover:scale-105"
        >
          <div className="bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#f59e0b] border border-[#78350f] sm:border-2 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg px-1.5 xs:px-2 sm:px-4 py-0.5 sm:py-2 w-[56vw] min-w-[135px] max-w-[210px] sm:w-auto sm:min-w-[185px] md:min-w-[215px] sm:max-w-none flex flex-col items-center gap-0.5 sm:gap-1">
            <div className="flex items-center justify-between gap-0.5 sm:gap-2 w-full">
              <span className="text-[8.5px] xs:text-[10px] sm:text-sm font-black text-[#451a03] flex items-center gap-0.5 sm:gap-1.5 min-w-0 leading-tight">
                <span className="flex-shrink-0">☀️</span>
                <span className="truncate sm:whitespace-normal">{dict.categories.activities}</span>
              </span>
              <span className="text-[7.5px] xs:text-[9px] sm:text-sm font-black text-[#451a03] font-mono flex-shrink-0 ml-auto pl-0.5">
                {activitiesScore}%
              </span>
            </div>
            {/* Animated Capsule Progress Bar */}
            <div className="w-full bg-white/90 rounded-full h-1 sm:h-2.5 p-0.5 border border-[#92400e] overflow-hidden flex items-center">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${activitiesScore}%` }} 
              />
            </div>
          </div>
        </div>

        {/* 4. Mood (Bottom-Left on Mobile, Bottom-Center on Desktop) */}
        <div 
          onClick={() => setSelectedPlant('mood')}
          className="absolute bottom-[2%] sm:bottom-[4%] left-[1.5%] sm:left-1/2 sm:-translate-x-1/2 z-20 cursor-pointer group flex flex-col items-center transition-transform hover:scale-105"
        >
          <div className="bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#f59e0b] border border-[#78350f] sm:border-2 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg px-1.5 xs:px-2 sm:px-4 py-0.5 sm:py-2 w-[36vw] min-w-[92px] max-w-[145px] sm:w-auto sm:min-w-[165px] md:min-w-[195px] sm:max-w-none flex flex-col items-center gap-0.5 sm:gap-1">
            <div className="flex items-center justify-between gap-0.5 sm:gap-2 w-full">
              <span className="text-[8px] xs:text-[9.5px] sm:text-sm font-black text-[#451a03] flex items-center gap-0.5 sm:gap-1.5 min-w-0 truncate">
                <span className="flex-shrink-0">😊</span>
                <span className="truncate">{dict.categories.mood}</span>
              </span>
              <span className="text-[7.5px] xs:text-[9px] sm:text-sm font-black text-[#451a03] font-mono flex-shrink-0 ml-auto pl-0.5">
                {moodScore}%
              </span>
            </div>
            {/* Animated Capsule Progress Bar */}
            <div className="w-full bg-white/90 rounded-full h-1 sm:h-2.5 p-0.5 border border-[#92400e] overflow-hidden flex items-center">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${moodScore}%` }} 
              />
            </div>
          </div>
        </div>

        {/* 5. Medication (Bottom-Right on Mobile & Desktop) */}
        <div 
          onClick={() => setSelectedPlant('health')}
          className="absolute bottom-[2%] sm:bottom-[6%] right-[1.5%] sm:right-[4%] lg:right-[6%] sm:top-auto sm:translate-y-0 z-20 cursor-pointer group flex flex-col items-center transition-transform hover:scale-105"
        >
          <div className="bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#f59e0b] border border-[#78350f] sm:border-2 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg px-1.5 xs:px-2 sm:px-4 py-0.5 sm:py-2 w-[36vw] min-w-[92px] max-w-[145px] sm:w-auto sm:min-w-[180px] md:min-w-[210px] sm:max-w-none flex flex-col items-center gap-0.5 sm:gap-1">
            <div className="flex items-center justify-between gap-0.5 sm:gap-2 w-full">
              <span className="text-[8px] xs:text-[9.5px] sm:text-sm font-black text-[#451a03] flex items-center gap-0.5 sm:gap-1.5 min-w-0 truncate">
                <span className="flex-shrink-0">💊</span>
                <span className="truncate">{dict.categories.health}</span>
              </span>
              <span className="text-[7.5px] xs:text-[9px] sm:text-sm font-black text-[#451a03] font-mono flex-shrink-0 ml-auto pl-0.5">
                {healthScore}%
              </span>
            </div>
            {/* Animated Capsule Progress Bar */}
            <div className="w-full bg-white/90 rounded-full h-1 sm:h-2.5 p-0.5 border border-[#92400e] overflow-hidden flex items-center">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${healthScore}%` }} 
              />
            </div>
          </div>
        </div>

      </div>

      {/* 3. INTERACTIVE PLANT DETAIL MODAL */}
      {selectedPlant && (
        <PlantDetailModal
          categoryKey={selectedPlant}
          percentage={
            selectedPlant === 'memory'
              ? memoryScore
              : selectedPlant === 'cognitive'
              ? cognitiveScore
              : selectedPlant === 'activities'
              ? activitiesScore
              : selectedPlant === 'mood'
              ? moodScore
              : selectedPlant === 'health'
              ? healthScore
              : overallProgress
          }
          activitiesList={
            selectedPlant === 'memory'
              ? memoryLogs
              : selectedPlant === 'cognitive'
              ? cognitiveLogs
              : selectedPlant === 'activities'
              ? activitiesLogs
              : selectedPlant === 'mood'
              ? moodLogs
              : selectedPlant === 'health'
              ? healthLogs
              : [dict.signMessageHigh]
          }
          onClose={() => setSelectedPlant(null)}
          lang={language}
        />
      )}
    </section>
  );
};
