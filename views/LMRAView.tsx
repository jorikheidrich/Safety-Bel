
import React, { useState, useRef, useEffect } from 'react';
import { LMRA, LMRAStatus, User, UserRole, LMRAQuestion, Attendee, Department, LMRAAnswer } from '../types';
import { useTranslation } from '../App';

interface LMRAViewProps {
  lmras: LMRA[];
  setLmras: React.Dispatch<React.SetStateAction<LMRA[]>>;
  addLMRA: (lmra: LMRA) => void;
  onUpdateLMRA: (lmra: LMRA) => void;
  currentUser: User;
  users: User[];
  questions: string[];
  permissions?: string[];
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
      const x = ('touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
      const y = ('touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
      ctx.beginPath(); ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
      const y = ('touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;
      ctx.lineTo(x, y); ctx.stroke();
    }
  };

  const save = () => { if (canvasRef.current) onSave(canvasRef.current.toDataURL()); };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95">
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

const DetailModal: React.FC<{ 
  lmra: LMRA, 
  onClose: () => void,
  onUpdate: (lmra: LMRA) => void,
  users: User[]
}> = ({ lmra, onClose, onUpdate, users }) => {
  const { t } = useTranslation();
  const [signingIdx, setSigningIdx] = useState<number | null>(null);
  
  const handlePrint = () => {
    window.print();
  };

  const handleLateSignature = (dataUrl: string) => {
    if (signingIdx !== null) {
      const updatedAttendees = [...lmra.attendees];
      updatedAttendees[signingIdx] = { ...updatedAttendees[signingIdx], signature: dataUrl, isSigned: true };
      
      const allSigned = updatedAttendees.every(a => a.isSigned);
      const isNOK = lmra.questions.some(q => q.answer === 'NOK');
      
      const updatedLMRA = {
        ...lmra,
        attendees: updatedAttendees,
        status: allSigned ? (isNOK ? LMRAStatus.NOK : LMRAStatus.OK) : LMRAStatus.PENDING_SIGNATURE
      };
      
      onUpdate(updatedLMRA);
      setSigningIdx(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-12 shadow-2xl animate-in zoom-in-95 print-section relative">
        {/* Vaste sluitknop voor mobiel bovenaan rechts */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 md:top-8 md:right-8 bg-slate-100 text-slate-500 hover:text-slate-900 p-4 rounded-full z-[120] no-print"
          aria-label="Sluiten"
        >
          ✕
        </button>

        <div className="flex justify-between items-start mb-8 border-b border-slate-50 pb-6 pr-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">{lmra.title}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lmra.date} • {lmra.location}</p>
          </div>
          <button onClick={handlePrint} className="bg-orange-500 text-white px-5 py-3 rounded-2xl shadow-lg font-black text-[10px] uppercase tracking-widest no-print hidden md:block">
            📄 Print / PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-6">
           <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Resultaten Checklist</h3>
                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${
                  lmra.status === LMRAStatus.OK ? 'bg-green-100 text-green-700 border-green-200' : 
                  lmra.status === LMRAStatus.RESOLVED ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  lmra.status === LMRAStatus.PENDING_SIGNATURE ? 'bg-orange-100 text-orange-700 border-orange-200' :
                  'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {lmra.status}
                </span>
              </div>
              <div className="space-y-2">
                {lmra.questions.map((q, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border-2 flex justify-between items-center ${q.answer === 'NOK' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-50'}`}>
                     <span className="text-xs font-bold text-slate-700">{q.questionText}</span>
                     <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${q.answer === 'OK' ? 'text-green-600' : q.answer === 'NOK' ? 'text-red-600' : 'text-slate-400'}`}>{q.answer || 'NVT'}</span>
                  </div>
                ))}
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-widest border-b pb-2">Ondertekening Teams</h3>
              <div className="grid grid-cols-1 gap-4">
                {lmra.attendees.map((a, i) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 flex items-center justify-between group">
                    <div>
                      <p className="font-black text-sm text-slate-800">{a.name}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${a.isSigned ? 'text-green-500' : 'text-orange-500'}`}>
                        {a.isSigned ? '✓ GETEKEND' : '✍️ OPENSTAAND'}
                      </p>
                    </div>
                    {a.isSigned ? (
                      <img src={a.signature} className="h-8 md:h-10 opacity-40 object-contain" />
                    ) : (
                      <button onClick={() => setSigningIdx(i)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all no-print">✍️ Tekenen</button>
                    )}
                  </div>
                ))}
              </div>
           </div>
        </div>
        
        <button onClick={handlePrint} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl no-print md:hidden mt-4">
          Genereer Rapport / PDF
        </button>

        {signingIdx !== null && (
          <SignatureModal personName={lmra.attendees[signingIdx].name} onClose={() => setSigningIdx(null)} onSave={handleLateSignature} />
        )}
      </div>
    </div>
  );
};

const LMRAView: React.FC<LMRAViewProps> = ({ lmras, setLmras, addLMRA, onUpdateLMRA, currentUser, users, questions: dynamicQuestions, permissions = [] }) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [signingIdx, setSigningIdx] = useState<number | null>(null);
  
  const [viewingLMRAId, setViewingLMRAId] = useState<string | null>(null);
  const viewingLMRA = lmras.find(l => l.id === viewingLMRAId);
  
  const [showExternalInput, setShowExternalInput] = useState(false);
  const [externalName, setExternalName] = useState('');

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dept, setDept] = useState<Department>(currentUser.department);
  const [supervisorId, setSupervisorId] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([{ userId: currentUser.id, name: currentUser.name, signature: '', isSigned: false }]);
  const [questions, setQuestions] = useState<LMRAQuestion[]>([]);

  const canManage = permissions.includes('manage_records') || currentUser.role === UserRole.ADMIN;

  useEffect(() => {
    if (questions.length === 0 || !showForm) {
      setQuestions(dynamicQuestions.map((q, i) => ({ id: `q${i}`, questionText: q, answer: null, reason: '' })));
    }
  }, [dynamicQuestions, showForm]);

  const handleAnswer = (idx: number, answer: LMRAAnswer) => {
    const n = [...questions];
    n[idx].answer = answer;
    if (answer !== 'NOK') n[idx].reason = '';
    setQuestions(n);
  };

  const handleCopy = (l: LMRA) => {
    setTitle(l.title); setLocation(l.location); setDept(l.department); setSupervisorId(l.supervisorId);
    setDate(new Date().toISOString().split('T')[0]);
    setAttendees(l.attendees.map(a => ({ ...a, signature: '', isSigned: false })));
    setQuestions(dynamicQuestions.map((q, i) => ({ id: `q${i}`, questionText: q, answer: null, reason: '' })));
    setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm("Weet u zeker dat u deze LMRA wilt verwijderen?")) {
      setLmras(prev => prev.filter(l => l.id !== id));
    }
  };

  const resetForm = () => {
    setTitle(''); setLocation(''); setSupervisorId(''); setDate(new Date().toISOString().split('T')[0]);
    setDept(currentUser.department);
    setAttendees([{ userId: currentUser.id, name: currentUser.name, signature: '', isSigned: false }]);
    setQuestions(dynamicQuestions.map((q, i) => ({ id: `q${i}`, questionText: q, answer: null, reason: '' })));
    setShowExternalInput(false); setExternalName('');
  };

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
    if (questions.some(q => q.answer === null)) { alert("Gelieve alle vragen te beantwoorden."); return; }
    const missingReason = questions.some(q => q.answer === 'NOK' && !q.reason);
    if (missingReason) { alert("Gelieve een reden op te geven."); return; }
    const isNOK = questions.some(q => q.answer === 'NOK');
    const allSigned = attendees.every(a => a.isSigned);
    const formattedDate = date.split('-').reverse().join('/');
    const newLMRA: LMRA = {
      id: Math.random().toString(36).substr(2, 9),
      title, location, userId: currentUser.id, userName: currentUser.name, supervisorId, department: dept,
      date: formattedDate, timestamp: new Date(date).getTime(),
      status: allSigned ? (isNOK ? LMRAStatus.NOK : LMRAStatus.OK) : LMRAStatus.PENDING_SIGNATURE,
      questions, attendees: [...attendees]
    };
    addLMRA(newLMRA); setShowForm(false); resetForm();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">{t('lmras')}</h1>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Safety Compliance</p>
        </div>
        <button onClick={() => { if(!showForm) resetForm(); setShowForm(!showForm); }} className="bg-orange-500 text-white px-8 py-4 rounded-2xl shadow-xl font-black uppercase text-xs">
          {showForm ? 'Annuleren' : t('new_analysis')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-50 mb-10 animate-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('project_name')}</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-orange-500 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('location')}</label>
                <input required value={location} onChange={e => setLocation(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-orange-500 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('date')}</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-orange-500 transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('supervisor')}</label>
                <select required value={supervisorId} onChange={e => setSupervisorId(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:border-orange-500 transition-all">
                  <option value="">Selecteer Supervisor...</option>
                  {users.filter(u => u.role !== UserRole.TECHNIEKER).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-orange-500 tracking-widest border-b pb-2">{t('questions_list')}</h3>
              <div className="grid grid-cols-1 gap-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-6 bg-slate-50 rounded-[2.5rem] flex flex-col gap-6 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <span className="font-bold text-sm flex-1">{q.questionText}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleAnswer(idx, 'OK')} className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${q.answer === 'OK' ? 'bg-green-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>OK</button>
                        <button type="button" onClick={() => handleAnswer(idx, 'NOK')} className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${q.answer === 'NOK' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-slate-400'}`}>NOK</button>
                        <button type="button" onClick={() => handleAnswer(idx, 'NVT')} className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all ${q.answer === 'NVT' ? 'bg-slate-400 text-white shadow-lg' : 'bg-white text-slate-400'}`}>NVT</button>
                      </div>
                    </div>
                    {q.answer === 'NOK' && (
                      <div className="animate-in slide-in-from-top-4">
                        <label className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1 block mb-2">Reden voor NOK (Verplicht)</label>
                        <textarea required placeholder="..." value={q.reason || ''} onChange={(e) => { const n = [...questions]; n[idx].reason = e.target.value; setQuestions(n); }} className="w-full p-5 bg-white border-2 border-red-100 rounded-2xl text-xs font-bold focus:border-red-500 outline-none" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center border-b-2 border-slate-50 pb-2">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Team op de werf</h3>
                <div className="flex gap-2">
                  <select onChange={e => {if(e.target.value) addTechnician(e.target.value); e.target.value='';}} className="bg-slate-100 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg outline-none">
                    <option value="">+ {t('add_technician')}</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button type="button" onClick={() => setShowExternalInput(!showExternalInput)} className="bg-slate-900 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-lg">+ {t('add_external')}</button>
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

            <div className="flex justify-end pt-8 border-t">
              <button type="submit" className="bg-slate-900 text-white px-12 py-5 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">{t('validate_send')}</button>
            </div>
          </form>
        </div>
      )}

      {viewingLMRA && <DetailModal lmra={viewingLMRA} users={users} onUpdate={onUpdateLMRA} onClose={() => setViewingLMRAId(null)} />}
      
      {signingIdx !== null && (
        <SignatureModal personName={attendees[signingIdx].name} onClose={() => setSigningIdx(null)} onSave={data => {
          const n = [...attendees];
          n[signingIdx].signature = data;
          n[signingIdx].isSigned = true;
          setAttendees(n);
          setSigningIdx(null);
        }} />
      )}

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="px-8 py-6">Project</th>
                <th className="px-8 py-6">Technieker</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lmras.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-6"><p className="font-black text-slate-800">{l.title}</p><p className="text-[10px] text-slate-400 font-bold">{l.date} • {l.location}</p></td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-600">{l.userName}</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${l.status === LMRAStatus.OK ? 'bg-green-100 text-green-700 border-green-200' : l.status === LMRAStatus.RESOLVED ? 'bg-blue-100 text-blue-700 border-blue-200' : l.status === LMRAStatus.PENDING_SIGNATURE ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                       <button onClick={() => handleCopy(l)} className="bg-slate-100 text-slate-400 p-3 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-sm" title="Kopiëren">📋</button>
                       <button onClick={() => setViewingLMRAId(l.id)} className="bg-slate-100 text-slate-400 p-3 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm" title="Bekijken">👁️</button>
                       {canManage && (
                         <button onClick={() => handleDelete(l.id)} className="bg-red-50 text-red-500 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Verwijderen">🗑️</button>
                       )}
                    </div>
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

export default LMRAView;
