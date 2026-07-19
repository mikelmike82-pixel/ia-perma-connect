import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import api from '../api/axios';

export default function NewChatModal({ onClose, onStarted }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    api.get('/conversations/users')
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (userId) => {
    setStartingId(userId);
    try {
      const res = await api.post('/conversations/start', { userId });
      onStarted(res.data.conversation);
    } catch (err) {
      console.error(err);
    } finally {
      setStartingId(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) =>
    name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">New chat</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search colleagues..."
              className="w-full bg-slate-100 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <p className="text-sm text-slate-400 text-center py-6">Loading...</p>}

          {!loading && filteredUsers.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">No colleagues found</p>
          )}

          {filteredUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => handleStart(u.id)}
              disabled={startingId === u.id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {initials(u.fullName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{u.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{u.jobTitle || u.department || 'Employee'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}