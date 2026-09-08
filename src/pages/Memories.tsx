import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Plus, Trash2, Calendar, Users, X, Image as ImageIcon, MapPin, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { Memory } from '../data/demoData';
import { SVGPicnic, SVGOldHouse, SVGFestival, SVGHornbill, SVGDiwali } from '../components/SVGIcons';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedMemory } from '../services/translationService';

const getFestivalLocation = (imageKey: string, language: string = 'English') => {
  const mt = memTranslations[language] || memTranslations.English;
  if (imageKey === 'festival') return mt.locationAssam;
  if (imageKey === 'hornbill') return mt.locationNagaland;
  if (imageKey === 'diwali') return mt.locationIndia;
  return null;
};

const renderFestivalIcon = (imageKey: string) => {
  if (imageKey === 'festival') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 flex-shrink-0">
        <ellipse cx="12" cy="14" rx="8" ry="5" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
        <path d="M4 14 L20 14" stroke="#ffffff" strokeWidth="1" />
        <path d="M8 10 L8 18 M16 10 L16 18" stroke="#f59e0b" strokeWidth="1" />
      </svg>
    );
  }
  if (imageKey === 'hornbill') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 flex-shrink-0">
        <path d="M14 14 C14 18, 8 18, 6 15 C5 13, 6 10, 9 9" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 9 C11 5, 20 6, 22 10 C16 11, 12 11, 9 9 Z" fill="#f59e0b" stroke="#1e293b" strokeWidth="1.5" />
        <path d="M13 8 C15 7, 19 7, 21 9" stroke="#ef4444" strokeWidth="1.5" fill="none" />
        <circle cx="11" cy="12" r="1.2" fill="#1e293b" />
      </svg>
    );
  }
  if (imageKey === 'diwali') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 flex-shrink-0">
        <path d="M4 14 C4 10, 20 10, 20 14 C20 18, 4 18, 4 14 Z" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />
        <path d="M12 11 C10 9, 10 5, 12 2 C14 5, 14 9, 12 11 Z" fill="#ef4444" stroke="#f59e0b" strokeWidth="1.5" />
      </svg>
    );
  }
  return null;
};

// Helper to get compact presentation title (Memory Name ONLY) for compact highlight cards
const getCompactMemoryName = (memory: Memory, language: string = 'English'): string => {
  const localized = getLocalizedMemory(memory, language);
  let title = (localized.title || memory.title || '').trim();
  if (!title) return 'Special Memory';
  
  if (title.length > 28) {
    const mainPart = title.split(/[:\-\(]/)[0].trim();
    if (mainPart.length >= 4 && mainPart.length <= 28) {
      return mainPart;
    }
  }
  return title;
};

const memTranslations: Record<string, Record<string, string>> = {
  English: {
    deleteConfirm: 'Are you sure you want to delete this memory from your Memory Garden?',
    beautifulMemory: 'Beautiful Memory',
    categoryAll: 'All',
    categoryFamily: 'Family',
    categoryPlaces: 'Places',
    categoryEvents: 'Events',
    categoryOther: 'Other',
    noMemories: 'No memories found',
    noMemoriesDesc: 'Add a special moment to your Memory Garden to keep it close.',
    with: 'With',
    delete: 'Delete',
    addNewMemory: 'Add New Memory',
    memoryTitle: 'Memory Title',
    date: 'Date',
    category: 'Category',
    peoplePresent: 'People Present',
    memoryDesc: 'Memory Description',
    uploadPhoto: 'Upload Photo (Optional)',
    plantMemory: 'Plant Memory',
    placeholderTitle: "e.g. Grandma's 80th Birthday",
    placeholderPeople: 'e.g. Ramesh, Anu, grandchildren',
    placeholderDesc: 'What makes this memory special?',
    locationAssam: 'Assam, North-East India',
    locationNagaland: 'Nagaland, North-East India',
    locationIndia: 'India',
    highlightsTitle: 'Special Moments',
    highlightsSubtitle: 'Curated for gentle cognitive recall',
    onThisDayTitle: 'On This Day',
    onThisDayPrompt: 'Do you remember this special moment?',
    takeAMoment: 'Take a moment to remember...',
    rememberThisDay: 'Do you remember this day?',
    allMemories: 'All Memories',
    emptyTitle: 'Your special moments will appear here',
    emptyDesc: 'Add a memory to start building your Memory Garden collection.',
    rememberedBtn: 'I Remember This Moment ❤️',
    close: 'Close'
  },
  Hindi: {
    deleteConfirm: 'क्या आप वाकई इस याद को अपने मेमोरी गार्डन से हटाना चाहते हैं?',
    beautifulMemory: 'सुंदर याद',
    categoryAll: 'सभी',
    categoryFamily: 'परिवार',
    categoryPlaces: 'स्थान',
    categoryEvents: 'कार्यक्रम',
    categoryOther: 'अन्य',
    noMemories: 'कोई यादें नहीं मिलीं',
    noMemoriesDesc: 'अपने मेमोरी गार्डन में एक विशेष क्षण जोड़ें ताकि वह करीब रहे।',
    with: 'साथ में',
    delete: 'हटाएं',
    addNewMemory: 'नई याद जोड़ें',
    memoryTitle: 'याद का शीर्षक',
    date: 'तारीख',
    category: 'श्रेणी',
    peoplePresent: 'उपस्थित लोग',
    memoryDesc: 'याद का विवरण',
    uploadPhoto: 'फ़ोटो अपलोड करें (वैकल्पिक)',
    plantMemory: 'याद सहेजें',
    placeholderTitle: 'जैसे- दादी का 80वां जन्मदिन',
    placeholderPeople: 'जैसे- रमेश, अनु, नाती-पोते',
    placeholderDesc: 'इस याद को क्या खास बनाता है?',
    locationAssam: 'असम, उत्तर-पूर्व भारत',
    locationNagaland: 'नागालैंड, उत्तर-पूर्व भारत',
    locationIndia: 'भारत',
    highlightsTitle: 'खास पल',
    highlightsSubtitle: 'याददाश्त के लिए चुने गए पल',
    onThisDayTitle: 'आज के दिन',
    onThisDayPrompt: 'क्या आपको यह विशेष पल याद है?',
    takeAMoment: 'याद करने के लिए एक पल निकालें...',
    rememberThisDay: 'क्या आपको यह दिन याद है?',
    allMemories: 'सभी यादें',
    emptyTitle: 'आपके विशेष पल यहाँ दिखाई देंगे',
    emptyDesc: 'अपने मेमोरी गार्डन संग्रह को शुरू करने के लिए एक याद जोड़ें।',
    rememberedBtn: 'मुझे यह पल याद है ❤️',
    close: 'बंद करें'
  },
  Bengali: {
    deleteConfirm: 'আপনি কি নিশ্চিত যে আপনি আপনার মেমরি গার্ডেন থেকে এই স্মৃতিটি মুছে ফেলতে চান?',
    beautifulMemory: 'সুন্দর স্মৃতি',
    categoryAll: 'সব',
    categoryFamily: 'পরিবার',
    categoryPlaces: 'স্থান',
    categoryEvents: 'অনুষ্ঠান',
    categoryOther: 'অন্যান্য',
    noMemories: 'কোনো স্মৃতি পাওয়া যায়নি',
    noMemoriesDesc: 'কাছে রাখার জন্য আপনার মেমরি গার্ডেনে একটি বিশেষ মুহূর্ত যোগ করুন।',
    with: 'সাথে',
    delete: 'মুছে ফেলুন',
    addNewMemory: 'নতুন স্মৃতি যোগ করুন',
    memoryTitle: 'স্মৃতির শিরোনাম',
    date: 'তারিখ',
    category: 'বিভাগ',
    peoplePresent: 'উপস্থিত ব্যক্তিরা',
    memoryDesc: 'স্মৃতির বিবরণ',
    uploadPhoto: 'ছবি আপলোড (ঐচ্ছিক)',
    plantMemory: 'স্মৃতি রোপণ করুন',
    placeholderTitle: 'উদাঃ দিদিমার ৮০তম জন্মদিন',
    placeholderPeople: 'উদাঃ রমেশ, অনু, নাতি-নাতনিরা',
    placeholderDesc: 'এই স্মৃতিটি কী কারণে বিশেষ?',
    locationAssam: 'আসাম, উত্তর-পূর্ব ভারত',
    locationNagaland: 'নাগাল্যান্ড, উত্তর-পূর্ব ভারত',
    locationIndia: 'ভারত',
    highlightsTitle: 'বিশেষ মুহূর্তসমূহ',
    highlightsSubtitle: 'স্মৃতি চারণের জন্য বিশেষ মুহূর্ত',
    onThisDayTitle: 'আজকের এই দিনে',
    onThisDayPrompt: 'আপনার কি এই বিশেষ মুহূর্তটি মনে আছে?',
    takeAMoment: 'স্মরণ করার জন্য এক মুহূর্ত সময় নিন...',
    rememberThisDay: 'আপনার কি এই দিনটি মনে আছে?',
    allMemories: 'সমস্ত স্মৃতি',
    emptyTitle: 'আপনার বিশেষ মুহূর্তগুলো এখানে আসবে',
    emptyDesc: 'আপনার মেমরি গার্ডেন সংগ্রহ শুরু করতে একটি স্মৃতি যোগ করুন।',
    rememberedBtn: 'আমার এই মুহূর্তটি মনে আছে ❤️',
    close: 'বন্ধ করুন'
  },
  Assamese: {
    deleteConfirm: 'আপুনি নিশ্চিতনে যে আপুনি আপোনাৰ স্মৃতি উদ্যানৰ পৰা এই স্মৃতিটো মচিব খোজে?',
    beautifulMemory: 'ধুনীয়া স্মৃতি',
    categoryAll: 'সকলো',
    categoryFamily: 'পৰিয়াল',
    categoryPlaces: 'ঠাই',
    categoryEvents: 'অনুষ্ঠান',
    categoryOther: 'অন্যান্য',
    noMemories: 'কোনো স্মৃতি পোৱা নগ’ল',
    noMemoriesDesc: 'আপোনাৰ স্মৃতি উদ্যানত এটি বিশেষ মুহূৰ্ত যোগ কৰক।',
    with: 'লগত',
    delete: 'মচি পেলাওক',
    addNewMemory: 'নতুন স্মৃতি যোগ কৰক',
    memoryTitle: 'স্মৃতিৰ নাম',
    date: 'তাৰিখ',
    category: 'শ্ৰেণী',
    peoplePresent: 'উপস্থিত লোকসকল',
    memoryDesc: 'স্মৃতিৰ বৰ্ণনা',
    uploadPhoto: 'ফটো আপলোড কৰক (ঐচ্ছিক)',
    plantMemory: 'স্মৃতি সংৰক্ষণ কৰক',
    placeholderTitle: 'যেনে- আইতাৰ ৮০তম জন্মদিন',
    placeholderPeople: 'যেনে- ৰমেশ, অনু, নাতি-নাতিনীসকল',
    placeholderDesc: 'এই স্মৃতিটো কিয় বিশেষ?',
    locationAssam: 'অসম, উত্তৰ-পূব ভাৰত',
    locationNagaland: 'নাগালেণ্ড, উত্তৰ-পূব ভাৰত',
    locationIndia: 'ভাৰত',
    highlightsTitle: 'বিশেষ মুহূৰ্তসমূহ',
    highlightsSubtitle: 'মনত পেলোৱাৰ বাবে বিশেষ মুহূৰ্ত',
    onThisDayTitle: 'আজিৰ এই দিনটোত',
    onThisDayPrompt: 'আপোনাৰ এই বিশেষ মুহূৰ্তটো মনত আছেনে?',
    takeAMoment: 'মনত পেলাবলৈ এক মুহূৰ্ত সময় লওক...',
    rememberThisDay: 'আপোনাৰ এই দিনটো মনত আছেনে?',
    allMemories: 'সকলো স্মৃতি',
    emptyTitle: 'আপোনাৰ বিশেষ মুহূৰ্তসমূহ ইয়াত দেখা পাব',
    emptyDesc: 'আপোনাৰ স্মৃতি উদ্যান সংগ্ৰহ আৰম্ভ কৰিবলৈ এটি স্মৃতি যোগ কৰক।',
    rememberedBtn: 'মোৰ এই মুহূৰ্তটো মনত আছে ❤️',
    close: 'বন্ধ কৰক'
  },
  Manipuri: {
    deleteConfirm: 'নহakna মেমোরী গার্ডেনদগী অসি মুত্থতপা পাম্ব্রা?',
    beautifulMemory: 'ফজবা মেমোরী',
    categoryAll: 'খুদোং',
    categoryFamily: 'ইমুং',
    categoryPlaces: 'মফম',
    categoryEvents: 'থৌরম',
    categoryOther: 'অতোপ্পা',
    noMemories: 'মেমোরী ফংদ্রে',
    noMemoriesDesc: 'মেমোরী গার্ডেন্দা ফজবা মফম অমুক্তা হাপ্পীয়ূ।',
    with: 'লোয়ননা',
    delete: 'মুত্থতপা',
    addNewMemory: 'অনৌবা মেমোরী হাপ্পা',
    memoryTitle: 'মেমোরী টাইটেল',
    date: 'তারিখ',
    category: 'ক্যাটাগোরী',
    peoplePresent: 'য়াওরিবা মীশিং',
    memoryDesc: 'মেমোরী ডেস্ক্রিপশন',
    uploadPhoto: 'ফটো হাপ্পা (অপ্সনেল)',
    plantMemory: 'মেমোরী থম্বা',
    placeholderTitle: 'উদাঃ ইবেলগী ৮০শুবা মপো কৰা',
    placeholderPeople: 'উদাঃ রমেশ, অনু, শুলীশিং',
    placeholderDesc: 'অসি করম্না ফজবগে?',
    locationAssam: 'অসাম, অৱাং-নোংপোক ভারত',
    locationNagaland: 'নাগাল্যান্ড, অৱাং-নোংপোক ভারত',
    locationIndia: 'भारत',
    highlightsTitle: 'অখন্নবা মেমোরীশিং',
    highlightsSubtitle: 'নীংশিংনবগীদমক খনখ্রবা মেমোরীশিং',
    onThisDayTitle: 'নুমিৎ অসিদা',
    onThisDayPrompt: 'নহাক্না অসি নীংশিংব্রা?',
    takeAMoment: 'নীংশিংনবগীদমক মতম অমুক চংবীয়ূ...',
    rememberThisDay: 'নহাক্না নুমিৎ অসি নীংশিংব্রা?',
    allMemories: 'মেমোরী খুদিংমক',
    emptyTitle: 'নহাকগী মেমোরীশিং অসида উবা ফংগনি',
    emptyDesc: 'অনৌবা মেমোরী হাপ্পদুনা মেমোরী গার্ডেন শেম্বীয়ূ।',
    rememberedBtn: 'ঐনা অসি নীংশিংলে ❤️',
    close: 'থিংজিনবা'
  },
  Khasi: {
    deleteConfirm: 'Phi thikna ba phi kwah ban pyndam ia kane ka jingkynmaw?',
    beautifulMemory: 'Jingkynmaw ba itynnad',
    categoryAll: 'Baroh',
    categoryFamily: 'Iing-sem',
    categoryPlaces: 'Ki jaka',
    categoryEvents: 'Ki kam',
    categoryOther: 'Kiwei',
    noMemories: 'Khlem shem jingkynmaw',
    noMemoriesDesc: 'Buh ia ka khyllipmat ba kyrpang ha ka kper jingkynmaw.',
    with: 'Bad',
    delete: 'Pyndam',
    addNewMemory: 'Buh Jingkynmaw Kaba Thymmai',
    memoryTitle: 'Kyrteng ka Jingkynmaw',
    date: 'Tarikh',
    category: 'Jait',
    peoplePresent: 'Kiba don ryngkat',
    memoryDesc: 'Batai ia ka Jingkynmaw',
    uploadPhoto: 'Buh Dur (Lada kwah)',
    plantMemory: 'Pynsah Jingkynmaw',
    placeholderTitle: 'kd. Ka sngi kha ba 80 i Mei-rad',
    placeholderPeople: 'kd. Ramesh, Anu, khun rynjup',
    placeholderDesc: 'Kiei kiba pynlong kyrpang ia kane?',
    locationAssam: 'Assam, Shatei-Lam-Mihngi India',
    locationNagaland: 'Nagaland, Shatei-Lam-Mihngi India',
    locationIndia: 'India',
    highlightsTitle: 'Ki Khyllipmat Ba Kyrpang',
    highlightsSubtitle: 'Ban kynmaw biang ia ki khyllipmat',
    onThisDayTitle: 'Ha Kane Ka Sngi',
    onThisDayPrompt: 'Phi kynmaw ia kane ka khyllipmat?',
    takeAMoment: 'Shim por shi kynta ban kynmaw...',
    rememberThisDay: 'Phi kynmaw ia kane ka sngi?',
    allMemories: 'Baroh Ki Jingkynmaw',
    emptyTitle: 'Ki khyllipmat ki ban mih hangne',
    emptyDesc: 'Buh jingkynmaw ban sdang ia ka kper jingkynmaw.',
    rememberedBtn: 'Nga kynmaw ia kane ka khyllipmat ❤️',
    close: 'Khang'
  },
  Mizo: {
    deleteConfirm: 'He hriatna hi i Memory Garden atanga nuaibo i duh tak zet em?',
    beautifulMemory: 'Hriatna nuam',
    categoryAll: 'A vaiin',
    categoryFamily: 'Chhungkua',
    categoryPlaces: 'Hmun te',
    categoryEvents: 'Thil thleng te',
    categoryOther: 'Thil dang',
    noMemories: 'Hriatna engmah a awm lo',
    noMemoriesDesc: 'I Memory Garden-ah hriatna thar dah rawh.',
    with: 'Hnenah',
    delete: 'Nuaibo',
    addNewMemory: 'Hriatna Thar Siamna',
    memoryTitle: 'Hriatna Hming',
    date: 'Ni',
    category: 'Category',
    peoplePresent: 'A hmuna awm te',
    memoryDesc: 'Hriatna Bena',
    uploadPhoto: 'Thlalak Dahna (Duh thlan tur)',
    plantMemory: 'Hriatna Dahna',
    placeholderTitle: 'kd. Pi kum 80 piancham',
    placeholderPeople: 'kd. Ramesh, Anu, tute',
    placeholderDesc: 'Engin nge he hriatna hi pakhai?',
    locationAssam: 'Assam, Hmarchan India',
    locationNagaland: 'Nagaland, Hmarchan India',
    locationIndia: 'India',
    highlightsTitle: 'Hun Pawimawh Te',
    highlightsSubtitle: 'Hriatnawna atan ruahman te',
    onThisDayTitle: 'Vawiin Hmunah Hian',
    onThisDayPrompt: 'He hun hi i la kynmaw em?',
    takeAMoment: 'Kynmaw zui turin hun thawp rawh...',
    rememberThisDay: 'He ni hi i kynmaw em?',
    allMemories: 'Hriatna Zawng Zawng',
    emptyTitle: 'I hriatna te heta hian a lo lang ang',
    emptyDesc: 'Memory Garden siam tan turin hriatna siam rawh.',
    rememberedBtn: 'He hun hi ka kynmaw e ❤️',
    close: 'Kharkhip'
  },
  Nagamese: {
    deleteConfirm: 'Apuni bhal pora mon ase na aji laga memory delete kuribole?',
    beautifulMemory: 'Bhal mon thaka yaad',
    categoryAll: 'Sob',
    categoryFamily: 'Mith-bhaat',
    categoryPlaces: 'Jagah khan',
    categoryEvents: 'Utsav khan',
    categoryOther: 'Aro khan',
    noMemories: 'Kunuba yaad bacha nai',
    noMemoriesDesc: 'Apuni laga Memory Garden te naya yaad bachabi.',
    with: 'Logote',
    delete: 'Delete',
    addNewMemory: 'Naya Yaad Bachabi',
    memoryTitle: 'Yaad Title',
    date: 'Tarikh',
    category: 'Category',
    peoplePresent: 'Kun-kun thakise',
    memoryDesc: 'Yaad Bivaran',
    uploadPhoto: 'Photo Upload (Kilebi)',
    plantMemory: 'Yaad Bachabi',
    placeholderTitle: 'kd. Aji Bubu laga 80th Birthday',
    placeholderPeople: 'kd. Ramesh, Anu, bacha khan',
    placeholderDesc: 'Aji ki bisi bhal thakise?',
    locationAssam: 'Assam, North-East India',
    locationNagaland: 'Nagaland, North-East India',
    locationIndia: 'India',
    highlightsTitle: 'Special Yaad Khan',
    highlightsSubtitle: 'Mon te rakhibole bhal yaad khan',
    onThisDayTitle: 'Aji etu din te',
    onThisDayPrompt: 'Apuni etu special yaad mon ase na?',
    takeAMoment: 'Bhal pora mon te anibi...',
    rememberThisDay: 'Apuni etu din mon ase na?',
    allMemories: 'Sob Yaad Khan',
    emptyTitle: 'Apuni laga bhal yaad khan etya ahibo',
    emptyDesc: 'Naya memory add kuribi.',
    rememberedBtn: 'Mui etu yaad mon ase ❤️',
    close: 'Bandh kuribi'
  },
  Tripuri: {
    deleteConfirm: 'Neng chichi chokhichang yaadno delete khailani?',
    beautifulMemory: 'Chokhichang yaad',
    categoryAll: 'Jotoni',
    categoryFamily: 'Nokhor',
    categoryPlaces: 'Jagarok',
    categoryEvents: 'Haparnok',
    categoryOther: 'Chichirok',
    noMemories: 'Yaad kwrwi',
    noMemoriesDesc: 'Nini Memory Garden te naya yaad hiladi.',
    with: 'Logote',
    delete: 'Muthudi',
    addNewMemory: 'Naya yaad hiladi',
    memoryTitle: 'Yaadni Title',
    date: 'Tarikh',
    category: 'Category',
    peoplePresent: 'Borokrok',
    memoryDesc: 'Yaad Details',
    uploadPhoto: 'Photo Upload (Chadi)',
    plantMemory: 'Yaad hapa',
    placeholderTitle: 'kd. Buri 80 Birthday',
    placeholderPeople: 'kd. Ramesh, Anu, surok',
    placeholderDesc: 'Ki kahm thakise chichi?',
    locationAssam: 'Assam, North-East India',
    locationNagaland: 'Nagaland, North-East India',
    locationIndia: 'India',
    highlightsTitle: 'Kahn thaka Yaadrok',
    highlightsSubtitle: 'Kahnna bhal yaadrok',
    onThisDayTitle: 'Sal o',
    onThisDayPrompt: 'Neng etu yaad kahnna?',
    takeAMoment: 'Monom hapa khadi...',
    rememberThisDay: 'Neng etu sal kahnna?',
    allMemories: 'Jotoni Yaadrok',
    emptyTitle: 'Nini yaadrok o hapa khani',
    emptyDesc: 'Naya yaad hapa khadi.',
    rememberedBtn: 'Ang etu kahnna ❤️',
    close: 'Khaadi'
  }
};

export const Memories: React.FC = () => {
  const { t, language } = useLanguage();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecallMemory, setSelectedRecallMemory] = useState<Memory | null>(null);

  // New memory states
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newPeople, setNewPeople] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<'family' | 'places' | 'events' | 'other'>('family');
  const [newImageBase64, setNewImageBase64] = useState<string>('');

  const location = useLocation();

  useEffect(() => {
    storageService.init();
    const loadedMemories = storageService.getMemories();
    setMemories(loadedMemories);

    if (location.state?.memoryData) {
      setSelectedRecallMemory(location.state.memoryData);
    } else if (location.state?.selectedMemoryId && loadedMemories.length > 0) {
      const found = loadedMemories.find(m => m.id === location.state.selectedMemoryId);
      if (found) setSelectedRecallMemory(found);
    }
  }, [location.state]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMem: Memory = {
      id: `mem-${Date.now()}`,
      title: newTitle,
      date: newDate || new Date().toISOString().split('T')[0],
      people: newPeople,
      description: newDescription,
      category: newCategory,
      image: newImageBase64 || 'default'
    };

    const updated = [newMem, ...memories];
    setMemories(updated);
    storageService.saveMemories(updated);

    // Notify Caregiver
    const alerts = storageService.getAlerts();
    storageService.saveAlerts([
      { id: `al-${Date.now()}`, type: 'success', title: `New memory added: ${newTitle}`, time: 'Just now' },
      ...alerts
    ]);

    // Reset Form
    setNewTitle('');
    setNewDate('');
    setNewPeople('');
    setNewDescription('');
    setNewCategory('family');
    setNewImageBase64('');
    setShowAddModal(false);
  };

  const handleDeleteMemory = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const mt = memTranslations[language] || memTranslations.English;
    if (window.confirm(mt.deleteConfirm)) {
      const updated = memories.filter(m => m.id !== id);
      setMemories(updated);
      storageService.saveMemories(updated);
      if (selectedRecallMemory?.id === id) {
        setSelectedRecallMemory(null);
      }
    }
  };

  // Helper to extract MM-DD from date strings YYYY-MM-DD
  const getMMDD = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[1]}-${parts[2]}`;
    if (parts.length === 2) return `${parts[0]}-${parts[1]}`;
    return '';
  };

  const today = new Date();
  const currentMMDD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Intelligent selection for Memory Highlights (limited to 3-4 top curated highlights)
  const getHighlightedMemories = (): Memory[] => {
    if (memories.length === 0) return [];

    const scored = memories.map(m => {
      let score = 0;
      const text = `${m.title} ${m.description} ${m.people}`.toLowerCase();

      // On This Day match boost
      if (getMMDD(m.date) === currentMMDD) {
        score += 100;
      }

      // Family & Person priorities
      if (m.category === 'family') score += 40;
      if (m.people && m.people.trim().length > 0) score += 25;

      // Special keywords boost
      const keywords = ['family', 'picnic', 'birthday', 'festival', 'celebration', 'wedding', 'trip', 'anniversary', 'teypur', 'shillong', 'bihu', 'diwali', 'hornbill'];
      keywords.forEach(kw => {
        if (text.includes(kw)) score += 15;
      });

      // Prefer memories with actual photo / illustration
      if (m.image && m.image !== 'default') score += 10;

      return { memory: m, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, Math.min(3, memories.length)).map(s => s.memory);
  };

  const highlightedMemories = getHighlightedMemories();

  const filteredMemories = memories.filter(m => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.people.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const renderMemoryIllustration = (imageKey: string, heightClass = 'h-44', roundedClass = 'rounded-t-2xl') => {
    const mt = memTranslations[language] || memTranslations.English;
    if (imageKey === 'picnic') return <SVGPicnic className={`w-full ${heightClass} object-cover ${roundedClass}`} />;
    if (imageKey === 'old_house') return <SVGOldHouse className={`w-full ${heightClass} object-cover ${roundedClass}`} />;
    if (imageKey === 'festival') return <SVGFestival className={`w-full ${heightClass} object-cover ${roundedClass}`} />;
    if (imageKey === 'hornbill') return <SVGHornbill className={`w-full ${heightClass} object-cover ${roundedClass}`} />;
    if (imageKey === 'diwali') return <SVGDiwali className={`w-full ${heightClass} object-cover ${roundedClass}`} />;
    if (imageKey.startsWith('data:image')) {
      return <img src={imageKey} alt="Uploaded Memory" className={`w-full ${heightClass} object-cover ${roundedClass}`} />;
    }
    return (
      <div className={`w-full ${heightClass} bg-brand-purpleLight text-brand-purple flex flex-col items-center justify-center ${roundedClass}`}>
        <ImageIcon className="w-10 h-10 stroke-[1.5]" />
        <span className="text-xs font-semibold mt-1">{mt.beautifulMemory}</span>
      </div>
    );
  };

  const mt = memTranslations[language] || memTranslations.English;

  return (
    <div className="pb-12 space-y-6 max-w-6xl mx-auto">
      {/* 1. HEADER (Title, Subtitle, Add Memory Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-navy flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-brand-purple animate-pulse" />
            <span>{t('mem.title')}</span>
          </h1>
          <p className="text-brand-grayText font-semibold mt-1 text-base">{t('mem.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-purple text-white hover:bg-opacity-95 py-3.5 px-6 rounded-2xl font-extrabold flex items-center justify-center gap-2 transition-all shadow-md self-start sm:self-center text-base min-h-[48px]"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>{t('mem.add')}</span>
        </button>
      </div>

      {/* User Memories Empty State (For new accounts with 0 memories) */}
      {memories.length === 0 ? (
        <div className="bg-gradient-to-br from-[#FAF8F5] via-[#F6F3ED] to-[#EFEAE2] p-10 md:p-14 rounded-3xl border border-brand-purpleLight/60 shadow-sm text-center space-y-4">
          <div className="w-20 h-20 bg-brand-purpleLight rounded-full flex items-center justify-center mx-auto text-brand-purple">
            <Heart className="w-10 h-10 animate-bounce" />
          </div>
          <h3 className="text-2xl font-black text-brand-navy">
            {mt.emptyTitle}
          </h3>
          <p className="text-brand-grayText font-semibold text-base max-w-md mx-auto">
            {mt.emptyDesc}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-brand-purple text-white font-extrabold py-3.5 px-6 rounded-2xl hover:bg-opacity-95 transition-all text-base shadow-sm mt-2 min-h-[48px]"
          >
            <Plus className="w-5 h-5" />
            <span>{t('mem.add')}</span>
          </button>
        </div>
      ) : (
        <>
          {/* 2. SEARCH BAR & CATEGORY FILTERS (Kept at top below header) */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-brand-purpleLight shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-brand-grayText" />
              <input
                type="text"
                placeholder={t('mem.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-brand-lavender rounded-xl border border-transparent focus:border-brand-purple focus:bg-white focus:outline-none text-base font-medium"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {(() => {
                const categoryLabels: Record<string, string> = {
                  all: mt.categoryAll,
                  family: mt.categoryFamily,
                  places: mt.categoryPlaces,
                  events: mt.categoryEvents,
                  other: mt.categoryOther
                };
                return ['all', 'family', 'places', 'events', 'other'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap min-h-[44px] ${
                      filterCategory === cat
                        ? 'bg-brand-purple text-white shadow-sm'
                        : 'bg-brand-lavender text-brand-grayText hover:bg-brand-purpleLight'
                    }`}
                  >
                    {categoryLabels[cat] || cat}
                  </button>
                ));
              })()}
            </div>
          </div>

          {/* 3. HIGHLIGHTED MEMORIES / SPECIAL MOMENTS STRIP (Placed directly BELOW Search Bar) */}
          {highlightedMemories.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-brand-navy flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                  <span>{mt.highlightsTitle}</span>
                </h2>
                <span className="text-xs font-extrabold text-brand-purple bg-brand-purpleLight px-3 py-1 rounded-full border border-brand-purpleLight/60">
                  {mt.highlightsSubtitle}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {highlightedMemories.map((memory) => {
                  const compactName = getCompactMemoryName(memory, language);
                  return (
                    <div
                      key={`hl-${memory.id}`}
                      onClick={() => setSelectedRecallMemory(memory)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedRecallMemory(memory);
                        }
                      }}
                      className="group cursor-pointer bg-gradient-to-r from-[#FAF8F5] via-[#F6F3ED] to-[#EFEAE2] hover:bg-white rounded-2xl border border-[#E6E0D4] hover:border-brand-purpleLight p-3 sm:p-3.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3.5 min-h-[72px] sm:min-h-[76px]"
                    >
                      {/* Left Side: Compact Photo / Multi-Image Visual Group Accent */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 relative">
                        {/* Stacked multi-photo thumbnail accent frame */}
                        <div className="absolute inset-0 bg-brand-purple/20 rounded-xl transform rotate-3 scale-95 transition-transform group-hover:rotate-6" />
                        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xs border border-white/80 bg-brand-purpleLight group-hover:scale-105 transition-transform duration-300">
                          {renderMemoryIllustration(memory.image, 'w-full h-full', 'rounded-xl')}
                        </div>
                      </div>

                      {/* Right Side: Memory Name ONLY */}
                      <div className="flex-1 min-w-0 pr-1">
                        <h3 className="text-sm sm:text-base font-extrabold text-brand-navy group-hover:text-brand-purple transition-colors leading-snug line-clamp-2">
                          {compactName}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. ALL MEMORIES COLLECTION (Placed directly BELOW Highlighted Memories) */}
          <div className="space-y-4 pt-4 border-t border-brand-purpleLight/60">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-brand-navy flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-brand-purple" />
                <span>{mt.allMemories}</span>
              </h2>
            </div>

            {/* Grid */}
            {filteredMemories.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-brand-purpleLight shadow-sm text-center">
                <ImageIcon className="w-16 h-16 text-brand-grayText mx-auto mb-4" />
                <h3 className="text-xl font-bold text-brand-navy">
                  {mt.noMemories}
                </h3>
                <p className="text-brand-grayText mt-2">
                  {mt.noMemoriesDesc}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMemories.map((memory) => {
                  const localized = getLocalizedMemory(memory, language);
                  return (
                    <div 
                      key={memory.id}
                      onClick={() => setSelectedRecallMemory(memory)}
                      className="group cursor-pointer bg-gradient-to-br from-[#FAF8F5] via-[#F6F3ED] to-[#EFEAE2] rounded-2xl border border-brand-purpleLight/70 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Illustration / Photo */}
                      {renderMemoryIllustration(memory.image, 'h-48', 'rounded-t-2xl')}

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-extrabold text-xl text-brand-navy group-hover:text-brand-purple transition-colors flex items-center gap-2">
                            {renderFestivalIcon(memory.image)}
                            <span>{localized.title}</span>
                          </h3>
                          {getFestivalLocation(memory.image, language) && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-grayText mt-1.5">
                              <MapPin className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                              <span>{getFestivalLocation(memory.image, language)}</span>
                            </div>
                          )}
                          <p className="text-brand-grayText text-sm font-semibold mt-2 line-clamp-3 leading-relaxed">{localized.description}</p>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-brand-purpleLight/60 text-xs font-bold text-brand-grayText">
                          {memory.people && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-brand-purple" />
                              <span>{mt.with}: {memory.people}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-brand-purple" />
                              <span>{memory.date}</span>
                            </div>
                            <button
                              onClick={(e) => handleDeleteMemory(memory.id, e)}
                              className="text-brand-red hover:underline flex items-center gap-1 p-1.5 rounded-lg hover:bg-red-50 min-h-[44px]"
                              title={mt.delete}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>{mt.delete}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* COGNITIVE RECALL EXPERIENCE MODAL */}
      {selectedRecallMemory && (() => {
        const localized = getLocalizedMemory(selectedRecallMemory, language);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-md animate-fade-in">
            <div className="bg-[#FAF8F5] rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-brand-purpleLight space-y-6 flex flex-col animate-scale-up">
              
              <div className="flex items-start justify-between border-b border-brand-purpleLight/60 pb-4">
                <div className="space-y-1">
                  <span className="px-3.5 py-1 rounded-full bg-brand-purpleLight text-brand-purple font-black text-xs uppercase tracking-wider flex items-center gap-1.5 w-fit">
                    <Sparkles className="w-4 h-4" />
                    {mt.takeAMoment}
                  </span>
                  <h2 className="text-2xl font-black text-brand-navy flex items-center gap-2 mt-2">
                    {renderFestivalIcon(selectedRecallMemory.image)}
                    <span>{localized.title}</span>
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedRecallMemory(null)}
                  className="p-2 rounded-xl text-brand-grayText hover:text-brand-navy hover:bg-brand-purpleLight transition-all min-w-[48px] min-h-[48px] flex items-center justify-center"
                  title={mt.close}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Image presentation */}
              <div className="relative rounded-2xl overflow-hidden shadow-md">
                {renderMemoryIllustration(selectedRecallMemory.image, 'h-64 md:h-72', 'rounded-2xl')}
                {getFestivalLocation(selectedRecallMemory.image, language) && (
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-brand-navy border border-brand-purpleLight/40 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    <span>{getFestivalLocation(selectedRecallMemory.image, language)}</span>
                  </div>
                )}
              </div>

              {/* Memory Details */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold text-brand-purple">
                  <span className="bg-white border border-brand-purpleLight px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs text-brand-navy">
                    <Calendar className="w-4 h-4 text-brand-purple" /> {selectedRecallMemory.date}
                  </span>
                  {selectedRecallMemory.people && (
                    <span className="bg-white border border-brand-purpleLight px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs text-brand-navy">
                      <Users className="w-4 h-4 text-brand-purple" /> {mt.with}: {selectedRecallMemory.people}
                    </span>
                  )}
                  <span className="bg-brand-purple text-white px-3 py-1 rounded-full uppercase tracking-wider font-black">
                    {selectedRecallMemory.category}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-brand-purpleLight/60 shadow-xs space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-brand-purple">{mt.takeAMoment}</h4>
                  <p className="text-brand-navy font-semibold text-lg leading-relaxed">{localized.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setSelectedRecallMemory(null)}
                  className="flex-1 py-4 bg-brand-purple text-white font-black rounded-2xl hover:bg-opacity-95 active:scale-[0.98] transition-all text-base shadow-md flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{mt.rememberedBtn}</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-brand-purpleLight space-y-6">
            <div className="flex justify-between items-center border-b border-brand-purpleLight pb-4">
              <h2 className="font-extrabold text-xl text-brand-navy">{mt.addNewMemory}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-brand-lavender text-brand-grayText hover:text-brand-navy min-w-[48px] min-h-[48px] flex items-center justify-center">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">{mt.memoryTitle}</label>
                <input
                  type="text"
                  placeholder={mt.placeholderTitle}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-brand-navy mb-2">{mt.date}</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-navy mb-2">{mt.category}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-4 py-3.5 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple text-base"
                  >
                    <option value="family">{mt.categoryFamily}</option>
                    <option value="places">{mt.categoryPlaces}</option>
                    <option value="events">{mt.categoryEvents}</option>
                    <option value="other">{mt.categoryOther}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">{mt.peoplePresent}</label>
                <input
                  type="text"
                  placeholder={mt.placeholderPeople}
                  value={newPeople}
                  onChange={(e) => setNewPeople(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">{mt.memoryDesc}</label>
                <textarea
                  rows={3}
                  placeholder={mt.placeholderDesc}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple text-base resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-brand-navy mb-2">{mt.uploadPhoto}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-brand-grayText file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-brand-purpleLight file:text-brand-purple hover:file:bg-opacity-90 min-h-[48px]"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-brand-purple text-white py-4 rounded-2xl font-black hover:bg-opacity-95 text-base shadow-md min-h-[48px]"
              >
                {mt.plantMemory}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
