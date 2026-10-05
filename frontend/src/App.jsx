import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import AIPlanView from './components/AIPlanView';
import TaskChecklist from './components/TaskChecklist';
import MLPredictorCard from './components/MLPredictorCard';
import ProfileModal from './components/ProfileModal';
import LogSessionModal from './components/LogSessionModal';
import { getMe, getDashboardData, getLatestStudyPlan, getTasks, getPrediction } from './api/axios';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingUser, setLoadingUser] = useState(true);

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [prediction, setPrediction] = useState(null);

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Initialize auth user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => {
          setUser(res.data);
          loadAllData();
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoadingUser(false));
    } else {
      setLoadingUser(false);
    }
  }, []);

  const loadAllData = async () => {
    try {
      const dashRes = await getDashboardData();
      setDashboardData(dashRes.data);
      if (dashRes.data.latest_prediction) {
        setPrediction(dashRes.data.latest_prediction);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }

    try {
      const planRes = await getLatestStudyPlan();
      setStudyPlan(planRes.data);
    } catch (err) {
      // Plan might not exist yet
    }

    try {
      const tasksRes = await getTasks();
      setTasks(tasksRes.data);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    loadAllData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDashboardData(null);
    setStudyPlan(null);
    setTasks([]);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white">
        <div className="text-sm font-semibold tracking-wider animate-pulse">Initializing SmartStudy App...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            dashboardData={dashboardData}
            onRefresh={loadAllData}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenLogModal={() => setIsLogModalOpen(true)}
            onNavigatePlan={() => setActiveTab('plan')}
          />
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">All Study Tasks & Checklist</h2>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="gradient-btn px-4 py-2 rounded-xl text-xs font-bold text-white"
              >
                Log Study Session
              </button>
            </div>
            <TaskChecklist
              tasks={tasks}
              onTaskUpdated={loadAllData}
              onOpenLogModal={() => setIsLogModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'plan' && (
          <AIPlanView
            plan={studyPlan}
            onPlanGenerated={loadAllData}
          />
        )}

        {activeTab === 'predictor' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Machine Learning Exam Predictor</h2>
                <p className="text-xs text-gray-400">Scikit-learn model inference & what-if study habit simulator</p>
              </div>
            </div>
            <MLPredictorCard
              prediction={prediction || dashboardData?.latest_prediction}
              onRefresh={loadAllData}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={dashboardData?.user_profile}
        onProfileSaved={() => {
          loadAllData();
          setIsProfileModalOpen(false);
        }}
      />

      <LogSessionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        subjects={dashboardData?.user_profile?.subjects}
        onLogged={(newPred) => {
          if (newPred) setPrediction(newPred);
          loadAllData();
        }}
      />
    </div>
  );
}
