
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
  
  const generateRecordPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const supervisor = users.find(u => u.id === lmra.supervisorId)?.name || 'Onbekend';

    const html = `
      <html>
        <head>
          <title>LMRA Rapport - ${lmra.title}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 5px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            h1 { margin: 0; font-size: 26px; font-weight: 900; color: #0f172a; text-transform: uppercase; font-style: italic; }
            .meta { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f8fafc; padding: 25px; border-radius: 15px; border: 1px solid #e2e8f0; }
            .meta-item { font-size: 13px; }
            .meta-label { font-weight: 900; color: #64748b; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px; }
            .meta-val { font-weight: bold; color: #1e293b; }
            .section-title { font-weight: 900; text-transform: uppercase; font-size: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 30px 0 15px 0; color: #f97316; }
            .question { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .answer { font-weight: 900; padding: 4px 10px; border-radius: 6px; font-size: 10px; text-transform: uppercase; }
            .ok { background: #dcfce7; color: #15803d; }
            .nok { background: #fee2e2; color: #b91c1c; }
            .nvt { background: #f1f5f9; color: #64748b; }
            .attendees { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 20px; margin-top: 20px; }
            .attendee-card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; text-align: center; background: #fff; }
            .signature { height: 70px; max-width: 100%; object-fit: contain; margin-top: 10px; border-top: 1px dashed #e2e8f0; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header"><h1>VCA BEL - LMRA</h1><span class="answer ${lmra.status.includes('OK') ? 'ok' : 'nok'}">${lmra.status}</span></div>
          <div class="meta">
            <div class="meta-item"><span class="meta-label">Project</span><span class="meta-val">${lmra.title}</span></div>
            <div class="meta-item"><span class="meta-label">Locatie</span><span class="meta-val">${lmra.location}</span></div>
            <div class="meta-item"><span class="meta-label">Datum</span><span class="meta-val">${lmra.date}</span></div>
            <div class="meta-item"><span class="meta-label">Uitvoerder</span><span class="meta-val">${lmra.userName}</span></div>
          </div>
          <div class="section-title">Resultaten</div>
          ${lmra.questions.map(q => `<div class="question"><span>${q.questionText}</span><span class="answer ${q.answer?.toLowerCase() || 'nvt'}">${q.answer || 'NVT'}</span></div>`).join('')}
          <div class="section-title">Signatures</div>
          <div class="attendees">${lmra.attendees.map(a => `<div class="attendee-card"><div>${a.name}</div>${a.isSigned ? `<img class="signature" src="${a.signature}" />` : ''}</div>`).join('')}</div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-start mb-10 border-b border-slate-50 pb-6">
          <div><h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">{lmra.title}</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lmra.date}</p></div>
          <div className="flex gap-3">
             <button onClick={generateRecordPDF} className="bg-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg font-black text-[10px] uppercase">📄 PDF</button>
             <button onClick={onClose} className="bg-slate-100 text-slate-400 p-3 rounded-2xl">✕</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-orange-500 tracking-widest border-b pb-2">Checklist</h3>
              {lmra.questions.map((q, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-2 ${q.answer === 'NOK' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-50'}`}>
                   <div className="flex justify-between items-center text-sm font-bold">
                     <span>{q.questionText}</span>
                     <span className={`px-3 py-1 rounded-lg text-[10px] uppercase ${q.answer === 'OK' ? 'text-green-600' : 'text-red-600'}`}>{q.answer}</span>
                   </div>
                </div>
              ))}
           </div>
           <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-orange-500 tracking-widest border-b pb-2">Personeel</h3>
              <div className="grid grid-cols-2 gap-4">
                {lmra.attendees.map((a, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center">
                    <span className="text-xs font-black">{a.name}</span>
                    {a.isSigned && <img src={a.signature} className="h-10 mt-2 opacity-50" />}
                  </div>
                ))}
              </div>
           </div>
        </div>
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

  const generateFullOverview = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `<html><head><title>VCA Rapport</title></head><body><h1>Veiligheidsrapportage Overzicht</h1><p>Gefilterd op: ${year}-${month}-${day}</p><hr/><table><thead><tr><th>Project</th><th>Datum</th><th>Status</th><th>Persoon</th></tr></thead><tbody>${filteredData.map(d => `<tr><td>${d.title}</td><td>${d.date}</td><td>${d.status}</td><td>${d.userName}</td></tr>`).join('')}</tbody></table></body></html>`;
    printWindow.document.write(html); printWindow.document.close(); setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div><h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">{t('reports_title')}</h1><p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Data Analysis & Filters</p></div>
        <button onClick={generateFullOverview} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all">📊 Export PDF</button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 space-y-8">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
          <span>🔍</span> Filter op Datum, Werf, Persoon of NOK
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Trend Analyse</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} /><YAxis axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f8fafc' }} /><Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={50}>{stats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Bar></BarChart></ResponsiveContainer></div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 flex items-center justify-center">
          <div className="h-48 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">{stats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <div className="space-y-2 ml-4">
             {stats.map(s => <div key={s.name} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase"><span className="w-2 h-2 rounded-full" style={{background: s.color}}></span>{s.name}: {s.value}</div>)}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                <th className="px-10 py-8">Datum & Project</th>
                <th className="px-10 py-8">Persoon</th>
                <th className="px-10 py-8 text-center">Status</th>
                <th className="px-10 py-8 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-10 py-8"><p className="font-black text-slate-800">{d.title}</p><p className="text-[10px] font-black text-slate-400 uppercase">{d.date}</p></td>
                  <td className="px-10 py-8 font-black text-sm text-slate-600">{d.userName}</td>
                  <td className="px-10 py-8 text-center"><span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ${d.status === LMRAStatus.OK ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{d.status}</span></td>
                  <td className="px-10 py-8 text-right"><button onClick={() => setViewingLMRA(d)} className="text-slate-200 hover:text-slate-900 text-xl transition-all">👁️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && <div className="p-32 text-center text-slate-300 font-black uppercase tracking-widest italic text-xs">Geen data gevonden voor deze filters</div>}
        </div>
      </div>

      {viewingLMRA && <DetailModal lmra={viewingLMRA} users={users} onClose={() => setViewingLMRA(null)} />}
    </div>
  );
};

export default ReportsView;
