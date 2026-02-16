
import React, { useState } from 'react';
import { User, UserRole, AppConfig, Department } from '../types';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  appConfig: AppConfig;
  currentUser?: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, appConfig, currentUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Filter enkel deleted weg, laat inactieven staan
  const allUsers = users.filter(u => !u.deleted);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: UserRole.TECHNIEKER,
    department: ((appConfig.departments && appConfig.departments.length > 0) ? appConfig.departments[0] : 'ALGEMEEN') as Department,
    isExternal: false,
    isActive: true
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      role: UserRole.TECHNIEKER,
      department: ((appConfig.departments && appConfig.departments.length > 0) ? appConfig.departments[0] : 'ALGEMEEN') as Department,
      isExternal: false,
      isActive: true
    });
    setShowForm(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      password: user.password || '',
      role: user.role,
      department: user.department,
      isExternal: user.isExternal,
      isActive: user.isActive !== false
    });
    setShowForm(true);
  };

  const handleToggleActive = (id: string) => {
    if (currentUser && id === currentUser.id) {
      alert("Beveiliging: U kunt uw eigen administrator account niet deactiveren.");
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const newStatus = !(u.isActive !== false);
        return { ...u, isActive: newStatus, timestamp: Date.now() };
      }
      return u;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isUsernameTaken = allUsers.some(u => u.username.toLowerCase() === formData.username.toLowerCase() && (!editingUser || u.id !== editingUser.id));
    if (isUsernameTaken) {
      alert("Deze gebruikersnaam is al in gebruik.");
      return;
    }

    const finalPassword = formData.password || formData.username.toLowerCase();

    const finalData = {
      ...formData,
      department: formData.department as Department,
      password: finalPassword,
      mustChangePassword: editingUser ? (editingUser.password !== finalPassword ? true : editingUser.mustChangePassword) : true,
      timestamp: Date.now(),
      deleted: false
    };

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...finalData } as User : u));
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...finalData
      } as User;
      setUsers(prev => [...prev, newUser]);
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">👥 GEBRUIKERS & TOEGANG</h1>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Beheer actieve en inactieve accounts</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all"
        >
          + Nieuwe Gebruiker
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-50 animate-in slide-in-from-top-4 mb-10">
          <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">{editingUser ? 'Gegevens Aanpassen' : 'Nieuwe Gebruiker'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-slate-900 transition-colors">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Naam</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Username</label>
              <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Wachtwoord</label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-bold" placeholder="Username is standaard" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Rol</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 font-black text-sm uppercase">
                <option value={UserRole.TECHNIEKER}>Technieker</option>
                <option value={UserRole.WERFLEIDER}>Werfleider (Moderator)</option>
                <option value={UserRole.PROJECT_MANAGER}>Project Manager</option>
                <option value={UserRole.PREVENTIE_ADVISEUR}>Preventieadviseur</option>
                <option value={UserRole.ADMIN}>Administrator</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Afdeling</label>
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value as Department})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 font-black text-sm uppercase">
                {(appConfig.departments || ['ALGEMEEN']).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 text-slate-400 font-black uppercase text-xs">Annuleren</button>
              <button type="submit" className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl transition-all">Gebruiker Opslaan</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                <th className="px-10 py-8">Gebruiker</th>
                <th className="px-10 py-8 text-center">Toegang</th>
                <th className="px-10 py-8 text-center">Functie</th>
                <th className="px-10 py-8 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map(user => (
                <tr key={user.id} className={`transition-all group ${user.isActive === false ? 'bg-slate-50/50 grayscale' : 'hover:bg-slate-50/50'}`}>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${user.isActive === false ? 'bg-slate-200 text-slate-400' : (user.isExternal ? 'bg-orange-100 text-orange-600' : 'bg-slate-900 text-white')}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`text-sm font-black ${user.isActive === false ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{user.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{user.username} • {user.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <button 
                      onClick={() => handleToggleActive(user.id)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${
                        user.isActive !== false 
                        ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-200' 
                        : 'bg-white text-red-500 border-red-100'
                      }`}
                    >
                      {user.isActive !== false ? '● Actief' : '○ Geblokkeerd'}
                    </button>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase ${user.isActive === false ? 'text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenEdit(user)} className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-orange-500 transition-colors">✏️</button>
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

export default UserManagement;
