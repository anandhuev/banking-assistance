import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AppointmentBooking from './components/AppointmentBooking';
import StatusTracker from './components/StatusTracker';
import LoanAssistant from './components/LoanAssistant';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('bank_user'));
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeAppointment, setActiveAppointment] = useState<any>(() => {
    const saved = localStorage.getItem('active_appointment');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (name: string) => {
    setUser(name);
    localStorage.setItem('bank_user', name);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bank_user');
    localStorage.removeItem('active_appointment');
    setActiveAppointment(null);
  };

  const setAppointment = (app: any) => {
    setActiveAppointment(app);
    localStorage.setItem('active_appointment', JSON.stringify(app));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        <nav className="bg-blue-900 dark:bg-[#1e293b] text-white p-4 shadow-md flex justify-between items-center border-b border-blue-800 dark:border-slate-700">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <i className="fas fa-university text-2xl"></i>
            <span className="font-bold text-xl tracking-tight">SmartBank Assistant</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-blue-800 dark:hover:bg-slate-700 transition-colors"
            >
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
            </button>
            {user && (
              <>
                <span className="text-sm opacity-80 hidden sm:inline">Welcome, {user}</span>
                <button 
                  onClick={handleLogout}
                  className="bg-blue-800 dark:bg-slate-700 hover:bg-blue-700 dark:hover:bg-slate-600 px-3 py-1 rounded text-xs transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>

        <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/book/:serviceId" element={user ? <AppointmentBooking onBook={setAppointment} /> : <Navigate to="/login" replace />} />
            <Route path="/status" element={user ? <StatusTracker appointment={activeAppointment} setAppointment={setAppointment} /> : <Navigate to="/login" replace />} />
            <Route path="/loan-assistant" element={user ? <LoanAssistant /> : <Navigate to="/login" replace />} />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </main>

        <footer className="bg-white dark:bg-[#1e293b] border-t dark:border-slate-700 p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} SmartBank Advisory System. Demo purposes only.
        </footer>
      </div>
    </Router>
  );
};

export default App;