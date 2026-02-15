
import React, { useState, useRef } from 'react';
import { AppConfig, UserRole } from '../types';
import { useTranslation } from '../App';

interface SettingsViewProps {
  appConfig: AppConfig;
  setAppConfig: (config: AppConfig) => void;
  fullData: any;
  onImport: (json: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ appConfig, setAppConfig, fullData, onImport }) => {
  const [activeSubTab, setActiveSubTab] = useState<'branding' | 'forms' | 'permissions' | 'data'>('branding');
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const exportDatabase = () => {
    const db = {
      ...fullData,
      appConfig,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VCA_BEL_Database_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (confirm("Weet u zeker dat u de huidige database wilt overschrijven met dit bestand?")) {
          onImport(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">ADMIN PANEL</h1>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Systeem Configuraties & Permissies</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {(['branding', 'forms', 'permissions', 'data'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveSubTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              {tab === 'data' ? t('data_sync') : tab}
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

        {activeSubTab === 'data' && (
          <div className="max-w-3xl space-y-10">
            <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl">
              <div className="flex gap-4">
                <span className="text-2xl">⚠️</span>
                <p className="text-xs font-bold text-orange-700 leading-relaxed">
                  {t('local_storage_warning')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-slate-800 mb-2 uppercase tracking-tight italic">Exporteer Gegevens</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Backup maken of data delen</p>
                </div>
                <button 
                  onClick={exportDatabase}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px]"
                >
                  🚀 {t('export_db')}
                </button>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-slate-800 mb-2 uppercase tracking-tight italic">Importeer Gegevens</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Database laden vanuit bestand</p>
                </div>
                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-[10px]"
                >
                  📥 {t('import_db')}
                </button>
              </div>
            </div>

            <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem]">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Hoe synchroniseren met collega's?</h4>
               <ol className="text-xs text-slate-500 font-bold space-y-2 list-decimal ml-4">
                 <li>Klik op "Exporteer Database" op jouw toestel.</li>
                 <li>Stuur het gedownloade .json bestand naar je collega.</li>
                 <li>Je collega klikt op "Importeer Database" en selecteert het bestand.</li>
                 <li>Beide toestellen hebben nu exact dezelfde gebruikers en verslagen.</li>
               </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
