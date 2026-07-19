import { MessageSquare, Users, Megaphone, LayoutDashboard, Settings, LogOut, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard' },
  { icon: MessageSquare, label: 'Chats' },
  { icon: Users, label: 'Groups' },
  { icon: Megaphone, label: 'Announcements' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const routeMap = {
    Dashboard: '/dashboard',
    Chats: '/chats',
    Groups: '/chats',
    Announcements: '/announcements',
  };

  const activeMap = {
    '/dashboard': 'Dashboard',
    '/chats': 'Chats',
    '/announcements': 'Announcements',
  };

  const active = activeMap[location.pathname] || 'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className="hidden sm:flex h-screen w-20 lg:w-64 bg-secondary flex-col justify-between py-6 shrink-0">
        {/* Logo area */}
        <div>
          <div className="flex items-center gap-3 px-4 lg:px-6 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src="/images/logo.png"
                alt="IA PERMA"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
              />
              <span className="hidden w-full h-full items-center justify-center text-white font-bold text-sm">IA</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-white font-semibold text-sm leading-tight">IA PERMA</p>
              <p className="text-slate-400 text-xs leading-tight">CONNECT</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 px-3 lg:px-4">
            {navItems.map(({ icon: Icon, label }) => {
              const isActive = active === label;
              return (
                <button
                  key={label}
                  onClick={() => navigate(routeMap[label])}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-primary text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon size={19} strokeWidth={2} />
                  <span className="hidden lg:inline">{label}</span>
                </button>
              );
            })}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === '/admin'
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Shield size={19} strokeWidth={2} />
                <span className="hidden lg:inline">Admin Panel</span>
              </button>
            )}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-1 px-3 lg:px-4">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            <Settings size={19} />
            <span className="hidden lg:inline">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors"
          >
            <LogOut size={19} />
            <span className="hidden lg:inline">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-secondary flex items-center justify-around py-2.5 z-40 border-t border-white/10">
        {navItems.map(({ icon: Icon, label }) => {
          const isActive = active === label;
          return (
            <button
              key={label}
              onClick={() => navigate(routeMap[label])}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors
                ${isActive ? 'text-primary' : 'text-slate-400'}`}
            >
              <Icon size={20} />
            </button>
          );
        })}
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => navigate('/admin')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors
              ${location.pathname === '/admin' ? 'text-primary' : 'text-slate-400'}`}
          >
            <Shield size={20} />
          </button>
        )}
      </nav>
    </>
  );
}