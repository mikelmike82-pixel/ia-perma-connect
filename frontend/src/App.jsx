import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StatsDashboard from './pages/StatsDashboard';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import Announcements from './pages/Announcements';
import ProtectedRoute from './components/ProtectedRoute';

function DashboardShell({ children }) {
  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 pb-20 sm:pb-6">{children}</main>
      </div>
    </div>
  );
}
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
<Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardShell><StatsDashboard /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chats"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <DashboardShell><Announcements /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardShell><AdminPanel /></DashboardShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


export default App;