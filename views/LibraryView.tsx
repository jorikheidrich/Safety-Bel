
import React, { useState } from 'react';
import { SAFETY_DOCS } from '../constants';
import { searchSafetyLibrary, getSafetyAdvice } from '../services/geminiService';
import { useTranslation } from '../App';

const LibraryView: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Planner States
  const [taskDesc, setTaskDesc] = useState('');
  const [aiPlan, setAiPlan] = useState('');
  const [planning, setPlanning] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    const result = await searchSafetyLibrary(searchQuery);
    setAiResult(result || '');
    setLoading(false);
  };

  const handleGeneratePlan = async () => {
    if (!taskDesc) return;
    setPlanning(true);
    const result = await getSafetyAdvice(`Maak een volledig veiligheidsplan voor de volgende werktaak: ${taskDesc}. Benoem benodigde PBM's, risico's en noodmaatregelen.`);
    setAiPlan(result || '');
    setPlanning(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">{t('library')}</h1>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Kennisbank & AI Assistentie</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search Section */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Snel Zoeken</h3>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-sm"
              placeholder="Zoek procedure of stel vraag..."
            />
            <button 
              type="submit"
              className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all"
            >
              {loading ? '...' : 'Zoek'}
            </button>
          </form>

          {aiResult && (
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in slide-in-from-top-4">
               <div className="flex items-center space-x-2 mb-4 text-orange-500 font-black text-[10px] uppercase">
                 <span>🤖 AI Advies</span>
               </div>
               <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{aiResult}</p>
            </div>
          )}
        </div>

        {/* AI Planner Section */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-500/20">✨</div>
             <h3 className="text-white font-black uppercase text-xs tracking-widest">{t('ai_planner_title')}</h3>
          </div>
          <p className="text-slate-400 text-xs font-bold leading-relaxed">{t('ai_planner_desc')}</p>
          
          <textarea 
            value={taskDesc}
            onChange={e => setTaskDesc(e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm focus:border-orange-500 outline-none h-24"
            placeholder="Bijv. 'Vervangen van een laagspanningsschakelaar in een vochtige kelder'..."
          />
          
          <button 
            onClick={handleGeneratePlan}
            disabled={planning || !taskDesc}
            className="w-full bg-orange-500 disabled:opacity-30 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
          >
            {planning ? 'Bezig met plannen...' : t('generate_plan')}
          </button>

          {aiPlan && (
            <div className="p-6 bg-white rounded-3xl animate-in zoom-in-95">
               <h4 className="text-[10px] font-black text-orange-500 uppercase mb-3">Gegenereerd Veiligheidsplan:</h4>
               <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-medium">{aiPlan}</p>
               <button onClick={() => window.print()} className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Afdrukken →</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SAFETY_DOCS.map(doc => (
          <div key={doc.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-orange-500 transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-slate-50 text-slate-400 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{doc.category}</span>
              <span className="text-2xl group-hover:scale-110 transition-transform">📄</span>
            </div>
            <h3 className="font-black text-lg mb-3 text-slate-800">{doc.title}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">{doc.content}</p>
            <button className="mt-6 text-orange-500 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">Lees meer →</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryView;
