
import React, { useState } from 'react';
import { AppConfig, UserRole } from '../types';

interface SettingsViewProps {
  appConfig: AppConfig;
  setAppConfig: (config: AppConfig) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ appConfig, setAppConfig }) => {
  const [activeSubTab, setActiveSubTab] = useState<'branding' | 'forms' | 'permissions'>('branding');

  const roles = Object.values(UserRole);
  const tabs = ['dashboard', 'lmra', 'nok', 'kickoff', 'library', 'profile', 'users', 'settings'];

  const togglePermission = (role: UserRole, tabId: string) => {
    const currentPerms = [...appConfig.permissions[role]];
    const newPerms = currentPerms.includes(tabId) 
      ? currentPerms.filter(id => id !== tabId)
      : [...currentPerms, tabId];
    
    setAppConfig({
      ...appConfig,
      permissions: {
        ...appConfig.permissions,
        [role]: newPerms
      }
    });
  };

  const updateArrayItem = (type: 'lmra' | 'ko', index: number, value: string) => {
    const key = type === 'lmra' ? 'lmraQuestions' : 'kickoffTopics';
    const newItems = [...appConfig[key]];
    newItems[index] = value;
    setAppConfig({ ...appConfig, [key]: newItems });
  };

  const removeArrayItem = (type: 'lmra' | 'ko', index: number) => {
    const key = type === 'lmra' ? 'lmraQuestions' : 'kickoffTopics';
    const newItems = appConfig[key].filter((_, i) => i !== index);
    setAppConfig({ ...appConfig, [key]: newItems });
  };

  const addArrayItem = (type: 'lmra' | 'ko') => {
    const key = type === 'lmra' ? 'lmraQuestions' : 'kickoffTopics';
    setAppConfig({ ...appConfig, [key]: [...appConfig[key], 'Nieuwe item'] });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">ADMIN PANEL</h1>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Systeem Configuraties & Permissies</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl">
          {(['branding', 'forms', 'permissions'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveSubTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100">
        {activeSubTab === 'branding' && (
          <div className="space-y-10 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">App Naam</label>
                <input 
                  type="text" value={appConfig.appName} onChange={e => setAppConfig({...appConfig, appName: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Logo URL</label>
                <input 
                  type="text" value={appConfig.logoUrl} onChange={e => setAppConfig({...appConfig, logoUrl: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold"
                />
              </div>
            </div>
            <div className="p-8 bg-slate-900 rounded-[2rem] text-center space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Preview Sidebar Header</p>
              <div className="flex flex-col items-center">
                <img src={appConfig.logoUrl} alt="Preview" className="w-12 h-12 mb-2 object-contain" />
                <h2 className="text-xl font-black text-orange-500 italic">{appConfig.appName}</h2>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'forms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 uppercase tracking-tight">LMRA Vragen</h3>
              <div className="space-y-3">
                {appConfig.lmraQuestions.map((q, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input 
                      value={q} onChange={e => updateArrayItem('lmra', i, e.target.value)}
                      className="flex-1 p-3 bg-slate-50 border rounded-xl text-sm font-bold"
                    />
                    <button onClick={() => removeArrayItem('lmra', i)} className="text-red-500 p-2">✕</button>
                  </div>
                ))}
                <button onClick={() => addArrayItem('lmra')} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs uppercase">+ Vraag Toevoegen</button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Kick-off Topics</h3>
              <div className="space-y-3">
                {appConfig.kickoffTopics.map((t, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input 
                      value={t} onChange={e => updateArrayItem('ko', i, e.target.value)}
                      className="flex-1 p-3 bg-slate-50 border rounded-xl text-sm font-bold"
                    />
                    <button onClick={() => removeArrayItem('ko', i)} className="text-red-500 p-2">✕</button>
                  </div>
                ))}
                <button onClick={() => addArrayItem('ko')} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs uppercase">+ Topic Toevoegen</button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'permissions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-4 text-[10px] font-black uppercase text-slate-400">Rol</th>
                  {tabs.map(tab => (
                    <th key={tab} className="py-4 px-2 text-[10px] font-black uppercase text-slate-400 text-center">{tab}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.map(role => (
                  <tr key={role}>
                    <td className="py-6 font-black text-slate-800 text-xs">{role}</td>
                    {tabs.map(tabId => (
                      <td key={tabId} className="py-6 text-center">
                        <input 
                          type="checkbox" 
                          checked={appConfig.permissions[role].includes(tabId)}
                          onChange={() => togglePermission(role, tabId)}
                          disabled={role === UserRole.ADMIN && tabId === 'settings'}
                          className="w-5 h-5 accent-orange-500 rounded-lg cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
