import React, { useState, useEffect } from 'react';
import { CheckCircle, RotateCcw, ArrowLeft, Trophy, Lock, Target, Flame, Info, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { storageService } from '../services/storageService';
import type { GameScore } from '../data/demoData';
import { apiClient } from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';
import { getDailyCognitiveSelection } from '../data/northeastCognitiveDataset';
import { SVGBrain } from '../components/SVGIcons';

// Custom SVGs matching the exact visual style of reference image
const SVGBrainGame = ({ className = "w-12 h-12 flex-shrink-0" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className}>
    {/* Background Glow */}
    <circle cx="24" cy="24" r="22" fill="#f3e8ff" />
    
    {/* Back Card (Tilted Purple Card) */}
    <g transform="rotate(-12 24 24)">
      <rect x="14" y="10" width="20" height="26" rx="4" fill="#a855f7" stroke="#7e22ce" strokeWidth="1.5" />
      <circle cx="24" cy="23" r="5" fill="#c084fc" />
    </g>
    
    {/* Front Card (Main Violet Card with Heart) */}
    <g transform="rotate(6 24 24)">
      <rect x="15" y="11" width="20" height="26" rx="4" fill="#7c3aed" stroke="#5b21b6" strokeWidth="1.5" />
      {/* Heart Symbol */}
      <path d="M25 19 C25 17 23 16 21.5 17.5 C20 16 18 17 18 19 C18 21.5 21.5 24 21.5 24 C21.5 24 25 21.5 25 19 Z" fill="#ffffff" />
      {/* Top Left Mini Accent */}
      <circle cx="18" cy="14" r="1" fill="#ddd6fe" />
    </g>
  </svg>
);

const SVGSequenceGame = ({ className = "w-12 h-12 flex-shrink-0" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className}>
    {/* Background Glow */}
    <circle cx="24" cy="24" r="22" fill="#ccfbf1" />
    
    {/* Block 1 (Teal) */}
    <rect x="6" y="26" width="12" height="14" rx="3" fill="#0d9488" stroke="#0f766e" strokeWidth="1.5" />
    <text x="12" y="35" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" dominantBaseline="middle">1</text>
    
    {/* Block 2 (Emerald) */}
    <rect x="18" y="18" width="12" height="14" rx="3" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
    <text x="24" y="27" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" dominantBaseline="middle">2</text>
    
    {/* Block 3 (Bright Green) */}
    <rect x="30" y="10" width="12" height="14" rx="3" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
    <text x="36" y="19" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" dominantBaseline="middle">3</text>
    
    {/* Connecting Progression Arrow */}
    <path d="M12 24 C18 20 18 16 24 16 C30 16 30 10 36 8" stroke="#059669" strokeWidth="2" strokeDasharray="3 2" fill="none" strokeLinecap="round" />
  </svg>
);

const SVGAttentionGame = ({ className = "w-12 h-12 flex-shrink-0" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className}>
    {/* Background Glow */}
    <circle cx="24" cy="24" r="22" fill="#ffedd5" />
    
    {/* Card 1 (Normal Image Card) */}
    <rect x="7" y="12" width="15" height="24" rx="3" fill="#ffffff" stroke="#fb923c" strokeWidth="1.5" />
    <circle cx="14.5" cy="20" r="3.5" fill="#f97316" />
    <path d="M10 30 L13 25 L16 28 L19 23 L20 30 Z" fill="#fdba74" />
    
    {/* Card 2 (Spot Difference Image Card with highlight ring) */}
    <rect x="26" y="12" width="15" height="24" rx="3" fill="#ffffff" stroke="#ea580c" strokeWidth="2" />
    <circle cx="33.5" cy="20" r="3.5" fill="#ea580c" />
    <path d="M29 30 L32 25 L35 28 L38 23 L39 30 Z" fill="#fdba74" />
    
    {/* Difference Spot Light Pulse */}
    <circle cx="33.5" cy="20" r="6" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
    <path d="M37.5 13.5 L41.5 9.5" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SVGObjectGame = ({ className = "w-12 h-12 flex-shrink-0" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className}>
    {/* Background Glow */}
    <circle cx="24" cy="24" r="22" fill="#e0f2fe" />
    
    {/* Target Object Below Lens (Star) */}
    <polygon points="20,12 22,17 27,17 23,20 25,25 20,22 15,25 17,20 13,17 18,17" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
    
    {/* Magnifying Glass Lens */}
    <circle cx="22" cy="20" r="11" fill="#38bdf8" fillOpacity="0.3" stroke="#0284c7" strokeWidth="2.5" />
    {/* Glass Rim Glare */}
    <path d="M15 15 A8 8 0 0 1 27 15" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    
    {/* Handle */}
    <line x1="30" y1="28" x2="40" y2="38" stroke="#0369a1" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="30" y1="28" x2="40" y2="38" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SVGRoutineGame = ({ className = "w-12 h-12 flex-shrink-0" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className}>
    {/* Background Glow */}
    <circle cx="24" cy="24" r="22" fill="#ffe4e6" />
    
    {/* Calendar Card Body */}
    <rect x="10" y="10" width="28" height="30" rx="4" fill="#ffffff" stroke="#f43f5e" strokeWidth="2" />
    {/* Top Pink Banner */}
    <path d="M10 14 C10 11.7 11.7 10 14 10 H34 C36.3 10 38 11.7 38 14 V18 H10 V14 Z" fill="#fb7185" />
    
    {/* Spiral Rings */}
    <rect x="16" y="7" width="2.5" height="6" rx="1" fill="#9f1239" />
    <rect x="29.5" y="7" width="2.5" height="6" rx="1" fill="#9f1239" />
    
    {/* Checkmarks List */}
    <path d="M15 24 L18 27 L23 21" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="26" y1="24" x2="33" y2="24" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
    
    <path d="M15 32 L18 35 L23 29" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="26" y1="32" x2="33" y2="32" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SVGLanguageGame = ({ className = "w-12 h-12 flex-shrink-0" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className}>
    {/* Background Glow */}
    <circle cx="24" cy="24" r="22" fill="#dbeafe" />
    
    {/* Open Blue Book Cover & Pages */}
    <path d="M6 34 C12 30 19 30 24 33 C29 30 36 30 42 34 V16 C36 12 29 12 24 15 C19 12 12 12 6 16 Z" fill="#ffffff" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" />
    
    {/* Book Spine */}
    <line x1="24" y1="15" x2="24" y2="33" stroke="#1d4ed8" strokeWidth="2" />
    
    {/* Left Page Text Lines */}
    <line x1="11" y1="20" x2="19" y2="20" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="11" y1="24" x2="19" y2="24" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="11" y1="28" x2="17" y2="28" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Right Page Text Lines */}
    <line x1="29" y1="20" x2="37" y2="20" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="29" y1="24" x2="37" y2="24" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="29" y1="28" x2="35" y2="28" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Story Sparkle / Star Above Book */}
    <path d="M24 6 L25.5 9 L29 10.5 L25.5 12 L24 15 L22.5 12 L19 10.5 L22.5 9 Z" fill="#f59e0b" />
  </svg>
);

interface GameScoreWithLevel extends GameScore {
  unlockedLevel?: number;
}

const AchievementTrophy: React.FC<{ score: number; className?: string }> = ({ score, className = "w-5 h-5" }) => {
  if (score >= 100) {
    return (
      <div className="relative inline-flex items-center justify-center p-1.5 rounded-full bg-gradient-to-tr from-amber-200 via-amber-100 to-yellow-200 border border-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.45)] animate-pulse" style={{ animationDuration: '3s' }} title={`Gold Trophy (Score: ${score})`}>
        <Trophy className={`${className} text-amber-500 fill-yellow-400 stroke-amber-600`} />
      </div>
    );
  }
  if (score >= 66) {
    return (
      <div className="relative inline-flex items-center justify-center p-1.5 rounded-full bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-300 border border-slate-300 shadow-xs" title={`Silver Trophy (Score: ${score})`}>
        <Trophy className={`${className} text-slate-400 fill-slate-300 stroke-slate-500`} />
      </div>
    );
  }
  if (score >= 40) {
    return (
      <div className="relative inline-flex items-center justify-center p-1.5 rounded-full bg-gradient-to-tr from-amber-900/10 via-amber-800/10 to-amber-700/20 border border-amber-700/40 shadow-[0_0_8px_rgba(180,83,9,0.25)]" title={`Bronze Trophy (Score: ${score})`}>
        <Trophy className={`${className} text-amber-700 fill-amber-600/80 stroke-amber-800`} />
      </div>
    );
  }
  return (
    <div className="relative inline-flex items-center justify-center p-1 rounded-full bg-slate-100 border border-slate-200 opacity-60" title={`Unranked (Score: ${score})`}>
      <Trophy className={`${className} text-slate-300 fill-slate-100 stroke-slate-400`} />
    </div>
  );
};

const levelMetadata: Record<number, { titleKey: string; diffKey: string; descKey: string; emoji: string }> = {
  1: {
    titleKey: 'Getting Started',
    diffKey: 'Easy',
    descKey: 'Build your confidence with gentle exercises',
    emoji: '🌱'
  },
  2: {
    titleKey: 'Challenge Yourself',
    diffKey: 'Medium',
    descKey: 'Ready for more? Test your memory agility',
    emoji: '🌟'
  },
  3: {
    titleKey: 'Focus Builder',
    diffKey: 'Intermediate',
    descKey: 'Sharpen your attention & recall speed',
    emoji: '⚡'
  },
  4: {
    titleKey: 'Mastery Level',
    diffKey: 'Advanced',
    descKey: 'Train complex pattern recognition',
    emoji: '🔥'
  },
  5: {
    titleKey: 'Grand Champion',
    diffKey: 'Expert',
    descKey: 'Maximum cognitive agility test',
    emoji: '👑'
  }
};

// Daily Routine Recall Pool (Logical sequences)
const routineEvents = [
  { id: 'wakeup', label: 'Wake Up', order: 1, emoji: '🌅' },
  { id: 'brush', label: 'Brush Teeth', order: 2, emoji: '🪥' },
  { id: 'breakfast', label: 'Breakfast', order: 3, emoji: '🍳' },
  { id: 'medicine', label: 'Take Medicine', order: 4, emoji: '💊' },
  { id: 'walk', label: 'Evening Walk', order: 5, emoji: '🚶' },
  { id: 'dinner', label: 'Dinner', order: 6, emoji: '🍽️' },
  { id: 'sleep', label: 'Go to Sleep', order: 7, emoji: '💤' }
];

const demoTranslations: Record<string, any> = {
  English: {
    'game-1': {
      title: 'How to Play Memory Match',
      steps: [
        { sub: '👀 LOOK', desc: 'Look at the grid of face-down cards.' },
        { sub: '👆 TAP ONE CARD', desc: 'Tap a card to turn it over.' },
        { sub: '👆 TAP A SECOND CARD', desc: 'Tap another card. Try to find the matching symbol.' },
        { sub: '⭐ MATCH & WIN', desc: 'Matched pairs stay open. Match them all to finish!' }
      ]
    },
    'game-2': {
      title: 'How to Play Sequence & Order',
      steps: [
        { sub: '👀 OBSERVE ORDER', desc: 'Watch closely as a sequence of items is shown.' },
        { sub: '🧠 REMEMBER', desc: 'Try to commit the sequence order to memory.' },
        { sub: '👆 TAP CHRONOLOGICALLY', desc: 'Tap the options to place them in the correct order.' },
        { sub: '⭐ COMPLETE SEQUENCE', desc: 'Place all items correctly to win points.' }
      ]
    },
    'game-3': {
      title: 'How to Play Attention Focus',
      steps: [
        { sub: '👀 SCAN GRID', desc: 'Scan the grid of similar objects.' },
        { sub: '🧠 FIND ODD ONE', desc: 'Look for the single object that is different from the rest.' },
        { sub: '👆 TAP ODD OBJECT', desc: 'Tap the card showing the odd object.' },
        { sub: '⭐ CORRECT SELECTION', desc: 'Find the odd one in each round to train focus.' }
      ]
    },
    'game-4': {
      title: 'How to Play Object Recognition',
      steps: [
        { sub: '👀 LOOK AT TARGET', desc: 'Look at the visual object shown in the center.' },
        { sub: '🧠 READ CHOICES', desc: 'Read the text options at the bottom of the card.' },
        { sub: '👆 COMPARE & TAP', desc: 'Tap the text choice that matches the object.' },
        { sub: '⭐ FINISH ROUNDS', desc: 'Complete all rounds to get your accuracy score.' }
      ]
    },
    'game-5': {
      title: 'How to Play Daily Routine Recall',
      steps: [
        { sub: '👀 LOOK AT ITEMS', desc: 'Look at the random sequence of daily events.' },
        { sub: '🧠 THINK ORDER', desc: 'Arrange them from morning activities to night.' },
        { sub: '👆 SELECT PROGRESSIVELY', desc: 'Tap the events in their logical daily order.' },
        { sub: '⭐ COMPLETE DAY', desc: 'Correctly order the full routine to complete the exercise.' }
      ]
    },
    'game-6': {
      title: 'How to Play Language Word Memory',
      steps: [
        { sub: '👀 READ WORDS', desc: 'Read the list of words shown on the screen.' },
        { sub: '🧠 MEMORIZE', desc: 'Remember them before the timer runs out.' },
        { sub: '👆 SELECT FROM LIST', desc: 'Tap the words that were in the original list.' },
        { sub: '⭐ SUBMIT & CHECK', desc: 'Click Submit Choices to verify your memory.' }
      ]
    }
  },
  Hindi: {
    'game-1': {
      title: 'मेजोरी मैच कैसे खेलें',
      steps: [
        { sub: '👀 देखें', desc: 'कार्डों की ग्रिड को देखें जो पीछे की तरफ मुड़े हैं।' },
        { sub: '👆 एक कार्ड छुएं', desc: 'कार्ड को पलटने के लिए छुएं।' },
        { sub: '👆 दूसरा कार्ड छुएं', desc: 'दूसरा कार्ड छुएं। समान वस्तु खोजने का प्रयास करें।' },
        { sub: '⭐ मिलान और जीत', desc: 'समान जोड़े खुले रहेंगे। समाप्त करने के लिए सभी का मिलान करें!' }
      ]
    },
    'game-2': {
      title: 'सीक्वेंस और ऑर्डर कैसे खेलें',
      steps: [
        { sub: '👀 अनुक्रम देखें', desc: 'दिखाए जा रहे वस्तुओं के अनुक्रम को ध्यान से देखें।' },
        { sub: '🧠 याद रखें', desc: 'अनुक्रम को याद रखने का प्रयास करें।' },
        { sub: '👆 क्रम से छुएं', desc: 'उन्हें सही क्रम में व्यवस्थित करने के लिए विकल्पों पर टैप करें।' },
        { sub: '⭐ अनुक्रम पूर्ण करें', desc: 'अंक जीतने के लिए सभी वस्तुओं को सही स्थान पर रखें।' }
      ]
    },
    'game-3': {
      title: 'अटेंशन फोकस कैसे खेलें',
      steps: [
        { sub: '👀 ग्रिड को स्कैन करें', desc: 'एक जैसी वस्तुओं के ग्रिड को ध्यान से देखें।' },
        { sub: '🧠 अलग खोजें', desc: 'उस एक वस्तु को खोजें जो बाकी सभी से अलग हो।' },
        { sub: '👆 अलग वस्तु को छुएं', desc: 'उस कार्ड को छुएं जो अलग हो।' },
        { sub: '⭐ सही चयन', desc: 'ध्यान केंद्रित करने के अभ्यास के लिए हर दौर में अलग वस्तु खोजें।' }
      ]
    },
    'game-4': {
      title: 'ऑब्जेक्ट रिकग्निशन कैसे खेलें',
      steps: [
        { sub: '👀 वस्तु को देखें', desc: 'केंद्र में दिखाई गई वस्तु को देखें।' },
        { sub: '🧠 विकल्प पढ़ें', desc: 'कार्ड के नीचे दिए गए पाठ विकल्पों को पढ़ें।' },
        { sub: '👆 तुलना करें और छुएं', desc: 'उस विकल्प को छुएं जो वस्तु से मेल खाता हो।' },
        { sub: '⭐ दौर समाप्त करें', desc: 'सटीकता स्कोर प्राप्त करने के लिए सभी दौर पूरे करें।' }
      ]
    },
    'game-5': {
      title: 'डेली रूटीन रिकॉल कैसे खेलें',
      steps: [
        { sub: '👀 गतिविधियाँ देखें', desc: 'दिनचर्या के यादृच्छिक क्रम को देखें।' },
        { sub: '🧠 क्रम सोचें', desc: 'उन्हें सुबह की गतिविधियों से रात तक के क्रम में सोचें।' },
        { sub: '👆 सही क्रम में चुनें', desc: 'गतिविधियों को उनके तार्किक दैनिक क्रम में टैप करें।' },
        { sub: '⭐ दिन पूर्ण करें', desc: 'अभ्यास पूरा करने के लिए पूरी दिनचर्या को व्यवस्थित करें।' }
      ]
    },
    'game-6': {
      title: 'लैंग्वेज वर्ड मेमोरी कैसे खेलें',
      steps: [
        { sub: '👀 शब्द पढ़ें', desc: 'स्क्रीन पर दिखाए गए शब्दों की सूची को पढ़ें।' },
        { sub: '🧠 याद रखें', desc: 'समय समाप्त होने से पहले उन्हें याद रखें।' },
        { sub: '👆 सूची से चुनें', desc: 'उन शब्दों को छुएं जो मूल सूची में थे।' },
        { sub: '⭐ सबमिट और जांच', desc: 'सत्यापन के लिए विकल्प सबमिट करें।' }
      ]
    }
  },
  Bengali: {
    'game-1': {
      title: 'কীভাবে মেমরি ম্যাচ খেলবেন',
      steps: [
        { sub: '👀 দেখুন', desc: 'উল্টানো কার্ডের গ্রিডের দিকে তাকান।' },
        { sub: '👆 একটি কার্ড ট্যাপ করুন', desc: 'কার্ডটি উল্টাতে ট্যাপ করুন।' },
        { sub: '👆 দ্বিতীয় কার্ড ট্যাপ করুন', desc: 'অন্য একটি কার্ড ট্যাপ করুন। একই প্রতীক খোঁজার চেষ্টা করুন।' },
        { sub: '⭐ মিল ও জয়', desc: 'মিলে যাওয়া জোড়াগুলি খোলা থাকবে। জিততে সব মেলাও!' }
      ]
    },
    'game-2': {
      title: 'কীভাবে সিকোয়েন্স অ্যান্ড অর্ডার খেলবেন',
      steps: [
        { sub: '👀 ক্রমটি লক্ষ্য করুন', desc: 'দেখানো সিকোয়েন্সটি মনোযোগ দিয়ে দেখুন।' },
        { sub: '🧠 মনে রাখুন', desc: 'ক্রমটি স্মৃতিতে ধরে রাখার চেষ্টা করুন।' },
        { sub: '👆 পর্যায়ক্রমে ট্যাপ করুন', desc: 'সঠিক ক্রমে সাজাতে অপশনগুলিতে ট্যাপ করুন।' },
        { sub: '⭐ সিকোয়েন্স সম্পূর্ণ করুন', desc: 'পয়েন্ট জিততে সবগুলি সঠিকভাবে সাজান।' }
      ]
    },
    'game-3': {
      title: 'কীভাবে অ্যাটেনশন ফোকাস খেলবেন',
      steps: [
        { sub: '👀 গ্রিডটি লক্ষ্য করুন', desc: 'গ্রিডে থাকা একই ধরনের বস্তুগুলি দেখুন।' },
        { sub: '🧠 ভিন্নটি খুঁজুন', desc: 'বাকিগুলির থেকে আলাদা ১টি ভিন্ন বস্তু খুঁজুন।' },
        { sub: '👆 ভিন্নটিতে ট্যাপ করুন', desc: 'ভিন্ন বস্তুটির কার্ডে ট্যাপ করুন।' },
        { sub: '⭐ সঠিক নির্বাচন', desc: 'মনোযোগ বাড়াতে প্রতিটি রাউন্ডে ভিন্ন বস্তুটি খুঁজুন।' }
      ]
    },
    'game-4': {
      title: 'কীভাবে অবজেক্ট রিকগনিশন খেলবেন',
      steps: [
        { sub: '👀 বস্তুটি দেখুন', desc: 'মাঝখানে দেখানো বস্তুটি দেখুন।' },
        { sub: '🧠 অপশনগুলি পড়ুন', desc: 'কার্ডের নিচে থাকা লেখার অপশনগুলি পড়ুন।' },
        { sub: '👆 তুলনা ও ট্যাপ', desc: 'বস্তুটির সাথে মিলে যাওয়া অপশনটিতে ট্যাপ করুন।' },
        { sub: '⭐ রাউন্ড সম্পূর্ণ করুন', desc: 'সঠিকতা স্কোর দেখতে সব রাউন্ড সম্পূর্ণ করুন।' }
      ]
    },
    'game-5': {
      title: 'কীভাবে ডেইলি রুটিন রিকল খেলবেন',
      steps: [
        { sub: '👀 কাজগুলি দেখুন', desc: 'উল্টোপাল্টা ক্রমে থাকা কাজগুলি দেখুন।' },
        { sub: '🧠 ক্রমটি ভাবুন', desc: 'সকাল থেকে রাত অনুযায়ী সাজানোর কথা ভাবুন।' },
        { sub: '👆 ক্রমে ট্যাপ করুন', desc: 'যৌক্তিক ক্রমে কাজগুলিতে ট্যাপ করুন।' },
        { sub: '⭐ দিনটি সম্পূর্ণ করুন', desc: 'রুটিনটি সঠিকভাবে সাজিয়ে কাজ সম্পন্ন করুন।' }
      ]
    },
    'game-6': {
      title: 'কীভাবে ল্যাঙ্গুয়েজ ওয়ার্ড মেমরি খেলবেন',
      steps: [
        { sub: '👀 শব্দগুলি পড়ুন', desc: 'পর্দায় দেখানো শব্দগুলির তালিকা পড়ুন।' },
        { sub: '🧠 মনে রাখুন', desc: 'সময় শেষ হওয়ার আগে এগুলি মনে রাখার চেষ্টা করুন।' },
        { sub: '👆 তালিকা থেকে বাছুন', desc: 'মূল তালিকায় থাকা শব্দগুলিতে ট্যাপ করুন।' },
        { sub: '⭐ সাবমিট ও পরীক্ষা', desc: 'যাচাই করতে সাবমিট বোতামে ক্লিক করুন।' }
      ]
    }
  },
  Assamese: {
    'game-1': {
      title: 'স্মৃতি সংযোগ কেনেকৈ খেলিব',
      steps: [
        { sub: '👀 চাওক', desc: 'উল্টাই থোৱা কাৰ্ডবোৰৰ গ্ৰিডখন চাওক।' },
        { sub: '👆 এটা কাৰ্ড স্পৰ্শ কৰক', desc: 'এটা কাৰ্ড লুটিয়াই দিবলৈ স্পৰ্শ কৰক।' },
        { sub: '👆 দ্বিতীয় কাৰ্ড স্পৰ্শ কৰক', desc: 'আন এটা কাৰ্ড স্পৰ্শ কৰক। একে ধৰণৰ প্ৰতীক বিচাৰিবলৈ চেষ্টা কৰক।' },
        { sub: '⭐ মিলন আৰু জয়', desc: 'মিলা জোৰাবোৰ খোলা থাকিব। শেষ কৰিবলৈ সকলোবোৰ মিলাওক!' }
      ]
    },
    'game-2': {
      title: 'ক্ৰম আৰু ক্ৰমাংকন কেনেকৈ খেলিব',
      steps: [
        { sub: '👀 ক্ৰম নিৰীক্ষণ কৰক', desc: 'দেখুৱাই থকা বস্তুবোৰৰ ক্ৰমটো মনোযোগেৰে চাওক।' },
        { sub: '🧠 মনত ৰাখক', desc: 'ক্ৰমটো মনত ৰাখিবলৈ চেষ্টা কৰক।' },
        { sub: '👆 ক্ৰম অনুসৰি স্পৰ্শ কৰক', desc: 'বস্তুবোৰ সঠিক ক্ৰমত সজাবলৈ টিপক।' },
        { sub: '⭐ ক্ৰম সম্পূৰ্ণ কৰক', desc: 'পইণ্ট পাবলৈ সকলোবোৰ সঠিক ঠাইত থওক।' }
      ]
    },
    'game-3': {
      title: 'মনোযোগ কেন্দ্ৰীকৰণ কেনেকৈ খেলিব',
      steps: [
        { sub: '👀 কাৰ্ডবোৰ নিৰীক্ষণ কৰক', desc: 'একে ধৰণৰ বস্তুবোৰৰ গ্ৰিডখন মনোযোগেৰে চাওক।' },
        { sub: '🧠 পৃথক কাৰ্ড বিচাৰক', desc: 'বাকিবোৰতকৈ বেলেগ এটা বস্তু বিচাৰক।' },
        { sub: '👆 পৃথক কাৰ্ড স্পৰ্শ কৰক', desc: 'বেলেগ থকা কাৰ্ডখন স্পৰ্শ কৰক।' },
        { sub: '⭐ সঠিক নিৰ্বাচন', desc: 'মনোযোগ উন্নত কৰিবলৈ প্ৰতিটো ৰাউণ্ডত বেলেগটো বিচাৰি উলিয়াওক।' }
      ]
    },
    'game-4': {
      title: 'বস্তু চিনাক্তকৰণ কেনেকৈ খেলিব',
      steps: [
        { sub: '👀 বস্তুটো চাওক', desc: 'মাজত দেখুওৱা বস্তুটো ভালদৰে চাওক।' },
        { sub: '🧠 বিকল্প পঢ়ক', desc: 'কাৰ্ডৰ তলত থকা বিকল্পসমূহ পঢ়ক।' },
        { sub: '👆 তুলনা কৰি স্পৰ্শ কৰক', desc: 'বস্তুটোৰ লগত মিলা বিকল্পটোত স্পৰ্শ কৰক।' },
        { sub: '⭐ ৰাউণ্ড সম্পূৰ্ণ কৰক', desc: 'স্কোৰ চাবলৈ সকলো ৰাউণ্ড সম্পূৰ্ণ কৰক।' }
      ]
    },
    'game-5': {
      title: 'দৈনিক ৰুটিন কেনেকৈ খেলিব',
      steps: [
        { sub: '👀 কাৰ্যসূচীবোৰ চাওক', desc: 'উল্টোপাল্টা হৈ থকা কামবোৰ চাওক।' },
        { sub: '🧠 ক্ৰমৰ কথা ভাবক', desc: 'ৰাতিপুৱাৰ পৰা ৰাতিলৈকে কামবোৰৰ ক্ৰম ভাবক।' },
        { sub: '👆 ক্ৰমানুসৰি নিৰ্বাচন কৰক', desc: 'যৌক্তিক ক্ৰমত কামবোৰত স্পৰ্শ কৰক।' },
        { sub: '⭐ দিনটো সম্পূৰ্ণ কৰক', desc: 'ৰুটিনটো সঠিকভাৱে সজাই দিনটো সম্পূৰ্ণ কৰক।' }
      ]
    },
    'game-6': {
      title: 'ভাষা আৰু শব্দ স্মৃতি কেনেকৈ খেলিব',
      steps: [
        { sub: '👀 শব্দবোৰ পঢ়ক', desc: 'পৰ্দাত দিয়া শব্দবোৰ পঢ়ক।' },
        { sub: '🧠 মনত ৰাখক', desc: 'সময় শেষ হোৱাৰ আগতে মনত ৰাখক।' },
        { sub: '👆 তালিকাৰ পৰা বাছক', desc: 'মূল তালিকাত থকা শব্দসমূহ বাছক।' },
        { sub: '⭐ দাখিল কৰি পৰীক্ষা কৰক', desc: 'শব্দসমূহ দাখিল কৰি পৰীক্ষা কৰক।' }
      ]
    }
  },
  Manipuri: {
    'game-1': {
      title: 'মেমোরী ম্যাচ করম্না শানগদগে',
      steps: [
        { sub: '👀 য়েংঙু', desc: 'উল্টাই থোবা কাৰ্ডশিংগী গ্রিড অদু কুপ্না য়েংঙু।' },
        { sub: '👆 কাৰ্ড অমদা টিপউ', desc: 'কাৰ্ড অদু উল্টাইনবা টিপউ।' },
        { sub: '👆 অনিশুবা কাৰ্ড টিপউ', desc: 'অতোপ্পা কাৰ্ড অমা টিপউ। মান্নবা সিম্বল থী দৌ।' },
        { sub: '⭐ মিল অমসুং জয়', desc: 'মান্নবা যোরাশিং হাঙনা লৈগনি। লোইশিন্নবা ময়াম মিলৌ!' }
      ]
    },
    'game-2': {
      title: 'প্যাটার্ন নীংশিংবা শান্নবা নীয়ম',
      steps: [
        { sub: '👀 ক্ৰম মনোযোগগা য়েংঙু', desc: 'প্যাটার্ন অসি মনোযোগগা লোয়ননা য়েংঙু।' },
        { sub: '🧠 নীংশিংঙু', desc: 'মখোয়না মাঙদ্রিঙৈদা মসিগী ক্ৰম অসি নীংশিংঙু।' },
        { sub: '👆 ক্ৰম অনুসৰি টিপউ', desc: 'মখোয় সঠিক ক্ৰম অসিদা টিপউ।' },
        { sub: '⭐ ক্ৰম লোইশিনবা', desc: 'পয়েন্ট ফংনবা মখোয় সঠিক মফমদা সজাও।' }
      ]
    },
    'game-3': {
      title: 'মিৎকুপ কেন্দ্ৰীকৰণ শান্নবা নীয়ম',
      steps: [
        { sub: '👀 কাৰ্ড ময়াম য়েংঙু', desc: 'কাৰ্ডশিং অসি কুপ্না য়েংঙু।' },
        { sub: '🧠 তোঙানবা কাৰ্ড থী দৌ', desc: 'তোঙানবা ইমোজি লৈবা কাৰ্ড অদু থী দৌ।' },
        { sub: '👆 তোঙানবা কাৰ্ড টিপউ', desc: 'তোঙানবা কাৰ্ড অদুদা টিপউ।' },
        { sub: '⭐ সঠিক খনবা', desc: 'খুদক্তা অমসুং সঠিক ওইনা তৌনবা হোৎনৌ।' }
      ]
    },
    'game-4': {
      title: 'পোৎশক চিনাক্তকরণ শান্নবা নীয়ম',
      steps: [
        { sub: '👀 পোৎশক য়েংঙু', desc: 'পোৎশক অসি কুপ্না য়েংঙু।' },
        { sub: '🧠 অপশনশিং পাদু', desc: 'মসি করিনো খল্লু।' },
        { sub: '👆 খল্লগা টিপউ', desc: 'সঠিক পাউখুম অদু খনৌ।' },
        { sub: '⭐ রাউণ্ড লোইশিনবা', desc: 'ৱাহং লোইবা ফাওবা তৌ দৌ।' }
      ]
    },
    'game-5': {
      title: 'নুমিৎ খুদিংগী রুটিন নীংশিংবা শান্নবা নীয়ম',
      steps: [
        { sub: '👀 থবকশিং য়েংঙু', desc: 'থবকশিং অসি কুপ্না য়েংঙু।' },
        { sub: '🧠 ক্ৰম খল্লু', desc: 'অয়ুক্তগী নুমিদাং ফাওবা ক্ৰম অদু খল্লু।' },
        { sub: '👆 সঠিক ক্ৰমদা খনৌ', desc: 'সঠিক ক্ৰম অসিদা টিপউ।' },
        { sub: '⭐ নুমিৎ লোইশিনবা', desc: 'নুমিৎ অসি সঠিক ক্ৰমদা সজাও।' }
      ]
    },
    'game-6': {
      title: 'লোন অমসুং ৱাহৈ স্মৃতি শান্নবা নীয়ম',
      steps: [
        { sub: '👀 ৱাহৈশিং পাদু', desc: 'ৱাহৈশিং অসি কুপ্না য়েংঙু।' },
        { sub: '🧠 নীংশিংঙু', desc: 'ঙম্লিবমখৈ নীংশিংনবা হোৎনৌ।' },
        { sub: '👆 লিষ্টতগী খনৌ', desc: 'করম্বা ৱাহৈনা লৈখিবগে চিনাক্ত তৌ।' },
        { sub: '⭐ চাবমিট তৌ অমসুং য়েংঙু', desc: 'সঠিক ৱাহৈশিং অদুদা টিপউ।' }
      ]
    }
  },
  Khasi: {
    'game-1': {
      title: 'Kumno ban Ialehkai Memory Match',
      steps: [
        { sub: '👀 PEIT', desc: 'Peit ia ki kot baroh kiba la khang.' },
        { sub: '👆 KHEM SHA KA KOT', desc: 'Thap ia ka kot ban plie ia ka.' },
        { sub: '👆 KHEM SHA KA KOT BA-AR', desc: 'Thap ia ka kot ba-ar ban wad ia kaba iadei.' },
        { sub: '⭐ IADEI BAD JOP', desc: 'Ki kot kiba iadei kin sah haba plie. Pyndep baroh ban jop!' }
      ]
    },
    'game-2': {
      title: 'Kumno ban ialehkai Rukom Hriatrengna',
      steps: [
        { sub: '👀 PEIT IA KA RUKOM', desc: 'Peit bha ia ka rukom siah.' },
        { sub: '🧠 KYNMAW', desc: 'Kynmaw ia ka rukom shwa ban jah.' },
        { sub: '👆 KHEM RUKOM SNGI', desc: 'Khot ia ki ha ka rukom kaba dei.' },
        { sub: '⭐ PYNDEP IA KA RUKOM', desc: 'Shim por ban pyndep.' }
      ]
    },
    'game-3': {
      title: 'Kumno ban ialehkai Kokhoni Mon',
      steps: [
        { sub: '👀 PEIT IA KI KOT', desc: 'Peit ia ki kot baroh.' },
        { sub: '🧠 WAD IA KABA PHER', desc: 'Wad ia u emoji uba pher.' },
        { sub: '👆 KHEM IA KABA PHER', desc: 'Khem ia u emoji uba pher.' },
        { sub: '⭐ JIED KABA DEI', desc: 'Leh stet bad thikna.' }
      ]
    },
    'game-4': {
      title: 'Kumno ban ialehkai Ithuh Jing',
      steps: [
        { sub: '👀 PEIT IA KA TIAR', desc: 'Peit ia u emoji tiar.' },
        { sub: '🧠 PULE IA KI KYRTENG', desc: 'Pyrkhat ia ka kyrteng.' },
        { sub: '👆 IANUJ BAD KHEM', desc: 'Jied ia ka kyrteng kaba dei.' },
        { sub: '⭐ PYNDEP IA KI ROUND', desc: 'Pyndep baroh ki jingkylli.' }
      ]
    },
    'game-5': {
      title: 'Kumno ban ialehkai Kynmaw Kam',
      steps: [
        { sub: '👀 PEIT IA KI KAM', desc: 'Peit ia ki kam sngi.' },
        { sub: '🧠 PYRKHAT IA KA RUKOM', desc: 'Pyrkhat ia ka rukom treikam.' },
        { sub: '👆 JIED RUKOM SNGI', desc: 'Khem naduh mynstep shaduh miet.' },
        { sub: '⭐ PYNDEP IA KA SNGI', desc: 'Pynbeit ia ka sngi.' }
      ]
    },
    'game-6': {
      title: 'Kumno ban ialehkai Kynmaw Kyntien',
      steps: [
        { sub: '👀 PULE IA KI KYNTIEN', desc: 'Pule ia ki kyntien.' },
        { sub: '🧠 KYNMAW', desc: 'Kynmaw ia kiba phi lah.' },
        { sub: '👆 JIED NA KA LIST', desc: 'Shem ia ki kyntien ba don ha ka list.' },
        { sub: '⭐ SUBMIT BAD PEIT', desc: 'Khem ia kiba dei.' }
      ]
    }
  },
  Mizo: {
    'game-1': {
      title: 'Memory Match khelh dan tur',
      steps: [
        { sub: '👀 EN RAWH', desc: 'Card tlar inkhup te kha en rawh.' },
        { sub: '👆 CARD HMET RAWH', desc: 'Card pakhat hmet la leh rawh.' },
        { sub: '👆 CARD DANG HMET RAWH', desc: 'Card dang hmet la, a inmil kha zawng rawh.' },
        { sub: '⭐ REM INMIL LEH CHENNA', desc: 'Card inmil te chu a inhawng reng ang. Khel zo vek rawh!' }
      ]
    },
    'game-2': {
      title: 'Rukom Hriatrengna khelh dan tur',
      steps: [
        { sub: '👀 EN DAWT RAWH', desc: 'Thil in dawt dan kha en ngun rawh.' },
        { sub: '🧠 HRE RENG RAWH', desc: 'A bo hma khan a in dawt dan hre reng rawh.' },
        { sub: '👆 A IN DAWTIN HMET RAWH', desc: 'A in dawt dan dik tak khan hmet rawh.' },
        { sub: '⭐ KHEL ZO RAWH', desc: 'Hmanhmawh lo la khel rawh.' }
      ]
    },
    'game-3': {
      title: 'Mit sawr bingna khelh dan tur',
      steps: [
        { sub: '👀 GRID EN VEK RAWH', desc: 'Card tlar kha en vek rawh.' },
        { sub: '🧠 A DANGLAM BIK ZAWNG RAWH', desc: 'Emoji danglam bik awmna card kha zawng rawh.' },
        { sub: '👆 A DANGLAM BIK HMET RAWH', desc: 'A danglam bik kha hmet rawh.' },
        { sub: '⭐ A DIK ZAWNG CHHUAK RAWH', desc: 'Rang tak leh dik takin khelh tum rawh.' }
      ]
    },
    'game-4': {
      title: 'Thil hriat hran khelh dan tur',
      steps: [
        { sub: '👀 THIL LEM EN RAWH', desc: 'Thil lem awm kha en rawh.' },
        { sub: '🧠 A HMING CHHIAR RAWH', desc: 'A hming ngaihtuah rawh.' },
        { sub: '👆 THLANG LEH HMET RAWH', desc: 'A hming dik ber kha thlang rawh.' },
        { sub: '⭐ ROUND KHEL ZO RAWH', desc: 'Zawhna zawng zawng chhang vek rawh.' }
      ]
    },
    'game-5': {
      title: 'Ni tin thiltih hriatrengna khelh dan',
      steps: [
        { sub: '👀 ENGLAWN RAWH', desc: 'Ni tin thiltihte kha en rawh.' },
        { sub: '🧠 IN DAWT DAN NGAIHTUAH RAWH', desc: 'A in dawt dan tur ngaihtuah rawh.' },
        { sub: '👆 A IN DAWTIN THLANG RAWH', desc: 'Zing atanga zan thlengin a in dawtin hmet rawh.' },
        { sub: '⭐ NI HMAN KHEL ZO RAWH', desc: 'I ni hman dan kha rem rawh.' }
      ]
    },
    'game-6': {
      title: 'Tawng leh Thumal hriatrengna khelh dan',
      steps: [
        { sub: '👀 THUMAL CHHIAR RAWH', desc: 'Thumal inziahte kha chhiar rawh.' },
        { sub: '🧠 VONG RENG RAWH', desc: 'I theihtawpin hre reng rawh.' },
        { sub: '👆 LIST ATANGIN THLANG RAWH', desc: 'Thumal awmte kha zawng chhuak rawh.' },
        { sub: '⭐ SUBMIT LEH CHECK RAWH', desc: 'A dik apiang kha hmet rawh.' }
      ]
    }
  },
  Nagamese: {
    'game-1': {
      title: 'Memory Match khelibole bhal',
      steps: [
        { sub: '👀 CHABI', desc: 'Grid te thaka face-down card khan chabi.' },
        { sub: '👆 EKTA CARD TIPBI', desc: 'Card ekta tap kurikena ulta kuribi.' },
        { sub: '👆 DUTA CARD TIPBI', desc: 'Aro ekta card tipibi. Sahi card bisaribi.' },
        { sub: '⭐ MILA ARU JITIBI', desc: 'Mil thaka card toh khuli thakibo. Sob milaibi!' }
      ]
    },
    'game-2': {
      title: 'Sequence & Order khelibole niyam',
      steps: [
        { sub: '👀 SEQUENCE CHABI', desc: 'Sequence te bhal pora chabi.' },
        { sub: '🧠 YAAD RAKHIO', desc: 'Etu vanish hobole ageya yaad rakhio.' },
        { sub: '👆 ORDER PORA TIPBI', desc: 'Shuffled hoia pise thik order te tipibi.' },
        { sub: '⭐ SEQUENCE COMPLETED', desc: 'Aram se koribi.' }
      ]
    },
    'game-3': {
      title: 'Attention Focus khelibole niyam',
      steps: [
        { sub: '👀 GRID CHABI', desc: 'Cards grid te bhal pora chabi.' },
        { sub: '🧠 ALAG BISARIBI', desc: 'Alag emoji thaka card bisaribi.' },
        { sub: '👆 ALAG CARD TIPBI', desc: 'Alag card te tipibi.' },
        { sub: '⭐ SAHI CHOICE', desc: 'Jaldi aru thik pora koribi.' }
      ]
    },
    'game-4': {
      title: 'Object Recognition khelibole niyam',
      steps: [
        { sub: '👀 OBJECT CHABI', desc: 'Object emoji te chabi.' },
        { sub: '🧠 OPTIONS PORIBI', desc: 'Etu ki ase bhabibi.' },
        { sub: '👆 SELECT KURI TIPBI', desc: 'Sahi answer select koribi.' },
        { sub: '⭐ ROUND KHOTOM CORIBI', desc: 'Sob question complete koribi.' }
      ]
    },
    'game-5': {
      title: 'Daily Routine Recall khelibole niyam',
      steps: [
        { sub: '👀 KAM KHAN CHABI', desc: 'Schedule list te chabi.' },
        { sub: '🧠 ROUTINE BHABIBI', desc: 'Din laga normal routine bhabibi.' },
        { sub: '👆 ORDER PORA CHABI', desc: 'Morning pora night tak tipibi.' },
        { sub: '⭐ DIN KHOTOM KORIBI', desc: 'Din laga sequence thik koribi.' }
      ]
    },
    'game-6': {
      title: 'Language & Word Memory khelibole niyam',
      steps: [
        { sub: '👀 WORDS PORIBI', desc: 'Words list te poribi.' },
        { sub: '🧠 MEMORISE KORIBI', desc: 'Bhal pora yaad rakhio.' },
        { sub: '👆 LIST PORA SELECT KORIBI', desc: 'Sahi word te select koribi.' },
        { sub: '⭐ SUBMIT KURI CHECK KORIBI', desc: 'Correct word te tipibi.' }
      ]
    }
  },
  Tripuri: {
    'game-1': {
      title: 'Memory Match khelibole rules',
      steps: [
        { sub: '👀 SAODI', desc: 'Grid te thaka card khan saodi.' },
        { sub: '👆 EK CARD TIPIDI', desc: 'Card ekta tap khamoi ulta khamdi.' },
        { sub: '👆 DUTA CARD TIPIDI', desc: 'Aru ekta card tipidi. Sahi card bisaridi.' },
        { sub: '⭐ MIL ARU JITIDI', desc: 'Mil thaka card toh khuli tongbo. Jotono milaidi!' }
      ]
    },
    'game-2': {
      title: 'Pattern Yaad solomni niyam',
      steps: [
        { sub: '👀 SEQUENCE SAODI', desc: 'Sequence no yaad khilaimu aru thik dawt logadi.' },
        { sub: '🧠 YAAD KHILAIMU', desc: 'Bo vanish hoima sak yaad khilaimu.' },
        { sub: '👆 ORDER PORA TIPIDI', desc: 'Shuffled hoima pise thik order te tipidi.' },
        { sub: '⭐ SEQUENCE COMPLETED', desc: 'Aram khe khailidi.' }
      ]
    },
    'game-3': {
      title: 'Kokhoni Mon diyo solomni niyam',
      steps: [
        { sub: '👀 GRID SAODI', desc: 'Cards grid no kahm khe saodi.' },
        { sub: '🧠 ALAG BISARIDI', desc: 'Alag emoji card bisaridi.' },
        { sub: '👆 ALAG CARD TIPIDI', desc: 'Alag card te tipidi.' },
        { sub: '⭐ SAHI CHOICE', desc: 'Jaldi aru thik khe khailidi.' }
      ]
    },
    'game-4': {
      title: 'Thil China solomni niyam',
      steps: [
        { sub: '👀 OBJECT SAODI', desc: 'Object emoji no saodi.' },
        { sub: '🧠 OPTIONS PORIDI', desc: 'Bo ki tong bhabidi.' },
        { sub: '👆 SELECT KHAMOI TIPIDI', desc: 'Kahm answer select khailidi.' },
        { sub: '⭐ ROUND KHOTOM KHAMDI', desc: 'Jotoni question complete khailidi.' }
      ]
    },
    'game-5': {
      title: 'Routine Yaad solomni niyam',
      steps: [
        { sub: '👀 KAM ROK SAODI', desc: 'Schedule list no saodi.' },
        { sub: '🧠 ROUTINE BHABIDI', desc: 'Salni normal routine bhabidi.' },
        { sub: '👆 ORDER PORA SAODI', desc: 'Morning pora night sak tipidi.' },
        { sub: '⭐ SAL KHOTOM KHAMDI', desc: 'Salni sequence thik khailidi.' }
      ]
    },
    'game-6': {
      title: 'Loang Dimag Khel solomni niyam',
      steps: [
        { sub: '👀 WORDS PORIDI', desc: 'Words list no poridi.' },
        { sub: '🧠 MEMORISE KHAMDI', desc: 'Kahm khe yaad khilaimo.' },
        { sub: '👆 LIST PORA SELECT KHAMDI', desc: 'Kahm word select khailidi.' },
        { sub: '⭐ SUBMIT KURI CHECK KHAMDI', desc: 'Correct word te tipibi.' }
      ]
    }
  }
};

const getDemoData = (gameId: string, lang: string) => {
  const gt = gameTranslations[lang] || gameTranslations.English;
  const dict = demoTranslations[lang] || demoTranslations.English;
  const gameData = dict[gameId] || demoTranslations.English[gameId];

  return {
    title: gameData.title,
    steps: gameData.steps.map((s: any, idx: number) => ({
      title: `${gt.step || 'STEP'} ${idx + 1}`,
      subtitle: s.sub,
      description: s.desc,
      emoji: gameId === 'game-1' ? ['❓ ❓ ❓ ❓', '🍎 ❓ ❓ ❓', '🍎 ❓ 🍌 ❓', '🍎 🍎 🍌 🍌'][idx] :
             gameId === 'game-2' ? ['🌅 → 🪥 → 🍳', '🌅 ... 🪥 ... 🍳', '🌅 [ ] [ ]', '🌅 🪥 🍳'][idx] :
             gameId === 'game-3' ? ['🦁 🦁 🦁 🦁', '🦁 🦁 🐯 🦁', '🦁 🦁 👆🐯 🦁', '✓ Correct!'][idx] :
             gameId === 'game-4' ? ['🍎', 'Banana | Apple | Orange', 'Apple 👆', '⭐ Score 100%'][idx] :
             gameId === 'game-5' ? ['🍳 🌅 🪥', 'Morning → Noon → Night', '🌅 [ ] [ ]', '🌅 🪥 🍳'][idx] :
             ['JAAPI, DHOL, BIHU', '⏰ 3s... 2s... 1s', 'JAAPI 👆 | KOPIL | DHOL 👆', '✓ Correct!'][idx],
      highlightAction: gameId === 'game-1' ? [undefined, 'flip1', 'flip2', 'match'][idx] :
                       gameId === 'game-2' ? [undefined, 'fade', 'tap1', 'complete'][idx] :
                       gameId === 'game-3' ? [undefined, 'highlightOdd', 'tapOdd', 'correct'][idx] :
                       gameId === 'game-4' ? [undefined, undefined, 'selectOption', undefined][idx] :
                       gameId === 'game-5' ? [undefined, undefined, 'stepDaily1', undefined][idx] :
                       [undefined, 'timer', 'tapWords', undefined][idx]
    }))
  };
};

// Reusable Dementia-Friendly GameInstructionDemo Component
const GameInstructionDemo: React.FC<{ 
  gameId: string; 
  onClose: () => void 
}> = ({ gameId, onClose }) => {
  const { language } = useLanguage();
  const gt = gameTranslations[language] || gameTranslations.English;
  const [currentStep, setCurrentStep] = useState(0);
  const data = getDemoData(gameId, language);

  const step = data.steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border-2 border-brand-purpleLight flex flex-col justify-between space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-brand-purpleLight pb-4">
          <div>
            <h3 className="font-extrabold text-xl text-brand-navy">{data.title}</h3>
            <p className="text-xs text-brand-grayText font-semibold mt-1">
              {gt.visualStep.replace('{current}', String(currentStep + 1)).replace('{total}', String(data.steps.length))}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="px-3.5 py-1.5 bg-brand-lavender text-brand-purple hover:bg-brand-purpleLight text-xs font-black rounded-xl"
          >
            {gt.close}
          </button>
        </div>

        {/* Demo Content */}
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-6 flex-1">
          {/* STEP Indicator */}
          <span className="px-3 py-1 bg-brand-purpleLight text-brand-purple text-xs font-black rounded-full tracking-wider">
            {step.title}
          </span>

          {/* Subtitle */}
          <h4 className="text-2xl font-black text-brand-navy">
            {step.subtitle}
          </h4>

          {/* Visual Animation Demo Mockup Card Box */}
          <div className="w-full max-w-[280px] h-36 bg-brand-lavender/30 border border-brand-purpleLight rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner">
            <span className="text-4xl select-none leading-normal block animate-pulse">
              {step.emoji}
            </span>

            {/* Tap pointer hand helper overlay indicator */}
            {step.highlightAction && (
              <span className="absolute bottom-3 right-6 text-2xl animate-bounce pointer-events-none">
                👆
              </span>
            )}
            
            {/* Visual pulses */}
            {step.highlightAction && (
              <span className="absolute inset-0 border-2 border-brand-purple/40 rounded-2xl animate-ping opacity-25" />
            )}
          </div>

          {/* Explanation Text */}
          <p className="text-brand-grayText font-bold text-base max-w-sm">
            {step.description}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between border-t border-brand-purpleLight pt-4 gap-4">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            className={`px-5 py-3 rounded-xl font-black text-sm transition-all ${
              currentStep === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-brand-lavender text-brand-purple hover:bg-brand-purpleLight'
            }`}
          >
            {gt.back}
          </button>

          {currentStep < data.steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-6 py-3 bg-brand-purple text-white hover:bg-opacity-95 font-black text-sm rounded-xl shadow-sm"
            >
              {gt.next}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-brand-green text-white hover:bg-opacity-95 font-black text-sm rounded-xl shadow-sm"
            >
              {gt.close}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const gameTranslations: Record<string, Record<string, string>> = {
  English: {
    lockedDesc: 'Complete Memory Match and Sequence & Order with a score of 70+ to unlock this exercise.',
    trainDesc: 'Train your cognitive health. Max level unlocked: Level',
    selectLevel: 'Select a Level',
    challengeLvl: 'Challenge yourself or practice completed levels.',
    level: 'Level',
    unlocked: 'Unlocked',
    locked: 'Locked',
    open: 'Open',
    practiceAgain: 'Practice Again',
    tryNextGame: 'Try Next Game',
    playNextLevel: 'Play Next Level',
    returnDash: 'Return to Games Dashboard',
    score: 'Score',
    accuracy: 'Accuracy',
    mistakes: 'Mistakes',
    duration: 'Duration',
    points: 'Points',
    seconds: 'seconds',
    excellent: 'Excellent work, {name}! 🌟',
    progress: "You're making progress, {name}! 👍",
    keepPracticing: 'Keep practicing, {name}! 💪',
    nextChallenge: 'Ready for the next challenge? Small steps every day lead to big results.',
    visualStep: 'Visual demonstration step {current} of {total}',
    close: 'Close',
    next: 'Next →',
    moves: 'Moves',
    pairsMatched: 'Pairs matched',
    rememberSeq: 'Remember this sequence!',
    startingIn: 'Starting in',
    tapOrder: 'Tap the items in the correct order:',
    tapFirstLast: 'Tap from first to last',
    oddCardDesc: 'There is exactly 1 odd card.',
    whatIsObj: 'What is this object?',
    orderRoutine: 'Order the daily routine from morning to night:',
    tapChronological: 'Tap them in chronological sequence',
    rememberWords: 'Remember these words!',
    selectWords: 'Select the words that were in the list:',
    tapSubmit: 'Tap to select/deselect, then click Submit',
    submitChoices: 'Submit Choices',
    step: 'STEP',
    back: '← Back',
    instTitle: 'How to Play',
    instructionsForLvl: 'Instructions for Level'
  },
  Hindi: {
    lockedDesc: 'इस अभ्यास को अनलॉक करने के लिए मेमोरी मैच और सीक्वेंस व ऑर्डर में 70+ स्कोर प्राप्त करें।',
    trainDesc: 'अपने मानसिक स्वास्थ्य को प्रशिक्षित करें। अधिकतम स्तर खुला: स्तर',
    selectLevel: 'स्तर चुनें',
    challengeLvl: 'खुद को चुनौती दें या पूरे किए गए स्तरों का अभ्यास करें।',
    level: 'स्तर',
    unlocked: 'अनलॉक किया गया',
    locked: 'बंद (लॉक)',
    open: 'खेलें',
    practiceAgain: 'पुनः अभ्यास करें',
    tryNextGame: 'अगला गेम खेलें',
    playNextLevel: 'अगला स्तर खेलें',
    returnDash: 'गेम्स डैशबोर्ड पर वापस जाएं',
    score: 'अंक',
    accuracy: 'सटीकता',
    mistakes: 'गलतियां',
    duration: 'समय',
    points: 'अंक',
    seconds: 'सेकंड',
    excellent: 'उत्कृष्ट कार्य, {name}! 🌟',
    progress: 'आप प्रगति कर रहे हैं, {name}! 👍',
    keepPracticing: 'अभ्यास जारी रखें, {name}! 💪',
    nextChallenge: 'अगली चुनौती के लिए तैयार हैं? हर दिन के छोटे कदम बड़े परिणाम लाते हैं।',
    visualStep: 'दृश्य प्रदर्शन चरण {current}/{total}',
    close: 'बंद करें',
    next: 'आगे →',
    moves: 'चालें',
    pairsMatched: 'जोड़े मिले',
    rememberSeq: 'इस अनुक्रम को याद रखें!',
    startingIn: 'शुरू हो रहा है:',
    tapOrder: 'वस्तुओं को सही क्रम में टैप करें:',
    tapFirstLast: 'पहले से आखिरी तक टैप करें',
    oddCardDesc: 'यहाँ ठीक 1 अलग कार्ड है।',
    whatIsObj: 'यह कौन सी वस्तु है?',
    orderRoutine: 'दैनिक दिनचर्या को सुबह से रात के क्रम में व्यवस्थित करें:',
    tapChronological: 'उन्हें समय के अनुसार टैप करें',
    rememberWords: 'इन शब्दों को याद रखें!',
    selectWords: 'उन शब्दों को चुनें जो सूची में थे:',
    tapSubmit: 'चुनने/हटाने के लिए टैप करें, फिर सबमिट करें',
    submitChoices: 'विकल्प सबमिट करें',
    step: 'चरण',
    back: '← पीछे',
    instTitle: 'कैसे खेलें',
    instructionsForLvl: 'स्तर के लिए निर्देश'
  },
  Bengali: {
    lockedDesc: 'এই গেমটি আনলক করতে মেমরি ম্যাচ ও সিকোয়েন্স অ্যান্ড অর্ডারে ৭০+ স্কোর করতে হবে।',
    trainDesc: 'আপনার মস্তিস্ক সচল রাখুন। সর্বোচ্চ আনলকড স্তর: স্তর',
    selectLevel: 'একটি স্তর নির্বাচন করুন',
    challengeLvl: 'নিজেকে চ্যালেঞ্জ করুন বা সম্পূর্ণ করা স্তরের অনুশীলন করুন।',
    level: 'স্তর',
    unlocked: 'আনলক করা',
    locked: 'লক করা',
    open: 'খেলুন',
    practiceAgain: 'আবার অনুশীলন করুন',
    tryNextGame: 'পরবর্তী গেম খেলুন',
    playNextLevel: 'পরবর্তী স্তর খেলুন',
    returnDash: 'গেমস ড্যাশবোর্ডে ফিরে যান',
    score: 'স্কোর',
    accuracy: 'সঠিকতা',
    mistakes: 'ভুল',
    duration: 'সময়',
    points: 'পয়েন্ট',
    seconds: 'সেকেন্ড',
    excellent: 'অসাধারণ কাজ, {name}! 🌟',
    progress: 'আপনার উন্নতি হচ্ছে, {name}! 👍',
    keepPracticing: 'অনুশীলন চালিয়ে যান, {name}! 💪',
    nextChallenge: 'পরবর্তী চ্যালেঞ্জের জন্য প্রস্তুত? প্রতিদিনের ছোট ছোট পদক্ষেপ বড় সাফল্য নিয়ে আসে।',
    visualStep: 'ভিজ্যুয়াল ডেমো ধাপ {current} এর {total}',
    close: 'বন্ধ করুন',
    next: 'পরবর্তী →',
    moves: 'মুভ সংখ্যা',
    pairsMatched: 'মিলে যাওয়া জোড়া',
    rememberSeq: 'এই সিকোয়েন্সটি মনে রাখুন!',
    startingIn: 'শুরু হচ্ছে:',
    tapOrder: 'সঠিক ক্রমে বস্তুগুলিতে ট্যাপ করুন:',
    tapFirstLast: 'প্রথম থেকে শেষ পর্যন্ত ট্যাপ করুন',
    oddCardDesc: 'এখানে ঠিক ১টি ভিন্ন কার্ড আছে।',
    whatIsObj: 'এই বস্তুটি কী?',
    orderRoutine: 'রুটিনটি সকাল থেকে রাত অনুযায়ী সাজান:',
    tapChronological: 'অনুক্রম অনুযায়ী ট্যাপ করুন',
    rememberWords: 'এই শব্দগুলি মনে রাখুন!',
    selectWords: 'তালিকায় থাকা শব্দগুলি নির্বাচন করুন:',
    tapSubmit: 'নির্বাচন করতে ট্যাপ করুন, তারপর সাবমিট করুন',
    submitChoices: 'জমা দিন',
    step: 'ধাপ',
    back: '← পেছনে',
    instTitle: 'কীভাবে খেলবেন',
    instructionsForLvl: 'স্তরের জন্য নির্দেশাবলী'
  },
  Assamese: {
    lockedDesc: 'এই খেলটো খুলিবলৈ মেমৰি মেচ আৰু চিকুৱেঞ্চত ৭০+ নম্বৰ পাব লাগিব।',
    trainDesc: 'মানসিক স্বাস্থ্য সবল কৰক। সৰ্বাধিক খোল খোৱা স্তৰ: স্তৰ',
    selectLevel: 'স্তৰ বাছনি কৰক',
    challengeLvl: 'নিজকে প্ৰত্যাহ্বান জনাওক বা আগৰ স্তৰসমূহ আকৌ খেলক।',
    level: 'স্তৰ',
    unlocked: 'মুক্ত',
    locked: 'বন্ধ',
    open: 'খেলক',
    practiceAgain: 'আকৌ খেলক',
    tryNextGame: 'পৰৱৰ্তী খেল খেলক',
    playNextLevel: 'পৰৱৰ্তী স্তৰ খেলক',
    returnDash: 'ড্যাশবৰ্ডলৈ ঘূৰি যাওক',
    score: 'স্কোৰ',
    accuracy: 'সঠিকতা',
    mistakes: 'ভুল',
    duration: 'সময়',
    points: 'পইণ্ট',
    seconds: 'ছেকেণ্ড',
    excellent: 'সুন্দৰ কাৰ্য, {name}! 🌟',
    progress: 'আপোনাৰ উন্নতি হৈছে, {name}! 👍',
    keepPracticing: 'অভ্যাস অব্যাহত ৰাখক, {name}! 💪',
    nextChallenge: 'পৰৱৰ্তী প্ৰত্যাহ্বানৰ বাবে সাজুনে? দৈনিক চেষ্টা কৰিলে সফলতা নিশ্চয় মিলিব।',
    visualStep: 'প্ৰদৰ্শনৰ স্তৰ {current} / {total}',
    close: 'বন্ধ কৰক',
    next: 'পৰৱৰ্তী →',
    moves: 'খোজ',
    pairsMatched: 'মিলা জোৰা',
    rememberSeq: 'এই ক্ৰমটো মনত ৰাখক!',
    startingIn: 'আৰম্ভ হ’ব:',
    tapOrder: 'শুদ্ধ ক্ৰমত টিপক:',
    tapFirstLast: 'প্ৰথমৰ পৰা শেষলৈ টিপক',
    oddCardDesc: 'ইয়াত ঠিক এটা বেলেগ কাৰ্ড আছে।',
    whatIsObj: 'এইটো কি বস্তু?',
    orderRoutine: 'দৈনিক ৰুটিনটো পুৱাৰ পৰা গধূলিলৈ সজোৱক:',
    tapChronological: 'ক্ৰমানুসাৰে টিপক',
    rememberWords: 'এই শব্দকেইটা মনত ৰাখক!',
    selectWords: 'তালিকাত থকা শব্দসমূহ বাছক:',
    tapSubmit: 'বাছনি কৰিবলৈ টিপক, তাৰপিছত জমা কৰক',
    submitChoices: 'জমা কৰক',
    step: 'স্তৰ',
    back: '← পিছুৱাওক',
    instTitle: 'কেনেকৈ খেলিব',
    instructionsForLvl: 'স্তৰৰ নিৰ্দেশনা'
  },
  Manipuri: {
    lockedDesc: 'মেমোরী ম্যাচ অমসুং সিকোয়েন্সতা ৭০+ স্কোর তৌদুনা অসি হাঙদোকউ।',
    trainDesc: 'ব্রেনগী এক্সরসাইজ তৌ। খ্বাইদগী ৱাংনা হাঙদোক্লবা লেভেল: লেভেল',
    selectLevel: 'লেভেল খনবা',
    challengeLvl: 'লেভেল অসিদা প্র্যাকটিস তৌবিউ।',
    level: 'লেভেল',
    unlocked: 'হাঙদোক্লবা',
    locked: 'লোল্লবা',
    open: 'শানবা',
    practiceAgain: 'আমুদি শানবা',
    tryNextGame: 'পরবর্তী গেম শানবা',
    playNextLevel: 'পরবর্তী লেভেল শানবা',
    returnDash: 'ড্যাশবোর্দা হনবা',
    score: 'স্কোর',
    accuracy: 'এক্যুরেসি',
    mistakes: 'অশোয়বা',
    duration: 'পুংফম',
    points: 'পয়েন্ট',
    seconds: 'সেকেন্ড',
    excellent: 'য়াম্না ফজরে, {name}! 🌟',
    progress: 'প্রোগ্রেস তৌরি, {name}! 👍',
    keepPracticing: 'প্র্যাকটিস তৌবিউ, {name}! 💪',
    nextChallenge: 'অনৌবা শানবা পাম্ব্রা? নুমিৎ খুদিংগী শানবনা হেন্না ফজগনি।',
    visualStep: 'ডেমো স্তেজ {current} / {total}',
    close: 'থিংজিলবা',
    next: 'মাংলোনদা →',
    moves: 'মুভশিং',
    pairsMatched: 'পেয়ার ম্যাচ তৌখ্রে',
    rememberSeq: 'সিকোয়েন্স অসি নীংশিংউ!',
    startingIn: 'হৌগদৌরিব পুং:',
    tapOrder: 'সঠিক সিকোয়েন্সতা টিপউ:',
    tapFirstLast: 'অহানবদগী অরোইবদা টিপউ',
    oddCardDesc: 'মসিদা খেন্নবা কার্ড অমত্তা লৈ।',
    whatIsObj: 'অবজেক্ট অসি করিনো?',
    orderRoutine: 'নুমিৎসিগী thবক অসি অয়ুক্তগী নুমিদাং ফাওবা সজোউ:',
    tapChronological: 'সিকোয়েন্সতা টিপউ',
    rememberWords: 'ৱাহৈশিং অসি নীংশিংউ!',
    selectWords: 'তালিকাদা য়াওরিবা ৱাহৈশিং খল্লু:',
    tapSubmit: 'টিপউ, অদুগা সবমিট তৌ',
    submitChoices: 'সবমিট',
    step: 'স্টেপ',
    back: '← হনবা',
    instTitle: 'করম্না শানগদগে',
    instructionsForLvl: 'লেভেলগী রুলশিং'
  },
  Khasi: {
    lockedDesc: 'Ialehkai Memory Match bad Sequence & Order ban ioh 70+ point ban plie ia kane.',
    trainDesc: 'Pynkhlain ia ka bor pyrkhat. Level ba la lah ban plie: Level',
    selectLevel: 'Thlang ia ka Level',
    challengeLvl: 'Ialehkai bad pynshongnia ia lade.',
    level: 'Level',
    unlocked: 'Ba la plie',
    locked: 'Locked',
    open: 'Plie',
    practiceAgain: 'Ialehkai pat',
    tryNextGame: 'Ialehkai game bud',
    playNextLevel: 'Ialehkai level bud',
    returnDash: 'Kynriah sha ka Dashboard',
    score: 'Points',
    accuracy: 'Accuracy',
    mistakes: 'Ki jingbakla',
    duration: 'Por',
    points: 'Points',
    seconds: 'seconds',
    excellent: 'Bha bha, {name}! 🌟',
    progress: 'Phi nang kiew, {name}! 👍',
    keepPracticing: 'Ialehkai pat, {name}! 💪',
    nextChallenge: 'Kwah ialehkai level thymmai? Jingshim khyndiat man ka sngi kan iarap bha.',
    visualStep: 'Jingpyni step {current} na {total}',
    close: 'Khang noh',
    next: 'Bud →',
    moves: 'Moves',
    pairsMatched: 'Matched pairs',
    rememberSeq: 'Kynmaw ia kane ka sequence!',
    startingIn: 'Kynriah ha ka',
    tapOrder: 'Tap ia ki tiar katkum ka sequence ba thikna:',
    tapFirstLast: 'Tap na kaba nyngkong sha kaba khadduh',
    oddCardDesc: 'Don tang 1 ka card kaba pher.',
    whatIsObj: 'Kiei kane ka tiar?',
    orderRoutine: 'Pynbeit ia ka kam naduh mynstep shaduh miet:',
    tapChronological: 'Tap ia ki katkum ka por',
    rememberWords: 'Kynmaw ia kine ki kyntien!',
    selectWords: 'Thlang ia ki kyntien kiba don ha ka list:',
    tapSubmit: 'Tap ban thlang, nangta click Submit',
    submitChoices: 'Submit',
    step: 'STEP',
    back: '← Back',
    instTitle: 'Kumno ban Ialehkai',
    instructionsForLvl: 'Rules ia ka Level'
  },
  Mizo: {
    lockedDesc: 'Memory Match leh Sequence & Order-ah 70+ i hmuh hnuah he hi a inhawng ang.',
    trainDesc: 'I rilru sawizawi rawh. Level inhawng zat: Level',
    selectLevel: 'Level thlang rawh',
    challengeLvl: 'Level hrang hrangah hian han ti chhin rawh.',
    level: 'Level',
    unlocked: 'Inhawng',
    locked: 'Inkharkhip',
    open: 'Dahna',
    practiceAgain: 'Ti nawn leh rawh',
    tryNextGame: 'Game dawt ti leh rawh',
    playNextLevel: 'Level dawt ti leh rawh',
    returnDash: 'Games Dashboard-ah kir rawh',
    score: 'Points',
    accuracy: 'Accuracy',
    mistakes: 'Jingbakla',
    duration: 'Hun',
    points: 'Points',
    seconds: 'seconds',
    excellent: 'I ti ṭha hle mai, {name}! 🌟',
    progress: 'I ti chak tulh tulh e, {name}! 👍',
    keepPracticing: 'Ti char char rawh, {name}! 💪',
    nextChallenge: 'A dawt leh atan i inpeih em? Nitin tih hian kawng a hawng thui khawp mai.',
    visualStep: 'Thlir ho na step {current} of {total}',
    close: 'Kharhna',
    next: 'Dawt leh →',
    moves: 'Moves',
    pairsMatched: 'Matched pairs',
    rememberSeq: 'He sequence hi hre reng rawh!',
    startingIn: 'Intan hun',
    tapOrder: 'A dawt dan dik takin hmet rawh:',
    tapFirstLast: 'A hmasa ber atanga a hnuhnung ber thlengin',
    oddCardDesc: 'Card danglam bik 1 chauh a awm.',
    whatIsObj: 'Eng thil nge he thil hi?',
    orderRoutine: 'Nitin thil tih hi zing atanga zan thlengin pynbeit rawh:',
    tapChronological: 'A hun zia zang danin hmet rawh',
    rememberWords: 'Heng thu mal te hi hre reng rawh!',
    selectWords: 'Thu mal list-a awm te kha thlang rawh:',
    tapSubmit: 'Thlang turin hmet la, chuan Submit rawh',
    submitChoices: 'Submit rawh',
    step: 'STEP',
    back: '← Kir leh',
    instTitle: 'Khelh dan tur',
    instructionsForLvl: 'Level Rules te'
  },
  Nagamese: {
    lockedDesc: 'Memory Match aro Sequence & Order te 70+ score kurikena etu khulibi.',
    trainDesc: 'Dimaag active kuribi. Max level unlocked: Level',
    selectLevel: 'Level select kuribi',
    challengeLvl: 'Apuni completed levels practice kuribole pare.',
    level: 'Level',
    unlocked: 'Khulise',
    locked: 'Locked',
    open: 'Khulibi',
    practiceAgain: 'Aro khelibi',
    tryNextGame: 'Next Game khelibi',
    playNextLevel: 'Next Level khelibi',
    returnDash: 'Return to Games Dashboard',
    score: 'Points',
    accuracy: 'Accuracy',
    mistakes: 'Mistakes',
    duration: 'Time taken',
    points: 'Points',
    seconds: 'seconds',
    excellent: 'Bisi bhal kaam kurise, {name}! 🌟',
    progress: 'Aro bhal hoikena ase, {name}! 👍',
    keepPracticing: 'Khelikena thakibi, {name}! 💪',
    nextChallenge: 'Next challenge kuribole mon ase na? Aji laga chutu step kali dangor help kuribo.',
    visualStep: 'Visual demo step {current} of {total}',
    close: 'Bondho kuribi',
    next: 'Agafalte →',
    moves: 'Moves',
    pairsMatched: 'Pairs matched',
    rememberSeq: 'Sequence mon te rakhbi!',
    startingIn: 'Intan hun',
    tapOrder: 'Thik order te tap kuribi:',
    tapFirstLast: 'Ahanba pora last falgte tap kuribi',
    oddCardDesc: 'Etu card sob alag ase.',
    whatIsObj: 'Etu ki saman ase?',
    orderRoutine: 'Daily routine ahanba pora last time falgte sjobi:',
    tapChronological: 'Time thik thaka falgte tap kuribi',
    rememberWords: 'Etu kotha khan mon te rakhbi!',
    selectWords: 'List te thaka kotha select kuribi:',
    tapSubmit: 'Select kurikena Submit kuribi',
    submitChoices: 'Submit Choices',
    step: 'STEP',
    back: '← Piche',
    instTitle: 'Khelibole bhal',
    instructionsForLvl: 'Rules for Level'
  },
  Tripuri: {
    lockedDesc: 'Memory Match te Sequence & Order te 70+ score hilakena khulidi.',
    trainDesc: 'Solom active khamdi. Max level unlocked: Level',
    selectLevel: 'Level thlangdi',
    challengeLvl: 'Level practice khamdi chichi.',
    level: 'Level',
    unlocked: 'Unlocked',
    locked: 'Locked',
    open: 'Khulidi',
    practiceAgain: 'Practice chikhadi',
    tryNextGame: 'Try Next Game',
    playNextLevel: 'Play Next Level',
    returnDash: 'Return to Games Dashboard',
    score: 'Points',
    accuracy: 'Accuracy',
    mistakes: 'Mistakes',
    duration: 'Duration',
    points: 'Points',
    seconds: 'seconds',
    excellent: 'Bisi kahm khailakha, {name}! 🌟',
    progress: 'Kahm chopha khailakha, {name}! 👍',
    keepPracticing: 'Keep practicing, {name}! 💪',
    nextChallenge: 'Next challenge hilani chichi? Dinni step kali results chokh khamdi.',
    visualStep: 'Visual demo step {current} of {total}',
    close: 'Bondho khamdi',
    next: 'Agafalte →',
    moves: 'Moves',
    pairsMatched: 'Pairs matched',
    rememberSeq: 'Etu sequence yaad hiladi!',
    startingIn: 'Intan hun',
    tapOrder: 'Thik order te tap khamdi:',
    tapFirstLast: 'Ahanba pora last falgte tap khamdi',
    oddCardDesc: 'Etu card sob alag.',
    whatIsObj: 'Etu ki saman?',
    orderRoutine: 'Daily routine sjobi morning to night:',
    tapChronological: 'Time thik thaka tap khamdi',
    rememberWords: 'Etu kotha yaad hiladi!',
    selectWords: 'List te thaka kotha select khamdi:',
    tapSubmit: 'Select khamdi, then Submit khamdi',
    submitChoices: 'Submit Choices',
    step: 'STEP',
    back: '← Piche',
    instTitle: 'Khelibole rules',
    instructionsForLvl: 'Rules for Level'
  }
};

const getRoutineLabel = (id: string, defaultLabel: string, lang: string) => {
  const dict: Record<string, Record<string, string>> = {
    wakeup: {
      English: 'Wake Up',
      Hindi: 'जागें',
      Bengali: 'ঘুম থেকে ওঠা',
      Assamese: 'সোণকালে উঠা',
      Manipuri: 'অয়ুক্তা হৌগৎপা',
      Khasi: 'Kyndit thiah',
      Mizo: 'Thawh a hun',
      Nagamese: 'Uthibo',
      Tripuri: 'Uthibo'
    },
    brush: {
      English: 'Brush Teeth',
      Hindi: 'दांत साफ करें',
      Bengali: 'দাঁত মাজা',
      Assamese: 'দাঁত ঘঁহা',
      Manipuri: 'য়া শেংবা',
      Khasi: 'Khein bniat',
      Mizo: 'Ha nawt',
      Nagamese: 'Brush kuribo',
      Tripuri: 'Brush kuribo'
    },
    breakfast: {
      English: 'Breakfast',
      Hindi: 'नाश्ता',
      Bengali: 'প্রাতঃরাশ',
      Assamese: 'জলপান',
      Manipuri: 'অয়ুক্তগী চাক',
      Khasi: 'Ja mynstep',
      Mizo: 'Zing chaw',
      Nagamese: 'Ahanba bhaat',
      Tripuri: 'Ahanba bhaat'
    },
    medicine: {
      English: 'Take Medicine',
      Hindi: 'दवा लें',
      Bengali: 'ওষুধ খাওয়া',
      Assamese: 'ঔষধ খোৱা',
      Manipuri: 'হিদাক চাবা',
      Khasi: 'Dih dawai',
      Mizo: 'Damdawi ei',
      Nagamese: 'Dawai khabi',
      Tripuri: 'Dawai khabi'
    },
    walk: {
      English: 'Evening Walk',
      Hindi: 'शाम की सैर',
      Bengali: 'সন্ধ্যাবেলা হাঁটা',
      Assamese: 'ধীৰে ধীৰে খোজ কঢ়া',
      Manipuri: 'নুমিদাংগী এক্সরসাইজ',
      Khasi: 'Iaid kai janmiet',
      Mizo: 'Tlai len',
      Nagamese: 'Evening walk',
      Tripuri: 'Evening walk'
    },
    dinner: {
      English: 'Dinner',
      Hindi: 'रात का भोजन',
      Bengali: 'রাতের আহার',
      Assamese: 'ৰাতিৰ আহাৰ',
      Manipuri: 'নুমিদাংগী চাক',
      Khasi: 'Ja miet',
      Mizo: 'Zan chaw',
      Nagamese: 'Rati laga bhaat',
      Tripuri: 'Rati laga bhaat'
    },
    sleep: {
      English: 'Go to Sleep',
      Hindi: 'सोने जाएं',
      Bengali: 'ঘুমাতে যাওয়া',
      Assamese: 'শুবলৈ যোৱা',
      Manipuri: 'তুম্বা য়োৎপা',
      Khasi: 'Thiah noh',
      Mizo: 'Mut a hun',
      Nagamese: 'Sleep',
      Tripuri: 'Sleep'
    }
  };
  return dict[id]?.[lang] || defaultLabel;
};

const getAttentionTitle = (oddName: string, normalName: string, lang: string) => {
  if (lang === 'Hindi') return `${normalName} के बीच ${oddName} को खोजें`;
  if (lang === 'Bengali') return `${normalName}-এর মধ্যে ${oddName} খুঁজুন`;
  if (lang === 'Assamese') return `${normalName} ৰ মাজত ${oddName} বাছক`;
  if (lang === 'Manipuri') return `${normalName}গী মরক্তগী ${oddName} খনবিউ`;
  if (lang === 'Khasi') return `Shem ia ka ${oddName} na pdeng ki ${normalName}`;
  if (lang === 'Mizo') return `${normalName} zinga ${oddName} zawnna`;
  if (lang === 'Nagamese') return `${normalName} bhitor te ${oddName} thungbi`;
  if (lang === 'Tripuri') return `${normalName} bhitor te ${oddName} thungdi`;
  return `Find the ${oddName.toLowerCase()} among ${normalName.toLowerCase()}s`;
};

export const BrainGames: React.FC = () => {
  const { t, language } = useLanguage();
  const gt = gameTranslations[language] || gameTranslations.English;
  const location = useLocation();

  const currentUser = storageService.getCurrentUser();
  const userName = currentUser ? currentUser.name : 'Patient';

  // Game States
  const [games, setGames] = useState<GameScoreWithLevel[]>([]);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [gameStep, setGameStep] = useState<'idle' | 'playing' | 'result'>('idle');
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (location.state && (location.state as any).gameId) {
      const gId = (location.state as any).gameId;
      setActiveGame(gId);
      setSelectedLevel(null);
      setShowInstructions(false);
      setGameStep('idle');
    }
  }, [location.state]);

  // Game Statistics (Session)
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [sessionAccuracy, setSessionAccuracy] = useState<number>(100);
  const [sessionMistakes, setSessionMistakes] = useState<number>(0);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);

  // --- INDIVIDUAL GAME STATE ---
  // Memory Match
  const [cards, setCards] = useState<{ id: number; symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);

  // Sequence & Order
  const [seqOriginal, setSeqOriginal] = useState<{ id: string; label: string; emoji: string }[]>([]);
  const [seqShuffled, setSeqShuffled] = useState<{ id: string; label: string; emoji: string }[]>([]);
  const [seqSelected, setSeqSelected] = useState<{ id: string; label: string; emoji: string }[]>([]);
  const [seqPreviewing, setSeqPreviewing] = useState(true);
  const [seqPreviewTimeLeft, setSeqPreviewTimeLeft] = useState(5);

  // Attention Focus
  const [attentionTarget, setAttentionTarget] = useState<number>(-1);
  const [attentionItems, setAttentionItems] = useState<string[]>([]);
  const [attentionSetTitle, setAttentionSetTitle] = useState('');

  // Object Recognition
  const [objRoundsTotal, setObjRoundsTotal] = useState(3);
  const [objRoundCurrent, setObjRoundCurrent] = useState(0);
  const [objTarget, setObjTarget] = useState<any>(null);
  const [objOptions, setObjOptions] = useState<string[]>([]);
  const [objCorrectCount, setObjCorrectCount] = useState(0);

  // Daily Routine Recall
  const [routineOriginal, setRoutineOriginal] = useState<any[]>([]);
  const [routineShuffled, setRoutineShuffled] = useState<any[]>([]);
  const [routineSelected, setRoutineSelected] = useState<any[]>([]);

  // Language Memory
  const [langOriginal, setLangOriginal] = useState<string[]>([]);
  const [langChoices, setLangChoices] = useState<string[]>([]);
  const [langSelected, setLangSelected] = useState<string[]>([]);
  const [langPreviewing, setLangPreviewing] = useState(true);
  const [langPreviewTimeLeft, setLangPreviewTimeLeft] = useState(5);

  useEffect(() => {
    storageService.init();
    setGames(storageService.getGames());
  }, []);

  // Timer for preview sequences
  useEffect(() => {
    let timer: any;
    if (activeGame === 'game-2' && gameStep === 'playing' && seqPreviewing && seqPreviewTimeLeft > 0) {
      timer = setTimeout(() => setSeqPreviewTimeLeft(p => p - 1), 1000);
    } else if (activeGame === 'game-2' && gameStep === 'playing' && seqPreviewing && seqPreviewTimeLeft === 0) {
      setSeqPreviewing(false);
    }

    if (activeGame === 'game-6' && gameStep === 'playing' && langPreviewing && langPreviewTimeLeft > 0) {
      timer = setTimeout(() => setLangPreviewTimeLeft(p => p - 1), 1000);
    } else if (activeGame === 'game-6' && gameStep === 'playing' && langPreviewing && langPreviewTimeLeft === 0) {
      setLangPreviewing(false);
    }

    return () => clearTimeout(timer);
  }, [seqPreviewing, seqPreviewTimeLeft, langPreviewing, langPreviewTimeLeft, gameStep, activeGame]);

  const getInstructions = (gameId: string) => {
    switch (gameId) {
      case 'game-1':
        return {
          title: t('inst.mm.title') || 'Memory Match',
          explain: t('inst.mm.explain') || 'Find the matching pairs of cards.',
          steps: [
            t('inst.mm.step1') || '1. Tap two cards to turn them over.',
            t('inst.mm.step2') || '2. Remember where symbols are.',
            t('inst.mm.step3') || '3. Match identical symbols.',
            t('inst.mm.step4') || '4. Match all cards to win.'
          ]
        };
      case 'game-2':
        return {
          title: t('inst.so.title') || 'Sequence & Order',
          explain: t('inst.so.explain') || 'Remember the sequence of items and order them correctly.',
          steps: [
            t('inst.so.step1') || '1. Look closely at the sequence of items.',
            t('inst.so.step2') || '2. Remember their order before they vanish.',
            t('inst.so.step3') || '3. Tap them in the exact order they appeared.',
            t('inst.so.step4') || '4. Put them all in place to solve.'
          ]
        };
      case 'game-3':
        return {
          title: t('inst.af.title') || 'Attention Focus',
          explain: t('inst.af.explain') || 'Spot the odd emoji that is different.',
          steps: [
            t('inst.af.step1') || '1. Scan the grid of cards.',
            t('inst.af.step2') || '2. Find the one card showing a different emoji.',
            t('inst.af.step3') || '3. Tap the odd card.',
            t('inst.af.step4') || '4. Try to be quick and accurate.'
          ]
        };
      case 'game-4':
        return {
          title: t('inst.or.title') || 'Object Recognition',
          explain: t('inst.or.explain') || 'Identify everyday objects shown as pictures.',
          steps: [
            t('inst.or.step1') || '1. Look at the object emoji.',
            t('inst.or.step2') || '2. Think of its name.',
            t('inst.or.step3') || '3. Choose the correct label below.',
            t('inst.or.step4') || '4. Complete all questions.'
          ]
        };
      case 'game-5':
        return {
          title: t('inst.dr.title') || 'Daily Routine Recall',
          explain: t('inst.dr.explain') || 'Sort daily activities in their logical order.',
          steps: [
            t('inst.dr.step1') || '1. Look at the routine activities.',
            t('inst.dr.step2') || '2. Think of a normal daily sequence.',
            t('inst.dr.step3') || '3. Tap them from morning to night.',
            t('inst.dr.step4') || '4. Put the day in order.'
          ]
        };
      case 'game-6':
        return {
          title: t('inst.lm.title') || 'Language & Word Memory',
          explain: t('inst.lm.explain') || 'Remember a list of local words.',
          steps: [
            t('inst.lm.step1') || '1. Read the list of words.',
            t('inst.lm.step2') || '2. Commit them to memory.',
            t('inst.lm.step3') || '3. Identify which words were on the list.',
            t('inst.lm.step4') || '4. Tap the correct ones.'
          ]
        };
      default:
        return { title: '', explain: '', steps: [] };
    }
  };

  const handleSelectGame = (gameId: string | null) => {
    setActiveGame(gameId);
    setSelectedLevel(null);
    setShowInstructions(false);
    setGameStep('idle');
    if (!gameId) {
      setGames(storageService.getGames());
    }
  };

  const handleSelectLevel = (level: number) => {
    setSelectedLevel(level);
    setShowInstructions(true);
  };

  const initializeGameStateForLevel = (gId: string, level: number) => {
    if (gId === 'game-1') {
      const pairsCount = level === 1 ? 2 : level === 2 ? 3 : level === 3 ? 4 : level === 4 ? 6 : 8;
      const datasetItems = getDailyCognitiveSelection(10 + level, pairsCount);
      const pool = datasetItems.map(item => item.emoji);
      const shuffled = [...pool, ...pool]
        .map((symbol, idx) => ({ id: idx, symbol, flipped: false, matched: false }))
        .sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setSelectedCards([]);
      setMemoryMoves(0);
    } else if (gId === 'game-2') {
      const count = 2 + level;
      const rawItems = getDailyCognitiveSelection(20 + level, count);
      const selected = rawItems.map(item => ({ id: item.id, label: item.name, emoji: item.emoji }));
      setSeqOriginal(selected);
      setSeqShuffled([...selected].sort(() => Math.random() - 0.5));
      setSeqSelected([]);
      setSeqPreviewing(true);
      setSeqPreviewTimeLeft(Math.max(2, 6 - level));
    } else if (gId === 'game-3') {
      const size = level === 1 ? 4 : level === 2 ? 6 : level === 3 ? 9 : level === 4 ? 12 : 16;
      const rawItems = getDailyCognitiveSelection(30 + level + Math.floor(Math.random() * 100), 2);
      const normalItem = rawItems[0] || { emoji: '🦁', name: 'Lion' };
      const oddItem = rawItems[1] || { emoji: '🐯', name: 'Tiger' };
      const title = getAttentionTitle(oddItem.name, normalItem.name, language);
      setAttentionSetTitle(title);

      const items = Array(size).fill(normalItem.emoji);
      const oddIndex = Math.floor(Math.random() * size);
      items[oddIndex] = oddItem.emoji;

      setAttentionItems(items);
      setAttentionTarget(oddIndex);
    } else if (gId === 'game-4') {
      const rounds = level + 1;
      setObjRoundsTotal(rounds);
      setObjRoundCurrent(0);
      setObjCorrectCount(0);
      const rawRounds = getDailyCognitiveSelection(40 + level + Math.floor(Math.random() * 50), rounds);
      (window as any)._pregeneratedRecognitionRounds = rawRounds.map((target, idx) => {
        const distractors = getDailyCognitiveSelection(50 + level + idx * 5 + Math.floor(Math.random() * 30), 4)
          .filter(item => item.id !== target.id)
          .slice(0, 3);
        const options = [target.name, ...distractors.map(d => d.name)].sort(() => Math.random() - 0.5);
        return { emoji: target.emoji, answer: target.name, options };
      });
      loadObjectRecognitionRound(0);
    } else if (gId === 'game-5') {
      const count = 2 + level;
      const selected = routineEvents.slice(0, count);
      setRoutineOriginal(selected);
      setRoutineShuffled([...selected].sort(() => Math.random() - 0.5));
      setRoutineSelected([]);
    } else if (gId === 'game-6') {
      const count = 1 + level;
      const rawOriginal = getDailyCognitiveSelection(60 + level, count);
      const original = rawOriginal.map(item => item.name.toUpperCase());
      const rawDistractors = getDailyCognitiveSelection(70 + level, count + 4)
        .filter(item => !original.includes(item.name.toUpperCase()))
        .slice(0, 4);
      const distractors = rawDistractors.map(item => item.name.toUpperCase());
      const choices = [...original, ...distractors].sort(() => Math.random() - 0.5);

      setLangOriginal(original);
      setLangChoices(choices);
      setLangSelected([]);
      setLangPreviewing(true);
      setLangPreviewTimeLeft(Math.max(3, 7 - level));
    }
  };

  const handleStartGame = () => {
    setShowInstructions(false);
    setGameStep('playing');
    setStartTime(Date.now());
    setSessionMistakes(0);

    const level = selectedLevel || 1;
    if (activeGame) {
      initializeGameStateForLevel(activeGame, level);
    }
  };

  // Progression Action Helpers
  const handlePlayNextLevel = () => {
    if (!activeGame) return;
    const currentUnlocked = games.find(g => g.gameId === activeGame)?.unlockedLevel || 1;
    const currentLvl = selectedLevel || 1;
    const nextLvl = currentLvl + 1;

    const targetLvl = Math.min(5, Math.max(nextLvl, currentUnlocked));
    setSelectedLevel(targetLvl);
    setShowInstructions(false);
    setGameStep('playing');
    setStartTime(Date.now());
    setSessionMistakes(0);

    initializeGameStateForLevel(activeGame, targetLvl);
  };

  // --- GAME PLAY HANDLERS ---

  // Memory Match Click
  const handleCardClick = (idx: number) => {
    if (selectedCards.length >= 2 || cards[idx].flipped || cards[idx].matched) return;

    const updated = [...cards];
    updated[idx].flipped = true;
    setCards(updated);

    const newSelected = [...selectedCards, idx];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMemoryMoves(m => m + 1);
      const [first, second] = newSelected;
      if (cards[first].symbol === cards[second].symbol) {
        // Matched
        setTimeout(() => {
          const matched = cards.map((c, i) => (i === first || i === second ? { ...c, matched: true } : c));
          setCards(matched);
          setSelectedCards([]);

          if (matched.every(c => c.matched)) {
            // Game Finished
            const duration = Math.round((Date.now() - startTime) / 1000);
            const mistakes = memoryMoves - (cards.length / 2) + 1;
            const accuracy = Math.round(((cards.length / 2) / memoryMoves) * 100);
            finishGame(accuracy, mistakes, duration);
          }
        }, 500);
      } else {
        // Not Matched
        setSessionMistakes(m => m + 1);
        setTimeout(() => {
          const flippedBack = cards.map((c, i) => (i === first || i === second ? { ...c, flipped: false } : c));
          setCards(flippedBack);
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  // Sequence & Order Click
  const handleSeqCardClick = (item: any) => {
    if (seqSelected.some(s => s.id === item.id)) return;

    const newSelected = [...seqSelected, item];
    setSeqSelected(newSelected);

    // Validate as they type (or at the end)
    const expected = seqOriginal[newSelected.length - 1];
    if (item.id !== expected.id) {
      setSessionMistakes(m => m + 1);
    }

    if (newSelected.length === seqOriginal.length) {
      // Completed Sequence
      const correctCount = newSelected.filter((s, idx) => s.id === seqOriginal[idx].id).length;
      const accuracy = Math.round((correctCount / seqOriginal.length) * 100);
      const duration = Math.round((Date.now() - startTime) / 1000);
      setTimeout(() => {
        finishGame(accuracy, seqOriginal.length - correctCount, duration);
      }, 500);
    }
  };

  // Attention Focus Click
  const handleAttentionClick = (idx: number) => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    if (idx === attentionTarget) {
      // Correct
      finishGame(100, sessionMistakes, duration);
    } else {
      // Wrong card
      setSessionMistakes(m => m + 1);
    }
  };

  // Object Recognition Load
  const loadObjectRecognitionRound = (roundIdx: number) => {
    const list = (window as any)._pregeneratedRecognitionRounds || [];
    const roundObj = list[roundIdx] || { emoji: '🍎', answer: 'Apple', options: ['Apple', 'Banana', 'Rose', 'Clock'] };
    setObjTarget(roundObj);
    setObjOptions(roundObj.options);
  };

  // Object Recognition Select
  const handleObjOptionSelect = (opt: string) => {
    const isCorrect = opt === objTarget.answer;
    const newCorrect = isCorrect ? objCorrectCount + 1 : objCorrectCount;
    setObjCorrectCount(newCorrect);

    if (!isCorrect) {
      setSessionMistakes(m => m + 1);
    }

    const nextRound = objRoundCurrent + 1;
    if (nextRound < objRoundsTotal) {
      setObjRoundCurrent(nextRound);
      loadObjectRecognitionRound(nextRound);
    } else {
      // Finish
      const accuracy = Math.round((newCorrect / objRoundsTotal) * 100);
      const duration = Math.round((Date.now() - startTime) / 1000);
      finishGame(accuracy, objRoundsTotal - newCorrect, duration);
    }
  };

  // Daily Routine Click
  const handleRoutineClick = (item: any) => {
    if (routineSelected.some(s => s.id === item.id)) return;
    setRoutineSelected([...routineSelected, item]);
  };

  const handleRemoveRoutineItem = (idx: number) => {
    const newSelected = [...routineSelected];
    newSelected.splice(idx, 1);
    setRoutineSelected(newSelected);
  };

  const handleRoutineSubmit = () => {
    if (routineSelected.length !== routineOriginal.length) return;

    const correctCount = routineSelected.filter((s, idx) => s.id === routineOriginal[idx].id).length;
    const accuracy = Math.round((correctCount / routineOriginal.length) * 100);
    const duration = Math.round((Date.now() - startTime) / 1000);

    let mistakes = 0;
    routineSelected.forEach((item, idx) => {
      if (item.id !== routineOriginal[idx].id) {
        mistakes += 1;
      }
    });

    setSessionMistakes(mistakes);
    finishGame(accuracy, mistakes, duration);
  };

  // Language Memory Select
  const handleLangWordToggle = (word: string) => {
    let updated;
    if (langSelected.includes(word)) {
      updated = langSelected.filter(w => w !== word);
    } else {
      updated = [...langSelected, word];
    }
    setLangSelected(updated);
  };

  const handleLangSubmit = () => {
    // Check accuracy
    const correctCount = langSelected.filter(w => langOriginal.includes(w)).length;
    const extraWrong = langSelected.filter(w => !langOriginal.includes(w)).length;
    const missed = langOriginal.filter(w => !langSelected.includes(w)).length;

    const scorePct = Math.max(0, Math.round(((correctCount) / (langOriginal.length + extraWrong)) * 100));
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    finishGame(scorePct, extraWrong + missed, duration);
  };

  // --- FINISH AND PROGRESSION ENGINE ---
  const finishGame = async (accuracy: number, mistakes: number, duration: number) => {
    const level = selectedLevel || 1;
    
    // Performance-based score calculation (Strictly dynamic: 15 to 100 pts):
    // Accuracy is primary factor; deductions applied for mistakes made during session.
    // Level 1 or Level 2 completion NEVER defaults to 100 points automatically.
    const mistakePenalty = mistakes * 5;
    const rawScore = accuracy - mistakePenalty;
    const finalScore = Math.max(15, Math.min(100, Math.round(rawScore)));

    setSessionScore(finalScore);
    setSessionAccuracy(accuracy);
    setSessionMistakes(mistakes);
    setSessionDuration(duration);
    setGameStep('result');

    // Save session logs & update unlocks
    const updatedGames = games.map(g => {
      if (g.gameId === activeGame) {
        const best = Math.max(g.bestScore, finalScore);
        
        // Progress level unlock if they scored >= 70
        const currentUnlocked = g.unlockedLevel || 1;
        let nextUnlocked = currentUnlocked;
        if (finalScore >= 70 && level === currentUnlocked) {
          nextUnlocked = Math.min(5, currentUnlocked + 1);
        }

        return {
          ...g,
          bestScore: best,
          unlockedLevel: nextUnlocked,
          completedToday: true
        };
      }
      return g;
    });

    setGames(updatedGames);
    storageService.saveGames(updatedGames);

    // Save history session log
    const sessionRecord = {
      sessionId: `sess-${Date.now()}`,
      patientId: currentUser?.id || 'ravi-demo',
      gameId: activeGame,
      gameName: games.find(g => g.gameId === activeGame)?.gameName || 'Brain Game',
      level,
      score: finalScore,
      accuracy,
      mistakes,
      duration,
      completedAt: new Date().toISOString()
    };
    storageService.addGameSession(sessionRecord);

    // Synchronize to backend if online
    if (apiClient.getStatus() === 'connected') {
      await apiClient.post(`/games/${activeGame}/submit`, sessionRecord);
    }

    // Caregiver log alerts
    const alerts = storageService.getAlerts();
    const gameLabel = games.find(g => g.gameId === activeGame)?.gameName || 'Brain Game';
    storageService.saveAlerts([
      {
        id: `al-${Date.now()}`,
        type: 'success',
        title: `${userName} completed ${gameLabel} Level ${level} (${finalScore} pts)`,
        time: 'Just now'
      },
      ...alerts
    ]);
  };

  // Progression Action Helpers
  const handleTryNextGame = () => {
    // Find next unlocked game in order
    const currentIndex = games.findIndex(g => g.gameId === activeGame);
    const nextGames = games.slice(currentIndex + 1);
    
    // Check if next games are unlocked
    const mmScore = games.find(g => g.gameId === 'game-1')?.bestScore || 0;
    const soScore = games.find(g => g.gameId === 'game-2')?.bestScore || 0;
    const restUnlocked = mmScore >= 70 && soScore >= 70;

    const nextGame = nextGames.find(g => {
      const isLocked = (g.gameId !== 'game-1' && g.gameId !== 'game-2') && !restUnlocked;
      return !isLocked;
    });

    if (nextGame) {
      handleSelectGame(nextGame.gameId);
    } else {
      setActiveGame(null);
    }
  };

  const getGameNameTranslated = (gameId: string, defaultName: string) => {
    if (gameId === 'game-1') return t('games.memoryMatch');
    if (gameId === 'game-2') return t('games.sequenceOrder');
    if (gameId === 'game-3') return t('games.attentionFocus');
    if (gameId === 'game-4') return t('games.objectRecognition');
    if (gameId === 'game-5') return t('games.dailyRoutineRecall');
    if (gameId === 'game-6') return t('games.languageWordMemory');
    return defaultName;
  };

  const completedCount = games.filter(g => g.completedToday).length;
  const overallScore = Math.round(games.reduce((acc, g) => acc + (g.bestScore || 0), 0) / (games.length || 6));
  
  // Calculate streak from storage history for current user
  const gameSessions = storageService.getGameSessions();
  const userSessions = gameSessions.filter((s: any) => !s.patientId || s.patientId === currentUser?.id);
  const uniqueDays = new Set(userSessions.map(s => s.completedAt?.split('T')[0])).size;
  const currentStreak = uniqueDays;

  return (
    <div className="pb-12 space-y-8">
      {/* Active Game Back Header */}
      {activeGame && (
        <div className="flex items-center justify-between border-b border-brand-purpleLight pb-4">
          <button 
            onClick={() => handleSelectGame(null as any)} 
            className="flex items-center gap-2 text-brand-purple font-bold"
          >
            <ArrowLeft className="w-5 h-5" /> {t('inst.back')}
          </button>
          <h2 className="font-extrabold text-xl text-brand-navy">
            {getGameNameTranslated(activeGame, games.find(g => g.gameId === activeGame)?.gameName || '')}
          </h2>
          {selectedLevel && (
            <span className="text-sm font-black bg-brand-purpleLight text-brand-purple px-3 py-1 rounded-full">
              {gt.level} {selectedLevel}
            </span>
          )}
        </div>
      )}

      {/* 2. Main Dashboard Layout (if no active game chosen) */}
      {!activeGame && (
        <>
          {/* Top 3 Progress Summary Cards matching Reference Image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Today's Brain Training */}
            <div className="bg-white p-6 rounded-3xl border-2 border-brand-purpleLight shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shadow-2xs">
                    <Target className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-brand-grayText uppercase tracking-wider block">Today's Brain Training</span>
                    <span className="text-3xl font-black text-brand-navy">{completedCount} / 6</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${(completedCount / 6) * 100}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-brand-grayText">
                  Keep playing to complete your daily goals.
                </p>
              </div>
            </div>

            {/* Card 2: Overall Score */}
            <div className="bg-white p-6 rounded-3xl border-2 border-brand-purpleLight shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center shadow-2xs">
                    <Trophy className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-brand-grayText uppercase tracking-wider block flex items-center gap-1">
                      Overall Score <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </span>
                    <span className="text-3xl font-black text-brand-navy">{overallScore}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200">
                  <div 
                    className="bg-gradient-to-r from-brand-purple to-indigo-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${overallScore}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-emerald-600">
                  {overallScore >= 70 ? 'Great progress!' : 'Keep practicing to boost your score!'}
                </p>
              </div>
            </div>

            {/* Card 3: Current Streak */}
            <div className="bg-white p-6 rounded-3xl border-2 border-brand-purpleLight shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shadow-2xs">
                    <Flame className="w-6 h-6 stroke-[2.5] text-orange-500 fill-orange-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-brand-grayText uppercase tracking-wider block">Current Streak</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-brand-navy">{currentStreak}</span>
                      <span className="text-xs font-extrabold text-brand-grayText">Days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-orange-50/80 border border-orange-200/60 p-2.5 rounded-2xl text-center">
                <span className="text-xs font-black text-orange-700">You're doing amazing! 🔥</span>
              </div>
            </div>
          </div>

          {/* Brain Games Section Header matching Reference Image */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-purple text-white flex items-center justify-center shadow-md">
                <SVGBrain className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-brand-navy">Brain Games</h2>
                <p className="text-brand-grayText font-bold text-sm">Fun activities to keep your mind active and healthy</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-brand-purpleLight shadow-2xs text-xs font-black text-brand-purple">
              <span>Train 6 skills</span>
              <span>•</span>
              <span>Build a healthier mind</span>
              <span>•</span>
              <span>Feel better every day</span>
            </div>
          </div>

          {/* Six Game cards listing matching Reference Image visual style & pill buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              return games.map((g) => {
                const isLocked = false;

                return (
                  <div 
                    key={g.gameId}
                    className={`bg-white p-6 rounded-3xl border-2 border-brand-purpleLight shadow-sm flex flex-col justify-between hover:shadow-md hover:scale-[1.01] transition-all relative group ${
                      isLocked ? 'opacity-70 bg-gray-50/70' : ''
                    }`}
                  >
                    {isLocked && (
                      <div className="absolute top-4 right-4 text-brand-grayText bg-gray-100 p-2.5 rounded-full shadow-2xs z-20">
                        <Lock className="w-5 h-5" />
                      </div>
                    )}

                    <div>
                      {/* Illustration Container with Category Badge */}
                      <div className={`w-full h-40 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-[1.03] shadow-xs relative overflow-hidden ${
                        g.gameId === 'game-1' ? 'bg-gradient-to-br from-purple-200 via-indigo-100 to-purple-100 border border-purple-200' :
                        g.gameId === 'game-2' ? 'bg-gradient-to-br from-emerald-200 via-teal-100 to-green-100 border border-teal-200' :
                        g.gameId === 'game-3' ? 'bg-gradient-to-br from-amber-200 via-orange-100 to-peach-100 border border-orange-200' :
                        g.gameId === 'game-4' ? 'bg-gradient-to-br from-sky-200 via-cyan-100 to-blue-100 border border-sky-200' :
                        g.gameId === 'game-5' ? 'bg-gradient-to-br from-rose-200 via-pink-100 to-red-100 border border-rose-200' :
                        'bg-gradient-to-br from-blue-200 via-indigo-100 to-sky-100 border border-blue-200'
                      }`}>
                        {/* Top Left Icon Badge */}
                        <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs z-10 ${
                          g.gameId === 'game-1' ? 'bg-purple-600' :
                          g.gameId === 'game-2' ? 'bg-emerald-600' :
                          g.gameId === 'game-3' ? 'bg-orange-500' :
                          g.gameId === 'game-4' ? 'bg-sky-600' :
                          g.gameId === 'game-5' ? 'bg-pink-600' :
                          'bg-indigo-600'
                        }`}>
                          {g.gameId === 'game-1' && <span className="text-xs">🎴</span>}
                          {g.gameId === 'game-2' && <span className="text-xs">💡</span>}
                          {g.gameId === 'game-3' && <span className="text-xs">👁️</span>}
                          {g.gameId === 'game-4' && <span className="text-xs">🔍</span>}
                          {g.gameId === 'game-5' && <span className="text-xs">📅</span>}
                          {g.gameId === 'game-6' && <span className="text-xs">💬</span>}
                        </div>

                        {/* Feature Vector Illustration */}
                        {g.gameId === 'game-1' && <SVGBrainGame className="w-28 h-28 drop-shadow-md transform transition-transform group-hover:scale-105" />}
                        {g.gameId === 'game-2' && <SVGSequenceGame className="w-28 h-28 drop-shadow-md transform transition-transform group-hover:scale-105" />}
                        {g.gameId === 'game-3' && <SVGAttentionGame className="w-28 h-28 drop-shadow-md transform transition-transform group-hover:scale-105" />}
                        {g.gameId === 'game-4' && <SVGObjectGame className="w-28 h-28 drop-shadow-md transform transition-transform group-hover:scale-105" />}
                        {g.gameId === 'game-5' && <SVGRoutineGame className="w-28 h-28 drop-shadow-md transform transition-transform group-hover:scale-105" />}
                        {g.gameId === 'game-6' && <SVGLanguageGame className="w-28 h-28 drop-shadow-md transform transition-transform group-hover:scale-105" />}
                      </div>

                      <h3 className="font-black text-xl text-brand-navy leading-tight">
                        {getGameNameTranslated(g.gameId, g.gameName)}
                      </h3>
                      <p className="text-sm font-semibold text-brand-grayText mt-2 leading-relaxed">
                        {g.gameId === 'game-1' ? 'Find and match pairs of cards to boost your memory.' :
                         g.gameId === 'game-2' ? 'Remember the correct sequence and order.' :
                         g.gameId === 'game-3' ? 'Spot the differences and sharpen your attention.' :
                         g.gameId === 'game-4' ? 'Look, identify and remember everyday objects.' :
                         g.gameId === 'game-5' ? 'Recall your daily activities and routines.' :
                         'Listen to stories, remember words and answer.'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-brand-purpleLight flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-brand-grayText block leading-tight">Best Score</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <AchievementTrophy score={g.bestScore || 0} className="w-4 h-4" />
                          <span className="text-base font-black text-brand-navy">{g.bestScore || 0}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (isLocked) return;
                          handleSelectGame(g.gameId);
                        }}
                        disabled={isLocked}
                        className={`px-6 py-2.5 rounded-full text-sm font-black transition-all shadow-md flex items-center gap-1 text-white hover:scale-105 active:scale-95 ${
                          isLocked 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                            : g.gameId === 'game-1' ? 'bg-purple-600 hover:bg-purple-700' :
                              g.gameId === 'game-2' ? 'bg-emerald-600 hover:bg-emerald-700' :
                              g.gameId === 'game-3' ? 'bg-orange-500 hover:bg-orange-600' :
                              g.gameId === 'game-4' ? 'bg-sky-600 hover:bg-sky-700' :
                              g.gameId === 'game-5' ? 'bg-pink-600 hover:bg-pink-700' :
                              'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        <span>Play</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Bottom Motivational Banner matching Reference Image */}
          <div className="bg-gradient-to-r from-amber-100 via-emerald-100 to-teal-100 border border-emerald-200/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-sm flex-shrink-0 animate-bounce" style={{ animationDuration: '4s' }}>
                <SVGBrain className="w-12 h-12 text-brand-purple" />
              </div>
              <div>
                <h4 className="text-lg font-black text-brand-navy">Small steps today, a sharper mind tomorrow! 💙</h4>
                <p className="text-xs font-bold text-brand-grayText mt-0.5 font-sans">"Keep going... You're doing great!"</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xs px-5 py-3 rounded-2xl border border-emerald-200 shadow-xs">
              <span className="text-2xl">🐭</span>
              <span className="text-xs font-black text-brand-navy">Let's play and keep your mind active!</span>
            </div>
          </div>
        </>
      )}

      {/* 3. Upgraded Level Selection Screen */}
      {activeGame && !selectedLevel && (
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border-2 border-brand-purpleLight shadow-md space-y-6">
          <div className="text-center border-b border-brand-purpleLight pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              {activeGame === 'game-1' && <SVGBrainGame className="w-12 h-12" />}
              {activeGame === 'game-2' && <SVGSequenceGame className="w-12 h-12" />}
              {activeGame === 'game-3' && <SVGAttentionGame className="w-12 h-12" />}
              {activeGame === 'game-4' && <SVGObjectGame className="w-12 h-12" />}
              {activeGame === 'game-5' && <SVGRoutineGame className="w-12 h-12" />}
              {activeGame === 'game-6' && <SVGLanguageGame className="w-12 h-12" />}
              <h3 className="text-2xl sm:text-3xl font-black text-brand-navy">
                {getGameNameTranslated(activeGame, games.find(g => g.gameId === activeGame)?.gameName || '')}
              </h3>
            </div>
            <p className="text-brand-grayText font-bold text-sm sm:text-base">{gt.challengeLvl}</p>
          </div>

          <div className="relative space-y-4">
            {/* Visual connector line linking progression nodes */}
            <div className="absolute left-10 top-8 bottom-8 w-1 bg-gradient-to-b from-brand-purple via-indigo-300 to-gray-200 z-0 hidden sm:block" />

            {(() => {
              const activeGameData = games.find(g => g.gameId === activeGame);
              const maxUnlocked = activeGameData?.unlockedLevel || 1;

              return Array.from({ length: 5 }).map((_, idx) => {
                const lvl = idx + 1;
                const isLvlLocked = lvl > maxUnlocked;
                const meta = levelMetadata[lvl] || levelMetadata[1];
                const isCompleted = lvl < maxUnlocked;
                const isCurrentActive = lvl === maxUnlocked;

                return (
                  <div
                    key={lvl}
                    className={`relative z-10 overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isLvlLocked 
                        ? 'border-gray-200 bg-gray-50/80 opacity-60'
                        : isCurrentActive
                        ? 'border-brand-purple bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-purple-50/90 shadow-md hover:scale-[1.01]'
                        : 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xs flex-shrink-0 z-10 ${
                        isLvlLocked 
                          ? 'bg-gray-200 text-gray-400' 
                          : isCurrentActive
                          ? 'bg-brand-purple text-white shadow-purple-500/20' 
                          : 'bg-emerald-600 text-white shadow-emerald-500/20'
                      }`}>
                        {isLvlLocked ? <Lock className="w-6 h-6" /> : meta.emoji}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black uppercase tracking-wider text-brand-purple bg-white px-2 py-0.5 rounded-md border border-brand-purpleLight">
                            {gt.level} {lvl}
                          </span>
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white/90 border border-gray-200 text-brand-navy">
                            {meta.diffKey}
                          </span>
                          {isCompleted && (
                            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> ✓ COMPLETED
                            </span>
                          )}
                          {isCurrentActive && (
                            <span className="text-xs font-black text-brand-purple bg-brand-purpleLight px-2.5 py-0.5 rounded-full">
                              ⭐ Ready to Play
                            </span>
                          )}
                          {isLvlLocked && (
                            <span className="text-xs font-extrabold text-gray-500 bg-gray-200 px-2.5 py-0.5 rounded-full">
                              🔒 Complete Level {lvl - 1} to Unlock
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-black text-brand-navy">{meta.titleKey}</h4>
                        <p className="text-xs sm:text-sm font-semibold text-brand-grayText">{meta.descKey}</p>
                      </div>
                    </div>

                    <div className="self-end sm:self-center">
                      <button
                        disabled={isLvlLocked}
                        onClick={() => handleSelectLevel(lvl)}
                        className={`px-6 py-3 rounded-xl text-sm font-black transition-all shadow-sm flex items-center gap-2 ${
                          isLvlLocked
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : isCurrentActive
                            ? 'bg-brand-purple text-white hover:bg-opacity-95 hover:scale-105 active:scale-95'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                        }`}
                      >
                        {isLvlLocked ? (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Locked</span>
                          </>
                        ) : lvl === 1 && !isCompleted ? (
                          <span>BEGIN LEVEL 1 →</span>
                        ) : isCurrentActive && lvl > 1 ? (
                          <span>NEXT CHALLENGE →</span>
                        ) : isCompleted ? (
                          <span>REPLAY LEVEL {lvl}</span>
                        ) : (
                          <span>PLAY LEVEL {lvl} →</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* 4. Instructions Screen */}
      {activeGame && selectedLevel && showInstructions && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-brand-purpleLight shadow-sm space-y-6">
          <div className="border-b border-brand-purpleLight pb-4 text-center">
            <h3 className="font-extrabold text-2xl text-brand-navy">
              {getInstructions(activeGame).title}
            </h3>
            <p className="text-brand-grayText mt-1">{gt.instructionsForLvl} {selectedLevel}</p>
          </div>

          <div className="space-y-4 py-2">
            <p className="text-lg font-bold text-brand-navy text-center">
              {getInstructions(activeGame).explain}
            </p>
            <div className="space-y-3 bg-brand-lavender p-6 rounded-2xl border border-brand-purpleLight">
              {getInstructions(activeGame).steps.map((step, idx) => (
                <p key={idx} className="text-base font-semibold text-brand-navy">{step}</p>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-brand-purple text-white rounded-2xl font-black hover:bg-opacity-95 transition-all text-lg shadow-sm"
            >
              {t('inst.start')}
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDemo(true)}
                className="flex-1 py-3.5 bg-brand-orange text-white rounded-2xl font-black hover:bg-opacity-95 transition-all text-base shadow-sm"
              >
                ❓ {gt.instTitle}
              </button>
              <button
                onClick={() => setSelectedLevel(null)}
                className="px-6 py-3.5 bg-brand-lavender text-brand-purple rounded-2xl font-bold hover:bg-brand-purpleLight transition-all"
              >
                {t('inst.back')}
              </button>
            </div>
          </div>

          {/* Reusable Visual Demonstration Modal Layer */}
          {showDemo && (
            <GameInstructionDemo 
              gameId={activeGame} 
              onClose={() => setShowDemo(false)} 
            />
          )}
        </div>
      )}

      {/* 5. Playing Screen */}
      {activeGame && selectedLevel && !showInstructions && gameStep === 'playing' && (
        <div className="w-full">
          {/* Game 1: Memory Match */}
          {activeGame === 'game-1' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-brand-purpleLight shadow-sm space-y-6">
              <div className="flex justify-between items-center text-sm font-semibold text-brand-grayText border-b pb-3">
                <span>{gt.moves}: {memoryMoves}</span>
                <span>{gt.pairsMatched}: {cards.filter(c => c.matched).length / 2} / {cards.length / 2}</span>
              </div>
              <div className={`grid gap-2 sm:gap-3 py-2 ${
                cards.length <= 4 ? 'grid-cols-2' : cards.length <= 6 ? 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-3' : 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-4'
              }`}>
                {cards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(idx)}
                    className={`h-20 xs:h-24 sm:h-28 rounded-2xl flex items-center justify-center transition-all duration-300 transform shadow-sm border ${
                      card.flipped || card.matched
                        ? 'bg-brand-purpleLight border-brand-purple rotate-0'
                        : 'bg-brand-purple border-brand-purple text-white hover:scale-105 active:scale-95'
                    }`}
                  >
                    <span 
                      className="block leading-none select-none text-4xl xs:text-5xl sm:text-6xl flex items-center justify-center"
                    >
                      {(card.flipped || card.matched) ? card.symbol : '❓'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Game 2: Sequence & Order */}
          {activeGame === 'game-2' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-brand-purpleLight shadow-sm space-y-6">
              {seqPreviewing ? (
                <div className="text-center py-6 space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-brand-navy">{gt.rememberSeq}</h4>
                    <p className="text-brand-grayText text-sm mt-1">{gt.startingIn} {seqPreviewTimeLeft}s...</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 py-2">
                    {seqOriginal.map((item, idx) => (
                      <div key={item.id} className="w-24 h-28 rounded-2xl border-2 border-brand-purple bg-brand-purpleLight flex flex-col items-center justify-center p-2 shadow-sm animate-pulse">
                        <span 
                          className="block leading-none select-none mb-1"
                          style={{ fontSize: 'clamp(4.8rem, 13vw, 6.2rem)' }}
                        >
                          {item.emoji}
                        </span>
                        <span className="text-xs font-black text-brand-navy text-center truncate w-full">{item.label}</span>
                        <span className="text-[10px] bg-brand-purple text-white font-extrabold px-1.5 py-0.5 rounded-full mt-1.5">
                          {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-brand-navy">{gt.tapOrder}</h4>
                    <p className="text-xs text-brand-grayText">{gt.tapFirstLast}</p>
                  </div>

                  {/* Empty slots preview */}
                  <div className="flex justify-center gap-2 border-b pb-4 border-dashed">
                    {seqOriginal.map((_, idx) => {
                      const selectedItem = seqSelected[idx];
                      return (
                        <div key={idx} className="w-14 h-16 rounded-xl border border-brand-purpleLight bg-brand-lavender flex flex-col items-center justify-center p-1">
                          {selectedItem ? (
                            <>
                              <span 
                                className="block leading-none select-none"
                                style={{ fontSize: 'clamp(3rem, 7vw, 4.2rem)' }}
                              >
                                {selectedItem.emoji}
                              </span>
                              <span className="text-[8px] font-black truncate max-w-full text-brand-navy">{selectedItem.label}</span>
                            </>
                          ) : (
                            <span className="text-xs text-brand-grayText font-black">{idx + 1}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Options selection */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {seqShuffled.map((item) => {
                      const isTapped = seqSelected.some(s => s.id === item.id);
                      return (
                        <button
                          key={item.id}
                          disabled={isTapped}
                          onClick={() => handleSeqCardClick(item)}
                          className={`h-20 rounded-2xl flex flex-col items-center justify-center border p-2 transition-all ${
                            isTapped 
                              ? 'border-gray-200 bg-gray-50 text-gray-300 opacity-50 cursor-not-allowed'
                              : 'border-brand-purpleLight bg-white text-brand-navy hover:bg-brand-lavender font-bold'
                          }`}
                        >
                          <span 
                            className="block leading-none select-none mb-1"
                            style={{ fontSize: 'clamp(3.8rem, 10vw, 5rem)' }}
                          >
                            {item.emoji}
                          </span>
                          <span className="text-[10px] font-bold truncate max-w-full">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Game 3: Attention Focus */}
          {activeGame === 'game-3' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-brand-purpleLight shadow-sm space-y-6 text-center">
              <div>
                <h4 className="text-lg font-bold text-brand-navy">{attentionSetTitle}</h4>
                <p className="text-xs text-brand-grayText mt-1">{gt.oddCardDesc}</p>
              </div>

              <div className={`grid gap-3 max-w-[320px] mx-auto ${
                attentionItems.length <= 4 ? 'grid-cols-2' : attentionItems.length <= 9 ? 'grid-cols-3' : 'grid-cols-4'
              }`}>
                {attentionItems.map((emoji, idx) => {
                  const itemsCount = attentionItems.length;
                  const clampSize = itemsCount <= 4 
                    ? 'clamp(5rem, 15vw, 7.5rem)' 
                    : itemsCount <= 9 
                      ? 'clamp(4.2rem, 11vw, 5.8rem)' 
                      : 'clamp(3.2rem, 8vw, 4.2rem)';
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAttentionClick(idx)}
                      className="aspect-square rounded-2xl border-2 border-brand-purpleLight bg-brand-lavender hover:bg-brand-purpleLight hover:border-brand-purple flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
                    >
                      <span 
                        className="leading-none select-none block"
                        style={{ fontSize: clampSize }}
                      >
                        {emoji}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Game 4: Object Recognition */}
          {activeGame === 'game-4' && objTarget && (
            <div className="max-w-md mx-auto bg-white p-6 rounded-3xl border border-brand-purpleLight shadow-sm space-y-6">
              <div className="flex justify-between items-center text-xs font-semibold text-brand-grayText border-b pb-2">
                <span>
                  {language === 'Hindi' ? `प्रश्न ${objRoundCurrent + 1}/${objRoundsTotal}` :
                   language === 'Bengali' ? `প্রশ্ন ${objRoundCurrent + 1} / ${objRoundsTotal}` :
                   language === 'Assamese' ? `প্ৰশ্ন ${objRoundCurrent + 1} / ${objRoundsTotal}` :
                   `Question ${objRoundCurrent + 1} of ${objRoundsTotal}`}
                </span>
                <span>
                  {language === 'Hindi' ? 'सटीकता:' : language === 'Bengali' ? 'সঠিকতা:' : language === 'Assamese' ? 'সঠিকতা:' : 'Accuracy:'} {Math.round((objCorrectCount / Math.max(1, objRoundCurrent)) * 100)}%
                </span>
              </div>

              <div className="text-center py-4 space-y-4">
                <span className="block animate-bounce leading-none select-none" style={{ fontSize: 'clamp(7rem, 22vw, 10.5rem)' }}>
                  {objTarget.emoji}
                </span>
                <h4 className="text-lg font-bold text-brand-navy">{gt.whatIsObj}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {objOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleObjOptionSelect(opt)}
                    className="p-4 text-center border border-brand-purpleLight rounded-2xl hover:bg-brand-lavender font-black text-brand-navy text-xl sm:text-2xl active:scale-98 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Game 5: Daily Routine Recall */}
          {activeGame === 'game-5' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-brand-purpleLight shadow-sm space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-bold text-brand-navy">{gt.orderRoutine}</h4>
                <p className="text-xs text-brand-grayText">{gt.tapChronological}</p>
              </div>

              {/* Selection slots */}
              <div className="flex justify-center gap-2 border-b pb-4 border-dashed">
                {routineOriginal.map((_, idx) => {
                  const item = routineSelected[idx];
                  return (
                    <div key={idx} className="relative w-14 h-16 rounded-xl border border-brand-purpleLight bg-brand-lavender flex flex-col items-center justify-center p-1">
                      {item ? (
                        <>
                          <button
                            onClick={() => handleRemoveRoutineItem(idx)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-red text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow hover:bg-opacity-95 z-10"
                          >
                            ✕
                          </button>
                          <span className="text-4.5xl leading-none select-none">{item.emoji}</span>
                          <span className="text-[8px] font-black truncate max-w-full text-brand-navy text-center leading-none">{getRoutineLabel(item.id, item.label, language)}</span>
                        </>
                      ) : (
                        <span className="text-xs text-brand-grayText font-black">{idx + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Shuffled options */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {routineShuffled.map((item) => {
                  const isTapped = routineSelected.some(s => s.id === item.id);
                  return (
                    <button
                      key={item.id}
                      disabled={isTapped}
                      onClick={() => handleRoutineClick(item)}
                      className={`h-20 rounded-2xl flex flex-col items-center justify-center border p-2 transition-all ${
                        isTapped 
                          ? 'border-gray-200 bg-gray-50 text-gray-300 opacity-50 cursor-not-allowed'
                          : 'border-brand-purpleLight bg-white text-brand-navy hover:bg-brand-lavender font-bold'
                      }`}
                    >
                      <span className="text-6.5xl mb-1 leading-none select-none">{item.emoji}</span>
                      <span className="text-[9px] font-bold text-center leading-tight truncate max-w-full">{getRoutineLabel(item.id, item.label, language)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              {routineSelected.length === routineOriginal.length && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleRoutineSubmit}
                    className="w-full py-4 bg-brand-purple text-white font-extrabold rounded-2xl hover:bg-opacity-90 active:scale-[0.98] transition-all text-lg shadow-md"
                  >
                    {gt.submitChoices}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Game 6: Language Word Memory */}
          {activeGame === 'game-6' && (
            <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl border border-brand-purpleLight shadow-sm space-y-6">
              {langPreviewing ? (
                <div className="text-center py-6 space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-brand-navy">{gt.rememberWords}</h4>
                    <p className="text-brand-grayText text-sm mt-1">{gt.startingIn} {langPreviewTimeLeft}s...</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 py-2">
                    {langOriginal.map((word, idx) => (
                      <div key={idx} className="px-8 py-5 rounded-xl border border-brand-purple bg-brand-purpleLight font-black text-brand-navy shadow-md animate-pulse text-3xl sm:text-4xl">
                        {word}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-brand-navy">{gt.selectWords}</h4>
                    <p className="text-xs text-brand-grayText">{gt.tapSubmit}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {langChoices.map((word, idx) => {
                      const isSelected = langSelected.includes(word);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleLangWordToggle(word)}
                          className={`p-6 rounded-xl border font-black text-center transition-all text-2xl sm:text-3xl ${
                            isSelected
                              ? 'bg-brand-purple border-brand-purple text-white shadow-md'
                              : 'bg-white border-brand-purpleLight text-brand-navy hover:bg-brand-lavender'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleLangSubmit}
                    className="w-full py-4 bg-brand-purple text-white rounded-2xl font-black hover:bg-opacity-95"
                  >
                    {gt.submitChoices}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. Post Game Results screen */}
      {activeGame && gameStep === 'result' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-brand-purpleLight shadow-sm text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-brand-greenBg text-brand-green rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-brand-navy">
              {sessionScore >= 90 ? `🌟 Excellent work, ${userName}!` :
               sessionScore >= 75 ? `🎉 Great job, ${userName}!` :
               sessionScore >= 60 ? `👍 Good progress, ${userName}!` :
               sessionScore >= 40 ? `💪 Keep practicing, ${userName}!` :
               `🌱 Let's try again, ${userName}!`}
            </h3>
            <p className="text-brand-grayText text-base mt-2">
              {sessionScore >= 70 ? gt.nextChallenge : 'Regular practice helps maintain memory agility and focus.'}
            </p>
          </div>

          <div className="bg-brand-lavender p-6 rounded-2xl border border-brand-purpleLight grid grid-cols-2 gap-4 text-left font-bold text-brand-navy">
            <div>
              <span className="block text-xs uppercase tracking-wider text-brand-grayText">{gt.score}</span>
              <span className="text-lg">{sessionScore} {t('games.points')}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-brand-grayText">{gt.accuracy}</span>
              <span className="text-lg">{sessionAccuracy}%</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-brand-grayText">{gt.mistakes}</span>
              <span className="text-lg">{sessionMistakes}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-brand-grayText">{gt.duration}</span>
              <span className="text-lg">{sessionDuration} {gt.seconds}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            {/* Try Next level button (if unlocked and level was < 5) */}
            {selectedLevel && selectedLevel < 5 && (
              <button
                onClick={handlePlayNextLevel}
                className="flex-1 py-3.5 px-4 bg-brand-purple text-white rounded-xl font-black hover:bg-opacity-95 flex items-center justify-center gap-2 shadow-sm text-base"
              >
                {gt.playNextLevel}
              </button>
            )}

            {/* Try next game button */}
            <button
              onClick={handleTryNextGame}
              className="flex-1 py-3.5 px-4 bg-brand-green text-white rounded-xl font-black hover:bg-opacity-95 flex items-center justify-center gap-2 shadow-sm text-base"
            >
              {gt.tryNextGame}
            </button>

            {/* Play again button */}
            <button
              onClick={handleStartGame}
              className="flex-1 py-3.5 px-4 bg-brand-lavender text-brand-purple rounded-xl font-black hover:bg-brand-purpleLight flex items-center justify-center gap-2 text-base"
            >
              <RotateCcw className="w-4 h-4" /> {gt.practiceAgain}
            </button>
          </div>

          <button
            onClick={() => handleSelectGame(null as any)}
            className="text-brand-purple hover:underline font-extrabold text-sm block mx-auto pt-2"
          >
            {gt.returnDash}
          </button>
        </div>
      )}
    </div>
  );
};

export default BrainGames;
