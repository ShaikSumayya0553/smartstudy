import React, { useState } from 'react';
import { Clock, Check, X, RefreshCw } from 'lucide-react';
import { logPerformanceScore } from '../api/axios';

export default function LogSessionModal({ isOpen, onClose, subjects, onLogged }) {
  const [subject, setSubject] = useState(subjects && subjects.length > 0 ? subjects[0].subject : 'General');
  const [hoursSpent, setHoursSpent] = useState(1.5);
  const [tasksCompleted, setTasksCompleted] = useState(2);
  const [testScore, setTestScore] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await logPerformanceScore({
        subject,
        hours_spent: parseFloat(hoursSpent),
        tasks_completed: parseInt(tasksCompleted),
        test_score: testScore ? parseFloat(testScore) : null,
        notes
      });
      setSuccessMsg('Session recorded & ML Model updated!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        if (onLogged) onLogged(res.data.new_prediction);
      }, 1200);
    } catch (err) {
      console.error("Failed to log session:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full rounded-2xl p-6 relative animate-fadeIn border border-rose-900/40">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/40">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Log Study Session & Test Score</h3>
            <p className="text-xs text-gray-400">Record your actual effort to feed the ML prediction engine</p>
          </div>
        </div>

        {successMsg ? (
          <div className="p-4 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-800/60 text-center font-bold text-sm my-6 flex items-center justify-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                {subjects && subjects.length > 0 ? (
                  subjects.map((s, idx) => (
                    <option key={idx} value={s.subject}>{s.subject}</option>
                  ))
                ) : (
                  <>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Computer Science">Computer Science</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Hours Spent</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={hoursSpent}
                  onChange={(e) => setHoursSpent(e.target.value)}
                  className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tasks Completed</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={tasksCompleted}
                  onChange={(e) => setTasksCompleted(e.target.value)}
                  className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Test / Quiz Score % (Optional)</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 88 (Leave blank if no test taken)"
                value={testScore}
                onChange={(e) => setTestScore(e.target.value)}
                className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Session Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Solved 10 calculus integration problems"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-rose-950">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-rose-950/60 text-xs font-bold text-rose-300 hover:bg-rose-900/60 border border-rose-900/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                Save Log & Update ML Model
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
