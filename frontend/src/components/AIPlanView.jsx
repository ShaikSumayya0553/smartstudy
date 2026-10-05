import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, BookOpen, RefreshCw, Zap, Lightbulb } from 'lucide-react';
import { generateStudyPlan } from '../api/axios';

export default function AIPlanView({ plan, onPlanGenerated }) {
  const [loading, setLoading] = useState(false);
  const [focusAreas, setFocusAreas] = useState('');
  const [showReGenerateModal, setShowReGenerateModal] = useState(false);

  const handleGenerateNewPlan = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await generateStudyPlan({ focus_areas: focusAreas });
      setShowReGenerateModal(false);
      if (onPlanGenerated) onPlanGenerated();
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center border border-rose-950">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-800/40 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No AI Study Plan Generated Yet</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
          Connect your study profile parameters to our LLM Engine to generate a structured, personalized schedule tailored to your exam date.
        </p>
        <button
          onClick={() => handleGenerateNewPlan()}
          disabled={loading}
          className="gradient-btn px-6 py-3 rounded-xl font-bold text-white inline-flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-rose-200" />}
          Generate Personalized AI Plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card-glow rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">AI Personalized Study Blueprint</h2>
              <p className="text-xs text-gray-400">Structured schedule optimized for duration, difficulty & exam date</p>
            </div>
          </div>

          <button
            onClick={() => setShowReGenerateModal(true)}
            disabled={loading}
            className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate AI Plan
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[#12060b]/80 border border-rose-950 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-rose-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-300/70">Days Remaining</div>
              <div className="text-lg font-bold text-white">{plan.days_remaining} Days</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#12060b]/80 border border-rose-950 flex items-center gap-3">
            <Clock className="w-5 h-5 text-rose-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-300/70">Planned Hours</div>
              <div className="text-lg font-bold text-white">{plan.total_study_hours_planned} Hours</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#12060b]/80 border border-rose-950 flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-rose-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-300/70">Target Topics</div>
              <div className="text-lg font-bold text-white">{plan.tasks?.length || 0} Modules</div>
            </div>
          </div>
        </div>

        {/* AI Strategy Overview Box */}
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40">
          <div className="flex items-center gap-2 mb-2 text-rose-300 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            AI Overall Strategic Directive
          </div>
          <p className="text-xs text-rose-100/90 leading-relaxed">
            {plan.ai_overall_strategy}
          </p>
        </div>
      </div>

      {/* Structured Plan Table / Cards */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Structured Module Schedule & Recommendations
        </h3>

        <div className="space-y-4">
          {plan.tasks?.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#12060b]/80 border border-rose-950 hover:border-rose-700/40 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-sm text-white">{item.topic}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800/40">
                    {item.subject}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    item.priority === 'High' ? 'bg-rose-950 text-rose-300 border-rose-800/60' :
                    item.priority === 'Medium' ? 'bg-amber-950/80 text-amber-300 border-amber-800/60' :
                    'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                  }`}>
                    {item.priority} Priority
                  </span>
                </div>

                <div className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  {item.duration_minutes} Minutes ({roundTime(item.duration_minutes)}h)
                </div>
              </div>

              {item.recommendation && (
                <div className="mt-2 text-xs text-gray-300 bg-[#090305]/60 p-3 rounded-lg border border-rose-950 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-rose-300">AI Recommendation: </span>
                    {item.recommendation}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Re-Generating Plan with Custom Focus */}
      {showReGenerateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 relative border border-rose-900/40">
            <h3 className="text-lg font-bold text-white mb-2">Customize AI Plan Focus</h3>
            <p className="text-xs text-gray-400 mb-4">Specify custom topics or exam revision focus areas for the AI generator.</p>

            <form onSubmit={handleGenerateNewPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Focus Areas / Special Topics</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Dynamic Programming, Integration by Parts, Neural Networks"
                  value={focusAreas}
                  onChange={(e) => setFocusAreas(e.target.value)}
                  className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReGenerateModal(false)}
                  className="px-4 py-2 rounded-xl bg-rose-950/60 text-xs font-bold text-rose-300 hover:bg-rose-900/60 border border-rose-900/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-rose-200" />}
                  Generate New Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function roundTime(mins) {
  return (mins / 60.0).toFixed(1);
}
