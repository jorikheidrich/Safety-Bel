
import React, { useState, useRef, useEffect } from 'react';
import { KickOffMeeting, User, UserRole, Attendee, Department } from '../types';
import { useTranslation } from '../App';

interface KickOffViewProps {
  kickoffs: KickOffMeeting[];
  setKickoffs: React.Dispatch<React.SetStateAction<KickOffMeeting[]>>;
  addKickOff: (ko: KickOffMeeting) => void;
  onUpdateKickOff: (ko: KickOffMeeting) => void;
  currentUser: User;
  users: User[];
  topics: string[];
}

const SignatureModal: React.FC<{ 
  onSave: (dataUrl: string) => void, 
  onClose: () => void,
  personName: string
}> = ({ onSave, onClose, personName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.lineCap = 'round'; }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
      ctx.beginPath(); ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
      ctx.lineTo(x, y); ctx.stroke();
    }
  };

  const save = () => { if (canvasRef.current) onSave(canvasRef.current.toDataURL()); };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
        <h3 className="text-xl font-black mb-1 uppercase tracking-tight">{t('sign')}</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">{personName}</p>
        <canvas ref={canvasRef} width={400} height={200} className="w-full h-48 border-2 border-slate-100 rounded-[2rem] bg-slate-50 touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)} />
        <div className="grid grid-cols-2 gap-4 mt-10">
          <button onClick={onClose} className="py-4 font-black uppercase text-xs text-slate-400">{t('cancel')}</button>
          <button onClick={save} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl">{t('confirm_signature')}</button>
        </div>
      </div>
    </div>
  );
};

const KickOffView: React.FC<KickOffViewProps> = ({ kickoffs, setKickoffs, addKickOff, onUpdateKickOff, currentUser, users, topics }) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [signingIdx, setSigningIdx] = useState<number | null>(null);
  const [activeKOSigningId, setActiveKOSigningId] = useState<string | null>(null);
  
  const activeKOSigning = kickoffs.find(k => k.id === activeKOSigningId);

  const [showExternalInput, setShowExternalInput] = useState(false);
  const [externalName, setExternalName] = useState('');

  const [project, setProject] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dept, setDept] = useState<Department>(currentUser.department);
  const [risks, setRisks] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([{ userId: currentUser.id, name: currentUser.name, signature: '', isSigned: false }]);

  const addTechnician = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && !attendees.find(a => a.userId === userId)) {
      setAttendees([...attendees, { userId: user.id, name: user.name, signature: '', isSigned: false }]);
    }
  };

  const addExternalPerson = () => {
    if (externalName.trim()) {
      setAttendees([...attendees, { name: externalName.trim(), signature: '', isSigned: false }]);
      setExternalName(''); setShowExternalInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = date.split('-').reverse().join('/');
    const newKO: KickOffMeeting = {
      id: Math.random().toString(36).substr(2, 9),
      project, location, userId: currentUser.id, department: dept,
      date: formattedDate, timestamp: new Date(date).getTime(),
      attendees: [...attendees],
      risksIdentified: risks.split('\n').filter(r => r.trim() !== ''),
      topics: topics
    };
    addKickOff(newKO);
    setShowForm(false);
    setProject(''); setLocation(''); setRisks(''); setDate(new Date().toISOString().split('T')[0]);
    setAttendees([{ userId: currentUser.id, name: currentUser.name, signature: '', isSigned: false }]);
    setShowExternalInput(false);
  };

  const handleLateSignature = (ko: KickOffMeeting, idx: number, signature: string) => {
    const updatedAttendees = [...ko.attendees];
    updatedAttendees[idx] = { ...updatedAttendees[idx], signature, isSigned: true };
    onUpdateKickOff({ ...ko, attendees: updatedAttendees });
    setActiveKOSigningId(null);
    setSigningIdx(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">{t('kickoff')}</h1>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Safety briefing for teams</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-xl font-black uppercase tracking-widest text-xs">
          + Nieuwe Kick-off
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-50 mb-10 animate-in slide-in-from-top-6">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('project_name')}</label>
                <input required value={project} onChange={e => setProject(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-orange-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('location')}</label>
                <input required value={location} onChange={e => setLocation(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-orange-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('date')}</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-orange-500 transition-all" />
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-center border-b-2 border-slate-50 pb-2">
                 <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Team op de werf</h3>
                 <div className="flex gap-2">
                    <select onChange={e => {if(e.target.value) addTechnician(e.target.value); e.target.value='';}} className="bg-slate-100 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg outline-none">
                      <option value="">+ {t('add_technician')}</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowExternalInput(!showExternalInput)} className="bg-slate-900 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg">+ {t('add_external')}</button>
                 </div>
               </div>

               {showExternalInput && (
                <div className="p-6 bg-orange-50 rounded-[2rem] border-2 border-orange-100 flex gap-3 animate-in slide-in-from-right-4">
                  <input autoFocus placeholder={t('full_name')} value={externalName} onChange={e => setExternalName(e.target.value)} onKeyPress={e => e.key === 'Enter' && addExternalPerson()} className="flex-1 p-3 rounded-xl border-2 border-orange-100 outline-none font-bold text-sm shadow-sm" />
                  <button type="button" onClick={addExternalPerson} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-black">✓</button>
                  <button type="button" onClick={() => setShowExternalInput(false)} className="bg-white text-slate-400 px-3 rounded-xl">✕</button>
                </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {attendees.map((a, i) => (
                   <div key={i} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center relative group">
                     <button type="button" onClick={() => setAttendees(attendees.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">✕</button>
                     <p className="font-black text-sm text-slate-800 text-center mb-1">{a.name}</p>
                     {a.isSigned ? (
                       <img src={a.signature} className="h-16 object-contain opacity-60" />
                     ) : (
                       <button type="button" onClick={() => setSigningIdx(i)} className="bg-white text-orange-500 border-2 border-orange-50 px-6 py-2 rounded-xl text-[10px] font-black uppercase mt-4 shadow-sm">{t('sign')}</button>
                     )}
                   </div>
                 ))}
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specifieke Werfrisico's</label>
               <textarea required value={risks} onChange={e => setRisks(e.target.value)} placeholder="Eén risico per regel..." className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] font-medium h-32 focus:border-orange-500 outline-none" />
            </div>

            <div className="flex justify-end pt-8 border-t">
              <button type="submit" className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Verslag Opslaan</button>
            </div>
          </form>
        </div>
      )}

      {signingIdx !== null && activeKOSigning && (
        <SignatureModal personName={activeKOSigning.attendees[signingIdx].name} onClose={() => {setActiveKOSigningId(null); setSigningIdx(null);}} onSave={(data) => handleLateSignature(activeKOSigning, signingIdx, data)} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {kickoffs.map(ko => (
          <div key={ko.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 hover:shadow-xl transition-all">
            <h3 className="font-black text-xl text-slate-900 mb-1">{ko.project}</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">{ko.date} • {ko.location}</p>
            <div className="space-y-6">
               <div className="space-y-3">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Handtekeningen:</p>
                 <div className="flex flex-col gap-2">
                   {ko.attendees.map((a, i) => (
                     <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl">
                       <span className="text-[10px] font-black text-slate-600 truncate max-w-[120px]">{a.name}</span>
                       {a.isSigned ? (
                         <span className="text-green-500 text-[10px] font-black">✓</span>
                       ) : (
                         <button onClick={() => {setActiveKOSigningId(ko.id); setSigningIdx(i);}} className="text-orange-500 text-[9px] font-black uppercase border-b border-orange-200 animate-pulse hover:animate-none">Tekenen</button>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
               <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                  <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-2">Risico's:</p>
                  <p className="text-xs text-slate-700 font-bold line-clamp-2 italic">{ko.risksIdentified.join(', ')}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KickOffView;
