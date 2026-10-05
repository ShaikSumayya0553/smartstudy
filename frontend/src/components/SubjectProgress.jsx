import React from 'react';
import { BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SubjectProgress({ subjectProgress }) {
  const data = subjectProgress && subjectProgress.length > 0 ? subjectProgress : [
    { subject: 'Mathematics', completion_percentage: 80, hours_logged: 12.5, completed_tasks: 4, total_tasks: 5 },
    { subject: 'Physics', completion_percentage: 60, hours_logged: 8.0, completed_tasks: 3, total_tasks: 5 },
    { subject: 'Computer Science', completion_percentage: 90, hours_logged: 16.0, completed_tasks: 9, total_tasks: 10 },
  ];

  const colors = ['#be123c', '#9f1239', '#e11d48', '#f43f5e', '#fb7185', '#fda4af'];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/40">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Subject-Wise Analytics</h3>
            <p className="text-xs text-gray-400">Track task completion & logged study hours by subject</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-44 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18070d', borderColor: '#4c0519', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#fb7185' }}
              formatter={(value) => [`${value}% Completed`, 'Completion']}
            />
            <Bar dataKey="completion_percentage" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((subj, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-[#12060b]/80 border border-rose-950 flex flex-col justify-between hover:border-rose-700/50 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-white flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                {subj.subject}
              </span>
              <span className="text-xs font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/40">
                {subj.completion_percentage}%
              </span>
            </div>

            <div className="w-full bg-rose-950/40 h-2 rounded-full overflow-hidden mb-3 border border-rose-950">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${subj.completion_percentage}%`,
                  backgroundColor: colors[idx % colors.length]
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-rose-950/60">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                {subj.completed_tasks}/{subj.total_tasks} Tasks
              </span>
              <span className="flex items-center gap-1 text-rose-200/80">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                {subj.hours_logged}h logged
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
