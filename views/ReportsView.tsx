
import React, { useState, useMemo } from 'react';
import { LMRA, KickOffMeeting, User, Department, LMRAStatus } from '../types';
import { useTranslation } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface ReportsViewProps {
  lmras: LMRA[];
  kickoffs: KickOffMeeting[];
  users: User[];
}

const DetailModal: React.FC<{ 
  lmra: LMRA, 
  onClose: () => void,
  users: User[]
}> = ({ lmra, onClose, users }) => {
  const { t } = useTranslation();
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl animate-in zoom-in-95 print-section relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 md:top-8 md:right-8 bg-slate-100 text-slate-500 hover:text-slate-900 p-4 rounded-full z-[120] no-print"
        >
          ✕
        </button>

        <div className="flex justify-between items-start mb-8 border-b border-slate-50 pb-6 pr-12">
          <div><h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">{lmra.title}</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lmra.date}</p></div>
          <button onClick={handlePrint} className="bg-orange-500 text-white px-5 py-3 rounded-2xl shadow-lg font-black text-[10px] uppercase no-print hidden md:block">📄 Print / PDF</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-widest border-b pb-2">Checklist Resultaten</h3>
              {lmra.questions.map((q, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-2 ${q.answer === 'NOK' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-50'}`}>
                   <div className="flex justify-between items-center text-xs font-bold">
                     <span>{q.questionText}</span>
                     <span className={`px-3 py-1 rounded-lg text-[10px] uppercase ${q.answer === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{q.answer}</span>
                   </div>
                </div>
              ))}
           </div>
           <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-widest border-b pb-2">Geregistreerd Personeel</h3>
              <div className="grid grid-cols-2 gap-4">
                {lmra.attendees.map((a, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center">
                    <span className="text-[10px] font-black">{a.name}</span>
                    {a.isSigned && <img src={a.signature} className="h-8 mt-2 opacity-50" />}
                  </div>
                ))}
              </div>
           </div>
        </div>
        
        <button onClick={handlePrint} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl no-print md:hidden mt-8">
          Genereer Rapport / PDF
        </button>
      </div>
    </div>
  );
};

const ReportsView: React.FC<ReportsViewProps> = ({ lmras, kickoffs, users }) => {
  const { t } = useTranslation();
  
  // Filters State
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>('all');
  const [day, setDay] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dept, setDept] = useState<string>('all');
  const [tech, setTech] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [viewingLMRA, setViewingLMRA] = useState<LMRA | null>(null);

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
  const years = [2023, 2024, 2025];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  const filteredData = useMemo(() => {
    return lmras.filter(l => {
      const parts = l.date.split('/'); // DD/MM/YYYY
      const lDay = parts[0];
      const lMonth = parts[1];
      const lYear = parts[2];

      const matchYear = year === 'all' || lYear === year;
      const matchMonth = month === 'all' || lMonth === month.padStart(2, '0');
      const matchDay = day === 'all' || lDay === day.padStart(2, '0');
      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchDept = dept === 'all' || l.department === dept;
      const matchTech = tech === 'all' || l.userId === tech;
      const matchLoc = !locationFilter || 
                       l.location.toLowerCase().includes(locationFilter.toLowerCase()) || 
                       l.title.toLowerCase().includes(locationFilter.toLowerCase());

      return matchYear && matchMonth && matchDay && matchStatus && matchDept && matchTech && matchLoc;
    });
  }, [lmras, year, month, day, statusFilter, dept, tech, locationFilter]);

  const stats = useMemo(() => {
    const ok = filteredData.filter(d => d.status === LMRAStatus.OK).length;
    const nok = filteredData.filter(d => d.status === LMRAStatus.NOK).length;
    const pending = filteredData.filter(d => d.status === LMRAStatus.PENDING_SIGNATURE).length;
    const resolved = filteredData.filter(d => d.status === LMRAStatus.RESOLVED).length;
    return [
      { name: 'OK', value: ok, color: '#10b981' },
      { name: 'NOK', value: nok, color: '#ef4444' },
      { name: 'WACHT', value: pending, color: '#f59e0b' },
      { name: 'RESOLVED', value: resolved, color: '#3b82f6' }
    ];
  }, [filteredData]);

  const handleExportAll = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div><h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">{t('reports_title')}</h1><p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Data Analysis & Filters</p></div>
        <button onClick={handleExportAll} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all no-print">📊 Export Overzicht</button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-50 space-y-8 no-print">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
          <span>🔍</span> Filter op Datum, Werf, Persoon of NOK
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">{t('filter_year')}</label>
            <select value={year} onChange={e => setYear(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs font-black focus:border-orange-500 outline-none">
              <option value="all">ALLE JAREN</option>
              {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">{t('filter_month')}</label>
            <select value={month} onChange={e => setMonth(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs font-black focus:border-orange-500 outline-none">
              <option value="all">ALLE MAANDEN</option>
              {months.map((m, i) => <option key={m} value={String(i+1)}>{m.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">{t('filter_day')}</label>
            <select value={day} onChange={e => setDay(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs font-black focus:border-orange-500 outline-none">
              <option value="all">ALLE DAGEN</option>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">{t('filter_status')}</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs font-black focus:border-orange-500 outline-none">
              <option value="all">ALLE STATUSSEN</option>
              {Object.values(LMRAStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">{t('filter_tech')}</label>
            <select value={tech} onChange={e => setTech(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs font-black focus:border-orange-500 outline-none">
              <option value="all">ALLE PERSONEN</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Werf / Locatie</label>
            <input 
              type="text" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} 
              placeholder="ZOEK WERF..."
              className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-xs font-black focus:border-orange-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-slate-50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Trend Analyse</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} /><YAxis axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f8fafc' }} /><Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={50}>{stats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar></BarChart></ResponsiveContainer></div>
        </div>
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-slate-50 flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="h-48 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">{stats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <div className="space-y-2 grid grid-cols-2 md:grid-cols-1 gap-2 w-full md:w-auto">
             {stats.map(s => <div key={s.name} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase"><span className="w-2 h-2 rounded-full" style={{background: s.color}}></span>{s.name}: {s.value}</div>)}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-slate-50 overflow-hidden print-section">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                <th className="px-6 md:px-10 py-6 md:py-8">Datum & Project</th>
                <th className="px-6 md:px-10 py-6 md:py-8">Persoon</th>
                <th className="px-6 md:px-10 py-6 md:py-8 text-center">Status</th>
                <th className="px-6 md:px-10 py-6 md:py-8 text-right no-print">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 md:px-10 py-6 md:py-8"><p className="font-black text-slate-800 text-sm">{d.title}</p><p className="text-[10px] font-black text-slate-400 uppercase">{d.date}</p></td>
                  <td className="px-6 md:px-10 py-6 md:py-8 font-black text-[12px] text-slate-600">{d.userName}</td>
                  <td className="px-6 md:px-10 py-6 md:py-8 text-center"><span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ${d.status === LMRAStatus.OK ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{d.status}</span></td>
                  <td className="px-6 md:px-10 py-6 md:py-8 text-right no-print"><button onClick={() => setViewingLMRA(d)} className="text-slate-200 hover:text-slate-900 text-xl transition-all">👁️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && <div className="p-20 md:p-32 text-center text-slate-300 font-black uppercase tracking-widest italic text-[10px]">Geen data gevonden voor deze filters</div>}
        </div>
      </div>

      {viewingLMRA && <DetailModal lmra={viewingLMRA} users={users} onClose={() => setViewingLMRA(null)} />}
    </div>
  );
};

export default ReportsView;
