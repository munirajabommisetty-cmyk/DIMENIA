import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, ChevronRight, HelpCircle, ArrowLeft, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { voiceRecognitionService, speakText } from '../services/voiceRecognitionService';
import { parseVoiceCommand } from '../services/voiceCommandParser';
import { storageService } from '../services/storageService';
import { apiClient } from '../services/apiClient';
import { voiceActionExecutor } from '../services/voiceActionExecutor';
import type { Activity, Reminder } from '../data/demoData';

export const TalkToMe: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const currentUser = storageService.getCurrentUser();
  const userName = currentUser ? currentUser.name : 'Patient';

  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error' | 'denied' | 'unsupported'>('idle');
  const [dialogText, setDialogText] = useState(t('voice.hello').replace('Ravi', userName));
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [voiceContext, setVoiceContext] = useState<any>(null);
  const [showFallbackInput, setShowFallbackInput] = useState(false);
  
  // Activity creation states
  const [clarificationData, setClarificationData] = useState<any>(null);
  const [createdActivity, setCreatedActivity] = useState<any>(null);

  // Manual fallback form states
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualTime, setManualTime] = useState('18:00');

  const sampleCommands = [
    { text: 'What is next?', cmd: 'next' },
    { text: 'Add walking at 6 PM', cmd: 'add walking at 6 pm' },
    { text: 'Show my memories', cmd: 'memories' },
    { text: 'Start a brain game', cmd: 'game' },
    { text: 'Emergency Help', cmd: 'help' }
  ];

  useEffect(() => {
    storageService.init();
    apiClient.checkHealth(); // Trigger healthcheck immediately to update connected state
    if (!voiceRecognitionService.isSupported()) {
      setStatus('unsupported');
    }
  }, []);

  const handleCommandParse = async (transcript: string) => {
    console.log(`[DIAGNOSTIC] 3. handleCommandParse ENTERED: "${transcript}"`);
    try {
      console.log('[VOICE] transcription response received');
      console.log(`[VOICE] transcript: "${transcript}"`);
      setStatus('processing');
      setLastCommand(transcript);
      setDialogText(t('voice.understanding'));

      let parsed: any;
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
          parsed = parseVoiceCommand(transcript);
        }
      } else {
        parsed = parseVoiceCommand(transcript);
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
    console.log('[DIAGNOSTIC] 9. executeParsedCommand ENTERED');
    try {
      if (parsed.intent === 'UNKNOWN') {
        setStatus('error');
        const unknownMsg = parsed.response || "I didn't understand that. Please type your command.";
        setDialogText(unknownMsg);
        speakText(unknownMsg, language);
        setShowFallbackInput(true);
        return;
      }

      setShowFallbackInput(false);

      if (parsed.intent === 'CANCEL') {
        setStatus('idle');
        setDialogText(parsed.response);
        voiceRecognitionService.stopListening();
        return;
      }

      if (parsed.intent === 'CHANGE_LANGUAGE' && parsed.languageValue) {
        setLanguage(parsed.languageValue);
        setStatus('success');
        setDialogText(parsed.response);
        speakText(parsed.response, language);
        return;
      }

      console.log('[DIAGNOSTIC] 10. voiceActionExecutor.execute ENTERED');
      const result = voiceActionExecutor.execute(
        parsed,
        {
          refreshReminders: () => {},
          refreshSchedule: () => {},
          refreshMemories: () => {},
          navigate: (path: string, state?: any) => {
            try {
              if (path === '-1') {
                navigate(-1);
                return;
              }
              console.log(`[VOICE NAV] TalkToMe.tsx immediate navigate to: "${path}"`, state);
              setStatus('success');
              if (parsed.response) setDialogText(parsed.response);
              const navOptions = state ? (state.state !== undefined ? state : { state }) : undefined;
              navigate(path, navOptions);
            } catch (navErr: any) {
              console.error('[VOICE NAV] ERROR in TalkToMe navigation:', navErr);
            }
          },
          setActiveCall: (name: string | null) => {
            if (name) {
              setStatus('success');
              setDialogText(`Calling ${name}...`);
              setTimeout(() => {
                alert(`Call completed to: ${name}`);
                setStatus('idle');
                setDialogText(`Call completed.`);
              }, 4000);
            }
          },
          triggerToast: (msg: string) => {
            console.log(`[Toast] ${msg}`);
          }
        },
        language,
        currentUser
      );

      setVoiceContext(result.nextContext);

      const responseToSpeak = result.responseOverride || parsed.response;
      if (responseToSpeak) {
        setStatus('success');
        setDialogText(responseToSpeak);
        speakText(responseToSpeak, language);
      } else {
        setStatus('idle');
      }
    } catch (e: any) {
      console.error('[DIAGNOSTIC] ERROR in executeParsedCommand:', e);
    }
  };

  const saveCreatedActivity = (title: string, time: string, date: string, category: any, createReminder: boolean) => {
    // 1. Add activity to My Day schedule
    const schedule = storageService.getSchedule();
    const newAct: Activity = {
      id: `sch-${Date.now()}`,
      time: format12Hour(time),
      title,
      completed: false
    };
    const updatedSchedule = [...schedule, newAct];
    storageService.saveSchedule(updatedSchedule);

    // 2. Create reminder if explicitly requested
    if (createReminder) {
      const reminders = storageService.getReminders();
      const newRem: Reminder = {
        id: `rem-${Date.now()}`,
        category: category === 'medicine' ? 'medicine' : 'other',
        title,
        description: 'Voice created reminder',
        time,
        date,
        status: 'Upcoming',
        repeat: 'Daily',
        enabled: true
      };
      storageService.saveReminders([newRem, ...reminders]);
    }

    // 3. Create caregiver alerts
    const alerts = storageService.getAlerts();
    const newAlert = {
      id: `al-${Date.now()}`,
      type: 'info' as const,
      title: `Voice Activity Created: ${title}`,
      time: 'Just now'
    };
    storageService.saveAlerts([newAlert, ...alerts]);

    // 4. Update UI states
    setCreatedActivity({
      title,
      time: format12Hour(time),
      date,
      reminderCreated: createReminder
    });
    setClarificationData(null);
    setStatus('success');
    setDialogText(`Done. I added "${title}" at ${format12Hour(time)}.`);
  };

  const format12Hour = (timeStr: string) => {
    if (!timeStr) return '';
    const [hoursStr, minutesStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutesStr} ${suffix}`;
  };

  const [recordingSeconds, setRecordingSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (status === 'listening') {
      setRecordingSeconds(8);
      interval = setInterval(() => {
        setRecordingSeconds(s => {
          if (s <= 1) {
            clearInterval(interval);
            console.log('[VOICE] 8 seconds completed. Auto-stopping microphone capture.');
            voiceRecognitionService.stopListening();
            return 0;
          }
          console.log(`[VOICE] Countdown: ${s - 1}`);
          return s - 1;
        });
      }, 1000);
    } else {
      setRecordingSeconds(8);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const handleMicToggle = () => {
    if (status === 'listening') {
      voiceRecognitionService.stopListening();
      setStatus('idle');
      setDialogText(t('voice.idle'));
      return;
    }

    setShowFallbackInput(false);
    setStatus('listening');
    setDialogText(t('voice.listening'));
    setClarificationData(null);
    setCreatedActivity(null);

    console.log('[VOICE] Mic button clicked');
    voiceRecognitionService.startListening(language, {
      onStart: () => {
        console.log('[VOICE] Permission granted');
        console.log('[VOICE] Listening started');
        setStatus('listening');
        setDialogText('Listening... Speak now');
      },
      onPartial: (text) => {
        if (text) {
          console.log(`[VOICE] Partial transcript: ${text}`);
          setDialogText(text);
        }
      },
      onResult: (transcript) => {
        console.log(`[VOICE] Final transcript: ${transcript}`);
        setLastCommand(transcript);
        setDialogText(transcript);
        setStatus('processing');
        localStorage.setItem('sb_last_voice_command', transcript);
        console.log('[VOICE] Processing command');

        try {
          console.log('[DIAGNOSTIC] handleCommandParse called');
          voiceRecognitionService.stopListening();
          handleCommandParse(transcript);
        } catch (e: any) {
          console.error('[DIAGNOSTIC] Error in spoken command-processing:', e);
        }
      },
      onCommand: (cmd) => {
        console.log(`[VOICE] Detected language: ${cmd.sourceLanguage || 'en'}`);
        console.log(`[VOICE] English command: ${cmd.englishCommand || ''}`);
        console.log(`[VOICE] Intent: ${cmd.intent}`);
        console.log(`[VOICE] Executing: ${cmd.intent}`);
        setStatus('success');
        voiceRecognitionService.stopListening();
        if (cmd.response) {
          setDialogText(cmd.response);
        }
        setTimeout(() => {
          executeParsedCommand({
            intent: cmd.intent,
            path: cmd.path,
            response: cmd.response,
            activityData: cmd.activityData,
            gameId: cmd.gameId
          });
          console.log('[VOICE] Success');
          console.log('[VOICE] Listening stopped');
        }, 1000);
      },
      onError: (err) => {
        console.error(`[VOICE] Error: ${err}`);
        console.log('[VOICE] Listening stopped');
        setShowFallbackInput(true);
        if (err === 'denied' || err === 'microphone-denied') {
          setStatus('denied');
          setDialogText('Microphone permission was denied. Please allow microphone access in settings.');
        } else if (err === 'unsupported') {
          setStatus('unsupported');
          setDialogText(t('voice.unsupported'));
        } else if (err === 'microphone-unavailable') {
          setStatus('error');
          setDialogText('Microphone is unavailable, muted, or not connected.');
        } else if (err === 'empty-recording') {
          setStatus('error');
          setDialogText('Microphone recording produced no audio. Please speak louder.');
        } else if (err === 'model-missing') {
          setStatus('error');
          setDialogText('Local model or executable is missing in the backend folder.');
        } else if (err === 'service-unavailable' || err === 'network') {
          setStatus('error');
          setDialogText('Voice service is unavailable. Please check if the local backend server is running.');
        } else {
          setStatus('error');
          setDialogText('Voice recognition failed or process execution failed.');
        }
      },
      onEnd: () => {
        // Handled dynamically
      }
    });
  };

  const handleTextInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setClarificationData(null);
    setCreatedActivity(null);
    handleCommandParse(textInput);
    setTextInput('');
  };

  const handleManualActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    saveCreatedActivity(manualTitle.trim(), manualTime, new Date().toISOString().split('T')[0], 'other', true);
    setManualTitle('');
    setShowManualForm(false);
  };

  const handleClarificationSubmit = (val: string) => {
    if (!clarificationData) return;
    const isTitle = clarificationData.missingField === 'title';
    const updated = {
      ...clarificationData,
      title: isTitle ? val : clarificationData.title,
      time: !isTitle ? val : clarificationData.time,
      needClarification: false
    };
    // Re-verify and save
    if (!updated.title) {
      setDialogText('What is the name of the activity you want to schedule?');
      setClarificationData({ ...updated, missingField: 'title', needClarification: true });
    } else if (!updated.time) {
      setDialogText(`What time should I schedule your "${updated.title}"?`);
      setClarificationData({ ...updated, missingField: 'time', needClarification: true });
    } else {
      saveCreatedActivity(updated.title, updated.time, updated.date, updated.category, updated.createReminder);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-brand-purpleLight pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white text-brand-purple transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy">{t('nav.talkToMe')}</h1>
          <p className="text-brand-grayText font-medium mt-1">Real offline voice recognition assistant.</p>
        </div>
      </div>

      {/* Main Dialog Panel - Warm, glowing Home Voice Assistant style */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 border-2 border-amber-300/80 p-6 sm:p-8 shadow-lg shadow-amber-500/5 flex flex-col items-center justify-center text-center space-y-6 min-h-[320px]">
        {/* Soft glowing ambient circle */}
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-2xl font-bold text-amber-950 leading-relaxed max-w-md relative z-10">
          {dialogText}
        </h2>

        {lastCommand && (
          <p className="text-amber-900 font-semibold bg-amber-100/90 border border-amber-200 px-4 py-1.5 rounded-full text-sm shadow-2xs relative z-10">
            {t('voice.youSaid')}: "{lastCommand}"
          </p>
        )}

        {/* Dynamic states & inputs */}
        {status === 'unsupported' ? (
          <div className="w-full max-w-md space-y-4 relative z-10">
            <form onSubmit={handleTextInputSubmit} className="w-full flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your command here..."
                className="flex-1 px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-500 font-semibold text-amber-950"
              />
              <button type="submit" className="p-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col items-center space-y-5 relative z-10">
            {/* Mic button with glowing ring */}
            <div className="relative flex items-center justify-center">
              {status === 'listening' && (
                <>
                  <span className="absolute w-36 h-36 rounded-full bg-rose-500/20 animate-ping" />
                  <span className="absolute w-32 h-32 rounded-full bg-rose-500/30 animate-pulse" />
                </>
              )}
              {status === 'processing' && (
                <span className="absolute w-32 h-32 rounded-full bg-amber-500/30 animate-ping" />
              )}
              <button
                onClick={handleMicToggle}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4 ${
                  status === 'listening' 
                    ? 'bg-rose-600 border-rose-300 text-white scale-95 shadow-rose-500/40' 
                    : status === 'processing'
                    ? 'bg-amber-500 border-amber-200 text-white animate-pulse shadow-amber-500/40'
                    : status === 'success'
                    ? 'bg-emerald-600 border-emerald-300 text-white shadow-emerald-500/40'
                    : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 border-amber-200 text-white hover:scale-105 active:scale-95 shadow-amber-500/30'
                }`}
                aria-label={status === 'listening' ? 'Stop listening' : 'Tap to talk'}
              >
                {status === 'listening' ? (
                  <MicOff className="w-11 h-11 animate-pulse" />
                ) : (
                  <Mic className="w-11 h-11" />
                )}
              </button>
            </div>

            {/* Pill Badge */}
            <div className="flex flex-col items-center gap-1">
              <span className={`text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-2xs ${
                status === 'listening'
                  ? 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
                  : status === 'processing'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-bounce'
                  : status === 'success'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                  : 'bg-amber-100/80 text-amber-900 border-amber-200'
              }`}>
                {status === 'listening' ? `Listening... (${recordingSeconds}s)` :
                 status === 'processing' ? 'Thinking...' :
                 status === 'success' ? 'Understood' :
                 'Tap button to talk'}
              </span>
              <span className="text-xs font-bold text-amber-900/70">
                {status === 'listening' ? 'Speak clearly into your device' :
                 status === 'processing' ? 'Understanding your request' :
                 'Tap microphone to speak to ALPINE'}
              </span>
            </div>

            {/* Animated Waveform Visualizer */}
            <div className="flex items-center justify-center gap-1.5 h-6 px-4 w-full">
              {status === 'listening' ? (
                <>
                  <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1.5 h-8 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1.5 h-7 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  <span className="w-1.5 h-5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                </>
              ) : status === 'processing' ? (
                <div className="flex gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              ) : (
                <div className="w-36 h-1 bg-amber-300/40 rounded-full opacity-60" />
              )}
            </div>

            {/* Fallback Input */}
            {showFallbackInput && (status === 'idle' || status === 'denied' || status === 'error' || status === 'processing' || status === 'success') && (
              <div className="w-full space-y-4 pt-4 border-t border-amber-200/60">
                <form onSubmit={handleTextInputSubmit} className="w-full flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Or type your command here..."
                    className="flex-1 px-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-500 font-semibold text-amber-950"
                  />
                  <button type="submit" className="p-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </form>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManualForm(!showManualForm)}
                    className="px-4 py-2 text-xs bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold hover:bg-amber-200 transition-all"
                  >
                    {showManualForm ? 'Hide Manual Form' : 'Or Create Activity Manually'}
                  </button>
                  
                  {showManualForm && (
                    <form onSubmit={handleManualActivitySubmit} className="bg-brand-lavender border border-brand-purpleLight p-4 rounded-xl text-left space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1">Activity Title</label>
                        <input
                          type="text"
                          value={manualTitle}
                          onChange={(e) => setManualTitle(e.target.value)}
                          placeholder="e.g. Evening Walk"
                          className="w-full px-3 py-2 rounded-lg border border-brand-purpleLight bg-white text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-navy mb-1">Time</label>
                        <input
                          type="time"
                          value={manualTime}
                          onChange={(e) => setManualTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-brand-purpleLight bg-white text-sm"
                          required
                        />
                      </div>
                      <button type="submit" className="w-full py-2 bg-brand-purple text-white text-xs font-bold rounded-lg hover:bg-opacity-95">
                        Save Activity
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clarification Dialog inputs */}
        {clarificationData && (
          <div className="w-full max-w-sm space-y-3 pt-2">
            {clarificationData.missingField === 'title' ? (
              <input
                type="text"
                placeholder="e.g. Evening Walk"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleClarificationSubmit(e.currentTarget.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight text-center font-bold text-brand-navy"
              />
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="time"
                  defaultValue="18:00"
                  id="clarify-time-input"
                  className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight text-center font-bold text-brand-navy"
                />
                <button
                  onClick={() => {
                    const val = (document.getElementById('clarify-time-input') as HTMLInputElement).value;
                    handleClarificationSubmit(val);
                  }}
                  className="w-full py-3 bg-brand-purple text-white rounded-xl font-bold"
                >
                  Confirm Time
                </button>
              </div>
            )}
          </div>
        )}

        {/* Activity Creation Success Box */}
        {createdActivity && (
          <div className="bg-brand-lavender border border-brand-purpleLight p-6 rounded-2xl w-full max-w-md space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-brand-purpleLight pb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-brand-purple">âœ“ Activity added</span>
              {createdActivity.reminderCreated && (
                <span className="text-[10px] bg-brand-purpleLight text-brand-purple font-extrabold px-2 py-0.5 rounded">Reminder added too</span>
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-brand-navy">{createdActivity.title}</h4>
              <p className="text-sm font-semibold text-brand-grayText">{createdActivity.time} â€¢ {createdActivity.date}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCreatedActivity(null)}
                className="flex-1 py-2 text-center bg-brand-purple text-white font-bold rounded-xl text-sm"
              >
                Done
              </button>
              <button
                onClick={() => navigate('/day')}
                className="flex-1 py-2 text-center bg-white text-brand-purple border border-brand-purpleLight font-bold rounded-xl text-sm"
              >
                View My Day
              </button>
            </div>
          </div>
        )}

        <span className="text-xs uppercase tracking-widest font-extrabold text-brand-purple">
          {status === 'listening' ? t('voice.listening') :
           status === 'processing' ? t('voice.understanding') :
           status === 'denied' ? 'Permission Denied' :
           status === 'unsupported' ? 'Unsupported Browser' : t('voice.idle')}
        </span>
      </div>

      {/* Suggestion Cards */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-brand-navy flex items-center gap-2 text-lg">
          <HelpCircle className="w-5 h-5 text-brand-purple" />
          <span>{t('voice.trysaying')}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sampleCommands.map((suggestion, idx) => (
            <div
              key={idx}
              onClick={() => handleCommandParse(suggestion.cmd)}
              className="bg-white p-4 rounded-xl border border-brand-purpleLight shadow-sm hover:border-brand-purple cursor-pointer transition-all flex items-center justify-between"
            >
              <span className="font-semibold text-brand-navy">{suggestion.text}</span>
              <ChevronRight className="w-5 h-5 text-brand-purple" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


