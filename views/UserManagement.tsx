
import React, { useState } from 'react';
import { User, UserRole, Department } from '../types';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: UserRole.TECHNIEKER,
    department: Department.GENERAL,
    isExternal: false
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      role: UserRole.TECHNIEKER,
      department: Department.GENERAL,
      isExternal: false
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
      isExternal: user.isExternal
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Weet u zeker dat u deze gebruiker wilt verwijderen?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isUsernameTaken = users.some(u => u.username.toLowerCase() === formData.username.toLowerCase() && (!editingUser || u.id !== editingUser.id));
    if (isUsernameTaken) {
      alert("Deze gebruikersnaam is al in gebruik.");
      return;
    }

    const finalPassword = formData.password || formData.username.toLowerCase();

    const finalData = {
      ...formData,
      password: finalPassword,
      mustChangePassword: editingUser ? (editingUser.password !== finalPassword ? true : editingUser.mustChangePassword) : true,
      timestamp: Date.now() // Altijd de timestamp bijwerken bij een submit
    };

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...finalData } : u));
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...finalData
      };
      setUsers(prev => [...prev, newUser]);
    }
    setShowForm(false);
  };

  const internCount = users.filter(u => !u.isExternal).length;
  const externCount = users.filter(u => u.isExternal).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">👥 GEBRUIKERS & RECHTEN</h1>
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
               <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Staff (Intern): {internCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
               <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
               <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Partner (Extern): {externCount}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all"
        >
          + Gebruiker Toevoegen
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-50 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-6">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">{editingUser ? 'Gebruiker Aanpassen' : 'Nieuwe Gebruiker'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-300 hover:text-slate-900 transition-colors">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Volledige Naam</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Adres</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Gebruikersnaam</label>
              <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Wachtwoord</label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-bold" placeholder="Standaard is gebruikersnaam" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Systeem Rol</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-orange-500 outline-none font-black text-sm uppercase">
                <option value={UserRole.TECHNIEKER}>Technieker (User)</option>
                <option value={UserRole.WERFLEIDER}>Werfleider (Moderator)</option>
                <option value={UserRole.PROJECT_MANAGER}>Project Manager</option>
                <option value={UserRole.PREVENTIE_ADVISEUR}>Preventieadviseur</option>
                <option value={UserRole.ADMIN}>Administrator</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Gebruikerstype</label>
               <div className="flex gap-4">
                 <button type="button" onClick={() => setFormData({...formData, isExternal: false})} className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${!formData.isExternal ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>Intern</button>
                 <button type="button" onClick={() => setFormData({...formData, isExternal: true})} className={`flex-1 py-4 rounded-2xl border-2 font-black text-[10px] uppercase transition-all ${formData.isExternal ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>Extern</button>
               </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 text-slate-400 font-black uppercase text-xs tracking-widest">Annuleren</button>
              <button type="submit" className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Gebruiker Opslaan</button>
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
                <th className="px-10 py-8">Type & Afdeling</th>
                <th className="px-10 py-8 text-center">Rol</th>
                <th className="px-10 py-8 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${user.isExternal ? 'bg-orange-100 text-orange-600' : 'bg-slate-900 text-white'}`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">@{user.username} • {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg w-fit border-2 tracking-tighter shadow-sm ${user.isExternal ? 'bg-orange-500 text-white border-orange-400' : 'bg-slate-900 text-white border-slate-800'}`}>
                        {user.isExternal ? 'EXTERN' : 'INTERN'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.department}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border ${
                      user.role === UserRole.ADMIN ? 'bg-red-50 text-red-600 border-red-100' :
                      user.role === UserRole.WERFLEIDER ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                      user.role === UserRole.PREVENTIE_ADVISEUR ? 'bg-purple-50 text-purple-600 border-purple-100' :
                      'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(user)} className="bg-slate-100 text-slate-600 p-3 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-sm">✏️</button>
                      <button onClick={() => handleDelete(user.id)} className="bg-slate-100 text-slate-600 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">🗑️</button>
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
