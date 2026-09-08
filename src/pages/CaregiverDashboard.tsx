import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Plus, 
  Phone, 
  X,
  Activity as ActivityIcon,
  Sparkles,
  Brain,
  CheckCircle2,
  Calendar,
  CheckSquare,
  Info,
  ChevronDown,
  Users,
  Trash2,
  Camera,
  User,
  Mail,
  PhoneCall,
  ShieldCheck
} from 'lucide-react';
import { storageService, type UserProfile } from '../services/storageService';
import type { Reminder, Activity, CaregiverAlert, GameScore, Memory } from '../data/demoData';
import { useLanguage } from '../context/LanguageContext';
import { getISODateString } from '../utils/dateUtils';
import { SVGElderlyAvatar } from '../components/SVGIcons';
import { TimeSelector12h } from '../components/TimeSelector12h';

const localCgTranslations: Record<string, Record<string, string>> = {
  English: {
    welcome: 'Welcome,',
    patientOverview: 'Patient Overview',
    todayProgress: "Today's Progress",
    brainTraining: 'Brain Training',
    currentStreak: 'Current Streak',
    remindersStatus: 'Reminders',
    lastActivity: 'Last Activity',
    patientActivity: 'Patient Activity',
    noRecentActivity: 'No recent patient activity',
    statusActive: 'Active',
    statusNeedsAttention: 'Needs Attention',
    statusNoActivity: 'No Recent Activity',
    perfArea: 'PERFORMANCE BY AREA',
    perfSub: "Patient's cognitive performance across different areas.",
    memory: 'Memory',
    attention: 'Attention',
    problemSolving: 'Problem Solving',
    overall: 'Overall',
    noPerfData: 'Complete a few brain games to see performance insights.',
    addPatient: 'Add Patient',
    selectPatient: 'Select Patient:',
    cgQuickActions: 'Caregiver Quick Actions',
    addReminderBtn: 'Add Reminder',
    callPatient: 'Call Patient',
    scheduledFromCg: 'Scheduled from Caregiver Panel',
    noReminders: 'No reminders scheduled',
    today: 'Today',
    weeklyProgress: 'Weekly Progress',
    completed: 'Completed',
    upcoming: 'Upcoming',
    missed: 'Missed',
    snoozed: 'Snoozed',
    days: 'Days',
    activeNow: 'Active Now',
    insightNoData: 'No performance data yet. Encourage the patient to complete a few brain-training activities.',
    insightLow: 'Memory and attention activities may need more practice this week.',
    insightMedium: 'Patient is showing steady cognitive performance across brain training games.',
    insightHigh: 'Strong performance across recent activities.',
    justNow: 'Just now',
    minAgo: 'min ago',
    hrAgo: 'hr ago',
    hrsAgo: 'hrs ago',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',
    recently: 'Recently',
    reviewMissed: 'Review Missed Reminder',
    viewUpcoming: 'View Upcoming Reminders',
    encourageBrain: 'Encourage Brain Training',
    checkPatientActivity: 'Check Patient Activity',
    viewTodayProgress: "View Today's Progress",
    caregiverProfile: 'Caregiver Profile',
    registeredPatients: 'Registered Patient Accounts',
    selectPatientSub: 'Select a patient to monitor or add registered accounts',
    added: 'Added',
    alreadyAdded: 'Already Added',
    activeMonitoring: 'Active Monitoring',
    completedRecorded: 'Completed activities recorded',
    zeroRecorded: '0% activity recorded',
    hoverInspectDetails: 'Hover or tap any day node to inspect details',
    zeroWeeklyBaseline: '0% Weekly Baseline',
    weeklyTrendAnalytics: 'Weekly Trend Analytics',
    noProgressThisWeek: 'No progress recorded yet for this week',
    allGoalsCompleted: 'All goals completed!',
    dailyExercises: 'Daily exercises',
    activeStreak: 'Active streak',
    done: 'done',
    next: 'next',
    missedToday: 'missed today',
    noMissedItems: 'No missed items',
    todayProgressUpper: "TODAY'S PROGRESS",
    weeklyProgressUpper: "WEEKLY PROGRESS",
    dailyProgressSub: 'Real-time task, game, and reminder completion for today',
    weeklyProgressSub: 'Patient activity and goal completion trends over the week',
    daily: 'Daily',
    weekly: 'Weekly',
    tasksCompleted: 'Tasks Completed',
    remindersCompleted: 'Reminders Completed',
    overallProgress: 'Overall Progress',
    activity: 'Activity',
    timeline: 'Timeline',
    activityLogEmptySub: 'Activity logs will appear here as tasks or games are completed.',
    cognitiveInsights: 'Cognitive Insights',
    memoryGamesSub: 'Memory Match & Routine Recall',
    attentionGamesSub: 'Attention Focus & Object Recognition',
    problemSolvingGamesSub: 'Sequence & Order',
    cgInsightTitle: 'Caregiver Insight',
    cgInsightSub: 'Data-Driven Recommendation',
    addCustomReminderTitle: 'Add Custom Reminder',
    reminderTitleLabel: 'Reminder Title',
    reminderPlaceholder: 'e.g. Drink Water or Take Medicine',
    scheduledTimeLabel: 'Scheduled Time',
    categoryLabel: 'Category',
    catMedicine: 'Medicine',
    catHydration: 'Hydration',
    catMeals: 'Meals',
    catExercise: 'Exercise',
    catAppointments: 'Appointments',
    catFamily: 'Family',
    catOther: 'Other',
    repeatIntervalLabel: 'Repeat Interval',
    repDaily: 'Daily',
    repWeekly: 'Weekly',
    repEvery2h: 'Every 2 hours',
    repOnce: 'Once',
    removePatientTitle: 'Remove',
    cgAssociationSub: 'Caregiver Association',
    removeConfirmMsg: 'Are you sure you want to remove this patient from your caregiver dashboard?',
    patientSafetyNotice: "Patient account safety: The patient's account, game scores, and memories will remain completely safe and preserved.",
    cancel: 'Cancel',
    removePatientBtn: 'Remove Patient',
    changePhotoTitle: 'Change Profile Picture',
    roleCaregiverLabel: 'Role: Caregiver',
    accountIdLabel: 'Account ID',
    ageLabel: 'Age',
    yrsLabel: 'yrs',
    genderLabel: 'Gender',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    assignedPatientsLabel: 'Assigned Patients',
    patientsCountLabel: 'Patient(s)',
    changeProfilePicBtn: 'Change Profile Picture',
    closeBtn: 'Close',
    toastInvalidFile: 'Invalid file format. Please select a JPG, PNG, WEBP image.',
    toastImageFailed: 'Failed to process image file. Please try again.',
    toastPhotoUpdated: 'Profile picture updated successfully!',
    toastPhotoFailed: 'Failed to save profile picture. Please try again.',
    toastImageReadError: 'Error reading image file. Please try again.',
    toastPatientAdded: 'Patient added & selected!',
    toastUnableAddPatient: 'Unable to add this patient. Please try again.',
    toastPatientRemoved: 'Patient removed successfully.',
    toastUnableRemovePatient: 'Unable to remove patient. Please try again.',
    toastReminderAdded: 'Reminder added for',
    level: 'Level',
    progressPct: 'Progress',
    femaleLabel: 'Female',
    maleLabel: 'Male',
    regionLabel: 'Guwahati, NER',
    noRegisteredPatients: 'No registered patients available.',
    registeredAccountLabel: 'Registered Account',
    gameMemoryMatch: 'Memory Match',
    gameSequenceOrder: 'Sequence & Order',
    gameAttentionFocus: 'Attention Focus',
    gameObjectRecognition: 'Object Recognition',
    gameRoutineRecall: 'Daily Routine Recall',
    titleBreakfast: 'Breakfast',
    titleLunch: 'Lunch',
    titleDinner: 'Dinner'
  },
  Assamese: {
    welcome: 'স্বাগতম,',
    patientOverview: 'ৰোগীৰ বুজাবুজি',
    todayProgress: 'আজিৰ প্ৰগতি',
    brainTraining: 'মগজুৰ অনুশীলন',
    currentStreak: 'বৰ্তমান ধাৰাবাহিকতা',
    remindersStatus: 'অনুস্মাৰক',
    lastActivity: 'শেহতীয়া কাৰ্যকলাপ',
    patientActivity: 'ৰোগীৰ কাৰ্যসূচী',
    noRecentActivity: 'কোনো শেহতীয়া ৰোগীৰ কাৰ্যকলাপ নাই',
    statusActive: 'সক্ৰিয়',
    statusNeedsAttention: 'মনোযোগৰ প্ৰয়োজন',
    statusNoActivity: 'কোনো সক্ৰিয়তা নাই',
    perfArea: 'পৰিদৰ্শন ক্ষেত্ৰ',
    perfSub: 'মগজুৰ বিভিন্ন অংশৰ স্ক’ৰসমূহ।',
    memory: 'স্মৃতিশক্তি',
    attention: 'মনোযোগ',
    problemSolving: 'সমস্যা সমাধান',
    overall: 'সামগ্ৰিক',
    noPerfData: 'পৰিদৰ্শন তথ্য দেখিবলৈ কিছু অনুশীলন সম্পূৰ্ণ কৰক।',
    addPatient: 'ৰোগী যোগ কৰক',
    selectPatient: 'ৰোগী বাছনি কৰক:',
    cgQuickActions: 'তত্ত্বাৱধায়কৰ ক্ষিপ্ৰ কাৰ্য্যসূচী',
    addReminderBtn: 'অনুস্মাৰক যোগ কৰক',
    callPatient: 'ৰোগীলৈ কল কৰক',
    scheduledFromCg: 'তত্ত্বাৱধায়ক পেনেলৰ পৰা যোগ কৰা হৈছে',
    noReminders: 'কোনো অনুস্মাৰক নাই',
    today: 'আজি',
    weeklyProgress: 'সপ্তাহিক প্ৰগতি',
    completed: 'সম্পূৰ্ণ হ’ল',
    upcoming: 'অনাগত',
    missed: 'পাৰ হৈ গ’ল',
    snoozed: 'পিছলৈ থোৱা হ’ল',
    days: 'দিন',
    activeNow: 'এতিয়া সক্ৰিয়',
    insightNoData: 'কোনো কাৰ্যক্ষমতাৰ তথ্য নাই। ৰোগীক কিছু অনুশীলন সম্পূৰ্ণ কৰিবলৈ উৎসাহিত কৰক।',
    insightLow: 'স্মৃতিশক্তি আৰু মনোযোগৰ অনুশীলনে এই সপ্তাহত অধিক অভ্যাস বিচাৰে।',
    insightMedium: 'ৰোগীয়ে মগজুৰ অনুশীলনত সুস্থিৰ প্ৰগতি দেখুৱাইছে।',
    insightHigh: 'শেহতীয়া কাৰ্যসূচীত উৎকৃষ্ট প্ৰদৰ্শন।',
    justNow: 'এইমাত্র',
    minAgo: 'মিনিট আগতে',
    hrAgo: 'ঘণ্টা আগতে',
    hrsAgo: 'ঘণ্টা আগতে',
    yesterday: 'যোৱাকালিলৈ',
    daysAgo: 'দিন আগতে',
    recently: 'শেহতীয়াকৈ',
    reviewMissed: 'পাৰ হৈ যোৱা অনুস্মাৰক পৰীক্ষা কৰক',
    viewUpcoming: 'অনাগত অনুস্মাৰক চাওক',
    encourageBrain: 'মগজুৰ অনুশীলন কৰাবলৈ উচাহ দিয়ক',
    checkPatientActivity: 'ৰোগীৰ কাৰ্যসূচী পৰীক্ষা কৰক',
    viewTodayProgress: 'আজিৰ প্ৰগতি চাওক',
    caregiverProfile: 'তত্ত্বাৱধায়ক প্ৰফাইল',
    registeredPatients: 'পঞ্জীকৃত ৰোগীৰ একাউন্টসমূহ',
    selectPatientSub: 'ৰোগী বাছনি কৰক বা নতুন যোগ কৰক',
    added: 'যোগ হ’ল',
    alreadyAdded: 'ইতিমধ্যে যোগ কৰা হৈছে',
    activeMonitoring: 'সক্ৰিয় পৰ্যবেক্ষণ',
    completedRecorded: 'সম্পূৰ্ণ কাৰ্যসূচী সংৰক্ষিত',
    zeroRecorded: '০% কাৰ্যসূচী সংৰক্ষিত',
    hoverInspectDetails: 'বিশদ চাবলৈ দিনত টিপক',
    zeroWeeklyBaseline: '০% সপ্তাহিক ভিত্তিক',
    weeklyTrendAnalytics: 'সপ্তাহিক ধাৰাৰ বিশ্লেষণ',
    noProgressThisWeek: 'এই সপ্তাহত কোনো প্ৰগতি সংৰক্ষিত হোৱা নাই',
    allGoalsCompleted: 'সকলো লক্ষ্য সম্পূৰ্ণ হ’ল!',
    dailyExercises: 'দৈনিক অনুশীলন',
    activeStreak: 'সক্ৰিয় ধাৰাবাহিকতা',
    done: 'সম্পূৰ্ণ',
    next: 'অহা',
    missedToday: 'আজি পাৰ হ’ল',
    noMissedItems: 'কোনো পাৰ হোৱা অনুস্মাৰক নাই',
    todayProgressUpper: 'আজিৰ প্ৰগতি',
    weeklyProgressUpper: 'সপ্তাহিক প্ৰগতি',
    dailyProgressSub: 'আজিৰ কাম, খেল আৰু অনুস্মাৰকৰ প্ৰগতি',
    weeklyProgressSub: 'সপ্তাহজুৰি ৰোগীৰ কাৰ্যসূচীৰ ধাৰা',
    daily: 'দৈনিক',
    weekly: 'সপ্তাহিক',
    tasksCompleted: 'সম্পূৰ্ণ কাৰ্য্যসূচী',
    remindersCompleted: 'সম্পূৰ্ণ অনুস্মাৰক',
    overallProgress: 'সামগ্ৰিক প্ৰগতি',
    activity: 'কাৰ্যসূচী',
    timeline: 'সময়ৰেখা',
    activityLogEmptySub: 'ৰোগীয়ে কাম বা খেল সম্পূৰ্ণ কৰিলে ইয়াত দেখা যাব।',
    cognitiveInsights: 'মগজুৰ ধাৰণা',
    memoryGamesSub: 'স্মৃতি পৰীক্ষা আৰু দিনটোৰ কথা',
    attentionGamesSub: 'মনোযোগ আৰু বস্তু চিনাক্তকৰণ',
    problemSolvingGamesSub: 'ক্ৰম আৰু ক্ৰমানুসাৰে',
    cgInsightTitle: 'তত্ত্বাৱধায়কৰ পৰামৰ্শ',
    cgInsightSub: 'তথ্য-ভিত্তিক পৰামৰ্শ',
    addCustomReminderTitle: 'অনুস্মাৰক যোগ কৰক',
    reminderTitleLabel: 'অনুস্মাৰকৰ শিৰোনাম',
    reminderPlaceholder: 'যেনে- পানী খোৱা বা ঔষধ খোৱা',
    scheduledTimeLabel: 'নিৰ্ধাৰিত সময়',
    categoryLabel: 'শ্ৰেণী',
    catMedicine: 'ঔষধ',
    catHydration: 'পানী খোৱা',
    catMeals: 'আহাৰ',
    catExercise: 'ব্যায়াম',
    catAppointments: 'সাক্ষাৎকাৰ',
    catFamily: 'পৰিয়াল',
    catOther: 'অন্যান্য',
    repeatIntervalLabel: 'পুনৰাবৃত্তিৰ অন্তৰাল',
    repDaily: 'দৈনিক',
    repWeekly: 'সপ্তাহিক',
    repEvery2h: 'প্ৰতি ২ ঘণ্টাৰ মূৰে মূৰে',
    repOnce: 'এবাৰ',
    removePatientTitle: 'আতৰাওক',
    cgAssociationSub: 'তত্ত্বাৱধায়কৰ সম্পৰ্ক',
    removeConfirmMsg: 'আপুনি নিশ্চিতনে যে এই ৰোগীক আপোনাৰ ডেশ্বব’ৰ্ডৰ পৰা আতৰাব বিচাৰে?',
    patientSafetyNotice: 'ৰোগীৰ একাউন্ট সুৰক্ষিত: ৰোগীৰ একাউন্ট, স্ক’ৰ আৰু স্মৃতিবোৰ সম্পূৰ্ণ সুৰক্ষিত থাকিব।',
    cancel: 'বাতিল কৰক',
    removePatientBtn: 'ৰোগী আতৰাওক',
    changePhotoTitle: 'প্ৰফাইল ছবি সলনি কৰক',
    roleCaregiverLabel: 'ভূমিকা: তত্ত্বাৱধায়ক',
    accountIdLabel: 'একাউন্ট আইডি',
    ageLabel: 'বয়স',
    yrsLabel: 'বছৰ',
    genderLabel: 'লিংগ',
    emailLabel: 'ইমেইল',
    phoneLabel: 'ফোন নম্বৰ',
    assignedPatientsLabel: 'দায়িত্বত থকা ৰোগী',
    patientsCountLabel: 'জন ৰোগী',
    changeProfilePicBtn: 'প্ৰফাইল ছবি সলনি কৰক',
    closeBtn: 'বন্ধ কৰক',
    toastInvalidFile: 'ফাইলৰ ধৰণ অৱৈধ। অনুগ্ৰহ কৰি JPG, PNG বা WEBP বাছনি কৰক।',
    toastImageFailed: 'ছবি প্ৰক্ৰিয়া কৰিব পৰা নগ’ল।',
    toastPhotoUpdated: 'প্ৰফাইল ছবি সফলতাৰে আপলোড হ’ল!',
    toastPhotoFailed: 'প্ৰফাইল ছবি সংৰক্ষণ কৰিব পৰা নগ’ল।',
    toastImageReadError: 'ছবি পঢ়াত ভুল হ’ল।',
    toastPatientAdded: 'ৰোগী যোগ হ’ল আৰু বাছনি কৰা হ’ল!',
    toastUnableAddPatient: 'ৰোগী যোগ কৰিব পৰা নগ’ল।',
    toastPatientRemoved: 'ৰোগীক সফলতাৰে আতৰোৱা হ’ল।',
    toastUnableRemovePatient: 'ৰোগীক আতৰাব পৰা নগ’ল।',
    toastReminderAdded: 'অনুস্মাৰক যোগ হ’ল ৰোগী:',
    level: 'স্তৰ',
    progressPct: 'প্ৰগতি',
    femaleLabel: 'মহিলা',
    maleLabel: 'পুৰুষ',
    regionLabel: 'গুৱাটী, উত্তৰ-পূৰ্বাঞ্চল',
    noRegisteredPatients: 'কোনো নিবন্ধিত ৰোগী উপলব্ধ নাই।',
    registeredAccountLabel: 'নিবন্ধিত একাউন্ট',
    gameMemoryMatch: 'মেম’ৰী মেচ',
    gameSequenceOrder: 'ক্ৰম আৰু অনুক্ৰম',
    gameAttentionFocus: 'মনোযোগ কেন্দ্ৰ',
    gameObjectRecognition: 'বস্তু চিনাক্তকৰণ',
    gameRoutineRecall: 'দৈনন্দিন ৰুটিন স্মৃতি',
    titleBreakfast: 'পুৱাৰ সাজ',
    titleLunch: 'দুপৰীয়াৰ সাজ',
    titleDinner: 'ৰাতিৰ সাজ'
  },
  Bengali: {
    welcome: 'স্বাগতম,',
    patientOverview: 'রোগীর পরিচিতি',
    todayProgress: 'আজকের অগ্রগতি',
    brainTraining: 'মস্তিষ্কের অনুশীলন',
    currentStreak: 'বর্তমান ধারাবাহিকতা',
    remindersStatus: 'অনুস্মারক',
    lastActivity: 'সাম্প্রতিক কার্যক্রম',
    patientActivity: 'রোগীর কার্যক্রম',
    noRecentActivity: 'কোনো সাম্প্রতিক কার্যক্রম নেই',
    statusActive: 'সক্রিয়',
    statusNeedsAttention: 'মনোযোগ প্রয়োজন',
    statusNoActivity: 'কোনো সক্রিয়তা নেই',
    perfArea: 'বিভিন্ন ক্ষেত্রের কর্মক্ষমতা',
    perfSub: 'রোগীর বিভিন্ন মস্তিষ্কের ক্ষেত্রের কর্মক্ষমতা।',
    memory: 'স্মৃতিশক্তি',
    attention: 'মনোযোগ',
    problemSolving: 'সমস্যা সমাধান',
    overall: 'সামগ্রিক',
    noPerfData: 'কর্মক্ষমতা দেখতে কিছু গেম খেলুন।',
    addPatient: 'রোগী যোগ করুন',
    selectPatient: 'রোগী নির্বাচন করুন:',
    cgQuickActions: 'কেয়ারগিভারের দ্রুত নির্দেশাবলী',
    addReminderBtn: 'অনুস্মারক যোগ করুন',
    callPatient: 'রোগীকে কল করুন',
    scheduledFromCg: 'কেয়ারগিভার প্যানেল থেকে সেট করা হয়েছে',
    noReminders: 'কোনো অনুস্মারক নির্ধারিত নেই',
    today: 'আজ',
    weeklyProgress: 'সাপ্তাহিক অগ্রগতি',
    completed: 'সম্পন্ন',
    upcoming: 'আসন্ন',
    missed: 'অনুপস্থিত',
    snoozed: 'পরে দেখা হবে',
    days: 'দিন',
    activeNow: 'এখন সক্রিয়',
    insightNoData: 'কোনো কর্মক্ষমতার ডেটা নেই। রোগীকে ব্রেন ট্রেইনিং অনুশীলনে উৎসাহিত করুন।',
    insightLow: 'স্মৃতিশক্তি এবং মনোযোগ অনুশীলনে এই সপ্তাহে আরও অনুশীলনের প্রয়োজন হতে পারে।',
    insightMedium: 'রোগী গেম অনুশীলনে ধারাবাহিক অগ্রগতি দেখাচ্ছে।',
    insightHigh: 'সাম্প্রতিক অনুশীলনে চমৎকার কর্মক্ষমতা।',
    justNow: 'এইমাত্র',
    minAgo: 'মি আগে',
    hrAgo: 'ঘণ্টা আগে',
    hrsAgo: 'ঘণ্টা আগে',
    yesterday: 'গতকাল',
    daysAgo: 'দিন আগে',
    recently: 'সম্প্রতি',
    reviewMissed: 'মিস হওয়া অনুস্মারক পর্যালোচনা করুন',
    viewUpcoming: 'আসন্ন অনুস্মারক দেখুন',
    encourageBrain: 'ব্রেন ট্রেইনিংে উৎসাহিত করুন',
    checkPatientActivity: 'রোগীর কার্যক্রম পরীক্ষা করুন',
    viewTodayProgress: 'আজকের অগ্রগতি দেখুন',
    caregiverProfile: 'কেয়ারগিভার প্রোফাইল',
    registeredPatients: 'নিবন্ধিত রোগীর অ্যাকাউন্ট',
    selectPatientSub: 'তদারকি করার জন্য একজন রোগীকে বাছুন বা নতুন যোগ করুন',
    added: 'যোগ করা হয়েছে',
    alreadyAdded: 'ইতিমধ্যে যোগ করা হয়েছে',
    activeMonitoring: 'সক্রিয় তদারকি',
    completedRecorded: 'সম্পন্ন কার্যক্রম সংরক্ষিত',
    zeroRecorded: '০% কার্যক্রম সংরক্ষিত',
    hoverInspectDetails: 'বিস্তারিত দেখতে যেকোনো দিনে ট্যাপ করুন',
    zeroWeeklyBaseline: '০% সাপ্তাহিক বেসলাইন',
    weeklyTrendAnalytics: 'সাপ্তাহিক ট্রেন্ড বিশ্লেষণ',
    noProgressThisWeek: 'এই সপ্তাহে কোনো অগ্রগতি রেকর্ড করা হয়নি',
    allGoalsCompleted: 'সব লক্ষ্য সম্পন্ন হয়েছে!',
    dailyExercises: 'দৈনিক অনুশীলন',
    activeStreak: 'সক্রিয় ধারাবাহিকতা',
    done: 'সম্পন্ন',
    next: 'পরবর্তী',
    missedToday: 'আজ মিস হয়েছে',
    noMissedItems: 'কোনো মিস হওয়া বিষয় নেই',
    todayProgressUpper: 'আজকের অগ্রগতি',
    weeklyProgressUpper: 'সাপ্তাহিক অগ্রগতি',
    dailyProgressSub: 'আজকের কাজ, গেম এবং অনুস্মারক সম্পন্নতার চিত্র',
    weeklyProgressSub: 'সপ্তাহ জুড়ে রোগীর কার্যক্রম ও লক্ষ্য অর্জনের ধারা',
    daily: 'দৈনিক',
    weekly: 'সাপ্তাহিক',
    tasksCompleted: 'সম্পন্ন কাজ',
    remindersCompleted: 'সম্পন্ন অনুস্মারক',
    overallProgress: 'সামগ্রিক অগ্রগতি',
    activity: 'কার্যক্রম',
    timeline: 'টাইমলাইন',
    activityLogEmptySub: 'রোগী কাজ বা গেম সম্পন্ন করলে এখানে দেখা যাবে।',
    cognitiveInsights: 'মস্তিষ্কের ধারণা',
    memoryGamesSub: 'মেমোরি ম্যাচ এবং দৈনন্দিন স্মৃতি',
    attentionGamesSub: 'মনোযোগ ও বস্তু শনাক্তকরণ',
    problemSolvingGamesSub: 'ক্রম ও অনুক্রম',
    cgInsightTitle: 'কেয়ারগিভারের পরামর্শ',
    cgInsightSub: 'ডেটা-ভিত্তিক পরামর্শ',
    addCustomReminderTitle: 'কাস্টম অনুস্মারক যোগ করুন',
    reminderTitleLabel: 'অনুস্মারকের শিরোনাম',
    reminderPlaceholder: 'যেমন- জল খাওয়া বা ওষুধ খাওয়া',
    scheduledTimeLabel: 'নির্ধারিত সময়',
    categoryLabel: 'বিভাগ',
    catMedicine: 'ওষুধ',
    catHydration: 'জল পান',
    catMeals: 'খাবার',
    catExercise: 'ব্যায়াম',
    catAppointments: 'ডাক্তারের অ্যাপয়েন্টমেন্ট',
    catFamily: 'পরিবার',
    catOther: 'অন্যান্য',
    repeatIntervalLabel: 'পুনরাবৃত্তির ব্যবধান',
    repDaily: 'দৈনিক',
    repWeekly: 'সাপ্তাহিক',
    repEvery2h: 'প্রতি ২ ঘণ্টা পর পর',
    repOnce: 'একবার',
    removePatientTitle: 'সরান',
    cgAssociationSub: 'কেয়ারগিভার সংযোগ',
    removeConfirmMsg: 'আপনি কি নিশ্চিত যে এই রোগীকে আপনার ড্যাশবোর্ড থেকে সরাতে চান?',
    patientSafetyNotice: 'রোগীর অ্যাকাউন্ট নিরাপত্তা: রোগীর অ্যাকাউন্ট, স্কোর এবং স্মৃতিসমূহ সম্পূর্ণ সুরক্ষিত থাকবে।',
    cancel: 'বাতিল করুন',
    removePatientBtn: 'রোগী সরান',
    changePhotoTitle: 'প্রোফাইল ছবি পরিবর্তন করুন',
    roleCaregiverLabel: 'ভূমিকা: কেয়ারগিভার',
    accountIdLabel: 'অ্যাঙ্করেজ আইডি',
    ageLabel: 'বয়স',
    yrsLabel: 'বছর',
    genderLabel: 'লিঙ্গ',
    emailLabel: 'ইমেইল',
    phoneLabel: 'ফোন নম্বর',
    assignedPatientsLabel: 'দায়িত্বপ্রাপ্ত রোগী',
    patientsCountLabel: 'জন রোগী',
    changeProfilePicBtn: 'প্রোফাইল ছবি পরিবর্তন করুন',
    closeBtn: 'বন্ধ করুন',
    toastInvalidFile: 'ফাইলের বিন্যাসটি সঠিক নয়। অনুগ্রহ করে JPG, PNG, WEBP ছবি বাছুন।',
    toastImageFailed: 'ছবি প্রসেস করতে ব্যর্থ হয়েছে।',
    toastPhotoUpdated: 'প্রোফাইল ছবি সফলভাবে আপডেট করা হয়েছে!',
    toastPhotoFailed: 'প্রোফাইল ছবি সেভ করতে ব্যর্থ হয়েছে।',
    toastImageReadError: 'ছবি পড়তে সমস্যা হয়েছে।',
    toastPatientAdded: 'রোগী যোগ করা হয়েছে এবং নির্বাচিত হয়েছে!',
    toastUnableAddPatient: 'রোগী যোগ করতে ব্যর্থ হয়েছে।',
    toastPatientRemoved: 'রোগী সফলভাবে সরানো হয়েছে।',
    toastUnableRemovePatient: 'রোগী সরাতে ব্যর্থ হয়েছে।',
    toastReminderAdded: 'রোগীর জন্য অনুস্মারক যোগ করা হয়েছে:',
    level: 'স্তর',
    progressPct: 'অগ্রগতি',
    femaleLabel: 'মহিলা',
    maleLabel: 'পুরুষ',
    regionLabel: 'গুয়াহাটি, উত্তর-পূর্বাঞ্চল',
    noRegisteredPatients: 'কোনো নিবন্ধিত রোগী পাওয়া যায়নি।',
    registeredAccountLabel: 'নিবন্ধিত অ্যাকাউন্ট',
    gameMemoryMatch: 'মেমরি ম্যাচ',
    gameSequenceOrder: 'ক্রম ও অনুক্রম',
    gameAttentionFocus: 'মনোযোগ সংযোগ',
    gameObjectRecognition: 'বস্তু সনাক্তকরণ',
    gameRoutineRecall: 'দৈনন্দিন রুটিন স্মরণ',
    titleBreakfast: 'সকালের প্রাতরাশ',
    titleLunch: 'দুপুরের খাবার',
    titleDinner: 'রাতের খাবার'
  },
  Hindi: {
    welcome: 'स्वागत है,',
    patientOverview: 'मरीज़ का विवरण',
    todayProgress: 'आज की प्रगति',
    brainTraining: 'मस्तिष्क प्रशिक्षण',
    currentStreak: 'वर्तमान स्ट्रिक',
    remindersStatus: 'रिमाइंडर',
    lastActivity: 'अंतिम गतिविधि',
    patientActivity: 'मरीज़ की गतिविधि',
    noRecentActivity: 'कोई हालिया गतिविधि नहीं',
    statusActive: 'सक्रिय',
    statusNeedsAttention: 'ध्यान देने की आवश्यकता',
    statusNoActivity: 'कोई हालिया गतिविधि नहीं',
    perfArea: 'क्षेत्र के अनुसार प्रदर्शन',
    perfSub: 'मरीज़ का विभिन्न संज्ञानात्मक क्षेत्रों में प्रदर्शन।',
    memory: 'स्मृति (मेमोरी)',
    attention: 'ध्यान (अटेंशन)',
    problemSolving: 'समस्या निवारण',
    overall: 'कुल प्रदर्शन',
    noPerfData: 'प्रदर्शन देखने के लिए कुछ ब्रेन गेम्स पूरे करें।',
    addPatient: 'मरीज़ जोड़ें',
    selectPatient: 'मरीज़ चुनें:',
    cgQuickActions: 'केयरगिवर त्वरित कार्रवाई',
    addReminderBtn: 'रिमाइंडर जोड़ें',
    callPatient: 'मरीज़ को कॉल करें',
    scheduledFromCg: 'केयरगिवर पैनल से सेट किया गया',
    noReminders: 'कोई रिमाइंडर नहीं',
    today: 'आज',
    weeklyProgress: 'साप्ताहिक प्रगति',
    completed: 'पूरा हुआ',
    upcoming: 'आगामी',
    missed: 'छूट गया',
    snoozed: 'स्थगित',
    days: 'दिन',
    activeNow: 'अभी सक्रिय',
    insightNoData: 'अभी कोई प्रदर्शन डेटा उपलब्ध नहीं है। मरीज़ को ब्रेन गेम खेलने के लिए प्रेरित करें।',
    insightLow: 'स्मृति और ध्यान संबंधी गतिविधियों में इस सप्ताह अधिक अभ्यास की आवश्यकता हो सकती है।',
    insightMedium: 'मरीज़ ब्रेन गेम्स में लगातार प्रगति दिखा रहा है।',
    insightHigh: 'हालिया गतिविधियों में उत्कृष्ट प्रदर्शन।',
    justNow: 'अभी-अभी',
    minAgo: 'मिनट पहले',
    hrAgo: 'घंटे पहले',
    hrsAgo: 'घंटे पहले',
    yesterday: 'कल',
    daysAgo: 'दिन पहले',
    recently: 'हाल ही में',
    reviewMissed: 'छूटे हुए रिमाइंडर की समीक्षा करें',
    viewUpcoming: 'आगामी रिमाइंडर देखें',
    encourageBrain: 'ब्रेन ट्रेनिंग के लिए प्रेरित करें',
    checkPatientActivity: 'मरीज़ की गतिविधि जांचें',
    viewTodayProgress: 'आज की प्रगति देखें',
    caregiverProfile: 'केयरगिवर प्रोफ़ाइल',
    registeredPatients: 'पंजीकृत मरीज़ खाते',
    selectPatientSub: 'निगरानी के लिए मरीज़ चुनें या नया खाता जोड़ें',
    added: 'जोड़ा गया',
    alreadyAdded: 'पहले से जोड़ा गया',
    activeMonitoring: 'सक्रिय निगरानी',
    completedRecorded: 'पूर्ण गतिविधियां दर्ज की गईं',
    zeroRecorded: '0% गतिविधि दर्ज',
    hoverInspectDetails: 'विवरण देखने के लिए किसी भी दिन पर टैप करें',
    zeroWeeklyBaseline: '0% साप्ताहिक बेसलाइन',
    weeklyTrendAnalytics: 'साप्ताहिक रुझान विश्लेषण',
    noProgressThisWeek: 'इस सप्ताह कोई प्रगति दर्ज नहीं की गई',
    allGoalsCompleted: 'सभी लक्ष्य पूरे हुए!',
    dailyExercises: 'दैनिक अभ्यास',
    activeStreak: 'सक्रिय स्ट्रिक',
    done: 'पूरा',
    next: 'अगला',
    missedToday: 'आज छूटा',
    noMissedItems: 'कोई छूटा हुआ आइटम नहीं',
    todayProgressUpper: 'आज की प्रगति',
    weeklyProgressUpper: 'साप्ताहिक प्रगति',
    dailyProgressSub: 'आज के कार्य, खेल और रिमाइंडर की पूर्णता स्थिति',
    weeklyProgressSub: 'सप्ताह भर में मरीज़ की गतिविधि और लक्ष्य पूर्णता का रुझान',
    daily: 'दैनिक',
    weekly: 'साप्ताहिक',
    tasksCompleted: 'पूरे किए गए कार्य',
    remindersCompleted: 'पूरे किए गए रिमाइंडर',
    overallProgress: 'कुल प्रगति',
    activity: 'गतिविधि',
    timeline: 'टाइमलाइन',
    activityLogEmptySub: 'मरीज़ के गेम या कार्य पूरा करने पर यहां गतिविधि दिखाई देगी।',
    cognitiveInsights: 'संज्ञानात्मक अंतर्दृष्टि',
    memoryGamesSub: 'मेमोरी मैच और दिनचर्या याद रखना',
    attentionGamesSub: 'ध्यान और वस्तु पहचान',
    problemSolvingGamesSub: 'अनुक्रम और क्रमबद्धता',
    cgInsightTitle: 'केयरगिवर सुझाव',
    cgInsightSub: 'डेटा-आधारित अनुशंसाएं',
    addCustomReminderTitle: 'कस्टम रिमाइंडर जोड़ें',
    reminderTitleLabel: 'रिमाइंडर का शीर्षक',
    reminderPlaceholder: 'जैसे- पानी पीना या दवा लेना',
    scheduledTimeLabel: 'निर्धारित समय',
    categoryLabel: 'श्रेणी',
    catMedicine: 'दवा',
    catHydration: 'जल पान',
    catMeals: 'भोजन',
    catExercise: 'व्यायाम',
    catAppointments: 'डॉक्टर की अपॉइंटमेंट',
    catFamily: 'परिवार',
    catOther: 'अन्य',
    repeatIntervalLabel: 'पुनरावृत्ति अंतराल',
    repDaily: 'दैनिक',
    repWeekly: 'साप्ताहिक',
    repEvery2h: 'हर 2 घंटे में',
    repOnce: 'एक बार',
    removePatientTitle: 'हटाएं',
    cgAssociationSub: 'केयरगिवर जुड़ाव',
    removeConfirmMsg: 'क्या आप निश्चित रूप से इस मरीज़ को अपने डैशबोर्ड से हटाना चाहते हैं?',
    patientSafetyNotice: 'मरीज़ खाता सुरक्षा: मरीज़ का खाता, स्कोर और यादें पूरी तरह सुरक्षित रहेंगी।',
    cancel: 'रद्द करें',
    removePatientBtn: 'मरीज़ हटाएं',
    changePhotoTitle: 'प्रोफ़ाइल फ़ोटो बदलें',
    roleCaregiverLabel: 'भूमिका: केयरगिवर',
    accountIdLabel: 'अकाउंट आईडी',
    ageLabel: 'आयु',
    yrsLabel: 'वर्ष',
    genderLabel: 'लिंग',
    emailLabel: 'ईमेल',
    phoneLabel: 'फ़ोन',
    assignedPatientsLabel: 'सौंपे गए मरीज़',
    patientsCountLabel: 'मरीज़',
    changeProfilePicBtn: 'प्रोफ़ाइल फ़ोटो बदलें',
    closeBtn: 'बंद करें',
    toastInvalidFile: 'अमान्य फ़ाइल स्वरूप। कृपया JPG, PNG, WEBP छवि चुनें।',
    toastImageFailed: 'फ़ोटो प्रोसेस करने में विफल।',
    toastPhotoUpdated: 'प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट की गई!',
    toastPhotoFailed: 'प्रोफ़ाइल फ़ोटो सहेजने में विफल।',
    toastImageReadError: 'फ़ोटो पढ़ने में त्रुटि।',
    toastPatientAdded: 'मरीज़ जोड़ा गया और चुना गया!',
    toastUnableAddPatient: 'मरीज़ जोड़ने में असमर्थ।',
    toastPatientRemoved: 'मरीज़ सफलतापूर्वक हटाया गया।',
    toastUnableRemovePatient: 'मरीज़ हटाने में असमर्थ।',
    toastReminderAdded: 'मरीज़ के लिए रिमाइंडर जोड़ा गया:',
    level: 'स्तर',
    progressPct: 'प्रगति',
    femaleLabel: 'महिला',
    maleLabel: 'पुरुष',
    regionLabel: 'गुवाहाटी, उत्तर-पूर्व',
    noRegisteredPatients: 'कोई पंजीकृत मरीज उपलब्ध नहीं है।',
    registeredAccountLabel: 'पंजीकृत खाता',
    gameMemoryMatch: 'मेमोरी मैच',
    gameSequenceOrder: 'सीक्वेंस और ऑर्डर',
    gameAttentionFocus: 'अटेंशन फोकस',
    gameObjectRecognition: 'ऑब्जेक्ट पहचान',
    gameRoutineRecall: 'दैनिक दिनचर्या स्मरण',
    titleBreakfast: 'नाश्ता',
    titleLunch: 'दोपहर का भोजन',
    titleDinner: 'रात का भोजन'
  },
  Manipuri: {
    welcome: 'তরাম্না ওকচরি,',
    patientOverview: 'রোগীগী অহেনবা মরোল',
    todayProgress: 'ঙসিগী চাউখৎপা',
    brainTraining: 'মফৌ খোংথাং',
    currentStreak: 'হৌজিক ওইরিবা লেপ্পা লৈতবা',
    remindersStatus: 'নৌহৌনা নিংশিংবা',
    lastActivity: 'অরোইবা থবক',
    patientActivity: 'রোগীগী থবক-থৌরম',
    noRecentActivity: 'করিমত্তা অনৌবা থবক লৈত্রে',
    statusActive: 'সক্রিয়',
    statusNeedsAttention: 'য়াম্না অমুক য়েংবা মথৌ তাই',
    statusNoActivity: 'করিমত্তা থবক তৌদে',
    perfArea: 'মফম খুদিংগী থবক',
    perfSub: 'রোগীগী মফৌ খুদিংগী স্কোর।',
    memory: 'নিংশিংবা',
    attention: 'মাইওনশিনবা',
    problemSolving: 'ৱাফম চপ চাবা',
    overall: 'অপুনবা',
    noPerfData: 'গেম খরা শানদুনা স্কোর য়েংবীয়ু।',
    addPatient: 'রোগী হাপচিনবা',
    selectPatient: 'রোগী খনবীয়ু:',
    cgQuickActions: 'কেয়ারগিভারগী খোংজেল য়াংবা থবক',
    addReminderBtn: 'নিংশিংবা হাপচিনবা',
    callPatient: 'রোগীদা কোল তৌবা',
    scheduledFromCg: 'কেয়ারগিভার পানেলদগী পীনবা',
    noReminders: 'করিমত্তা নিংশিংবা লৈত্রে',
    today: 'ঙসি',
    weeklyProgress: 'চয়োলগী চাউখৎপা',
    completed: 'লোইখ্রে',
    upcoming: 'লাক্কদৌরিবা',
    missed: 'মাংখ্রে',
    snoozed: 'তুংদা',
    days: 'নুমিত',
    activeNow: 'হৌজিক সক্ৰিয়',
    insightNoData: 'করিমত্তা স্কোর লৈত্রে। রোগীদা গেম শানহনবীয়ু।',
    insightLow: 'নিংশিংবা অমসুং মাইওনশিনবদা হেন্না প্র্যাকটিস মথৌ তাই।',
    insightMedium: 'রোগী অসি গেমদা চপ চানা চাউখৎলি।',
    insightHigh: 'য়াম্না ফবা পারফোরমেন্স।',
    justNow: 'হৌজিকক্তা',
    minAgo: 'মিনিতকী মাংদা',
    hrAgo: 'পুংগী মাংদা',
    hrsAgo: 'পুংগী মাংদা',
    yesterday: 'ঙরাং',
    daysAgo: 'নুমিতকী মাংদা',
    recently: 'হন্দক্তা',
    reviewMissed: 'মাংখিবগী নিংশিংবা অমুক য়েংবা',
    viewUpcoming: 'লাক্কদৌরিবা য়েংবা',
    encourageBrain: 'গেম শাননবা হায়নবা',
    checkPatientActivity: 'রোগীগী থবক য়েংবা',
    viewTodayProgress: 'ঙসিগী চাউখৎপা য়েংবা',
    caregiverProfile: 'কেয়ারগিভার প্রোফাইল',
    registeredPatients: 'রেজিষ্টার্ড ফংলবা রোগী একাউন্ট',
    selectPatientSub: 'রোগী খনবীয়ু নত্রগা অনৌবা হাপচিনবীয়ু',
    added: 'হাপচিনখ্রে',
    alreadyAdded: 'হান্ননা হাপচিনখ্রে',
    activeMonitoring: 'সক্রিয় য়েংশিনবা',
    completedRecorded: 'লোইখিবা থবক সেভ তৌখ্রে',
    zeroRecorded: '০% থবক সেভ তৌখ্রে',
    hoverInspectDetails: 'নুমিততা নম্বীয়ু চপ চাবা মরোলগীদমক',
    zeroWeeklyBaseline: '০% চয়োলগী বেসলাইন',
    weeklyTrendAnalytics: 'চয়োলগী চাউখৎপগী ট্রেণ্ড',
    noProgressThisWeek: 'হন্দক্ চয়োলসিদা চাউখৎপা লৈত্রে',
    allGoalsCompleted: 'পুম্নমক লোইখ্রে!',
    dailyExercises: 'নুমিত খুদিংগী প্র্যাকটিস',
    activeStreak: 'লেপ্পা লৈতবা সক্ৰিয়',
    done: 'লোইখ্রে',
    next: 'তুংদা',
    missedToday: 'ঙসি মাংখ্রে',
    noMissedItems: 'করিমত্তা মাংদে',
    todayProgressUpper: 'ঙসিগী চাউখৎপা',
    weeklyProgressUpper: 'চয়োলগী চাউখৎপা',
    dailyProgressSub: 'ঙসিগী থবক, গেম অমসুং নিংশিংবগী চাউখৎপা',
    weeklyProgressSub: 'চয়োল অমা মপুন রোগীগী চাউখৎপগী ৱাফম',
    daily: 'নুমিত খুদিংগী',
    weekly: 'চয়োল খুদিংগী',
    tasksCompleted: 'লোইখিবা থবক',
    remindersCompleted: 'লোইখিবা নিংশিংবা',
    overallProgress: 'অপুনবা চাউখৎপা',
    activity: 'থবক-থৌরম',
    timeline: 'টাইমলাইন',
    activityLogEmptySub: 'রোগীনা গেম শানরবা মতুংদা মসিদা লাক্কনি।',
    cognitiveInsights: 'মফৌগী ৱাফম',
    memoryGamesSub: 'নিংশিংবা অমসুং নুমিত খুদিংগী ৱাফম',
    attentionGamesSub: 'মাইওনশিনবা অমসুং পোৎশক চিনবা',
    problemSolvingGamesSub: 'সিরিজ অমসুং মথং-মথং',
    cgInsightTitle: 'কেয়ারগিভারগী পাউতাক',
    cgInsightSub: 'ডেটাদা য়ুমফম ওইবা পাউতাক',
    addCustomReminderTitle: 'অনৌবা নিংশিংবা হাপচিনবা',
    reminderTitleLabel: 'নিংশিংবগী মমিং',
    reminderPlaceholder: 'মৌপীবগী ইশিং থকপা নত্রগা হিদাং চাবগী',
    scheduledTimeLabel: 'পীনবা মতম',
    categoryLabel: 'কাটাগোরী',
    catMedicine: 'হিদাং',
    catHydration: 'ইশিং থকপা',
    catMeals: 'চাক চাবগী',
    catExercise: 'এক্সারসাইজ',
    catAppointments: 'ডাক্তার উবা',
    catFamily: 'ইমুং মনুং',
    catOther: 'অতোপ্পা',
    repeatIntervalLabel: 'হন্থ-হন্থনা হাপপা',
    repDaily: 'নুমিত খুদিংগী',
    repWeekly: 'চয়োল খুদিংগী',
    repEvery2h: 'পুং ২ খুদিংগী',
    repOnce: 'অমা লক',
    removePatientTitle: 'লোইশিনবা',
    cgAssociationSub: 'কেয়ারগিভার শম্নবা',
    removeConfirmMsg: 'অদোম রোগী অসিবু ড্যাশবোর্ডদগী লৌথোকপা পাম্ব্রা?',
    patientSafetyNotice: 'রোগী একাউন্ট চেকুপ: রোগীগী একাউন্ট অমসুং স্কোর পুম্নমক সেফ ওইনা লৈগনি।',
    cancel: 'কনসেল তৌবা',
    removePatientBtn: 'রোগী লৌথোকপা',
    changePhotoTitle: 'প্রোফাইল লাই অমুক হোংবা',
    roleCaregiverLabel: 'রোল: কেয়ারগিভার',
    accountIdLabel: 'একাউন্ট আইডি',
    ageLabel: 'চহি',
    yrsLabel: 'চহি',
    genderLabel: 'জেন্ডার',
    emailLabel: 'ইমেইল',
    phoneLabel: 'ফোন নম্বর',
    assignedPatientsLabel: 'য়েংশিল্লিবা রোগী',
    patientsCountLabel: 'রোগী',
    changeProfilePicBtn: 'প্রোফাইল লাই হোংবা',
    closeBtn: 'থিংジンবা',
    toastInvalidFile: 'ফাইল ফরম্যাট চুমদে। JPG, PNG, WEBP খনবীয়ু।',
    toastImageFailed: 'লাই প্রসেস তৌবা ঙমদে।',
    toastPhotoUpdated: 'প্রোফাইল লাই ফজরনা হোংখ্রে!',
    toastPhotoFailed: 'প্রোফাইল লাই সেভ তৌবা ঙমদে।',
    toastImageReadError: 'লাই পারবা ঙমদে।',
    toastPatientAdded: 'রোগী ফজরনা হাপচিনখ্রে!',
    toastUnableAddPatient: 'রোগী হাপচিনবা ঙমদে।',
    toastPatientRemoved: 'রোগী ফজরনা লৌথোকখ্রে।',
    toastUnableRemovePatient: 'রোগী লৌথোকপা ঙমদে।',
    toastReminderAdded: 'রোগীগী রিমাইন্ডার হাপখ্রে:',
    level: 'লেভেল',
    progressPct: 'প্রোগ্রেস',
    femaleLabel: 'নুপী',
    maleLabel: 'নুপা',
    regionLabel: 'গৌহাটি, অৱাং-নোংপোোক',
    noRegisteredPatients: 'রেজিষ্টার্ড রোগী লৈত্রে।',
    registeredAccountLabel: 'রেজিষ্টার্ড একাউন্ট',
    gameMemoryMatch: 'নিংশিংবা মেচ',
    gameSequenceOrder: 'সিরিজ অমসুং মথং-মথং',
    gameAttentionFocus: 'মাইওনশিনবা',
    gameObjectRecognition: 'পোৎশক চিনবা',
    gameRoutineRecall: 'নুমিত খুদিংগী নিংশিংবা',
    titleBreakfast: 'আয়ুক্কী চাক',
    titleLunch: 'নুংথিলগী চাক',
    titleDinner: 'নুমিদাংগী চাক'
  },
  Khasi: {
    welcome: 'Khublei,',
    patientOverview: 'Jingtip ia u Damlo',
    todayProgress: 'Jinghmasawn Myntha',
    brainTraining: 'Jingpynkhlain ia ka bor jabieng',
    currentStreak: 'Jingtreilam ba biang',
    remindersStatus: 'Jingkynmaw',
    lastActivity: 'Jingtrei ba khatduh',
    patientActivity: 'Jingtrei u Damlo',
    noRecentActivity: 'Ym don jingtrei ba shen jong u damlo',
    statusActive: 'Treikam',
    statusNeedsAttention: 'Donkam jingphohsniew',
    statusNoActivity: 'Ym don jingtrei',
    perfArea: 'JINGTREI HA KI BYNTA BA PHERPHER',
    perfSub: 'Jingpynkhlain bor jabieng ha ki ka-iang baphai.',
    memory: 'Jingkynmaw',
    attention: 'Jingpynshah shkor',
    problemSolving: 'Jingpynbeit jingeh',
    overall: 'Ha kaba baroh',
    noPerfData: 'Pyndep katto katne ki jinglehkai jabieng ban io-i ia ka jingpynkhlain.',
    addPatient: 'Pyniasoh ia u Damlo',
    selectPatient: 'Jied ia u Damlo:',
    cgQuickActions: 'Jingtrei stet jong u Zutuitu',
    addReminderBtn: 'Pyniasoh ia ka jingkynmaw',
    callPatient: 'Toh shaphang u damlo',
    scheduledFromCg: 'Pynbeit na ka Panel Zutuitu',
    noReminders: 'Ym don jingkynmaw ba buh',
    today: 'Myntha',
    weeklyProgress: 'Jinghmasawn shitaiew',
    completed: 'Dep pyndep',
    upcoming: 'Kaba dang wan',
    missed: 'Jut noh',
    snoozed: 'Pynsamnoh',
    days: 'Ki Sngi',
    activeNow: 'Treikam Myntha',
    insightNoData: 'Ym pat don data jingtrei. Pynleit jingmut ia u damlo ban pyndep ia ki jinglehkai jabieng.',
    insightLow: 'Ki jingkynmaw bad jingpynshah shkor ki donkam jingpynmlien ha kane ka taiew.',
    insightMedium: 'U damlo u pyni ia ka jingpynkhlain ba thikna ha ki jinglehkai jabieng.',
    insightHigh: 'Jingpynkhlain ba shyrkhei ha ki jingtrei ba shen.',
    justNow: 'Mynkyntinduh',
    minAgo: 'minit mynshuwa',
    hrAgo: 'kanta mynshuwa',
    hrsAgo: 'ki kanta mynshuwa',
    yesterday: 'Mynniew',
    daysAgo: 'ki sngi mynshuwa',
    recently: 'Ha ki sngi ba shen',
    reviewMissed: 'Pynkhmih ia ki jingkynmaw ba jut noh',
    viewUpcoming: 'Pynkhmih ia ki jingkynmaw ba dang wan',
    encourageBrain: 'Pynleit jingmut ia ka jinglehkai jabieng',
    checkPatientActivity: 'Pynkhmih ia ki jingtrei u damlo',
    viewTodayProgress: 'Pynkhmih ia ka jinghmasawn myntha',
    caregiverProfile: 'Profile Zutuitu',
    registeredPatients: 'Ki Account Damlo ba la pynkylla',
    selectPatientSub: 'Jied ia u damlo ban sumar ne pyniasoh ia ki account',
    added: 'La pyniasoh',
    alreadyAdded: 'La pyniasoh lypa',
    activeMonitoring: 'Sumar ba shai',
    completedRecorded: 'Ki jingtrei ba la pyndep la kynshew',
    zeroRecorded: '0% jingtrei la kynshew',
    hoverInspectDetails: 'Tied ha ka sngi ban khmih ia ki bniah',
    zeroWeeklyBaseline: '0% Baseline Taiew',
    weeklyTrendAnalytics: 'Jingpynkhmih jingleit Taiew',
    noProgressThisWeek: 'Ym pat don jinghmasawn ha kane ka taiew',
    allGoalsCompleted: 'Baroh ki thong la pyndep!',
    dailyExercises: 'Jingpynmlien sngi-sngi',
    activeStreak: 'Ki sngi ba dang treikam',
    done: 'la dep',
    next: 'dang wan',
    missedToday: 'jut noh myntha',
    noMissedItems: 'Ym don kaba jut noh',
    todayProgressUpper: 'JINGHMASAWN MYNTHA',
    weeklyProgressUpper: 'JINGHMASAWN SHITAIEW',
    dailyProgressSub: 'Ka jinghmasawn ha ki kam, jinglehkai bad jingkynmaw myntha',
    weeklyProgressSub: 'Jingleit thiltih u damlo shitaiew pyntip',
    daily: 'Sngi-sngi',
    weekly: 'Shitaiew',
    tasksCompleted: 'Ki kam ba la pyndep',
    remindersCompleted: 'Ki jingkynmaw ba la pyndep',
    overallProgress: 'Jinghmasawn Baroh',
    activity: 'Jingtrei',
    timeline: 'Ki khubor time',
    activityLogEmptySub: 'Ki khubor jingtrei kin paw hangne ynda u damlo u pyndep ia ki kam.',
    cognitiveInsights: 'Jingtip bor jabieng',
    memoryGamesSub: 'Jingkynmaw bor bad ni sngi',
    attentionGamesSub: 'Jingpynshah shkor bad ithuh jingthaw',
    problemSolvingGamesSub: 'Jingpynbeit ryntih',
    cgInsightTitle: 'Jingmut na u Zutuitu',
    cgInsightSub: 'Jingpynbeit na ki Data',
    addCustomReminderTitle: 'Pyniasoh ia ka jingkynmaw',
    reminderTitleLabel: 'Kyrteng ka jingkynmaw',
    reminderPlaceholder: 'kum- Dih um ne Dih dawai',
    scheduledTimeLabel: 'Por ba la buh',
    categoryLabel: 'Pawl',
    catMedicine: 'Dawai',
    catHydration: 'Dih um',
    catMeals: 'Bam',
    catExercise: 'InSawizawina',
    catAppointments: 'Jingiaphylliew',
    catFamily: 'Kur sunong',
    catOther: 'Kiwei pat',
    repeatIntervalLabel: 'Pynkynriah taiew',
    repDaily: 'Sngi-sngi',
    repWeekly: 'Shitaiew',
    repEvery2h: 'Man la 2 kanta',
    repOnce: 'Shisien',
    removePatientTitle: 'Pyndam',
    cgAssociationSub: 'Jingiasoh Nongsumar',
    removeConfirmMsg: 'Phi thikna ban pyndam ia u nongpang na ka dashboard?',
    patientSafetyNotice: 'Jingkada account nongpang: Ki data bad ki jingkynmaw u nongpang kin sah ba kada.',
    cancel: 'Pyndam noh',
    removePatientBtn: 'Pyndam Nongpang',
    changePhotoTitle: 'Pynkylla Dur Profile',
    roleCaregiverLabel: 'Bynta: Nongsumar',
    accountIdLabel: 'Account ID',
    ageLabel: 'Rta',
    yrsLabel: 'snem',
    genderLabel: 'Jaitbynriew',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    assignedPatientsLabel: 'Ki Nongpang ba la sumar',
    patientsCountLabel: 'Nongpang',
    changeProfilePicBtn: 'Pynkylla Dur Profile',
    closeBtn: 'Khang',
    toastInvalidFile: 'Ym dei u file ba thikna. Jied JPG, PNG, WEBP.',
    toastImageFailed: 'Pynbeit ia ka dur ym lah.',
    toastPhotoUpdated: 'Dur profile la pynkylla khiah!',
    toastPhotoFailed: 'Pynsumar ia ka dur ym lah.',
    toastImageReadError: 'Jingpule ia ka dur ym lah.',
    toastPatientAdded: 'Nongpang la bynrap bad la jied!',
    toastUnableAddPatient: 'Ym lah ban bynrap ia u nongpang.',
    toastPatientRemoved: 'Nongpang la pyndam khiah.',
    toastUnableRemovePatient: 'Ym lah ban pyndam ia u nongpang.',
    toastReminderAdded: 'Jingpynkynmaw la bynrap ia u nongpang:',
    level: 'Lypkynti',
    progressPct: 'Jinghmasawn',
    femaleLabel: 'Kynthei',
    maleLabel: 'Shynrang',
    regionLabel: 'Guwahati, Mihngi',
    noRegisteredPatients: 'Ym don damlo ba la register.',
    registeredAccountLabel: 'Account ba la register',
    gameMemoryMatch: 'Jingkynmaw Match',
    gameSequenceOrder: 'Jingpynbeit ryntih',
    gameAttentionFocus: 'Jingpynshah shkor',
    gameObjectRecognition: 'Jingithuh ia ki thillang',
    gameRoutineRecall: 'Jingkynmaw ki sngi-sngi',
    titleBreakfast: 'Ja phaw',
    titleLunch: 'Ja sngi',
    titleDinner: 'Ja miet'
  },
  Mizo: {
    welcome: 'Chibai,',
    patientOverview: 'Damlo Dinhmun',
    todayProgress: 'Vawiin Hmabak',
    brainTraining: 'Lukhung Inzirtirna',
    currentStreak: 'Zahna Zual',
    remindersStatus: 'Hriattirnate',
    lastActivity: 'Hnathawh hnuhnung ber',
    patientActivity: 'Damlo Thiltih',
    noRecentActivity: 'Thiltih thar a awm lo',
    statusActive: 'Thawh mek',
    statusNeedsAttention: 'Ngaihsak Ngai',
    statusNoActivity: 'Chetna a awm lo',
    perfArea: 'HMUN KHINNA DINHMUN',
    perfSub: 'Damlo hruaitu lukhung dinhmun.',
    memory: 'Hriatna',
    attention: 'Ngaihsakna',
    problemSolving: 'Harsa Phelhna',
    overall: 'A Tlangpui',
    noPerfData: 'Dinhmun hmuh nan lukhung inkhawm tlem ti rawh.',
    addPatient: 'Damlo Belhna',
    selectPatient: 'Damlo Thlanna:',
    cgQuickActions: 'Zutuitu Thiltih Pui',
    addReminderBtn: 'Hriattirna Belhna',
    callPatient: 'Damlo Biakna',
    scheduledFromCg: 'Zutuitu Pannel atanga ruahman',
    noReminders: 'Hriattirna ruahman a awm lo',
    today: 'Vawiin',
    weeklyProgress: 'Chawlkar Hmabak',
    completed: 'Zawh a ni',
    upcoming: 'Lo awm tur',
    missed: 'Bawhpelh',
    snoozed: 'Muangchang',
    days: 'Nite',
    activeNow: 'Chhuak mek',
    insightNoData: 'Thiltih data a awm lo. Damlo hi lukhung inzirtirna ti turin fuih rawh.',
    insightLow: 'Hriatna leh ngaihsakna ah hian zir zual a ngai ang.',
    insightMedium: 'Damlo hian lukhung inkhawm-ah hmasawnna a phei mek.',
    insightHigh: 'Thiltih thar zingah hmasawnna tha tak a hmuh.',
    justNow: 'Tuna zawk',
    minAgo: 'minit hmang',
    hrAgo: 'darkar hmang',
    hrsAgo: 'darkar hmang',
    yesterday: 'Niminah',
    daysAgo: 'ni hmang',
    recently: 'Mawteuh',
    reviewMissed: 'Hriattirna bawhpelh thlir nawnna',
    viewUpcoming: 'Hriattirna lo awm tur thlirtirna',
    encourageBrain: 'Lukhung inkhawm ti turin fuih rawh',
    checkPatientActivity: 'Damlo thiltih endik rawh',
    viewTodayProgress: 'Vawiin hmasawnna thlir rawh',
    caregiverProfile: 'Zutuitu Profile',
    registeredPatients: 'Damlo Account Inziatlut Te',
    selectPatientSub: 'Endik tur damlo thlang rawh',
    added: 'Belh tawh',
    alreadyAdded: 'Belh sa a ni',
    activeMonitoring: 'Endik mek a ni',
    completedRecorded: 'Thiltih zawh te dah a ni',
    zeroRecorded: '0% thiltih chhinchhiah',
    hoverInspectDetails: 'Hriat chian nan nite hmet rawh',
    zeroWeeklyBaseline: '0% Chawlkar Baseline',
    weeklyTrendAnalytics: 'Chawlkar hmasawnna zirchianna',
    noProgressThisWeek: 'He chawlkarah hmasawnna a awm rih lo',
    allGoalsCompleted: 'Tum zawng zawng tihlawhtlin a ni!',
    dailyExercises: 'Ni tin inzirtirna',
    activeStreak: 'Zahna tista kal lai',
    done: 'tihzawh',
    next: 'dawt leh',
    missedToday: 'vawiin bawhpelh',
    noMissedItems: 'Bawhpelh a awm lo',
    todayProgressUpper: 'VAWIIN HMASAWNNA',
    weeklyProgressUpper: 'CHAWLKAR HMASAWNNA',
    dailyProgressSub: 'Vawiin thiltih leh hriattirna dinhmun',
    weeklyProgressSub: 'Damlo chawlkar chhunga thiltih dinhmun',
    daily: 'Ni tin',
    weekly: 'Chawlkar',
    tasksCompleted: 'Hnathawh zawhte',
    remindersCompleted: 'Hriattirna zawhte',
    overallProgress: 'Hmasawnna a tlangpui',
    activity: 'Thiltih',
    timeline: 'Hun thluh',
    activityLogEmptySub: 'Damlo thiltih te hetah hian a lang ang.',
    cognitiveInsights: 'Lukhung Zirchianna',
    memoryGamesSub: 'Hriatna leh ni tin thiltih',
    attentionGamesSub: 'Ngaihsakna leh thil hriat',
    problemSolvingGamesSub: 'Indawt leh ruahman',
    cgInsightTitle: 'Zutuitu Rawtna',
    cgInsightSub: 'Data hmanga rawtna',
    addCustomReminderTitle: 'Hriattirna belh rawh',
    reminderTitleLabel: 'Hriattirna hming',
    reminderPlaceholder: 'Tui in kouh mawiteh damdawi ei',
    scheduledTimeLabel: 'Ruahman hun',
    categoryLabel: 'Pawl',
    catMedicine: 'Damdawi',
    catHydration: 'Tui in',
    catMeals: 'Chaw ei',
    catExercise: 'InSawizawina',
    catAppointments: 'Inbiakna',
    catFamily: 'Chhungkua',
    catOther: 'Thil dang',
    repeatIntervalLabel: 'Thlertirna zual',
    repDaily: 'Ni tin',
    repWeekly: 'Chawlkar',
    repEvery2h: 'Darkar 2 zai in',
    repOnce: 'Vawi khat',
    removePatientTitle: 'Nuaibo',
    cgAssociationSub: 'Zutuitu Inzawmna',
    removeConfirmMsg: 'He damlo hi i dashboard atang hian nuaibo i duh tak zet em?',
    patientSafetyNotice: 'Damlo account humhalhna: Damlo account leh hriatna te chu him takin a awm reng ang.',
    cancel: 'Sut leh rawh',
    removePatientBtn: 'Damlo Nuaibo',
    changeProfilePicBtn: 'Profile Thlalak Thlakna',
    changePhotoTitle: 'Profile Thlalak Thlakna',
    roleCaregiverLabel: 'Hnawhtute: Zutuitu',
    accountIdLabel: 'Account ID',
    ageLabel: 'Kum',
    yrsLabel: 'kum',
    genderLabel: 'Mawng/Hmeichhia',
    emailLabel: 'Email',
    phoneLabel: 'Phone Number',
    assignedPatientsLabel: 'Damlo endik mekte',
    patientsCountLabel: 'Damlo',
    closeBtn: 'Kharpui rawh',
    toastInvalidFile: 'File amau lo. JPG, PNG, WEBP hmang rawh.',
    toastImageFailed: 'Thlalak buaipui a hlawhchham.',
    toastPhotoUpdated: 'Profile thlalak hlawhtling takin thlak a ni!',
    toastPhotoFailed: 'Profile thlalak dah a hlawhchham.',
    toastImageReadError: 'Thlalak chhiar a hlawhchham.',
    toastPatientAdded: 'Damlo belh leh thlan a ni e!',
    toastUnableAddPatient: 'Damlo belh a hlawhchham.',
    toastPatientRemoved: 'Damlo nuaibo hlawhtling tak a ni.',
    toastUnableRemovePatient: 'Damlo nuaibo a hlawhchham.',
    toastReminderAdded: 'Damlo hriattirna belh a ni:',
    level: 'Lovel',
    progressPct: 'Hmasawnna',
    femaleLabel: 'Hmeichhia',
    maleLabel: 'Mipa',
    regionLabel: 'Guwahati, Hmar-chhak',
    noRegisteredPatients: 'Damlo ziatlut an awm lo.',
    registeredAccountLabel: 'Account inziatlut',
    gameMemoryMatch: 'Hriatna Inmil',
    gameSequenceOrder: 'Indawt leh Ruahman',
    gameAttentionFocus: 'Ngaihsakna Tikhauk',
    gameObjectRecognition: 'Thil Hriatna',
    gameRoutineRecall: 'Ni tin thiltih hriatna',
    titleBreakfast: 'Zing ei',
    titleLunch: 'Chhuna ei',
    titleDinner: 'Zana ei'
  },
  Nagamese: {
    welcome: 'Swagatam,',
    patientOverview: 'Patient laga samachar',
    todayProgress: 'Aji laga progress',
    brainTraining: 'Dimag laga exercise',
    currentStreak: 'Habi din laga streak',
    remindersStatus: 'Yaad kuri thaka',
    lastActivity: 'Shes te kura kam',
    patientActivity: 'Patient laga kamkhan',
    noRecentActivity: 'Kati laga patient activity nai',
    statusActive: 'Chalu',
    statusNeedsAttention: 'Dhyan dibole lage',
    statusNoActivity: 'Kam nai',
    perfArea: 'AREA HISAAP TE PERFORMANCE',
    perfSub: 'Patient laga dimag performance alag alag area te.',
    memory: 'Yaad',
    attention: 'Dhyan',
    problemSolving: 'Problem solve kura',
    overall: 'Tamam',
    noPerfData: 'Performance kura sabole olop brain games khelibi.',
    addPatient: 'Patient add kuribi',
    selectPatient: 'Patient baachibi:',
    cgQuickActions: 'Caregiver Jaldi Action',
    addReminderBtn: 'Reminder add kuribi',
    callPatient: 'Patient te call kuribi',
    scheduledFromCg: 'Caregiver panel para schedule kurise',
    noReminders: 'Kunba reminder nai',
    today: 'Aji',
    weeklyProgress: 'Hapta laga progress',
    completed: 'Kuri lobi',
    upcoming: 'Ahibole thaka',
    missed: 'Miss hoise',
    snoozed: 'Snooze kurise',
    days: 'Din',
    activeNow: 'Etiya active',
    insightNoData: 'Performance data nai. Patient te brain training game khelibole kobi.',
    insightLow: 'Yaad aro dhyan laga game etu hapta bisi practice kuribole lage.',
    insightMedium: 'Patient brain game khan te thik performance dekhi ase.',
    insightHigh: 'Aji-kali laga performance bisi bhal ase.',
    justNow: 'Etiya he',
    minAgo: 'min aage',
    hrAgo: 'ghanta aage',
    hrsAgo: 'ghanta aage',
    yesterday: 'Kali',
    daysAgo: 'din aage',
    recently: 'Akhol te',
    reviewMissed: 'Miss hoa reminder dobara sabi',
    viewUpcoming: 'Ahibole thaka reminder sabebi',
    encourageBrain: 'Brain training khelibole bhi kobi',
    checkPatientActivity: 'Patient laga kam sabobi',
    viewTodayProgress: 'Aji laga progress sabobi',
    caregiverProfile: 'Caregiver Profile Laga',
    registeredPatients: 'Register kura Patient Account khan',
    selectPatientSub: 'Patient select kuribi nahoile add kuribi',
    added: 'Add hoise',
    alreadyAdded: 'Akhe para add ase',
    activeMonitoring: 'Monitor kuri ase',
    completedRecorded: 'Kura activity save hoise',
    zeroRecorded: '0% activity save hoise',
    hoverInspectDetails: 'Din te click kurikene details sabi',
    zeroWeeklyBaseline: '0% Hapta Baseline',
    weeklyTrendAnalytics: 'Hapta progress analysis',
    noProgressThisWeek: 'Etu hapta te progress hoa nai',
    allGoalsCompleted: 'Sob goal khulise!',
    dailyExercises: 'Roz laga exercise',
    activeStreak: 'Streak active ase',
    done: 'hoise',
    next: 'ahibole thaka',
    missedToday: 'aji miss hoise',
    noMissedItems: 'Kunba miss hoa nai',
    todayProgressUpper: 'AJI LAGA PROGRESS',
    weeklyProgressUpper: 'HAPTA LAGA PROGRESS',
    dailyProgressSub: 'Aji laga kam, game aro reminder progress',
    weeklyProgressSub: 'Hapta te patient laga progress',
    daily: 'Roz',
    weekly: 'Hapta te',
    tasksCompleted: 'Pura kura kam',
    remindersCompleted: 'Pura kura reminder',
    overallProgress: 'Tamam progress',
    activity: 'Kamkhan',
    timeline: 'Kam Laga Samay',
    activityLogEmptySub: 'Patient kam kure te etu jaga te ahibo.',
    cognitiveInsights: 'Dimag Laga Analysis',
    memoryGamesSub: 'Yaad match aro din laga baat',
    attentionGamesSub: 'Dhyan aro saman chinikene kobi',
    problemSolvingGamesSub: 'Krom hisaap te kura',
    cgInsightTitle: 'Caregiver Laga Advice',
    cgInsightSub: 'Data-based Advice',
    addCustomReminderTitle: 'Reminder add kuribi',
    reminderTitleLabel: 'Reminder laga naam',
    reminderPlaceholder: 'jineka- pani khabi nahoile dawa khabi',
    scheduledTimeLabel: 'Time set kura',
    categoryLabel: 'Bhaag',
    catMedicine: 'Dawa',
    catHydration: 'Pani khabi',
    catMeals: 'Khana',
    catExercise: 'Kassrat / Exercise',
    catAppointments: 'Meeting',
    catFamily: 'Ghar manu',
    catOther: 'Alag khan',
    repeatIntervalLabel: 'Repeat kura interval',
    repDaily: 'Roz',
    repWeekly: 'Hapta te',
    repEvery2h: '2 ghanta te',
    repOnce: 'Ekbar',
    removePatientTitle: 'Hataibi',
    cgAssociationSub: 'Caregiver Connection',
    removeConfirmMsg: 'Etu patient te dashboard para hataibole mon ase na?',
    patientSafetyNotice: 'Patient account safety: Patient laga account aro score bhal te save hoikene thakibo.',
    cancel: 'Cancel kuribi',
    removePatientBtn: 'Patient Hataibi',
    changePhotoTitle: 'Profile Photo Badlibi',
    roleCaregiverLabel: 'Bhumika: Caregiver',
    accountIdLabel: 'Account ID',
    ageLabel: 'Umar',
    yrsLabel: 'saal',
    genderLabel: 'Linga',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    assignedPatientsLabel: 'Saambhi kene thaka patient khan',
    patientsCountLabel: 'जन patient',
    changeProfilePicBtn: 'Profile Photo Badlibi',
    closeBtn: 'Bandh kuribi',
    toastInvalidFile: 'File format thik nohoi. JPG, PNG, WEBP chunibi.',
    toastImageFailed: 'Photo load kuribole para nai.',
    toastPhotoUpdated: 'Profile photo badli hoise!',
    toastPhotoFailed: 'Profile photo save nohoise.',
    toastImageReadError: 'Photo read kuribole para nai.',
    toastPatientAdded: 'Patient add hoise aro chunise!',
    toastUnableAddPatient: 'Patient add kuribole para nai.',
    toastPatientRemoved: 'Patient hataise.',
    toastUnableRemovePatient: 'Patient hataibole para nai.',
    toastReminderAdded: 'Reminder add hoise patient:',
    level: 'Level',
    progressPct: 'Progress',
    femaleLabel: 'Miki',
    maleLabel: 'Mota',
    regionLabel: 'Guwahati, NER',
    noRegisteredPatients: 'Kunba register patient nai.',
    registeredAccountLabel: 'Register kura Account',
    gameMemoryMatch: 'Yaad Match',
    gameSequenceOrder: 'Krom hisaap te',
    gameAttentionFocus: 'Dhyan dibole',
    gameObjectRecognition: 'Saman chini kura',
    gameRoutineRecall: 'Roz laga yaad',
    titleBreakfast: 'Nasta',
    titleLunch: 'Dohora khana',
    titleDinner: 'Rati khana'
  },
  Tripuri: {
    welcome: 'Kubui khalumkha,',
    patientOverview: 'Khamani kok',
    todayProgress: 'Tini ni tangkhuk',
    brainTraining: 'Phana thohmani',
    currentStreak: 'Tini twi tangkhuk',
    remindersStatus: 'Uansukma',
    lastActivity: 'Fainai tangma',
    patientActivity: 'Tangnai tangkhuk',
    noRecentActivity: 'Nai thokya tangkhuk',
    statusActive: 'Tangkhuk tongnai',
    statusNeedsAttention: 'Naini rwkmani',
    statusNoActivity: 'Chichi tangma kwraitan',
    perfArea: 'THOKNAI TANGKHUK',
    perfSub: 'Manojwog tongnai chukmani.',
    memory: 'Uansuk',
    attention: 'Naimani',
    problemSolving: 'Kok khampai',
    overall: 'Jotoni',
    noPerfData: 'Tangkhuk nani bangsi brain game khalkhadw.',
    addPatient: 'Khamani borok yaphar',
    selectPatient: 'Khamani borok khanyan:',
    cgQuickActions: 'Nangnani yaksa tangma',
    addReminderBtn: 'Uansukma yaphar',
    callPatient: 'Khamani borok ni rikhadi',
    scheduledFromCg: 'Caregiver panel twi pynbeit khailakha',
    noReminders: 'Uansukma kwaitan',
    today: 'Tini',
    weeklyProgress: 'Hapta ni tangkhuk',
    completed: 'Tangkhuk pai',
    upcoming: 'Phainai',
    missed: 'Tangya',
    snoozed: 'Kaisa tongkhadi',
    days: 'Sal',
    activeNow: 'Tini active',
    insightNoData: 'Tangkhuk kwaitan. Khamani borok no brain game khalkhana rwdi.',
    insightLow: 'Uansuk naimani tangkhuk bo hapta-o bisi nangai.',
    insightMedium: 'Khamani borok brain game-o thongya tangkhuk thohkhase.',
    insightHigh: 'Fainai tangkhuk-o kaham tangkhuk khailakha.',
    justNow: 'Tini he',
    minAgo: 'minitt swng',
    hrAgo: 'ghanta swng',
    hrsAgo: 'ghanta swng',
    yesterday: 'Miya',
    daysAgo: 'sal swng',
    recently: 'Phangnwi',
    reviewMissed: 'Tangya uansukma khanyan',
    viewUpcoming: 'Phainai uansukma khanyan',
    encourageBrain: 'Brain game khalkhana rwdi',
    checkPatientActivity: 'Khamani borok ni tangkhuk khanyan',
    viewTodayProgress: 'Tini ni tangkhuk khanyan',
    caregiverProfile: 'Caregiver Profile Kok',
    registeredPatients: 'Khanyan Khamani Borok Account',
    selectPatientSub: 'Khamani borok khanyan hai yaphardi',
    added: 'Yaphar-kha',
    alreadyAdded: 'Yaphar-khase',
    activeMonitoring: 'Nai-tongmani Active',
    completedRecorded: 'Tangkhuk pai-ma save khailakha',
    zeroRecorded: '0% tangkhuk save khailakha',
    hoverInspectDetails: 'Sal te rwkdi nani details nani',
    zeroWeeklyBaseline: '0% Hapta Baseline',
    weeklyTrendAnalytics: 'Hapta tangkhuk analysis',
    noProgressThisWeek: 'Bo hapta te tangkhuk kwraitan',
    allGoalsCompleted: 'Jotoni goal pai-kha!',
    dailyExercises: 'Sal-ni exercise',
    activeStreak: 'Active streak tangkhuk',
    done: 'pai-kha',
    next: 'phainai',
    missedToday: 'tini missed khailakha',
    noMissedItems: 'Chichi missed kwrai',
    todayProgressUpper: 'TINI NI TANGKHUK',
    weeklyProgressUpper: 'HAPTA NI TANGKHUK',
    dailyProgressSub: 'Tini ni tangma, game hai uansukma tangkhuk',
    weeklyProgressSub: 'Khamani borok ni hapta ni tangkhuk',
    daily: 'Sal-ni',
    weekly: 'Hapta-ni',
    tasksCompleted: 'Pai-ma tangkhuk',
    remindersCompleted: 'Pai-ma uansukma',
    overallProgress: 'Jotoni tangkhuk',
    activity: 'Tangkhuk',
    timeline: 'Sal-ni Timeline',
    activityLogEmptySub: 'Khamani borok tangkhuk khaikheabo nani.',
    cognitiveInsights: 'Phana Chukmani',
    memoryGamesSub: 'Uansuk match hai sal-ni kok',
    attentionGamesSub: 'Naimani hai mung rwkmani',
    problemSolvingGamesSub: 'Kok pynbeit khailakha',
    cgInsightTitle: 'Caregiver Kok',
    cgInsightSub: 'Data-ni kok',
    addCustomReminderTitle: 'Uansukma yaphar',
    reminderTitleLabel: 'Uansukma mung',
    reminderPlaceholder: 'jineka- twi thungma bo sam thungma',
    scheduledTimeLabel: 'Pynbeit time',
    categoryLabel: 'Bhaag',
    catMedicine: 'Sam',
    catHydration: 'Twi thungma',
    catMeals: 'Chakchum',
    catExercise: 'Exercise / Tangkhuk',
    catAppointments: 'Meeting',
    catFamily: 'Nok-ni borok',
    catOther: 'Gubun',
    repeatIntervalLabel: 'Repeat interval',
    repDaily: 'Sal-ni',
    repWeekly: 'Hapta-ni',
    repEvery2h: '2 ghanta swng',
    repOnce: 'Kaisa-o',
    removePatientTitle: 'Delete khaimani',
    cgAssociationSub: 'Caregiver Connection',
    removeConfirmMsg: 'Khamani borok no dashboard twi delete khailani?',
    patientSafetyNotice: 'Khamani borok safety: Account hai memories kaham-twi tongkhase.',
    cancel: 'Cancel khaimani',
    removePatientBtn: 'Delete Khamani Borok',
    changePhotoTitle: 'Photo Swnamdi',
    roleCaregiverLabel: 'Bhumika: Caregiver',
    accountIdLabel: 'Account ID',
    ageLabel: 'Bhoros',
    yrsLabel: 'bhoros',
    genderLabel: 'Linga',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    assignedPatientsLabel: 'Tongnai khamani borok',
    patientsCountLabel: 'borok',
    changeProfilePicBtn: 'Photo Swnamdi',
    closeBtn: 'Thangdi',
    toastInvalidFile: 'File format kwrai. JPG, PNG, WEBP chikhadi.',
    toastImageFailed: 'Photo load khailakhai.',
    toastPhotoUpdated: 'Profile photo swnam-kha!',
    toastPhotoFailed: 'Photo save khailakhai.',
    toastImageReadError: 'Photo read khailakhai.',
    toastPatientAdded: 'Khamani borok yaphar-kha!',
    toastUnableAddPatient: 'Yaphar khailakhai.',
    toastPatientRemoved: 'Khamani borok delete khailakha.',
    toastUnableRemovePatient: 'Delete khailakhai.',
    toastReminderAdded: 'Uansukma yaphar-kha khamani borok:',
    level: 'Level',
    progressPct: 'Tangkhuk',
    femaleLabel: 'Bwrokh',
    maleLabel: 'Borok',
    regionLabel: 'Guwahati, NER',
    noRegisteredPatients: 'Chichi registered borok kwrai.',
    registeredAccountLabel: 'Registered Account',
    gameMemoryMatch: 'Uansuk Match',
    gameSequenceOrder: 'Kok pynbeit',
    gameAttentionFocus: 'Naimani Focus',
    gameObjectRecognition: 'Mung rwkmani',
    gameRoutineRecall: 'Sal-ni uansuk',
    titleBreakfast: 'Phai-ni chakchum',
    titleLunch: 'Sal-ni chakchum',
    titleDinner: 'Hor-ni chakchum'
  }
};

const getCgText = (dict: Record<string, string>, key: string): string => {
  return dict[key] || localCgTranslations.English[key] || key;
};

const getGameTitleLocalized = (gameName?: string, dict?: Record<string, string>): string => {
  if (!dict || !gameName) return gameName || '';
  const lower = gameName.toLowerCase();
  if (lower.includes('memory match')) return dict.gameMemoryMatch || gameName;
  if (lower.includes('sequence') || lower.includes('order')) return dict.gameSequenceOrder || gameName;
  if (lower.includes('attention') || lower.includes('focus')) return dict.gameAttentionFocus || gameName;
  if (lower.includes('object') || lower.includes('recognition')) return dict.gameObjectRecognition || gameName;
  if (lower.includes('routine') || lower.includes('recall')) return dict.gameRoutineRecall || gameName;
  return gameName;
};

const getReminderTitleLocalized = (title?: string, dict?: Record<string, string>): string => {
  if (!dict || !title) return title || '';
  const lower = title.toLowerCase();
  if (lower.includes('breakfast')) return dict.titleBreakfast || title;
  if (lower.includes('lunch')) return dict.titleLunch || title;
  if (lower.includes('dinner')) return dict.titleDinner || title;
  if (lower.includes('water') || lower.includes('hydration')) return dict.catHydration || title;
  if (lower.includes('medicine') || lower.includes('pill')) return dict.catMedicine || title;
  return title;
};

const formatTimeAgo = (dateStr?: string, dict?: Record<string, string>): string => {
  const d = dict || localCgTranslations.English;
  if (!dateStr) return getCgText(d, 'noRecentActivity');
  try {
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return dateStr;
    const now = Date.now();
    const diffMs = now - time;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 2) return getCgText(d, 'justNow');
    if (diffMin < 60) return `${diffMin} ${getCgText(d, 'minAgo')}`;
    if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? getCgText(d, 'hrAgo') : getCgText(d, 'hrsAgo')}`;
    if (diffDay === 1) return getCgText(d, 'yesterday');
    return `${diffDay} ${getCgText(d, 'daysAgo')}`;
  } catch {
    return getCgText(d, 'recently');
  }
};

// Professional generic default avatar for caregiver
const DefaultCaregiverAvatar: React.FC<{ className?: string }> = ({ className = "w-11 h-11" }) => (
  <div className={`rounded-full bg-gradient-to-br from-brand-purpleLight via-indigo-100 to-purple-200 flex items-center justify-center border-2 border-brand-purple/30 overflow-hidden shadow-2xs ${className}`}>
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full text-brand-purple p-0.5">
      <circle cx="32" cy="24" r="11" fill="currentColor" />
      <path d="M12 54 C12 42 20 37 32 37 C44 37 52 42 52 54 Z" fill="currentColor" />
    </svg>
  </div>
);

// Weekly Progress SVG Vector Chart (Dynamic, interactive, animated vector analytics graph)
const WeeklyProgressChart: React.FC<{
  dailyData: { day: string; val: number }[];
  isEmpty: boolean;
  patientName: string;
}> = ({ dailyData, isEmpty, patientName }) => {
  const { language } = useLanguage();
  const dict = localCgTranslations[language] || localCgTranslations.English;
  const [animated, setAnimated] = useState(false);
  const [activeHoverIdx, setActiveHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    setAnimated(false);
    const timer = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(timer);
  }, [dailyData]);

  const width = 560;
  const height = 200;
  const paddingX = 50;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const fullDayNames: Record<string, Record<string, string>> = {
    English: { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' },
    Hindi: { Mon: 'सोमवार', Tue: 'मंगलवार', Wed: 'बुधवार', Thu: 'गुरुवार', Fri: 'शुक्रवार', Sat: 'शनिवार', Sun: 'रविवार' },
    Bengali: { Mon: 'সোমবার', Tue: 'মঙ্গলবার', Wed: 'বুধবার', Thu: 'বৃহস্পতিবার', Fri: 'শুক্রবার', Sat: 'শনিবার', Sun: 'রবিবার' },
    Assamese: { Mon: 'সোমবাৰ', Tue: 'মঙ্গলবাৰ', Wed: 'বুধবাৰ', Thu: 'বৃহস্পতিবাৰ', Fri: 'শুক্ৰবাৰ', Sat: 'শনিবাৰ', Sun: 'দেওবাৰ' },
    Manipuri: { Mon: 'নিংথৌকাবা', Tue: 'লৈবাকপোকপা', Wed: 'য়ুমশাকৈশা', Thu: 'শগোলশেন', Fri: 'ইরাই', Sat: 'থাংজা', Sun: 'নোলমাই' },
    Khasi: { Mon: 'Sngi Ba-ar', Tue: 'Sngi Ba-lai', Wed: 'Sngi Ba-saw', Thu: 'Sngi Ba-san', Fri: 'Sngi Ba-hynriew', Sat: 'Sngi Sait-jain', Sun: 'Sngi U Blei' },
    Mizo: { Mon: 'Thawhtanni', Tue: 'Thawhlehni', Wed: 'Nilaini', Thu: 'Ningani', Fri: 'Zirtawpni', Sat: 'Inrinni', Sun: 'Pathianni' },
    Nagamese: { Mon: 'Sombar', Tue: 'Mongolbar', Wed: 'Budbar', Thu: 'Bihibar', Fri: 'Sukurbar', Sat: 'Sanibar', Sun: 'Deobar' },
    Tripuri: { Mon: 'Sombar', Tue: 'Mongolbar', Wed: 'Budbar', Thu: 'Bihibar', Fri: 'Sukurbar', Sat: 'Sanibar', Sun: 'Robi-sal' }
  };

  const dayNameDict = fullDayNames[language] || fullDayNames.English;

  const points = dailyData.map((d, i) => {
    const x = paddingX + (i / Math.max(1, dailyData.length - 1)) * chartWidth;
    const targetY = height - paddingY - (d.val / 100) * chartHeight;
    const y = animated ? targetY : (height - paddingY);
    return { x, y, targetY, val: d.val, day: d.day, fullDay: dayNameDict[d.day] || d.day };
  });

  // Calculate smooth cubic bezier curve path for SVG
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const pathD = createSmoothPath(points);
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const activePoint = activeHoverIdx !== null ? points[activeHoverIdx] : null;

  return (
    <div className="w-full space-y-3">
      {/* Interactive Tooltip / Data Inspection Header */}
      <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-brand-lavender/40 border border-brand-purpleLight/60 min-h-[38px] transition-all">
        {activePoint ? (
          <div className="flex items-center justify-between w-full text-xs font-black text-brand-navy">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-purple animate-pulse" />
              {activePoint.fullDay}: <span className="text-brand-purple font-black text-sm">{activePoint.val}% {getCgText(dict, 'progressPct')}</span>
            </span>
            <span className="text-[11px] font-bold text-brand-grayText">
              {activePoint.val > 0 ? getCgText(dict, 'completedRecorded') : getCgText(dict, 'zeroRecorded')}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-xs font-bold text-brand-grayText">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-brand-purple" />
              {getCgText(dict, 'hoverInspectDetails')}
            </span>
            <span className="text-brand-purple font-extrabold text-[11px]">
              {isEmpty ? getCgText(dict, 'zeroWeeklyBaseline') : getCgText(dict, 'weeklyTrendAnalytics')}
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart Container */}
      <div className="w-full overflow-x-auto relative p-2 bg-gradient-to-b from-white to-brand-lavender/20 rounded-3xl border border-brand-purpleLight/70 shadow-2xs">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[340px] overflow-visible">
          <defs>
            <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5B5BD6" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#5B5BD6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#5B5BD6" stopOpacity="0.0" />
            </linearGradient>
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#5B5BD6" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid Lines & Y-Axis Scale */}
          {[0, 25, 50, 75, 100].map(val => {
            const y = height - paddingY - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="#E2E8F0" 
                  strokeDasharray="4 4" 
                  strokeWidth="1" 
                />
                <text x={paddingX - 10} y={y + 4} textAnchor="end" className="text-[10px] font-black fill-slate-400">
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area Fill beneath curve */}
          {!isEmpty && (
            <path 
              d={areaD} 
              fill="url(#weeklyGrad)" 
              className={`transition-opacity duration-700 ease-out ${animated ? 'opacity-100' : 'opacity-0'}`} 
            />
          )}

          {/* Line Path */}
          <path 
            d={pathD} 
            fill="none" 
            stroke={isEmpty ? '#94A3B8' : '#5B5BD6'} 
            strokeWidth={isEmpty ? '2' : '3.5'} 
            strokeDasharray={isEmpty ? '5 5' : 'none'}
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="transition-all duration-700 ease-out"
          />

          {/* Interactive Day Points / Nodes */}
          {points.map((p, i) => {
            const isHovered = activeHoverIdx === i;
            return (
              <g 
                key={i} 
                className="cursor-pointer group"
                onMouseEnter={() => setActiveHoverIdx(i)}
                onMouseLeave={() => setActiveHoverIdx(null)}
                onClick={() => setActiveHoverIdx(i)}
              >
                {/* Touch/hover hit region */}
                <circle cx={p.x} cy={p.y} r="16" fill="transparent" />

                {/* Day Label on X Axis */}
                <text 
                  x={p.x} 
                  y={height - 8} 
                  textAnchor="middle" 
                  className={`text-[11px] font-extrabold transition-colors ${isHovered ? 'fill-brand-purple font-black text-xs' : 'fill-slate-600'}`}
                >
                  {p.day}
                </text>

                {/* Node Ring */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={isHovered ? "7" : "5"} 
                  fill="#ffffff" 
                  stroke={isEmpty ? '#94A3B8' : (isHovered ? '#4338CA' : '#5B5BD6')} 
                  strokeWidth={isHovered ? "3.5" : "2.5"} 
                  filter={!isEmpty ? "url(#nodeGlow)" : undefined}
                  className="transition-all duration-300 ease-out"
                />

                {/* Node Value Label */}
                <text 
                  x={p.x} 
                  y={p.y - 10} 
                  textAnchor="middle" 
                  className={`text-[10px] font-black transition-all duration-300 ${isHovered ? 'fill-brand-purple text-[12px]' : (isEmpty ? 'fill-slate-400' : 'fill-brand-navy')}`}
                >
                  {p.val}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Subcaption */}
      {isEmpty && (
        <p className="text-center text-[11px] font-extrabold text-slate-400 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>{getCgText(dict, 'noProgressThisWeek')} ({patientName})</span>
        </p>
      )}
    </div>
  );
};

export const CaregiverDashboard: React.FC = () => {
  const { language } = useLanguage();
  const currentDict = localCgTranslations[language] || localCgTranslations.English;

  const currentUser = storageService.getCurrentUser();

  // Load all available profiles
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(() => storageService.getProfiles());

  const caregiverUser = allProfiles.find(p => p.id === currentUser?.id || p.role === 'Caregiver') || currentUser;
  const [caregiverPhoto, setCaregiverPhoto] = useState<string | undefined>(() => caregiverUser?.photo);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCaregiverPhoto(caregiverUser?.photo);
  }, [caregiverUser?.photo, allProfiles]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast(getCgText(currentDict, 'toastInvalidFile'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const base64String = reader.result as string;
        if (!base64String) {
          triggerToast(getCgText(currentDict, 'toastImageFailed'));
          return;
        }
        const targetId = caregiverUser?.id || currentUser?.id || 'caregiver';
        storageService.updateProfilePhoto(targetId, base64String);
        setCaregiverPhoto(base64String);
        setAllProfiles(storageService.getProfiles());
        triggerToast(getCgText(currentDict, 'toastPhotoUpdated'));
      } catch (err) {
        triggerToast(getCgText(currentDict, 'toastPhotoFailed'));
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.onerror = () => {
      triggerToast(getCgText(currentDict, 'toastImageReadError'));
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  const assignedIds = caregiverUser?.assignedPatients && caregiverUser.assignedPatients.length > 0
    ? caregiverUser.assignedPatients
    : allProfiles.filter(p => p.role === 'Patient').map(p => p.id);

  // Dynamic patient list options for the Caregiver multi-patient selector
  const patientDropdownOptions = allProfiles.filter(p => p.role === 'Patient' && (assignedIds.length === 0 || assignedIds.includes(p.id)));

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    const saved = localStorage.getItem('sb_caregiver_selected_patient_id');
    const validIds = patientDropdownOptions.map(p => p.id);
    if (saved && validIds.includes(saved)) return saved;
    return validIds[0] || 'ravi-demo';
  });

  const monitoredPatient = allProfiles.find(p => p.id === selectedPatientId) || patientDropdownOptions[0] || { name: 'Patient', age: 75, id: selectedPatientId, gender: 'Male' as const, region: 'Guwahati, NER' };
  const patientName = monitoredPatient.name;

  // Patient Data States
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [schedule, setSchedule] = useState<Activity[]>([]);
  const [alerts, setAlerts] = useState<CaregiverAlert[]>([]);
  const [games, setGames] = useState<GameScore[]>([]);
  const [, setMemories] = useState<Memory[]>([]);
  const [gameSessions, setGameSessions] = useState<any[]>([]);

  // Caregiver UI States
  const [progressViewMode, setProgressViewMode] = useState<'daily' | 'weekly'>('daily');
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showManagePatientsModal, setShowManagePatientsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const patientButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 384 });

  const updateDropdownPosition = () => {
    if (patientButtonRef.current) {
      const rect = patientButtonRef.current.getBoundingClientRect();
      const desiredWidth = Math.min(384, Math.max(320, window.innerWidth - 32));
      let left = rect.left;
      if (left + desiredWidth > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - desiredWidth - 16);
      }
      setDropdownPos({
        top: Math.max(8, rect.bottom + 8),
        left: Math.max(16, left),
        width: desiredWidth
      });
    }
  };

  const handleTogglePatientDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showPatientDropdown) {
      updateDropdownPosition();
      setShowPatientDropdown(true);
    } else {
      setShowPatientDropdown(false);
    }
  };

  useLayoutEffect(() => {
    if (showPatientDropdown) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);
      return () => {
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition, true);
      };
    }
  }, [showPatientDropdown]);

  // Form states
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime24h, setReminderTime24h] = useState('14:00');
  const [reminderCategory, setReminderCategory] = useState<'medicine' | 'hydration' | 'meals' | 'exercise' | 'appointments' | 'family' | 'other'>('medicine');
  const [reminderRepeat, setReminderRepeat] = useState('Daily');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadPatientData = (pId: string) => {
    localStorage.setItem('sb_caregiver_selected_patient_id', pId);
    setReminders(storageService.getReminders());
    setSchedule(storageService.getSchedule());
    setAlerts(storageService.getAlerts());
    setGames(storageService.getGames());
    setMemories(storageService.getMemories());
    setGameSessions(storageService.getGameSessions());
  };

  useEffect(() => {
    storageService.init();
    const profiles = storageService.getProfiles();
    setAllProfiles(profiles);
    loadPatientData(selectedPatientId);

    const handleStorageChange = () => {
      setAllProfiles(storageService.getProfiles());
      loadPatientData(selectedPatientId);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedPatientId]);

  // Global Escape Key & Sidebar Add Patient Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPatientDropdown) setShowPatientDropdown(false);
        if (showManagePatientsModal) setShowManagePatientsModal(false);
      }
    };

    const handleOpenAddPatientModal = () => {
      setShowManagePatientsModal(true);
    };

    const checkUrlAction = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action') === 'add-patient') {
        setShowManagePatientsModal(true);
      }
    };

    checkUrlAction();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-add-patient-modal', handleOpenAddPatientModal);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-add-patient-modal', handleOpenAddPatientModal);
    };
  }, [showPatientDropdown, showManagePatientsModal]);

  const handlePatientChange = (pId: string) => {
    setSelectedPatientId(pId);
    loadPatientData(pId);
  };

  // Inline Add Existing Patient Handler
  const handleAddExistingPatient = (targetPatientId: string) => {
    if (assignedIds.includes(targetPatientId)) return;

    try {
      const finalAssigned = Array.from(new Set([...assignedIds, targetPatientId]));
      storageService.updateCaregiverAssignedPatients(currentUser?.id || 'caregiver', finalAssigned);
      const updatedProfiles = storageService.getProfiles();
      setAllProfiles(updatedProfiles);

      const cgUser = updatedProfiles.find(p => p.id === (currentUser?.id || 'caregiver') || p.role === 'Caregiver');
      const isPersisted = cgUser && cgUser.assignedPatients?.includes(targetPatientId);

      if (isPersisted) {
        setSelectedPatientId(targetPatientId);
        loadPatientData(targetPatientId);
        triggerToast(getCgText(currentDict, 'toastPatientAdded'));
      } else {
        triggerToast(getCgText(currentDict, 'toastUnableAddPatient'));
      }
    } catch {
      triggerToast(getCgText(currentDict, 'toastUnableAddPatient'));
    }
  };

  // Remove Patient Safety & Persistence Handler
  const [patientToRemove, setPatientToRemove] = useState<{ id: string; name: string } | null>(null);

  const handleInitiateRemovePatient = (patientId: string, patientName: string) => {
    setPatientToRemove({ id: patientId, name: patientName });
  };

  const confirmRemovePatient = () => {
    if (!patientToRemove) return;

    try {
      const updatedAssigned = assignedIds.filter(id => id !== patientToRemove.id);
      storageService.updateCaregiverAssignedPatients(currentUser?.id || 'caregiver', updatedAssigned);
      
      const updatedProfiles = storageService.getProfiles();
      setAllProfiles(updatedProfiles);

      const cgUser = updatedProfiles.find(p => p.id === (currentUser?.id || 'caregiver') || p.role === 'Caregiver');
      const isPersisted = cgUser && !cgUser.assignedPatients?.includes(patientToRemove.id);

      if (isPersisted) {
        if (selectedPatientId === patientToRemove.id) {
          const nextPatientId = updatedAssigned[0] || '';
          setSelectedPatientId(nextPatientId);
          if (nextPatientId) {
            loadPatientData(nextPatientId);
          }
        }
        triggerToast(getCgText(currentDict, 'toastPatientRemoved'));
        setPatientToRemove(null);
      } else {
        triggerToast(getCgText(currentDict, 'toastUnableRemovePatient'));
      }
    } catch {
      triggerToast(getCgText(currentDict, 'toastUnableRemovePatient'));
    }
  };

  // Caregiver Add Reminder Handler
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim()) return;

    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      category: reminderCategory,
      title: reminderTitle,
      description: currentDict.scheduledFromCg,
      time: reminderTime24h,
      date: getISODateString(),
      status: 'Scheduled',
      repeat: reminderRepeat,
      enabled: true
    };

    const updatedReminders = [newRem, ...reminders];
    setReminders(updatedReminders);
    storageService.saveReminders(updatedReminders);

    const updatedAlerts: CaregiverAlert[] = [
      { id: `al-${Date.now()}`, type: 'info', title: `${getCgText(currentDict, 'addCustomReminderTitle')}: ${reminderTitle}`, time: getCgText(currentDict, 'justNow') },
      ...alerts
    ];
    setAlerts(updatedAlerts);
    storageService.saveAlerts(updatedAlerts);

    setReminderTitle('');
    setShowAddReminder(false);
    triggerToast(`${getCgText(currentDict, 'toastReminderAdded')} ${patientName}`);
  };

  const handleCallPatient = () => {
    alert(`${getCgText(currentDict, 'callPatient')}: ${patientName}`);
  };

  // --- STATS & OVERVIEW COMPUTATIONS ---
  const completedGamesCount = games.filter(g => g.completedToday).length;
  const totalGamesCount = 6;

  const totalTasks = schedule.length;
  const completedTasks = schedule.filter(s => s.completed).length;

  const totalReminders = reminders.length;
  const completedReminders = reminders.filter(r => r.status === 'Completed').length;
  const upcomingReminders = reminders.filter(r => r.status === 'Upcoming' || r.status === 'Scheduled').length;
  const missedReminders = reminders.filter(r => r.status === 'Missed').length;

  // Overall Today's Progress Percentage
  const totalItemsToday = totalTasks + totalReminders + totalGamesCount;
  const totalCompletedToday = completedTasks + completedReminders + completedGamesCount;
  const todayProgressPct = totalItemsToday > 0 ? Math.round((totalCompletedToday / totalItemsToday) * 100) : 0;

  // Current Streak Calculation for Monitored Patient
  const patientSessions = gameSessions.filter((s: any) => !s.patientId || s.patientId === selectedPatientId);
  const uniqueDaysStreak = new Set(patientSessions.map((s: any) => s.completedAt?.split('T')[0])).size;

  // Performance By Area (Memory, Attention, Problem Solving, Overall - NO Language)
  const mmScore = games.find(g => g.gameId === 'game-1')?.bestScore || 0;
  const soScore = games.find(g => g.gameId === 'game-2')?.bestScore || 0;
  const afScore = games.find(g => g.gameId === 'game-3')?.bestScore || 0;
  const orScore = games.find(g => g.gameId === 'game-4')?.bestScore || 0;
  const drScore = games.find(g => g.gameId === 'game-5')?.bestScore || 0;

  const calcAreaScore = (scores: number[]) => {
    const played = scores.filter(s => s > 0);
    if (played.length === 0) return 0;
    return Math.round(played.reduce((a, b) => a + b, 0) / played.length);
  };

  const memoryScore = calcAreaScore([mmScore, drScore, orScore]);
  const attentionScore = calcAreaScore([afScore, orScore]);
  const problemSolvingScore = calcAreaScore([soScore, drScore]);

  const activeAreaScores = [memoryScore, attentionScore, problemSolvingScore].filter(s => s > 0);
  const overallScore = activeAreaScores.length > 0 ? Math.round(activeAreaScores.reduce((a, b) => a + b, 0) / activeAreaScores.length) : 0;

  const hasNoPerformanceData = overallScore === 0 && memoryScore === 0 && attentionScore === 0 && problemSolvingScore === 0;

  const getCaregiverInsight = () => {
    if (hasNoPerformanceData || overallScore === 0) {
      return getCgText(currentDict, 'insightNoData');
    }
    if (overallScore < 50) {
      return getCgText(currentDict, 'insightLow');
    }
    if (overallScore <= 75) {
      return getCgText(currentDict, 'insightMedium');
    }
    return getCgText(currentDict, 'insightHigh');
  };

  const caregiverInsight = getCaregiverInsight();

  // Activity Completion %
  const activityCompletionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (totalCompletedToday > 0 ? 80 : 0);
  // Brain Training %
  const brainTrainingPct = Math.round((completedGamesCount / totalGamesCount) * 100);
  // Reminder Completion %
  const reminderCompletionPct = totalReminders > 0 ? Math.round((completedReminders / totalReminders) * 100) : 0;

  // Last Activity Determination
  const latestSession = patientSessions.length > 0
    ? patientSessions.sort((a: any, b: any) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())[0]
    : null;

  const lastActivityText = latestSession
    ? `${latestSession.gameName || getCgText(currentDict, 'brainTraining')} — ${formatTimeAgo(latestSession.completedAt, currentDict)}`
    : completedTasks > 0
    ? `${getCgText(currentDict, 'completed')} — ${getCgText(currentDict, 'today')}`
    : getCgText(currentDict, 'noRecentActivity');

  // Patient Status Determination (Active, Needs Attention, No Recent Activity)
  const getPatientStatus = () => {
    if (latestSession && (Date.now() - new Date(latestSession.completedAt).getTime()) < 2 * 60 * 60 * 1000) {
      return { label: getCgText(currentDict, 'statusActive'), color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
    if (missedReminders > 0 || (totalTasks > 0 && completedTasks === 0)) {
      return { label: getCgText(currentDict, 'statusNeedsAttention'), color: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
    if (patientSessions.length === 0 && totalCompletedToday === 0) {
      return { label: getCgText(currentDict, 'statusNoActivity'), color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
    return { label: getCgText(currentDict, 'statusActive'), color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  };

  const patientStatus = getPatientStatus();

  // UNIFIED PATIENT ACTIVITY TIMELINE
  const getPatientActivityTimeline = () => {
    const events: { id: string; title: string; timeAgo: string; icon: any; color: string; sortTime: number }[] = [];

    patientSessions.forEach((s: any) => {
      const t = new Date(s.completedAt || 0).getTime();
      const locGameName = getGameTitleLocalized(s.gameName, currentDict);
      events.push({
        id: `sess-${s.sessionId || Math.random()}`,
        title: `${locGameName || getCgText(currentDict, 'brainTraining')} — ${getCgText(currentDict, 'level')} ${s.level || 1} ${getCgText(currentDict, 'completed')}`,
        timeAgo: formatTimeAgo(s.completedAt, currentDict),
        icon: Brain,
        color: 'text-purple-700 bg-purple-50 border-purple-200',
        sortTime: t || Date.now()
      });
    });

    reminders.forEach(r => {
      const locRemTitle = getReminderTitleLocalized(r.title, currentDict);
      if (r.status === 'Completed') {
        events.push({
          id: `rem-comp-${r.id}`,
          title: `${locRemTitle} ${getCgText(currentDict, 'completed')}`,
          timeAgo: getCgText(currentDict, 'today'),
          icon: CheckCircle2,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          sortTime: Date.now() - 30 * 60 * 1000
        });
      } else if (r.status === 'Missed') {
        events.push({
          id: `rem-miss-${r.id}`,
          title: `${locRemTitle} ${getCgText(currentDict, 'missed')}`,
          timeAgo: getCgText(currentDict, 'today'),
          icon: AlertTriangle,
          color: 'text-rose-700 bg-rose-50 border-rose-200',
          sortTime: Date.now() - 60 * 60 * 1000
        });
      }
    });

    schedule.forEach(s => {
      const locSchTitle = getReminderTitleLocalized(s.title, currentDict);
      if (s.completed) {
        events.push({
          id: `sch-comp-${s.id}`,
          title: `${locSchTitle} ${getCgText(currentDict, 'completed')}`,
          timeAgo: s.time || getCgText(currentDict, 'today'),
          icon: CheckSquare,
          color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
          sortTime: Date.now() - 120 * 60 * 1000
        });
      }
    });

    events.sort((a, b) => b.sortTime - a.sortTime);

    return events.slice(0, 6);
  };

  const patientActivityEvents = getPatientActivityTimeline();

  // WEEKLY PROGRESS DATA CALCULATION (Mon-Sun real patient performance calculation)
  const getWeekDates = () => {
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const distToMon = (currentDayOfWeek + 6) % 7;
    const monDate = new Date(now);
    monDate.setDate(now.getDate() - distToMon);
    monDate.setHours(0, 0, 0, 0);

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = getISODateString();
    return labels.map((label, idx) => {
      const d = new Date(monDate);
      d.setDate(monDate.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];
      return { label, dateStr, isToday: dateStr === todayStr };
    });
  };

  const weekDates = getWeekDates();

  const weeklyProgressData = weekDates.map(({ label, dateStr, isToday }) => {
    const daySessions = patientSessions.filter((s: any) => {
      if (!s.completedAt) return false;
      return s.completedAt.split('T')[0] === dateStr;
    });

    const dayReminders = reminders.filter(r => {
      if (r.status !== 'Completed') return false;
      const lastCompleted = (r as any).lastCompletedDate;
      if (lastCompleted) return lastCompleted === dateStr;
      return isToday;
    });

    const daySchedule = schedule.filter(s => {
      if (!s.completed) return false;
      if (s.date) return s.date === dateStr;
      return isToday;
    });

    let dayVal = 0;
    const hasActivity = daySessions.length > 0 || dayReminders.length > 0 || daySchedule.length > 0;

    if (hasActivity) {
      const sessionScores = daySessions.map((s: any) => s.score || s.accuracy || 80);
      const avgSessionScore = sessionScores.length > 0 
        ? Math.round(sessionScores.reduce((a: number, b: number) => a + b, 0) / sessionScores.length) 
        : 0;

      if (daySessions.length > 0) {
        dayVal = Math.max(avgSessionScore, Math.min(100, Math.round((daySessions.length / 6) * 100)));
      } else {
        const totalRem = reminders.length > 0 ? reminders.length : 1;
        const remPct = Math.round((dayReminders.length / totalRem) * 100);
        const totalSch = schedule.length > 0 ? schedule.length : 1;
        const schPct = Math.round((daySchedule.length / totalSch) * 100);
        dayVal = Math.round((remPct + schPct) / 2);
      }
    } else if (isToday && totalCompletedToday > 0) {
      dayVal = todayProgressPct;
    }

    return { day: label, val: Math.min(100, Math.max(0, dayVal)) };
  });

  const isWeeklyDataEmpty = !weeklyProgressData.some(d => d.val > 0);

  // Dynamic Quick Actions Helper
  const getDynamicQuickAction = () => {
    if (missedReminders > 0) return { label: getCgText(currentDict, 'reviewMissed'), icon: AlertTriangle, color: 'bg-amber-500 text-white' };
    if (upcomingReminders > 0) return { label: getCgText(currentDict, 'viewUpcoming'), icon: Bell, color: 'bg-indigo-600 text-white' };
    if (completedGamesCount < 6) return { label: getCgText(currentDict, 'encourageBrain'), icon: Brain, color: 'bg-purple-600 text-white' };
    if (totalCompletedToday === 0) return { label: getCgText(currentDict, 'checkPatientActivity'), icon: ActivityIcon, color: 'bg-slate-700 text-white' };
    return { label: getCgText(currentDict, 'viewTodayProgress'), icon: CheckCircle2, color: 'bg-emerald-600 text-white' };
  };

  const mainQuickAction = getDynamicQuickAction();

  return (
    <div className="caregiver-dashboard min-h-screen bg-transparent pb-12 space-y-8 max-w-7xl mx-auto p-2 sm:p-4 rounded-3xl relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-sky-400/40 flex items-center gap-3 z-50 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-extrabold text-sm tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar with Welcome & Patient Selector Context */}
      <div className="cg-conic-shimmer cg-card flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currentDict.welcome} {currentUser?.name || 'Caregiver'}!
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-300/80 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {currentDict.activeNow}
            </span>
          </div>

          {/* Patient Selector Context with Integrated Add Patient Popover */}
          <div className="mt-3 flex items-center gap-3 flex-wrap relative">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{currentDict.selectPatient}</span>
            
            {/* Custom Dropdown Trigger Button */}
            <button
              type="button"
              ref={patientButtonRef}
              onClick={handleTogglePatientDropdown}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/90 text-xs font-extrabold text-slate-900 shadow-2xs transition-all cursor-pointer hover:border-sky-400/60"
            >
              <SVGElderlyAvatar className="w-5 h-5" />
              <span>{monitoredPatient.name} ({monitoredPatient.age || 75}y)</span>
              <ChevronDown className={`w-4 h-4 text-sky-600 transition-transform duration-200 ${showPatientDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Popover Menu */}
            {showPatientDropdown && (
              <>
                {/* Backdrop for outside click dismissal */}
                <div 
                  className="fixed inset-0 z-[9998] bg-transparent" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPatientDropdown(false);
                  }} 
                />

                <div 
                  className="fixed bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border-2 border-sky-200 z-[9999] space-y-3 animate-in fade-in zoom-in-95 duration-150 overflow-hidden flex flex-col pointer-events-auto"
                  style={{
                    top: `${dropdownPos.top}px`,
                    left: `${dropdownPos.left}px`,
                    width: `${dropdownPos.width}px`,
                    maxHeight: 'calc(100vh - 120px)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-1">
                    <div className="min-w-0 pr-2">
                      <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 truncate">
                        <Users className="w-4 h-4 text-sky-600 flex-shrink-0" />
                        <span className="truncate">{getCgText(currentDict, 'registeredPatients')}</span>
                      </h3>
                      <p className="text-[11px] font-extrabold text-slate-500 mt-0.5 truncate">{getCgText(currentDict, 'selectPatientSub')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPatientDropdown(false);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 scroll-smooth">
                    {patientDropdownOptions.length === 0 ? (
                      <p className="text-xs font-bold text-slate-500 text-center py-4">{getCgText(currentDict, 'noRegisteredPatients')}</p>
                    ) : (
                      patientDropdownOptions.map(p => {
                        const isAlreadyAssigned = assignedIds.includes(p.id);
                        const isActive = p.id === selectedPatientId;

                        return (
                          <div
                            key={p.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isAlreadyAssigned) {
                                handlePatientChange(p.id);
                              } else {
                                handleAddExistingPatient(p.id);
                              }
                              setShowPatientDropdown(false);
                            }}
                            className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                              isActive
                                ? 'bg-sky-100/90 border-sky-500 shadow-xs font-extrabold text-slate-900 ring-2 ring-sky-400/30'
                                : 'bg-slate-50/90 border-slate-200/90 hover:bg-sky-50/80 hover:border-sky-300 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-sky-600 text-white shadow-2xs' : 'bg-sky-100 text-sky-700'}`}>
                                <SVGElderlyAvatar className="w-7 h-7" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className={`font-extrabold text-xs sm:text-sm truncate ${isActive ? 'text-sky-900' : 'text-slate-900'}`}>{p.name}</h4>
                                  {p.age && <span className="text-[10px] font-bold text-slate-500 flex-shrink-0">({p.age}{getCgText(currentDict, 'yrsLabel')})</span>}
                                </div>
                                {isActive ? (
                                  <span className="text-[10px] font-black text-sky-700 block truncate">● {getCgText(currentDict, 'activeMonitoring')}</span>
                                ) : isAlreadyAssigned ? (
                                  <span className="text-[10px] font-bold text-emerald-700 block truncate">✓ {getCgText(currentDict, 'alreadyAdded')}</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-500 block truncate">{getCgText(currentDict, 'registeredAccountLabel')}</span>
                                )}
                              </div>
                            </div>

                            {/* Action Controls & Checkmark Indicator */}
                            <div className="flex-shrink-0">
                              {isActive ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white shadow-2xs">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </span>
                                  {isAlreadyAssigned && patientDropdownOptions.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleInitiateRemovePatient(p.id, p.name);
                                      }}
                                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-500 border border-rose-200 transition-all cursor-pointer"
                                      title={getCgText(currentDict, 'removePatientBtn')}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ) : isAlreadyAssigned ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-xl">
                                    Select →
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInitiateRemovePatient(p.id, p.name);
                                    }}
                                    className="p-1 rounded-lg hover:bg-rose-100 text-rose-500 border border-rose-200 transition-all cursor-pointer"
                                    title={getCgText(currentDict, 'removePatientBtn')}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddExistingPatient(p.id);
                                    setShowPatientDropdown(false);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-black hover:bg-sky-700 shadow-2xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ {getCgText(currentDict, 'addPatient')}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Header Area: Caregiver Profile Picture Button */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="cg-subtle-float group relative flex items-center gap-3 p-1.5 pr-4 rounded-full bg-slate-900 hover:bg-slate-800 border-2 border-sky-400/60 shadow-[0_0_15px_rgba(2,132,199,0.15)] transition-all duration-300 cursor-pointer active:scale-95"
            title={getCgText(currentDict, 'caregiverProfile')}
          >
            <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
              {caregiverPhoto ? (
                <img
                  src={caregiverPhoto}
                  alt={caregiverUser?.name || 'Caregiver'}
                  className="w-full h-full object-cover rounded-full border border-sky-300/40"
                />
              ) : (
                <DefaultCaregiverAvatar className="w-11 h-11" />
              )}
              {/* Subtle Camera Edit Overlay Badge */}
              <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full text-white">
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div className="text-left hidden sm:block">
              <span className="text-xs font-black text-white block leading-tight">
                {caregiverUser?.name || 'Caregiver'}
              </span>
              <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider block">
                {getCgText(currentDict, 'caregiverProfile')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 1. PATIENT OVERVIEW CARD */}
      <div className="cg-conic-shimmer cg-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 border border-sky-200/80 flex items-center justify-center flex-shrink-0 shadow-xs cg-subtle-float">
              <SVGElderlyAvatar className="w-12 h-12" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{patientName}</h2>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${patientStatus.color} shadow-2xs`}>
                  {patientStatus.label}
                </span>
              </div>
              <p className="text-xs font-extrabold text-slate-500 mt-1">
                {monitoredPatient.age || 75} {getCgText(currentDict, 'yrsLabel')} • {monitoredPatient.gender === 'Female' ? getCgText(currentDict, 'femaleLabel') : getCgText(currentDict, 'maleLabel')} • {getCgText(currentDict, 'regionLabel') || monitoredPatient.region || 'Guwahati, NER'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-black uppercase tracking-wider text-sky-600 block">{currentDict.lastActivity}</span>
            <span className="text-sm font-black text-slate-900 mt-0.5 block">{lastActivityText}</span>
          </div>
        </div>

        {/* Overview Key Metrics Grid with Dedicated Accents */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Today's Progress (Sky / Cyan Accent) */}
          <div className="bg-sky-50/70 hover:bg-sky-50 p-4 rounded-2xl border border-sky-100 transition-all duration-300 hover:shadow-md space-y-2">
            <span className="text-xs font-black text-sky-800 uppercase tracking-wider block">{currentDict.todayProgress}</span>
            <span className="text-2xl font-black text-slate-900">{todayProgressPct}%</span>
            <div className="w-full bg-sky-200/80 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-cyan-500 h-full transition-all duration-700" style={{ width: `${todayProgressPct}%` }} />
            </div>
          </div>

          {/* Brain Training (Purple / Violet Accent) */}
          <div className="bg-purple-50/70 hover:bg-purple-50 p-4 rounded-2xl border border-purple-100 transition-all duration-300 hover:shadow-md space-y-2">
            <span className="text-xs font-black text-purple-800 uppercase tracking-wider block">{currentDict.brainTraining}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{completedGamesCount}</span>
              <span className="text-xs font-black text-slate-500">/ {totalGamesCount}</span>
            </div>
            <span className="text-[11px] font-extrabold text-purple-700 block">{completedGamesCount === 6 ? getCgText(currentDict, 'allGoalsCompleted') : getCgText(currentDict, 'dailyExercises')}</span>
          </div>

          {/* Current Streak (Teal / Flame Accent) */}
          <div className="bg-teal-50/70 hover:bg-teal-50 p-4 rounded-2xl border border-teal-100 transition-all duration-300 hover:shadow-md space-y-2">
            <span className="text-xs font-black text-teal-800 uppercase tracking-wider block">{currentDict.currentStreak}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{uniqueDaysStreak}</span>
              <span className="text-xs font-black text-slate-500">{currentDict.days}</span>
            </div>
            <span className="text-[11px] font-extrabold text-amber-600 flex items-center gap-1">
              <span className="animate-pulse">🔥</span> {getCgText(currentDict, 'activeStreak')}
            </span>
          </div>

          {/* Reminders Status (Mint / Indigo Accent) */}
          <div className="bg-emerald-50/70 hover:bg-emerald-50 p-4 rounded-2xl border border-emerald-100 transition-all duration-300 hover:shadow-md space-y-2">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block">{currentDict.remindersStatus}</span>
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="text-emerald-700">{completedReminders} {getCgText(currentDict, 'done')}</span>
              <span>•</span>
              <span className="text-indigo-700">{upcomingReminders} {getCgText(currentDict, 'next')}</span>
            </div>
            {missedReminders > 0 ? (
              <span className="text-[11px] font-black text-rose-600 block">⚠ {missedReminders} {getCgText(currentDict, 'missedToday')}</span>
            ) : (
              <span className="text-[11px] font-black text-emerald-600 block">✓ {getCgText(currentDict, 'noMissedItems')}</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. SECOND ROW: DAILY / WEEKLY PROGRESS & UNIFIED PATIENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT 7 COLUMNS: DAILY / WEEKLY PROGRESS VISUALIZATION */}
        <div className="lg:col-span-7 cg-shimmer-border cg-card p-6 sm:p-7 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                <span>{progressViewMode === 'daily' ? getCgText(currentDict, 'todayProgressUpper') : getCgText(currentDict, 'weeklyProgressUpper')}</span>
              </h3>
              <p className="text-xs text-slate-500 font-extrabold mt-0.5">
                {progressViewMode === 'daily' ? getCgText(currentDict, 'dailyProgressSub') : getCgText(currentDict, 'weeklyProgressSub')}
              </p>
            </div>

            {/* Daily / Weekly Switch Buttons */}
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setProgressViewMode('daily')}
                className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  progressViewMode === 'daily'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {getCgText(currentDict, 'daily')}
              </button>
              <button
                type="button"
                onClick={() => setProgressViewMode('weekly')}
                className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  progressViewMode === 'weekly'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {getCgText(currentDict, 'weekly')}
              </button>
            </div>
          </div>

          {/* Render Daily View or Weekly View */}
          {progressViewMode === 'daily' ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 hover:border-sky-300 transition-all">
                  <span className="text-xs font-black text-slate-600 uppercase block">{getCgText(currentDict, 'tasksCompleted')}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900">{completedTasks}</span>
                    <span className="text-xs font-extrabold text-slate-500">/ {totalTasks}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 hover:border-sky-300 transition-all">
                  <span className="text-xs font-black text-slate-600 uppercase block">{getCgText(currentDict, 'brainTraining')}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900">{completedGamesCount}</span>
                    <span className="text-xs font-extrabold text-slate-500">/ {totalGamesCount}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-purple-600 h-full transition-all duration-500" style={{ width: `${(completedGamesCount / totalGamesCount) * 100}%` }} />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 hover:border-sky-300 transition-all">
                  <span className="text-xs font-black text-slate-600 uppercase block">{getCgText(currentDict, 'remindersCompleted')}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900">{completedReminders}</span>
                    <span className="text-xs font-extrabold text-slate-500">/ {totalReminders}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${totalReminders > 0 ? (completedReminders / totalReminders) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 hover:border-sky-300 transition-all">
                  <span className="text-xs font-black text-slate-600 uppercase block">{getCgText(currentDict, 'overallProgress')}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900">{todayProgressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-sky-600 h-full transition-all duration-500" style={{ width: `${todayProgressPct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <WeeklyProgressChart dailyData={weeklyProgressData} isEmpty={isWeeklyDataEmpty} patientName={patientName} />
          )}

          {/* Performance Summary Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div className="bg-sky-50/60 p-3 rounded-2xl border border-sky-100 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase block">{getCgText(currentDict, 'activity')}</span>
              <span className="text-lg font-black text-slate-900 mt-0.5 block">{activityCompletionPct}%</span>
            </div>
            <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-100 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase block">{getCgText(currentDict, 'brainTraining')}</span>
              <span className="text-lg font-black text-slate-900 mt-0.5 block">{brainTrainingPct}%</span>
            </div>
            <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase block">{getCgText(currentDict, 'remindersStatus')}</span>
              <span className="text-lg font-black text-slate-900 mt-0.5 block">{reminderCompletionPct}%</span>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLUMNS: UNIFIED PATIENT ACTIVITY TIMELINE */}
        <div className="lg:col-span-5 cg-shimmer-border cg-card p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-sky-600" />
                <span>{currentDict.patientActivity}</span>
              </h3>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                {getCgText(currentDict, 'timeline')}
              </span>
            </div>

            {/* Dynamic Height Timeline Container */}
            {patientActivityEvents.length === 0 ? (
              <div className="py-10 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 my-4">
                <p className="text-slate-900 font-black text-base">{currentDict.noRecentActivity}</p>
                <p className="text-xs text-slate-500 font-extrabold">{getCgText(currentDict, 'activityLogEmptySub')}</p>
              </div>
            ) : (
              <div className="space-y-3 mt-4 max-h-[380px] overflow-y-auto pr-1">
                {patientActivityEvents.map((ev) => (
                  <div key={ev.id} className={`flex items-center justify-between p-3.5 rounded-2xl border ${ev.color} transition-all hover:scale-[1.01] hover:shadow-xs`}>
                    <div className="flex items-center gap-3">
                      <ev.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-black text-sm text-slate-900">{ev.title}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 flex-shrink-0 ml-2">{ev.timeAgo}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Caregiver Quick Actions */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900">{currentDict.cgQuickActions}</h4>
            
            {/* Primary Dynamic Action Button */}
            <div className={`p-3.5 rounded-2xl ${mainQuickAction.color} shadow-xs space-y-1 transition-all hover:shadow-md cursor-pointer`}>
              <div className="flex items-center gap-2">
                <mainQuickAction.icon className="w-4 h-4" />
                <span className="font-black text-xs">{mainQuickAction.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowAddReminder(true)}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white border border-sky-200 transition-all font-black text-xs shadow-2xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{currentDict.addReminderBtn}</span>
              </button>
              <button
                type="button"
                onClick={handleCallPatient}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 transition-all font-black text-xs shadow-2xs cursor-pointer active:scale-95"
              >
                <Phone className="w-4 h-4 stroke-[2.5]" />
                <span>{currentDict.callPatient}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. THIRD ROW: DEDICATED PERFORMANCE BY AREA SECTION */}
      <div id="performance-section" className="cg-shimmer-border cg-card p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-2xl text-slate-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-sky-600" />
              <span>{getCgText(currentDict, 'perfArea')}</span>
            </h3>
            <span className="text-xs font-black text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200">
              {getCgText(currentDict, 'cognitiveInsights')}
            </span>
          </div>
          <p className="text-sm text-slate-500 font-extrabold mt-1">
            {getCgText(currentDict, 'perfSub')}
          </p>
        </div>

        {/* 2-Column Responsive Layout: Left: Animated Circular Progress Rings, Right: Caregiver Insight Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Cognitive Areas (Memory, Attention, Problem Solving) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Memory Card */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-4 hover:border-purple-300 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                  <span className="w-3 h-3 rounded-full bg-purple-600 animate-pulse"></span>
                  {getCgText(currentDict, 'memory')}
                </div>
                <p className="text-xs text-slate-600 font-extrabold">{getCgText(currentDict, 'memoryGamesSub')}</p>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="#e2e8f0" strokeWidth="4.5" fill="transparent" />
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    stroke="#9333ea"
                    strokeWidth="4.5"
                    strokeDasharray={2 * Math.PI * 22}
                    strokeDashoffset={2 * Math.PI * 22 - (memoryScore / 100) * (2 * Math.PI * 22)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-black text-purple-700">{memoryScore}%</span>
              </div>
            </div>

            {/* Attention Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-4 hover:border-indigo-300 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse"></span>
                  {getCgText(currentDict, 'attention')}
                </div>
                <p className="text-xs text-slate-600 font-extrabold">{getCgText(currentDict, 'attentionGamesSub')}</p>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="#e2e8f0" strokeWidth="4.5" fill="transparent" />
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    stroke="#4f46e5"
                    strokeWidth="4.5"
                    strokeDasharray={2 * Math.PI * 22}
                    strokeDashoffset={2 * Math.PI * 22 - (attentionScore / 100) * (2 * Math.PI * 22)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-black text-indigo-700">{attentionScore}%</span>
              </div>
            </div>

            {/* Problem Solving Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between gap-4 hover:border-emerald-300 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse"></span>
                  {getCgText(currentDict, 'problemSolving')}
                </div>
                <p className="text-xs text-slate-600 font-extrabold">{getCgText(currentDict, 'problemSolvingGamesSub')}</p>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="#e2e8f0" strokeWidth="4.5" fill="transparent" />
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    stroke="#10b981"
                    strokeWidth="4.5"
                    strokeDasharray={2 * Math.PI * 22}
                    strokeDashoffset={2 * Math.PI * 22 - (problemSolvingScore / 100) * (2 * Math.PI * 22)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-xs font-black text-emerald-700">{problemSolvingScore}%</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Caregiver Insight Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-3xl bg-gradient-to-br from-sky-50/90 via-indigo-50/60 to-purple-50/50 border border-sky-200/80 shadow-xs space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm cg-subtle-float">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900">{getCgText(currentDict, 'cgInsightTitle')}</h4>
                  <p className="text-[11px] text-slate-500 font-black">{getCgText(currentDict, 'cgInsightSub')}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-sky-200/60 shadow-2xs">
                <p className="text-sm font-black text-slate-900 leading-relaxed">
                  &quot;{caregiverInsight}&quot;
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between">
              <span className="text-xs font-black text-slate-600">{getCgText(currentDict, 'overall')}</span>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="16" stroke="#e2e8f0" strokeWidth="4" fill="transparent" />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="#0284c7"
                      strokeWidth="4"
                      strokeDasharray={2 * Math.PI * 16}
                      strokeDashoffset={2 * Math.PI * 16 - (overallScore / 100) * (2 * Math.PI * 16)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-sky-700">{overallScore}%</span>
                </div>
                <span className="text-lg font-black text-sky-600">{overallScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD REMINDER MODAL (With Senior-Friendly 12h Time Selector) */}
      {showAddReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-sky-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="font-black text-xl text-slate-900">{getCgText(currentDict, 'addCustomReminderTitle')} ({patientName})</h2>
              <button onClick={() => setShowAddReminder(false)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">{getCgText(currentDict, 'reminderTitleLabel')}</label>
                <input
                  type="text"
                  placeholder={getCgText(currentDict, 'reminderPlaceholder')}
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-base"
                  required
                />
              </div>

              {/* Caregiver 12-Hour AM/PM Time Selector */}
              <TimeSelector12h
                label={getCgText(currentDict, 'scheduledTimeLabel')}
                value={reminderTime24h}
                onChange={(val24h) => setReminderTime24h(val24h)}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">{getCgText(currentDict, 'categoryLabel')}</label>
                  <select
                    value={reminderCategory}
                    onChange={(e) => setReminderCategory(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base"
                  >
                    <option value="medicine">{getCgText(currentDict, 'catMedicine')}</option>
                    <option value="hydration">{getCgText(currentDict, 'catHydration')}</option>
                    <option value="meals">{getCgText(currentDict, 'catMeals')}</option>
                    <option value="exercise">{getCgText(currentDict, 'catExercise')}</option>
                    <option value="appointments">{getCgText(currentDict, 'catAppointments')}</option>
                    <option value="family">{getCgText(currentDict, 'catFamily')}</option>
                    <option value="other">{getCgText(currentDict, 'catOther')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">{getCgText(currentDict, 'repeatIntervalLabel')}</label>
                  <select
                    value={reminderRepeat}
                    onChange={(e) => setReminderRepeat(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base"
                  >
                    <option value="Daily">{getCgText(currentDict, 'repDaily')}</option>
                    <option value="Weekly">{getCgText(currentDict, 'repWeekly')}</option>
                    <option value="Every 2 hours">{getCgText(currentDict, 'repEvery2h')}</option>
                    <option value="Once">{getCgText(currentDict, 'repOnce')}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-gradient-to-r from-sky-600 to-indigo-600 text-white py-3.5 rounded-2xl font-black hover:opacity-95 text-base shadow-md cursor-pointer transition-all active:scale-95"
              >
                {getCgText(currentDict, 'addReminderBtn')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE PATIENT CONFIRMATION MODAL */}
      {patientToRemove && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setPatientToRemove(null); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border-2 border-sky-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-slate-900">{getCgText(currentDict, 'removePatientTitle')} — {patientToRemove.name}?</h2>
                  <p className="text-xs font-extrabold text-slate-500">{getCgText(currentDict, 'cgAssociationSub')}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setPatientToRemove(null)} 
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-bold text-slate-700 leading-relaxed">
              {getCgText(currentDict, 'removeConfirmMsg')} (<strong className="text-slate-900">{patientToRemove.name}</strong>)?
            </p>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{getCgText(currentDict, 'patientSafetyNotice')}</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPatientToRemove(null)}
                className="w-1/2 py-3 rounded-2xl border border-gray-300 font-extrabold text-sm text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                {getCgText(currentDict, 'cancel')}
              </button>
              <button
                type="button"
                onClick={confirmRemovePatient}
                className="w-1/2 bg-rose-600 text-white py-3 rounded-2xl font-black text-sm hover:bg-rose-700 shadow-sm transition-all cursor-pointer"
              >
                {getCgText(currentDict, 'removePatientBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED PATIENT MANAGEMENT MODAL */}
      {showManagePatientsModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowManagePatientsModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-sky-200 space-y-5 relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-lg text-slate-900">{getCgText(currentDict, 'registeredPatients')}</h2>
                  <p className="text-xs font-extrabold text-slate-500">{getCgText(currentDict, 'selectPatientSub')}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowManagePatientsModal(false)} 
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Registered Accounts */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-96 scroll-smooth">
              {allProfiles.filter(p => p.role === 'Patient').length === 0 ? (
                <p className="text-xs font-bold text-slate-500 text-center py-8">{getCgText(currentDict, 'noRegisteredPatients')}</p>
              ) : (
                allProfiles.filter(p => p.role === 'Patient').map(p => {
                  const isAssigned = assignedIds.includes(p.id);
                  const isSelected = p.id === selectedPatientId;

                  return (
                    <div 
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-sky-100/90 border-sky-500 shadow-xs ring-2 ring-sky-400/30'
                          : isAssigned 
                          ? 'bg-slate-50 border-slate-200 hover:bg-sky-50/50'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-700'}`}>
                          <SVGElderlyAvatar className="w-8 h-8" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-sm text-slate-900 truncate">{p.name}</h3>
                            {p.age && <span className="text-xs font-bold text-slate-500 flex-shrink-0">({p.age} {getCgText(currentDict, 'yrsLabel')})</span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-0.5 flex-wrap">
                            {p.gender && <span>{p.gender}</span>}
                            {p.gender && p.region && <span>•</span>}
                            {p.region && <span>{p.region}</span>}
                          </div>
                          {isSelected ? (
                            <span className="text-[11px] font-black text-sky-700 block mt-1">● {getCgText(currentDict, 'activeMonitoring')}</span>
                          ) : isAssigned ? (
                            <span className="text-[11px] font-bold text-emerald-700 block mt-1">✓ {getCgText(currentDict, 'alreadyAdded')}</span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400 block mt-1">{getCgText(currentDict, 'registeredAccountLabel')}</span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isAssigned ? (
                          <>
                            {!isSelected && (
                              <button
                                type="button"
                                onClick={() => {
                                  handlePatientChange(p.id);
                                  setShowManagePatientsModal(false);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-black hover:bg-sky-700 transition-all cursor-pointer"
                              >
                                Select
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleInitiateRemovePatient(p.id, p.name)}
                              className="p-2 rounded-xl hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                              title={getCgText(currentDict, 'removePatientBtn')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddExistingPatient(p.id)}
                            className="px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs font-black hover:bg-sky-700 shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ {getCgText(currentDict, 'addPatient')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowManagePatientsModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                {getCgText(currentDict, 'closeBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAREGIVER PROFILE MODAL */}
      {showProfileModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowProfileModal(false); }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-sky-200 space-y-6 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <h2 className="font-black text-xl text-slate-900">{getCgText(currentDict, 'caregiverProfile')}</h2>
              </div>
              <button 
                type="button"
                onClick={() => setShowProfileModal(false)} 
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar & Primary Details */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-sky-200 shadow-lg flex items-center justify-center bg-sky-50">
                  {caregiverPhoto ? (
                    <img 
                      src={caregiverPhoto} 
                      alt={caregiverUser?.name || 'Caregiver'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <DefaultCaregiverAvatar className="w-28 h-28" />
                  )}
                </div>
                {/* Camera Overlay Badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-sky-600 text-white shadow-lg border-2 border-white hover:bg-sky-700 transition-all cursor-pointer"
                  title={getCgText(currentDict, 'changePhotoTitle')}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {caregiverUser?.name || 'Caregiver'}
                </h3>
                <span className="inline-block mt-1 px-3.5 py-1 rounded-full bg-sky-100 text-sky-800 font-extrabold text-xs border border-sky-200">
                  {getCgText(currentDict, 'roleCaregiverLabel')}
                </span>
              </div>
            </div>

            {/* Stored Profile Information Grid */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                <span className="font-bold text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  {getCgText(currentDict, 'accountIdLabel')}
                </span>
                <span className="font-black text-slate-900">{caregiverUser?.id || 'caregiver'}</span>
              </div>

              {caregiverUser?.age !== undefined && caregiverUser?.age !== null && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500">{getCgText(currentDict, 'ageLabel')}</span>
                  <span className="font-black text-slate-900">{caregiverUser.age} {getCgText(currentDict, 'yrsLabel')}</span>
                </div>
              )}

              {caregiverUser?.gender && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500">{getCgText(currentDict, 'genderLabel')}</span>
                  <span className="font-black text-slate-900">{caregiverUser.gender}</span>
                </div>
              )}

              {caregiverUser?.email && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    {getCgText(currentDict, 'emailLabel')}
                  </span>
                  <span className="font-black text-slate-900 truncate max-w-[180px]">{caregiverUser.email}</span>
                </div>
              )}

              {caregiverUser?.phone && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                  <span className="font-bold text-slate-500 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                    {getCgText(currentDict, 'phoneLabel')}
                  </span>
                  <span className="font-black text-slate-900">{caregiverUser.phone}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-1.5">
                <span className="font-bold text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  {getCgText(currentDict, 'assignedPatientsLabel')}
                </span>
                <span className="font-black text-slate-900">{assignedIds.length} {getCgText(currentDict, 'patientsCountLabel')}</span>
              </div>
            </div>

            {/* Actions: Change Profile Picture & Close */}
            <div className="space-y-2.5 pt-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-black text-sm hover:opacity-95 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>{getCgText(currentDict, 'changeProfilePicBtn')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 text-slate-900 font-extrabold text-sm hover:bg-slate-200 transition-all cursor-pointer"
              >
                {getCgText(currentDict, 'closeBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};