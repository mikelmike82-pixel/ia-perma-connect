import { useEffect, useState } from 'react';
import { Shield, MoreVertical, Ban, CheckCircle, Trash2, KeyRound, X, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  const fetchUsers = () => {
    api.get('/admin/employees')
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await api.patch(`/admin/employees/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDisable = async (id) => {
    try {
      const res = await api.patch(`/admin/employees/${id}/toggle-disable`);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isDisabled: res.data.user.isDisabled } : u)));
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this employee account? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/employees/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const initials = (name) =>
    name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <Shield size={32} className="mb-3" strokeWidth={1.5} />
        <p className="text-sm">You don't have access to this page</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield size={20} className="text-primary" /> Admin Panel
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage employees, roles, and account access</p>
      </div>

      {loading && (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={24} /></div>
      )}

      {!loading && (
        <div className="bg-white border border-slate-200 rounded-2xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-3 font-medium rounded-tl-2xl">Employee</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium rounded-tr-2xl"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => {
                const isLastRow = index === users.length - 1;
                const openUpward = index >= users.length - 2;
                return (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className={`px-5 py-3.5 ${isLastRow ? 'rounded-bl-2xl' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {initials(u.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{u.fullName}</p>
                          <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{u.department || '—'}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === currentUser.id}
                        className="text-xs font-medium border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none disabled:opacity-50"
                      >
                        <option value="EMPLOYEE">Employee</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.isDisabled ? (
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Disabled</span>
                      ) : u.isOnline ? (
                        <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">Online</span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Offline</span>
                      )}
                    </td>
                    <td className={`px-5 py-3.5 text-right relative ${isLastRow ? 'rounded-br-2xl' : ''}`}>
                      {u.id !== currentUser.id && (
                        <>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                            className="text-slate-400 hover:text-slate-700 p-1"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === u.id && (
                            <div
                              className={`absolute right-5 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-48 z-50 text-left
                                ${openUpward ? 'bottom-10' : 'top-10'}`}
                            >
                              <button
                                onClick={() => setResetTarget(u)}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <KeyRound size={14} /> Reset password
                              </button>
                              <button
                                onClick={() => handleToggleDisable(u.id)}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                {u.isDisabled ? <CheckCircle size={14} /> : <Ban size={14} />}
                                {u.isDisabled ? 'Re-enable account' : 'Disable account'}
                              </button>
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Delete account
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {resetTarget && (
        <ResetPasswordModal user={resetTarget} onClose={() => { setResetTarget(null); setOpenMenuId(null); }} />
      )}
    </div>
  );
}

function ResetPasswordModal({ user, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/admin/employees/${user.id}/reset-password`, { newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Reset password</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        {success ? (
          <div className="p-5 text-center">
            <CheckCircle className="text-accent mx-auto mb-2" size={28} />
            <p className="text-sm text-slate-600 mb-4">Password reset for {user.fullName}.</p>
            <button onClick={onClose} className="text-sm text-primary font-medium hover:underline">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <p className="text-sm text-slate-500">Set a new password for <strong>{user.fullName}</strong>.</p>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full bg-slate-100 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3.5 py-2.5">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}