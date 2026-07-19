import { useState } from 'react';
import { Search, Bell, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 relative">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          type="text"
          placeholder="Search people, chats, files..."
          className="w-full bg-slate-100 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={19} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 sm:border-l border-slate-200"
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-800 leading-tight">{user?.fullName}</p>
              <p className="text-xs text-slate-400 leading-tight">{user?.jobTitle || user?.department || 'Employee'}</p>
            </div>
            <ChevronDown size={15} className="text-slate-400 hidden sm:block" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-52 z-40">
                <div className="px-4 py-2.5 border-b border-slate-100 sm:hidden">
                  <p className="text-sm font-medium text-slate-800 truncate">{user?.fullName}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.jobTitle || user?.department || 'Employee'}</p>
                </div>
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings size={15} /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}