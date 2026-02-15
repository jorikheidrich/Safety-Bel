
import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, UserRole, LMRA, LMRAStatus, KickOffMeeting, Language, AppConfig, Notification } from './types';
import { MOCK_USERS, DEFAULT_CONFIG } from './constants';
import { translations, TranslationKeys } from './i18n';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import LMRAView from './views/LMRAView';
import NOKManagement from './views/NOKManagement';
import KickOffView from './views/KickOffView';
import LibraryView from './views/LibraryView';
import UserManagement from './views/UserManagement';
import ProfileView from './views/ProfileView';
import SettingsView from './views/SettingsView';
import ReportsView from './views/ReportsView';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used within LanguageProvider");
  return context;
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>((localStorage.getItem('vca_lang') as Language) || 'nl');
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('vca_app_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vca_users_list');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [lmras, setLmras] = useState<LMRA[]>(() => {
    const saved = localStorage.getItem('vca_lmras');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('vca_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [kickoffs, setKickoffs] = useState<KickOffMeeting[]>(() => {
    const saved = localStorage.getItem('vca_kickoffs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('vca_lmras', JSON.stringify(lmras));
  }, [lmras]);

  useEffect(() => {
    localStorage.setItem('vca_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('vca_kickoffs', JSON.stringify(kickoffs));
  }, [kickoffs]);

  useEffect(() => {
    localStorage.setItem('vca_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('vca_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('vca_app_config', JSON.stringify(appConfig));
  }, [appConfig]);

  const t = (key: TranslationKeys) => {
    return translations[lang][key] || key;
  };

  useEffect(() => {
    const saved = localStorage.getItem('vca_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      const found = users.find(u => u.username === parsed.username);
      if (found) setCurrentUser(found);
    }
  }, [users]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('vca_user', JSON.stringify({ username: found.username }));
      setLoginError('');
    } else {
      setLoginError(t('login_error'));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vca_user');
    setUsername('');
    setPassword('');
    setActiveTab('dashboard');
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');

  const addLMRA = (newLMRA: LMRA) => {
    setLmras(prev => [newLMRA, ...prev]);
    if (newLMRA.status === LMRAStatus.NOK) {
      const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'NOK',
        title: 'Nieuwe NOK Melding',
        message: `Project ${newLMRA.title} is gemarkeerd als onveilig door ${newLMRA.userName}.`,
        timestamp: Date.now(),
        isRead: false,
        relatedId: newLMRA.id
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const updateLMRA = (updatedLMRA: LMRA) => {
    setLmras(prev => prev.map(l => l.id === updatedLMRA.id ? updatedLMRA : l));
    // Als een NOK is opgelost, markeer gerelateerde notificaties als gelezen
    if (updatedLMRA.status === LMRAStatus.RESOLVED) {
      setNotifications(prev => prev.map(n => n.relatedId === updatedLMRA.id ? { ...n, isRead: true } : n));
    }
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const updateKickoff = (updatedKO: KickOffMeeting) => setKickoffs(prev => prev.map(k => k.id === updatedKO.id ? updatedKO : k));
  const addKickOff = (ko: KickOffMeeting) => setKickoffs(prev => [ko, ...prev]);

  const contextValue = { lang, setLang, t };

  if (!currentUser) {
    return (
      <LanguageContext.Provider value={contextValue}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
          <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-12 relative z-10 mx-auto">
            <div className="text-center mb-10">
              <img src={appConfig.logoUrl} alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">{appConfig.appName}</h1>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-semibold" placeholder={t('username')} />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border rounded-2xl font-semibold" placeholder={t('password')} />
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-wider">{t('login_btn')}</button>
              {loginError && <p className="text-red-500 text-xs font-bold text-center mt-2">{loginError}</p>}
            </form>
          </div>
        </div>
      </LanguageContext.Provider>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <LanguageContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-50 lg:pl-64 flex flex-col relative">
        <Sidebar 
          currentUser={currentUser} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout}
          appConfig={appConfig}
          unreadNotifications={unreadCount}
        />
        
        <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 w-full max-w-7xl mx-auto overflow-x-hidden">
          {activeTab === 'dashboard' && <Dashboard lmras={lmras} kickoffs={kickoffs} currentUser={currentUser} onUpdateLMRA={updateLMRA} onUpdateKickoff={updateKickoff} unreadNotifications={notifications.filter(n => !n.isRead)} setActiveTab={setActiveTab} />}
          {activeTab === 'lmra' && <LMRAView lmras={lmras} setLmras={setLmras} addLMRA={addLMRA} onUpdateLMRA={updateLMRA} currentUser={currentUser} users={users} questions={appConfig.lmraQuestions} />}
          {activeTab === 'nok' && <NOKManagement lmras={lmras} updateLMRA={updateLMRA} currentUser={currentUser} users={users} onVisit={() => clearNotifications()} />}
          {activeTab === 'kickoff' && <KickOffView kickoffs={kickoffs} setKickoffs={setKickoffs} addKickOff={addKickOff} onUpdateKickOff={updateKickoff} currentUser={currentUser} users={users} topics={appConfig.kickoffTopics} />}
          {activeTab === 'reports' && <ReportsView lmras={lmras} kickoffs={kickoffs} users={users} />}
          {activeTab === 'library' && <LibraryView />}
          {activeTab === 'profile' && <ProfileView currentUser={currentUser} users={users} onUpdateUser={updateUser} />}
          {activeTab === 'users' && <UserManagement users={users} setUsers={setUsers} />}
          {activeTab === 'settings' && <SettingsView appConfig={appConfig} setAppConfig={setAppConfig} />}
        </main>
      </div>
    </LanguageContext.Provider>
  );
};

export default App;
