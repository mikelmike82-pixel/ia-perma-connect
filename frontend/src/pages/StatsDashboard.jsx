import { useEffect, useState } from 'react';
import { Users, Circle, MessageSquare, UsersRound, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function StatsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const initials = (name) =>
    name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={26} />
      </div>
    );
  }

  const cards = [
    { label: 'Total employees', value: stats.totalEmployees, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Online now', value: stats.onlineUsers, icon: Circle, color: 'bg-accent/10 text-accent' },
    { label: "Today's messages", value: stats.todaysMessages, icon: MessageSquare, color: 'bg-secondary/10 text-secondary' },
    { label: 'Active groups', value: stats.activeGroups, icon: UsersRound, color: 'bg-primary/10 text-primary' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of IA PERMA CONNECT activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Recently joined</h3>
          <div className="space-y-3">
            {stats.recentEmployees.length === 0 && (
              <p className="text-sm text-slate-400">No employees yet</p>
            )}
            {stats.recentEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
                    {initials(emp.fullName)}
                  </div>
                  {emp.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-accent border-2 border-white"></span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{emp.fullName}</p>
                  <p className="text-xs text-slate-400 truncate">{emp.jobTitle || emp.department || 'Employee'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent files shared</h3>
          <div className="space-y-3">
            {stats.recentFiles.length === 0 && (
              <p className="text-sm text-slate-400">No files shared yet</p>
            )}
            {stats.recentFiles.map((file) => {
              const fileName = file.fileUrl ? file.fileUrl.split('/').pop() : '';
              const Icon = file.fileType === 'image' ? ImageIcon : FileText;
              return (
                <a
                  key={file.id}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700 truncate">{fileName}</p>
                    <p className="text-xs text-slate-400 truncate">Shared by {file.sender.fullName}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}