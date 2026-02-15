
import React, { useState, useEffect } from 'react';
import { LMRA, LMRAStatus, User, UserRole } from '../types';
import { useTranslation } from '../App';

interface NOKManagementProps {
  lmras: LMRA[];
  updateLMRA: (lmra: LMRA) => void;
  currentUser: User;
  users: User[];
  onVisit?: () => void;
}

const NOKManagement: React.FC<NOKManagementProps> = ({ lmras, updateLMRA, currentUser, users, onVisit }) => {
  const { t } = useTranslation();
  const [selectedNOK, setSelectedNOK] = useState<LMRA | null>(null);
  const [treatment, setTreatment] = useState('');

  useEffect(() => {
    if (onVisit) onVisit();
  }, []);

  const noks = lmras.filter(l => l.status === LMRAStatus.NOK);
  
  const visibleNoks = noks.filter(nok => {
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PREVENTIE_ADVISEUR) return true;
    return nok.assignedToId === currentUser.id;
  });

  const approvers = users.filter(u => [UserRole.PROJECT_MANAGER, UserRole.PROJECT_ASSISTENT, UserRole.ADMIN, UserRole.PREVENTIE_ADVISEUR].includes(u.role));

  const handleResolve = () => {
    if (selectedNOK) {
      updateLMRA({
        ...selectedNOK,
        status: LMRAStatus.RESOLVED,
        treatmentNotes: treatment,
        resolvedById: currentUser.id,
        resolvedByName: currentUser.name
      });
      setSelectedNOK(null);
      setTreatment('');
    }
  };

  const handleAssign = (userId: string) => {
    if (selectedNOK) {
      const targetUser = users.find(u => u.id === userId);
      updateLMRA({
        ...selectedNOK,
        assignedToId: userId,
        assignedToName: targetUser?.name || 'Onbekend'
      });
      setSelectedNOK(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">{t('nok_management')}</h1>
          <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em]">{visibleNoks.length} OPENSTAANDE MELDINGEN</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {visibleNoks.map(nok => (
            <div key={nok.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-red-50 hover:border-red-200 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-xl text-slate-800">{nok.title}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{nok.userName} • {nok.date} • {nok.location}</p>
                  {nok.assignedToName && (
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">
                      📍 {t('assigned_to')}: {nok.assignedToName}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setSelectedNOK(nok);
                    setTreatment(nok.treatmentNotes || '');
                  }}
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl group-hover:scale-105 transition-transform"
                >
                  Behandelen
                </button>
              </div>
              <div className="space-y-4 bg-red-50/30 p-6 rounded-3xl border border-red-50">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Risicofactoren:</p>
                <ul className="space-y-2">
                  {nok.questions.filter(q => q.answer === 'NOK').map(q => (
                    <li key={q.id} className="flex items-start space-x-2 text-sm font-bold text-slate-700">
                      <span className="text-red-500">✕</span>
                      <span>{q.questionText} <br/><i className="text-xs text-slate-400 font-medium">"{q.reason}"</i></span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {visibleNoks.length === 0 && (
            <div className="bg-green-50 border-2 border-green-100 p-20 rounded-[3rem] text-center">
              <span className="text-6xl mb-6 block">🛡️</span>
              <p className="text-green-800 font-black text-xl mb-2">Geen openstaande incidenten!</p>
              <p className="text-green-600 text-sm font-bold uppercase tracking-widest">Er zijn momenteel geen onveilige situaties die actie vereisen.</p>
            </div>
          )}
        </div>

        {selectedNOK && (
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-t-8 border-orange-500 animate-in slide-in-from-right-8 h-fit sticky top-24">
            <h2 className="font-black text-2xl mb-2 uppercase tracking-tighter italic">{t('vrijgave_title')}</h2>
            <p className="text-xs text-slate-400 font-bold mb-8 uppercase tracking-widest">
              Project: <span className="text-slate-800">{selectedNOK.title}</span>
            </p>
            
            <div className="space-y-6">
              {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PREVENTIE_ADVISEUR) && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('assign_to')}</label>
                  <select 
                    onChange={(e) => handleAssign(e.target.value)}
                    value={selectedNOK.assignedToId || ''}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-sm"
                  >
                    <option value="">Selecteer Manager...</option>
                    {approvers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('treatment_notes')}</label>
                <textarea 
                  rows={5}
                  value={treatment}
                  onChange={e => setTreatment(e.target.value)}
                  className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-medium transition-all"
                  placeholder="Beschrijf hoe het risico is weggenomen..."
                ></textarea>
              </div>
              
              <button 
                onClick={handleResolve}
                disabled={!treatment}
                className="w-full bg-slate-900 disabled:opacity-30 text-white font-black py-5 rounded-[2rem] shadow-2xl transition-all uppercase tracking-widest text-xs"
              >
                Vrijgeven voor Start
              </button>
              
              <button 
                onClick={() => setSelectedNOK(null)}
                className="w-full text-slate-400 font-black uppercase text-[10px] tracking-widest pt-2"
              >
                Annuleren
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="font-black text-lg text-slate-800">Historiek Afgehandelde Incidenten</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">Datum</th>
                <th className="px-8 py-6">Project</th>
                <th className="px-8 py-6">Behandeld door</th>
                <th className="px-8 py-6">Maatregel</th>
                <th className="px-8 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lmras.filter(l => l.status === LMRAStatus.RESOLVED).map(l => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6 text-xs font-bold text-slate-400">{l.date}</td>
                  <td className="px-8 py-6 text-sm font-black text-slate-800">{l.title}</td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-700">{l.resolvedByName || 'Onbekend'}</td>
                  <td className="px-8 py-6 text-xs text-slate-600 font-medium italic">"{l.treatmentNotes}"</td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">RESOLVED</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NOKManagement;
