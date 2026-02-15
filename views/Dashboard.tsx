
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
  lastSync?: number;
  isSyncing?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  lmras, kickoffs, currentUser, onUpdateLMRA, onUpdateKickoff, 
  unreadNotifications = [], setActiveTab, lastSync, isSyncing 
}) => {
  const [dailyTip, setDailyTip] = useState('Draag altijd je PBM\'s op de werf.');
  const { t } = useTranslation();
  
  const pendingLmras = lmras.filter(l => 
    l.attendees.some(a => a.userId === currentUser.id && !a.isSigned)
  );

  const safetyScore = useMemo(() => {
    const myReports = lmras.filter(l => l.userId === currentUser.id);
    if (myReports.length === 0) return 100;
    const safeCount = myReports.filter(r => r.status === LMRAStatus.OK || r.status === LMRAStatus.RESOLVED).length;
    return Math.round((safeCount / myReports.length) * 100);
  }, [lmras, currentUser]);

  useEffect(() => {
    getSafetyAdvice("Algemeen dagelijks advies voor een technieker op de werf").then(tip => setDailyTip(tip));
  }, []);

  const showNOKAlert = (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.WERFLEIDER) && unreadNotifications.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">{t('welcome')}, {currentUser.name}</h1>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-slate-500 font-bold italic text-sm">{t('safety_quote')}</p>
             <div className="flex items-center gap-2 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                <span className={`w-1.5 h-1.5 rounded-full bg-green-500 ${isSyncing ? 'animate-ping' : ''}`}></span>
                <span className="text-[8px] font-black text-green-700 uppercase tracking-widest">Live: {lastSync ? new Date(lastSync).toLocaleTimeString() : '-'}</span>
             </div>
          </div>
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
        <div className="bg-red-500 text-white p-6 rounded-[2.5rem] shadow-2xl animate-pulse flex items-center justify-between">
          <div className="flex items-center gap-4">
             <span className="text-3xl">⚠️</span>
             <div>
               <p className="font-black uppercase text-xs tracking-widest">Dringende Aandacht Vereist</p>
               <p className="font-bold text-sm">Er zijn {unreadNotifications.length} nieuwe NOK meldingen.</p>
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
