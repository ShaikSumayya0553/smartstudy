import React, { useState } from 'react';
import { Brain, TrendingUp, CheckCircle2, Sliders, RefreshCw, Zap } from 'lucide-react';
import { getPrediction } from '../api/axios';

export default function MLPredictorCard({ prediction, onRefresh }) {
  const [showSimulator, setShowSimulator] = useState(false);
  const [simHours, setSimHours] = useState(prediction?.study_hours || 25);
  const [simCompleted, setSimCompleted] = useState(prediction?.tasks_completed || 12);
  const [simRate, setSimRate] = useState(prediction?.completion_rate || 0.8);
  const [simScore, setSimScore] = useState(prediction?.avg_past_score || 80);
  const [simResult, setSimResult] = useState(null);
  const [loadingSim, setLoadingSim] = useState(false);

  const activePred = simResult || prediction || {
    predicted_score: 78.5,
    category: "On Track / Strong Progress",
    risk_level: "Low Risk",
    key_factors: [
      "High task completion rate is positively boosting your score.",
      "Logged study hours show steady consistency."
    ],

    actionable_tips: [
      "Review weak topics identified in your AI Study Plan.",
      "Take regular practice tests to maintain exam performance momentum."
    ]
  };

  const handleSimulate = async () => {
    setLoadingSim(true);
    try {
      const res = await getPrediction({
        study_hours: parseFloat(simHours),
        tasks_completed: parseInt(simCompleted),
        completion_rate: parseFloat(simRate),
        avg_past_score: parseFloat(simScore),
        days_studied: 10
      });
      setSimResult(res.data);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoadingSim(false);
    }
  };

  return (
    <div className="glass-card-glow rounded-2xl p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-rose-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/40">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              ML Exam Score Predictor
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
                Random Forest ML Model
              </span>
            </h3>
            <p className="text-xs text-gray-400">Supervised performance prediction based on study history analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimulator(!showSimulator)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-xs font-semibold text-rose-200 border border-rose-900/40 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            {showSimulator ? 'Close Simulator' : 'What-If Simulator'}
          </button>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 transition border border-rose-900/40"
              title="Refresh ML Inference"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Prediction Meter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Score Meter (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl bg-[#12060b]/80 border border-rose-950/80 text-center">
          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            {/* SVG Radial Arc */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-rose-950"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-rose-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${activePred.predicted_score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {activePred.predicted_score}%
              </span>
              <span className="text-[10px] uppercase font-bold text-rose-300/70 tracking-wider">Predicted Score</span>
            </div>
          </div>

          <div className="mt-2">
            <div className="text-sm font-bold text-rose-200">{activePred.category}</div>
            <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
              {activePred.risk_level}
            </div>
          </div>
        </div>

        {/* Feature Factors & Actionable Tips (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <h4 className="text-xs uppercase font-bold text-rose-300/80 tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              ML Key Drivers & Insights
            </h4>
            <div className="space-y-2">
              {activePred.key_factors?.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-200 bg-[#14070c]/80 p-2.5 rounded-xl border border-rose-950/80">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase font-bold text-rose-300/80 tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Recommended Action Plan
            </h4>
            <ul className="space-y-1.5">
              {activePred.actionable_tips?.map((tip, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* What-If Simulator Panel */}
      {showSimulator && (
        <div className="mt-6 pt-6 border-t border-rose-950 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              Interactive ML What-If Simulator
            </h4>
            <span className="text-xs text-gray-400">Test how changing study habits alters predicted exam score</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#12060b]/90 p-4 rounded-xl border border-rose-950 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Total Study Hours: {simHours}h</label>
              <input
                type="range"
                min="2"
                max="100"
                value={simHours}
                onChange={(e) => setSimHours(e.target.value)}
                className="w-full accent-rose-500 h-1.5 rounded bg-rose-950 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Tasks Completed: {simCompleted}</label>
              <input
                type="range"
                min="1"
                max="60"
                value={simCompleted}
                onChange={(e) => setSimCompleted(e.target.value)}
                className="w-full accent-rose-500 h-1.5 rounded bg-rose-950 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Completion Rate: {Math.round(simRate * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={simRate}
                onChange={(e) => setSimRate(e.target.value)}
                className="w-full accent-rose-500 h-1.5 rounded bg-rose-950 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Past Test Avg: {simScore}%</label>
              <input
                type="range"
                min="30"
                max="100"
                value={simScore}
                onChange={(e) => setSimScore(e.target.value)}
                className="w-full accent-rose-500 h-1.5 rounded bg-rose-950 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setSimResult(null)}
              className="px-3 py-1.5 rounded-xl bg-rose-950/60 text-xs text-rose-300 hover:bg-rose-900/60 border border-rose-900/40"
            >
              Reset Simulation
            </button>
            <button
              onClick={handleSimulate}
              disabled={loadingSim}
              className="gradient-btn px-4 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
            >
              {loadingSim ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
              Run Model Inference
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
