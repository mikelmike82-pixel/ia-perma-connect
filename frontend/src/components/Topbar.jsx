import { Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user } = useAuth();

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          type="text"
          placeholder="Search people, chats, files..."
          className="w-full bg-slate-100 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={19} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent"></span>
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">{user?.fullName}</p>
            <p className="text-xs text-slate-400 leading-tight">{user?.jobTitle || user?.department || 'Employee'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}