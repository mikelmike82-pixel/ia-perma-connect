import { useEffect, useState } from 'react';
import { Megaphone, Plus, X, Trash2, Loader2, Paperclip } from 'lucide-react';
import api from '../api/axios';
import socket from '../socket/socket';
import { useAuth } from '../context/AuthContext';

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchAnnouncements = () => {
    api.get('/announcements')
      .then((res) => setAnnouncements(res.data.announcements))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();

    const handleNew = (announcement) => {
      setAnnouncements((prev) => [announcement, ...prev]);
    };
    socket.on('newAnnouncement', handleNew);
    return () => socket.off('newAnnouncement', handleNew);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const initials = (name) =>
    name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone size={20} className="text-primary" /> Announcements
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Company-wide updates from leadership</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus size={16} /> New announcement
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-slate-400 text-center py-10">Loading...</p>}

      {!loading && announcements.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Megaphone size={32} className="mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm">No announcements yet</p>
        </div>
      )}

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {initials(a.author.fullName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{a.author.fullName}</p>
                  <p className="text-xs text-slate-400">
                    {a.author.jobTitle || 'Admin'} · {new Date(a.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {user?.role === 'ADMIN' && (
                <button onClick={() => handleDelete(a.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <h3 className="font-semibold text-slate-900 mb-1.5">{a.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{a.content}</p>

            {a.fileType === 'image' && (
              <img
                src={`{import.meta.env.VITE_SOCKET_URL}${a.fileUrl}`}
                alt="Attachment"
                className="mt-3 rounded-xl max-h-80 object-cover border border-slate-200"
              />
            )}
            {a.fileType === 'document' && (
              <a
                href={msg.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Paperclip size={14} />
                View attached file
              </a>
            )}
          </div>
        ))}
      </div>

{showForm && (
        <NewAnnouncementForm
          onClose={() => setShowForm(false)}
          onCreated={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function NewAnnouncementForm({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setPosting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (file) formData.append('file', file);

    try {
      const res = await api.post('/announcements', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onCreated(res.data.announcement);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">New announcement</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="w-full bg-slate-100 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your announcement..."
            rows={5}
            className="w-full bg-slate-100 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <div>
            <label className="text-sm text-primary font-medium cursor-pointer hover:underline">
              {file ? file.name : 'Attach an image or document (optional)'}
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3.5 py-2.5">{error}</div>
          )}

          <button
            type="submit"
            disabled={posting}
            className="w-full bg-primary text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {posting && <Loader2 size={16} className="animate-spin" />}
            {posting ? 'Posting...' : 'Post announcement'}
          </button>
        </form>
      </div>
    </div>
  );
}