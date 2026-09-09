import { storageService } from './storageService';
import type { Reminder, Activity, Memory } from '../data/demoData';
import { generateTranslations } from './translationService';

export interface VoiceActionCallbacks {
  refreshReminders?: () => void;
  refreshSchedule?: () => void;
  refreshMemories?: () => void;
  navigate: (path: string, state?: any) => void;
  setActiveCall?: (name: string | null) => void;
  triggerToast: (msg: string) => void;
}

const errorTranslations: Record<string, string> = {
  English: "I couldn't find the item to perform that action.",
  Hindi: "मुझे उस कार्य को करने के लिए आइटम नहीं मिला।",
  Bengali: "আমি কাজটি করার জন্য আইটেমটি খুঁজে পাইনি।",
  Assamese: "মই সেই কামটো কৰিবলৈ আইটেমটো বিচাৰি নাপালোঁ।",
  Manipuri: "ঐনা থবক অদু তৌনবা পোৎশক অদু ফংখিদ্রে।",
  Khasi: "Nga khlem da shem ia ka ban leh ia kata ka kam.",
  Mizo: "Khatiang thil ti tur kha ka hmu lo.",
  Nagamese: "Moi eitu kam kuribole saman pai nai.",
  Tripuri: "Ang bwrwita samung khai rwi manu koriya."
};

const format12Hour = (timeStr: string) => {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = parseInt(hoursStr, 10);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutesStr} ${suffix}`;
};

export const voiceActionExecutor = {
  resolveEntityId(intent: string, voiceContext: any): string | null {
    if (voiceContext?.lastEntity) {
      const le = voiceContext.lastEntity;
      if (intent.includes('MEMORY') && le.type === 'memory') return le.id;
      if (intent.includes('REMINDER') && le.type === 'reminder') return le.id;
      if (intent.includes('ACTIVITY') && le.type === 'activity') return le.id;
    }
    if (intent.includes('MEMORY')) {
      const items = storageService.getMemories();
      if (items.length === 1) return items[0].id;
    } else if (intent.includes('REMINDER')) {
      const items = storageService.getReminders();
      if (items.length === 1) return items[0].id;
    } else {
      const items = storageService.getSchedule();
      if (items.length === 1) return items[0].id;
    }
    return null;
  },

  getItemTitle(intent: string, entityId: string): string {
    if (intent.includes('MEMORY')) {
      const memories = storageService.getMemories();
      const item = memories.find(m => m.id === entityId);
      return item ? item.title : '';
    } else if (intent.includes('REMINDER')) {
      const reminders = storageService.getReminders();
      const item = reminders.find(r => r.id === entityId);
      return item ? item.title : '';
    } else {
      const schedule = storageService.getSchedule();
      const item = schedule.find(s => s.id === entityId);
      return item ? item.title : '';
    }
  },

  execute(
    parsed: any,
    callbacks: VoiceActionCallbacks,
    language: string,
    activeUser: any,
    voiceContext: any = null
  ): { nextContext: any; responseOverride?: string } {
    const intent = parsed.intent;
    const parameters = parsed.parameters || {};
    const userName = activeUser ? activeUser.name : 'Patient';

    console.log('[DIAGNOSTIC] voiceActionExecutor.execute ENTERED');
    console.log(`[ActionExecutor] Executing action for intent: ${intent}`, parameters);

    try {
      // 0. MULTI_ACTION
      if (intent === 'MULTI_ACTION' && Array.isArray(parsed.actions)) {
        let finalContext = null;
        for (const subAction of parsed.actions) {
          const res = this.execute(
            {
              intent: subAction.intent,
              parameters: subAction.parameters
            },
            callbacks,
            language,
            activeUser
          );
          if (res.nextContext) {
            finalContext = res.nextContext;
          }
        }
        return { nextContext: finalContext };
      }

      // 1. CREATE_ACTIVITY / CREATE_REMINDER
      if (intent === 'CREATE_ACTIVITY' || intent === 'CREATE_REMINDER') {
        const title = parameters.title || parsed.activityData?.title || 'Activity';
        const time = parameters.time || parsed.activityData?.time || '12:00';
        const date = parameters.date || parsed.activityData?.date || new Date().toISOString().split('T')[0];
        const category = parameters.category || parsed.activityData?.category || 'other';
        const createReminder = intent === 'CREATE_REMINDER' || parsed.activityData?.createReminder !== false;

        const schedule = storageService.getSchedule();
        const newAct: Activity = {
          id: `sch-${Date.now()}`,
          time: format12Hour(time),
          title,
          completed: false,
          date
        };
        storageService.saveSchedule([...schedule, newAct]);
        if (callbacks.refreshSchedule) callbacks.refreshSchedule();

        generateTranslations(title, '').then(trans => {
          const currentSch = storageService.getSchedule();
          const updatedSch = currentSch.map(s => s.id === newAct.id ? { ...s, translations: trans } : s);
          storageService.saveSchedule(updatedSch);
          if (callbacks.refreshSchedule) callbacks.refreshSchedule();
        }).catch(err => {
          console.warn('[Translation] Failed to generate translations for voice activity:', err);
        });

        let newRemId = '';
        if (createReminder) {
          const reminders = storageService.getReminders();
          const newRem: Reminder = {
            id: `rem-${Date.now()}`,
            category: (category as any) || 'other',
            title,
            description: language === 'Hindi' ? 'आवाज़ द्वारा बनाया गया अनुस्मारक' : language === 'Bengali' ? 'কণ্ঠস্বর দ্বারা তৈরি অনুস্মারক' : 'Voice created reminder',
            time,
            date,
            status: 'Upcoming',
            repeat: parameters.repeat || 'Daily',
            enabled: true
          };
          newRemId = newRem.id;
          storageService.saveReminders([newRem, ...reminders]);
          if (callbacks.refreshReminders) callbacks.refreshReminders();

          generateTranslations(title, newRem.description).then(trans => {
            const allRems = storageService.getReminders();
            const updatedRems = allRems.map(r => r.id === newRem.id ? { ...r, translations: trans } : r);
            storageService.saveReminders(updatedRems);
            if (callbacks.refreshReminders) callbacks.refreshReminders();
          }).catch(err => {
            console.warn('[Translation] Failed to generate translations for voice reminder:', err);
          });
        }

        // Caregiver alert
        const alerts = storageService.getAlerts();
        storageService.saveAlerts([
          {
            id: `al-${Date.now()}`,
            type: 'info',
            title: `${userName} added task: ${title} at ${format12Hour(time)}`,
            time: 'Just now'
          },
          ...alerts
        ]);

        callbacks.triggerToast(
          language === 'Hindi' ? `कार्य जोड़ा गया: ${title}` : language === 'Bengali' ? `কাজ যোগ করা হয়েছে: ${title}` : `Added activity: ${title}`
        );

        return {
          nextContext: {
            intent,
            data: { title, time, date, category },
            lastEntity: { id: newRemId || newAct.id, type: createReminder ? 'reminder' : 'activity' }
          }
        };
      }

      // 2. UPDATE_REMINDER
      if (intent === 'UPDATE_REMINDER' || intent === 'MODIFY_REMINDER') {
        const entityId = parameters.entityId;
        if (!entityId) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        const reminders = storageService.getReminders();
        const reminderIndex = reminders.findIndex(r => r.id === entityId);
        if (reminderIndex === -1) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        const oldRem = reminders[reminderIndex];
        const updatedRem: Reminder = {
          ...oldRem,
          title: parameters.title || oldRem.title,
          time: parameters.time || oldRem.time,
          date: parameters.date || oldRem.date,
          category: parameters.category || oldRem.category,
          repeat: parameters.repeat || oldRem.repeat
        };

        reminders[reminderIndex] = updatedRem;
        storageService.saveReminders(reminders);
        if (callbacks.refreshReminders) callbacks.refreshReminders();

        // Also update corresponding activity in My Day if exists
        const schedule = storageService.getSchedule();
        const actIndex = schedule.findIndex(s => s.title === oldRem.title && s.time === format12Hour(oldRem.time));
        if (actIndex !== -1) {
          schedule[actIndex] = {
            ...schedule[actIndex],
            title: updatedRem.title,
            time: format12Hour(updatedRem.time)
          };
          storageService.saveSchedule(schedule);
          if (callbacks.refreshSchedule) callbacks.refreshSchedule();
        }

        // Caregiver alert
        const alerts = storageService.getAlerts();
        storageService.saveAlerts([
          {
            id: `al-${Date.now()}`,
            type: 'info',
            title: `${userName} updated reminder: ${updatedRem.title}`,
            time: 'Just now'
          },
          ...alerts
        ]);

        callbacks.triggerToast(
          language === 'Hindi' ? 'रिमाइंडर अपडेट किया गया' : language === 'Bengali' ? 'অনুস্মারক আপডেট করা হয়েছে' : 'Reminder updated'
        );

        return {
          nextContext: {
            intent,
            data: parameters,
            lastEntity: { id: entityId, type: 'reminder' }
          }
        };
      }

      // 3. DELETE_REMINDER
      if (intent === 'DELETE_REMINDER') {
        const entityId = parameters.entityId;
        if (!entityId) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        const reminders = storageService.getReminders();
        const itemToDelete = reminders.find(r => r.id === entityId);
        if (!itemToDelete) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        const updated = reminders.filter(r => r.id !== entityId);
        storageService.saveReminders(updated);
        if (callbacks.refreshReminders) callbacks.refreshReminders();

        // Caregiver alert
        const alerts = storageService.getAlerts();
        storageService.saveAlerts([
          {
            id: `al-${Date.now()}`,
            type: 'warning',
            title: `${userName} deleted reminder: ${itemToDelete.title}`,
            time: 'Just now'
          },
          ...alerts
        ]);

        callbacks.triggerToast(
          language === 'Hindi' ? 'रिमाइंडर हटा दिया गया' : language === 'Bengali' ? 'অনুস্মারক মুছে ফেলা হয়েছে' : 'Reminder deleted'
        );

        return { nextContext: null };
      }

      // 4. COMPLETE_REMINDER
      if (intent === 'COMPLETE_REMINDER') {
        const entityId = parameters.entityId;
        if (!entityId) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        const reminders = storageService.getReminders();
        const rem = reminders.find(r => r.id === entityId);
        if (!rem) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        rem.status = 'Completed';
        storageService.saveReminders(reminders);
        if (callbacks.refreshReminders) callbacks.refreshReminders();

        // Caregiver alert
        const alerts = storageService.getAlerts();
        storageService.saveAlerts([
          {
            id: `al-${Date.now()}`,
            type: 'success',
            title: `${userName} completed reminder: ${rem.title}`,
            time: 'Just now'
          },
          ...alerts
        ]);

        callbacks.triggerToast(
          language === 'Hindi' ? 'रिमाइंडर पूरा हुआ' : language === 'Bengali' ? 'অনুস্মারক সম্পন্ন হয়েছে' : 'Reminder completed'
        );

        return {
          nextContext: {
            intent,
            data: parameters,
            lastEntity: { id: entityId, type: 'reminder' }
          }
        };
      }

      // 5. UPDATE_ACTIVITY
      if (intent === 'UPDATE_ACTIVITY' || intent === 'MODIFY_ACTIVITY') {
        const entityId = parameters.entityId;
        if (!entityId) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        const schedule = storageService.getSchedule();
        const actIndex = schedule.findIndex(s => s.id === entityId);
        if (actIndex === -1) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        const oldAct = schedule[actIndex];
        const updatedAct: Activity = {
          ...oldAct,
          title: parameters.title || oldAct.title,
          time: parameters.time ? format12Hour(parameters.time) : oldAct.time,
          date: parameters.date || oldAct.date
        };

        schedule[actIndex] = updatedAct;
        storageService.saveSchedule(schedule);
        if (callbacks.refreshSchedule) callbacks.refreshSchedule();

        callbacks.triggerToast(
          language === 'Hindi' ? 'गतिविधि अपडेट की गई' : language === 'Bengali' ? 'কার্যক্রম আপডেট করা হয়েছে' : 'Activity updated'
        );

        return {
          nextContext: {
            intent,
            data: parameters,
            lastEntity: { id: entityId, type: 'activity' }
          }
        };
      }

      // 6. DELETE_ACTIVITY
      if (intent === 'DELETE_ACTIVITY') {
        let entityId = parameters.entityId;
        
        if (!entityId) {
          entityId = this.resolveEntityId('DELETE_ACTIVITY', voiceContext);
        }

        if (!entityId) {
          const askWhich: Record<string, string> = {
            English: 'Which activity would you like to delete?',
            Hindi: 'आप कौन सी गतिविधि हटाना चाहते हैं?',
            Bengali: 'আপনি কোন কার্যক্রমটি মুছে ফেলতে চান?'
          };
          return {
            nextContext: { intent: 'ASK_WHICH_ITEM', deleteIntent: 'DELETE_ACTIVITY' },
            responseOverride: askWhich[language] || askWhich.English
          };
        }

        const schedule = storageService.getSchedule();
        const itemToDelete = schedule.find(s => s.id === entityId);
        if (!itemToDelete) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        if (parameters.confirmed !== true) {
          const askConfirm: Record<string, string> = {
            English: `Are you sure you want to delete the activity "${itemToDelete.title}"?`,
            Hindi: `क्या आप वाकई "${itemToDelete.title}" गतिविधि हटाना चाहते हैं?`,
            Bengali: `আপনি কি নিশ্চিত যে আপনি "${itemToDelete.title}" কার্যক্রমটি মুছে ফেলতে চান?`
          };
          return {
            nextContext: { intent: 'CONFIRM_DELETE', deleteIntent: 'DELETE_ACTIVITY', entityId },
            responseOverride: askConfirm[language] || askConfirm.English
          };
        }

        const updated = schedule.filter(s => s.id !== entityId);
        storageService.saveSchedule(updated);
        if (callbacks.refreshSchedule) callbacks.refreshSchedule();

        callbacks.triggerToast(
          language === 'Hindi' ? 'गतिविधि हटा दी गई' : language === 'Bengali' ? 'কার্যক্রম মুছে ফেলা হয়েছে' : 'Activity deleted'
        );

        return { 
          nextContext: null, 
          responseOverride: language === 'Hindi' ? 'गतिविधि हटा दी गई है।' : language === 'Bengali' ? 'কার্যক্রম মুছে ফেলা হয়েছে।' : 'Activity deleted.' 
        };
      }

      // 7. COMPLETE_ACTIVITY
      if (intent === 'COMPLETE_ACTIVITY') {
        const entityId = parameters.entityId;
        if (!entityId) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        const schedule = storageService.getSchedule();
        const act = schedule.find(s => s.id === entityId);
        if (!act) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        act.completed = true;
        storageService.saveSchedule(schedule);
        if (callbacks.refreshSchedule) callbacks.refreshSchedule();

        callbacks.triggerToast(
          language === 'Hindi' ? 'गतिविधि पूरी हुई' : language === 'Bengali' ? 'কার্যক্রম সম্পন্ন হয়েছে' : 'Activity completed'
        );

        return {
          nextContext: {
            intent,
            data: parameters,
            lastEntity: { id: entityId, type: 'activity' }
          }
        };
      }

      // 8. CREATE_MEMORY
      if (intent === 'CREATE_MEMORY') {
        const title = parameters.title || 'New Memory';
        const date = parameters.date || new Date().toISOString().split('T')[0];
        const description = parameters.description || '';
        const people = parameters.people || '';
        const category = parameters.category || 'other';

        const memories = storageService.getMemories();
        const newMem: Memory = {
          id: `mem-${Date.now()}`,
          title,
          date,
          description,
          people,
          category: (category as any) || 'other',
          image: 'family_avatar'
        };

        storageService.saveMemories([...memories, newMem]);
        if (callbacks.refreshMemories) callbacks.refreshMemories();

        // Caregiver alert
        const alerts = storageService.getAlerts();
        storageService.saveAlerts([
          {
            id: `al-${Date.now()}`,
            type: 'info',
            title: `${userName} added a memory: ${title}`,
            time: 'Just now'
          },
          ...alerts
        ]);

        callbacks.triggerToast(
          language === 'Hindi' ? 'याद जोड़ी गई' : language === 'Bengali' ? 'স্মৃতি যোগ করা হয়েছে' : 'Memory added'
        );

        return {
          nextContext: {
            intent,
            data: parameters,
            lastEntity: { id: newMem.id, type: 'memory' }
          }
        };
      }

      // 9. UPDATE_MEMORY
      if (intent === 'UPDATE_MEMORY') {
        const entityId = parameters.entityId;
        if (!entityId) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        const memories = storageService.getMemories();
        const memIndex = memories.findIndex(m => m.id === entityId);
        if (memIndex === -1) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        const oldMem = memories[memIndex];
        const updatedMem: Memory = {
          ...oldMem,
          title: parameters.title || oldMem.title,
          date: parameters.date || oldMem.date,
          description: parameters.description || oldMem.description,
          people: parameters.people || oldMem.people,
          category: parameters.category || oldMem.category
        };

        memories[memIndex] = updatedMem;
        storageService.saveMemories(memories);
        if (callbacks.refreshMemories) callbacks.refreshMemories();

        callbacks.triggerToast(
          language === 'Hindi' ? 'याद अपडेट की गई' : language === 'Bengali' ? 'স্মৃতি আপডেট করা হয়েছে' : 'Memory updated'
        );

        return {
          nextContext: {
            intent,
            data: parameters,
            lastEntity: { id: entityId, type: 'memory' }
          }
        };
      }

      // 10. DELETE_MEMORY
      if (intent === 'DELETE_MEMORY') {
        let entityId = parameters.entityId;

        if (!entityId) {
          entityId = this.resolveEntityId('DELETE_MEMORY', voiceContext);
        }

        if (!entityId) {
          const askWhich: Record<string, string> = {
            English: 'Which memory would you like to delete?',
            Hindi: 'आप कौन सी याद हटाना चाहते हैं?',
            Bengali: 'আপনি কোন স্মৃতিটি মুছে ফেলতে চান?'
          };
          return {
            nextContext: { intent: 'ASK_WHICH_ITEM', deleteIntent: 'DELETE_MEMORY' },
            responseOverride: askWhich[language] || askWhich.English
          };
        }

        const memories = storageService.getMemories();
        const itemToDelete = memories.find(m => m.id === entityId);
        if (!itemToDelete) {
          return { nextContext: null, responseOverride: errorTranslations[language] || errorTranslations.English };
        }

        if (parameters.confirmed !== true) {
          const askConfirm: Record<string, string> = {
            English: `Are you sure you want to delete the memory "${itemToDelete.title}"?`,
            Hindi: `क्या आप वाकई "${itemToDelete.title}" याद हटाना चाहते हैं?`,
            Bengali: `আপনি কি নিশ্চিত যে আপনি "${itemToDelete.title}" স্মৃতিটি মুছে ফেলতে চান?`
          };
          return {
            nextContext: { intent: 'CONFIRM_DELETE', deleteIntent: 'DELETE_MEMORY', entityId },
            responseOverride: askConfirm[language] || askConfirm.English
          };
        }

        const updated = memories.filter(m => m.id !== entityId);
        storageService.saveMemories(updated);
        if (callbacks.refreshMemories) callbacks.refreshMemories();

        callbacks.triggerToast(
          language === 'Hindi' ? 'याद हटा दी गई' : language === 'Bengali' ? 'স্মৃতি মুছে ফেলা হয়েছে' : 'Memory deleted'
        );

        return { 
          nextContext: null, 
          responseOverride: language === 'Hindi' ? 'याद हटा दी गई है।' : language === 'Bengali' ? 'স্মৃতি মুছে ফেলা হয়েছে।' : 'Memory deleted.' 
        };
      }

      // 11. NAVIGATION & FEATURE ROUTING
      const isTaskStatusIntent = (
        intent === 'MY_DAY_QUERY' ||
        intent === 'MY_DAY_STATUS' ||
        intent === 'NEXT_TASK_QUERY' ||
        intent === 'TASK_STATUS_QUERY' ||
        intent === 'MOTIVATION_SUPPORT'
      );
      const isReminderQueryIntent = (
        intent === 'REMINDER_QUERY' ||
        intent === 'MEDICATION_SCHEDULE_QUERY'
      );
      const isGamesQueryIntent = (
        intent === 'BRAIN_GAME_RECOMMENDATION' ||
        intent === 'COGNITIVE_PERFORMANCE_QUERY' ||
        intent === 'BRAIN_GAME_PERFORMANCE_QUERY' ||
        intent === 'PLAY_GAME' ||
        intent.startsWith('OPEN_MEMORY_MATCH') ||
        intent.startsWith('OPEN_SEQUENCE')
      );
      const isMemoriesQueryIntent = (
        intent === 'OPEN_MEMORIES' ||
        intent === 'MEMORY_QUERY'
      );

      if (intent === 'CAREGIVER_ACCESS_RESTRICTED') {
        callbacks.triggerToast(
          language === 'Hindi' ? 'केयरगिवर एक्सेस सीमित' : language === 'Bengali' ? 'কেয়ারগিভার অ্যাক্সেস সীমিত' : 'Caregiver Access Restricted'
        );
        return { nextContext: null };
      }

      if (
        (intent === 'NAVIGATION' || 
        intent.startsWith('OPEN_') || 
        intent === 'PLAY_GAME' ||
        isTaskStatusIntent ||
        isReminderQueryIntent ||
        isGamesQueryIntent ||
        isMemoriesQueryIntent ||
        !!parsed.path) &&
        parsed.path !== undefined
      ) {
        let targetPath = parsed.path || parameters.target || (parsed.parameters && parsed.parameters.target);
        if (!targetPath || targetPath.trim() === '') {
          if (isTaskStatusIntent) targetPath = '/day';
          else if (isReminderQueryIntent) targetPath = '/reminders';
          else if (isGamesQueryIntent) targetPath = '/games';
          else if (isMemoriesQueryIntent) targetPath = '/memories';
        }

        if (targetPath) {
          const canonicalMap: Record<string, string> = {
            home: '/',
            '/': '/',
            'home page': '/',
            brain_games: '/games',
            'brain games': '/games',
            games: '/games',
            game: '/games',
            '/games': '/games',
            memories: '/memories',
            memory: '/memories',
            '/memories': '/memories',
            my_day: '/day',
            'my day': '/day',
            day: '/day',
            schedule: '/day',
            '/day': '/day',
            reminders: '/reminders',
            reminder: '/reminders',
            '/reminders': '/reminders',
            settings: '/settings',
            setting: '/settings',
            '/settings': '/settings',
            garden: '/garden',
            'mind garden': '/garden',
            bagaan: '/garden',
            '/garden': '/garden',
            caregiver_dashboard: '/caregiver',
            'caregiver dashboard': '/caregiver',
            caregiver: '/caregiver',
            '/caregiver': '/caregiver',
            'talk to me': '/talk-to-me',
            'voice assistant': '/talk-to-me',
            'talk_to_me': '/talk-to-me',
            '/talk-to-me': '/talk-to-me',
            'back': '-1',
            'go back': '-1',
            'take me back': '-1'
          };
          const cleanTarget = targetPath.toLowerCase().trim().replace(/_/g, ' ');
          let finalRoute = targetPath;
          if (canonicalMap[cleanTarget]) {
            finalRoute = canonicalMap[cleanTarget];
          } else if (canonicalMap[targetPath.toLowerCase().trim()]) {
            finalRoute = canonicalMap[targetPath.toLowerCase().trim()];
          }

          if (finalRoute === '/caregiver' && activeUser?.role !== 'Caregiver') {
            callbacks.triggerToast(
              language === 'Hindi' ? 'केयरगिवर एक्सेस सीमित' : language === 'Bengali' ? 'কেয়ারগিভার অ্যাক্সেস সীমিত' : 'Caregiver Access Restricted'
            );
            return { nextContext: null };
          }

          console.log(`[VOICE] intent: ${intent}`);
          console.log(`[VOICE] resolved navigation path: ${finalRoute}`);
          console.log(`[VOICE] navigating to ${finalRoute}`);
          console.log(`[ActionExecutor] NAVIGATION targetPath resolved to: ${finalRoute}`);

          const navState: Record<string, any> = {};
          if (parsed.gameId) navState.gameId = parsed.gameId;
          if (parsed.selectedMemoryId) navState.selectedMemoryId = parsed.selectedMemoryId;
          if (parsed.memoryData) navState.memoryData = parsed.memoryData;
          if (parsed.highlightTaskId) navState.highlightTaskId = parsed.highlightTaskId;

          callbacks.navigate(finalRoute, Object.keys(navState).length > 0 ? navState : undefined);
          return {
            nextContext: null,
            responseOverride: parsed.response
          };
        }
      }

      // 12. CALL_CONTACT
      if (intent === 'CALL_CONTACT') {
        const contacts = storageService.getContacts();
        const targetName = parameters.title || 'Anu';
        const contact = contacts.find(c => c.name.toLowerCase().includes(targetName.toLowerCase())) || contacts[0];

        if (contact && callbacks.setActiveCall) {
          callbacks.setActiveCall(contact.name);
          setTimeout(() => {
            if (callbacks.setActiveCall) callbacks.setActiveCall(null);
            callbacks.triggerToast(
              language === 'Hindi' ? `कॉल समाप्त: ${contact.name}` : language === 'Bengali' ? `কল শেষ: ${contact.name}` : `Call completed to ${contact.name}`
            );
          }, 4000);
        }
        return { nextContext: null };
      }

      // Fallback for general conversation / query
      return {
        nextContext: intent === 'CLARIFICATION_REQUIRED' ? {
          intent: `CREATE_ACTIVITY_MISSING_${(parameters.missingField || 'title').toUpperCase()}`,
          data: parameters
        } : null
      };

    } catch (error) {
      console.error('[DIAGNOSTIC] ERROR in voiceActionExecutor:', error);
      console.error('[ActionExecutor] Error executing action:', error);
      return {
        nextContext: null,
        responseOverride: errorTranslations[language] || errorTranslations.English
      };
    }
  }
};
