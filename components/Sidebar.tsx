
import React, { useState } from 'react';
import { User, UserRole, Language, AppConfig } from '../types';
import { useTranslation } from '../App';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  appConfig: AppConfig;
  unreadNotifications?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeTab, setActiveTab, onLogout, appConfig, unreadNotifications = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang, t } = useTranslation();

  const allowedTabs = appConfig.permissions[currentUser.role] || [];

  const allItems = [
    { id: 'dashboard', label: t('dashboard'), icon: '📊' },
    { id: 'lmra', label: t('lmras'), icon: '📝' },
    { id: 'reports', label: t('reports'), icon: '📈' },
    { id: 'nok', label: t('nok_management'), icon: '⚠️' },
    { id: 'kickoff', label: t('kickoff'), icon: '🤝' },
    { id: 'library', label: t('library'), icon: '📚' },
    { id: 'profile', label: t('settings'), icon: '⚙️' },
    { id: 'users', label: t('users'), icon: '👥' },
    { id: 'settings', label: 'Admin Panel', icon: '🛠️' },
  ];

  const menuItems = allItems.filter(item => allowedTabs.includes(item.id));

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-4 z-50 border-b border-white/5">
        <h1 className="text-xl font-black text-orange-500 italic">{appConfig.appName}</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white text-2xl p-2">{isOpen ? '✕' : '☰'}</button>
      </div>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 pt-20 lg:pt-8 flex flex-col items-center">
          <img src={appConfig.logoUrl} alt="Logo" className="w-12 h-12 mb-4 object-contain" />
          <h1 className="text-2xl font-black text-orange-500 tracking-tighter italic">{appConfig.appName}</h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-[0.2em] font-black">{t('veiligheid_eerst')}</p>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              {item.id === 'nok' && unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-6 mb-4">
          <div className="flex space-x-1 bg-slate-800 p-1 rounded-xl">
            {(['nl', 'fr', 'en', 'tr'] as Language[]).map(l => (
              <button key={l} onClick={() => setLang(l)} className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase ${lang === l ? 'bg-orange-500 text-white' : 'text-slate-500'}`}>{l}</button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-widest">
            <span>🚪</span><span>{t('logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
