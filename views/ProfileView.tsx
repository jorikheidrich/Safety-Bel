
import React, { useState } from 'react';
import { User, Language } from '../types';
import { useTranslation } from '../App';

interface ProfileViewProps {
  currentUser: User;
  users: User[];
  onUpdateUser: (updatedUser: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, users, onUpdateUser }) => {
  const { t } = useTranslation();
  
  // General Info States
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  
  // Security States
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleUpdateInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...currentUser, name, email };
    onUpdateUser(updatedUser);
    setMessage({ text: t('update_success'), type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass) return;
    
    if (newPass !== confirmPass) {
      setMessage({ text: t('passwords_not_match'), type: 'error' });
      return;
    }

    const isTaken = users.some(u => u.password === newPass && u.id !== currentUser.id);
    if (isTaken) {
      setMessage({ text: t('password_unique_error'), type: 'error' });
      return;
    }

    const updatedUser = { ...currentUser, password: newPass };
    onUpdateUser(updatedUser);
    setNewPass('');
    setConfirmPass('');
    setMessage({ text: t('update_success'), type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">{t('profile_title')}</h1>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{t('profile_subtitle')}</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl font-black text-xs uppercase tracking-widest animate-bounce ${
          message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Details */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center space-x-4 border-b border-slate-50 pb-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/20">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">{currentUser.name}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">@{currentUser.username} • {currentUser.role}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateInfo} className="space-y-6">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('personal_info')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('full_name')}</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('email_address')}</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px]">
              {t('update_profile')}
            </button>
          </form>
        </div>

        {/* Security / Password */}
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <form onSubmit={handleUpdatePassword} className="space-y-8">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">{t('security_settings')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('new_password')}</label>
                <input 
                  type="password" required value={newPass} onChange={e => setNewPass(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('confirm_new_password')}</label>
                <input 
                  type="password" required value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" disabled={!newPass} className="w-full bg-orange-500 disabled:opacity-30 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-orange-600 transition-all uppercase tracking-widest text-[10px]">
              {t('save_password')}
            </button>
          </form>
          
          <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Account Type</p>
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${currentUser.isExternal ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {currentUser.isExternal ? 'Extern' : 'Intern'}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase">ID: {currentUser.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
