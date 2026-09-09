import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Check, 
  CheckCircle2,
  Clock, 
  ChevronRight,
  Sparkles,
  Trash2,
  Send,
  Bell,
  Phone,
  Pill,
  Droplets,
  Utensils,
  Footprints,
  Calendar,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Heart,
  X
} from 'lucide-react';
import { storageService } from '../services/storageService';
import type { Reminder, Activity } from '../data/demoData';
import { SVGMotivation, SVGElderlyAvatar } from '../components/SVGIcons';
import { apiClient } from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';
import { voiceRecognitionService, speakText } from '../services/voiceRecognitionService';
import { parseVoiceCommand, parseCommandTime } from '../services/voiceCommandParser';
import { getFormattedDate, getISODateString } from '../utils/dateUtils';
import { getLocalizedReminder, generateTranslations } from '../services/translationService';
import { voiceActionExecutor } from '../services/voiceActionExecutor';
import { MindGarden } from '../components/MindGarden';

const localNotificationTranslations: Record<string, Record<string, string>> = {
  English: {
    medicineTitle: '💊 Medicine Reminder',
    hydrationTitle: '💧 Hydration Reminder',
    mealsTitle: '🍱 Mealtime Reminder',
    exerciseTitle: '🚶 Walk Reminder',
    reminderTitle: '🔔 Reminder',
    medicineDesc: "It's time to take your medicine.",
    hydrationDesc: "It's time to drink some water.",
    exerciseDesc: "It's time for your walk.",
    reminderDesc: "It's time for your scheduled reminder.",
    markAsDone: 'Mark as Done',
    remindMeLater: 'Remind Me Later',
    dismiss: 'Dismiss'
  },
  Assamese: {
    medicineTitle: '💊 ঔষধৰ অনুস্মাৰক',
    hydrationTitle: '💧 পানী খোৱাৰ অনুস্মাৰক',
    mealsTitle: '🍱 আহাৰ খোৱাৰ অনুস্মাৰক',
    exerciseTitle: '🚶 খোজ কঢ়াৰ অনুস্মাৰক',
    reminderTitle: '🔔 অনুস্মাৰক',
    medicineDesc: 'আপোনাৰ ঔষধ খোৱাৰ সময় হ’ল।',
    hydrationDesc: 'আপোনাৰ পানী খোৱাৰ সময় হ’ল।',
    exerciseDesc: 'আপোনাৰ খোজ কঢ়াৰ সময় হ’ল।',
    reminderDesc: 'আপোনাৰ নিৰ্ধাৰিত অনুস্মাৰকৰ সময় হ’ল।',
    markAsDone: 'সম্পূৰ্ণ বুলি চিহ্নিত কৰক',
    remindMeLater: 'মোক পিছত সোঁৱৰাই দিব',
    dismiss: 'বাতিল কৰক'
  },
  Bengali: {
    medicineTitle: '💊 ওষুধের অনুস্মারক',
    hydrationTitle: '💧 জল খাওয়ার অনুস্মারক',
    mealsTitle: '🍱 খাবার খাওয়ার অনুস্মারক',
    exerciseTitle: '🚶 হাঁটার অনুস্মারক',
    reminderTitle: '🔔 অনুস্মারক',
    medicineDesc: 'আপনার ওষুধ খাওয়ার সময় হয়েছে।',
    hydrationDesc: 'আপনার জল খাওয়ার সময় হয়েছে।',
    exerciseDesc: 'আপনার হাঁটার সময় হয়েছে।',
    reminderDesc: 'আপনার নির্ধারিত অনুস্মারকের সময় হয়েছে।',
    markAsDone: 'সম্পন্ন চিহ্নিত করুন',
    remindMeLater: 'পরে মনে করাবেন',
    dismiss: 'বাতিল করুন'
  },
  Hindi: {
    medicineTitle: '💊 दवा का अनुस्मारक',
    hydrationTitle: '💧 पानी पीने का अनुस्मारक',
    mealsTitle: '🍱 भोजन का अनुस्मारक',
    exerciseTitle: '🚶 टहलने का अनुस्मारक',
    reminderTitle: '🔔 अनुस्मारक',
    medicineDesc: 'आपकी दवा लेने का समय हो गया है।',
    hydrationDesc: 'आपके पानी पीने का समय हो गया है।',
    exerciseDesc: 'आपके टहलने का समय हो गया है।',
    reminderDesc: 'आपके निर्धारित अनुस्मारक का समय हो गया है।',
    markAsDone: 'पूर्ण चिह्नित करें',
    remindMeLater: 'मुझे बाद में याद दिलाएं',
    dismiss: 'खारिज करें'
  },
  Manipuri: {
    medicineTitle: '💊 হিদাক থকপগী রিমাইন্দর',
    hydrationTitle: '💧 ঈশিং থকপগী রিমাইন্দর',
    mealsTitle: '🍱 চাক চাবগী রিমাইন্দর',
    exerciseTitle: '🚶 খোঙনা চৎপগী রিমাইন্দর',
    reminderTitle: '🔔 রিমাইন্দর',
    medicineDesc: 'হিদাক থকপগী মতম ওইরে।',
    hydrationDesc: 'ঈশিং থকপগী মতম ওইরে।',
    exerciseDesc: 'খোঙনা চৎপগী মতম ওইরে।',
    reminderDesc: 'নিনীবগী মতম ওইরে।',
    markAsDone: 'লোইখ্রে হায়না খনৌ',
    remindMeLater: 'হন্না খঙহনবীউ',
    dismiss: 'কোকহনবূ'
  },
  Khasi: {
    medicineTitle: '💊 Jingkynmaw Dawai',
    hydrationTitle: '💧 Jingkynmaw Dih Um',
    mealsTitle: '🍱 Jingkynmaw Bam Ja',
    exerciseTitle: '🚶 Jingkynmaw Shang Kjat',
    reminderTitle: '🔔 Jingkynmaw',
    medicineDesc: 'Dei ka por ban dih ia ki dawai jong phi.',
    hydrationDesc: 'Dei ka por ban dih um.',
    exerciseDesc: 'Dei ka por ban shang kjat.',
    reminderDesc: 'Dei ka por na ka bynta ka jingkynmaw.',
    markAsDone: 'Buh kum kaba la dep',
    remindMeLater: 'Kynmaw pat lashai',
    dismiss: 'Pynkhuid noh'
  },
  Mizo: {
    medicineTitle: '💊 Damdawi Ei Hriattirna',
    hydrationTitle: '💧 Tui In Hriattirna',
    mealsTitle: '🍱 Chaw Ei Hriattirna',
    exerciseTitle: '🚶 Kea Kal Hriattirna',
    reminderTitle: '🔔 Hriattirna',
    medicineDesc: 'Damdawi ei a hun ta.',
    hydrationDesc: 'Tui in a hun ta.',
    exerciseDesc: 'Kea kal a hun ta.',
    reminderDesc: 'I hriattirna hun a thleng ta.',
    markAsDone: 'Zawh tawh anga chhinchiahna',
    remindMeLater: 'La hriattir leh rawh',
    dismiss: 'Tihbo'
  },
  Nagamese: {
    medicineTitle: '💊 Dawa khabole reminder',
    hydrationTitle: '💧 Pani khabole reminder',
    mealsTitle: '🍱 Bhaat khabole reminder',
    exerciseTitle: '🚶 Bera reminder',
    reminderTitle: '🔔 Reminder',
    medicineDesc: 'Dawa khabole time hoise.',
    hydrationDesc: 'Pani khabole time hoise.',
    exerciseDesc: 'Berabole time hoise.',
    reminderDesc: 'Reminder laga time hoise.',
    markAsDone: 'Done kuribi',
    remindMeLater: 'Pise te khobor dibi',
    dismiss: 'Khatam kuribi'
  },
  Tripuri: {
    medicineTitle: '💊 Dawa thungmung reminder',
    hydrationTitle: '💧 Twi thungmung reminder',
    mealsTitle: '🍱 Chamy cha-mung reminder',
    exerciseTitle: '🚶 Re-mung reminder',
    reminderTitle: '🔔 Reminder',
    medicineDesc: 'Dawa thung-mung samung tongkha.',
    hydrationDesc: 'Twi thung-mung samung tongkha.',
    exerciseDesc: 'Re-mung samung tongkha.',
    reminderDesc: 'Reminder samung tongkha.',
    markAsDone: 'Done chadi',
    remindMeLater: 'Pise chikhai khamdi',
    dismiss: 'Delete chadi'
  }
};

const alpineIntroDict: Record<string, string> = {
  English: "Hi! I'm ALPINE, your memory companion. How can I assist you today?",
  Hindi: "नमस्ते! मैं एल्पाइन (ALPINE) हूँ, आपका मेमोरी साथी। आज मैं आपकी क्या मदद कर सकता हूँ?",
  Bengali: "নমস্কার! আমি অ্যালপাইন (ALPINE), আপনার স্মৃতি সহচর। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
  Assamese: "নমস্কাৰ! মই এলপাইন (ALPINE), আপোনাৰ স্মৃতি সংগী। আজি মই আপোনাক কেনেকৈ সহায় কৰিব পাৰো?",
  Manipuri: "হ্যালো! অসি এল্পাইন (ALPINE) নি, আপনার মেমোরি পার্টনার। অসি করম্না মতেং পাংগে?",
  Khasi: "Khublei! Nga dei u ALPINE, u nongsynran jingkynmaw jong phi. Kumno nga lah ban iarap ia phi?",
  Mizo: "Chibai! ALPINE ka ni a, i hriatna kawnga i kawppui tur ka ni. Vawiin hian engtin nge ka tanpui theih ang che?",
  Nagamese: "Hello! Atai ALPINE ase, apuni laga memory companion. Aji apuni ke ki modot kuribole pare?",
  Tripuri: "Khulumkha! Ang ALPINE, nini chokhichang companion. Khaino ang nino choba khamdi?"
};

const voiceStatusLabels: Record<string, {
  listening: string;
  thinking: string;
  speaking: string;
  idle: string;
  speakAdvice: string;
  thinkingAdvice: string;
  listeningAdvice: string;
  tapToTalk: string;
  fallbackText: string;
  remNone: string;
  typePlaceholder: string;
  hideManual: string;
  createManual: string;
  activityTitle: string;
  saveActivity: string;
  time: string;
  navigating: string;
  suggNext: string;
  suggGame: string;
  suggMems: string;
}> = {
  English: {
    listening: 'Listening...',
    thinking: 'Thinking...',
    speaking: 'Speaking...',
    idle: 'ALPINE is Idle',
    speakAdvice: 'Speak clearly into your device',
    thinkingAdvice: 'Understanding your request',
    listeningAdvice: 'Listening to response',
    tapToTalk: 'Tap button to talk',
    fallbackText: "I didn't quite understand that. Could you tell me a little more?",
    remNone: 'No reminders scheduled.',
    typePlaceholder: 'Or type your command here...',
    hideManual: 'Hide Manual Form',
    createManual: 'Or Create Activity Manually',
    activityTitle: 'Activity Title',
    saveActivity: 'Save Activity',
    time: 'Time',
    navigating: 'Navigating...',
    suggNext: "what's next",
    suggGame: 'start a brain game',
    suggMems: 'show my memories'
  },
  Hindi: {
    listening: 'सुन रहा हूँ...',
    thinking: 'सोच रहा हूँ...',
    speaking: 'बोल रहा हूँ...',
    idle: 'एल्पाइन निष्क्रिय है',
    speakAdvice: 'अपने डिवाइस में स्पष्ट बोलें',
    thinkingAdvice: 'आपके अनुरोध को समझ रहा हूँ',
    listeningAdvice: 'प्रतिक्रिया सुन रहा हूँ',
    tapToTalk: 'बात करने के लिए बटन टैप करें',
    fallbackText: 'मुझे यह पूरी तरह समझ नहीं आया। क्या आप थोड़ा और बता सकते हैं?',
    remNone: 'कोई रिमाइंडर्स निर्धारित नहीं हैं।',
    typePlaceholder: 'या अपना कमांड यहाँ टाइप करें...',
    hideManual: 'मैनुअल फॉर्म छिपाएं',
    createManual: 'या मैन्युअल रूप से गतिविधि बनाएं',
    activityTitle: 'गतिविधि का नाम',
    saveActivity: 'गतिविधि सहेजें',
    time: 'समय',
    navigating: 'आगे बढ़ रहे हैं...',
    suggNext: 'आगे क्या है',
    suggGame: 'दिमागी खेल शुरू करें',
    suggMems: 'मेरी यादें दिखाएं'
  },
  Bengali: {
    listening: 'শুনছি...',
    thinking: 'ভাবছি...',
    speaking: 'বলছি...',
    idle: 'অ্যালপাইন নিষ্ক্রিয় আছে',
    speakAdvice: 'আপনার ডিভাইসে পরিষ্কারভাবে বলুন',
    thinkingAdvice: 'আপনার অনুরোধ বোঝার চেষ্টা করছি',
    listeningAdvice: 'প্রতিক্রিয়া শুনছি',
    tapToTalk: 'কথা বলার জন্য বোতাম টিপুন',
    fallbackText: 'আমি এটি ঠিক বুঝতে পারিনি। আপনি কি আর একটু বিস্তারিত বলতে পারেন?',
    remNone: 'কোন অনুস্মারক নির্ধারিত নেই।',
    typePlaceholder: 'অথবা এখানে আপনার কমান্ড টাইপ করুন...',
    hideManual: 'ম্যানুয়াল ফর্ম লুকান',
    createManual: 'অথবা নিজে কাজ যোগ করুন',
    activityTitle: 'কাজের নাম',
    saveActivity: 'কাজ সংরক্ষণ করুন',
    time: 'সময়',
    navigating: 'অন্য পৃষ্ঠায় যাচ্ছি...',
    suggNext: 'এরপরে কি আছে',
    suggGame: 'মস্তিষ্কের খেলা শুরু করুন',
    suggMems: 'আমার স্মৃতি দেখান'
  },
  Assamese: {
    listening: 'শুনি আছোঁ...',
    thinking: 'ভাবি আছোঁ...',
    speaking: 'কৈ আছোঁ...',
    idle: 'এলপাইন নিষ্ক্ৰিয় হৈ আছে',
    speakAdvice: 'আপোনাৰ ডিভাইচত স্পষ্টকৈ কওক',
    thinkingAdvice: 'আপোনাৰ অনুৰোধ বুজিবলৈ চেষ্টা কৰিছোঁ',
    listeningAdvice: 'প্ৰতিক্ৰিয়া শুনি আছোঁ',
    tapToTalk: 'কথা পাতিবলৈ বুটামত টিপক',
    fallbackText: 'মই কথাটো ভালদৰে বুজি নাপালোঁ। অলপ বহলাই ক’ব নেকি?',
    remNone: 'কোনো অনুস্মাৰক নিৰ্ধাৰণ কৰা হোৱা নাই।',
    typePlaceholder: 'বা আপোনাৰ নিৰ্দেশ ইয়াত লিখক...',
    hideManual: 'লিখন প্ৰপত্ৰ লুকুৱাওক',
    createManual: 'বা নিজে কাম যোগ কৰক',
    activityTitle: 'কামৰ নাম',
    saveActivity: 'কাম সংৰক্ষণ কৰক',
    time: 'সময়',
    navigating: 'অন্য পৃষ্ঠালৈ গৈ থকা হৈছে...',
    suggNext: 'ইয়াৰ পিছত কি আছে',
    suggGame: 'মগজুৰ খেল আৰম্ভ কৰক',
    suggMems: 'মোৰ স্মৃতিবোৰ দেখুওৱাওক'
  },
  Manipuri: {
    listening: 'তাগদ্রি...',
    thinking: 'খল্লি...',
    speaking: 'ঙাংগদ্রি...',
    idle: 'এল্পাইন থবক তৌদে',
    speakAdvice: 'নহাক্কী ডিভাইচতা অফবা কওক',
    thinkingAdvice: 'নহাক্কী রিকুয়েষ্ট খঙনবা তৌরি',
    listeningAdvice: 'পাউখুম তাবদ্রি',
    tapToTalk: 'ঙাংনবা বটন নম্বীউ',
    fallbackText: 'ঐ খঙবা ঙমদ্রে, অমুক্তা হন্না হায়বীউ?',
    remNone: 'নীংশিংহনগদবা লৈতে।',
    typePlaceholder: 'নত্রগা মফম অসিদা ইবীউ...',
    hideManual: 'ফৰ্ম লোইশিনবূ',
    createManual: 'থবক মনীংমক হাপ্পু',
    activityTitle: 'থবক মিং',
    saveActivity: 'থবক হাপ্পु',
    time: 'মতূম',
    navigating: 'অতোপ্পা লৈফমদা চৎলি...',
    suggNext: 'মথং করী লৈগে',
    suggGame: 'শান্নপোৎ শান্নৌ',
    suggMems: 'ঐগী নীংশিংফমশিং উৎলূ'
  },
  Khasi: {
    listening: 'Apsngap...',
    thinking: 'Pyrkhat...',
    speaking: 'Kren...',
    idle: 'U ALPINE u sah thiah',
    speakAdvice: 'Kren pynshai ha ka kor jong phi',
    thinkingAdvice: 'Pynsngap ia ka jingpan jong phi',
    listeningAdvice: 'Pynsngap ia ka jubab',
    tapToTalk: 'Thap ia u phrah ban kren',
    fallbackText: 'Nga khlem da sngewthuh bha. Lah ban kynthup kham bniah?',
    remNone: 'Ym don jingpynkynmaw scheduled.',
    typePlaceholder: 'Thoh ia ka kyntien hangne...',
    hideManual: 'Buhrieh ia ka Form',
    createManual: 'Buh kam da lade',
    activityTitle: 'Kynteng Kam',
    saveActivity: 'Khein kam',
    time: 'Por',
    navigating: 'Aiap shaphrang...',
    suggNext: 'Kaba bud ka dei kaei',
    suggGame: 'Mih kam giam',
    suggMems: 'Peit kynmaw'
  },
  Mizo: {
    listening: 'Ngaithla mek...',
    thinking: 'Ngaihtuah mek...',
    speaking: 'Tawng mek...',
    idle: 'ALPINE a chawl mek',
    speakAdvice: 'I phone-ah chiang takin sawi rawh',
    thinkingAdvice: 'I thil ngen kan ngaihtuah mek e',
    listeningAdvice: 'Chhanna ngaithla mek',
    tapToTalk: 'Tawng turin hmet rawh',
    fallbackText: 'Ka va hrethiam chiah lo ve. Khawngaihin sawi thar leh ta che?',
    remNone: 'Reminder ruahman a awm lo.',
    typePlaceholder: 'A hnuai lamah hian chhu lut rawh...',
    hideManual: 'Form thuhrukna',
    createManual: 'Hnathawh tur ziahna',
    activityTitle: 'Hnathawh tur Hming',
    saveActivity: 'Hnathawh tur dahna',
    time: 'A hun',
    navigating: 'Kal mek a ni...',
    suggNext: 'A dawt leh tur eng nge',
    suggGame: 'Infiamna khel rawh',
    suggMems: 'Ka hriatrengnate enna'
  },
  Nagamese: {
    listening: 'Huni ase...',
    thinking: 'Bhabi ase...',
    speaking: 'Koi ase...',
    idle: 'ALPINE toh khali ase',
    speakAdvice: 'Apuni device te bhal pora kobi',
    thinkingAdvice: 'Apuni ki modot chahise bhabi ase',
    listeningAdvice: 'Jubab huni ase',
    tapToTalk: 'Kotha kobole button tap koribi',
    fallbackText: 'Mui bhal pora huna nai. Aru ekbar bhal pora kobi na?',
    remNone: 'Kunuba reminder schedule nai.',
    typePlaceholder: 'Etu te type koribi...',
    hideManual: 'Form thuhriabi',
    createManual: 'Kam manually add koribi',
    activityTitle: 'Activity Title',
    saveActivity: 'Save Activity',
    time: 'Time',
    navigating: 'Navigating...',
    suggNext: 'Etu pise te ki ase',
    suggGame: 'Solom start koribi',
    suggMems: 'Moi memories chabi'
  },
  Tripuri: {
    listening: 'Huny tong...',
    thinking: 'Chokhichang tong...',
    speaking: 'Sa tong...',
    idle: 'ALPINE hor tong',
    speakAdvice: 'Kaitorno chadi phai kok',
    thinkingAdvice: 'Nini kokno bujithani',
    listeningAdvice: 'Jubabno hunythani',
    tapToTalk: 'Kok salani bton khamdi',
    fallbackText: 'Ang bujilakhlai. Aru chichi samphurdi?',
    remNone: 'Reminder chhengla scheduled.',
    typePlaceholder: 'Kaitorno type khailadi...',
    hideManual: 'Form thuhrukdi',
    createManual: 'Kam manually add khamdi',
    activityTitle: 'Activity name',
    saveActivity: 'Save khamdi',
    time: 'Time',
    navigating: 'Navigating...',
    suggNext: 'Ulung te chichi tong',
    suggGame: 'Solomdi khamdi',
    suggMems: 'Memory chadi'
  }
};

const localHomeToastTranslations: Record<string, Record<string, string>> = {
  English: {
    openingFavMemory: 'Opening favorite memory...',
    openingSchedule: 'Opening schedule...',
    callingContact: 'Calling {name}...',
    callCompleted: 'Call completed to: {name}',
    langChanged: 'Language changed to {lang}',
    navSettings: 'Navigating to settings...',
    startingGame: 'Starting game...',
    navigating: 'Navigating...',
    addedActivity: 'Added activity: {title}',
    addedActivityAt: 'Added "{title}" at {time}.'
  },
  Hindi: {
    openingFavMemory: 'पसंदीदा स्मृति खोल रहे हैं...',
    openingSchedule: 'समय सारणी खोल रहे हैं...',
    callingContact: '{name} को कॉल कर रहे हैं...',
    callCompleted: '{name} को कॉल पूरा हुआ',
    langChanged: 'भाषा बदलकर {lang} की गई',
    navSettings: 'सेटिंग्स पर जा रहे हैं...',
    startingGame: 'खेल शुरू हो रहा है...',
    navigating: 'आगे बढ़ रहे हैं...',
    addedActivity: 'गतिविधि जोड़ी गई: {title}',
    addedActivityAt: '{time} बजे "{title}" जोड़ी गई।'
  },
  Bengali: {
    openingFavMemory: 'পছন্দের স্মৃতি খোলা হচ্ছে...',
    openingSchedule: 'সময়সূচী খোলা হচ্ছে...',
    callingContact: '{name}-কে কল করা হচ্ছে...',
    callCompleted: '{name}-এর সাথে কল সম্পন্ন হয়েছে',
    langChanged: 'ভাষা পরিবর্তন করে {lang} করা হয়েছে',
    navSettings: 'সেটিংস পৃষ্ঠায় যাচ্ছি...',
    startingGame: 'খেলা শুরু হচ্ছে...',
    navigating: 'অন্য পৃষ্ঠায় যাচ্ছি...',
    addedActivity: 'কাজ যোগ করা হয়েছে: {title}',
    addedActivityAt: '{time}-এ "{title}" যোগ করা হয়েছে।'
  },
  Assamese: {
    openingFavMemory: 'প্ৰিয় স্মৃতিটো খোলা হৈছে...',
    openingSchedule: 'কাৰ্যসূচী খোলা হৈছে...',
    callingContact: '{name}লৈ কল কৰা হৈছে...',
    callCompleted: '{name}ৰ লগত কল সম্পূৰ্ণ হ’ল',
    langChanged: 'ভাষা সলনি কৰি {lang} কৰা হ’ল',
    navSettings: 'ছেটিংছলৈ গৈ থকা হৈছে...',
    startingGame: 'খেল আৰম্ভ কৰা হৈছে...',
    navigating: 'অন্য পৃষ্ঠালৈ গৈ থকা হৈছে...',
    addedActivity: 'কাম যোগ কৰা হ’ল: {title}',
    addedActivityAt: '{time} বজাত "{title}" যোগ কৰা হ’ল।'
  },
  Manipuri: {
    openingFavMemory: 'পামজবা নীংশিংফম হাংদ্রি...',
    openingSchedule: 'রুতিন অসি হাংদ্রি...',
    callingContact: '{name}দা কৌরি...',
    callCompleted: '{name}গা কৌবা লোইখ্রে',
    langChanged: 'লোন অসি {lang}দা শেমখ্রে',
    navSettings: 'সেটিংসদা চৎলি...',
    startingGame: 'শান্নপোৎ শান্নবা হৌরে...',
    navigating: 'অতোপ্পা লৈফমদা চৎলি...',
    addedActivity: 'থবক হাপখ্রে: {title}',
    addedActivityAt: 'মতূম {time}দা "{title}" হাপখ্রে।'
  },
  Khasi: {
    openingFavMemory: 'Mih kot kynmaw ieid...',
    openingSchedule: 'Mih kot jingtrei...',
    callingContact: 'Kren sha u {name}...',
    callCompleted: 'Ka jingkren bad u {name} la dep',
    langChanged: 'La pynkylla ktien sha ka {lang}',
    navSettings: 'Aiap sha settings...',
    startingGame: 'Giam giam mih...',
    navigating: 'Aiap shaphrang...',
    addedActivity: 'Hap kam thymmai: {title}',
    addedActivityAt: 'La khein ia ka "{title}" ha ka por {time}.'
  },
  Mizo: {
    openingFavMemory: 'Hriatrengna duh ber hawn mek a ni...',
    openingSchedule: 'Hnathawh tur ruahman hawn mek a ni...',
    callingContact: '{name} call mek a ni...',
    callCompleted: '{name} nen inbiak zawh a ni',
    langChanged: 'Tawng hman tur {lang}-ah thlak a ni',
    navSettings: 'Settings-ah kal mek a ni...',
    startingGame: 'Infiamna tan mek a ni...',
    navigating: 'Kal mek a ni...',
    addedActivity: 'Hnathawh tur dah thar a ni: {title}',
    addedActivityAt: 'A hun {time}-ah "{title}" dah a ni.'
  },
  Nagamese: {
    openingFavMemory: 'Bhal yaad khuli ase...',
    openingSchedule: 'Schedule list khuli ase...',
    callingContact: '{name} ke call kuriase...',
    callCompleted: '{name} ke call khotom hoise',
    langChanged: 'Bhasha change hoikena {lang} hoise',
    navSettings: 'Settings te navigate kuriase...',
    startingGame: 'Game start kuriase...',
    navigating: 'Navigating...',
    addedActivity: 'Kam add hoise: {title}',
    addedActivityAt: '{time} te "{title}" add hoise.'
  },
  Tripuri: {
    openingFavMemory: 'Memory chadi phai tong...',
    openingSchedule: 'Schedule chadi phai tong...',
    callingContact: '{name} phone chadi phai tong...',
    callCompleted: '{name} phone khotom khailakha',
    langChanged: 'Bhasha change khailakha {lang}',
    navSettings: 'Settings te chadi phai tong...',
    startingGame: 'Solom start khailani...',
    navigating: 'Navigating...',
    addedActivity: 'Kam add khailakha: {title}',
    addedActivityAt: '{time} te "{title}" add khailakha.'
  }
};

const getReminderCategoryConfig = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'medicine':
      return {
        icon: Pill,
        bg: 'bg-purple-100 text-purple-700 border-purple-200',
        label: 'Medicine'
      };
    case 'hydration':
    case 'water':
      return {
        icon: Droplets,
        bg: 'bg-sky-100 text-sky-700 border-sky-200',
        label: 'Hydration'
      };
    case 'meals':
    case 'food':
    case 'meal':
      return {
        icon: Utensils,
        bg: 'bg-amber-100 text-amber-700 border-amber-200',
        label: 'Meals'
      };
    case 'exercise':
    case 'walking':
    case 'walk':
      return {
        icon: Footprints,
        bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        label: 'Exercise'
      };
    case 'appointments':
    case 'appointment':
      return {
        icon: Calendar,
        bg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        label: 'Appointment'
      };
    case 'family':
    case 'phone':
    case 'call':
      return {
        icon: Phone,
        bg: 'bg-rose-100 text-rose-700 border-rose-200',
        label: 'Family Call'
      };
    case 'sleep':
      return {
        icon: Moon,
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        label: 'Sleep'
      };
    case 'other':
    default:
      return {
        icon: Bell,
        bg: 'bg-orange-100 text-orange-700 border-orange-200',
        label: 'Reminder'
      };
  }
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const ht = localHomeToastTranslations[language] || localHomeToastTranslations.English;
  const labels = voiceStatusLabels[language] || voiceStatusLabels.English;
  const currentUser = storageService.getCurrentUser();
  const [activeUser, setActiveUser] = useState(currentUser);
  const userName = activeUser ? activeUser.name : 'Patient';
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // States
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('You can ask me anything...');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real voice state machine fallbacks
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'success' | 'error' | 'denied' | 'unsupported' | 'offline'>('idle');
  const [textCommand, setTextCommand] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualTime, setManualTime] = useState('18:00');

  const [activeNotification, setActiveNotification] = useState<Reminder | null>(null);
  const [voiceContext, setVoiceContext] = useState<any | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const countdownIntervalRef = React.useRef<any>(null);
  const [showFallbackInput, setShowFallbackInput] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isListening) {
      setRecordingSeconds(0);
      interval = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  useEffect(() => {
    storageService.init();
    apiClient.checkHealth(); // Trigger healthcheck immediately to update connected state
    setReminders(storageService.getReminders());

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    const checkDueReminders = () => {
      const now = new Date();
      const todayStr = getISODateString(now);
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const allReminders = storageService.getReminders();
      const due = allReminders.find(r => {
        if (r.isDefault) return false;
        if (r.status !== 'Upcoming' && r.status !== 'Scheduled') return false;
        
        const rDate = r.date || todayStr;
        if (rDate > todayStr) return false;
        
        if (rDate === todayStr) {
          return r.time <= currentHHMM;
        }
        return true;
      });
      
      if (due && (!activeNotification || activeNotification.id !== due.id)) {
        const localizedDue = getLocalizedReminder(due, language);
        setActiveNotification(due);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`🔔 ${t('rem.title') || 'Reminder'}: ${localizedDue.title}`, {
            body: localizedDue.description || `It's time for your scheduled reminder.`,
            tag: due.id
          });
        }
      }
    };

    checkDueReminders();
    const interval = setInterval(checkDueReminders, 10000);
    return () => clearInterval(interval);
  }, [activeNotification]);

  const handleNotificationComplete = async (reminder: Reminder) => {
    await handleToggleReminder(reminder.id);
    setActiveNotification(null);
  };

  const handleNotificationSnooze = async (reminder: Reminder, minutes: number = 10) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const snoozedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const allReminders = storageService.getReminders();
    const updated = allReminders.map(r => {
      if (r.id === reminder.id) {
        return {
          ...r,
          time: snoozedTime,
          date: getISODateString(now),
          status: 'Upcoming' as const
        };
      }
      return r;
    });
    
    setReminders(updated);
    storageService.saveReminders(updated);
    
    const alerts = storageService.getAlerts();
    storageService.saveAlerts([
      { id: `al-${Date.now()}`, type: 'info', title: `${reminder.title} snoozed for ${minutes}m`, time: 'Just now' },
      ...alerts
    ]);
    
    setActiveNotification(null);
    triggerToast(`Snoozed for ${minutes} minutes`);
  };

  const handleNotificationDismiss = (reminder: Reminder) => {
    const allReminders = storageService.getReminders();
    const updated = allReminders.map(r => {
      if (r.id === reminder.id) {
        return {
          ...r,
          status: 'Missed' as const
        };
      }
      return r;
    });
    setReminders(updated);
    storageService.saveReminders(updated);
    
    const alerts = storageService.getAlerts();
    storageService.saveAlerts([
      { id: `al-${Date.now()}`, type: 'warning', title: `${reminder.title} dismissed/missed`, time: 'Just now' },
      ...alerts
    ]);
    
    setActiveNotification(null);
    triggerToast('Reminder dismissed');
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    const nextStatus: Reminder['status'] = reminder.status === 'Completed' ? 'Upcoming' : 'Completed';
    let updatedReminder: Reminder = { ...reminder, status: nextStatus };

    if (apiClient.getStatus() === 'connected') {
      const res = await apiClient.post<{ success: boolean; reminder: Reminder; alert: any }>(
        `/reminders/${id}/complete`, 
        reminder
      );
      if (res && res.success) {
        updatedReminder = res.reminder;
        if (res.alert) {
          const alerts = storageService.getAlerts();
          storageService.saveAlerts([res.alert, ...alerts]);
        }
      }
    } else {
      // Local fallback
      if (nextStatus === 'Completed') {
        const alerts = storageService.getAlerts();
        storageService.saveAlerts([
          { id: `al-${Date.now()}`, type: 'success', title: `${reminder.title} completed`, time: 'Just now' },
          ...alerts
        ]);
      }
    }

    const updated = reminders.map(r => r.id === id ? updatedReminder : r);
    setReminders(updated);
    storageService.saveReminders(updated);
    triggerToast(`Reminder marked as ${nextStatus.toLowerCase()}`);
  };

  const handleDeleteReminder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      if (apiClient.getStatus() === 'connected') {
        await apiClient.delete(`/reminders/${id}`);
      }
      const updated = reminders.filter(r => r.id !== id);
      setReminders(updated);
      storageService.saveReminders(updated);
      triggerToast('Reminder deleted');
    }
  };

  const handleSnoozeReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    let updatedReminder = { ...reminder, time: snoozeTime(reminder.time) };

    if (apiClient.getStatus() === 'connected') {
      const res = await apiClient.post<{ success: boolean; reminder: Reminder; alert: any }>(
        `/reminders/${id}/snooze`,
        reminder
      );
      if (res && res.success) {
        updatedReminder = res.reminder;
        if (res.alert) {
          const alerts = storageService.getAlerts();
          storageService.saveAlerts([res.alert, ...alerts]);
        }
      }
    } else {
      // Local fallback alert
      const alerts = storageService.getAlerts();
      storageService.saveAlerts([
        { id: `al-${Date.now()}`, type: 'info', title: `${reminder.title} snoozed for 15m`, time: 'Just now' },
        ...alerts
      ]);
    }

    const updated = reminders.map(r => r.id === id ? updatedReminder : r);
    setReminders(updated);
    storageService.saveReminders(updated);
    triggerToast(`Snoozed ${reminder.title} for 15 minutes`);
  };

  const snoozeTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    let newMinutes = minutes + 15;
    let newHours = hours;
    if (newMinutes >= 60) {
      newMinutes -= 60;
      newHours = (newHours + 1) % 24;
    }
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPhoto = () => {
    if (!photoPreview || !activeUser) return;
    storageService.updateProfilePhoto(activeUser.id, photoPreview);
    const updatedUser = { ...activeUser, photo: photoPreview };
    setActiveUser(updatedUser);
    setPhotoPreview(null);
    triggerToast('Profile photo updated successfully!');
  };

  const handleCancelPhotoPreview = () => {
    setPhotoPreview(null);
  };

  const handleSpeak = () => {
    if (!voiceRecognitionService.isSupported()) {
      setVoiceStatus('unsupported');
      setVoiceText('Voice recognition is unsupported on this browser.');
      setIsListening(false);
      return;
    }

    const introKey = 'sb_alpine_introduced';
    const introduced = localStorage.getItem(introKey) === 'true';
    if (!introduced) {
      const introText = alpineIntroDict[language] || alpineIntroDict.English;
      setVoiceStatus('speaking');
      setVoiceText(introText);
      localStorage.setItem(introKey, 'true');
      speakText(introText, language, () => {
        setVoiceStatus('idle');
        setVoiceText('You can ask me anything...');
      });
      return;
    }

    if (isListening) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      voiceRecognitionService.stopListening();
      setIsListening(false);
      setVoiceStatus('idle');
      setVoiceText('You can ask me anything...');
      return;
    }

    setShowFallbackInput(false);
    setIsListening(true);
    setVoiceStatus('listening');
    setVoiceText('Listening to your voice...');
    setRecordingSeconds(8);

    let countdownSec = 8;
    console.log('[VOICE] Mic button clicked');
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      countdownSec -= 1;
      setRecordingSeconds(countdownSec);
      if (countdownSec <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        console.log('[VOICE] 8 seconds completed. Auto-stopping microphone capture.');
        voiceRecognitionService.stopListening();
      } else {
        console.log(`[VOICE] Countdown: ${countdownSec}`);
        setVoiceText(`Listening... Speak now (${countdownSec}s)`);
      }
    }, 1000);

    voiceRecognitionService.startListening(language, {
      onStart: () => {
        console.log('[VOICE] Permission granted');
        console.log('[VOICE] Listening started');
        setIsListening(true);
        setVoiceStatus('listening');
        setVoiceText('Listening... Speak now (8s)');
      },
      onResult: (transcript) => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        console.log(`[DIAGNOSTIC] 1. STT produced transcript: "${transcript}"`);
        console.log(`[DIAGNOSTIC] Current window.location.href: "${window.location.href}"`);
        setIsListening(false);
        voiceRecognitionService.stopListening();
        localStorage.setItem('sb_last_voice_command', transcript);
        console.log(`[DIAGNOSTIC] 2. Invoking handleCommandParse() with: "${transcript}"`);
        handleCommandParse(transcript);
        console.log('[VOICE] Processing command');
      },
      onError: (err) => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        console.error(`[VOICE] Error: ${err}`);
        console.log('[VOICE] Listening stopped');
        setIsListening(false);
        setShowFallbackInput(true);
        if (err === 'denied' || err === 'microphone-denied') {
          setVoiceStatus('denied');
          setVoiceText('Microphone permission was denied. Please allow microphone access in settings.');
        } else if (err === 'microphone-unavailable') {
          setVoiceStatus('error');
          setVoiceText('Microphone is unavailable, muted, or not connected.');
        } else if (err === 'empty-recording') {
          setVoiceStatus('error');
          setVoiceText('Microphone recording produced no audio. Please speak louder.');
        } else if (err === 'model-missing') {
          setVoiceStatus('offline');
          setVoiceText('Voice input is using offline mode. You can type your command below.');
        } else if (err === 'service-unavailable' || err === 'network') {
          setVoiceStatus('offline');
          setVoiceText('Voice input is using offline mode. You can type your command below.');
        } else {
          setVoiceStatus('error');
          setVoiceText('Voice recognition failed or process execution failed.');
        }
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  const handleCommandParse = async (transcript: string) => {
    console.log(`[DIAGNOSTIC] 3. handleCommandParse ENTERED: "${transcript}"`);
    try {
      console.log('[VOICE] transcription response received');
      console.log(`[VOICE] transcript: "${transcript}"`);
      setVoiceStatus('processing');
      setVoiceText(`Heard: "${transcript}". Understanding...`);

      const format12Hour = (timeStr: string) => {
        if (!timeStr) return '';
        const [hoursStr, minutesStr] = timeStr.split(':');
        const hours = parseInt(hoursStr, 10);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutesStr} ${suffix}`;
      };

      let parsed: any = null;

      // Check if voiceContext is active
      if (voiceContext) {
        if (voiceContext.intent === 'CONFIRM_PAST_TIME') {
          const cleanLower = transcript.toLowerCase().trim();
          const isYes = cleanLower.includes('yes') || cleanLower.includes('sure') || cleanLower.includes('yeah') || cleanLower.includes('हाँ') || cleanLower.includes('হ্যাঁ') || cleanLower.includes('হব');
          
          if (isYes) {
            const act = voiceContext.data;
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            
            parsed = {
              intent: 'CREATE_ACTIVITY',
              response: `Done. I've scheduled your reminder for ${act.title} tomorrow at ${format12Hour(act.time)}.`,
              activityData: {
                ...act,
                date: tomorrowStr,
                needClarification: false
              }
            };
            setVoiceContext(null);
          } else {
            parsed = {
              intent: 'CANCEL',
              response: 'Okay, I cancelled setting that reminder.'
            };
            setVoiceContext(null);
          }
        } else if (voiceContext.intent === 'CREATE_ACTIVITY_MISSING_TITLE') {
          const title = transcript.trim();
          const act = voiceContext.data;
          const updatedAct = { ...act, title };
          
          if (updatedAct.time) {
            parsed = {
              intent: 'CREATE_ACTIVITY',
              response: `Done. I've scheduled your reminder for ${title} at ${format12Hour(updatedAct.time)}.`,
              activityData: {
                ...updatedAct,
                needClarification: false
              }
            };
            setVoiceContext(null);
          } else {
            parsed = {
              intent: 'CREATE_ACTIVITY',
              response: `What time would you like me to remind you about ${title}?`,
              activityData: {
                ...updatedAct,
                needClarification: true,
                missingField: 'time'
              }
            };
            setVoiceContext({
              intent: 'CREATE_ACTIVITY_MISSING_TIME',
              data: updatedAct
            });
          }
        } else if (voiceContext.intent === 'CREATE_ACTIVITY_MISSING_TIME') {
          const time = parseCommandTime(transcript);
          const act = voiceContext.data;
          
          if (time) {
            parsed = {
              intent: 'CREATE_ACTIVITY',
              response: `Done. I've scheduled your reminder for ${act.title} at ${format12Hour(time)}.`,
              activityData: {
                ...act,
                time,
                needClarification: false
              }
            };
            setVoiceContext(null);
          } else {
            parsed = {
              intent: 'CREATE_ACTIVITY',
              response: `Sorry, I couldn't understand that time. What time should I set the reminder for?`,
              activityData: {
                ...act,
                needClarification: true,
                missingField: 'time'
              }
            };
          }
        }
      }

      if (!parsed) {
        if (apiClient.getStatus() === 'connected') {
          console.log('[DIAGNOSTIC] 4. About to call /voice/command');
          const res = await apiClient.post<any>('/voice/command', {
            patientId: currentUser?.id || 'ravi-demo',
            command: transcript,
            language: language,
            voiceContext: voiceContext,
            contextData: {
              currentTime: new Date().toISOString(),
              reminders: storageService.getReminders(),
              schedule: storageService.getSchedule(),
              memories: storageService.getMemories().map(m => ({ id: m.id, title: m.title, date: m.date, description: m.description, people: m.people })),
              games: storageService.getGames(),
              profile: currentUser
            }
          });
          console.log(`[DIAGNOSTIC] 5. /voice/command response received:`, res);
          if (res && res.success) {
            console.log(`[DIAGNOSTIC] 6. Parsed intent: "${res.intent}"`);
            console.log(`[DIAGNOSTIC] 7. Parsed target: "${res.parameters?.target || (res.action && res.action.target)}"`);
            console.log(`[DIAGNOSTIC] 8. Parsed path: "${res.path || (res.action && res.action.target)}"`);
            parsed = {
              intent: res.intent,
              path: res.path || (res.action && res.action.target),
              response: res.response,
              activityData: res.activityData,
              languageValue: res.languageValue,
              gameId: res.gameId,
              parameters: res.parameters,
              actions: res.actions
            };
          } else {
            console.log(`[DIAGNOSTIC] Backend response success = false, parsing locally`);
            parsed = parseVoiceCommand(transcript, language);
          }
        } else {
          parsed = parseVoiceCommand(transcript, language);
        }
      }

      // Context setting for missing fields or past time today
      if ((parsed.intent === 'CREATE_ACTIVITY' || parsed.intent === 'CREATE_REMINDER') && parsed.activityData) {
        const act = parsed.activityData;
        if (act.needClarification) {
          if (act.missingField === 'title') {
            setVoiceContext({
              intent: 'CREATE_ACTIVITY_MISSING_TITLE',
              data: act
            });
          } else if (act.missingField === 'time') {
            setVoiceContext({
              intent: 'CREATE_ACTIVITY_MISSING_TIME',
              data: act
            });
          }
        } else {
          // Time validation: check if time has already passed today
          const now = new Date();
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
          });
          const [istHourStr, istMinuteStr] = formatter.format(now).split(':');
          const currentIstHour = parseInt(istHourStr, 10);
          const currentIstMinute = parseInt(istMinuteStr, 10);

          const [targetHourStr, targetMinuteStr] = act.time.split(':');
          const targetHour = parseInt(targetHourStr, 10);
          const targetMinute = parseInt(targetMinuteStr, 10);

          const isPastTimeToday = targetHour < currentIstHour || (targetHour === currentIstHour && targetMinute < currentIstMinute);

          if (isPastTimeToday && act.date === now.toISOString().split('T')[0]) {
            parsed.intent = 'CREATE_ACTIVITY';
            parsed.activityData.needClarification = true;
            const pastTimeDict: Record<string, string> = {
              English: `${format12Hour(act.time)} has already passed today. Would you like me to add ${act.title} for tomorrow at ${format12Hour(act.time)}?`,
              Hindi: `${format12Hour(act.time)} आज पहले ही बीत चुका है। क्या आप चाहते हैं कि मैं कल ${format12Hour(act.time)} बजे ${act.title} जोड़ूँ?`,
              Bengali: `${format12Hour(act.time)} আজকে পার হয়ে গেছে। আপনি কি চান আমি আগামীকাল ${format12Hour(act.time)} টায় ${act.title} যুক্ত করি?`,
              Assamese: `${format12Hour(act.time)} আজি ইতিমধ্যে পাৰ হৈ গ’ল। আপুনি বিচাৰে নেকি মই অহাকালি ${format12Hour(act.time)} বজাত ${act.title} যোগ কৰোঁ?`,
              Manipuri: `${format12Hour(act.time)} অসি অয়ুক্তগী লোইখ্রে। নহাক্না ${act.title} গী নোংমাইজিংদা ${format12Hour(act.time)} দা হাপচিনবা পামীবге?`,
              Khasi: `${format12Hour(act.time)} la dep mynta ka sngi. Phi kwah ban pynbeit ia ka ${act.title} lashai ha ka por ${format12Hour(act.time)}?`,
              Mizo: `${format12Hour(act.time)} a liam tawh a ni. A tul e i tih leh naktuk ${format12Hour(act.time)} ah ${act.title} hi kan dah mai dawn em ni?`,
              Nagamese: `${format12Hour(act.time)} toh aji par hoise. Apuni kali ${format12Hour(act.time)} te ${act.title} logabole mon ase na?`,
              Tripuri: `${format12Hour(act.time)} toh aji par hoise. Nini khali ${format12Hour(act.time)} te ${act.title} logadi logamani tong?`
            };
            parsed.response = pastTimeDict[language] || pastTimeDict.English;
            
            setVoiceContext({
              intent: 'CONFIRM_PAST_TIME',
              data: act
            });
          }
        }
      }

    console.log(`[VOICE] parsed intent: ${parsed.intent}`);
    console.log(`[VOICE] executing action: ${parsed.intent === 'UNKNOWN' ? 'none' : parsed.intent}`);

    setTimeout(() => {
      executeParsedCommand(parsed);
    }, 1000);
    } catch (e: any) {
      console.error('[DIAGNOSTIC] ERROR in handleCommandParse:', e);
    }
  };

  const executeParsedCommand = (parsed: any) => {
    if (parsed.intent === 'UNKNOWN') {
      setIsListening(false);
      voiceRecognitionService.stopListening();
      setVoiceStatus('error');
      const unknownMsg = parsed.response || "I didn't understand that. Please type your command.";
      setVoiceText(unknownMsg);
      speakText(unknownMsg, language, () => {});
      setShowFallbackInput(true);
      return;
    }

    setShowFallbackInput(false);

    if (parsed.intent === 'CANCEL') {
      setIsListening(false);
      voiceRecognitionService.stopListening();
    }

    if (parsed.intent === 'CHANGE_LANGUAGE' && parsed.languageValue) {
      setLanguage(parsed.languageValue);
      triggerToast(ht.langChanged.replace('{lang}', parsed.languageValue));
      const nextText = language === 'English' ? `Changed language to ${parsed.languageValue}.` : `Language changed.`;
      setVoiceStatus('speaking');
      setVoiceText(nextText);
      speakText(nextText, language, () => setVoiceStatus('idle'));
      return;
    }

    console.log(`[DIAGNOSTIC] 7. voiceActionExecutor.execute() receiving parsed result:`, parsed);
    const result = voiceActionExecutor.execute(
      parsed,
      {
        refreshReminders: () => {
          setReminders(storageService.getReminders());
        },
        refreshSchedule: () => {
          setReminders(storageService.getReminders());
        },
        refreshMemories: () => {
          setReminders(storageService.getReminders());
        },
        navigate: (path: string, state?: any) => {
          if (path === '-1') {
            navigate(-1);
            return;
          }
          console.log(`[VOICE NAV] Home.tsx immediate navigate to: "${path}"`, state);
          triggerToast(ht.navigating);
          const navOptions = state ? (state.state !== undefined ? state : { state }) : undefined;
          navigate(path, navOptions);
        },
        setActiveCall: (name: string | null) => {
          setActiveCall(name);
          if (name) {
            const resText = ht.callingContact.replace('{name}', name);
            setVoiceStatus('speaking');
            setVoiceText(resText);
            speakText(resText, language, () => {});
            setTimeout(() => {
              setActiveCall(null);
              alert(ht.callCompleted.replace('{name}', name));
              setVoiceStatus('idle');
              setVoiceText(ht.callCompleted.replace(': {name}', ''));
            }, 4000);
          }
        },
        triggerToast: (msg: string) => {
          triggerToast(msg);
        }
      },
      language,
      currentUser
    );

    setVoiceContext(result.nextContext);

    const responseToSpeak = result.responseOverride || parsed.response;
    if (responseToSpeak) {
      setVoiceStatus('speaking');
      setVoiceText(responseToSpeak);
      speakText(responseToSpeak, language, () => {
        setVoiceStatus('idle');
      });
    } else {
      setVoiceStatus('idle');
    }
  };

  const saveVoiceActivity = (title: string, time: string, date: string, category: string, createReminder: boolean) => {
    const schedule = storageService.getSchedule();
    const format12Hour = (timeStr: string) => {
      if (!timeStr) return '';
      const [hoursStr, minutesStr] = timeStr.split(':');
      const hours = parseInt(hoursStr, 10);
      const suffix = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutesStr} ${suffix}`;
    };
    const newAct: Activity = {
      id: `sch-${Date.now()}`,
      time: format12Hour(time),
      title,
      completed: false
    };
    const updatedSchedule = [...schedule, newAct];
    storageService.saveSchedule(updatedSchedule);

    if (createReminder) {
      const remindersList = storageService.getReminders();
      const newRem: Reminder = {
        id: `rem-${Date.now()}`,
        category: (category as any) || 'other',
        title,
        description: language === 'Hindi' ? 'आवाज़ द्वारा बनाया गया अनुस्मारक' : language === 'Bengali' ? 'কণ্ঠস্বর দ্বারা তৈরি অনুস্মারক' : 'Voice created reminder',
        time,
        date,
        status: 'Upcoming',
        repeat: 'Daily',
        enabled: true
      };
      storageService.saveReminders([newRem, ...remindersList]);
      setReminders([newRem, ...remindersList]);

      generateTranslations(title, newRem.description).then(trans => {
        // Update schedule
        const currentSch = storageService.getSchedule();
        const updatedSch = currentSch.map(s => s.id === newAct.id ? { ...s, translations: trans } : s);
        storageService.saveSchedule(updatedSch);

        // Update reminders
        const currentRems = storageService.getReminders();
        const updatedRems = currentRems.map(r => r.id === newRem.id ? { ...r, translations: trans } : r);
        storageService.saveReminders(updatedRems);
        setReminders(updatedRems);
      }).catch(err => {
        console.warn('[Translation] Failed to generate translations for voice reminder:', err);
      });
    } else {
      generateTranslations(title, '').then(trans => {
        const currentSch = storageService.getSchedule();
        const updatedSch = currentSch.map(s => s.id === newAct.id ? { ...s, translations: trans } : s);
        storageService.saveSchedule(updatedSch);
      }).catch(err => {
        console.warn('[Translation] Failed to generate translations for voice activity:', err);
      });
    }

    const alerts = storageService.getAlerts();
    const newAlert = {
      id: `al-${Date.now()}`,
      type: 'info' as const,
      title: `${userName} added schedule: ${title} at ${format12Hour(time)}`,
      time: 'Just now'
    };
    storageService.saveAlerts([newAlert, ...alerts]);

    setVoiceStatus('success');
    setVoiceText(ht.addedActivityAt.replace('{title}', title).replace('{time}', format12Hour(time)));
    triggerToast(ht.addedActivity.replace('{title}', title));
  };

  const handleTextInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textCommand.trim()) return;
    handleCommandParse(textCommand.trim());
    setTextCommand('');
  };

  const handleManualActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    // Time validation in Asia/Kolkata timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const [istHourStr, istMinuteStr] = formatter.format(now).split(':');
    const currentIstHour = parseInt(istHourStr, 10);
    const currentIstMinute = parseInt(istMinuteStr, 10);

    const [targetHourStr, targetMinuteStr] = manualTime.split(':');
    const targetHour = parseInt(targetHourStr, 10);
    const targetMinute = parseInt(targetMinuteStr, 10);

    const isPastTimeToday = targetHour < currentIstHour || (targetHour === currentIstHour && targetMinute < currentIstMinute);

    if (isPastTimeToday) {
      if (window.confirm("That time has already passed today.\nWould you like to schedule this activity for tomorrow instead?")) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        saveVoiceActivity(manualTitle.trim(), manualTime, tomorrowStr, 'other', true);
        setManualTitle('');
        setShowManualForm(false);
      }
      return;
    }

    saveVoiceActivity(manualTitle.trim(), manualTime, new Date().toISOString().split('T')[0], 'other', true);
    setManualTitle('');
    setShowManualForm(false);
  };

  // Dynamic time-based greeting calculation in Asia/Kolkata timezone
  const [greeting, setGreeting] = useState('');
  const [greetingTimePeriod, setGreetingTimePeriod] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  const getGreetingTheme = (period: 'morning' | 'afternoon' | 'evening' | 'night') => {
    switch (period) {
      case 'morning':
        return {
          container: 'border-amber-200/90 bg-gradient-to-r from-sky-100 via-amber-50 to-orange-100 shadow-sm',
          titleText: 'text-amber-950 font-black',
          subText: 'text-amber-900/80',
          userNameText: 'text-amber-950',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          avatarBorder: 'border-amber-400 bg-amber-100/80',
          svg: (
            <svg className="w-56 h-56 text-amber-400/60 transform translate-x-4 -translate-y-4" viewBox="0 0 120 120" fill="none">
              {/* Rising Morning Sun */}
              <circle cx="60" cy="60" r="26" fill="#FBBF24" fillOpacity="0.4" />
              <circle cx="60" cy="60" r="18" fill="#F59E0B" fillOpacity="0.8" />
              {/* Sun Rays */}
              <g stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
                <line x1="60" y1="24" x2="60" y2="12" />
                <line x1="60" y1="96" x2="60" y2="108" />
                <line x1="24" y1="60" x2="12" y2="60" />
                <line x1="96" y1="60" x2="108" y2="60" />
                <line x1="34" y1="34" x2="26" y2="26" />
                <line x1="86" y1="86" x2="94" y2="94" />
                <line x1="34" y1="86" x2="26" y2="94" />
                <line x1="86" y1="34" x2="94" y2="26" />
              </g>
              {/* Soft Morning Clouds */}
              <path d="M30 80 Q 42 66 58 78 Q 72 64 88 78 Q 98 76 102 85 Z" fill="#FFFFFF" fillOpacity="0.6" />
            </svg>
          )
        };
      case 'afternoon':
        return {
          container: 'border-sky-200/90 bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-50 shadow-sm',
          titleText: 'text-slate-900 font-black',
          subText: 'text-slate-700',
          userNameText: 'text-slate-900',
          badge: 'bg-sky-100 text-sky-900 border-sky-300',
          avatarBorder: 'border-sky-400 bg-sky-100/80',
          svg: (
            <svg className="w-56 h-56 text-sky-400/60 transform translate-x-4 -translate-y-4" viewBox="0 0 120 120" fill="none">
              {/* Bright Afternoon Sun */}
              <circle cx="75" cy="40" r="20" fill="#FBBF24" fillOpacity="0.85" />
              {/* Fluffy Daytime Cumulus Clouds */}
              <path d="M15 75 Q 30 55 50 70 Q 70 50 90 68 Q 105 60 115 75 Z" fill="#FFFFFF" fillOpacity="0.75" />
              <path d="M35 88 Q 50 72 70 85 Q 85 70 100 88 Z" fill="#E0F2FE" fillOpacity="0.5" />
            </svg>
          )
        };
      case 'evening':
        return {
          container: 'border-purple-200/90 bg-gradient-to-r from-amber-100 via-rose-100 to-purple-100 shadow-sm',
          titleText: 'text-purple-950 font-black',
          subText: 'text-purple-900/80',
          userNameText: 'text-purple-950',
          badge: 'bg-purple-100 text-purple-900 border-purple-300',
          avatarBorder: 'border-purple-400 bg-purple-100/80',
          svg: (
            <svg className="w-56 h-56 text-rose-400/60 transform translate-x-4 -translate-y-2" viewBox="0 0 120 120" fill="none">
              {/* Setting Sunset Sun Disc */}
              <circle cx="60" cy="65" r="24" fill="#F59E0B" fillOpacity="0.65" />
              {/* Soft Horizon Line */}
              <line x1="0" y1="85" x2="120" y2="85" stroke="#E11D48" strokeWidth="4" strokeOpacity="0.3" />
              {/* Sunset Dusk Clouds */}
              <path d="M20 75 Q 40 60 65 72 Q 85 58 110 75 Z" fill="#FDA4AF" fillOpacity="0.4" />
              <circle cx="35" cy="30" r="1.5" fill="#FBBF24" />
              <circle cx="85" cy="25" r="2" fill="#FBBF24" />
            </svg>
          )
        };
      case 'night':
      default:
        return {
          container: 'border-indigo-900 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 shadow-md',
          titleText: 'text-white font-black',
          subText: 'text-indigo-200',
          userNameText: 'text-white',
          badge: 'bg-indigo-900/90 text-indigo-200 border-indigo-700',
          avatarBorder: 'border-indigo-400 bg-indigo-900/80',
          svg: (
            <svg className="w-56 h-56 text-indigo-300/50 transform translate-x-4 -translate-y-4" viewBox="0 0 120 120" fill="none">
              {/* Glowing Crescent Moon */}
              <path d="M68 30 A 28 28 0 1 0 92 84 A 34 34 0 1 1 68 30 Z" fill="#FDE047" fillOpacity="0.8" />
              {/* Subtle Twinkling Stars */}
              <circle cx="30" cy="35" r="1.5" fill="white" fillOpacity="0.85" />
              <circle cx="45" cy="22" r="2" fill="white" fillOpacity="0.95" />
              <circle cx="85" cy="20" r="1" fill="white" fillOpacity="0.8" />
              <circle cx="95" cy="40" r="2" fill="white" fillOpacity="0.9" />
              <circle cx="22" cy="70" r="1.2" fill="white" fillOpacity="0.75" />
            </svg>
          )
        };
    }
  };

  const getVoiceTheme = (period: 'morning' | 'afternoon' | 'evening' | 'night') => {
    switch (period) {
      case 'morning':
        return {
          cardBg: 'bg-gradient-to-br from-amber-50/95 via-amber-100/60 to-orange-50/90',
          borderColor: 'border-amber-300/90 shadow-amber-500/10 hover:border-amber-400',
          titleText: 'text-amber-950',
          subText: 'text-amber-900/80',
          micBg: 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-200 text-white shadow-amber-500/30 hover:shadow-amber-500/50',
          idleRing1: 'border-amber-400/50 bg-amber-400/15',
          idleRing2: 'border-amber-500/60 bg-amber-400/25',
          badge: 'bg-amber-100/90 text-amber-950 border-amber-300',
          sparkleColor: 'text-amber-500',
          ambientGlow1: 'bg-amber-300/30',
          ambientGlow2: 'bg-orange-300/25',
          glowBorder: 'from-amber-400/50 via-orange-400/40 to-amber-300/50',
          animationClass: 'motion-safe:animate-pulse',
          animationDuration: '5s'
        };
      case 'afternoon':
        return {
          cardBg: 'bg-gradient-to-br from-sky-50/90 via-amber-50/80 to-orange-50/70',
          borderColor: 'border-sky-300/80 shadow-sky-500/10 hover:border-sky-400',
          titleText: 'text-sky-950',
          subText: 'text-sky-900/80',
          micBg: 'bg-gradient-to-br from-sky-500 via-amber-500 to-orange-500 border-sky-200 text-white shadow-sky-500/30 hover:shadow-sky-500/50',
          idleRing1: 'border-sky-300/50 bg-sky-400/15',
          idleRing2: 'border-amber-400/60 bg-amber-400/25',
          badge: 'bg-sky-100/90 text-sky-950 border-sky-300',
          sparkleColor: 'text-sky-500',
          ambientGlow1: 'bg-sky-200/40',
          ambientGlow2: 'bg-amber-200/30',
          glowBorder: 'from-sky-400/50 via-amber-300/40 to-sky-200/50',
          animationClass: 'motion-safe:animate-pulse',
          animationDuration: '6s'
        };
      case 'evening':
        return {
          cardBg: 'bg-gradient-to-br from-rose-50/90 via-amber-50/70 to-purple-50/80',
          borderColor: 'border-rose-300/80 shadow-rose-500/10 hover:border-rose-400',
          titleText: 'text-rose-950',
          subText: 'text-rose-900/80',
          micBg: 'bg-gradient-to-br from-rose-500 via-amber-600 to-purple-600 border-rose-200 text-white shadow-rose-500/30 hover:shadow-rose-500/50',
          idleRing1: 'border-rose-300/50 bg-rose-400/15',
          idleRing2: 'border-purple-300/60 bg-purple-400/20',
          badge: 'bg-rose-100/90 text-rose-950 border-rose-300',
          sparkleColor: 'text-rose-500',
          ambientGlow1: 'bg-rose-300/30',
          ambientGlow2: 'bg-purple-300/25',
          glowBorder: 'from-rose-400/50 via-amber-400/40 to-purple-400/50',
          animationClass: 'motion-safe:animate-pulse',
          animationDuration: '7s'
        };
      case 'night':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
          borderColor: 'border-indigo-400/70 shadow-indigo-500/25 hover:border-indigo-300',
          titleText: 'text-indigo-50',
          subText: 'text-indigo-200/90',
          micBg: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-sky-500 border-indigo-300 text-white shadow-indigo-500/40 hover:shadow-indigo-500/60',
          idleRing1: 'border-indigo-400/50 bg-indigo-400/15',
          idleRing2: 'border-sky-400/60 bg-sky-400/20',
          badge: 'bg-indigo-900/90 text-indigo-100 border-indigo-700',
          sparkleColor: 'text-amber-400',
          ambientGlow1: 'bg-indigo-500/20',
          ambientGlow2: 'bg-sky-500/15',
          glowBorder: 'from-indigo-400/50 via-sky-400/40 to-indigo-600/50',
          animationClass: 'motion-safe:animate-pulse',
          animationDuration: '8s'
        };
    }
  };

  useEffect(() => {
    const updateGreeting = () => {
      // Get current date/time string formatted specifically to Asia/Kolkata timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        hour12: false
      });
      const istHour = parseInt(formatter.format(new Date()), 10);
      
      const greetingMap: Record<string, Record<string, string>> = {
        English: { morning: 'Good Morning', afternoon: 'Good Afternoon', evening: 'Good Evening', night: 'Good Night' },
        Assamese: { morning: 'শুভ ৰাতিপুৱা', afternoon: 'শুভ আবেলি', evening: 'শুভ গধূলি', night: 'শুভ ৰাত্ৰি' },
        Bengali: { morning: 'শুভ সকাল', afternoon: 'শুভ দুপুর', evening: 'শুভ সন্ধ্যা', night: 'শুভ রাত্রি' },
        Hindi: { morning: 'सुप्रभात', afternoon: 'शुभ दोपहर', evening: 'शुभ संध्या', night: 'शुभ रात्रि' },
        Manipuri: { morning: 'অয়ুক কি অমঙ্গল', afternoon: 'নুংথিল কি অমঙ্গল', evening: 'নুমিদাংগী অমঙ্গল', night: 'অয়ুক কি অমঙ্গল' },
        Khasi: { morning: 'Khublei Mynstep', afternoon: 'Khublei Sngi', evening: 'Khublei Janmiet', night: 'Khublei Mynmiet' },
        Mizo: { morning: 'Zing chibai', afternoon: 'Chhun chibai', evening: 'Tlailam chibai', night: 'Mangtha chibai' },
        Nagamese: { morning: 'Aji bisi morning', afternoon: 'Aji bisi afternoon', evening: 'Aji bisi evening', night: 'Aji bisi night' },
        Tripuri: { morning: 'Khulumkha phrung', afternoon: 'Khulumkha salni', evening: 'Khulumkha aphi', night: 'Khulumkha hor' }
      };

      const langGreeting = greetingMap[language] || greetingMap.English;
      let prefix = langGreeting.morning;
      let period: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
      if (istHour >= 5 && istHour < 12) {
        prefix = langGreeting.morning;
        period = 'morning';
      } else if (istHour >= 12 && istHour < 17) {
        prefix = langGreeting.afternoon;
        period = 'afternoon';
      } else if (istHour >= 17 && istHour < 20) {
        prefix = langGreeting.evening;
        period = 'evening';
      } else {
        prefix = langGreeting.night;
        period = 'night';
      }
      setGreeting(`${prefix}, ${userName}! 👋`);
      setGreetingTimePeriod(period);
    };

    updateGreeting();
    // Check every minute to see if a time boundary has crossed
    const timer = setInterval(updateGreeting, 60000);
    return () => clearInterval(timer);
  }, [userName, language]);

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-brand-navy text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 animate-bounce">
          <Sparkles className="w-5 h-5 text-brand-orange" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Greeting Box with Dynamic Time Theme */}
      {(() => {
        const theme = getGreetingTheme(greetingTimePeriod);
        return (
          <div className={`relative overflow-hidden flex items-center justify-between gap-4 p-6 rounded-2xl border transition-all duration-500 ${theme.container}`}>
            {/* Background SVG Theme Illustration */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-60 overflow-hidden flex items-center justify-end pr-2 z-0">
              {theme.svg}
            </div>

            <div className="min-w-0 flex-1 relative z-10">
              <h1 className={`text-2xl sm:text-3xl font-extrabold truncate ${theme.titleText}`}>
                {greeting}
              </h1>
              <p className={`font-medium text-sm sm:text-base mt-1 ${theme.subText}`}>
                {getFormattedDate(new Date(), language)}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
              <div className="text-right hidden sm:block">
                <span className={`block font-bold text-sm sm:text-base truncate ${theme.userNameText}`}>{userName}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs border ${theme.badge}`}>
                  {activeUser?.role || 'Patient'}
                </span>
              </div>
              <button 
                onClick={() => {
                  setShowProfileModal(true);
                  setPhotoPreview(null);
                }}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 overflow-hidden flex items-center justify-center hover:scale-105 active:scale-95 transition-all focus:outline-none ${theme.avatarBorder}`}
                title="View Profile Details"
              >
                {activeUser?.photo ? (
                  <img src={activeUser.photo} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <SVGElderlyAvatar className="w-full h-full" gender={activeUser?.gender} />
                )}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Voice Assistant / Talk Card */}
      {(() => {
        const vTheme = getVoiceTheme(greetingTimePeriod);
        return (
          <div className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 border-2 transition-all duration-500 shadow-xl group ${vTheme.cardBg} ${vTheme.borderColor} ${vTheme.animationClass}`} style={{ animationDuration: vTheme.animationDuration }}>
            {/* Animated Time-Aware Gradient Border Glow Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${vTheme.glowBorder} opacity-25 pointer-events-none blur-xl`} />

            {/* Soft Ambient Glow Backdrops */}
            <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl pointer-events-none ${vTheme.ambientGlow1}`} />
            <div className={`absolute -bottom-10 -left-10 w-36 h-36 rounded-full blur-2xl pointer-events-none ${vTheme.ambientGlow2}`} />

            <div className="relative z-10 w-full flex flex-col items-center">
              <h2 className={`text-2xl sm:text-3xl font-black flex items-center justify-center gap-2 ${vTheme.titleText}`}>
                <Sparkles className={`w-6 h-6 ${vTheme.sparkleColor} animate-pulse`} />
                <span>{t('nav.talkToMe')}</span>
              </h2>
              <p className={`font-bold mt-1 text-xs sm:text-sm max-w-md ${vTheme.subText}`}>
                {voiceText === 'You can ask me anything...' ? t('home.speakPrompt') : 
                 voiceText === 'Listening to your voice...' ? t('voice.listening') : 
                 voiceText === 'Listening to your voice' ? t('voice.listening') : 
                 voiceText === 'Heard: "". Understanding...' ? t('voice.understanding') :
                 voiceText.startsWith('Heard: "') && voiceText.endsWith('". Understanding...') ? 
                   `${t('voice.youSaid')}: "${voiceText.substring(8, voiceText.length - 20)}". ${t('voice.understanding')}` : 
                 voiceText}
              </p>

              {/* Big Mic Button or Text Fallback */}
              {voiceStatus === 'unsupported' ? (
                <div className="w-full max-w-md space-y-3 pt-3 text-brand-red font-semibold">
                  {t('voice.unsupported')}
                  <form onSubmit={handleTextInputSubmit} className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={textCommand}
                      onChange={(e) => setTextCommand(e.target.value)}
                      placeholder={labels.typePlaceholder}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-500 font-semibold text-amber-950 shadow-xs text-sm"
                    />
                    <button type="submit" className="p-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-sm">
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="w-full max-w-md flex flex-col items-center space-y-2 sm:space-y-3 mt-2">
                  {/* Attractive Voice Interaction Container */}
                  <div className="w-full flex flex-col items-center justify-center space-y-2">
                    {/* Circular Animation Pulsing rings around Mic */}
                    <div className="relative flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32">
                      
                      {/* IDLE state concentric rings */}
                      {voiceStatus === 'idle' && (
                        <>
                          <div className={`absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 ${vTheme.idleRing1} motion-safe:animate-pulse`} style={{ animationDuration: '3.5s' }} />
                          <div className={`absolute w-24 h-24 sm:w-26 sm:h-26 rounded-full border ${vTheme.idleRing2} motion-safe:animate-pulse`} style={{ animationDuration: '2.2s' }} />
                        </>
                      )}

                      {/* LISTENING state concentric rings */}
                      {voiceStatus === 'listening' && (
                        <>
                          <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-rose-500/20 motion-safe:animate-ping" style={{ animationDuration: '1.5s' }} />
                          <div className="absolute w-24 h-24 sm:w-26 sm:h-26 rounded-full bg-rose-500/30 motion-safe:animate-pulse" style={{ animationDuration: '0.8s' }} />
                        </>
                      )}

                      {/* PROCESSING state concentric spinning ring */}
                      {voiceStatus === 'processing' && (
                        <div className="absolute w-26 h-26 sm:w-28 sm:h-28 rounded-full border-4 border-t-amber-500 border-amber-200 animate-spin" />
                      )}

                      {/* SPEAKING state rippling concentric rings */}
                      {voiceStatus === 'speaking' && (
                        <>
                          <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-sky-400/40 motion-safe:animate-pulse" style={{ animationDuration: '1s' }} />
                          <div className="absolute w-24 h-24 sm:w-26 sm:h-26 rounded-full border-2 border-amber-500/40 motion-safe:animate-ping" style={{ animationDuration: '2s' }} />
                        </>
                      )}

                      {/* Main Microphone Button */}
                      <button
                        onClick={handleSpeak}
                        className={`relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4 ${
                          voiceStatus === 'listening'
                            ? 'bg-rose-600 border-rose-300 text-white scale-95 shadow-rose-500/40'
                            : voiceStatus === 'processing'
                            ? 'bg-amber-500 border-amber-200 text-white animate-pulse shadow-amber-500/40'
                            : voiceStatus === 'speaking'
                            ? 'bg-sky-600 border-sky-300 text-white shadow-sky-500/40'
                            : `${vTheme.micBg} hover:scale-105 active:scale-95`
                        }`}
                        aria-label={t('home.tapSpeak')}
                      >
                        {voiceStatus === 'listening' ? (
                          <MicOff className="w-9 h-9 sm:w-10 sm:h-10 animate-pulse" />
                        ) : (
                          <Mic className="w-9 h-9 sm:w-10 sm:h-10" />
                        )}
                      </button>
                    </div>

                    {/* Textual State Indicators for Accessibility */}
                    {(() => {
                      const labels = voiceStatusLabels[language] || voiceStatusLabels.English;
                      return (
                        <div className="flex flex-col items-center space-y-0.5">
                          <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${
                            voiceStatus === 'listening'
                              ? 'bg-rose-100 text-rose-800 border-rose-200 motion-safe:animate-pulse'
                              : voiceStatus === 'processing'
                              ? 'bg-amber-100 text-amber-900 border-amber-300 motion-safe:animate-bounce'
                              : voiceStatus === 'speaking'
                              ? 'bg-sky-100 text-sky-900 border-sky-200'
                              : vTheme.badge
                          }`}>
                            {voiceStatus === 'listening' ? `${labels.listening} (${recordingSeconds}s)` :
                             voiceStatus === 'processing' ? labels.thinking :
                             voiceStatus === 'speaking' ? labels.speaking :
                             labels.idle}
                          </span>
                          <span className={`text-[11px] font-extrabold ${vTheme.subText}`}>
                            {voiceStatus === 'listening' ? labels.speakAdvice :
                             voiceStatus === 'processing' ? labels.thinkingAdvice :
                             voiceStatus === 'speaking' ? labels.listeningAdvice :
                             labels.tapToTalk}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Animated Waveform Visualizer */}
                    <div className="flex items-center justify-center gap-1.5 h-6 sm:h-7 px-4 w-full">
                      {voiceStatus === 'listening' ? (
                        <>
                          <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
                          <span className="w-1.5 h-8 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.7s' }} />
                          <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.5s' }} />
                          <span className="w-1.5 h-7 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '0.8s' }} />
                          <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '0.6s' }} />
                          <span className="w-1.5 h-6 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '0.7s' }} />
                        </>
                      ) : voiceStatus === 'processing' ? (
                        <div className="flex gap-2">
                          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      ) : voiceStatus === 'speaking' ? (
                        <div className="relative w-40 h-6 flex items-center justify-center">
                          <div className="absolute w-full h-0.5 bg-sky-300/50 rounded" />
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 bg-sky-500 rounded-full animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0s' }} />
                            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.2s' }} />
                            <span className="w-2 h-2 bg-sky-500 rounded-full animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.4s' }} />
                          </div>
                        </div>
                      ) : (
                        <div className="w-36 h-1 bg-amber-300/40 rounded-full opacity-60" />
                      )}
                    </div>
                  </div>

                  {/* If offline, denied, or error, show descriptive warning and text fallback */}
                  {showFallbackInput && voiceStatus !== 'listening' && (
                    <div className="w-full space-y-3 pt-3 border-t border-amber-200/60">
                      <form onSubmit={handleTextInputSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={textCommand}
                          onChange={(e) => setTextCommand(e.target.value)}
                          placeholder={labels.typePlaceholder}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-500 font-semibold text-amber-950 shadow-xs text-sm"
                        />
                        <button type="submit" className="p-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-sm">
                          <Send className="w-5 h-5" />
                        </button>
                      </form>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setShowManualForm(!showManualForm)}
                          className="px-4 py-2 text-xs bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold hover:bg-amber-200 transition-all"
                        >
                          {showManualForm ? labels.hideManual : labels.createManual}
                        </button>
                        
                        {showManualForm && (
                          <form onSubmit={handleManualActivitySubmit} className="bg-white border border-amber-200 p-4 rounded-xl text-left space-y-3 shadow-xs">
                            <div>
                              <label className="block text-xs font-bold text-amber-950 mb-1">{labels.activityTitle}</label>
                              <input
                                type="text"
                                value={manualTitle}
                                onChange={(e) => setManualTitle(e.target.value)}
                                placeholder={language === 'Hindi' ? 'जैसे: शाम की सैर' : language === 'Bengali' ? 'যেমন: সন্ধ্যার হাঁটা' : 'e.g. Evening Walk'}
                                className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-amber-950 mb-1">{labels.time}</label>
                              <input
                                type="time"
                                value={manualTime}
                                onChange={(e) => setManualTime(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm"
                                required
                              />
                            </div>
                            <button type="submit" className="w-full py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors">
                              {labels.saveActivity}
                            </button>
                          </form>
                        )}
                      </div>

                      {/* Suggestions */}
                      <div className="text-left pt-1">
                        <span className="block text-xs font-bold text-amber-900/70 uppercase tracking-wider mb-1.5 text-center">{t('voice.trysaying') || 'Try saying:'}</span>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {[labels.suggNext, labels.suggGame, labels.suggMems].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleCommandParse(s)}
                              className="px-3 py-1 text-xs bg-white text-amber-950 border border-amber-200 rounded-lg font-semibold hover:border-amber-400 transition-all shadow-2xs"
                            >
                              "{s}"
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-xl font-bold text-brand-navy mb-4">{t('home.quickActions')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Action 1: Brain Games */}
          <div 
            onClick={() => navigate('/games')}
            className="group bg-brand-purpleLight border border-brand-purpleLight p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all duration-200 flex flex-col h-full"
          >
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white flex items-center justify-center mb-3 sm:mb-4 shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform duration-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Brain Games Icon">
                <path d="M12 9C9.79086 9 8 10.7909 8 13C8 13.9 8.3 14.7 8.8 15.3C7.2 16.1 6 17.9 6 20C6 22.7614 8.23858 25 11 25C11.6 25 12.2 24.9 12.8 24.7C13.6 26.1 15.2 27 17 27H18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 9C22.2091 9 24 10.7909 24 13C24 13.7 23.8 14.3 23.4 14.9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 7V25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2"/>
                <circle cx="22" cy="21" r="6.5" fill="#F59E0B" stroke="white" strokeWidth="1.5"/>
                <path d="M20.5 18.8L24.8 21L20.5 23.2V18.8Z" fill="white"/>
              </svg>
            </div>
            <h4 className="font-bold text-lg text-brand-navy">{t('nav.brainGames')}</h4>
            <p className="text-sm text-brand-grayText mt-1 sm:mt-2 flex-1">Play and train your brain with puzzles</p>
            <span className="text-brand-purple text-sm font-bold mt-3 sm:mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {t('home.startTraining')} <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          {/* Action 2: My Day */}
          <div 
            onClick={() => navigate('/day')}
            className="group bg-brand-greenBg border border-brand-greenBg p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all duration-200 flex flex-col h-full"
          >
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 text-white flex items-center justify-center mb-3 sm:mb-4 shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="My Day Icon">
                <rect x="5" y="8" width="22" height="19" rx="3.5" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.15"/>
                <line x1="5" y1="14" x2="27" y2="14" stroke="currentColor" strokeWidth="2"/>
                <line x1="10" y1="6" x2="10" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="22" y1="6" x2="22" y2="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="21" cy="20" r="5.5" fill="#FBBF24" stroke="white" strokeWidth="1.5"/>
                <path d="M19.3 20L20.5 21.2L22.8 19" stroke="#065F46" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h4 className="font-bold text-lg text-brand-navy">{t('nav.myDay')}</h4>
            <p className="text-sm text-brand-grayText mt-1 sm:mt-2 flex-1">View your schedule & complete tasks</p>
            <span className="text-brand-green text-sm font-bold mt-3 sm:mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {t('home.viewSchedule')} <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          {/* Action 3: Memories */}
          <div 
            onClick={() => navigate('/memories')}
            className="group bg-brand-orangeBg border border-brand-orangeBg p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all duration-200 flex flex-col h-full"
          >
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center mb-3 sm:mb-4 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform duration-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Memories Icon">
                <rect x="5" y="6" width="22" height="20" rx="3.5" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.15"/>
                <circle cx="11" cy="12" r="2.5" fill="currentColor"/>
                <path d="M7 22L13 15L17 19L20 16L25 22H7Z" fill="currentColor" fillOpacity="0.7"/>
                <circle cx="22" cy="21" r="6" fill="#F43F5E" stroke="white" strokeWidth="1.5"/>
                <path d="M22 23.5L20.2 21.8C19.2 20.9 19.2 19.5 20.1 18.7C20.9 18 22.1 18.1 22.8 19C23.5 18.1 24.7 18 25.5 18.7C26.4 19.5 26.4 20.9 25.4 21.8L22 23.5Z" fill="white"/>
              </svg>
            </div>
            <h4 className="font-bold text-lg text-brand-navy">{t('nav.memories')}</h4>
            <p className="text-sm text-brand-grayText mt-1 sm:mt-2 flex-1">Browse your beautiful memories and photos</p>
            <span className="text-brand-orange text-sm font-bold mt-3 sm:mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {t('nav.memories')} <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          {/* Action 4: Help */}
          <div 
            onClick={() => navigate('/help')}
            className="group bg-brand-redBg border border-brand-redBg p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all duration-200 flex flex-col h-full"
          >
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 text-white flex items-center justify-center mb-3 sm:mb-4 shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform duration-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Contact Family Icon">
                <path d="M7 10C7 8.34315 8.34315 7 10 7H14C15.6569 7 17 8.34315 17 10V12C17 13.6569 15.6569 15 14 15H10C8.34315 15 7 13.6569 7 12V10Z" stroke="currentColor" strokeWidth="2.2" fill="currentColor" fillOpacity="0.15"/>
                <path d="M6 14C6 19.5228 10.4772 24 16 24H18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                <circle cx="21" cy="20" r="6.5" fill="#FFFFFF" stroke="#E11D48" strokeWidth="1.5"/>
                <path d="M21 23.2L19.2 21.5C18.2 20.6 18.2 19.2 19.1 18.4C19.9 17.7 21.1 17.8 21.8 18.7C22.5 17.8 23.7 17.7 24.5 18.4C25.4 19.2 25.4 20.6 24.4 21.5L21 23.2Z" fill="#E11D48"/>
              </svg>
            </div>
            <h4 className="font-bold text-lg text-brand-navy">{t('nav.help')}</h4>
            <p className="text-sm text-brand-grayText mt-1 sm:mt-2 flex-1">Reach out for immediate emergency aid</p>
            <span className="text-brand-red text-sm font-bold mt-3 sm:mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {t('home.emergencyContact')} <ChevronRight className="w-4 h-4" />
            </span>
          </div>

        </div>
      </div>

      {/* Reminders List & Motivation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Today's Reminders Card */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-3xl border border-brand-purpleLight shadow-sm">
          {(() => {
            const completedCount = reminders.filter(r => r.status === 'Completed').length;
            const totalCount = reminders.length;
            
            const getScoreText = (completed: number, total: number, lang: string) => {
              const scoreDict: Record<string, string> = {
                English: `${completed} of ${total} completed`,
                Hindi: `${completed} / ${total} पूर्ण`,
                Bengali: `${completed} / ${total} সম্পন্ন`,
                Assamese: `${completed} / ${total} সম্পূৰ্ণ`,
                Manipuri: `${completed} / ${total} লোইখ্রে`,
                Khasi: `${completed} na ${total} dep`,
                Mizo: `${completed} / ${total} zawh`,
                Nagamese: `${completed} / ${total} khatai`,
                Tripuri: `${completed} / ${total} khatai`
              };
              return scoreDict[lang] || `${completed} of ${total} completed`;
            };

            const scoreBadgeText = getScoreText(completedCount, totalCount, language);

            return (
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-xl font-bold text-brand-navy">{t('home.reminders')}</h3>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/90 shadow-2xs font-extrabold text-xs sm:text-sm transition-all duration-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span>{scoreBadgeText}</span>
                  </div>

                  <button 
                    onClick={() => navigate('/reminders')}
                    className="text-brand-purple hover:underline font-bold text-sm flex-shrink-0"
                  >
                    {t('home.viewAll')}
                  </button>
                </div>
              </div>
            );
          })()}

          {reminders.length === 0 ? (
            <div className="py-8 text-center text-brand-grayText font-medium">
              {t('home.remNone') || 'No reminders scheduled.'}
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.slice(0, 3).map((reminder) => {
                const config = getReminderCategoryConfig(reminder.category);
                const IconComp = config.icon;
                const localized = getLocalizedReminder(reminder, language);

                return (
                  <div 
                    key={reminder.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-brand-purpleLight hover:bg-brand-lavender transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Primary Semantic Activity Icon Container */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-2xs ${config.bg}`}>
                          <IconComp className="w-7 h-7 stroke-[2.2]" />
                        </div>
                        {reminder.status === 'Completed' && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-xs" title="Completed">
                            <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-lg text-brand-navy">{localized.title}</h4>
                          {reminder.status === 'Completed' && (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              ✓ {t('rem.completed') || 'Completed'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-brand-grayText mt-0.5">{localized.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs font-bold text-brand-purple">
                          <span className="bg-brand-purpleLight px-2.5 py-0.5 rounded-full">{reminder.time}</span>
                          <span className="text-brand-grayText">({reminder.repeat})</span>
                          <span className="bg-brand-lavender text-brand-purple px-2.5 py-0.5 rounded-full capitalize">
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
                          </span>
                        </div>
                      </div>
                    </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleReminder(reminder.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        reminder.status === 'Completed'
                          ? 'bg-brand-green text-white hover:bg-opacity-90'
                          : 'bg-brand-purpleLight text-brand-purple hover:bg-brand-purple hover:text-white'
                      }`}
                    >
                      {reminder.status === 'Completed' ? t('rem.completed') : t('rem.markDone')}
                    </button>
                    <button
                      onClick={() => handleSnoozeReminder(reminder.id)}
                      className="p-2.5 rounded-xl bg-brand-orangeBg text-brand-orange hover:bg-brand-orange hover:text-white transition-all"
                      title="Snooze 15m"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="p-2.5 rounded-xl bg-brand-redBg text-brand-red hover:bg-brand-red hover:text-white transition-all"
                      title="Delete"
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

        {/* Daily Motivation Column */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {(() => {
            const completedCount = reminders.filter(r => r.status === 'Completed').length;
            const totalCount = reminders.length;

            const formatter = new Intl.DateTimeFormat('en-US', {
              timeZone: 'Asia/Kolkata',
              hour: 'numeric',
              hour12: false
            });
            const istHour = parseInt(formatter.format(new Date()), 10);

            type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';
            let period: TimePeriod = 'morning';
            if (istHour >= 5 && istHour < 12) period = 'morning';
            else if (istHour >= 12 && istHour < 17) period = 'afternoon';
            else if (istHour >= 17 && istHour < 20) period = 'evening';
            else period = 'night';

            const primaryMotivationMap: Record<string, Record<TimePeriod, string>> = {
              English: {
                morning: "Good morning! Start your day with a calm smile and one small step.",
                afternoon: "You're doing well today. Keep going — every completed activity matters.",
                evening: "Your day is almost complete. Finish what you can and be proud of your effort.",
                night: "You've made progress today. Rest well and get ready for a bright tomorrow."
              },
              Hindi: {
                morning: "शुभ प्रभात! अपने दिन की शुरुआत शांत मुस्कान और एक छोटे कदम से करें।",
                afternoon: "आप बहुत अच्छा कर रहे हैं। धीरे-धीरे आगे बढ़ते रहें — हर प्रयास महत्वपूर्ण है।",
                evening: "आपका दिन लगभग पूरा हो गया है। जो कर सकते हैं उसे पूरा करें और गर्व महसूस करें।",
                night: "आपने आज प्रगति की है। अच्छी नींद लें और कल के लिए तैयार हों।"
              },
              Bengali: {
                morning: "শুভ সকাল! একটি মিষ্টি হাসি এবং ছোট পদক্ষেপে দিন শুরু করুন।",
                afternoon: "আপনি খুব ভালো করছেন। এগিয়ে যান — প্রতিটি কাজ অত্যন্ত মূল্যবান।",
                evening: "আপনার দিনটি প্রায় শেষ। যা পারেন শেষ করুন এবং নিজের কাজের জন্য গর্বিত হোন।",
                night: "আপনি আজ ভালো উন্নতি করেছেন। শান্তিতে ঘুমান এবং আগামীকালের জন্য প্রস্তুত হন।"
              },
              Assamese: {
                morning: "শুভ ৰাতিপুৱা! এটা সৰু পদক্ষেপেৰে দিনটো আৰম্ভ কৰক।",
                afternoon: "আপুনি অতি সুন্দৰকৈ কামবোৰ কৰি আছে। আগবাঢ়ি যাওক।",
                evening: "আপোনাৰ দিনটো শেষ হ’বলৈ ধৰিছে। নিজৰ চেষ্টাৰ বাবে আনন্দিত হওক।",
                night: "আপুনি আজি সুন্দৰ অগ্ৰগতি কৰিলে। ভালদৰে শুৱক আৰু কাইলৈৰ বাবে প্ৰস্তুত হওক।"
              },
              Manipuri: {
                morning: "নুংঙাইবা অয়ুক! অপীকপা খঙ অমগা লোয়ননা নুমিত অসি হৌবীয়ু।",
                afternoon: "নহাক ফোজনা তৌরি। তেন্না তেন্না মাংলোমদা চংশিল্লু।",
                evening: "নুমিত অসি লোইশিনবা ঙমখ্রে, হৌজিক নুংঙাইনা পথাপীয়ু।",
                night: "নহাক ঙসি ফোজনা তৌখ্রে। ফোজনা তুমীয়ু অমসুং শেম-শাবীয়ু।"
              },
              Khasi: {
                morning: "Khublei mynstep! Pynkyntiew ia ka sngi da ka jingrkhie bad jingiaid suki.",
                afternoon: "Phi iaid bha shibun. Nang iaid shaphrang katba lah.",
                evening: "Ka sngi ka jan dep. Jah thait bad kmen ia kaba phi la pyndep.",
                night: "Phi la pyndep bha mynta. Thiah suk bad pynkhreh na ka bynta lashai."
              },
              Mizo: {
                morning: "Zing chibai! Hlim tak leh zawi zawiin i ni hmang tan rawh.",
                afternoon: "I ti tha hle mai. Hma lam pan zel rawh, a pawimawh vek a ni.",
                evening: "I ni hman a zo tep ta. Hahdam takin thil tha zawng ti zo rawh.",
                night: "Vawiin hian hma i sawn e. Hahdam takin muhil rawh."
              },
              Nagamese: {
                morning: "Aji morning! Hahi kora logote din toh chuto step pora suru koribi.",
                afternoon: "Apuni bhal pora korise. Agefalte jaikena thakibi.",
                evening: "Aji laga din khotom hobole ase. Aram koribi aru kushi thakibi.",
                night: "Aji apuni bhal progress korise. Bhal pora ghumi jabi."
              },
              Tripuri: {
                morning: "Phrung khulumkha! Salno chokhi hahima bai chukhi step bai chhengdi.",
                afternoon: "Nini samung bhal tongkha. Ulung chhengdi.",
                evening: "Aphi khulumkha! Aram khamdi bai nini samungno kmen khailadi.",
                night: "Hor khulumkha! Bhal pora thiahdi bai nini progressno chokhichangdi."
              }
            };

            const progressAwareTextMap: Record<string, { allDone: string; partial: string; zero: string }> = {
              English: {
                allDone: "Excellent work today! You've completed all your reminders.",
                partial: "You're making steady progress today. Keep going!",
                zero: "Every day starts with one small step. Complete your first activity when ready."
              },
              Hindi: {
                allDone: "बहुत बढ़िया! आपने आज के सभी रिमाइंडर्स पूरे कर लिए हैं।",
                partial: "आप आज लगातार प्रगति कर रहे हैं। आगे बढ़ते रहें!",
                zero: "हर दिन एक छोटे कदम से शुरू होता है। तैयार होने पर पहला काम पूरा करें।"
              },
              Bengali: {
                allDone: "চমৎকার কাজ! আপনি আজকের সমস্ত কাজ সম্পন্ন করেছেন।",
                partial: "আপনি আজ চমৎকার অগ্রগতি করছেন। এগিয়ে যান!",
                zero: "প্রতিটি দিন একটি ছোট পদক্ষেপে শুরু হয়। প্রস্তুত হলে প্রথম কাজটি করুন।"
              },
              Assamese: {
                allDone: "বৰ ধুনীয়া! আপুনি আজিৰ সকলো অনুস্মাৰক সম্পূৰ্ণ কৰিলে।",
                partial: "আপুনি আজি ধাৰাবাহিকভাৱে আগবাঢ়িছে। এইদৰেই চলাই যাওক!",
                zero: "প্ৰতিটো দিনেই এটা সৰু পদক্ষেপেৰে আৰম্ভ হয়। সাজু হ’লে প্ৰথম কামটো কৰক।"
              },
              Manipuri: {
                allDone: "য়াম্না ফরে! ঙসিগী রিমাইন্দর পুম্নমক লোইশিনখ্রে।",
                partial: "নহাক ঙসি মাংলোমদা ফোজনা চংশিল্লি। লেপ্তনা তৌবীয়ু!",
                zero: "নুমিত খুদিংমক অপীকপা অমদগী হৌগনি। অহানবা থবক লোইশিনবীয়ু।"
              },
              Khasi: {
                allDone: "Kaba kordor! Phi la pyndep ia baroh ki jingpynkynmaw mynta.",
                partial: "Phi nang pyndep ia ki kam jong phi. Nang iaid shaphrang!",
                zero: "Man ka sngi ka sdang da uwei u kynja. Pyndep ia ka kam nyngkong."
              },
              Mizo: {
                allDone: "A va tha em! Vawiin hriattirna zawng zawng i ti zo ta.",
                partial: "I ti tha hle mai! Vawiin hian hma i sawn zel e.",
                zero: "Ni tin hi bul tan thar a ni. I inpeih hunah a hmasa ber hi ti zo rawh."
              },
              Nagamese: {
                allDone: "Bhal hoise! Aji laga sob reminder khotom hoise.",
                partial: "Bhal hoise! Apuni aji bhal progress korise.",
                zero: "Sob din ekta chuto step pora suru hoye. Taiyar hoile start koribi."
              },
              Tripuri: {
                allDone: "Bhal tongkha! Aji nini jotoni reminder complete khailamkha.",
                partial: "Bhal tongkha! Nini progress aji phungtongkha.",
                zero: "Sal chhi khai step bai chhengkha. Tayar chhi khai skangni reminder khamdi."
              }
            };

            const tipMap: Record<string, string> = {
              English: "Tip: Drinking water and taking short walks keeps your memory sharp and mind active.",
              Hindi: "सुझाव: पानी पीना और छोटी सैर करना आपकी याददाश्त को तेज और दिमाग को सक्रिय रखता है।",
              Bengali: "টিপস: পর্যাপ্ত জল খাওয়া এবং কিছুক্ষণ হাঁটা আপনার স্মৃতিশক্তি প্রখর রাখে।",
              Assamese: "পৰামৰ্শ: পানী খোৱা আৰু অলপ খোজ কঢ়াটোৱে মগজু সজীৱ আৰু স্মৰণশক্তি চোকা ৰাখে।",
              Manipuri: "পাউতাক: ঈশিং থকপা অমসুং খোঙনা চৎপনা নীংশিংফম অমসুং লৌশিং ফহনগনি।",
              Khasi: "Jingmut: Dih um bad iaiaid khyndiat pynkhlain ia ka jingkynmaw jong phi.",
              Mizo: "Thurawn: Tui in tam leh kea kal hi hriatrengna atan a tha hle a ni.",
              Nagamese: "Tip: Pani khabi aru olop berale apuni laga memory bhal thakibo.",
              Tripuri: "Tip: Twi thungmung bai re-mung nini chokhichangno bhal khamdi."
            };

            const langTimeMap = primaryMotivationMap[language] || primaryMotivationMap.English;
            const langProgressMap = progressAwareTextMap[language] || progressAwareTextMap.English;
            const tipText = tipMap[language] || tipMap.English;

            let primaryMessage = langTimeMap[period];
            if (totalCount > 0) {
              if (completedCount === totalCount) {
                primaryMessage = langProgressMap.allDone;
              } else if (completedCount > 0) {
                primaryMessage = langProgressMap.partial;
              } else {
                primaryMessage = langProgressMap.zero;
              }
            }

            const PeriodIcon = period === 'morning' ? Sun : period === 'afternoon' ? Sunrise : period === 'evening' ? Sunset : Moon;

            return (
              <>
                {/* Motivation Card 1: Time & Progress Awareness */}
                <div className="bg-gradient-to-br from-amber-50/95 via-orange-50/70 to-amber-100/80 p-5 sm:p-6 rounded-3xl border border-amber-200/90 shadow-sm flex flex-col justify-between transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-amber-950 flex items-center gap-2">
                        <PeriodIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <span>{t('home.motivationTitle')}</span>
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/70 text-amber-900 border border-amber-300/80 px-2.5 py-0.5 rounded-full">
                        {period}
                      </span>
                    </div>
                    <p className="text-amber-950 font-extrabold text-base sm:text-lg leading-relaxed">
                      "{primaryMessage}"
                    </p>
                  </div>
                  <div className="flex justify-end mt-4">
                    <SVGMotivation className="w-14 h-14 text-amber-500 opacity-80" />
                  </div>
                </div>

                {/* Motivation Card 2: Supportive Mind & Memory Tip */}
                <div className="bg-gradient-to-br from-emerald-50/95 via-teal-50/70 to-emerald-100/80 p-5 sm:p-6 rounded-3xl border border-emerald-200/90 shadow-sm flex flex-col justify-between transition-all duration-300">
                  <div>
                    <h4 className="text-base sm:text-lg font-extrabold text-emerald-950 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span>{language === 'Hindi' ? 'दैनिक सुझाव' : language === 'Bengali' ? 'দৈনিক টিপস' : language === 'Assamese' ? 'দৈনিক পৰামৰ্শ' : 'Daily Mind Tip'}</span>
                    </h4>
                    <p className="text-emerald-900 font-bold text-sm sm:text-base leading-relaxed">
                      {tipText}
                    </p>
                  </div>
                  <div className="flex justify-end mt-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-200/70 text-emerald-800 flex items-center justify-center border border-emerald-300/80">
                      <Heart className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

      </div>

      {/* Mind Garden Section - Placed directly below Today's Reminders + Daily Motivation */}
      <div className="mt-8">
        <MindGarden />
      </div>

      {activeNotification && (() => {
        const nt = localNotificationTranslations[language] || localNotificationTranslations.English;
        return (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md animate-slide-down bg-white/95 backdrop-blur-md border-2 border-brand-purpleLight rounded-2xl p-4 shadow-xl shadow-brand-navy/15 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-brand-purpleLight text-brand-purple">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-brand-purple">
                    {activeNotification.category === 'medicine' ? nt.medicineTitle :
                     activeNotification.category === 'hydration' ? nt.hydrationTitle :
                     activeNotification.category === 'meals' ? nt.mealsTitle :
                     activeNotification.category === 'exercise' ? nt.exerciseTitle : nt.reminderTitle}
                  </span>
                  <span className="text-xs font-bold text-brand-grayText">
                    {activeNotification.time}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-brand-navy truncate mt-0.5">{activeNotification.title}</h3>
                <p className="text-xs text-brand-grayText font-semibold line-clamp-2 mt-0.5">
                  {activeNotification.category === 'medicine' ? nt.medicineDesc :
                   activeNotification.category === 'hydration' ? nt.hydrationDesc :
                   activeNotification.category === 'exercise' ? nt.exerciseDesc :
                   activeNotification.description || nt.reminderDesc}
                </p>
              </div>

              <button
                onClick={() => handleNotificationDismiss(activeNotification)}
                className="flex-shrink-0 text-brand-grayText hover:text-brand-navy p-1 rounded-lg transition-colors"
                title={nt.dismiss}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-brand-purpleLight/40">
              <button
                onClick={() => handleNotificationComplete(activeNotification)}
                className="flex-1 py-2.5 bg-brand-green text-white font-extrabold rounded-xl hover:bg-opacity-90 active:scale-[0.98] transition-all text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {nt.markAsDone}
              </button>
              
              <button
                onClick={() => handleNotificationSnooze(activeNotification, 10)}
                className="px-3.5 py-2.5 bg-brand-lavender text-brand-purple font-extrabold rounded-xl hover:bg-brand-purple hover:text-white active:scale-[0.98] transition-all text-xs"
              >
                {nt.remindMeLater}
              </button>
            </div>
          </div>
        );
      })()}

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy bg-opacity-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-brand-purpleLight animate-scale-up space-y-6 flex flex-col items-center">
            
            {/* Header / Title */}
            <h3 className="text-2xl font-black text-brand-navy w-full text-center pb-2 border-b border-brand-purpleLight">
              {t('prof.details')}
            </h3>

            {/* Profile Photo / Avatar display with preview */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-brand-purple overflow-hidden flex items-center justify-center bg-brand-purpleLight shadow-md">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover animate-pulse" />
                ) : activeUser?.photo ? (
                  <img src={activeUser.photo} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <SVGElderlyAvatar className="w-full h-full" gender={activeUser?.gender} />
                )}
              </div>
            </div>

            {/* User Details */}
            <div className="w-full space-y-3 bg-brand-purpleLight p-5 rounded-2xl">
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="font-black text-brand-grayText uppercase tracking-wider text-xs">{t('prof.name')}</span>
                <span className="font-extrabold text-brand-navy">{userName}</span>
              </div>
              {activeUser?.age && (
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="font-black text-brand-grayText uppercase tracking-wider text-xs">{t('prof.age')}</span>
                  <span className="font-extrabold text-brand-navy">{activeUser.age}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="font-black text-brand-grayText uppercase tracking-wider text-xs">{t('prof.role')}</span>
                <span className="font-extrabold text-brand-navy">{activeUser?.role === 'Caregiver' ? t('prof.roleCaregiver') : t('prof.rolePatient')}</span>
              </div>
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="font-black text-brand-grayText uppercase tracking-wider text-xs">{t('prof.language')}</span>
                <span className="font-extrabold text-brand-navy">{t('lang.' + language)}</span>
              </div>
            </div>

            {/* Preview flow vs normal flow buttons */}
            {photoPreview ? (
              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={handleConfirmPhoto}
                  className="w-full py-3.5 bg-brand-green text-white font-extrabold rounded-xl hover:bg-opacity-95 transition-all text-sm"
                >
                  {t('prof.savePhoto')}
                </button>
                <button
                  onClick={handleCancelPhotoPreview}
                  className="w-full py-3.5 bg-brand-lavender text-brand-navy font-bold rounded-xl hover:bg-brand-purpleLight transition-all text-sm"
                >
                  {t('prof.cancelPreview')}
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-3">
                <label className="w-full py-3.5 bg-brand-lavender text-brand-purple rounded-xl font-black hover:bg-brand-purpleLight transition-all shadow-sm text-center cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base">
                  <span>{t('prof.changePhoto')}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    className="hidden" 
                  />
                </label>

                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full py-3 bg-brand-navy text-white font-extrabold rounded-xl hover:bg-opacity-90 transition-all text-sm sm:text-base"
                >
                  {t('prof.close')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy bg-opacity-60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border-2 border-brand-red animate-scale-up space-y-6 text-center flex flex-col items-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-brand-redBg text-brand-red mx-auto animate-pulse">
              <Phone className="w-10 h-10 stroke-[3]" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-brand-navy">Calling {activeCall}...</h3>
              <p className="text-sm font-semibold text-brand-grayText">Connecting you to your loved one.</p>
            </div>

            <button
              onClick={() => {
                setActiveCall(null);
                setVoiceStatus('idle');
                setVoiceText('Call cancelled.');
                speakText("Call cancelled.", language);
              }}
              className="w-full py-4 bg-brand-red text-white font-black rounded-2xl hover:bg-opacity-95 transition-all text-base shadow-md active:scale-95"
            >
              Cancel Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

