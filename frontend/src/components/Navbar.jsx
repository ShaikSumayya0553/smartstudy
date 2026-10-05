import React from 'react';
import { Sparkles, Brain, CheckSquare, BarChart3, User, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout, onOpenProfile }) {
  return (
    <nav className="glass-nav sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-900 via-rose-700 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-900/40">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-xl tracking-tight gradient-text">SmartStudy</span>
          <span className="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-950/80 text-rose-300 border border-rose-800/60 rounded-full">
            AI + ML
          </span>
        </div>
      </div>

      {/* Navigation tabs */}
      {user && (
        <div className="hidden md:flex items-center gap-1 bg-[#12070b]/80 p-1.5 rounded-xl border border-rose-950/60">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-rose-900 text-white shadow-md shadow-rose-900/40 border border-rose-700/50'
                : 'text-gray-400 hover:text-white hover:bg-rose-950/40'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-rose-400" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-rose-900 text-white shadow-md shadow-rose-900/40 border border-rose-700/50'
                : 'text-gray-400 hover:text-white hover:bg-rose-950/40'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-rose-400" />
            Study Tasks
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'plan'
                ? 'bg-rose-900 text-white shadow-md shadow-rose-900/40 border border-rose-700/50'
                : 'text-gray-400 hover:text-white hover:bg-rose-950/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
            AI Study Plan
          </button>

          <button
            onClick={() => setActiveTab('predictor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'predictor'
                ? 'bg-rose-900 text-white shadow-md shadow-rose-900/40 border border-rose-700/50'
                : 'text-gray-400 hover:text-white hover:bg-rose-950/40'
            }`}
          >
            <Brain className="w-4 h-4 text-rose-400" />
            ML Predictor
          </button>
        </div>
      )}

      {/* User Actions */}
      {user ? (
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/50 border border-rose-900/40 text-xs font-semibold text-rose-200 transition"
          >
            <User className="w-4 h-4 text-rose-400" />
            <span>{user.full_name || user.username}</span>
          </button>
          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-900/30 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-xs font-semibold text-rose-300/80">
          Personalized AI & ML Study Engine
        </div>
      )}
    </nav>
  );
}
