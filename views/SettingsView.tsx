
import React, { useState } from 'react';
import { AppConfig, UserRole } from '../types';
import { useTranslation } from '../App';
import { CloudData } from '../services/syncService';

interface SettingsViewProps {
  appConfig: AppConfig;
  setAppConfig: (config: AppConfig) => void;
  fullData: any;
  onImport: (data: CloudData) => void;
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
  lastSync: number;
  onManualSync: () => void;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  appConfig, setAppConfig, fullData, onImport, 
  workspaceId, setWorkspaceId, lastSync, onManualSync,
  sheetUrl, setSheetUrl
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'branding' | 'forms' | 'permissions' | 'database'>('database');
  const { t } = useTranslation();
  
  const [newLmraQ, setNewLmraQ] = useState('');
  const [newKickoffT, setNewKickoffT] = useState('');
  const [newDept, setNewDept] = useState('');

  const togglePermission = (role: UserRole, tabId: string) => {
    const currentPerms = [...(appConfig.permissions[role] || [])];
    const newPerms = currentPerms.includes(tabId) 
      ? currentPerms.filter(id => id !== tabId)
      : [...currentPerms, tabId];
    setAppConfig({ ...appConfig, permissions: { ...appConfig.permissions, [role]: newPerms } });
  };

  const addLmraQuestion = () => {
    if (newLmraQ.trim()) {
      setAppConfig({ ...appConfig, lmraQuestions: [...(appConfig.lmraQuestions || []), newLmraQ.trim()] });
      setNewLmraQ('');
    }
  };

  const removeLmraQuestion = (index: number) => {
    const updated = (appConfig.lmraQuestions || []).filter((_, i) => i !== index);
    setAppConfig({ ...appConfig, lmraQuestions: updated });
  };

  const addKickoffTopic = () => {
    if (newKickoffT.trim()) {
      setAppConfig({ ...appConfig, kickoffTopics: [...(appConfig.kickoffTopics || []), newKickoffT.trim()] });
      setNewKickoffT('');
    }
  };

  const removeKickoffTopic = (index: number) => {
    const updated = (appConfig.kickoffTopics || []).filter((_, i) => i !== index);
    setAppConfig({ ...appConfig, kickoffTopics: updated });
  };

  const addDepartment = () => {
    if (newDept.trim()) {
      setAppConfig({ ...appConfig, departments: [...(appConfig.departments || []), newDept.trim().toUpperCase()] });
      setNewDept('');
    }
  };

  const removeDepartment = (index: number) => {
    const updated = (appConfig.departments || []).filter((_, i) => i !== index);
    setAppConfig({ ...appConfig, departments: updated });
  };

  const permissionKeys = ['dashboard', 'lmra', 'nok', 'kickoff', 'reports', 'library', 'profile', 'users', 'settings', 'manage_records'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Admin Control</h1>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Configuratie & Database</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {(['branding', 'forms', 'permissions', 'database'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveSubTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeSubTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              {tab === 'database' ? 'Sheets Database' : tab === 'forms' ? 'Formulieren' : tab === 'branding' ? 'Branding' : 'Rechten'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 min-h-[400px]">
        {activeSubTab === 'branding' && (
          <div className="space-y-12 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <h3 className="text-xl font-black italic tracking-tighter text-slate-800 uppercase border-b pb-2">Huisstijl</h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">App Naam</label>
                      <input 
                        value={appConfig.appName} 
                        onChange={e => setAppConfig({...appConfig, appName: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-xs outline-none focus:border-orange-500 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Logo URL</label>
                      <input 
                        value={appConfig.logoUrl} 
                        onChange={e => setAppConfig({...appConfig, logoUrl: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-xs outline-none focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h3 className="text-xl font-black italic tracking-tighter text-slate-800 uppercase border-b pb-2">Afdelingen</h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {(appConfig.departments || []).map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                        <span className="text-xs font-bold text-slate-700">{d}</span>
                        <button onClick={() => removeDepartment(i)} className="text-slate-300 hover:text-red-500 transition-colors">✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      value={newDept} 
                      onChange={e => setNewDept(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addDepartment()}
                      placeholder="Nieuwe afdeling..." 
                      className="flex-1 p-4 bg-slate-50 border-2 rounded-2xl text-xs font-bold outline-none focus:border-orange-500" 
                    />
                    <button onClick={addDepartment} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase">+</button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeSubTab === 'database' && (
          <div className="space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <h3 className="text-xl font-black italic tracking-tighter text-slate-800 uppercase">Google Sheet Database</h3>
                  <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 space-y-4">
                    <p className="text-xs font-bold text-orange-700 leading-relaxed">Web App URL:</p>
                    <input 
                      value={sheetUrl} onChange={e => setSheetUrl(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-orange-200 rounded-2xl font-bold text-[10px] outline-none focus:border-orange-500"
                    />
                    <div className="flex items-center justify-between pt-2">
                       <span className="text-[9px] font-black text-orange-400 uppercase">Last Sync: {lastSync ? new Date(lastSync).toLocaleTimeString() : 'N/A'}</span>
                       <button onClick={onManualSync} className="bg-white text-orange-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-orange-200">Force Sync</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Workspace ID</label>
                    <input value={workspaceId} onChange={e => setWorkspaceId(e.target.value)} className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-xs outline-none focus:border-orange-500 transition-all" />
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeSubTab === 'forms' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in">
            <div className="space-y-6">
              <h3 className="text-lg font-black italic tracking-tighter text-slate-800 uppercase border-b pb-2">LMRA Vragen</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {(appConfig.lmraQuestions || []).map((q, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                    <span className="text-xs font-bold text-slate-700">{q}</span>
                    <button onClick={() => removeLmraQuestion(i)} className="text-slate-300 hover:text-red-500">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newLmraQ} onChange={e => setNewLmraQ(e.target.value)} onKeyPress={e => e.key === 'Enter' && addLmraQuestion()} placeholder="Nieuwe vraag..." className="flex-1 p-4 bg-slate-50 border-2 rounded-2xl text-xs font-bold outline-none focus:border-orange-500" />
                <button onClick={addLmraQuestion} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase">+</button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black italic tracking-tighter text-slate-800 uppercase border-b pb-2">Kick-off Topics</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {(appConfig.kickoffTopics || []).map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                    <span className="text-xs font-bold text-slate-700">{t}</span>
                    <button onClick={() => removeKickoffTopic(i)} className="text-slate-300 hover:text-red-500">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={newKickoffT} onChange={e => setNewKickoffT(e.target.value)} onKeyPress={e => e.key === 'Enter' && addKickoffTopic()} placeholder="Nieuw topic..." className="flex-1 p-4 bg-slate-50 border-2 rounded-2xl text-xs font-bold outline-none focus:border-orange-500" />
                <button onClick={addKickoffTopic} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase">+</button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'permissions' && (
          <div className="overflow-x-auto animate-in fade-in">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-4 text-[10px] font-black uppercase text-slate-400">Rol</th>
                  {permissionKeys.map(tab => <th key={tab} className="py-4 px-2 text-[10px] font-black uppercase text-slate-400 text-center">{tab}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.values(UserRole).map(role => (
                  <tr key={role}>
                    <td className="py-6 font-black text-slate-800 text-xs">{role}</td>
                    {permissionKeys.map(tabId => (
                      <td key={tabId} className="py-6 text-center">
                        <input 
                          type="checkbox" checked={(appConfig.permissions[role] || []).includes(tabId)}
                          onChange={() => togglePermission(role, tabId)}
                          disabled={role === UserRole.ADMIN && tabId === 'settings'}
                          className="w-5 h-5 accent-orange-500 cursor-pointer"
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
