import { useEffect, useState } from 'react';
import { X, Search, Check, Users } from 'lucide-react';
import api from '../api/axios';

export default function NewGroupModal({ onClose, onCreated }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/conversations/users')
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleUser = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    setError('');
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Select at least one member');
      return;
    }

    setCreating(true);
    try {
      const res = await api.post('/conversations/group', {
        groupName,
        memberIds: selectedIds,
      });
      onCreated(res.data.conversation);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) =>
    name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Users size={17} /> New group
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 space-y-3">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="w-full bg-slate-100 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search colleagues..."
              className="w-full bg-slate-100 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {selectedIds.length > 0 && (
            <p className="text-xs text-slate-500">{selectedIds.length} member{selectedIds.length > 1 ? 's' : ''} selected</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <p className="text-sm text-slate-400 text-center py-6">Loading...</p>}

          {filteredUsers.map((u) => {
            const isSelected = selectedIds.includes(u.id);
            return (
              <button
                key={u.id}
                onClick={() => toggleUser(u.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {initials(u.fullName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{u.fullName}</p>
                  <p className="text-xs text-slate-400 truncate">{u.jobTitle || u.department || 'Employee'}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0
                  ${isSelected ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                  {isSelected && <Check size={13} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mx-4 mb-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full bg-primary text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {creating ? 'Creating...' : 'Create group'}
          </button>
        </div>
      </div>
    </div>
  );
}