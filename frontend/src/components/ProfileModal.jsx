import React, { useState, useEffect } from 'react';
import { User, BookOpen, Calendar, Clock, Award, Plus, Trash2, X, Check } from 'lucide-react';
import { saveProfile } from '../api/axios';

export default function ProfileModal({ isOpen, onClose, currentProfile, onProfileSaved }) {
  const [subjects, setSubjects] = useState([
    { subject: 'Mathematics', level: 'Intermediate' },
    { subject: 'Computer Science', level: 'Advanced' }
  ]);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjLevel, setNewSubjLevel] = useState('Intermediate');
  const [availableHours, setAvailableHours] = useState(4.0);
  const [examDate, setExamDate] = useState('2026-11-15');
  const [targetScore, setTargetScore] = useState(85);
  const [learningStyle, setLearningStyle] = useState('Visual & Practical');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      if (currentProfile.subjects && currentProfile.subjects.length > 0) {
        setSubjects(currentProfile.subjects);
      }
      if (currentProfile.available_hours_per_day) setAvailableHours(currentProfile.available_hours_per_day);
      if (currentProfile.exam_date) setExamDate(currentProfile.exam_date);
      if (currentProfile.target_score) setTargetScore(currentProfile.target_score);
      if (currentProfile.learning_style) setLearningStyle(currentProfile.learning_style);
    }
  }, [currentProfile]);

  if (!isOpen) return null;

  const handleAddSubject = () => {
    if (!newSubjName.trim()) return;
    setSubjects([...subjects, { subject: newSubjName.trim(), level: newSubjLevel }]);
    setNewSubjName('');
  };

  const handleRemoveSubject = (index) => {
    setSubjects(subjects.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (subjects.length === 0) return;
    setLoading(true);
    try {
      const res = await saveProfile({
        subjects,
        available_hours_per_day: parseFloat(availableHours),
        exam_date: examDate,
        target_score: parseFloat(targetScore),
        learning_style: learningStyle
      });
      onClose();
      if (onProfileSaved) onProfileSaved(res.data);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full rounded-2xl p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto border border-rose-900/40">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/40">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Study Profile Settings</h3>
            <p className="text-xs text-gray-400">Configure your subjects, skill levels & exam timelines</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subjects Manager */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">Subjects & Skill Levels</label>
            <div className="space-y-2 mb-3">
              {subjects.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#12060b]/80 border border-rose-950">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-rose-400" />
                    <span className="text-sm font-semibold text-white">{item.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      item.level === 'Beginner' ? 'bg-amber-950/80 text-amber-300 border-amber-800/60' :
                      item.level === 'Intermediate' ? 'bg-rose-950 text-rose-300 border-rose-800/60' :
                      'bg-rose-900 text-rose-200 border-rose-700/60'
                    }`}>
                      {item.level}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(idx)}
                      className="text-gray-500 hover:text-rose-400 p-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add subject (e.g. Organic Chemistry)"
                value={newSubjName}
                onChange={(e) => setNewSubjName(e.target.value)}
                className="flex-1 bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <select
                value={newSubjLevel}
                onChange={(e) => setNewSubjLevel(e.target.value)}
                className="bg-rose-950/40 border border-rose-900/60 rounded-xl px-2.5 py-1.5 text-xs text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-1.5 rounded-xl bg-rose-900 hover:bg-rose-800 text-xs font-bold text-white flex items-center gap-1 border border-rose-700/50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Time & Target Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                Daily Study Hours: {availableHours}h
              </label>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
                className="w-full accent-rose-500 h-1.5 rounded bg-rose-950 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                Target Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Target Score (%): {targetScore}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full accent-rose-500 h-1.5 rounded bg-rose-950 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Learning Style</label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Visual & Practical">Visual & Practical</option>
                <option value="Active Recall & Quiz">Active Recall & Quiz</option>
                <option value="Theory & Deep Reading">Theory & Deep Reading</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-rose-950">
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
              className="gradient-btn px-6 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
