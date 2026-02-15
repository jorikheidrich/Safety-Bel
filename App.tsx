
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
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

// De door de gebruiker opgegeven URL als standaard
const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbym2zLU0CVImtKMYtKXUqlKRBwbvH8gOC5CvoumFWYR5X8poMBnIGtP7ggWA8gJ8pAx/exec';

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
  
  // Gebruik de default URL als er geen in localStorage staat
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    const saved = localStorage.getItem('vca_sheet_url');
    return saved || DEFAULT_SHEET_URL;
  });
  const [workspaceId, setWorkspaceId] = useState<string>(localStorage.getItem('vca_workspace_id') || 'vca-team-default');
  
  const [lastSync, setLastSync] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connError, setConnError] = useState('');

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

  const mergeData = useCallback((cloud: CloudData) => {
    if (!cloud) return;
    
    const mergeArrays = (local: any[], remote: any[]) => {
      if (!remote) return local;
      const map = new Map();
      local.forEach(item => map.set(item.id, item));
      remote.forEach(item => map.set(item.id, item));
      return Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    };

    if (cloud.users && cloud.users.length > 0) setUsers(cloud.users);
    if (cloud.lmras) setLmras(prev => mergeArrays(prev, cloud.lmras));
    if (cloud.kickoffs) setKickoffs(prev => mergeArrays(prev, cloud.kickoffs));
    if (cloud.notifications) setNotifications(prev => mergeArrays(prev, cloud.notifications));
    if (cloud.appConfig) setAppConfig(cloud.appConfig);
    setLastSync(Date.now());
  }, []);

  const pushToDatabase = useCallback(async () => {
    if (!sheetUrl) return;
    setIsSyncing(true);
    try {
      const data: CloudData = {
        users, lmras, kickoffs, notifications, appConfig,
        lastUpdated: Date.now()
      };
      await syncService.pushData(sheetUrl, data, workspaceId);
      setLastSync(Date.now());
    } catch (e) {
      console.warn("Database push mislukt.");
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl, workspaceId, users, lmras, kickoffs, notifications, appConfig]);

  const pullFromDatabase = useCallback(async () => {
    if (!sheetUrl) return;
    setIsSyncing(true);
    try {
      const cloud = await syncService.pullData(sheetUrl, workspaceId);
      if (cloud && cloud.lastUpdated > lastSync) {
        mergeData(cloud);
      }
    } catch (e) {
      console.warn("Database pull mislukt.");
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl, workspaceId, lastSync, mergeData]);

  const handleConnect = async (url: string, id: string) => {
    if (!url) { setConnError("Voer a.u.b. een Google Web App URL in."); return; }
    setConnError('');
    setIsSyncing(true);
    try {
      const cloud = await syncService.pullData(url, id);
      setSheetUrl(url);
      setWorkspaceId(id);
      localStorage.setItem('vca_sheet_url', url);
      localStorage.setItem('vca_workspace_id', id);
      if (cloud) mergeData(cloud);
    } catch (e) {
      setConnError("Kon geen verbinding maken. Controleer je URL en instellingen.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!sheetUrl) return;
    const interval = setInterval(pullFromDatabase, 30000);
    return () => clearInterval(interval);
  }, [sheetUrl, pullFromDatabase]);

  useEffect(() => {
    localStorage.setItem('vca_lmras', JSON.stringify(lmras));
    localStorage.setItem('vca_users_list', JSON.stringify(users));
    localStorage.setItem('vca_kickoffs', JSON.stringify(kickoffs));
    localStorage.setItem('vca_notifications', JSON.stringify(notifications));
    localStorage.setItem('vca_app_config', JSON.stringify(appConfig));
    
    if (sheetUrl) {
      const timeout = setTimeout(pushToDatabase, 3000);
      return () => clearTimeout(timeout);
    }
  }, [lmras, users, kickoffs, notifications, appConfig, pushToDatabase, sheetUrl]);

  const t = (key: TranslationKeys) => translations[lang][key] || key;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('vca_user', JSON.stringify({ username: found.username }));
    } else {
      setLoginError(t('login_error'));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vca_user');
    setActiveTab('dashboard');
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [inputUrl, setInputUrl] = useState(sheetUrl);
  const [inputId, setInputId] = useState(workspaceId);

  const addLMRA = (lmra: LMRA) => setLmras(prev => [lmra, ...prev]);
  const updateLMRA = (u: LMRA) => setLmras(prev => prev.map(l => l.id === u.id ? u : l));
  const addKickOff = (ko: KickOffMeeting) => setKickoffs(prev => [ko, ...prev]);
  const updateKickoff = (u: KickOffMeeting) => setKickoffs(prev => prev.map(k => k.id === u.id ? u : k));

  if (!currentUser) {
    return (
      <LanguageContext.Provider value={{ lang, setLang, t }}>
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 mx-auto">
            <div className="text-center mb-8">
              <img src={appConfig.logoUrl} alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain" />
              <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter">{appConfig.appName}</h1>
            </div>

            {!sheetUrl ? (
              <div className="space-y-6">
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                  <p className="text-[10px] font-black text-orange-700 uppercase mb-2 tracking-widest">Database Koppelen</p>
                  <p className="text-xs font-bold text-orange-600 leading-tight">Plak je Google Sheets Web App URL hieronder om te starten.</p>
                </div>
                <div className="space-y-3">
                  <input 
                    type="text" value={inputUrl} onChange={e => setInputUrl(e.target.value)} 
                    className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none focus:border-orange-500 text-xs" 
                    placeholder="Google Web App URL..." 
                  />
                  <input 
                    type="text" value={inputId} onChange={e => setInputId(e.target.value)} 
                    className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none focus:border-orange-500 text-xs" 
                    placeholder="Workspace Naam (optioneel)" 
                  />
                  <button 
                    onClick={() => handleConnect(inputUrl, inputId)} disabled={isSyncing}
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl uppercase text-xs disabled:opacity-50"
                  >
                    {isSyncing ? 'Verbinding maken...' : 'Verbind Database'}
                  </button>
                </div>
                {connError && <p className="text-red-500 text-[10px] font-black text-center">{connError}</p>}
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-bottom-4">
                <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex justify-between items-center">
                   <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">✓ CLOUD DB ACTIEF</span>
                   <button type="button" onClick={() => setSheetUrl('')} className="text-[9px] font-black text-slate-400 uppercase">Wijzig</button>
                </div>
                <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none focus:border-orange-500" placeholder={t('username')} />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl font-bold outline-none focus:border-orange-500" placeholder={t('password')} />
                <button type="submit" className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl shadow-xl uppercase text-xs">
                  {t('login_btn')}
                </button>
                {loginError && <p className="text-red-500 text-[10px] font-black text-center">{loginError}</p>}
                <div className="text-center pt-4">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">jorik / jorik</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="min-h-screen bg-slate-50 lg:pl-64 flex flex-col">
        <Sidebar 
          currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} 
          onLogout={handleLogout} appConfig={appConfig} unreadNotifications={notifications.filter(n => !n.isRead).length}
          workspaceId={workspaceId} isSyncing={isSyncing} isOffline={!sheetUrl}
        />
        <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 w-full max-w-7xl mx-auto overflow-x-hidden">
          {activeTab === 'dashboard' && <Dashboard lmras={lmras} kickoffs={kickoffs} currentUser={currentUser} onUpdateLMRA={updateLMRA} onUpdateKickoff={updateKickoff} unreadNotifications={notifications.filter(n => !n.isRead)} setActiveTab={setActiveTab} lastSync={lastSync} isSyncing={isSyncing} />}
          {activeTab === 'lmra' && <LMRAView lmras={lmras} setLmras={setLmras} addLMRA={addLMRA} onUpdateLMRA={updateLMRA} currentUser={currentUser} users={users} questions={appConfig.lmraQuestions} />}
          {activeTab === 'nok' && <NOKManagement lmras={lmras} updateLMRA={updateLMRA} currentUser={currentUser} users={users} onVisit={() => setNotifications(prev => prev.map(n => ({...n, isRead: true})))} />}
          {activeTab === 'kickoff' && <KickOffView kickoffs={kickoffs} setKickoffs={setKickoffs} addKickOff={addKickOff} onUpdateKickOff={updateKickoff} currentUser={currentUser} users={users} topics={appConfig.kickoffTopics} />}
          {activeTab === 'reports' && <ReportsView lmras={lmras} kickoffs={kickoffs} users={users} />}
          {activeTab === 'library' && <LibraryView />}
          {activeTab === 'profile' && <ProfileView currentUser={currentUser} users={users} onUpdateUser={u => setUsers(prev => prev.map(old => old.id === u.id ? u : old))} />}
          {activeTab === 'users' && <UserManagement users={users} setUsers={setUsers} />}
          {activeTab === 'settings' && (
            <SettingsView 
              appConfig={appConfig} setAppConfig={setAppConfig} 
              fullData={{users, lmras, kickoffs, notifications}} 
              onImport={mergeData} workspaceId={workspaceId} setWorkspaceId={setWorkspaceId}
              lastSync={lastSync} onManualSync={pullFromDatabase}
              sheetUrl={sheetUrl} setSheetUrl={setSheetUrl}
            />
          )}
        </main>
      </div>
    </LanguageContext.Provider>
  );
};

export default App;
