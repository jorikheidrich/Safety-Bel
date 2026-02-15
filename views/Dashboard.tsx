
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LMRA, KickOffMeeting, LMRAStatus, User, UserRole, Attendee, Notification } from '../types';
import { useTranslation } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getSafetyAdvice } from '../services/geminiService';

interface DashboardProps {
  lmras: LMRA[];
  kickoffs: KickOffMeeting[];
  currentUser: User;
  onUpdateLMRA: (lmra: LMRA) => void;
  onUpdateKickoff: (ko: KickOffMeeting) => void;
  unreadNotifications?: Notification[];
  setActiveTab: (tab: string) => void;
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
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
      }
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
      ctx.beginPath();
      ctx.moveTo(x, y);
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
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const save = () => { if (canvasRef.current) onSave(canvasRef.current.toDataURL()); };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
        <h3 className="text-xl font-black mb-1 uppercase tracking-tight">{t('sign')}</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">{personName}</p>
        <canvas
          ref={canvasRef}
          width={400} height={200}
          className="w-full h-48 border-2 border-slate-100 rounded-[2rem] bg-slate-50 touch-none cursor-crosshair"
          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
        />
        <div className="grid grid-cols-2 gap-4 mt-10">
          <button onClick={onClose} className="py-4 font-black uppercase text-xs text-slate-400">{t('cancel')}</button>
          <button onClick={save} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl">{t('confirm_signature')}</button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ lmras, kickoffs, currentUser, onUpdateLMRA, onUpdateKickoff, unreadNotifications = [], setActiveTab }) => {
  const [signingLmra, setSigningLmra] = useState<LMRA | null>(null);
  const [dailyTip, setDailyTip] = useState('Draag altijd je PBM\'s op de werf.');
  const { t } = useTranslation();
  
  const pendingLmras = lmras.filter(l => 
    l.attendees.some(a => a.userId === currentUser.id && !a.isSigned)
  );

  const safetyScore = useMemo(() => {
    const myReports = lmras.filter(l => l.userId === currentUser.id);
    if (myReports.length === 0) return 100;
    // Een score is positief als de LMRA direct OK was OF als de NOK is opgelost (RESOLVED)
    const safeCount = myReports.filter(r => r.status === LMRAStatus.OK || r.status === LMRAStatus.RESOLVED).length;
    return Math.round((safeCount / myReports.length) * 100);
  }, [lmras, currentUser]);

  useEffect(() => {
    getSafetyAdvice("Algemeen dagelijks advies voor een technieker op de werf").then(tip => setDailyTip(tip));
  }, []);

  const handleSaveSignature = (dataUrl: string) => {
    if (signingLmra) {
      const updatedAttendees = signingLmra.attendees.map(a => 
        a.userId === currentUser.id ? { ...a, signature: dataUrl, isSigned: true } : a
      );
      
      const isNOK = signingLmra.questions.some(q => q.answer === 'NOK');
      const allSigned = updatedAttendees.every(a => a.isSigned);

      onUpdateLMRA({
        ...signingLmra,
        attendees: updatedAttendees,
        status: allSigned ? (isNOK ? LMRAStatus.NOK : LMRAStatus.OK) : LMRAStatus.PENDING_SIGNATURE
      });
      setSigningLmra(null);
    }
  };

  const showNOKAlert = (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PREVENTIE_ADVISEUR || currentUser.role === UserRole.WERFLEIDER) && unreadNotifications.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">{t('welcome')}, {currentUser.name}</h1>
          <p className="text-slate-500 font-bold italic text-sm">{t('safety_quote')}</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
           <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase">{t('safety_score')}</p>
             <p className="text-2xl font-black text-orange-500">{safetyScore}%</p>
           </div>
           <div className="w-12 h-12 rounded-full border-4 border-orange-100 flex items-center justify-center text-orange-500 font-black">🛡️</div>
        </div>
      </div>

      {showNOKAlert && (
        <div className="bg-red-500 text-white p-6 rounded-[2.5rem] shadow-2xl animate-bounce flex items-center justify-between">
          <div className="flex items-center gap-4">
             <span className="text-3xl">⚠️</span>
             <div>
               <p className="font-black uppercase text-xs tracking-widest">Dringende Aandacht Vereist</p>
               <p className="font-bold text-sm">Er zijn {unreadNotifications.length} nieuwe NOK meldingen die behandeld moeten worden.</p>
             </div>
          </div>
          <button 
            onClick={() => setActiveTab('nok')}
            className="bg-white text-red-500 px-6 py-2 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"
          >
            Bekijk Nu
          </button>
        </div>
      )}

      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl group-hover:bg-orange-500/20 transition-all duration-700"></div>
        <div className="relative z-10 flex items-start space-x-6">
           <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-orange-500/20 animate-pulse">💡</div>
           <div>
              <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2">{t('daily_tip')}</h3>
              <p className="text-white font-bold leading-relaxed">{dailyTip}</p>
           </div>
        </div>
      </div>

      {pendingLmras.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 p-8 rounded-[2.5rem] shadow-xl shadow-orange-500/10">
          <h2 className="text-lg font-black text-orange-700 flex items-center mb-6 uppercase tracking-widest">
            <span className="mr-3 text-2xl">✍️</span> {t('open_signatures')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingLmras.map(l => (
              <div key={l.id} className="bg-white p-5 rounded-3xl shadow-sm flex justify-between items-center border border-orange-100 hover:border-orange-500 transition-all">
                <div>
                  <p className="font-black text-slate-800">{l.title}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LMRA • {l.date}</p>
                </div>
                <button 
                  onClick={() => setSigningLmra(l)}
                  className="bg-orange-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                >
                  {t('sign')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {signingLmra && (
        <SignatureModal 
          personName={currentUser.name} 
          onClose={() => setSigningLmra(null)} 
          onSave={handleSaveSignature} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t('active_lmras')}</p>
          <p className="text-5xl font-black mt-2 text-slate-800">{lmras.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 border-l-4 border-l-red-500">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t('incidents')}</p>
          <p className="text-5xl font-black mt-2 text-red-600">{lmras.filter(l => l.status === LMRAStatus.NOK).length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 border-l-4 border-l-green-500">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{t('completed')}</p>
          <p className="text-5xl font-black mt-2 text-green-600">{lmras.filter(l => l.status === LMRAStatus.OK || l.status === LMRAStatus.RESOLVED).length}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
