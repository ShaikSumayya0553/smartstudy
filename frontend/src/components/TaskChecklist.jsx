import React, { useState } from 'react';
import { CheckSquare, Plus, Clock, Sparkles, Trash2, CheckCircle2, Filter } from 'lucide-react';
import { updateTask, deleteTask, createTask } from '../api/axios';

export default function TaskChecklist({ tasks, onTaskUpdated, onOpenLogModal }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newSubj, setNewSubj] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDuration, setNewDuration] = useState(60);
  const [newPriority, setNewPriority] = useState('Medium');

  const handleToggleComplete = async (task) => {
    try {
      const newStatus = !task.completed;
      await updateTask(task.id, {
        completed: newStatus,
        hours_logged: newStatus ? (task.duration_minutes / 60.0) : task.hours_logged
      });
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newSubj || !newTopic) return;

    try {
      await createTask({
        subject: newSubj,
        topic: newTopic,
        duration_minutes: parseInt(newDuration),
        priority: newPriority,
        recommendation: "Custom student task logged for focus review."
      });
      setShowAddModal(false);
      setNewSubj('');
      setNewTopic('');
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const subjectsList = Array.from(new Set(tasks.map(t => t.subject)));

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (selectedSubject !== 'all' && t.subject !== selectedSubject) return false;
    return true;
  });

  const getPriorityBadge = (priority) => {
    if (priority === 'High') return 'bg-rose-950 text-rose-300 border-rose-800/60';
    if (priority === 'Medium') return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
    return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/40">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Study Tasks & Daily Checklist
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-900/60">
                {tasks.filter(t => t.completed).length}/{tasks.length} Completed
              </span>
            </h3>
            <p className="text-xs text-gray-400">Mark off completed topics & record actual study hours</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenLogModal && (
            <button
              onClick={onOpenLogModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 text-xs font-bold transition"
            >
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              Log Session
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="gradient-btn px-3.5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-xl bg-[#12060b]/80 border border-rose-950">
        <div className="flex items-center gap-1 bg-rose-950/40 p-1 rounded-lg border border-rose-950">
          {['all', 'pending', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition ${
                filterStatus === status ? 'bg-rose-900 text-white shadow border border-rose-700/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {subjectsList.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-rose-950/60 text-xs text-rose-200 border border-rose-900/60 rounded-lg px-2.5 py-1 focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Subjects ({tasks.length})</option>
              {subjectsList.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-[#12060b]/40 rounded-xl border border-dashed border-rose-950">
          <CheckCircle2 className="w-10 h-10 text-rose-900 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-400">No tasks found matching your filter</p>
          <p className="text-xs text-gray-500 mt-1">Generate an AI Study Plan or add custom study tasks to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-xl border transition-all ${
                t.completed
                  ? 'bg-[#12060b]/30 border-rose-950/60 opacity-75'
                  : 'bg-[#12060b]/80 border-rose-950 hover:border-rose-700/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => handleToggleComplete(t)}
                    className="mt-1 w-4 h-4 rounded accent-rose-600 cursor-pointer border-rose-900 bg-rose-950"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm ${t.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {t.topic}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/40">
                        {t.subject}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>

                    {t.recommendation && (
                      <div className="mt-2 text-xs text-gray-300 flex items-start gap-1.5 bg-[#090305]/60 p-2.5 rounded-lg border border-rose-950">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{t.recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-300 flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      {t.duration_minutes}m target
                    </div>
                    {t.hours_logged > 0 && (
                      <div className="text-[10px] text-emerald-400 font-bold">
                        {t.hours_logged}h logged
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 relative border border-rose-900/40">
            <h3 className="text-lg font-bold text-white mb-4">Add Custom Study Task</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={newSubj}
                  onChange={(e) => setNewSubj(e.target.value)}
                  className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Topic / Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Graph Algorithms & Shortest Path"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-rose-950/40 border border-rose-900/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-rose-950/60 text-xs font-bold text-rose-300 hover:bg-rose-900/60 border border-rose-900/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-btn px-5 py-2 rounded-xl text-xs font-bold text-white"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
