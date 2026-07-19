import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-center px-6">
      <AlertCircle size={40} className="text-slate-300 mb-4" strokeWidth={1.5} />
      <h1 className="text-xl font-bold text-slate-900 mb-1">Page not found</h1>
      <p className="text-sm text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="text-sm text-primary font-medium hover:underline">
        Go back to dashboard
      </Link>
    </div>
  );
}