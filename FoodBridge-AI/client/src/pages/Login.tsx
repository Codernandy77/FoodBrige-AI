import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      // Route based on role
      switch (user.role) {
        case 'DONOR': navigate('/donor-dashboard'); break;
        case 'NGO': navigate('/ngo-dashboard'); break;
        case 'VOLUNTEER': navigate('/volunteer-dashboard'); break;
        case 'ADMIN': navigate('/admin-dashboard'); break;
        default: navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoRole: 'donor' | 'ngo' | 'volunteer' | 'admin') => {
    const demoEmail = `${demoRole}@foodbridge.demo`;
    const demoPass = 'password123';
    
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      const user = await login(demoEmail, demoPass);
      switch (user.role) {
        case 'DONOR': navigate('/donor-dashboard'); break;
        case 'NGO': navigate('/ngo-dashboard'); break;
        case 'VOLUNTEER': navigate('/volunteer-dashboard'); break;
        case 'ADMIN': navigate('/admin-dashboard'); break;
        default: navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Demo credentials seeding issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-slate-100">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-3xl">🤝</span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-3">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Log in to coordinate food rescuing operations</p>
        </div>

        {/* Error panel */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 rounded text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 rounded-lg shadow transition-all flex justify-center items-center gap-2 text-sm"
          >
            {loading ? 'Logging in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Accounts Panel */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center mb-3">
            Demo Mode - Quick Fill Accounts
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              onClick={() => handleQuickLogin('donor')}
              className="py-2 border border-emerald-100 hover:bg-emerald-50 text-emerald-800 font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              🏢 Donor
            </button>
            <button
              onClick={() => handleQuickLogin('ngo')}
              className="py-2 border border-blue-100 hover:bg-blue-50 text-blue-800 font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              🏠 NGO (Karunai)
            </button>
            <button
              onClick={() => handleQuickLogin('volunteer')}
              className="py-2 border border-purple-100 hover:bg-purple-50 text-purple-800 font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              🛵 Volunteer
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="py-2 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              🛡️ Admin
            </button>
          </div>
          <p className="text-[9px] text-slate-400 text-center mt-2 italic">Password is password123</p>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
};
