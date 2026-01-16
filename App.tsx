import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AppointmentBooking from './components/AppointmentBooking';
import StatusTracker from './components/StatusTracker';
import { Appointment, ServiceType } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('bank_user'));
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(() => {
    const saved = localStorage.getItem('active_appointment');
    return saved ? JSON.parse(saved) : null;
  });

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

  const setAppointment = (app: Appointment) => {
    setActiveAppointment(app);
    localStorage.setItem('active_appointment', JSON.stringify(app));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {user && (
          <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
              aria-label="SmartBank Dashboard"
            >
              <i className="fas fa-university text-2xl"></i>
              <span className="font-bold text-xl tracking-tight">SmartBank Assistant</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm opacity-80">Welcome, {user}</span>
              <button 
                onClick={handleLogout}
                className="bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded text-xs transition-colors"
              >
                Logout
              </button>
            </div>
          </nav>
        )}

        <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/book/:serviceId" element={user ? <AppointmentBooking onBook={setAppointment} /> : <Navigate to="/login" />} />
            <Route path="/status" element={user ? <StatusTracker appointment={activeAppointment} setAppointment={setAppointment} /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>

        <footer className="bg-white border-t p-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SmartBank Advisory System. Demo purposes only.
        </footer>
      </div>
    </Router>
  );
};

export default App;
