import React, { useState } from 'react';
import { Brain, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { loginUser, registerUser } from '../api/axios';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser({ email, password });
        const { access_token, user } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        onLoginSuccess(user);
      } else {
        const res = await registerUser({
          email,
          username,
          password,
          full_name: fullName || 'Student'
        });
        const { access_token, user } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        onLoginSuccess(user);
      }
    } catch (err) {
      console.error("Auth error:", err);
      const msg = err.response?.data?.detail || 'Authentication failed. Please check your credentials.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden glass-card border border-rose-900/30 shadow-2xl">
        {/* Left Info Panel (5 cols) */}
        <div className="md:col-span-5 p-8 bg-gradient-to-br from-[#1c0811] via-[#14060c] to-[#090305] flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-rose-950">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-900 via-rose-700 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-950/60">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight gradient-text">SmartStudy</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">AI-Powered Study Planner & ML Engine</h2>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Transform your preparation with personalized LLM study schedules and supervised ML performance predictions.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-rose-200">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>AI-Generated Subject Schedules & Recommendations</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-rose-200">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Scikit-Learn ML Model Exam Score Prediction</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-rose-200">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Subject-wise Progress & Time Analytics</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 text-[11px] text-gray-400 border-t border-rose-950/80 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Secure JWT Authentication & Encrypted Passwords
          </div>
        </div>

        {/* Right Form Panel (7 cols) */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center">
          {/* Tab buttons */}
          <div className="flex items-center justify-center p-1.5 bg-[#12060b]/90 rounded-xl border border-rose-950 mb-6">
            <button
              onClick={() => { setIsLogin(true); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                isLogin ? 'bg-rose-900 text-white shadow border border-rose-700/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                !isLogin ? 'bg-rose-900 text-white shadow border border-rose-700/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-rose-400/60 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#12060b]/90 border border-rose-950 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-rose-400/60 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="alex_m"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#12060b]/90 border border-rose-950 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                {isLogin ? 'Email or Username' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-rose-400/60 absolute left-3 top-3" />
                <input
                  type={isLogin ? "text" : "email"}
                  placeholder={isLogin ? "alex@example.com or alex_m" : "alex@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#12060b]/90 border border-rose-950 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-rose-400/60 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#12060b]/90 border border-rose-950 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gradient-btn w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-2 shadow-lg shadow-rose-950/50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In to SmartStudy' : 'Create Student Account')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
