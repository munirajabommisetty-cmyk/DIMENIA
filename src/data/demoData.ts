export interface Reminder {
  id: string;
  category: 'medicine' | 'hydration' | 'meals' | 'exercise' | 'appointments' | 'family' | 'other';
  title: string;
  description: string;
  time: string;
  date: string;
  status: 'Upcoming' | 'Scheduled' | 'Completed' | 'Missed';
  repeat: string;
  enabled: boolean;
  isDefault?: boolean;
  translations?: Record<string, { title: string; description?: string }>;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  completed: boolean;
  isCurrent?: boolean;
  date?: string;
  translations?: Record<string, { title: string; description?: string }>;
}

export interface Memory {
  id: string;
  title: string;
  date: string;
  people: string;
  description: string;
  category: 'family' | 'places' | 'events' | 'other';
  image: string; // Base64 dataURL or local SVG key
}

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  avatarSeed: string; // key for local avatar render
}

export interface GameScore {
  gameId: string;
  gameName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  progress: number; // percentage
  bestScore: number;
  completedToday: boolean;
  history?: { date: string; score: number }[];
  unlockedLevel?: number;
}

export interface CaregiverAlert {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  time: string;
}

export interface PatientSettings {
  textSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  reduceMotion: boolean;
  voiceAssistant: boolean;
  language: string;
}

export const initialPatientSettings: PatientSettings = {
  textSize: 'normal',
  highContrast: false,
  reduceMotion: false,
  voiceAssistant: true,
  language: 'English',
};

export const initialPatientProfile = {
  name: 'Ravi',
  age: 78,
  region: 'Guwahati, Assam',
  avatar: 'ravi_avatar',
};

export const initialCaregiverProfile = {
  name: 'Anu',
  relationship: 'Daughter',
  avatar: 'anu_avatar',
};

export const initialReminders: Reminder[] = [
  {
    id: 'rem-default-water',
    category: 'hydration',
    title: 'DRINK WATER',
    description: 'Keep hydrated, drink a full glass of water',
    time: '11:00',
    date: '2026-08-28',
    status: 'Upcoming',
    repeat: 'Every 2 hours',
    enabled: true,
    isDefault: true
  },
  {
    id: 'rem-default-walk',
    category: 'exercise',
    title: 'WALK — 10 minutes',
    description: 'Time for a light 10-minute walk in the garden or room',
    time: '17:00',
    date: '2026-08-28',
    status: 'Upcoming',
    repeat: 'Daily',
    enabled: true,
    isDefault: true
  }
];

export const initialSchedule: Activity[] = [
  { id: 'sch-1', time: '08:00 AM', title: 'Breakfast', completed: true },
  { id: 'sch-2', time: '09:00 AM', title: 'Brain Game (Memory Match)', completed: true },
  { id: 'sch-3', time: '01:00 PM', title: 'Lunch', completed: true },
  { id: 'sch-4', time: '02:00 PM', title: 'Medicine (Hypertension)', completed: false, isCurrent: true },
  { id: 'sch-5', time: '04:00 PM', title: 'Rest Time', completed: false },
  { id: 'sch-6', time: '05:00 PM', title: 'Call Anu (Daughter)', completed: false },
  { id: 'sch-7', time: '06:00 PM', title: 'Evening Walk', completed: false },
  { id: 'sch-8', time: '08:00 PM', title: 'Dinner', completed: false }
];

export const initialMemories: Memory[] = [
  {
    id: 'mem-1',
    title: 'Family Picnic in Shillong',
    date: '2025-05-15',
    people: 'Anu, Ramesh, Grandchildren',
    description: 'A beautiful sunny day at Elephant Falls, Shillong. We had delicious home-cooked food.',
    category: 'events',
    image: 'picnic'
  },
  {
    id: 'mem-2',
    title: 'Old House in Tezpur',
    date: '1988-10-10',
    people: 'Meena, Self',
    description: 'Our first home with the beautiful garden of orchids. Anu took her first steps here.',
    category: 'places',
    image: 'old_house'
  },
  {
    id: 'mem-3',
    title: 'Bihu Festival Celebration',
    date: '2026-04-14',
    people: 'Family and Friends',
    description: 'Celebrating Rongali Bihu. Playing the dhol and eating pitha. Happy moments.',
    category: 'events',
    image: 'festival'
  },
  {
    id: 'mem-4',
    title: 'Hornbill Festival',
    date: '2025-12-01',
    people: '',
    description: "A major cultural festival of Nagaland celebrating the state's rich tribal heritage, traditional music, dance, crafts, food, and cultural traditions.",
    category: 'events',
    image: 'hornbill'
  },
  {
    id: 'mem-5',
    title: 'Diwali',
    date: '2025-11-05',
    people: '',
    description: 'The Festival of Lights, celebrated with lamps, family gatherings, decorations, sweets, and traditional celebrations.',
    category: 'events',
    image: 'diwali'
  }
];

export const initialContacts: Contact[] = [
  { id: 'con-1', name: 'Anu', relationship: 'Daughter', phone: '+91 98765 43210', avatarSeed: 'anu' },
  { id: 'con-2', name: 'Ramesh', relationship: 'Son', phone: '+91 98765 01234', avatarSeed: 'ramesh' },
  { id: 'con-3', name: 'Meena', relationship: 'Wife', phone: '+91 98765 56789', avatarSeed: 'meena' },
  { id: 'con-4', name: 'Dr. Barua', relationship: 'Caregiver / Doctor', phone: '+91 94350 11223', avatarSeed: 'doctor' }
];

export const initialGames: GameScore[] = [
  { gameId: 'game-1', gameName: 'Memory Match', difficulty: 'Easy', progress: 100, bestScore: 92, completedToday: true },
  { gameId: 'game-2', gameName: 'Sequence & Order', difficulty: 'Easy', progress: 80, bestScore: 85, completedToday: true },
  { gameId: 'game-3', gameName: 'Attention Focus', difficulty: 'Easy', progress: 100, bestScore: 90, completedToday: true },
  { gameId: 'game-4', gameName: 'Object Recognition', difficulty: 'Medium', progress: 50, bestScore: 78, completedToday: false },
  { gameId: 'game-5', gameName: 'Daily Routine Recall', difficulty: 'Easy', progress: 100, bestScore: 95, completedToday: true },
  { gameId: 'game-6', gameName: 'Language & Word Memory', difficulty: 'Medium', progress: 0, bestScore: 0, completedToday: false }
];

export const initialAlerts: CaregiverAlert[] = [
  { id: 'al-1', type: 'warning', title: 'Medicine reminder missed', time: 'Today, 2:15 PM' },
  { id: 'al-2', type: 'success', title: 'Brain game completed', time: 'Today, 9:20 AM' },
  { id: 'al-3', type: 'success', title: 'Walk completed', time: 'Yesterday, 6:05 PM' }
];

export const initialMood = 'Good';
