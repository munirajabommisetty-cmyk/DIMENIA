import { voiceService } from './voiceService';
import { localLLMService, LLMResponse } from './localLLMService';

const voiceResponseTranslations: Record<string, Record<string, string>> = {
  English: {
    goingHome: 'Going home.',
    startingMemoryMatch: 'Starting Memory Match.',
    startingSequenceOrder: 'Starting Sequence & Order.',
    startingAttentionFocus: 'Starting Attention Focus.',
    startingObjectRecognition: 'Starting Object Recognition.',
    openingBrainGames: 'Opening brain games.',
    openingMemories: 'Opening your memories.',
    openingSettings: 'Opening settings.',
    openingCaregiver: 'Opening caregiver dashboard.',
    openingSchedule: 'Opening daily schedule.',
    openingReminders: 'Opening reminders.',
    openingHelp: 'Opening emergency contacts.',
    createReminderPrompt: 'Sure. What would you like me to remind you about, and what time?',
    schedulePromptTitle: 'What is the name of the activity you want to schedule?',
    schedulePromptTime: 'What time would you like me to remind you about {title}?',
    scheduleAddedSuccess: "Done. I've added your reminder for {title} at {time}.",
    callingCaregiver: "Calling your caregiver Anu."
  },
  Hindi: {
    goingHome: 'होम स्क्रीन पर जा रहे हैं।',
    startingMemoryMatch: 'मेमोरी मैच शुरू किया जा रहा है।',
    startingSequenceOrder: 'सीक्वेंस और ऑर्डर शुरू किया जा रहा है।',
    startingAttentionFocus: 'अटेंशन फोकस शुरू किया जा रहा है।',
    startingObjectRecognition: 'ऑब्जेक्ट रिकग्निशन शुरू किया जा रहा है।',
    openingBrainGames: 'दिमागी खेल खोले जा रहे हैं।',
    openingMemories: 'आपकी यादें खोली जा रही हैं।',
    openingSettings: 'सेटिंग्स खोली जा रही हैं।',
    openingCaregiver: 'केयरगिवर डैशबोर्ड खोला जा रहा है।',
    openingSchedule: 'आज की दिनचर्या खोली जा रही है।',
    openingReminders: 'रिमाइंडर खोले जा रहे हैं।',
    openingHelp: 'आपातकालीन संपर्क खोले जा रहे हैं।',
    createReminderPrompt: 'ज़रूर। आप किस बारे में और किस समय रिमाइंडर सेट करना चाहते हैं?',
    schedulePromptTitle: 'आप किस गतिविधि को दिनचर्या में जोड़ना चाहते हैं?',
    schedulePromptTime: 'आप {title} के लिए किस समय का रिमाइंडर चाहते हैं?',
    scheduleAddedSuccess: 'हो गया। मैंने {title} के लिए {time} बजे का रिमाइंडर जोड़ दिया है।',
    callingCaregiver: 'आपके केयरगिवर अनु को कॉल किया जा रहा है।'
  },
  Bengali: {
    goingHome: 'হোম স্ক্রিনে ফিরে যাওয়া হচ্ছে।',
    startingMemoryMatch: 'মেমরি ম্যাচ শুরু করা হচ্ছে।',
    startingSequenceOrder: 'সিকোয়েন্স অ্যান্ড অর্ডার শুরু করা হচ্ছে।',
    startingAttentionFocus: 'অ্যাটেনশন ফোকাস শুরু করা হচ্ছে।',
    startingObjectRecognition: 'অবজেক্ট রিকগনিশন শুরু করা হচ্ছে।',
    openingBrainGames: 'দিমাগি খেলা খোলা হচ্ছে।',
    openingMemories: 'আপনার স্মৃতিগুলি খোলা হচ্ছে।',
    openingSettings: 'সেটিংস খোলা হচ্ছে।',
    openingCaregiver: 'কেয়ারগিভার ড্যাশবোর্ড খোলা হচ্ছে।',
    openingSchedule: 'দৈনিক সময়সূচী খোলা হচ্ছে।',
    openingReminders: 'অনুস্মারক খোলা হচ্ছে।',
    openingHelp: 'জরুরী যোগাযোগ খোলা হচ্ছে।',
    createReminderPrompt: 'অবশ্যই। আপনি কীসের জন্য এবং কোন সময়ে অনুস্মারক সেট করতে চান?',
    schedulePromptTitle: 'আপনি কোন কাজটি সময়সূচীতে যুক্ত করতে চান?',
    schedulePromptTime: 'আপনি কখন {title} এর অনুস্মারক চান?',
    scheduleAddedSuccess: 'সম্পন্ন হয়েছে। আমি {time} টায় {title} এর অনুস্মারক যুক্ত করেছি।',
    callingCaregiver: 'আপনার কেয়ারগিভার অনু কে কল করা হচ্ছে।'
  },
  Assamese: {
    goingHome: 'ঘৰলৈ যোৱা হৈছে।',
    startingMemoryMatch: 'স্মৃতি সংযোগ আৰম্ভ কৰা হৈছে।',
    startingSequenceOrder: 'ক্ৰম আৰু ক্ৰমাংকন আৰম্ভ কৰা হৈছে।',
    startingAttentionFocus: 'মনোযোগ কেন্দ্ৰীকৰণ আৰম্ভ কৰা হৈছে।',
    startingObjectRecognition: 'বস্তু চিনাক্তকৰণ আৰম্ভ কৰা হৈছে।',
    openingBrainGames: 'মগজুৰ খেলসমূহ খোলা হৈছে।',
    openingMemories: 'আপোনাৰ স্মৃতিসমূহ খোলা হৈছে।',
    openingSettings: 'ছেটিংছ খোলা হৈছে।',
    openingCaregiver: 'কেয়াৰগিভাৰ ড্যাশবৰ্ড খোলা হৈছে।',
    openingSchedule: 'দৈনিক কাৰ্যসূচী খোলা হৈছে।',
    openingReminders: 'অনুস্মাৰক খোলা হৈছে।',
    openingHelp: 'জৰুৰীকালীন যোগাযোগ খোলা হৈছে।',
    createReminderPrompt: 'নিশ্চয়। আপুনি কিহৰ বাবে আৰু কিমান সময়ত অনুস্মাৰক বিচাৰে?',
    schedulePromptTitle: 'আপুনি কি কাম কাৰ্যসূচীত যোগ কৰিব বিচাৰে?',
    schedulePromptTime: 'আপুনি {title} ৰ বাবে কিমান সময়ত অনুস্মাৰক বিচাৰে?',
    scheduleAddedSuccess: 'সম্পন্ন হ’ল। মই {time} বজাত {title} ৰ বাবে অনুস্মাৰক যোগ কৰিলোঁ।',
    callingCaregiver: 'আপোনাৰ কেয়াৰগিভাৰ অনুকলৈ ফোন কৰা হৈছে।'
  },
  Manipuri: {
    goingHome: 'ময়ুমদা হল্লক্লে।',
    startingMemoryMatch: 'মেমোরী ম্যাচ হৌরে।',
    startingSequenceOrder: 'প্যাটার্ন নীংশিংবা হৌরে।',
    startingAttentionFocus: 'মিৎকুপ কেন্দ্ৰীকৰণ হৌরে।',
    startingObjectRecognition: 'পোৎশক চিনাক্তকরণ হৌরে।',
    openingBrainGames: 'ব্রেন গেমশিং হাঙদোক্লে।',
    openingMemories: 'নহাক্কী মেমোরীশিং হাঙদোক্লে।',
    openingSettings: 'সেটিংস হাঙদোক্লে।',
    openingCaregiver: 'কেয়ারগিবর ড্যাশবোর্ড হাঙদোক্লে।',
    openingSchedule: 'নুমিৎ খুদিংগী রুটিন হাঙদোক্লে।',
    openingReminders: 'রিমাইন্ডারশিং হাঙদোক্লে।',
    openingHelp: 'ইমার্জেন্সী কন্টাক্ট হাঙদোক্লে।',
    createReminderPrompt: 'য়াই। নহাক্না করিসিগীদমক অমসুং করম্বা পুংফমদা রিমাইন্ডার থম্বা পামীবগে?',
    schedulePromptTitle: 'নহাক্না করম্বা থবক রুটিনদা হাপচিনবা পামীবগে?',
    schedulePromptTime: 'নহাক্না {title} গী রিমাইন্ডার করম্বা পুংফমদা থম্বা পামীবগে?',
    scheduleAddedSuccess: 'লোইরে। ঐনা {title} গী রিমাইন্ডার {time} da হাপচিল্লে।',
    callingCaregiver: 'নহাক্কী কেয়ারগিবর অনুদা फोन तৌরি।'
  },
  Khasi: {
    goingHome: 'Wn leit sha yung.',
    startingMemoryMatch: 'Sdang ialehkai Memory Match.',
    startingSequenceOrder: 'Sdang ialehkai Sequence & Order.',
    startingAttentionFocus: 'Sdang ialehkai Attention Focus.',
    startingObjectRecognition: 'Sdang ialehkai Object Recognition.',
    openingBrainGames: 'Plie ia ki brain games.',
    openingMemories: 'Plie ia ki jingkynmaw jong phi.',
    openingSettings: 'Plie ia ki settings.',
    openingCaregiver: 'Plie ia ka caregiver dashboard.',
    openingSchedule: 'Plie ia ka rukom sngi.',
    openingReminders: 'Plie ia ki jingkynmaw dawai.',
    openingHelp: 'Plie ia ki emergency contacts.',
    createReminderPrompt: 'Hooid. Kumno phi kwah ba ngan pynkynmaw ia phi ha ka por aiu?',
    schedulePromptTitle: 'Kaei ka kyrteng ka kam kaba phi kwah pynbeit?',
    schedulePromptTime: 'Ha ka por aiu phi kwah ba ngan pynkynmaw ia phi ia ka {title}?',
    scheduleAddedSuccess: 'La dep. Nga la buh jingkynmaw ia ka {title} ha ka por {time}.',
    callingCaregiver: 'Wn khot ia ka Anu ka nongsumar jong phi.'
  },
  Mizo: {
    goingHome: 'In lamah kan kal leh dawn e.',
    startingMemoryMatch: 'Memory Match khelh tan a ni dawn e.',
    startingSequenceOrder: 'Sequence & Order khelh tan a ni dawn e.',
    startingAttentionFocus: 'Attention Focus khelh tan a ni dawn e.',
    startingObjectRecognition: 'Object Recognition khelh tan a ni dawn e.',
    openingBrainGames: 'Rilru infiamnate hawn a ni e.',
    openingMemories: 'I hriatrengnate hawn a ni e.',
    openingSettings: 'Settings hawn a ni e.',
    openingCaregiver: 'Caregiver dashboard hawn a ni e.',
    openingSchedule: 'Nitin hunruhman hawn a ni e.',
    openingReminders: 'Hriattirnate hawn a ni e.',
    openingHelp: 'Emergency contact te hawn a ni e.',
    createReminderPrompt: 'Tehreng mai. Eng thil nge i hriattir i duh a, eng tik hunah nge?',
    schedulePromptTitle: 'Eng thiltih nge rem i duh le?',
    schedulePromptTime: 'Eng tikah nge {title} hriattirna hi i duh ang le?',
    scheduleAddedSuccess: 'Zau zo ta. {title} hriattirna chu {time} ah siam a ni ta.',
    callingCaregiver: 'I caregiver Anu kan be dawn e.'
  },
  Nagamese: {
    goingHome: 'Ghor te jaise.',
    startingMemoryMatch: 'Memory Match shuru kurise.',
    startingSequenceOrder: 'Sequence & Order shuru kurise.',
    startingAttentionFocus: 'Attention Focus shuru kurise.',
    startingObjectRecognition: 'Object Recognition shuru kurise.',
    openingBrainGames: 'Brain games khulise.',
    openingMemories: 'Apuni laga memories khulise.',
    openingSettings: 'Settings khulise.',
    openingCaregiver: 'Caregiver dashboard khulise.',
    openingSchedule: 'Daily schedule khulise.',
    openingReminders: 'Reminders khulise.',
    openingHelp: 'Emergency contacts khulise.',
    createReminderPrompt: 'Sahi ase. Apuni ke ki hudhabole ase, aru ki time te?',
    schedulePromptTitle: 'Apuni ki activity schedule kuribole mon ase?',
    schedulePromptTime: 'Apuni {title} laga time ki thakibole mon ase?',
    scheduleAddedSuccess: 'Hoise. Apuni laga {title} reminder toh {time} te logaise.',
    callingCaregiver: 'Apuni laga caregiver Anu te call kurise.'
  },
  Tripuri: {
    goingHome: 'Nok te saise.',
    startingMemoryMatch: 'Memory Match choba khaili.',
    startingSequenceOrder: 'Sequence & Order choba khaili.',
    startingAttentionFocus: 'Attention Focus choba khaili.',
    startingObjectRecognition: 'Object Recognition choba khaili.',
    openingBrainGames: 'Brain games khulidi.',
    openingMemories: 'Nini memories khulidi.',
    openingSettings: 'Settings khulidi.',
    openingCaregiver: 'Caregiver dashboard khulidi.',
    openingSchedule: 'Daily schedule khulidi.',
    openingReminders: 'Reminders khulidi.',
    openingHelp: 'Emergency contacts khulidi.',
    createReminderPrompt: 'Kahm khe. Nini ki yaad phailani tong, aru ki time te?',
    schedulePromptTitle: 'Nini ki activity schedule khailani tong?',
    schedulePromptTime: 'Nini {title} reminder time ki thakilani tong?',
    scheduleAddedSuccess: 'Khotom. Nini {title} reminder toh {time} te logadi.',
    callingCaregiver: 'Nini caregiver Anu no call khamui tong.'
  }
};

export interface CommandResult {
  success: boolean;
  sourceLanguage: string;
  sourceText: string;
  englishCommand: string;
  intent: string;
  confidence: number;
  parameters: Record<string, any>;
  action: {
    type: 'navigate' | 'create_activity' | 'create_reminder' | 'call' | 'none' |
          'update_activity' | 'delete_activity' | 'complete_activity' |
          'update_reminder' | 'delete_reminder' | 'complete_reminder' |
          'create_memory' | 'update_memory' | 'delete_memory' | 'search_memories' | 'memory_detail';
    target?: string;
  };
  response: string;
  activityData?: any;
  languageValue?: string;
  gameId?: string;
  actions?: any[];
}

export const commandExecutor = {
  async execute(text: string, language: string, patientId = 'patient-ravi', contextData: any = {}, voiceContext: any = null): Promise<CommandResult> {
    const languageNameMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      bn: 'Bengali',
      as: 'Assamese',
      mni: 'Manipuri',
      kha: 'Khasi',
      lus: 'Mizo',
      nag: 'Nagamese',
      tri: 'Tripuri',
      english: 'English',
      hindi: 'Hindi',
      bengali: 'Bengali',
      assamese: 'Assamese',
      manipuri: 'Manipuri',
      khasi: 'Khasi',
      mizo: 'Mizo',
      nagamese: 'Nagamese',
      tripuri: 'Tripuri'
    };
    const resolvedLanguage = languageNameMap[language.toLowerCase()] || language || 'English';
    console.log(`[Executor] Processing command "${text}" in language "${resolvedLanguage}" (input was: "${language}")`);
    console.log(`[VOICE-INTERPRETATION] Raw transcript: "${text}"`);
    console.log(`[VOICE-INTERPRETATION] Normalized transcript: "${text.trim().toLowerCase()}"`);

    // 1. Try local LLM first
    let llmResult: LLMResponse | null = null;
    try {
      llmResult = await localLLMService.queryLLM(text, resolvedLanguage, contextData, voiceContext);
    } catch (e) {
      console.warn('[Executor] Local LLM query failed. Using deterministic fallback.');
    }

    let intent = 'UNKNOWN';
    let englishCommand = text;
    let parameters: Record<string, any> = {};
    let confidence = 0.5;
    let gameId = '';
    let responseText = '';

    if (llmResult) {
      intent = llmResult.intent;
      englishCommand = llmResult.englishCommand;
      parameters = llmResult.parameters || {};
      confidence = llmResult.confidence || 0.9;
      if (llmResult.response) {
        responseText = llmResult.response;
      }
      console.log(`[Executor] LLM matched intent: ${intent} (${confidence})`);
    } else {
      // 2. Deterministic Multilingual Fallback
      const normalizedQuery = this.normalizeMultilingual(text, resolvedLanguage);
      console.log(`[Executor] Normalized query to: "${normalizedQuery}"`);
      const detResult = voiceService.parseCommand({ command: normalizedQuery, patientId }, resolvedLanguage, contextData, voiceContext);
      
      intent = detResult.intent;
      englishCommand = normalizedQuery;
      confidence = intent !== 'UNKNOWN' ? 0.95 : 0.4;
      
      if (detResult.activityData) {
        parameters = {
          title: detResult.activityData.title,
          time: detResult.activityData.time,
          category: detResult.activityData.category,
          date: detResult.activityData.date,
          createReminder: detResult.activityData.createReminder,
          needClarification: detResult.activityData.needClarification,
          missingField: detResult.activityData.missingField
        };
      }
      if (detResult.response) {
        parameters.response = detResult.response;
        responseText = detResult.response;
      }
      if (detResult.path) {
        parameters.path = detResult.path;
      }
      if (detResult.gameId) {
        gameId = detResult.gameId;
      }
    }

    let actionType: 'navigate' | 'create_activity' | 'create_reminder' | 'call' | 'none' |
          'update_activity' | 'delete_activity' | 'complete_activity' |
          'update_reminder' | 'delete_reminder' | 'complete_reminder' |
          'create_memory' | 'update_memory' | 'delete_memory' | 'search_memories' | 'memory_detail' = 'none';
    let target = '';
    
    // Resolve translations for fallback or missing responses
    const vt = voiceResponseTranslations[resolvedLanguage] || voiceResponseTranslations.English;

    switch (intent) {
      case 'NAVIGATION': {
        actionType = 'navigate';
        if (parameters.target) {
          const tCanonical = parameters.target.toLowerCase().trim();
          const invalidPageFallback: Record<string, string> = {
            English: "I couldn't find that section in the application. Where would you like to go?",
            Hindi: "मुझे ऐप में वह अनुभाग नहीं मिला। आप कहाँ जाना चाहेंगे?",
            Bengali: "আমি অ্যাপ্লিকেশনে সেই বিভাগটি খুঁজে পাইনি। আপনি কোথায় যেতে চান?",
            Assamese: "মই এপ্লিকেচনত সেইটো বিভাগ বিচাৰি নাপালোঁ। আপুনি ক’লৈ যাব বিচাৰে?",
            Manipuri: "ঐনা এপ্লিকেসন অদুদা মফম অদু ফংখিদ্রে। অদোম কদাইদা চৎনিংবগে?",
            Khasi: "Nga khlem lap ia kata ka bynta ha ka application. Shaei phi kwah ban leit?",
            Mizo: "He application chhungah hian hemi lai hmun hi ka hmu lo tlat mai. Khawiah nge kal i duh?",
            Nagamese: "Mui eitu section to eitu application te bhal pora huna nai. Apuni kote jabo mon ase?",
            Tripuri: "Ang o section no thwng khai liya o application wo. Khwma phi khlai thwng nai?"
          };

          const cleanTarget = tCanonical.replace(/_/g, ' ');
          if (cleanTarget.includes('brain games') || cleanTarget.includes('games') || cleanTarget.includes('game')) {
            target = '/games';
            if (!responseText) responseText = vt.openingBrainGames || 'Opening brain games.';
          } else if (cleanTarget.includes('memor')) {
            target = '/memories';
            if (!responseText) responseText = vt.openingMemories || 'Opening your memories.';
          } else if (cleanTarget.includes('remind')) {
            target = '/reminders';
            if (!responseText) responseText = vt.openingReminders || 'Opening reminders.';
          } else if (cleanTarget.includes('setting')) {
            target = '/settings';
            if (!responseText) responseText = vt.openingSettings || 'Opening settings.';
          } else if (cleanTarget.includes('caregiver') || cleanTarget.includes('dashboard')) {
            target = '/caregiver';
            if (!responseText) responseText = vt.openingCaregiver || 'Opening caregiver dashboard.';
          } else if (cleanTarget.includes('day') || cleanTarget.includes('schedule')) {
            target = '/day';
            if (!responseText) responseText = vt.openingSchedule || 'Opening daily schedule.';
          } else if (cleanTarget.includes('garden') || cleanTarget.includes('mind garden')) {
            target = '/garden';
            if (!responseText) responseText = 'Opening Mind Garden.';
          } else if (cleanTarget.includes('health') || cleanTarget.includes('medical')) {
            target = '/settings';
            if (!responseText) responseText = 'Opening health information.';
          } else if (cleanTarget.includes('home') || cleanTarget === 'main' || cleanTarget === '/') {
            target = '/';
            if (!responseText) responseText = vt.goingHome || 'Going home.';
          } else {
            actionType = 'none';
            target = '';
            responseText = invalidPageFallback[resolvedLanguage] || invalidPageFallback.English;
            intent = 'CLARIFICATION_REQUIRED';
          }
        } else {
          actionType = 'none';
          target = '';
          intent = 'UNKNOWN';
        }
        break;
      }
      case 'OPEN_HOME':
        actionType = 'navigate';
        target = '/';
        if (!responseText) responseText = vt.goingHome || 'Going home.';
        break;
      case 'OPEN_BRAIN_GAMES':
      case 'START_BRAIN_GAME':
        actionType = 'navigate';
        target = '/games';
        if (!responseText) responseText = vt.openingBrainGames || 'Opening brain games.';
        break;
      case 'OPEN_MY_DAY':
      case 'SHOW_TODAYS_SCHEDULE':
        actionType = 'navigate';
        target = '/day';
        if (!responseText) responseText = vt.openingSchedule || 'Opening daily schedule.';
        break;
      case 'OPEN_MEMORIES':
        actionType = 'navigate';
        target = '/memories';
        if (!responseText) responseText = vt.openingMemories || 'Opening your memories.';
        break;
      case 'OPEN_REMINDERS':
      case 'SHOW_REMINDERS':
        actionType = 'navigate';
        target = '/reminders';
        if (!responseText) responseText = vt.openingReminders || 'Opening reminders.';
        break;
      case 'OPEN_SETTINGS':
        actionType = 'navigate';
        target = '/settings';
        if (!responseText) responseText = vt.openingSettings || 'Opening settings.';
        break;
      case 'OPEN_HELP':
      case 'HELP':
        actionType = 'navigate';
        target = '/help';
        if (!responseText) responseText = vt.openingHelp || 'Opening emergency contacts.';
        break;
      case 'OPEN_PEOPLE':
      case 'OPEN_FAMILY':
        actionType = 'navigate';
        target = '/help';
        if (!responseText) responseText = vt.openingHelp || 'Showing family contacts.';
        break;
      case 'OPEN_CAREGIVER':
        actionType = 'navigate';
        target = '/caregiver';
        if (!responseText) responseText = vt.openingCaregiver || 'Opening caregiver dashboard.';
        break;
      case 'OPEN_MEMORY_MATCH':
        actionType = 'navigate';
        target = '/games';
        gameId = 'game-1';
        if (!responseText) responseText = vt.startingMemoryMatch || 'Starting Memory Match.';
        break;
      case 'OPEN_SEQUENCE_ORDER':
        actionType = 'navigate';
        target = '/games';
        gameId = 'game-2';
        if (!responseText) responseText = vt.startingSequenceOrder || 'Starting Sequence & Order.';
        break;
      case 'OPEN_ATTENTION_FOCUS':
        actionType = 'navigate';
        target = '/games';
        gameId = 'game-3';
        if (!responseText) responseText = vt.startingAttentionFocus || 'Starting Attention Focus.';
        break;
      case 'OPEN_OBJECT_RECOGNITION':
        actionType = 'navigate';
        target = '/games';
        gameId = 'game-4';
        if (!responseText) responseText = vt.startingObjectRecognition || 'Starting Object Recognition.';
        break;
      case 'OPEN_DAILY_ROUTINE':
        actionType = 'navigate';
        target = '/games';
        gameId = 'game-5';
        if (!responseText) responseText = vt.startingDailyRoutine || 'Starting Daily Routine Recall.';
        break;
      case 'OPEN_LANGUAGE_MEMORY':
        actionType = 'navigate';
        target = '/games';
        gameId = 'game-6';
        if (!responseText) responseText = vt.startingLanguageMemory || 'Starting Language & Word Memory.';
        break;
      case 'SHOW_NEXT_ACTIVITY':
        actionType = 'none';
        if (!responseText) responseText = 'Let me check your next activity.';
        break;
      case 'ADD_ACTIVITY':
      case 'CREATE_ACTIVITY':
        actionType = 'create_activity';
        if (!responseText) responseText = parameters.title && parameters.time ? (vt.scheduleAddedSuccess || "Done. I've added your reminder for {title} at {time}.").replace('{title}', parameters.title).replace('{time}', parameters.time) : (vt.schedulePromptTitle || 'What is the name of the activity you want to schedule?');
        break;
      case 'CREATE_REMINDER':
      case 'ADD_REMINDER':
        actionType = 'create_reminder';
        if (!responseText) responseText = parameters.title && parameters.time ? (vt.scheduleAddedSuccess || "Done. I've added your reminder for {title} at {time}.").replace('{title}', parameters.title).replace('{time}', parameters.time) : (vt.createReminderPrompt || 'What would you like me to remind you about, and what time?');
        break;
      case 'UPDATE_REMINDER':
      case 'MODIFY_REMINDER':
        actionType = 'update_reminder';
        break;
      case 'DELETE_REMINDER':
        actionType = 'delete_reminder';
        break;
      case 'COMPLETE_REMINDER':
        actionType = 'complete_reminder';
        break;
      case 'UPDATE_ACTIVITY':
      case 'MODIFY_ACTIVITY':
        actionType = 'update_activity';
        break;
      case 'DELETE_ACTIVITY':
        actionType = 'delete_activity';
        break;
      case 'COMPLETE_ACTIVITY':
        actionType = 'complete_activity';
        break;
      case 'CREATE_MEMORY':
        actionType = 'create_memory';
        break;
      case 'UPDATE_MEMORY':
        actionType = 'update_memory';
        break;
      case 'DELETE_MEMORY':
        actionType = 'delete_memory';
        break;
      case 'SEARCH_MEMORIES':
      case 'MEMORY_QUERY':
        actionType = 'search_memories';
        break;
      case 'MEMORY_DETAIL':
        actionType = 'memory_detail';
        break;
      case 'DAILY_PLAN_QUERY':
        actionType = 'navigate';
        target = '/day';
        break;
      case 'CALL_CAREGIVER':
        actionType = 'call';
        if (!responseText) responseText = vt.callingCaregiver || 'Calling your caregiver Anu.';
        break;
      case 'CHECK_MEMORY_PROGRESS':
        actionType = 'none';
        if (!responseText) responseText = 'Analyzing your cognitive data...';
        break;
      case 'SHOW_FAVORITE_MEMORY':
        actionType = 'navigate';
        target = '/memories';
        if (!responseText) responseText = vt.openingMemories || 'Looking up your favorite memory...';
        break;
      case 'PLAN_DAY':
        actionType = 'navigate';
        target = '/day';
        if (!responseText) responseText = vt.openingSchedule || 'Organizing your schedule...';
        break;
      case 'CALL_CONTACT':
        actionType = 'call';
        responseText = parameters.title ? `Calling ${parameters.title}.` : 'Who would you like me to call?';
        break;
      case 'CHANGE_LANGUAGE':
        actionType = 'navigate';
        target = '/settings';
        responseText = 'Opening language settings.';
        break;

      case 'REPEAT':
        actionType = 'none';
        responseText = 'Repeating your last response.';
        break;
      case 'LAST_SPOKEN':
        actionType = 'none';
        responseText = 'You just said: ' + text;
        break;

      case 'CONVERSATION':
        actionType = 'none';
        responseText = parameters.response || 'Hello!';
        break;
      default:
        if (!responseText || intent === 'UNKNOWN') {
          intent = 'UNKNOWN';
          const defaultFallbackDict: Record<string, string> = {
            English: "I didn't quite understand that. Could you tell me a little more?",
            Hindi: "मुझे यह पूरी तरह समझ नहीं आया। क्या आप थोड़ा और बता सकते हैं?",
            Bengali: "আমি এটি ঠিক বুঝতে পারিনি। আপনি কি আর একটু বিস্তারিত বলতে পারেন?",
            Assamese: "মই কথাটো ভালদৰে বুজি নাপালোঁ। অলপ বহলাই ক’ব নেকি?",
            Manipuri: "ঐ খঙবা ঙমদ্রে, অমুক্তা হন্না হায়বীউ?",
            Khasi: "Nga khlem da sngewthuh bha. Lah ban kynthup kham bniah?",
            Mizo: "Ka va hrethiam chiah lo ve. Khawngaihin sawi thar leh ta che?",
            Nagamese: "Mui bhal pora huna nai. Aru ekbar bhal pora kobi na?",
            Tripuri: "Ang bujilakhlai. Aru chichi samphurdi?"
          };
          responseText = defaultFallbackDict[language] || defaultFallbackDict.English;
        } else {
          actionType = 'none';
          if (intent === 'NAVIGATION' && parameters.target) {
            actionType = 'navigate';
            const tCanonical = parameters.target.toLowerCase().trim();
            const invalidPageFallback: Record<string, string> = {
              English: "I couldn't find that section in the application. Where would you like to go?",
              Hindi: "मुझे ऐप में वह अनुभाग नहीं मिला। आप कहाँ जाना चाहेंगे?",
              Bengali: "আমি অ্যাপ্লিকেশনে সেই বিভাগটি খুঁজে পাইনি। আপনি কোথায় যেতে চান?",
              Assamese: "মই এপ্লিকেচনত সেইটো বিভাগ বিচাৰি নাপালোঁ। আপুনি ক’লৈ যাব বিচাৰে?",
              Manipuri: "ঐনা এপ্লিকেসন অদুদা মফম অদু ফংখিদ্রে। অদোম কদাইদা চৎনিংবге?",
              Khasi: "Nga khlem lap ia kata ka bynta ha ka application. Shaei phi kwah ban leit?",
              Mizo: "He application chhungah hian hemi lai hmun hi ka hmu lo tlat mai. Khawiah nge kal i duh?",
              Nagamese: "Mui eitu section to eitu application te bhal pora huna nai. Apuni kote jabo mon ase?",
              Tripuri: "Ang o section no thwng khai liya o application wo. Khwma phi khlai thwng nai?"
            };

            const cleanTarget = tCanonical.replace(/_/g, ' ');
            if (cleanTarget.includes('brain games') || cleanTarget.includes('games') || cleanTarget.includes('game')) {
              target = '/games';
              if (!responseText) responseText = vt.openingBrainGames || 'Opening brain games.';
            } else if (cleanTarget.includes('memor')) {
              target = '/memories';
              if (!responseText) responseText = vt.openingMemories || 'Opening your memories.';
            } else if (cleanTarget.includes('remind')) {
              target = '/reminders';
              if (!responseText) responseText = vt.openingReminders || 'Opening reminders.';
            } else if (cleanTarget.includes('setting')) {
              target = '/settings';
              if (!responseText) responseText = vt.openingSettings || 'Opening settings.';
            } else if (cleanTarget.includes('caregiver') || cleanTarget.includes('dashboard')) {
              target = '/caregiver';
              if (!responseText) responseText = vt.openingCaregiver || 'Opening caregiver dashboard.';
            } else if (cleanTarget.includes('day') || cleanTarget.includes('schedule')) {
              target = '/day';
              if (!responseText) responseText = vt.openingSchedule || 'Opening daily schedule.';
            } else if (cleanTarget.includes('home') || cleanTarget === 'main' || cleanTarget === '/') {
              target = '/';
              if (!responseText) responseText = vt.goingHome || 'Going home.';
            } else {
              actionType = 'none';
              target = '';
              responseText = invalidPageFallback[resolvedLanguage] || invalidPageFallback.English;
              intent = 'CLARIFICATION_REQUIRED';
            }
          }
        }
    }

    if (parameters.response) {
      responseText = parameters.response;
    }

    console.log(`[VOICE-INTERPRETATION] Final intent: ${intent}`);

    return {
      success: true,
      sourceLanguage: language,
      sourceText: text,
      englishCommand,
      intent,
      confidence,
      parameters,
      action: {
        type: actionType,
        target
      },
      response: responseText,
      activityData: intent === 'ADD_ACTIVITY' || intent === 'CREATE_ACTIVITY' ? {
        title: parameters.title || 'Activity',
        time: parameters.time || '18:00',
        date: parameters.date || new Date().toISOString().split('T')[0],
        category: parameters.category || 'other',
        createReminder: parameters.createReminder !== false,
        needClarification: !parameters.title || !parameters.time,
        missingField: !parameters.title ? 'title' : (!parameters.time ? 'time' : undefined)
      } : undefined,
      gameId,
      actions: llmResult?.actions
    };
  },

  normalizeMultilingual(text: string, language: string): string {
    let clean = text.toLowerCase().trim();

    if (language === 'hi') {
      // Map Hindi numerals to English digits
      const hindiDigits = ['०','१','२','३','४','५','६','७','८','९'];
      hindiDigits.forEach((hd, idx) => {
        clean = clean.replace(new RegExp(hd, 'g'), String(idx));
      });

      if (clean.includes('ब्रेन') || clean.includes('गेम')) {
        return 'open brain games';
      }
      if (clean.includes('यादें') || clean.includes('मेमोरी')) {
        return 'show my memories';
      }
      if (clean.includes('शेड्यूल') || clean.includes('रूटीन') || clean.includes('दिनचर्या')) {
        return 'open my day';
      }
      if (clean.includes('रिमाइंडर') || clean.includes('अलार्म')) {
        return 'show reminders';
      }
      if (clean.includes('सेटिंग')) {
        return 'open settings';
      }
      if (clean.includes('मदद') || clean.includes('सहायता')) {
        return 'i need help';
      }
      if (clean.includes('जोड़ो') || clean.includes('बजे')) {
        let title = 'Activity';
        if (clean.includes('टहलने') || clean.includes('घूमने')) title = 'Walking';
        if (clean.includes('दवा') || clean.includes('गोली')) title = 'Medicine';
        if (clean.includes('पानी')) title = 'Drink water';

        let timeStr = '6 pm';
        const numMatch = clean.match(/(\d+)\s*बजे/);
        if (numMatch) {
          timeStr = `${numMatch[1]} pm`;
        }
        return `add ${title} at ${timeStr}`;
      }
    }

    if (language === 'bn') {
      if (clean.includes('গেম') || clean.includes('ব্রেন')) return 'open brain games';
      if (clean.includes('স্মৃতি') || clean.includes('মেমরি')) return 'show my memories';
    }

    if (language === 'as') {
      if (clean.includes('গেম') || clean.includes('ব্ৰেইন')) return 'open brain games';
      if (clean.includes('স্মৃতি')) return 'show my memories';
    }

    return text;
  }
};