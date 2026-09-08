import type {
  Reminder,
  Activity,
  Memory,
  Contact,
  GameScore,
  CaregiverAlert,
  PatientSettings
} from '../data/demoData';
import {
  initialPatientSettings,
  initialPatientProfile,
  initialCaregiverProfile,
  initialReminders,
  initialSchedule,
  initialMemories,
  initialContacts,
  initialGames,
  initialAlerts,
  initialMood
} from '../data/demoData';

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  gender?: 'Male' | 'Female';
  region?: string;
  caregiverName?: string;
  language: string;
  role: 'Patient' | 'Caregiver';
  pin?: string;
  password?: string;
  assignedPatients?: string[];
  photo?: string;
  email?: string;
  phone?: string;
}

const KEYS = {
  GLOBAL_SETTINGS: 'sb_settings',
  GLOBAL_PROFILES: 'sb_profiles',
  GLOBAL_CURRENT_USER: 'sb_current_user_id',
  
  // Base keys to be scoped per profile
  SETTINGS: 'settings',
  PROFILE: 'profile',
  CAREGIVER_PROFILE: 'caregiver_profile',
  REMINDERS: 'reminders',
  SCHEDULE: 'schedule',
  MEMORIES: 'memories',
  CONTACTS: 'contacts',
  GAMES: 'games',
  ALERTS: 'alerts',
  MOOD: 'mood'
};

export const storageService = {
  init() {
    try {
      // 1. Initialize global settings
      if (!localStorage.getItem(KEYS.GLOBAL_SETTINGS)) {
        localStorage.setItem(KEYS.GLOBAL_SETTINGS, JSON.stringify(initialPatientSettings));
      }
      
      // 2. Initialize global profiles list
      if (!localStorage.getItem(KEYS.GLOBAL_PROFILES)) {
        const defaultDemoProfile: UserProfile = {
          id: 'ravi-demo',
          name: 'Ravi',
          age: 78,
          caregiverName: 'Anu',
          language: 'English',
          role: 'Patient',
          gender: 'Male',
          pin: '1234'
        };
        const patientProfile1: UserProfile = {
          id: 'ramesh_1',
          name: 'Ramesh',
          age: 76,
          caregiverName: 'Caregiver',
          language: 'English',
          role: 'Patient',
          gender: 'Male',
          pin: '1234'
        };
        const patientProfile2: UserProfile = {
          id: 'raja-id',
          name: 'RAJA',
          age: 72,
          caregiverName: 'Caregiver',
          language: 'English',
          role: 'Patient',
          gender: 'Male',
          pin: '1234'
        };
        const patientProfile3: UserProfile = {
          id: 'sita-id',
          name: 'SITA',
          age: 75,
          caregiverName: 'Caregiver',
          language: 'English',
          role: 'Patient',
          gender: 'Female',
          pin: '1234'
        };
        const patientProfile4: UserProfile = {
          id: 'anu-patient-id',
          name: 'ANU',
          age: 70,
          caregiverName: 'Caregiver',
          language: 'English',
          role: 'Patient',
          gender: 'Female',
          pin: '1234'
        };
        const caregiverProfile1: UserProfile = {
          id: 'caregiver',
          name: 'Caregiver',
          language: 'English',
          role: 'Caregiver',
          password: 'caregiver123',
          assignedPatients: ['ravi-demo', 'ramesh_1']
        };
        localStorage.setItem(KEYS.GLOBAL_PROFILES, JSON.stringify([
          defaultDemoProfile, 
          patientProfile1, 
          patientProfile2, 
          patientProfile3, 
          patientProfile4, 
          caregiverProfile1
        ]));
      }

      // Initialize the seed data for default profiles if they don't exist
      const profilesToSeed = [
        { id: 'ravi-demo', name: 'Ravi', age: 78, gender: 'Male' },
        { id: 'ramesh_1', name: 'Ramesh', age: 76, gender: 'Male' },
        { id: 'raja-id', name: 'RAJA', age: 72, gender: 'Male' },
        { id: 'sita-id', name: 'SITA', age: 75, gender: 'Female' },
        { id: 'anu-patient-id', name: 'ANU', age: 70, gender: 'Female' }
      ];

      profilesToSeed.forEach(p => {
        const prefix = `sb_prof_${p.id}_`;
        if (!localStorage.getItem(prefix + KEYS.REMINDERS)) {
          localStorage.setItem(prefix + KEYS.SETTINGS, JSON.stringify(initialPatientSettings));
          localStorage.setItem(prefix + KEYS.PROFILE, JSON.stringify({
            name: p.name,
            age: p.age,
            region: 'Guwahati, NER',
            avatar: 'user_avatar',
            gender: p.gender
          }));
          localStorage.setItem(prefix + KEYS.CAREGIVER_PROFILE, JSON.stringify(initialCaregiverProfile));
          localStorage.setItem(prefix + KEYS.REMINDERS, JSON.stringify(p.id === 'ravi-demo' || p.id === 'ramesh_1' ? initialReminders : []));
          localStorage.setItem(prefix + KEYS.SCHEDULE, JSON.stringify(p.id === 'ravi-demo' || p.id === 'ramesh_1' ? initialSchedule : []));
          localStorage.setItem(prefix + KEYS.MEMORIES, JSON.stringify(p.id === 'ravi-demo' || p.id === 'ramesh_1' ? initialMemories : []));
          localStorage.setItem(prefix + KEYS.CONTACTS, JSON.stringify(initialContacts));
          localStorage.setItem(prefix + KEYS.GAMES, JSON.stringify(p.id === 'ravi-demo' || p.id === 'ramesh_1' ? initialGames : [
            { gameId: 'game-1', gameName: 'Memory Match', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
            { gameId: 'game-2', gameName: 'Sequence & Order', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
            { gameId: 'game-3', gameName: 'Attention Focus', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
            { gameId: 'game-4', gameName: 'Object Recognition', difficulty: 'Medium', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
            { gameId: 'game-5', gameName: 'Daily Routine Recall', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
            { gameId: 'game-6', gameName: 'Language & Word Memory', difficulty: 'Medium', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 }
          ]));
          localStorage.setItem(prefix + KEYS.ALERTS, JSON.stringify(p.id === 'ravi-demo' || p.id === 'ramesh_1' ? initialAlerts : []));
          localStorage.setItem(prefix + KEYS.MOOD, initialMood);
        }
      });
    } catch (e) {
      console.warn('LocalStorage is not accessible. Running in-memory instead.', e);
    }
  },

  // Profile management APIs
  getProfiles(): UserProfile[] {
    return this.getGlobal<UserProfile[]>(KEYS.GLOBAL_PROFILES, []);
  },

  getCurrentUser(): UserProfile | null {
    const currentId = localStorage.getItem(KEYS.GLOBAL_CURRENT_USER);
    if (!currentId) return null;
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === currentId) || null;
  },

  setCurrentUser(profileId: string | null) {
    if (profileId === null) {
      localStorage.removeItem(KEYS.GLOBAL_CURRENT_USER);
    } else {
      localStorage.setItem(KEYS.GLOBAL_CURRENT_USER, profileId);
    }
  },

  createProfile(
    name: string,
    age?: number,
    caregiverName?: string,
    language: string = 'English',
    role: 'Patient' | 'Caregiver' = 'Patient',
    gender?: 'Male' | 'Female',
    pin?: string,
    password?: string,
    assignedPatients?: string[],
    region?: string
  ): UserProfile {
    const id = `profile-${Date.now()}`;
    const newProfile: UserProfile = {
      id,
      name,
      age,
      caregiverName,
      language,
      role,
      gender,
      pin,
      password,
      assignedPatients
    };

    const profiles = this.getProfiles();
    profiles.push(newProfile);
    localStorage.setItem(KEYS.GLOBAL_PROFILES, JSON.stringify(profiles));

    // Seed data for the new profile to avoid empty states
    const prefix = `sb_prof_${id}_`;
    const patientProfile = {
      name,
      age: age || 75,
      region: region || 'Guwahati, NER',
      avatar: 'user_avatar',
      gender: gender || 'Male'
    };
    const cgProfile = {
      name: caregiverName || 'Caregiver',
      relationship: 'Support',
      avatar: 'caregiver_avatar'
    };

    localStorage.setItem(prefix + KEYS.SETTINGS, JSON.stringify({ ...initialPatientSettings, language }));
    localStorage.setItem(prefix + KEYS.PROFILE, JSON.stringify(patientProfile));
    localStorage.setItem(prefix + KEYS.CAREGIVER_PROFILE, JSON.stringify(cgProfile));
    localStorage.setItem(prefix + KEYS.REMINDERS, JSON.stringify(initialReminders));
    localStorage.setItem(prefix + KEYS.SCHEDULE, JSON.stringify([]));
    localStorage.setItem(prefix + KEYS.MEMORIES, JSON.stringify([]));
    localStorage.setItem(prefix + KEYS.CONTACTS, JSON.stringify(initialContacts));
    localStorage.setItem(prefix + KEYS.GAMES, JSON.stringify([
      { gameId: 'game-1', gameName: 'Memory Match', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
      { gameId: 'game-2', gameName: 'Sequence & Order', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
      { gameId: 'game-3', gameName: 'Attention Focus', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
      { gameId: 'game-4', gameName: 'Object Recognition', difficulty: 'Medium', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
      { gameId: 'game-5', gameName: 'Daily Routine Recall', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
      { gameId: 'game-6', gameName: 'Language & Word Memory', difficulty: 'Medium', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 }
    ]));
    localStorage.setItem(prefix + KEYS.ALERTS, JSON.stringify([]));
    localStorage.setItem(prefix + KEYS.MOOD, initialMood);

    return newProfile;
  },

  logout() {
    this.setCurrentUser(null);
  },

  updateCaregiverAssignedPatients(caregiverId: string, assignedPatients: string[]) {
    const profiles = this.getProfiles();
    const updated = profiles.map(p => {
      if (p.id === caregiverId || p.role === 'Caregiver') {
        return { ...p, assignedPatients };
      }
      return p;
    });
    localStorage.setItem(KEYS.GLOBAL_PROFILES, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  updateProfilePhoto(profileId: string, photoBase64: string) {
    const profiles = this.getProfiles();
    const targetId = profileId || 'caregiver';
    const updated = profiles.map(p => {
      if (p.id === targetId || (p.role === 'Caregiver' && targetId === 'caregiver')) {
        return { ...p, photo: photoBase64 };
      }
      return p;
    });
    localStorage.setItem(KEYS.GLOBAL_PROFILES, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  // Scoped key helper
  getScopedKey(baseKey: string): string {
    const user = this.getCurrentUser();
    if (user && user.role === 'Caregiver') {
      const selectedPatientId = localStorage.getItem('sb_caregiver_selected_patient_id');
      const assigned = user.assignedPatients || ['ramesh_1', 'ravi-demo'];
      if (selectedPatientId && assigned.includes(selectedPatientId)) {
        return `sb_prof_${selectedPatientId}_${baseKey}`;
      }
      return `sb_prof_${assigned[0] || 'ravi-demo'}_${baseKey}`;
    }
    const id = user ? user.id : 'ravi-demo';
    return `sb_prof_${id}_${baseKey}`;
  },

  // Scoped APIs
  getSettings(): PatientSettings {
    return this.get(this.getScopedKey(KEYS.SETTINGS), initialPatientSettings);
  },

  saveSettings(settings: PatientSettings) {
    this.set(this.getScopedKey(KEYS.SETTINGS), settings);
  },

  getProfile() {
    return this.get(this.getScopedKey(KEYS.PROFILE), initialPatientProfile);
  },

  saveProfile(profile: any) {
    this.set(this.getScopedKey(KEYS.PROFILE), profile);
  },

  getReminders(): Reminder[] {
    return this.get(this.getScopedKey(KEYS.REMINDERS), initialReminders);
  },

  saveReminders(reminders: Reminder[]) {
    this.set(this.getScopedKey(KEYS.REMINDERS), reminders);
  },

  getSchedule(): Activity[] {
    return this.get(this.getScopedKey(KEYS.SCHEDULE), []);
  },

  saveSchedule(schedule: Activity[]) {
    this.set(this.getScopedKey(KEYS.SCHEDULE), schedule);
  },

  getMemories(): Memory[] {
    return this.get(this.getScopedKey(KEYS.MEMORIES), []);
  },

  saveMemories(memories: Memory[]) {
    this.set(this.getScopedKey(KEYS.MEMORIES), memories);
  },

  getContacts(): Contact[] {
    return this.get(this.getScopedKey(KEYS.CONTACTS), initialContacts);
  },

  saveContacts(contacts: Contact[]) {
    this.set(this.getScopedKey(KEYS.CONTACTS), contacts);
  },

  getGames(): GameScore[] {
    const cleanDefaultGames: GameScore[] = [
      { gameId: 'game-1', gameName: 'Memory Match', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
      { gameId: 'game-2', gameName: 'Sequence & Order', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
      { gameId: 'game-3', gameName: 'Attention Focus', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
      { gameId: 'game-4', gameName: 'Object Recognition', difficulty: 'Medium', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
      { gameId: 'game-5', gameName: 'Daily Routine Recall', difficulty: 'Easy', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 },
      { gameId: 'game-6', gameName: 'Language & Word Memory', difficulty: 'Medium', progress: 0, bestScore: 0, completedToday: false, unlockedLevel: 1 }
    ];
    const list = this.get(this.getScopedKey(KEYS.GAMES), cleanDefaultGames);
    const todayStr = new Date().toISOString().split('T')[0];
    return list.map((g: any) => {
      const isCompletedToday = g.lastCompletedDate === todayStr ? (g.completedToday ?? false) : false;
      return {
        ...g,
        completedToday: isCompletedToday,
        unlockedLevel: g.unlockedLevel || 1
      };
    });
  },

  saveGames(games: GameScore[]) {
    const todayStr = new Date().toISOString().split('T')[0];
    const gamesToSave = games.map((g: any) => ({
      ...g,
      lastCompletedDate: g.completedToday ? (g.lastCompletedDate || todayStr) : g.lastCompletedDate
    }));
    this.set(this.getScopedKey(KEYS.GAMES), gamesToSave);
  },

  getGameSessions(): any[] {
    return this.get(this.getScopedKey('game_sessions'), []);
  },

  addGameSession(session: any) {
    const sessions = this.getGameSessions();
    sessions.push(session);
    this.set(this.getScopedKey('game_sessions'), sessions);
  },

  getAlerts(): CaregiverAlert[] {
    return this.get(this.getScopedKey(KEYS.ALERTS), initialAlerts);
  },

  saveAlerts(alerts: CaregiverAlert[]) {
    this.set(this.getScopedKey(KEYS.ALERTS), alerts);
  },

  getMood(): string {
    return localStorage.getItem(this.getScopedKey(KEYS.MOOD)) || initialMood;
  },

  saveMood(mood: string) {
    localStorage.setItem(this.getScopedKey(KEYS.MOOD), mood);
  },

  // Underlying helper methods
  get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  set(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Notify other tabs via BroadcastChannel or storage event
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to set item in storage', e);
    }
  },

  getGlobal<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }
};
