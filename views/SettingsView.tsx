
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

  const togglePermission = (role: UserRole, tabId: string) => {
    const currentPerms = [...appConfig.permissions[role]];
    const newPerms = currentPerms.includes(tabId) 
      ? currentPerms.filter(id => id !== tabId)
      : [...currentPerms, tabId];
    setAppConfig({ ...appConfig, permissions: { ...appConfig.permissions, [role]: newPerms } });
  };

  const appsScriptCode = `function doGet(e) {
  var id = e.parameter.id || "default";
  var sheet = getDbSheet();
  var data = findData(sheet, id);
  return ContentService.createTextOutput(data || "{}")
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var id = e.parameter.id || "default";
  var data = e.postData.contents;
  var sheet = getDbSheet();
  saveData(sheet, id, data);
  return ContentService.createTextOutput(JSON.stringify({status: "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getDbSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Database");
  if (!sheet) {
    sheet = ss.insertSheet("Database");
    sheet.appendRow(["ID", "JSON_DATA"]);
  }
  return sheet;
}

function findData(sheet, id) {
  var vals = sheet.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (vals[i][0] == id) return vals[i][1];
  }
  return null;
}

function saveData(sheet, id, data) {
  var vals = sheet.getDataRange().getValues();
  for (var i = 1; i < vals.length; i++) {
    if (vals[i][0] == id) {
      sheet.getRange(i + 1, 2).setValue(data);
      return;
    }
  }
  sheet.appendRow([id, data]);
}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
              {tab === 'database' ? 'Sheets Database' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
        {activeSubTab === 'database' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <h3 className="text-xl font-black italic tracking-tighter text-slate-800 uppercase">Google Sheet Database</h3>
                  <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 space-y-4">
                    <p className="text-xs font-bold text-orange-700 leading-relaxed">
                      Jouw persoonlijke Web App URL:
                    </p>
                    <input 
                      value={sheetUrl} 
                      onChange={e => setSheetUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full p-4 bg-white border-2 border-orange-200 rounded-2xl font-bold text-[10px] outline-none focus:border-orange-500"
                    />
                    <div className="flex items-center justify-between pt-2">
                       <span className="text-[9px] font-black text-orange-400 uppercase">Laatste sync: {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Niet verbonden'}</span>
                       <button onClick={onManualSync} className="bg-white text-orange-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-orange-200 shadow-sm">Forceer Sync</button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Workspace Naam (Team ID)</label>
                    <input 
                      value={workspaceId} 
                      onChange={e => setWorkspaceId(e.target.value)}
                      className="w-full p-4 bg-slate-50 border-2 rounded-2xl font-bold text-xs"
                    />
                  </div>
               </div>

               <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-4">
                  <h4 className="text-orange-500 font-black uppercase text-[10px] tracking-widest">Stappenplan</h4>
                  <ol className="text-[11px] space-y-3 font-bold text-slate-300">
                    <li className="flex gap-3"><span className="text-orange-500">1.</span> Open een Google Sheet.</li>
                    <li className="flex gap-3"><span className="text-orange-500">2.</span> Klik op "Extensies" &rarr; "Apps Script".</li>
                    <li className="flex gap-3"><span className="text-orange-500">3.</span> Wis alles en plak de code hieronder.</li>
                    <li className="flex gap-3"><span className="text-orange-500">4.</span> Klik op "Implementeren" &rarr; "Nieuwe implementatie".</li>
                    <li className="flex gap-3"><span className="text-orange-500">5.</span> Type: Web-app, Toegang: "Iedereen".</li>
                    <li className="flex gap-3"><span className="text-orange-500">6.</span> Kopieer de link naar het vak hiernaast.</li>
                  </ol>
                  <div className="mt-6 pt-6 border-t border-white/10">
                     <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Kopieer deze code:</label>
                     <div className="relative">
                        <pre className="bg-black/40 p-4 rounded-xl text-[9px] font-mono text-orange-200 overflow-x-auto select-all max-h-48 scrollbar-thin scrollbar-thumb-orange-500">
                          {appsScriptCode}
                        </pre>
                        <div className="absolute top-2 right-2 bg-slate-800 text-white text-[8px] px-2 py-1 rounded border border-white/10">SCRIPT CODE</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeSubTab === 'branding' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">App Naam</label>
              <input value={appConfig.appName} onChange={e => setAppConfig({...appConfig, appName: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Logo URL</label>
              <input value={appConfig.logoUrl} onChange={e => setAppConfig({...appConfig, logoUrl: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
            </div>
          </div>
        )}

        {activeSubTab === 'permissions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-4 text-[10px] font-black uppercase text-slate-400">Rol</th>
                  {['dashboard', 'lmra', 'nok', 'kickoff', 'reports', 'library', 'profile', 'users', 'settings'].map(tab => <th key={tab} className="py-4 px-2 text-[10px] font-black uppercase text-slate-400 text-center">{tab}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.values(UserRole).map(role => (
                  <tr key={role}>
                    <td className="py-6 font-black text-slate-800 text-xs">{role}</td>
                    {['dashboard', 'lmra', 'nok', 'kickoff', 'reports', 'library', 'profile', 'users', 'settings'].map(tabId => (
                      <td key={tabId} className="py-6 text-center">
                        <input 
                          type="checkbox" checked={appConfig.permissions[role].includes(tabId)}
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
