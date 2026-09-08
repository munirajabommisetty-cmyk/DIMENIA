import { storageService } from './storageService';

// --- GENERALIZED PATIENT AI QUERY RESOLVER ---
export function patientAIQueryResolver(
  norm: string,
  semanticCore: string,
  language: string,
  contextData: any,
  _voiceContext: any = null
): any | null {
  const profile = contextData.profile || (typeof storageService !== 'undefined' ? storageService.getCurrentUser() : null) || {};
  const userName = profile.name || 'Patient';
  const memories = contextData.memories || (typeof storageService !== 'undefined' ? storageService.getMemories() : []) || [];
  const schedule = contextData.schedule || (typeof storageService !== 'undefined' ? storageService.getSchedule() : []) || [];
  const reminders = contextData.reminders || (typeof storageService !== 'undefined' ? storageService.getReminders() : []) || [];
  const games = contextData.games || (typeof storageService !== 'undefined' ? storageService.getGames() : []) || [];

  const lang = language || 'English';
  const matchesAny = (keywords: string[]) => keywords.some(k => norm.includes(k) || semanticCore.includes(k));
  const getLangStr = (dict: Record<string, string>): string => dict[lang] || dict.English;

  // =========================================================================
  // 0. EXPLICIT REMINDER CREATION CHECK FIRST!
  // =========================================================================
  const isExplicitReminderCreate = matchesAny([
    'remind me to', 'remind me at', 'add a reminder', 'add reminder',
    'set a reminder', 'create a reminder', 'schedule a reminder',
    'reminder set karo', 'reminder banao', 'रिमाइंडर लगाओ', 'রিমাইন্ডার সেট করুন'
  ]);
  if (isExplicitReminderCreate) {
    return null; // Delegate to deterministic reminder creation parser
  }

  // =========================================================================
  // 1. SPECIFIC GAME DIRECT OPENING
  // =========================================================================
  if (matchesAny(['memory match', 'match game', 'match memory', 'memory matching'])) {
    return {
      intent: 'OPEN_MEMORY_MATCH',
      path: '/games',
      gameId: 'game-1',
      response: getLangStr({
        English: 'Starting Memory Match.',
        Hindi: 'मेमोरी मैच शुरू किया जा रहा है।',
        Bengali: 'মেমরি ম্যাচ শুরু করা হচ্ছে।',
        Assamese: 'স্মৃতি সংযোগ আৰম্ভ কৰা হৈছে।',
        Manipuri: 'মেমোরী ম্যাচ হৌরে।',
        Khasi: 'Sdang ialehkai Memory Match.',
        Mizo: 'Memory Match khelh tan a ni dawn e.',
        Nagamese: 'Memory Match shuru kurise.',
        Tripuri: 'Memory Match choba khaili.'
      })
    };
  }
  if (matchesAny(['sequence & order', 'sequence and order', 'sequence game'])) {
    return {
      intent: 'OPEN_SEQUENCE_ORDER',
      path: '/games',
      gameId: 'game-2',
      response: getLangStr({
        English: 'Starting Sequence & Order.',
        Hindi: 'सीक्वेंस और ऑर्डर शुरू किया जा रहा है।',
        Bengali: 'সিকোয়েন্স অ্যান্ড অর্ডার শুরু করা হচ্ছে।',
        Assamese: 'ক্ৰম আৰু ক্ৰমাংকন আৰম্ভ কৰা হৈছে।',
        Manipuri: 'প্যাটার্ন নীংশিংবা হৌরে।',
        Khasi: 'Sdang ialehkai Sequence & Order.',
        Mizo: 'Sequence & Order khelh tan a ni dawn e.',
        Nagamese: 'Sequence & Order shuru kurise.',
        Tripuri: 'Sequence & Order choba khaili.'
      })
    };
  }

  // =========================================================================
  // 2. BRAIN GAME RECOMMENDATION / BORED INTENT
  // =========================================================================
  const isGameRecReq = matchesAny([
    'recommend', 'should i play', 'what game should i play', 'which game should i play',
    'feel bored', 'bored', 'best game for me', 'game to improve', 'improve my memory based on'
  ]) || (matchesAny(['bored', 'feeling bored']) && matchesAny(['game', 'games', 'play', 'memory']));

  if (isGameRecReq) {
    const g1 = games.find((g: any) => g.gameId === 'game-1') || games[0] || { unlockedLevel: 1, bestScore: 0, gameName: 'Memory Match' };
    const bestScore = g1.bestScore || 0;
    const unlockedLevel = g1.unlockedLevel || 1;

    const recMsg: Record<string, string> = {
      English: `Based on your previous performance, Memory Match is a great choice today. You are currently at Level ${unlockedLevel} with a top score of ${bestScore > 0 ? bestScore + ' points' : 'steady progress'}. Let's open Brain Games and continue with it!`,
      Hindi: `आपके पिछले प्रदर्शन के आधार पर, आज मेमोरी मैच एक बेहतरीन विकल्प है। आप वर्तमान में लेवल ${unlockedLevel} पर हैं। चलिए दिमागी खेल खोलते हैं!`,
      Bengali: `আপনার পূর্ববর্তী পারফরম্যান্সের ভিত্তিতে, আজ মেমরি ম্যাচ একটি দুর্দান্ত পছন্দ। আপনি বর্তমানে লেভেল ${unlockedLevel}-এ আছেন। চলুন ব্রেন গেম খুলি!`,
      Assamese: `আপোনাৰ পূৰ্বৰ অগ্ৰগতিৰ ভিত্তিত, আজি স্মৃতি সংযোগ খেলটো অতি সুন্দৰ বিকল্প। আপুনি লেভেল ${unlockedLevel} ত আছে। ব’লক মগজুৰ খেল খোলোঁ!`,
      Manipuri: `নহাক্কী চাউখৎপদা য়ুমফম ওইগা ঙসি মেমোরী ম্যাচ শান্নবা অমুক ফগনি। ব্রেন গেম হাঙদোক্লে!`,
      Khasi: `Katkum ka jingiaid shaphrang jong phi, u Memory Match u dei uba bha tam mynta. Ia namano ialehkai games!`,
      Mizo: `I hmasawnna atangin vawiin hian Memory Match khelh hi a tha ber dawn e. Level ${unlockedLevel}-ah i awm mek e!`,
      Nagamese: `Apuni laga progress hisap te aji Memory Match bisi bhal thakibo. Brain games khulise!`,
      Tripuri: `Nini progress bai aji Memory Match khamdi. Brain games khulidi!`
    };

    return {
      intent: 'BRAIN_GAME_RECOMMENDATION',
      path: '/games',
      gameId: 'game-1',
      response: getLangStr(recMsg)
    };
  }

  // =========================================================================
  // 3. COGNITIVE & MEMORY PERFORMANCE QUERIES
  // =========================================================================
  const isCognitivePerfQuery = (
    (matchesAny(['memory', 'memories', 'yaad', 'स्मृति', 'মেমরি']) && matchesAny(['power', 'improving', 'improvement', 'better', 'changed', 'progress', 'score', 'previous', 'performance', 'trend', 'compared', 'games', 'game', 'kaise improve', 'behtar', 'उन्नति', 'উন্নতি'])) ||
    matchesAny([
      'how is my memory power', 'memory power improving', 'is my memory getting better',
      'how has my memory performance changed', 'am i improving at memory games',
      'how was my memory performance compared', 'what is my memory score',
      'cognitive performance', 'how am i improving', 'overall cognitive score',
      'brain performance', 'my progress in games', 'how is my attention', 'attention score'
    ])
  );

  if (isCognitivePerfQuery) {
    const memoryGame = games.find((g: any) => g.gameId === 'game-1' || (g.gameName || '').toLowerCase().includes('memory')) || games[0] || { unlockedLevel: 1, bestScore: 0, gameName: 'Memory Match' };
    const bestScore = memoryGame.bestScore || 0;
    const unlockedLevel = memoryGame.unlockedLevel || 1;

    let perfMsg: Record<string, string>;
    if (bestScore > 0 || unlockedLevel > 1) {
      perfMsg = {
        English: `Your memory performance has shown steady progress! In Memory Match, you are currently at Level ${unlockedLevel} with a top score of ${bestScore} points. Your consistent practice is strengthening your cognitive recall. Let's look at your Brain Games progress.`,
        Hindi: `आपका स्मरण प्रदर्शन लगातार सुधर रहा है! मेमोरी मैच में आप वर्तमान में लेवल ${unlockedLevel} पर हैं और आपका उच्चतम स्कोर ${bestScore} अंक है।`,
        Bengali: `আপনার স্মৃতিশক্তির কার্যক্ষমতা ক্রমাগত উন্নত হচ্ছে! মেমরি ম্যাচে আপনি বর্তমানে লেভেল ${unlockedLevel}-এ আছেন এবং সেরা স্কোর ${bestScore} পয়েন্ট।`,
        Assamese: `আপোনাৰ স্মৃতিশক্তিৰ অগ্ৰগতি ধাৰাবাহিকভাৱে উন্নত হৈছে! স্মৃতি সংযোগ খেলত আপুনি লেভেল ${unlockedLevel} ত আছে।`,
        Manipuri: `নহাক্কী মেমোরী শান্নবা মপাঙ্গল চাউখৎলক্লি! মেমোরী ম্যাচতা নহাক হৌজিক লেবেল ${unlockedLevel} দা লৈরি।`,
        Khasi: `Ka jingtrei kam jong ka jingkynmaw jong phi ka nang iaid shaphrang! Ha Memory Match phi don ha Level ${unlockedLevel}.`,
        Mizo: `I hriatrengna dinhmun a hma sawn zel e! Memory Match-ah Level ${unlockedLevel}-ah i awm mek e.`,
        Nagamese: `Apuni laga memory performance bisi improve hoikena ase! Memory Match te apuni Level ${unlockedLevel} te ase.`,
        Tripuri: `Nini memory performance bhal hoikena tongkha! Memory Match te nini Level ${unlockedLevel} tongkha.`
      };
    } else {
      perfMsg = {
        English: `You don't have enough previous memory-game results yet for me to compare your progress. Try playing Memory Match today to set your initial score!`,
        Hindi: `आपकी प्रगति की तुलना करने के लिए अभी पर्याप्त मेमोरी गेम परिणाम नहीं हैं। आज ही खेलें!`,
        Bengali: `আপনার অগ্রগতির তুলনা করার জন্য এখনও পর্যাপ্ত মেমরি গেমের ফলাফল নেই। আজই গেম খেলুন!`,
        Assamese: `আপোনাৰ অগ্ৰগতি তুলনা কৰিবলৈ এতিয়ালৈকে পৰ্যাপ্ত খেলৰ ফলাফল নাই।`,
        Manipuri: `নহাক্কী চাউখৎপদা চাংদম্ননবা হージュিকফাওবা গেমগী ফল্লফ ফংদ্রি।`,
        Khasi: `Phi khlem pat don kiei kiba biang ban nujor ia ka jingiaid shaphrang.`,
        Mizo: `I hmasawnna te khaikhin turin infiamna hmun hma a la tlem em em e.`,
        Nagamese: `Apuni laga progress compare kuribole aji tak enough game records nai.`,
        Tripuri: `Nini progress compare khamnani bhal game record tongya.`
      };
    }

    return {
      intent: 'COGNITIVE_PERFORMANCE_QUERY',
      domain: 'MEMORY',
      path: '/games',
      gameId: 'game-1',
      response: getLangStr(perfMsg)
    };
  }

  // =========================================================================
  // 4. NEXT TASK QUERY
  // =========================================================================
  const isNextTaskQuery = matchesAny([
    'which task should i do next', 'what should i do next', 'what is my next task',
    'what is my next activity', 'what next', 'subah ka kaam', 'agla kaam'
  ]);

  if (isNextTaskQuery) {
    const pendingSched = schedule.filter((s: any) => !s.completed);
    const pendingRems = reminders.filter((r: any) => r.status !== 'Completed');
    const nextItem = pendingSched[0] || pendingRems[0];

    let nextMsg: Record<string, string>;
    if (nextItem) {
      nextMsg = {
        English: `Your next task is ${nextItem.title}${nextItem.time ? ' scheduled for ' + nextItem.time : ''}. It is ready for you, so let's get started!`,
        Hindi: `आपका अगला कार्य ${nextItem.title} है। यह आपके लिए तैयार है, चलिए शुरुआत करते हैं!`,
        Bengali: `আপনার পরবর্তী কাজ হলো ${nextItem.title}। এটি আপনার জন্য প্রস্তুত, চলুন শুরু করা যাক!`,
        Assamese: `আপোনাৰ পৰৱৰ্তী কাম হ’ল ${nextItem.title}। ব’লক আৰম্ভ কৰোঁ!`,
        Manipuri: `নহাক্কী মথংগী থবকদি ${nextItem.title} নি।`,
        Khasi: `Ka kam jong phi kaba bud dei ${nextItem.title}.`,
        Mizo: `I thiltih tur dawt chu ${nextItem.title} a ni e.`,
        Nagamese: `Apuni laga akhe activity toh ${nextItem.title} ase.`,
        Tripuri: `Nini uli activity toh ${nextItem.title} tongkha.`
      };
    } else {
      nextMsg = {
        English: "You've completed all your scheduled tasks for today! Great job!",
        Hindi: "आपने आज के अपने सभी कार्य पूरे कर लिए हैं! बहुत बढ़िया!",
        Bengali: "আপনি আজকের সব কাজ সম্পন্ন করেছেন! দারুণ কাজ!",
        Assamese: "আপুনি আজিৰ সকলো কাম সম্পূৰ্ণ কৰিলে!",
        Manipuri: "নহাক্না ঙসিগী থবক পুম্নমক লোইশিনখ্রে!",
        Khasi: "Phi la pyndep ia ki kam baroh mynta ka sngi!",
        Mizo: "Vawiin a i hnathawh tur zawng zawng i ti zo tawh e!",
        Nagamese: "Apuni aji laga sob activity complete hoise!",
        Tripuri: "Nini aji sob activity complete hoikena tongkha!"
      };
    }

    return {
      intent: 'NEXT_TASK_QUERY',
      path: '/day',
      highlightTaskId: nextItem?.id,
      response: getLangStr(nextMsg)
    };
  }

  // =========================================================================
  // 5. MEDICATION SCHEDULE QUERY
  // =========================================================================
  const isMedicationScheduleQuery = matchesAny([
    'medication schedule', 'my medication schedule', 'my medicine schedule',
    'when should i take my medicine', 'what medicine do i need to take',
    'dawa ka time', 'dawai schedule', 'tell me about my medication schedule'
  ]);

  if (isMedicationScheduleQuery) {
    const medRems = reminders.filter((r: any) =>
      (r.category === 'medicine' || (r.title || '').toLowerCase().includes('med') || (r.title || '').toLowerCase().includes('pill') || (r.title || '').toLowerCase().includes('dawa'))
    );
    let medMsg: Record<string, string>;
    if (medRems.length > 0) {
      const list = medRems.map((r: any) => `${r.title} at ${r.time} (${r.status === 'Completed' ? 'completed' : 'pending'})`).join(', ');
      medMsg = {
        English: `Here is your medication schedule for today: ${list}.`,
        Hindi: `यह आज के लिए आपका दवा शेड्यूल है: ${list}।`,
        Bengali: `আজকের জন্য আপনার ওষুধের সময়সূচী: ${list}।`,
        Assamese: `আজিৰ বাবে আপোনাৰ ঔষধৰ কাৰ্যসূচী: ${list}।`,
        Manipuri: `ঙসিগী হিদাঅগী রুটিন: ${list}।`,
        Khasi: `Kine ki dei ki por dih dawai jong phi mynta ka sngi: ${list}.`,
        Mizo: `Vawiin atan i damdawi ei hunruhman te chu: ${list}.`,
        Nagamese: `Aji laga dawa schedule toh: ${list}.`,
        Tripuri: `Aji nini medicine schedule toh: ${list}.`
      };
    } else {
      medMsg = {
        English: "You don't have any specific medicine reminders listed for today.",
        Hindi: "आज के लिए कोई विशिष्ट दवा रिमाइंडर नहीं है।",
        Bengali: "আজকের জন্য কোনো নির্দিষ্ট ওষুধের অনুস্মারক নেই।",
        Assamese: "আজিৰ বাবে কোনো বিশেষ ঔষধৰ ৰিমাইণ্ডাৰ নাই।",
        Manipuri: "ঙসিগী অখন্নবা হিদাঅগী রিমাঈন্ডর লৈতাদ্রে।",
        Khasi: "Khlem don jingkynmaw dih dawai mynta ka sngi.",
        Mizo: "Vawiin atan damdawi hriattirna a awm lo e.",
        Nagamese: "Aji specific dawa reminder nai.",
        Tripuri: "Aji specific medicine reminder tongya."
      };
    }

    return {
      intent: 'MEDICATION_SCHEDULE_QUERY',
      path: '/reminders',
      response: getLangStr(medMsg)
    };
  }

  // =========================================================================
  // 6. MOTIVATION_SUPPORT
  // =========================================================================
  const isMotivationReq = matchesAny([
    'motivate', 'motivation', 'encouragement', 'encourage', 'not feeling good',
    'not feeling very good', 'dont feel like', 'don\'t feel like', 'feeling low',
    'feeling tired', 'help me finish', 'help me get through', 'help me stay on track',
    'kaam karne ka man nahi', 'prerit', 'utsaah', 'himmat', 'anand', 'উৎসাহ', 'অনুপ্রেরণা',
    'inspire', 'struggling to complete'
  ]) || (
    matchesAny(['tasks', 'activities', 'day', 'work']) &&
    matchesAny(['motivate', 'encourag', 'help me finish', 'help me get through', 'help me stay on track'])
  );

  if (isMotivationReq) {
    const pendingSchedule = schedule.filter((s: any) => !s.completed);
    const pendingReminders = reminders.filter((r: any) => r.status !== 'Completed');
    const pendingCount = pendingSchedule.length + pendingReminders.length;
    const nextTask = pendingSchedule[0]?.title || pendingReminders[0]?.title || 'your next activity';

    let motivationMsg: Record<string, string>;
    if (pendingCount > 0) {
      motivationMsg = {
        English: `I'm right here with you, ${userName}. You don't have to finish everything at once. You have ${pendingCount} task${pendingCount > 1 ? 's' : ''} remaining today. Let's take them one step at a time. You can start with ${nextTask}.`,
        Hindi: `मैं आपके साथ हूँ, ${userName}। आपको सब कुछ एक साथ पूरा करने की ज़रूरत नहीं है। आपके आज ${pendingCount} कार्य बाकी हैं। चलिए एक-एक कदम बढ़ाते हैं। आप ${nextTask} से शुरुआत कर सकते हैं।`,
        Bengali: `আমি আপনার সাথে আছি, ${userName}। আপনাকে এক সাথে সবকিছু শেষ করতে হবে না। আজ আপনার ${pendingCount}টি কাজ বাকি আছে। চলুন একটি একটি করে শুরু করি। আপনি ${nextTask} দিয়ে শুরু করতে পারেন।`,
        Assamese: `মই আপোনাৰ লগত আছোঁ, ${userName}। আপুনি একেলগে সকলো শেষ কৰিব নালাগে। আজি আপোনাৰ ${pendingCount}টা কাম বাকী আছে।`,
        Manipuri: `ঐ নহাক্কী নাকান্দা লৈরি, ${userName}। নহাক অমুক্তদা পুম্নমক লোইশিনবা থোইদে।`,
        Khasi: `Nga don bad phi, ${userName}. Phi donkam ban pyndep ia kiei kiei baroh ha ka shisien kiew.`,
        Mizo: `I hnenah ka awm e, ${userName}. A rualin eng kim zawh vek a ngai lo a ni.`,
        Nagamese: `Moi apuni lagote ase, ${userName}. Apuni sob ekbare complete kuribole laganai.`,
        Tripuri: `Ang nini lok-te tongkha, ${userName}. Nini tabok ${pendingCount} activity baki tongkha.`
      };
    } else {
      motivationMsg = {
        English: `You're doing wonderfully, ${userName}! You have completed all your activities for today. Take a moment to rest and feel proud of your progress.`,
        Hindi: `आप बहुत बढ़िया काम कर रहे हैं, ${userName}! आपने आज की अपनी सभी गतिविधियाँ पूरी कर ली हैं।`,
        Bengali: `আপনি চমৎকার কাজ করছেন, ${userName}! আপনি আজকের সব কাজ সম্পন্ন করেছেন।`,
        Assamese: `আপুনি সুন্দৰ কাম কৰিছে, ${userName}! আপুনি আজিৰ সকলো কাম সম্পূৰ্ণ কৰিলে।`,
        Manipuri: `নহাক্না ফোজনা তৌরি, ${userName}! নহাক্না ঙসিগী থবক পুম্নমক লোইশিনখ্রে।`,
        Khasi: `Phi iaid bha shibun, ${userName}! Phi la pyndep ia ki kam baroh mynta ka sngi.`,
        Mizo: `I ti tha hle mai, ${userName}! Vawiin a i hnathawh tur zawng zawng i ti zo tawh e.`,
        Nagamese: `Apuni bisi bhal kurise, ${userName}! Apuni aji laga sob activity complete hoikena ase.`,
        Tripuri: `Nini samung bhal tongkha, ${userName}! Nini aji sob activity complete hoikena tongkha.`
      };
    }

    return {
      intent: 'MOTIVATION_SUPPORT',
      path: '/day',
      response: getLangStr(motivationMsg)
    };
  }

  // =========================================================================
  // 7. MY DAY & TASK STATUS QUERIES
  // =========================================================================
  const isMyDayQuery = (
    matchesAny([
      'tasks do i need', 'tasks i need to complete', 'what are the tasks',
      'what do i still need to do', 'what tasks are left', 'what havent i finished',
      'what haven\'t i finished', 'what activities are pending', 'what do i need to complete by now',
      'what do i need to do today', 'have i finished',
      'have i completed', 'did i finish', 'did i complete', 'did i eat', 'did i take',
      'is lunch done', 'is walk done', 'is medicine done', 'what is remaining for today',
      'aaj ke kya kaam', 'aaj ki dincharya', 'aaj kya karna hai', 'আজকে কি কাজ বাকি',
      'আজকের কাজ'
    ]) || (
      matchesAny(['tasks', 'task', 'activities', 'activity', 'schedule', 'day']) &&
      matchesAny(['complete', 'finish', 'pending', 'left', 'remaining', 'do', 'what', 'which', 'status', 'by now'])
    )
  );

  if (isMyDayQuery) {
    const entities = ['lunch', 'dinner', 'breakfast', 'walk', 'walking', 'medicine', 'medication', 'water', 'exercise', 'tea'];
    const matchedEntity = entities.find(e => norm.includes(e));

    if (matchedEntity) {
      const schedItem = schedule.find((s: any) => (s.title || '').toLowerCase().includes(matchedEntity));
      const remItem = reminders.find((r: any) => ((r.title || '') + ' ' + (r.category || '')).toLowerCase().includes(matchedEntity));
      const foundItem = schedItem || remItem;

      if (foundItem) {
        const isDone = schedItem ? schedItem.completed : (remItem ? remItem.status === 'Completed' : false);
        const title = foundItem.title || matchedEntity;

        if (isDone) {
          return {
            intent: 'MY_DAY_QUERY',
            path: '/day',
            response: getLangStr({
              English: `Yes, your ${title} activity is marked as completed today.`,
              Hindi: `हाँ, आपकी ${title} गतिविधि आज पूर्ण चिह्नित है।`,
              Bengali: `হ্যাঁ, আপনার ${title} কাজ আজ সম্পন্ন চিহ্নিত করা হয়েছে।`,
              Assamese: `হয়, আপোনাৰ ${title} কামটো আজি সম্পূৰ্ণ কৰা বুলি চিহ্নিত কৰা হৈছে।`,
              Manipuri: `হোয়, নহাক্কী ${title} থবক অসি ঙসি লোইখ্রে হায়না খনৌরে।`,
              Khasi: `Hooid, ka kam ${title} jong phi la buh kum kaba la dep mynta ka sngi.`,
              Mizo: `Aw, i ${title} tih tur hi vawiin hian zawh tawh anga chhinchhiah a ni.`,
              Nagamese: `Hobi, apuni laga ${title} activity toh aji complete hoikena ase.`,
              Tripuri: `Hobei, nini ${title} activity toh aji complete hoikena tongkha.`
            })
          };
        } else {
          return {
            intent: 'MY_DAY_QUERY',
            path: '/day',
            response: getLangStr({
              English: `No, your ${title} activity is still pending for today.`,
              Hindi: `नहीं, आपकी ${title} गतिविधि आज अभी भी लंबित है।`,
              Bengali: `না, আপনার ${title} কাজ আজ এখনও বাকি রয়েছে।`,
              Assamese: `নহয়, আপোনাৰ ${title} কামটো আজি এতিয়াও বাকী আছে।`,
              Manipuri: `নত্তে, নহাক্কী ${title} থবক অসি ঙসি হージュিকফাওবা লোইদ্রি।`,
              Khasi: `Em, ka kam ${title} jong phi ka sah dang buhrieh mynta ka sngi.`,
              Mizo: `Thih lo, i ${title} tih tur hi vawiin atan a la bak a ni.`,
              Nagamese: `Nai, apuni laga ${title} activity toh aji baki ase.`,
              Tripuri: `Nai, nini ${title} activity toh aji baki tongkha.`
            })
          };
        }
      }
    }

    const pendingSched = schedule.filter((s: any) => !s.completed);
    const completedSched = schedule.filter((s: any) => s.completed);

    const pendingTitles = pendingSched.map((s: any) => s.title).join(', ');
    const completedTitles = completedSched.map((s: any) => s.title).join(', ');

    let taskBreakdownMsg: Record<string, string>;

    if (pendingSched.length > 0) {
      taskBreakdownMsg = {
        English: `Of course. You still have ${pendingSched.length} task${pendingSched.length > 1 ? 's' : ''} to complete today: ${pendingTitles}.${completedSched.length > 0 ? ` Completed tasks: ${completedTitles}.` : ''}`,
        Hindi: `जी बिल्कुल। आपके आज ${pendingSched.length} कार्य बाकी हैं: ${pendingTitles}।${completedSched.length > 0 ? ` पूरे किए गए कार्य: ${completedTitles}।` : ''}`,
        Bengali: `অবশ্যই। আজ আপনার ${pendingSched.length}টি কাজ বাকি রয়েছে: ${pendingTitles}।${completedSched.length > 0 ? ` সম্পন্ন কাজ: ${completedTitles}।` : ''}`,
        Assamese: `নিশ্চয়ই। আজি আপোনাৰ ${pendingSched.length}টা কাম বাকী আছে: ${pendingTitles}।`,
        Manipuri: `হোয়, ঙসি নহাক্কী থবক ${pendingSched.length} লোইদনা লৈরি: ${pendingTitles}।`,
        Khasi: `Hooid. Phi don ${pendingSched.length} ki kam kiba dang sah mynta ka sngi: ${pendingTitles}.`,
        Mizo: `Aw le. Vawiinatan hnathawh tur ${pendingSched.length} i la nei e: ${pendingTitles}.`,
        Nagamese: `Hobi. Aji apuni laga ${pendingSched.length} activity baki ase: ${pendingTitles}.`,
        Tripuri: `Hobei. Nini aji ${pendingSched.length} activity baki tongkha: ${pendingTitles}.`
      };
    } else {
      taskBreakdownMsg = {
        English: "All your activities for today are completed! You have no remaining tasks.",
        Hindi: "आज की आपकी सभी गतिविधियाँ पूरी हो चुकी हैं! आपका कोई भी कार्य बाकी नहीं है।",
        Bengali: "আজকের আপনার সব কাজ সম্পন্ন হয়েছে! আপনার কোনো বাকি কাজ নেই।",
        Assamese: "আজিৰ আপোনাৰ সকলো কাম সম্পূৰ্ণ হ’ল!",
        Manipuri: "ঙসিগী নহাক্কী থবক পুম্নমক লোইশিনখ্রে!",
        Khasi: "Ki kam baroh jong phi ha ka sngi la pyndep!",
        Mizo: "Vawiin a i hnathawh tur zawng zawng i ti zo tawh e!",
        Nagamese: "Aji laga apuni laga sob activity complete hoise!",
        Tripuri: "Nini aji sob activity complete hoikena tongkha!"
      };
    }

    return {
      intent: 'MY_DAY_QUERY',
      path: '/day',
      response: getLangStr(taskBreakdownMsg)
    };
  }

  // =========================================================================
  // 8. MEMORIES SECTION & PHOTO MEMORIES
  // =========================================================================
  const isMemorySectionQuery = (
    matchesAny([
      'favorite memory', 'best memory', 'family memory', 'birthday memory',
      'about memory', 'about memories', 'show memory', 'show memories',
      'show me my memories', 'open my memories', 'take me to my memories',
      'yaadein dikhao', 'yaad batao', 'স্মৃতি বলুন', 'স্মৃতি ব্যাখ্যা', 'স্মৃতি দেখাও'
    ]) || (
      matchesAny(['memories', 'memory', 'yaad', 'yaaden', 'স্মৃতি', 'মেমরি']) &&
      matchesAny(['show', 'open', 'take me', 'view', 'favorite', 'family', 'birthday', 'picnic', 'photo', 'photos'])
    )
  );

  if (isMemorySectionQuery) {
    const isNavReq = matchesAny(['open', 'go to', 'take me to', 'kholo', 'chalo', 'dikhao', 'show']);

    if (memories.length === 0) {
      return {
        intent: isNavReq ? 'OPEN_MEMORIES' : 'MEMORY_QUERY',
        path: '/memories',
        response: getLangStr({
          English: "You haven't saved any memories in your collection yet. You can add photos and special moments on the Memories page.",
          Hindi: "आपने अभी तक अपनी मेमोरीज़ संग्रह में कोई यादें नहीं सहेजी हैं।",
          Bengali: "আপনি এখনও আপনার স্মৃতি সংগ্রহে কোনো স্মৃতি সংরক্ষণ করেননি।",
          Assamese: "আপুনি এতিয়ালৈকে কোনো স্মৃতি সংৰক্ষণ কৰা নাই।",
          Manipuri: "নহাক্না হージュিকফাওবা মেমোরী ফোল্ডারদা মেমোরী হাপতদ্রি।",
          Khasi: "Phi khlem pat buh jingkynmaw ha ka jinglum jong phi.",
          Mizo: "Hriatrengna i la vawng miah lo.",
          Nagamese: "Apuni aji tak kunuba memory save kura nai.",
          Tripuri: "Nini khapang te choki chhengla memory tongya."
        })
      };
    }

    let targetMem: any = null;
    if (matchesAny(['favorite', 'best', 'top', 'pyaari', 'pria', 'पसंदीदा', 'পছন্দের'])) {
      targetMem = memories.find((m: any) => m.category === 'Favorites' || m.isFavorite) || memories[0];
    } else {
      const keywords = ['family', 'birthday', 'picnic', 'wedding', 'trip', 'park', 'children', 'daughter', 'son', 'house', 'diwali', 'puja', 'festival', 'holiday'];
      const matchedKeyword = keywords.find(k => norm.includes(k));
      if (matchedKeyword) {
        targetMem = memories.find((m: any) =>
          (m.title + ' ' + (m.description || '') + ' ' + (m.people || '') + ' ' + (m.category || '')).toLowerCase().includes(matchedKeyword)
        );
      }
    }
    if (!targetMem) targetMem = memories[0];

    const memTitle = targetMem.title || 'Special Moment';
    const memDesc = targetMem.description || '';
    const memPeople = targetMem.people || '';

    let explanation = `I found your memory titled "${memTitle}". ${memDesc ? memDesc + '.' : 'It records a meaningful moment.'} ${memPeople ? 'With ' + memPeople + '.' : ''}`;
    if (lang === 'Hindi') {
      explanation = `मुझे आपकी याद मिली: "${memTitle}"। ${memDesc ? memDesc + '।' : 'यह एक विशेष पल है।'} ${memPeople ? 'साथ में: ' + memPeople + '।' : ''}`;
    } else if (lang === 'Bengali') {
      explanation = `আমি আপনার স্মৃতি পেয়েছি: "${memTitle}"। ${memDesc ? memDesc + '।' : 'এটি একটি বিশেষ মুহূর্ত।'} ${memPeople ? 'সাথে: ' + memPeople + '।' : ''}`;
    } else if (lang === 'Assamese') {
      explanation = `মই আপোনাৰ স্মৃতি পালোঁ: "${memTitle}"। ${memDesc ? memDesc + '।' : 'ই এটা বিশেষ মুহূৰ্ত।'} ${memPeople ? 'লগত: ' + memPeople + '।' : ''}`;
    }

    if (isNavReq) {
      explanation = (lang === 'Hindi' ? 'आपकी यादें खोली जा रही हैं। ' : lang === 'Bengali' ? 'আপনার স্মৃতিগুলি খোলা হচ্ছে। ' : 'Opening your memories. ') + explanation;
    }

    return {
      intent: isNavReq ? 'OPEN_MEMORIES' : 'MEMORY_QUERY',
      path: '/memories',
      response: explanation,
      memoryData: targetMem,
      selectedMemoryId: targetMem.id
    };
  }

  // =========================================================================
  // 9. REMINDER QUERY (INFORMATION)
  // =========================================================================
  const isReminderQuery = matchesAny([
    'what reminders do i have', 'when is my next reminder', 'which reminders are pending',
    'show my reminders', 'my medicine reminders', 'what reminders', 'reminder schedule',
    'upcoming reminders'
  ]);

  if (isReminderQuery) {
    const upcomingRems = reminders.filter((r: any) => r.status !== 'Completed');
    let remMsg: Record<string, string>;

    if (upcomingRems.length > 0) {
      const titles = upcomingRems.map((r: any) => `${r.title} at ${r.time}`).join(', ');
      remMsg = {
        English: `You have ${upcomingRems.length} upcoming reminder${upcomingRems.length > 1 ? 's' : ''}: ${titles}.`,
        Hindi: `आपके पास ${upcomingRems.length} आगामी रिमाइंडर हैं: ${titles}।`,
        Bengali: `আপনার ${upcomingRems.length}টি আসন্ন অনুস্মারক রয়েছে: ${titles}।`,
        Assamese: `আপোনাৰ ${upcomingRems.length} টা বাকী থকা ৰিমাইণ্ডাৰ আছে: ${titles}।`,
        Manipuri: `নহাক্কী অহা রিমাঈন্ডর ${upcomingRems.length} লৈরি: ${titles}।`,
        Khasi: `Phi don ${upcomingRems.length} ki reminder: ${titles}.`,
        Mizo: `Hriattirna ${upcomingRems.length} i nei e: ${titles}.`,
        Nagamese: `Apuni laga ${upcomingRems.length} reminder ase: ${titles}.`,
        Tripuri: `Nini ${upcomingRems.length} reminder tongkha: ${titles}.`
      };
    } else {
      remMsg = {
        English: "You don't have any pending reminders scheduled for today.",
        Hindi: "आपके पास आज के लिए कोई लंबित रिमाइंडर नहीं है।",
        Bengali: "আজকের জন্য আপনার কোনো বাকি অনুস্মারক নেই।",
        Assamese: "আজিৰ বাবে আপোনাৰ কোনো ৰিমাইণ্ডাৰ বাকী নাই।",
        Manipuri: "ঙসিগী রিমাঈন্ডর লৈতাদ্রে।",
        Khasi: "Khlem don reminder mynta ka sngi.",
        Mizo: "Vawiin atan hriattirna a awm lo e.",
        Nagamese: "Aji baki reminder nai.",
        Tripuri: "Aji baki reminder tongya."
      };
    }

    return {
      intent: 'REMINDER_QUERY',
      path: '/reminders',
      response: getLangStr(remMsg)
    };
  }

  return null;
}

function parseDeterministicCommand(
  clean: string,
  currentLang: string,
  contextData: any = {},
  _voiceContext: any = null
): any | null {
  const profile = contextData.profile || {};
  const userName = profile.name || 'Ravi';
  const userAge = profile.age || 78;
  const caregiverName = profile.caregiverName || 'Anu';
  const language = currentLang || 'English';

  const reminders = contextData.reminders || [];
  const schedule = contextData.schedule || [];
  const memories = contextData.memories || [];

  // 1. Clean and normalize punctuation, duplicated whitespace
  let norm = clean.toLowerCase().trim();
  norm = norm.replace(/\s+/g, ' ');

  // 2. Duplicated word normalization
  const words = norm.split(' ');
  const dedupedWords = [];
  for (let i = 0; i < words.length; i++) {
    if (i === 0 || words[i] !== words[i - 1]) {
      dedupedWords.push(words[i]);
    }
  }
  norm = dedupedWords.join(' ');

  // --- STT / FILLER WORDS REMOVAL FOR CORE SEMANTIC EXTRACTION ---
  const fillers = [
    'please', 'can you', 'could you', 'would you', 'i want to', 'i need to',
    'i would like to', 'tell me', 'show me', 'take me', 'help me',
    'actually', 'basically', 'just', 'for me', 'if you can', 'i want',
    'id like', 'mere', 'meri', 'mera', 'aaj ka', 'aaj ki', 'aaj ke', 'mujhe',
    'kripya', 'k', 'to the', 'the', 'go to', 'open', 'start', 'play', 'kholo',
    'dikhao', 'dekhao', 'dikhaye', 'chalao', 'shuru', 'karo', 'joma'
  ];
  let semanticCore = norm;
  fillers.forEach(f => {
    semanticCore = semanticCore.replace(new RegExp('\\b' + f + '\\b', 'g'), '');
  });
  semanticCore = semanticCore.replace(/\s+/g, ' ').trim();

  // --- RUN PATIENT AI QUERY RESOLVER FIRST ---
  const aiResolved = patientAIQueryResolver(norm, semanticCore, language, {
    profile: profile || storageService.getCurrentUser(),
    reminders: reminders.length > 0 ? reminders : storageService.getReminders(),
    schedule: schedule.length > 0 ? schedule : storageService.getSchedule(),
    memories: memories.length > 0 ? memories : storageService.getMemories(),
    games: contextData.games || storageService.getGames()
  });
  if (aiResolved) return aiResolved;

  // --- SYNONYM RESOLUTION HELPER ---
  const matchesAny = (str: string, keywords: string[]): boolean => {
    return keywords.some((k: string) => str.includes(k));
  };

  // --- ENTITY KEYWORDS ---
  const memoriesKeys = ['memories', 'memory', 'photo', 'photos', 'yaad', 'yaaden', 'yaadein', 'yaado', 'smriti', 'মেমরি', 'স্মৃতি', 'ছবি', 'यादें', 'याद', 'फोटो'];
  const remindersKeys = ['reminder', 'reminders', 'alarm', 'med', 'meds', 'medicine', 'medicines', 'pill', 'pills', 'tablet', 'tablets', 'dawa', 'dawaein', 'goli', 'alaram', 'ওষুধ', 'অনুস্মারক', 'रिमाइंडर', 'दवा', 'अलार्म'];
  const scheduleKeys = ['activities', 'activity', 'schedule', 'my day', 'dincharya', 'din charya', 'aaj ka plan', 'রুটিন', 'সময়সূচী', 'আজ কি বার', 'কয়টা বাজে', 'दिनचर्या', 'शेड्यूल', 'गतिविधि', 'काम', 'kya karna hai', 'aaj ke kaam', 'aaj ka task'];
  const gamesKeys = ['brain games', 'brain game', 'games', 'game', 'khel', 'গেম', 'গ্যাম', 'गेम', 'खेल', 'गेम्स', 'ब्रेन गेम', 'ब्रेन गेम्स', 'খেলা'];
  const settingsKeys = ['settings', 'setting', 'profile', 'account', 'सेटिंग', 'प्रोफाइल', 'सेटिंग्स', 'अकाउंट', 'সেটিংস', 'প্রোফাইল'];
  const caregiverKeys = ['caregiver', 'dashboard', 'panel', 'anu', 'केयरगिवर', 'केयरगिवर डैशबोर्ड', 'কেয়ারগিভার', 'অনু'];
  const homeKeys = ['home', 'होम', 'घर'];
  const helpKeys = ['help', 'emergency', 'sos', 'मदद', 'सहायता', 'সাহায্য'];
  const backKeys = ['back', 'pichej', 'piche', 'peeche', 'phire', 'back jao'];

  // --- ACTION KEYWORDS ---
  const deleteKeys = ['delete', 'remove', 'cancel', 'clear', 'hatao', 'mitao', 'cancel', 'हटाओ', 'मिटाओ', 'মুছে', 'বাতিল'];
  const completeKeys = ['complete', 'done', 'finished', 'mark', 'pura', 'ho gaya', 'sesh', 'somponno', 'पूरा', 'हो गया', 'সম্পন্ন'];
  const createKeys = ['add', 'create', 'save', 'remember', 'new', 'set', 'jodo', 'likho', 'banao', 'joma', 'save memory', 'remind', 'schedule', 'जोड़ो', 'बनाओ', 'তৈरी', 'যুক্ত'];
  const searchKeys = ['find', 'search', 'khojo', 'dhoondo', 'look up', 'खोजो', 'ढूँढो', 'খুঁজুন'];

  // --- 1. PERSONAL INFORMATION & GENERAL CONVERSATION QUERIES ---
  if (matchesAny(norm, ['my name', 'who am i', 'mera naam', 'আমার নাম', 'मेरा नाम'])) {
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' ? `आपका नाम ${userName} है।` : language === 'Bengali' ? `আপনার নাম ${userName}।` : `Your name is ${userName}.`
    };
  }

  if (matchesAny(norm, ['how old am i', 'my age', 'मेरी उम्र', 'मेरे उम्र', 'আমার বয়স'])) {
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' ? `आप ${userAge} साल के हैं।` : language === 'Bengali' ? `আপনার বয়স ${userAge} বছর।` : `You are ${userAge} years old.`
    };
  }

  if (matchesAny(norm, ['date of birth', 'my birthday', 'जन्म तिथि', 'जन्मदिन', 'জন্ম তারিখ'])) {
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' ? 'मेरे पास आपकी प्रोफ़ाइल में वह जानकारी नहीं है।' : language === 'Bengali' ? 'আপনার প্রোফাইলে আমার কাছে সেই তথ্য নেই।' : "I don't have that information in your profile."
    };
  }

  if (matchesAny(norm, ['profile information', 'profile details', 'प्रोफाइल जानकारी', 'প্রোফাইল তথ্য'])) {
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' 
        ? `आपका नाम ${userName} है। आप ${userAge} साल के हैं, और आपकी केयरगिवर ${caregiverName} हैं।` 
        : language === 'Bengali' 
        ? `আপনার নাম ${userName}। আপনার বয়স ${userAge} বছর, এবং আপনার কেয়ারগিভার ${caregiverName}।` 
        : `Your name is ${userName}. You are ${userAge} years old, and your caregiver is ${caregiverName}.`
    };
  }

  if (matchesAny(norm, ['what language am i using', 'what language is this', 'कौन सी भाषा', 'কোন ভাষা'])) {
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' ? `आप वर्तमान में हिंदी का उपयोग कर रहे हैं।` : language === 'Bengali' ? `আপনি বর্তমানে বাংলা ব্যবহার করছেন।` : `You are currently using ${language}.`
    };
  }

  if (matchesAny(norm, ['who is my caregiver', 'caregiver name', 'केयरगिवर कौन', 'কেয়ারগিভার কে'])) {
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' ? `आपकी केयरगिवर ${caregiverName} हैं।` : language === 'Bengali' ? `আপনার কেয়ারগিভার ${caregiverName}।` : `Your caregiver is ${caregiverName}.`
    };
  }

  // --- 2. DATE AND TIME QUERIES ---
  if (matchesAny(norm, ['today\'s date', 'date today', 'आज की तारीख', 'আজকের তারিখ'])) {
    const formattedDate = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' ? `आज की तारीख ${formattedDate} है।` : language === 'Bengali' ? `আজকের তারিখ ${formattedDate}।` : `Today's date is ${formattedDate}.`
    };
  }

  if (matchesAny(norm, ['what day is it', 'day today', 'आज कौन सा दिन', 'আজ কি বার'])) {
    const dayName = new Date().toLocaleDateString(undefined, { weekday: 'long' });
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' ? `आज ${dayName} है।` : language === 'Bengali' ? `আজ ${dayName}।` : `Today is ${dayName}.`
    };
  }

  if (matchesAny(norm, ['what time is it', 'time now', 'क्या समय हुआ', 'কয়টা বাজে'])) {
    const timeVal = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' ? `अभी ${timeVal} बजे हैं।` : language === 'Bengali' ? `এখন সময় ${timeVal}।` : `The current time is ${timeVal}.`
    };
  }

  // --- 3. BACK NAVIGATION ---
  if (matchesAny(norm, backKeys) || norm === 'back') {
    return {
      intent: 'NAVIGATION',
      path: '-1',
      response: language === 'Hindi' ? 'पीछे जा रहे हैं।' : language === 'Bengali' ? 'পিছনে ফিরে যাওয়া হচ্ছে।' : 'Going back.'
    };
  }

  // --- 4. DATA-DEPENDENT SUMMARIES ---
  if (matchesAny(norm, ['completed today', 'tasks done', 'what did i complete', 'क्या पूरा किया', 'আজকে কি সম্পন্ন'])) {
    const completedRems = reminders.filter((r: any) => r.status === 'Completed').map((r: any) => r.title);
    const completedActs = schedule.filter((s: any) => s.completed).map((s: any) => s.title);
    const allCompleted = [...completedRems, ...completedActs];
    if (allCompleted.length === 0) {
      return {
        intent: 'CONVERSATION',
        response: language === 'Hindi' ? 'आपने आज अभी तक कोई कार्य पूरा नहीं किया है।' : language === 'Bengali' ? 'আপনি আজ এখনও পর্যন্ত কোনো কাজ সম্পন্ন করেননি।' : 'You haven\'t completed any tasks yet today.'
      };
    }
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' 
        ? `आज आपने ये कार्य पूरे किए हैं: ${allCompleted.join(', ')}।` 
        : language === 'Bengali' 
        ? `আজকে আপনি এই কাজগুলি সম্পন্ন করেছেন: ${allCompleted.join(', ')}।` 
        : `Today you have completed: ${allCompleted.join(', ')}.`
    };
  }

  if (matchesAny(norm, ['pending', 'tasks remaining', 'what is left', 'बाकी कार्य', 'বাকি কাজ'])) {
    const pendingRems = reminders.filter((r: any) => r.status === 'Upcoming' || r.status === 'Scheduled').map((r: any) => r.title);
    const pendingActs = schedule.filter((s: any) => !s.completed).map((s: any) => s.title);
    const allPending = [...pendingRems, ...pendingActs];
    if (allPending.length === 0) {
      return {
        intent: 'CONVERSATION',
        response: language === 'Hindi' ? 'आज आपके लिए कोई लंबित कार्य नहीं हैं।' : language === 'Bengali' ? 'আজ আপনার কোনো কাজ বাকি নেই।' : 'You have no pending tasks today.'
      };
    }
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' 
        ? `आपके लंबित कार्य हैं: ${allPending.join(', ')}।` 
        : language === 'Bengali' 
        ? `আপনার বাকি কাজগুলি হলো: ${allPending.join(', ')}।` 
        : `Your pending tasks are: ${allPending.join(', ')}.`
    };
  }

  if (matchesAny(norm, ['planned today', 'schedule today', 'do today', 'activities today', 'reminders today', 'daily summary', 'आज क्या', 'आज क्या करना है', 'আজকের সময়সূচী', 'what do i have to do', 'what do i do', 'aaj mujhe kya karna hai', 'aaj kya karna hai', 'mujhe aaj kya karna hai', 'today what do i', 'what should i do today'])) {
    const todayRems = reminders.map((r: any) => `${r.title} (&r.time)`).map((s: string) => s.replace('&', '$'));
    const todayActs = schedule.map((s: any) => `${s.title} (&s.time)`).map((s: string) => s.replace('&', '$'));
    const allItems = [...todayRems, ...todayActs];
    if (allItems.length === 0) {
      return {
        intent: 'CONVERSATION',
        response: language === 'Hindi' ? 'आज आपके शेड्यूल में कुछ भी नहीं है।' : language === 'Bengali' ? 'আজ আপনার সময়সূচীতে কিছু নেই।' : 'You have nothing scheduled for today.'
      };
    }
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' 
        ? `आज आपके पास ये गतिविधियाँ हैं: ${allItems.join(', ')}।` 
        : language === 'Bengali' 
        ? `আজ আপনার এই কাজগুলি রয়েছে: ${allItems.join(', ')}।` 
        : `Today you have: ${allItems.join(', ')}.`
    };
  }

  if (matchesAny(norm, ['need to remember today', 'daily plan', 'आज का प्लान', 'আজকের পরিকল্পনা'])) {
    const todayRems = reminders.map((r: any) => `${r.title} (&r.time)`).map((s: string) => s.replace('&', '$'));
    if (todayRems.length === 0) {
      return {
        intent: 'CONVERSATION',
        response: language === 'Hindi' ? 'आज आपको याद रखने के लिए कोई रिमाइंडर नहीं हैं।' : language === 'Bengali' ? 'আজ আপনার মনে রাখার মতো কোনো অনুস্মারক নেই।' : 'You have no reminders to remember today.'
      };
    }
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' 
        ? `आज आपको ये बातें याद रखनी हैं: ${todayRems.join(', ')}।` 
        : language === 'Bengali' 
        ? `আজ আপনাকে এই বিষয়গুলি মনে রাখতে হবে: ${todayRems.join(', ')}।` 
        : `Today you need to remember: ${todayRems.join(', ')}.`
    };
  }

  if (matchesAny(norm, ['next reminder', 'current reminder', 'coming up next', 'what should i do next', 'अगला रिमाइंडर', 'এরপর কি'])) {
    const upcoming = reminders.filter((r: any) => r.status === 'Upcoming' || r.status === 'Scheduled');
    if (upcoming.length === 0) {
      return {
        intent: 'CONVERSATION',
        response: language === 'Hindi' ? 'आपके पास कोई आगामी रिमाइंडर नहीं है।' : language === 'Bengali' ? 'আপনার কোনো অনুস্মারক নেই।' : 'You have no upcoming reminders today.'
      };
    }
    upcoming.sort((a: any, b: any) => a.time.localeCompare(b.time));
    const nextRem = upcoming[0];
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' 
        ? `आपका अगला रिमाइंडर है: ${nextRem.title} ${nextRem.time} बजे।` 
        : language === 'Bengali' 
        ? `আপনার পরবর্তী অনুস্মারক হলো: ${nextRem.title} ${nextRem.time} টায়।` 
        : `Your next reminder is: ${nextRem.title} at ${nextRem.time}.`
    };
  }

  // --- 5. ENTITY-BASED ROUTING ---

  // Helper to resolve entity IDs for updates/deletes/completions
  const resolveEntityId = (type: 'memory' | 'reminder' | 'activity'): string | null => {
    const list = type === 'memory' ? memories : type === 'reminder' ? reminders : schedule;
    let topic = norm
      .replace(/delete|remove|cancel|clear|complete|done|finished|mark|hatao|mitao|pura|khatam|sesh/g, '')
      .replace(/memory|memories|reminder|reminders|activity|activities|schedule|alarm/g, '')
      .replace(/about|my|meri|mere|mera|apna|apni|the/g, '')
      .trim();
    if (!topic) return list.length > 0 ? list[0].id : null;
    const found = list.find((item: any) => {
      const title = (item.title || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return title.includes(topic) || topic.includes(title) || desc.includes(topic);
    });
    return found ? found.id : (list.length > 0 ? list[0].id : null);
  };

  // Category: HELP
  if (matchesAny(norm, helpKeys) || semanticCore === 'help' || semanticCore === 'sos') {
    return { intent: 'OPEN_HELP', path: '/help', response: language === 'Hindi' ? 'आपातकालीन संपर्क खोले जा रहे हैं।' : language === 'Bengali' ? 'জরুরী যোগাযোগ খোলা হচ্ছে।' : 'Opening emergency contacts.' };
  }

  // Category: HOME
  if (matchesAny(norm, homeKeys) || semanticCore === 'home') {
    return { intent: 'OPEN_HOME', path: '/', response: language === 'Hindi' ? 'होम स्क्रीन पर जा रहे हैं।' : language === 'Bengali' ? 'হোম স্ক্রিনে ফিরে যাওয়া হচ্ছে।' : 'Going home.' };
  }

  // Category: CAREGIVER
  if (matchesAny(norm, caregiverKeys) || semanticCore === 'caregiver' || semanticCore === 'caregiver dashboard') {
    return { intent: 'OPEN_CAREGIVER', path: '/caregiver', response: language === 'Hindi' ? 'केयरगिवर डैशबोर्ड खोला जा रहा है।' : language === 'Bengali' ? 'কেয়ারগিভার ড্যাশবোর্ড খোলা হচ্ছে।' : 'Opening caregiver dashboard.' };
  }

  // Category: SETTINGS / PROFILE
  if (matchesAny(norm, settingsKeys) || semanticCore === 'settings' || semanticCore === 'profile') {
    return { intent: 'OPEN_SETTINGS', path: '/settings', response: language === 'Hindi' ? 'सेटिंग्स खोली जा रही हैं।' : language === 'Bengali' ? 'সেটিংস খোলা হচ্ছে।' : 'Opening settings.' };
  }

  // Category: BRAIN GAMES
  if (matchesAny(norm, gamesKeys)) {
    if (matchesAny(norm, ['why', 'how do', 'about games'])) return null;

    // Check specific games
    if (matchesAny(norm, ['memory match', 'match game', 'match memory', 'memory matching', 'matching game'])) {
      return { intent: 'OPEN_MEMORY_MATCH', gameId: 'game-1', path: '/games', response: language === 'Hindi' ? 'मेमोरी मैच शुरू किया जा रहा है।' : language === 'Bengali' ? 'মেমরি ম্যাচ শুরু করা হচ্ছে।' : 'Starting Memory Match.' };
    }
    if (matchesAny(norm, ['sequence', 'order', 'sequence order', 'sequence game'])) {
      return { intent: 'PLAY_GAME', gameId: 'game-2', path: '/games', response: language === 'Hindi' ? 'सीक्वेंस और ऑर्डर शुरू किया जा रहा है।' : language === 'Bengali' ? 'সিকোয়েন্স অ্যান্ড অর্ডার শুরু করা হচ্ছে।' : 'Starting Sequence & Order.' };
    }
    if (matchesAny(norm, ['attention', 'focus', 'attention focus', 'attention game'])) {
      return { intent: 'OPEN_ATTENTION_FOCUS', gameId: 'game-3', path: '/games', response: language === 'Hindi' ? 'अटेंशन फोकस शुरू किया जा रहा है।' : language === 'Bengali' ? 'অ্যাটেনশন ফোকাস শুরু করা হচ্ছে।' : 'Starting Attention Focus.' };
    }
    if (matchesAny(norm, ['object', 'recognize', 'recognition', 'object game'])) {
      return { intent: 'OPEN_OBJECT_RECOGNITION', gameId: 'game-4', path: '/games', response: language === 'Hindi' ? 'ऑब्जेक्ट रिकग्निशन शुरू किया जा रहा है।' : language === 'Bengali' ? 'অবজেক্ট রিকগনিশন শুরু করা হচ্ছে।' : 'Starting Object Recognition.' };
    }
    if (matchesAny(norm, ['routine', 'recall', 'routine recall', 'routine game'])) {
      return { intent: 'OPEN_DAILY_ROUTINE', gameId: 'game-5', path: '/games', response: language === 'Hindi' ? 'डेली रूटीन रिकॉल शुरू किया जा रहा है।' : language === 'Bengali' ? 'ডেইলি রুটিন রিকল শুরু করা হচ্ছে।' : 'Starting Daily Routine Recall.' };
    }
    if (matchesAny(norm, ['language', 'word', 'vocabulary', 'word memory'])) {
      return { intent: 'OPEN_LANGUAGE_MEMORY', gameId: 'game-6', path: '/games', response: language === 'Hindi' ? 'लैंग्वेज वर्ड मेमोरी शुरू किया जा रहा है।' : language === 'Bengali' ? 'ল্যাঙ্গুয়েজ ওয়ার্ড মেমোরি শুরু করা হচ্ছে।' : 'Starting Language Word Memory.' };
    }
    return { intent: 'OPEN_BRAIN_GAMES', path: '/games', response: language === 'Hindi' ? 'दिमागी खेल खोले जा रहे हैं।' : language === 'Bengali' ? 'দিমাগি খেলা খোলা হচ্ছে।' : 'Opening brain games.' };
  }

  // Category: MEMORIES
  if (matchesAny(norm, memoriesKeys)) {
    if (matchesAny(norm, ['why', 'how do', 'about memories'])) return null;

    if (matchesAny(norm, deleteKeys)) {
      return {
        intent: 'DELETE_MEMORY',
        parameters: { entityId: resolveEntityId('memory'), confirmed: false },
        response: language === 'Hindi' ? 'क्या आप वाकई इस याद को हटाना चाहते हैं?' : language === 'Bengali' ? 'আপনি কি সত্যিই এই স্মৃতিটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this memory?'
      };
    }
    if (matchesAny(norm, createKeys)) {
      return {
        intent: 'CREATE_MEMORY',
        response: language === 'Hindi' ? 'ज़रूर। आप क्या याद रखना चाहेंगे?' : language === 'Bengali' ? 'নিশ্চয়ই। আপনি কী মনে রাখতে চান?' : 'Sure. What would you like me to remember?'
      };
    }
    if (matchesAny(norm, searchKeys)) {
      const topic = norm.replace(/find|search|khojo|dhoondo|look up|memory|memories|about|my/g, '').trim();
      if (topic) {
        const found = memories.find((m: any) => m.title.toLowerCase().includes(topic) || m.description.toLowerCase().includes(topic));
        if (found) {
          return {
            intent: 'CONVERSATION',
            response: language === 'Hindi' 
              ? `मुझे आपकी याद मिली: "${found.title}"। विवरण: "${found.description}"।` 
              : language === 'Bengali' 
              ? `আমি স্মৃতিটি পেয়েছি: "${found.title}"। বিবরণ: "${found.description}"।` 
              : `I found a memory: "${found.title}". Description: "${found.description}".`
          };
        }
      }
      return {
        intent: 'CONVERSATION',
        response: language === 'Hindi' ? 'मुझे उस विषय के बारे में कोई याद नहीं मिली।' : language === 'Bengali' ? 'আমি সেই বিষয়ে কোনো স্মৃতি খুঁজে পাইনি।' : 'I couldn\'t find any memory about that topic.'
      };
    }
    return { intent: 'OPEN_MEMORIES', path: '/memories', response: language === 'Hindi' ? 'आपकी यादें खोली जा रही हैं।' : language === 'Bengali' ? 'আপনার স্মৃতিগুলি খোলা হচ্ছে।' : 'Opening your memories.' };
  }

  // Category: REMINDERS
  if (matchesAny(norm, remindersKeys)) {
    if (matchesAny(norm, ['why', 'how do', 'about reminders'])) return null;
    if (matchesAny(norm, createKeys)) return null;

    if (matchesAny(norm, deleteKeys)) {
      return {
        intent: 'DELETE_REMINDER',
        parameters: { entityId: resolveEntityId('reminder'), confirmed: false },
        response: language === 'Hindi' ? 'क्या आप वाकई इस रिमाइंडर को हटाना चाहते हैं?' : language === 'Bengali' ? 'আপনি কি সত্যিই এই অনুস্মারকটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this reminder?'
      };
    }
    if (matchesAny(norm, completeKeys)) {
      return {
        intent: 'COMPLETE_REMINDER',
        parameters: { entityId: resolveEntityId('reminder') },
        response: language === 'Hindi' ? 'रिमाइंडर पूरा हो गया है।' : language === 'Bengali' ? 'অনুস্মারক সম্পন্ন হয়েছে।' : 'Reminder completed.'
      };
    }
    return { intent: 'OPEN_REMINDERS', path: '/reminders', response: language === 'Hindi' ? 'रिमाइंडर खोले जा रहे हैं।' : language === 'Bengali' ? 'অনুস্মারক খোলা হচ্ছে।' : 'Opening reminders.' };
  }

  // Category: ACTIVITIES / SCHEDULE
  if (matchesAny(norm, scheduleKeys)) {
    if (matchesAny(norm, ['why', 'how do', 'about activities', 'about schedule'])) return null;
    if (matchesAny(norm, createKeys)) return null;

    if (matchesAny(norm, deleteKeys)) {
      return {
        intent: 'DELETE_ACTIVITY',
        parameters: { entityId: resolveEntityId('activity'), confirmed: false },
        response: language === 'Hindi' ? 'क्या आप वाकई इस गतिविधि को हटाना चाहते हैं?' : language === 'Bengali' ? 'আপনি কি সত্যিই এই কাজটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this activity?'
      };
    }
    if (matchesAny(norm, completeKeys)) {
      return {
        intent: 'COMPLETE_ACTIVITY',
        parameters: { entityId: resolveEntityId('activity') },
        response: language === 'Hindi' ? 'गतिविधि पूरी हो गई है।' : language === 'Bengali' ? 'কাজটি সম্পন্ন হয়েছে।' : 'Activity completed.'
      };
    }
    return { intent: 'OPEN_MY_DAY', path: '/day', response: language === 'Hindi' ? 'आज की दिनचर्या खोली जा रही है।' : language === 'Bengali' ? 'দৈনিক সময়সূচী খোলা হচ্ছে।' : 'Opening daily schedule.' };
  }

  // --- 6. HELP COMMANDS ---
  if (matchesAny(norm, ['help me', 'what can you do', 'available features', 'how do i use', 'what commands', 'কী করতে পারো'])) {
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' 
        ? 'मैं आपकी मदद कर सकता हूँ: नेविगेट करने में, यादें सहेजने में, दवा या भोजन के रिमाइंडर जोड़ने में, और दिमागी खेल खेलने में।' 
        : language === 'Bengali' 
        ? 'আমি আপনাকে সাহায্য করতে পারি: নেভিগেট করতে, স্মৃতি সংরক্ষণ করতে, অনুস্মারক যোগ করতে এবং ব্রেন গেম খেলতে।' 
        : 'I can help you navigate the app, add memories, set reminders for medicine or meals, view your schedule, and play brain games.'
    };
  }

  if (matchesAny(norm, ['what are the brain games', 'tell me about the games', 'दिमागी खेल क्या', 'ব্রেন গেম কি কি'])) {
    return {
      intent: 'CONVERSATION',
      response: language === 'Hindi' 
        ? 'उपलब्ध दिमागी खेल हैं: मेमोरी मैच, सीक्वेंस और ऑर्डर, अटेंशन फोकस, ऑब्जेक्ट रिकग्निशन, और डेली रूटीन रीकॉल।' 
        : language === 'Bengali' 
        ? 'ব্রেন গেমগুলি হলো: মেমরি ম্যাচ, সিকোয়েন্স অ্যান্ড অর্ডার, অ্যাটেনশন ফোকাস, অবজেক্ট রিকগনিশন এবং ডেইলি रूटिन रिकल।' 
        : 'The available brain games are: Memory Match, Sequence & Order, Attention Focus, Object Recognition, and Daily Routine Recall.'
    };
  }

  // --- 7. VOICE ASSISTANT CONTROL & LOGS ---
  if (matchesAny(norm, ['repeat that', 'say that again', 'दोहराएं', 'আবার বলুন'])) {
    return {
      intent: 'REPEAT',
      response: ''
    };
  }

  if (matchesAny(norm, ['what did i just say', 'what did i say', 'मैंने क्या कहा', 'আমি কি বললাম'])) {
    return {
      intent: 'LAST_SPOKEN',
      response: ''
    };
  }

  return null;
}


export interface ParsedCommand {
  intent:
    | 'OPEN_MEMORIES'
    | 'OPEN_BRAIN_GAMES'
    | 'OPEN_REMINDERS'
    | 'OPEN_MY_DAY'
    | 'OPEN_HELP'
    | 'OPEN_SETTINGS'
    | 'OPEN_CAREGIVER'
    | 'OPEN_HOME'
    | 'OPEN_PEOPLE'
    | 'CHANGE_LANGUAGE'
    | 'CREATE_ACTIVITY'
    | 'ADD_ACTIVITY'
    | 'ADD_REMINDER'
    | 'PLAY_GAME'
    | 'OPEN_MEMORY_MATCH'
    | 'OPEN_ATTENTION_FOCUS'
    | 'OPEN_OBJECT_RECOGNITION'
    | 'OPEN_DAILY_ROUTINE'
    | 'OPEN_LANGUAGE_MEMORY'
    | 'SHOW_NEXT_ACTIVITY'
    | 'SHOW_TODAYS_SCHEDULE'
    | 'SHOW_REMINDERS'
    | 'CALL_CAREGIVER'
    | 'CANCEL'
    | 'HELP'
    | 'CONVERSATION'
    | 'CHECK_MEMORY_PROGRESS'
    | 'SHOW_FAVORITE_MEMORY'
    | 'PLAN_DAY'
    | 'CALL_CONTACT'
    | 'UNKNOWN';
  path?: string;
  response: string;
  languageValue?: 'English' | 'Hindi' | 'Bengali' | 'Assamese' | 'Manipuri' | 'Khasi' | 'Mizo' | 'Nagamese' | 'Tripuri';
  gameId?: string;
  activityData?: {
    title: string;
    time: string;
    date: string;
    category: 'medicine' | 'hydration' | 'meals' | 'exercise' | 'appointments' | 'family' | 'rest' | 'brain_game' | 'other';
    createReminder: boolean;
    needClarification?: boolean;
    missingField?: 'title' | 'time';
  };
}

export const parseCommandTime = (text: string): string | null => {
  const clean = text.toLowerCase();
  const match = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|बजे|pm\b|am\b)?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3] ? match[3].toLowerCase() : null;

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    if (!ampm) {
      if ((clean.includes('evening') || clean.includes('night') || clean.includes('शाम') || clean.includes('रात') || clean.includes('বিকেল')) && hours < 12) {
        hours += 12;
      }
      if ((clean.includes('afternoon') || clean.includes('dopahar') || clean.includes('দুপুর')) && hours < 12 && hours >= 1 && hours <= 5) {
        hours += 12;
      }
    }

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }
  return null;
};

const extractActivityDetails = (text: string): { title: string; category: 'medicine' | 'hydration' | 'meals' | 'exercise' | 'appointments' | 'family' | 'rest' | 'brain_game' | 'other' } => {
  const clean = text.toLowerCase();
  let title = '';
  let category: 'medicine' | 'hydration' | 'meals' | 'exercise' | 'appointments' | 'family' | 'rest' | 'brain_game' | 'other' = 'other';

  if (clean.includes('walk') || clean.includes('exercise') || clean.includes('yoga') || clean.includes('टहलने') || clean.includes('व्यायाम') || clean.includes('হাঁটা')) {
    title = 'Walk';
    category = 'exercise';
  } else if (clean.includes('medicine') || clean.includes('med') || clean.includes('pill') || clean.includes('tablet') || clean.includes('दवा') || clean.includes('औषध') || clean.includes('ওষুধ')) {
    title = 'Take Medicine';
    category = 'medicine';
  } else if (clean.includes('water') || clean.includes('drink') || clean.includes('hydrate') || clean.includes('पानी') || clean.includes('जल')) {
    title = 'Drink Water';
    category = 'hydration';
  } else if (clean.includes('dinner') || clean.includes('lunch') || clean.includes('breakfast') || clean.includes('eat') || clean.includes('meal') || clean.includes('खाना') || clean.includes('খাবার')) {
    if (clean.includes('dinner') || clean.includes('रात का खाना')) title = 'Dinner';
    else if (clean.includes('lunch') || clean.includes('दोपहर का खाना')) title = 'Lunch';
    else if (clean.includes('breakfast') || clean.includes('नाश्ता')) title = 'Breakfast';
    else title = 'Meals';
    category = 'meals';
  } else if (clean.includes('appointment') || clean.includes('doctor') || clean.includes('clinic') || clean.includes('डॉक्टर') || clean.includes('ডাক্তার')) {
    title = 'Doctor Appointment';
    category = 'appointments';
  } else if (clean.includes('call') || clean.includes('talk') || clean.includes('family') || clean.includes('phone') || clean.includes('बात')) {
    title = 'Call Family';
    category = 'family';
  }

  if (!title) {
    const removeKeywords = [
      'add a reminder for',
      'add a reminder to',
      'remind me to',
      'remind me about',
      'set a reminder for',
      'set a reminder to',
      'add a task for',
      'add reminder',
      'remind me',
      'schedule',
      'create',
      'please',
      'add',
      'for',
      'to',
      'at'
    ];
    let candidate = clean;
    removeKeywords.forEach(kw => {
      candidate = candidate.replace(new RegExp('\\b' + kw + '\\b', 'g'), '');
    });
    candidate = candidate.replace(/\b\d+(\s*(pm|am|बजे|hours|minutes))?\b/g, '');
    candidate = candidate.replace(/\b(tomorrow|today|tomorrow's|today's|morning|evening|afternoon|night)\b/g, '');
    candidate = candidate.trim();
    if (candidate) {
      title = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    } else {
      title = '';
    }
  }

  return { title, category };
};

export const voiceResponseTranslations: Record<string, Record<string, string>> = {
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
    schedulePromptTitle: 'নহাক্না করম্বা থবক রুটिनদা হাপচিনবা পামীবগে?',
    schedulePromptTime: 'নহাক্না {title} গী রিমাইন্ডার করম্বা পুংফমদা থম্বা পামীবগে?',
    scheduleAddedSuccess: 'লোইরে। ঐনা {title} গী রিমাইন্ডার {time} দা হাপচিল্লে।',
    callingCaregiver: 'নহাক্কী কেয়ারগিবর अनुদা ফোন তৌরি।'
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
    createReminderPrompt: 'Hooid. Kumno phi kwah ba ngan pynkynmaw ia phi bad ha ka por aiu?',
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

export const parseVoiceCommand = (text: string, currentLang: string = 'English', voiceContext: any = null): ParsedCommand => {
  let clean = text.trim().toLowerCase();
  const punctuation = [".", ",", "/", "#", "!", "$", "%", "^", "&", "*", ";", ":", "{", "}", "=", "-", "_", "`", "~", "(", ")", "?"];
  punctuation.forEach(p => {
    clean = clean.split(p).join("");
  });
  clean = clean.replace(/\s{2,}/g, " ");

  const dRes = parseDeterministicCommand(clean, currentLang, {
    profile: storageService.getCurrentUser(),
    reminders: storageService.getReminders(),
    schedule: storageService.getSchedule(),
    memories: storageService.getMemories()
  }, voiceContext);
  if (dRes) return dRes;

  const vr = voiceResponseTranslations[currentLang] || voiceResponseTranslations.English;

  // 1. General Conversation check
  const isGreeting = clean.match(/\b(hi|hello|hey|good morning|good afternoon|good evening|good night|namaste|pranam|hello|ஹলো|नमस्कार|नमस्ते|নমস্কার|আসসালামু আলাইকুম)\b/i);
  const isHowAreYou = clean.match(/\b(how are you|how is it going|how do you do|how are you doing|आप कैसे हैं|तुम कैसे हो|केम छ|কেমন আছেন|কেমন আছো)\b/i);
  const isWhoAreYou = clean.match(/\b(who are you|what is this|what is this app|about this app|tell me about yourself|what can you do|help me|explain this app|explain this application|how can you help|what features are available|features of this app|क्या कर सकते हो|तुम कौन हो|तुम्हारी क्या विशेषताएं हैं|तुम मेरी मदद कैसे कर सकते हो|তুমি কে|এই অ্যাপটি কি|তুমি কি করতে পারো|তুমি আমাকে কিভাবে সাহায্য করবে)\b/i);
  const isThankYou = clean.match(/\b(thank you|thanks|thank you so much|dhanyawad|shukriya|धन्यवाद|शुक्रिया|ধন্যবাদ)\b/i);

  const whoAreYouDict: Record<string, string> = {
    English: "I'm ALPINE, your memory companion. I can help you stay on track with daily activities, set reminders for medicine or meals, view your cherished memories, play brain-training games, and stay connected with your caregiver.",
    Hindi: "मैं अल्पाइन हूँ, आपका मेमोरी साथी। मैं आपके दिनचर्या को व्यवस्थित करने, दवा या पानी पीने के रिमाइंडर जोड़ने, आपके पसंदीदा पलों और यादों को सहेजने, और आपके दिमाग की कसरत के लिए मज़ेदार गेम्स खेलने में आपकी मदद कर सकता हूँ।",
    Bengali: "আমি অ্যালপাইন, আপনার স্মৃতি সহচর। আমি আপনাকে অনুস্মারক যোগ করতে, আপনার সুন্দর স্মৃতিগুলি দেখতে, প্রতিদিনের রুটিন পরিচালনা করতে বা ব্রেন গেম খেলতে সাহায্য করতে পারি।",
    Assamese: "মই এলপাইন, আপোনাৰ স্মৃতি সংগী। মই আপোনাক দিনটোৰ কাম কাজ পৰিচালনা কৰাত, ঔষধ বা খোৱা-বোৱাৰ অনুস্মাৰক সংৰক্ষণ কৰাত, পুৰণি স্মৃতিবোৰ চাবলৈ আৰু স্মৃতিশক্তি বৃদ্ধিৰ বাবে বিভিন্ন খেল খেলিবলৈ সহায় কৰিব পাৰোঁ।",
    Manipuri: "ঐনা এল্পাইন নি, नহাক্কী মেমোরী পার্টনার। ঐনা নহাকপু নুমিৎসিগী থবকশিং অমসুং রিমাইন্ডার থম্বা, মেমোরী য়েংবা অমসুং ব্রেন গেম শানবদা মতেং পাংগনি।",
    Khasi: "Nga dei u ALPINE, u nongsynran jingkynmaw jong phi. Nga lah ban iarap ia phi ban pynbeit ia ki kam kiba man la ka sngi, ban buh jingkynmaw ia ki dawai, ban peit ia ki dur bad jingkynmaw ba phi ieit, bad ban ialehkai games ban pynkhlain ia ka bor pyrkhat jong phi.",
    Mizo: "ALPINE ka ni a, i hriatna kawnga i kawppui tur ka ni. I nitin hna te, damdawi eina tur leh thil dang hriatnawn tur te chhinchhiah a, i thlalak leh nuam i tih thil te thlirtir che leh i rilru chakna tur infiamna te khelhpui che ka thei a ni.",
    Nagamese: "Mui ALPINE ase, apuni laga memory companion. Mui apuni ke aji laga schedule banabole, medicine reminders thakibole, apuni laga bhal pora mon thaka yaad khan sabole, aru dimaag laga games khelibole modot kuribole pare.",
    Tripuri: "Ang ALPINE, nini chokhichang companion. Ang nini dinni kamrok porichalona khailani, dawaini yaad phailani, kahm chokhichang yaadrok naini, te solomni khelrok khelphai choba khamdi."
  };

  const greetingDict: Record<string, string> = {
    English: "Hello! It's great to talk to you. How can I help you today?",
    Hindi: "नमस्ते! आपसे बात करके बहुत अच्छा लगा। आज मैं आपकी क्या मदद कर सकता हूँ?",
    Bengali: "নমস্কার! আপনার সাথে কথা বলতে পেরে খুব ভালো লাগছে। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    Assamese: "নমস্কাৰ! আপোনাৰ লগত কথা পাতি বৰ ভাল লাগিল। আজি মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?",
    Manipuri: "খুরুমজরি! নহাক্কা ঙাংবসি ঐঙোন্দা নুংঙাই। ঐনা করম্না মতেং পাংগে?",
    Khasi: "Khublei! Sngewbha ban iakren bad phi. Kumno nga lah ban iarap ia phi ha kane ka sngi?",
    Mizo: "Chibai! I hnen a tawng chu a nuam hle mai. Vawiin hian engtin nge ka tanpui theih ang che?",
    Nagamese: "Hello! Apuni logote kotha kobole bisi bhal lagise. Aji apuni ke ki modot kuribole pare?",
    Tripuri: "Khulumkha! Nini logote kok salani khapang tong. Ang nino chini choba khalai?"
  };

  const howAreYouDict: Record<string, string> = {
    English: "I'm doing great, thank you for asking! How are you doing today?",
    Hindi: "मैं बहुत अच्छा हूँ, पूछने के लिए धन्यवाद! आप आज कैसे महसूस कर रहे हैं?",
    Bengali: "আমি খুব ভালো আছি, জিজ্ঞাসা করার জন্য धन्यवाद! आज আপনি কেমন আছেন?",
    Assamese: "মই ভালে আছোঁ, সোধাৰ বাবে ধন্যবাদ! আজি আপুনি কেনে অনুভৱ কৰিছে?",
    Manipuri: "ঐ নুংঙাইরি, হংবীবগীদমক থাগৎচরি! নহাক করম্না লৈরি?",
    Khasi: "Nga koit khiah bha, khublei ba phi kylli! Phi kumno phi koit phi khiah?",
    Mizo: "Dam tha e, i thil zawh avangin ka lawm e! Vawiin lam i hriselna te a tha em?",
    Nagamese: "Mui toh bisi bhal ase, kotha hudhibole bisi bhal lagise! Apuni aji bhal ase na?",
    Tripuri: "Ang kahm tong, singma chongyal khulumkha! Nini sal chichi kahm tong?"
  };

  const thankYouDict: Record<string, string> = {
    English: "You're very welcome! I'm happy to help.",
    Hindi: "आपका बहुत-बहुत स्वागत है! मुझे आपकी मदद करके खुशी हुई।",
    Bengali: "আপনাকে অনেক স্বাগত! আপনার সাহায্য করতে পেরে খুব ভালো লেগেছে।",
    Assamese: "আপোনাক আদৰণি জনাইছোঁ! আপোনাক সহায় কৰিবলৈ পাই মই সুখী।",
    Manipuri: "নহাকপু তরাম্না ওকচরি! মতেং পাংবা ফংবদা ঐ হরাওই।",
    Khasi: "Khublei sngewbha! Sngewbha ban iarap.",
    Mizo: "I lawmthu sawi avangin ka lawm e! Tanpui che chu nuam ka ti hle mai.",
    Nagamese: "Apuni ke bisi welcome! Apuni ke modot kurikena bisi khushi paise.",
    Tripuri: "Nino khulumkha! Choba khaini khapang tong."
  };

  if (isWhoAreYou) {
    return {
      intent: 'CONVERSATION',
      response: whoAreYouDict[currentLang] || whoAreYouDict.English
    };
  }
  if (isGreeting) {
    return {
      intent: 'CONVERSATION',
      response: greetingDict[currentLang] || greetingDict.English
    };
  }
  if (isHowAreYou) {
    return {
      intent: 'CONVERSATION',
      response: howAreYouDict[currentLang] || howAreYouDict.English
    };
  }
  if (isThankYou) {
    return {
      intent: 'CONVERSATION',
      response: thankYouDict[currentLang] || thankYouDict.English
    };
  }

  // 2. High-priority contextual / data-driven queries (Checked before simple navigation)
  // Check memory progress
  if (clean.includes('improving') || clean.includes('getting better') || clean.includes('performance changed') || clean.includes('doing better') || clean.includes('how have i been performing') || clean.includes('improved recently') || clean.includes('how is my memory') || clean.includes('प्रगति') || clean.includes('उन्नति') || clean.includes('ভালো আছি') || clean.includes('উন্নতি হচ্ছে')) {
    return {
      intent: 'CHECK_MEMORY_PROGRESS',
      response: currentLang === 'Hindi' ? 'आपके मेमोरी प्रदर्शन का विश्लेषण किया जा रहा है...' : currentLang === 'Bengali' ? 'আপনার মেমরি ডেটা বিশ্লেষণ করা হচ্ছে...' : 'Analyzing your memory data...'
    };
  }

  // Favorite memory
  if (clean.includes('favorite memory') || clean.includes('favourite memory') || clean.includes('memory i love') || clean.includes('something important i saved') || clean.includes('पसंदीदा याद') || clean.includes('पसंदीदा स्मृति') || clean.includes('পছন্দের স্মৃতি')) {
    return {
      intent: 'SHOW_FAVORITE_MEMORY',
      response: currentLang === 'Hindi' ? 'आपकी पसंदीदा याद की तलाश की जा रही है...' : currentLang === 'Bengali' ? 'আপনার পছন্দের স্মৃতি খোঁজা হচ্ছে...' : 'Looking up your favorite memory...'
    };
  }

  // Plan day / daily planning
  if (clean.includes('should i do today') || clean.includes('day look') || clean.includes('organize my day') || clean.includes('plan today') || clean.includes('plan my day') || clean.includes('have planned') || clean.includes('दिनचर्या कैसी') || clean.includes('आज क्या करना है') || clean.includes('আজ কি করতে')) {
    return {
      intent: 'PLAN_DAY',
      response: currentLang === 'Hindi' ? 'आपकी आज की दिनचर्या की जांच की जा रही है...' : currentLang === 'Bengali' ? 'আপনার আজকের সময়সূচী দেখা হচ্ছে...' : 'Organizing your schedule...'
    };
  }

  // Call contact
  if (clean.includes('call') || clean.includes('phone') || clean.includes('contact') || clean.includes('फोन') || clean.includes('कॉल') || clean.includes('কল')) {
    if (clean.includes('daughter') || clean.includes('anu') || clean.includes('son') || clean.includes('ramesh') || clean.includes('wife') || clean.includes('meena') || clean.includes('doctor') || clean.includes('barua') || clean.includes('অনু') || clean.includes('রিমেশ') || clean.includes('মীনা') || clean.includes('ডাক্তার') || clean.includes('बेटे') || clean.includes('पत्नी')) {
      let contactName = '';
      if (clean.includes('daughter') || clean.includes('anu') || clean.includes('অনু')) contactName = 'Anu';
      else if (clean.includes('son') || clean.includes('ramesh') || clean.includes('রিমেশ') || clean.includes('बेटে')) contactName = 'Ramesh';
      else if (clean.includes('wife') || clean.includes('meena') || clean.includes('মীনা') || clean.includes('पत्नी')) contactName = 'Meena';
      else if (clean.includes('doctor') || clean.includes('barua') || clean.includes('ডাক্তার')) contactName = 'Dr. Barua';

      return {
        intent: 'CALL_CONTACT',
        response: contactName 
          ? (currentLang === 'Hindi' ? `${contactName} को कॉल किया जा रहा है...` : currentLang === 'Bengali' ? `${contactName} কে কল করা হচ্ছে...` : `Calling ${contactName}...`)
          : (currentLang === 'Hindi' ? 'आप किसे कॉल करना चाहेंगे?' : currentLang === 'Bengali' ? 'আপনি কাকে কল করতে চান?' : 'Who would you like me to call?'),
        activityData: {
          title: contactName || 'family',
          time: '',
          date: '',
          category: 'family',
          createReminder: false
        }
      };
    }
  }

  // Emergency contact caregiver
  if (clean.includes('call anu') || clean.includes('contact caregiver') || clean.includes('अनु को फोन') || clean.includes('केयरगिवर')) {
    return { 
      intent: 'CALL_CAREGIVER', 
      response: vr.callingCaregiver
    };
  }

  // Navigation commands mapping
  if (clean.includes('home') || clean.includes('होम') || clean.includes('ঘর')) {
    return { intent: 'OPEN_HOME', path: '/', response: vr.goingHome };
  }
  if (clean.includes('brain games') || clean.includes('brain game') || clean.includes('play games') || clean.includes('play game') || clean.includes('games') || clean.includes('ब्रेन गेम') || clean.includes('গেম')) {
    if (clean.includes('memory match') || clean.includes('memory game')) {
      return { intent: 'OPEN_MEMORY_MATCH', gameId: 'game-1', path: '/games', response: vr.startingMemoryMatch };
    }
    if (clean.includes('sequence') || clean.includes('order')) {
      return { intent: 'PLAY_GAME', gameId: 'game-2', path: '/games', response: vr.startingSequenceOrder };
    }
    if (clean.includes('attention') || clean.includes('focus')) {
      return { intent: 'OPEN_ATTENTION_FOCUS', gameId: 'game-3', path: '/games', response: vr.startingAttentionFocus };
    }
    if (clean.includes('object') || clean.includes('recognize')) {
      return { intent: 'OPEN_OBJECT_RECOGNITION', gameId: 'game-4', path: '/games', response: vr.startingObjectRecognition };
    }
    if (clean.includes('routine') || clean.includes('recall')) {
      return { intent: 'OPEN_DAILY_ROUTINE', gameId: 'game-5', path: '/games', response: currentLang === 'Hindi' ? 'डेली रूटीन रिकॉल शुरू किया जा रहा है।' : 'Starting Daily Routine Recall.' };
    }
    if (clean.includes('language') || clean.includes('word') || clean.includes('vocabulary')) {
      return { intent: 'OPEN_LANGUAGE_MEMORY', gameId: 'game-6', path: '/games', response: currentLang === 'Hindi' ? 'लैंग्वेज वर्ड मेमोरी शुरू किया जा रहा है।' : 'Starting Language Word Memory.' };
    }
    return { intent: 'OPEN_BRAIN_GAMES', path: '/games', response: vr.openingBrainGames };
  }
  
  if (clean.includes('memory') || clean.includes('memories') || clean.includes('photo') || clean.includes('यादें') || clean.includes('স্মৃতি')) {
    return { intent: 'OPEN_MEMORIES', path: '/memories', response: vr.openingMemories };
  }

  if (clean.includes('settings') || clean.includes('सेटिंग') || clean.includes('profile') || clean.includes('account') || clean.includes('प्रोफाइल')) {
    return { intent: 'OPEN_SETTINGS', path: '/settings', response: vr.openingSettings };
  }
  if (clean.includes('settings') || clean.includes('सेटिंग')) {
    return { intent: 'OPEN_SETTINGS', path: '/settings', response: vr.openingSettings };
  }

  if (clean.includes('caregiver dashboard') || clean.includes('caregiver panel')) {
    return { intent: 'OPEN_CAREGIVER', path: '/caregiver', response: vr.openingCaregiver };
  }

  if (clean.includes('my day') || clean.includes('schedule') || clean.includes('today schedule') || clean.includes('दिनचर्या') || clean.includes('শডিউল')) {
    if (!clean.includes('add') && !clean.includes('create') && !clean.includes('schedule a') && !clean.includes('remind')) {
      return { intent: 'OPEN_MY_DAY', path: '/day', response: vr.openingSchedule };
    }
  }

  if (clean.includes('reminders') || clean.includes('reminder') || clean.includes('alarm')) {
    if (!clean.includes('add') && !clean.includes('create') && !clean.includes('schedule') && !clean.includes('remind')) {
      return { intent: 'OPEN_REMINDERS', path: '/reminders', response: vr.openingReminders };
    }
  }

  if (clean.includes('help') || clean.includes('emergency') || clean.includes('मदद') || clean.includes('সাহায্য')) {
    return { intent: 'OPEN_HELP', path: '/help', response: vr.openingHelp };
  }

  // Create Activity / Add Reminder intents
  const isCreate = clean.includes('add') || clean.includes('create') || clean.includes('schedule') || clean.includes('remind') || clean.includes('जोड़ो') || clean.includes('বজে') || clean.includes('reminder') || clean.includes('task');
  if (isCreate) {
    const time = parseCommandTime(clean);
    const { title, category } = extractActivityDetails(clean);

    let date = new Date().toISOString().split('T')[0];
    if (clean.includes('tomorrow') || clean.includes('कल') || clean.includes('আগামীকাল')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    }

    const hasTitle = title.length > 0;
    const hasTime = time !== null;

    if (!hasTitle && !hasTime) {
      return {
        intent: 'CREATE_ACTIVITY',
        response: vr.createReminderPrompt,
        activityData: {
          title: '',
          time: '',
          date,
          category: 'other',
          createReminder: true,
          needClarification: true,
          missingField: 'title'
        }
      };
    }

    if (!hasTitle) {
      return {
        intent: 'CREATE_ACTIVITY',
        response: vr.schedulePromptTitle,
        activityData: {
          title: '',
          time: time || '18:00',
          date,
          category,
          createReminder: true,
          needClarification: true,
          missingField: 'title'
        }
      };
    }

    if (!hasTime) {
      return {
        intent: 'CREATE_ACTIVITY',
        response: vr.schedulePromptTime.replace('{title}', title),
        activityData: {
          title,
          time: '',
          date,
          category,
          createReminder: true,
          needClarification: true,
          missingField: 'time'
        }
      };
    }

    return {
      intent: 'CREATE_ACTIVITY',
      response: vr.scheduleAddedSuccess.replace('{title}', title).replace('{time}', time),
      activityData: {
        title,
        time,
        date,
        category,
        createReminder: true
      }
    };
  }

  // Fallback
  const fallbackDict: Record<string, string> = {
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

  return {
    intent: 'UNKNOWN',
    response: fallbackDict[currentLang] || fallbackDict.English
  };
};
