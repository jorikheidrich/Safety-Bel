
import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { User, UserRole, LMRA, LMRAStatus, KickOffMeeting, Language, AppConfig, Notification } from './types';
import { MOCK_USERS, DEFAULT_CONFIG } from './constants';
import { translations, TranslationKeys } from './i18n';
import { syncService, CloudData } from './services/syncService';
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
  const [workspaceId, setWorkspaceId] = useState<string>(localStorage.getItem('vca_workspace_id') || '');
  const [lastSync, setLastSync] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
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

  // Helper om lokale data samen te voegen met cloud data
  const mergeData = useCallback((cloud: CloudData) => {
    // Gebruik unieke ID's om duplicaten te voorkomen
    const mergeArrays = (local: any[], remote: any[]) => {
      const map = new Map();
      local.forEach(item => map.set(item.id, item));
      remote.forEach(item => map.set(item.id, item));
      return Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    };

    setUsers(cloud.users);
    setLmras(prev => mergeArrays(prev, cloud.lmras));
    setKickoffs(prev => mergeArrays(prev, cloud.kickoffs));
    setNotifications(prev => mergeArrays(prev, cloud.notifications));
    setAppConfig(cloud.appConfig);
    setLastSync(Date.now());
  }, []);

  // Sync naar de cloud
  const pushToCloud = useCallback(async () => {
    if (!workspaceId) return;
    setIsSyncing(true);
    try {
      const data: CloudData = {
        users, lmras, kickoffs, notifications, appConfig,
        lastUpdated: Date.now()
      };
      await syncService.updateWorkspace(workspaceId, data);
      setLastSync(Date.now());
    } catch (e) {
      console.error("Push failed", e);
    } finally {
      setIsSyncing(false);
    }
  }, [workspaceId, users, lmras, kickoffs, notifications, appConfig]);

  // Sync van de cloud
  const pullFromCloud = useCallback(async () => {
    if (!workspaceId) return;
    setIsSyncing(true);
    try {
      const cloud = await syncService.getWorkspace(workspaceId);
      if (cloud && cloud.lastUpdated > lastSync) {
        mergeData(cloud);
      }
    } catch (e) {
      console.error("Pull failed", e);
    } finally {
      setIsSyncing(false);
    }
  }, [workspaceId, lastSync, mergeData]);

  // Automatische synchronisatie (Polling)
  useEffect(() => {
    if (!workspaceId) return;
    pullFromCloud(); // Directe sync bij start
    const interval = setInterval(pullFromCloud, 15000); // Elke 15 seconden
    return () => clearInterval(interval);
  }, [workspaceId]); // Alleen herstarten als workspaceId verandert

  // Effecten voor lokale opslag & automatische push bij wijziging
  useEffect(() => {
    localStorage.setItem('vca_lmras', JSON.stringify(lmras));
    pushToCloud();
  }, [lmras, pushToCloud]);

  useEffect(() => {
    localStorage.setItem('vca_notifications', JSON.stringify(notifications));
    pushToCloud();
  }, [notifications, pushToCloud]);

  useEffect(() => {
    localStorage.setItem('vca_kickoffs', JSON.stringify(kickoffs));
    pushToCloud();
  }, [kickoffs, pushToCloud]);

  useEffect(() => {
    localStorage.setItem('vca_users_list', JSON.stringify(users));
    pushToCloud();
  }, [users, pushToCloud]);

  useEffect(() => {
    localStorage.setItem('vca_app_config', JSON.stringify(appConfig));
    pushToCloud();
  }, [appConfig, pushToCloud]);

  useEffect(() => {
    localStorage.setItem('vca_workspace_id', workspaceId);
  }, [workspaceId]);

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
    if (updatedLMRA.status === LMRAStatus.RESOLVED) {
      setNotifications(prev => prev.map(n => n.relatedId === updatedLMRA.id ? { ...n, isRead: true } : n));
    }
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const updateKickoff = (updatedKO: KickOffMeeting) => setKickoffs(prev => prev.map(k => k.id === updatedKO.id ? updatedKO : k));
  const addKickOff = (ko: KickOffMeeting) => setKickoffs(prev => [ko, ...prev]);

  const importFullDatabase = (json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.users) setUsers(data.users);
      if (data.lmras) setLmras(data.lmras);
      if (data.kickoffs) setKickoffs(data.kickoffs);
      if (data.appConfig) setAppConfig(data.appConfig);
      if (data.notifications) setNotifications(data.notifications);
      alert("Database succesvol geïmporteerd!");
    } catch (e) {
      alert("Fout bij importeren: Ongeldig bestand.");
    }
  };

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
          workspaceId={workspaceId}
          isSyncing={isSyncing}
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
          {activeTab === 'settings' && (
            <SettingsView 
              appConfig={appConfig} 
              setAppConfig={setAppConfig} 
              fullData={{users, lmras, kickoffs, notifications}} 
              onImport={importFullDatabase} 
              workspaceId={workspaceId}
              setWorkspaceId={setWorkspaceId}
              lastSync={lastSync}
              onManualSync={pullFromCloud}
            />
          )}
        </main>
      </div>
    </LanguageContext.Provider>
  );
};

export default App;
