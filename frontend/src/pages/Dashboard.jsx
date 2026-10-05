import React from 'react';
import { CheckSquare, Clock, Award, Sparkles, TrendingUp, User, RefreshCw } from 'lucide-react';
import MLPredictorCard from '../components/MLPredictorCard';
import SubjectProgress from '../components/SubjectProgress';
import TaskChecklist from '../components/TaskChecklist';

export default function Dashboard({
  dashboardData,
  onRefresh,
  onOpenProfile,
  onOpenLogModal,
  onNavigatePlan
}) {
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm font-semibold text-gray-400">Loading SmartStudy Analytics...</p>
        </div>
      </div>
    );
  }

  const {
    user_profile,
    total_tasks,
    completed_tasks,
    completion_rate,
    total_hours_logged,
    avg_test_score,
    subject_progress,
    latest_prediction,
    recent_tasks
  } = dashboardData;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-rose-950">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Welcome back, <span className="gradient-text">Student</span>!
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {user_profile ? `Target Exam: ${user_profile.exam_date} | Available Study Time: ${user_profile.available_hours_per_day}h/day` : 'Configure your study profile to get personalized AI study plans.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-xs font-bold text-rose-200 border border-rose-900/40 transition"
          >
            <User className="w-3.5 h-3.5 text-rose-400" />
            Study Profile
          </button>

          <button
            onClick={onOpenLogModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 text-xs font-bold transition"
          >
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            Log Session
          </button>

          <button
            onClick={onNavigatePlan}
            className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-rose-950/50"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
            AI Study Plan
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-card border border-rose-950 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/40">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-300/70">Tasks Completed</div>
            <div className="text-xl font-extrabold text-white">{completed_tasks} / {total_tasks}</div>
            <div className="text-[10px] text-rose-400 font-semibold">{completion_rate}% rate</div>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-rose-950 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/40">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-300/70">Study Hours Logged</div>
            <div className="text-xl font-extrabold text-white">{total_hours_logged} hrs</div>
            <div className="text-[10px] text-rose-400 font-semibold">Tracked history</div>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-rose-950 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-rose-950/80 text-amber-400 border border-rose-800/40">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-300/70">Past Test Avg</div>
            <div className="text-xl font-extrabold text-white">{avg_test_score}%</div>
            <div className="text-[10px] text-amber-400 font-semibold">Assessment baseline</div>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-card border border-rose-950 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-rose-950/80 text-emerald-400 border border-rose-800/40">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-rose-300/70">ML Predicted Score</div>
            <div className="text-xl font-extrabold text-rose-400">
              {latest_prediction?.predicted_score || 78}%
            </div>
            <div className="text-[10px] text-rose-300 font-semibold">RandomForest Model</div>
          </div>
        </div>
      </div>

      {/* ML Performance Predictor Card */}
      <MLPredictorCard prediction={latest_prediction} onRefresh={onRefresh} />

      {/* Subject-Wise Analytics */}
      <SubjectProgress subjectProgress={subject_progress} />

      {/* Task Checklist */}
      <TaskChecklist
        tasks={recent_tasks}
        onTaskUpdated={onRefresh}
        onOpenLogModal={onOpenLogModal}
      />
    </div>
  );
}
