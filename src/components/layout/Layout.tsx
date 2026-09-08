import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Brain, 
  Calendar, 
  Image, 
  Bell, 
  HelpCircle,
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
  Mic,
  UserPlus
} from 'lucide-react';
import { SVGBrain } from '../SVGIcons';
import { useLanguage } from '../../context/LanguageContext';
import { storageService } from '../../services/storageService';

interface LayoutProps {
  children: React.ReactNode;
  textSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, textSize, highContrast, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const currentUser = storageService.getCurrentUser();
  const userName = currentUser ? currentUser.name : 'Ravi Kumar';
  const localizedRole = currentUser?.role === 'Caregiver' ? (t('role.caregiver') || 'Caregiver') : (t('role.patient') || 'Patient');
  const localizedLang = currentUser?.language ? (t(`lang.${currentUser.language}`) || currentUser.language) : '';
  const userSub = currentUser ? `${localizedRole} • ${localizedLang}` : 'Guwahati, NER';
  const userInitial = userName.charAt(0).toUpperCase();

  const isCaregiver = currentUser?.role === 'Caregiver';

  const navItems = isCaregiver ? [
    { to: '/caregiver', label: t('nav.caregiver') || 'Dashboard', icon: Home },
    { to: '/caregiver?action=add-patient', label: t('addPatient') || 'Add Patient', icon: UserPlus, isAddPatient: true },
  ] : [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/games', label: t('nav.brainGames'), icon: Brain },
    { to: '/day', label: t('nav.myDay'), icon: Calendar },
    { to: '/reminders', label: t('nav.reminders'), icon: Bell },
    { to: '/memories', label: t('nav.memories'), icon: Image },
    { to: '/help', label: t('nav.help') || 'Help', icon: HelpCircle },
    { to: '/talk-to-me', label: t('nav.talkToMe') || 'Talk to Me', icon: Mic, isHighlighted: true },
  ];

  const getScaleClass = () => {
    if (textSize === 'large') return 'text-scale-large';
    if (textSize === 'xlarge') return 'text-scale-xlarge';
    return 'text-scale-normal';
  };  // Time-based environment styling in Asia/Kolkata (IST)
  const [timePeriod, setTimePeriod] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

  useEffect(() => {
    const updatePeriod = () => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        hour12: false
      });
      const istHour = parseInt(formatter.format(new Date()), 10);
      if (istHour >= 5 && istHour < 12) {
        setTimePeriod('morning');
      } else if (istHour >= 12 && istHour < 17) {
        setTimePeriod('afternoon');
      } else if (istHour >= 17 && istHour < 21) {
        setTimePeriod('evening');
      } else {
        setTimePeriod('night');
      }
    };
    updatePeriod();
    const interval = setInterval(updatePeriod, 60000);
    return () => clearInterval(interval);
  }, []);

  const getEnvBgClass = () => {
    switch (timePeriod) {
      case 'morning':
        return 'bg-gradient-to-br from-[#E0F2FE] via-[#F7FCFF] to-[#E8F5E9]'; // Bright ocean morning sun + soft green tint
      case 'afternoon':
        return 'bg-gradient-to-br from-[#BAE6FD] via-[#F0F9FF] to-[#E0F2FE]'; // Vibrant bright blue ocean sky
      case 'evening':
        return 'bg-gradient-to-br from-[#FEE2E2] via-[#E0F2FE] to-[#FDE8E8]'; // Soft pink/gold horizon sunset
      case 'night':
        return 'bg-gradient-to-br from-[#0F2942] via-[#12344D] to-[#075985] text-white'; // Deep moonlit night sky
    }
  };

  const SidebarContent = () => (
    <div className={`flex flex-col h-full overflow-y-auto scrollbar-thin p-6 transition-all duration-500 ${
      isCaregiver 
        ? 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-r border-indigo-800/40 text-white' 
        : 'bg-brand-purpleLight border-r border-brand-purple/20 text-brand-navy'
    }`}>
      {/* Brand Header & Mobile Close Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setMobileMenuOpen(false); navigate(isCaregiver ? '/caregiver' : '/'); }}>
          <SVGBrain className={`w-10 h-10 ${isCaregiver ? 'text-cyan-400' : 'text-brand-purple'}`} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-xl tracking-tight ${isCaregiver ? 'text-white' : 'text-brand-navy'}`}>{t('brand.title') || 'Second Brain'}</h2>
              {isCaregiver && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Care
                </span>
              )}
            </div>
            <p className={`text-xs ${isCaregiver ? 'text-slate-300 font-medium' : 'text-brand-grayText'}`}>{t('brand.subtitle') || 'Your memory companion'}</p>
          </div>
        </div>
        {/* Close Button */}
        <button 
          onClick={() => {
            setMobileMenuOpen(false);
            setSidebarExpanded(false);
          }} 
          className={`p-1.5 rounded-lg ${isCaregiver ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-brand-purple/20 text-brand-grayText'}`}
          aria-label="Close navigation menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2.5 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isTalkToMe = item.to === '/talk-to-me';
          const isAddPatient = (item as any).isAddPatient;

          if (isAddPatient) {
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/caregiver?action=add-patient');
                  window.dispatchEvent(new CustomEvent('open-add-patient-modal'));
                }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer text-left"
              >
                <Icon className="w-6 h-6 stroke-[2.5] text-sky-400" />
                <span className="text-base font-extrabold">{item.label}</span>
              </button>
            );
          }

          if (isTalkToMe) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  mt-4 flex items-center gap-3.5 p-3.5 rounded-2xl font-black text-sm transition-all duration-300 shadow-sm border-2 cursor-pointer
                  ${isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-300 shadow-amber-500/30 scale-[1.02]'
                    : 'bg-amber-100/90 hover:bg-amber-200/90 text-amber-950 border-amber-300/80 hover:border-amber-400 shadow-amber-500/10'}
                `}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs border border-amber-200 flex-shrink-0">
                  <Mic className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-extrabold leading-tight truncate">{item.label}</span>
                  <span className="text-[11px] font-bold text-amber-900/70 truncate">Tap here to talk</span>
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300
                ${isCaregiver
                  ? (isActive 
                      ? 'bg-gradient-to-r from-brand-purple to-indigo-600 text-white shadow-lg shadow-brand-purple/30 border border-purple-400/30' 
                      : 'text-slate-300 hover:bg-white/10 hover:text-white')
                  : (isActive 
                      ? 'bg-brand-purple text-white shadow-md' 
                      : 'text-brand-grayText hover:bg-brand-purple/10 hover:text-brand-navy')
                }
              `}
            >
              <Icon className="w-6 h-6 stroke-[2.5]" />
              <span className="text-base font-extrabold">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>


      {/* Profile / Settings / Logout link */}
      <div className={`mt-6 flex flex-col gap-2 border-t pt-4 ${isCaregiver ? 'border-indigo-800/40' : 'border-brand-purple/20'}`}>
        <div 
          onClick={() => {
            setMobileMenuOpen(false);
            navigate('/settings');
          }}
          className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all ${
            isCaregiver 
              ? 'hover:bg-white/10 text-white' 
              : 'hover:bg-brand-purple/15 text-brand-navy'
          }`}
          title={isCaregiver ? 'Caregiver Profile & Settings' : 'Settings'}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-xs flex-shrink-0 ${
            isCaregiver ? 'bg-gradient-to-br from-sky-500 to-indigo-600 border border-sky-300/40' : 'bg-brand-purple'
          }`}>
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-extrabold text-sm truncate ${isCaregiver ? 'text-white' : 'text-brand-navy'}`}>{userName}</h4>
            <p className={`text-xs truncate ${isCaregiver ? 'text-slate-300 font-medium' : 'text-brand-grayText'}`}>{userSub}</p>
          </div>
          <SettingsIcon className={`w-5 h-5 flex-shrink-0 transition-colors ${isCaregiver ? 'text-slate-400 hover:text-white' : 'text-brand-grayText hover:text-brand-purple'}`} />
        </div>

        {onLogout && (
          <button
            onClick={() => {
              if (window.confirm(t('logout.confirm') || 'Do you want to log out?')) {
                setMobileMenuOpen(false);
                onLogout();
              }
            }}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all w-full text-left cursor-pointer ${
              isCaregiver ? 'text-rose-400 hover:bg-rose-500/20' : 'text-brand-red hover:bg-brand-redBg/30'
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>{t('logout.label') || 'Log Out'}</span>
          </button>
        )}
      </div>
      </div>
  );

  return (
    <div className={`h-screen overflow-hidden flex flex-col lg:flex-row ${isCaregiver ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900' : 'bg-brand-lavender'} ${getScaleClass()} ${highContrast ? 'high-contrast-mode' : ''} transition-all duration-700`}>
      {/* Mobile/Tablet Top Header */}
      <header className={`lg:hidden flex items-center justify-between px-6 py-4 border-b sticky top-0 z-40 ${
        isCaregiver 
          ? 'bg-slate-900 border-slate-800 text-white' 
          : 'bg-white border-brand-purple/15 text-brand-navy'
      }`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(isCaregiver ? '/caregiver' : '/')}>
          <SVGBrain className={`w-8 h-8 ${isCaregiver ? 'text-cyan-400' : 'text-brand-purple'}`} />
          <h1 className="font-bold text-lg">{t('brand.title') || 'Second Brain'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/settings')} 
            className={`p-2 transition-colors ${isCaregiver ? 'text-slate-300 hover:text-white' : 'text-brand-grayText hover:text-brand-purple'}`}
            aria-label="Settings"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 focus:outline-none ${isCaregiver ? 'text-white' : 'text-brand-navy'}`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </header>

      {/* Desktop Menu Open Button */}
      {!sidebarExpanded && (
        <button
          onClick={() => setSidebarExpanded(true)}
          className={`hidden lg:flex fixed top-6 left-6 z-50 p-3 border rounded-2xl shadow-md transition-all active:scale-[0.98] ${
            isCaregiver 
              ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-cyan-400' 
              : 'bg-white border-brand-purple/20 hover:bg-brand-purpleLight text-brand-purple'
          }`}
          aria-label="Open navigation menu"
        >
          <Menu className="w-7 h-7" />
        </button>
      )}

      {/* Mobile/Tablet Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
          <div className="fixed inset-0 bg-brand-navy bg-opacity-40" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-80 max-w-[85vw] h-full">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {sidebarExpanded && (
        <aside className="hidden lg:block w-72 lg:w-80 h-full flex-shrink-0 z-40 relative">
          <SidebarContent />
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-w-0 h-full overflow-y-auto ${
        isCaregiver 
          ? 'bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900' 
          : getEnvBgClass()
      } relative transition-all duration-700`}>
        {/* Soft Ambient Environment Details (Patient Only) */}
        {!isCaregiver && (
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
            {/* Waves background */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-purple/20 to-transparent animate-pulse" />
            {/* Floating leaf element */}
            <div className="absolute top-10 right-10 text-brand-green opacity-45 transform rotate-12 transition-all duration-[8000ms] hover:rotate-45">🌿</div>
            <div className="absolute bottom-16 right-20 text-brand-purple opacity-30">🌸</div>
            {timePeriod === 'night' && (
              <>
                <div className="absolute top-12 left-12 text-yellow-100 opacity-60">🌙</div>
                <div className="absolute top-24 right-32 text-white w-1 h-1 bg-white rounded-full animate-ping" />
              </>
            )}
          </div>
        )}
        <div className={`flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 relative z-10 ${!sidebarExpanded ? 'lg:pl-20' : ''}`}>
          {children}
        </div>
      </main>
    </div>

  );
};
