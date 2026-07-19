import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Upload } from 'lucide-react';
import api from '../api/axios';

const departments = ['Software Engineering', 'Design', 'Product', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations'];

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    department: '',
    jobTitle: '',
    employeeId: '',
    gender: '',
    dateOfBirth: '',
    bio: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/images/logo.png"
              alt="IA PERMA"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
            <span className="hidden w-full h-full items-center justify-center text-white font-bold text-sm">IA</span>
          </div>
          <div>
            <p className="font-semibold text-secondary leading-tight">IA PERMA CONNECT</p>
            <p className="text-slate-400 text-xs leading-tight">Employee registration</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
        <p className="text-slate-500 text-sm mb-8">Fill in your details to join the company workspace.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile photo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Upload size={20} className="text-slate-400" />
              )}
            </div>
            <label className="cursor-pointer">
              <span className="text-sm font-medium text-primary hover:underline">Upload profile photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <p className="text-xs text-slate-400 mt-0.5">Optional — you can add this later</p>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name" name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Ahmed Khan" />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@iaperma.com" />
            <Field label="Phone number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="03001234567" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
              >
                <option value="">Select department</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <Field label="Job title" name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="Backend Developer" />
            <Field label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="IAP-001" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Field label="Date of birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="A short line about yourself..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3.5 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      />
    </div>
  );
}