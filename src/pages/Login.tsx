import React, { useState, useEffect } from 'react';
import { User, Plus, ChevronRight, LogIn, Trash2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { UserProfile } from '../services/storageService';
import { useLanguage } from '../context/LanguageContext';
import { SVGBrain } from '../components/SVGIcons';
import type { LanguageKey } from '../services/translationService';

interface LoginProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { setLanguage } = useLanguage();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'initial' | 'select' | 'create'>('initial');

  // New profile form states
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [caregiverName, setCaregiverName] = useState('');
  const [language, setProfileLanguage] = useState('English');
  const [role, setRole] = useState<'Patient' | 'Caregiver'>('Patient');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [pin, setPin] = useState('1234');
  const [password, setPassword] = useState('caregiver123');
  const [stateRegion, setStateRegion] = useState('Guwahati, NER');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  useEffect(() => {
    storageService.init();
    setProfiles(storageService.getProfiles());
  }, []);

  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const [credentialInput, setCredentialInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [createProfileError, setCreateProfileError] = useState<string | null>(null);

  const handleProfileSelect = (profile: UserProfile) => {
    setPendingProfile(profile);
    setCredentialInput('');
    setLoginError(null);
  };

  const [profileToDelete, setProfileToDelete] = useState<UserProfile | null>(null);

  const executeProfileDeletion = () => {
    if (!profileToDelete) return;
    
    const currentUser = storageService.getCurrentUser();
    if (currentUser && currentUser.id === profileToDelete.id) {
      storageService.logout();
    }
    
    const id = profileToDelete.id;
    const keysToDelete = [
      `sb_prof_${id}_settings`,
      `sb_prof_${id}_profile`,
      `sb_prof_${id}_reminders`,
      `sb_prof_${id}_schedule`,
      `sb_prof_${id}_memories`,
      `sb_prof_${id}_contacts`,
      `sb_prof_${id}_games`,
      `sb_prof_${id}_game_sessions`,
      `sb_prof_${id}_alerts`,
      `sb_prof_${id}_mood`
    ];
    keysToDelete.forEach(k => localStorage.removeItem(k));
    
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    localStorage.setItem('sb_profiles', JSON.stringify(updated));
    
    setProfileToDelete(null);
  };

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingProfile) return;

    if (pendingProfile.role === 'Patient') {
      const expectedPin = pendingProfile.pin || '1234';
      if (credentialInput === expectedPin) {
        storageService.setCurrentUser(pendingProfile.id);
        setLanguage(pendingProfile.language as LanguageKey);
        onLoginSuccess(pendingProfile);
      } else {
        setLoginError('Incorrect PIN. Please try again.');
      }
    } else {
      const expectedPassword = pendingProfile.password || 'caregiver123';
      if (credentialInput === expectedPassword) {
        storageService.setCurrentUser(pendingProfile.id);
        const assigned = pendingProfile.assignedPatients || ['ramesh_1', 'ravi-demo'];
        localStorage.setItem('sb_caregiver_selected_patient_id', assigned[0] || 'ravi-demo');
        setLanguage(pendingProfile.language as LanguageKey);
        onLoginSuccess(pendingProfile);
      } else {
        setLoginError('Incorrect Password. Please try again.');
      }
    }
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (role === 'Caregiver') {
      if (age === undefined || age === null || isNaN(age)) {
        setCreateProfileError('Caregivers must be 18 years or older.');
        return;
      }
      if (age < 18) {
        setCreateProfileError('Caregivers must be 18 years or older.');
        return;
      }
    }

    setCreateProfileError(null);
    const newProfile = storageService.createProfile(
      name.trim(),
      age,
      role === 'Patient' ? (caregiverName.trim() || undefined) : undefined,
      language,
      role,
      gender,
      role === 'Patient' ? pin : undefined,
      role === 'Caregiver' ? password : undefined,
      role === 'Caregiver' ? selectedPatients : undefined,
      role === 'Patient' ? stateRegion : undefined
    );
    storageService.setCurrentUser(newProfile.id);
    setLanguage(newProfile.language as LanguageKey);
    onLoginSuccess(newProfile);
  };

  const languagesList = [
    { code: 'English', label: 'English' },
    { code: 'Assamese', label: 'অসমীয়া — Assamese' },
    { code: 'Bengali', label: 'বাংলা — Bengali' },
    { code: 'Hindi', label: 'हिन्दी — Hindi' },
    { code: 'Manipuri', label: 'মৈতৈলোন — Manipuri' },
    { code: 'Khasi', label: 'Khasi' },
    { code: 'Mizo', label: 'Mizo' },
    { code: 'Nagamese', label: 'Nagamese' },
    { code: 'Tripuri', label: 'Kokborok / Tripuri' }
  ];

  return (
    <div className="min-h-screen bg-brand-lavender flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-brand-purpleLight shadow-md max-w-md w-full p-6 md:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <SVGBrain className="w-16 h-16 text-brand-purple animate-pulse" />
          <h1 className="text-3xl font-extrabold text-brand-navy">Welcome to DIMENTIACARE</h1>
          <p className="text-brand-grayText font-medium text-sm">Your memory companion</p>
        </div>

        {pendingProfile ? (
          <form onSubmit={handleCredentialSubmit} className="space-y-4">
            <h2 className="text-xl font-bold text-brand-navy border-b border-brand-purpleLight pb-2 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-brand-purple" />
              <span>Login as {pendingProfile.name}</span>
            </h2>

            {loginError && (
              <div className="bg-brand-redBg text-brand-red p-3 rounded-xl text-sm font-bold text-center">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-brand-navy uppercase tracking-wider mb-1">
                {pendingProfile.role === 'Patient' ? 'Enter 4-Digit PIN' : 'Enter Caregiver Password'}
              </label>
              <input
                type={pendingProfile.role === 'Patient' ? 'password' : 'text'}
                pattern={pendingProfile.role === 'Patient' ? '\\d*' : undefined}
                maxLength={pendingProfile.role === 'Patient' ? 4 : undefined}
                placeholder={pendingProfile.role === 'Patient' ? 'e.g. 1234' : 'e.g. caregiver123'}
                value={credentialInput}
                onChange={(e) => setCredentialInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple font-bold text-brand-navy text-center tracking-widest text-lg"
                required
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3.5 bg-brand-purple text-white rounded-xl font-bold hover:bg-opacity-95 flex items-center justify-center gap-2 shadow-sm text-base"
              >
                <span>Submit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingProfile(null);
                  setLoginError(null);
                }}
                className="px-5 py-3.5 bg-brand-lavender text-brand-purple rounded-xl font-bold hover:bg-brand-purpleLight text-base"
              >
                Back
              </button>
            </div>
          </form>
        ) : viewMode === 'initial' && !showAddForm ? (
          /* Neutral Initial State */
          <div className="space-y-6 text-center">
            <div className="bg-brand-lavender/60 border border-brand-purpleLight rounded-2xl p-4 flex flex-col items-center justify-center space-y-1">
              <span className="text-xs font-black text-brand-grayText uppercase tracking-wider">Account Status</span>
              <span className="text-sm font-extrabold text-brand-navy bg-white px-3.5 py-1.5 rounded-full border border-brand-purpleLight shadow-2xs">
                No account selected
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(true);
                  setViewMode('create');
                }}
                className="w-full py-4 bg-brand-purple text-white rounded-xl font-bold hover:bg-opacity-95 flex items-center justify-center gap-2 shadow-sm text-base transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Account</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('select')}
                className="w-full py-3.5 bg-brand-lavender border border-brand-purpleLight text-brand-navy rounded-xl font-bold hover:bg-brand-purpleLight flex items-center justify-center gap-2 text-base transition-all"
              >
                <User className="w-5 h-5 text-brand-purple" />
                <span>Sign In / Choose Account</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'select' && !showAddForm ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-brand-navy border-b border-brand-purpleLight pb-2">Select Profile</h2>
            
            {profiles.length === 0 ? (
              <p className="text-brand-grayText font-medium text-center py-4">No local profiles created yet.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleProfileSelect(p)}
                    className="flex items-center justify-between p-4 rounded-2xl border border-brand-purpleLight hover:border-brand-purple hover:bg-brand-purpleLight cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <h4 className="font-extrabold text-brand-navy">{p.name}</h4>
                        <p className="text-xs text-brand-grayText font-semibold">
                          {p.role} • {p.language} {p.age ? `• Age ${p.age}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProfileToDelete(p);
                        }}
                        className="p-2 rounded-xl text-brand-red hover:bg-brand-redBg hover:text-brand-red transition-all"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-brand-purple" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(true);
                  setViewMode('create');
                }}
                className="flex-1 py-3.5 bg-brand-purple text-white rounded-xl font-bold hover:bg-opacity-95 flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Account</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('initial')}
                className="px-4 py-3.5 bg-brand-lavender text-brand-navy rounded-xl font-bold hover:bg-brand-purpleLight text-sm"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          /* Profile Creation Form */
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <h2 className="text-xl font-bold text-brand-navy border-b border-brand-purpleLight pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-purple" />
              <span>Create New Profile</span>
            </h2>

            {createProfileError && (
              <div className="bg-brand-redBg text-brand-red p-3 rounded-xl text-sm font-bold text-center">
                {createProfileError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-brand-navy uppercase tracking-wider mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sita or Arun"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple font-bold text-brand-navy"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-brand-navy uppercase tracking-wider mb-1">
                    Age {role === 'Caregiver' ? '' : '(Optional)'}
                  </label>
                  <input
                    type="number"
                    placeholder={role === 'Caregiver' ? 'e.g. 25' : 'e.g. 78'}
                    value={age || ''}
                    onChange={(e) => {
                      setAge(e.target.value ? parseInt(e.target.value, 10) : undefined);
                      setCreateProfileError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple font-bold text-brand-navy"
                    required={role === 'Caregiver'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-brand-navy uppercase tracking-wider mb-1">I am a:</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'Patient' | 'Caregiver')}
                    className="w-full px-3 py-3 rounded-xl border border-brand-purpleLight bg-white font-bold text-brand-navy focus:outline-none focus:border-brand-purple"
                  >
                    <option value="Patient">Patient</option>
                    <option value="Caregiver">Caregiver</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-brand-navy uppercase tracking-wider mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                  className="w-full px-3 py-3 rounded-xl border border-brand-purpleLight bg-white font-bold text-brand-navy focus:outline-none focus:border-brand-purple"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {role === 'Patient' ? (
                <>
                  <div>
                    <label className="block text-xs font-black text-brand-navy uppercase tracking-wider mb-1">Set 4-Digit PIN (numeric)</label>
                    <input
                      type="password"
                      pattern="\d*"
                      maxLength={4}
                      placeholder="e.g. 1234"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple font-bold text-brand-navy"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-brand-navy uppercase tracking-wider mb-1">Caregiver Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Anu"
                      value={caregiverName}
                      onChange={(e) => setCaregiverName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple font-bold text-brand-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-brand-navy uppercase tracking-wider mb-1">State / Region (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Assam, NER"
                      value={stateRegion}
                      onChange={(e) => setStateRegion(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple font-bold text-brand-navy"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-black text-brand-navy uppercase tracking-wider mb-1">Set Caregiver Password</label>
                    <input
                      type="text"
                      placeholder="e.g. caregiver123"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-purpleLight focus:outline-none focus:border-brand-purple font-bold text-brand-navy"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-brand-navy uppercase tracking-wider mb-1">Assign Patients</label>
                    <div className="space-y-1 bg-brand-purpleLight p-3 rounded-xl max-h-32 overflow-y-auto">
                      {profiles.filter(p => p.role === 'Patient').length === 0 ? (
                        <p className="text-xs text-brand-grayText font-semibold">No patients found. Create a patient profile first!</p>
                      ) : (
                        profiles.filter(p => p.role === 'Patient').map(p => (
                          <label key={p.id} className="flex items-center gap-2 text-sm font-bold text-brand-navy cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedPatients.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPatients([...selectedPatients, p.id]);
                                } else {
                                  setSelectedPatients(selectedPatients.filter(id => id !== p.id));
                                }
                              }}
                              className="rounded border-brand-purpleLight text-brand-purple focus:ring-brand-purple"
                            />
                            <span>{p.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-black text-brand-navy uppercase tracking-wider mb-1">Preferred Language</label>
                <select
                  value={language}
                  onChange={(e) => setProfileLanguage(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-brand-purpleLight bg-white font-bold text-brand-navy focus:outline-none focus:border-brand-purple"
                >
                  {languagesList.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                className="flex-1 py-3.5 bg-brand-purple text-white rounded-xl font-bold hover:bg-opacity-95 flex items-center justify-center gap-2 shadow-sm text-base"
              >
                <LogIn className="w-5 h-5" />
                <span>Continue</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setViewMode('initial');
                  setCreateProfileError(null);
                  setName('');
                  setAge(undefined);
                }}
                className="px-5 py-3.5 bg-brand-lavender text-brand-purple rounded-xl font-bold hover:bg-brand-purpleLight text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {profileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border-2 border-brand-red animate-scale-up space-y-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-redBg text-brand-red mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-brand-navy">Delete {profileToDelete.name}'s profile?</h3>
              <p className="text-sm font-semibold text-brand-grayText leading-relaxed">
                This will remove this profile and all its locally stored reminders, activities, game progress, memories, settings, and alerts.
              </p>
              <p className="text-xs text-brand-red font-black uppercase tracking-wider bg-brand-redBg p-2 rounded-lg">
                Warning: This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setProfileToDelete(null)}
                className="flex-1 py-3 bg-brand-lavender text-brand-navy font-bold rounded-xl hover:bg-brand-purple hover:text-white transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeProfileDeletion}
                className="flex-1 py-3 bg-brand-red text-white font-extrabold rounded-xl hover:bg-opacity-95 transition-all text-sm"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
