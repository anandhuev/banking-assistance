import React, { useState, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AppointmentBooking from './components/AppointmentBooking';
import StatusTracker from './components/StatusTracker';
import AppointmentsList from './components/AppointmentsList';
import { Appointment } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(localStorage.getItem('bank_user'));
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('bank_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const activeAppointment = useMemo(() => 
    appointments.find(a => a.status !== 'Completed' && a.status !== 'Cancelled') || null
  , [appointments]);

  const handleLogin = (name: string) => {
    setUser(name);
    localStorage.setItem('bank_user', name);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bank_user');
    localStorage.removeItem('bank_appointments');
    setAppointments([]);
  };

  const setAppointment = (app: Appointment | null) => {
    if (!app) {
      setAppointments(prev => {
        const lastActiveIdx = prev.findLastIndex(a => a.status !== 'Completed' && a.status !== 'Cancelled');
        if (lastActiveIdx !== -1) {
          const updated = [...prev];
          updated[lastActiveIdx] = { ...updated[lastActiveIdx], status: 'Cancelled' };
          localStorage.setItem('bank_appointments', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    } else {
      setAppointments(prev => {
        const idx = prev.findIndex(a => a.id === app.id);
        const next = idx !== -1 ? prev.map((a, i) => i === idx ? app : a) : [...prev, app];
        localStorage.setItem('bank_appointments', JSON.stringify(next));
        return next;
      });
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {user && (
          <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center px-8">
            <div className="flex items-center space-x-6">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                aria-label="XYZ Bank Dashboard"
              >
                <i className="fas fa-university text-2xl"></i>
                <span className="font-bold text-xl tracking-tight">XYZ Bank</span>
              </Link>
              <Link 
                to="/appointments"
                className="hidden md:flex items-center space-x-2 bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-inner"
              >
                <i className="fas fa-calendar-check"></i>
                <span>My Appointments</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/appointments" className="md:hidden text-white text-xl">
                <i className="fas fa-calendar-check"></i>
              </Link>
              <span className="text-sm opacity-80 hidden sm:inline">Welcome, {user}</span>
              <button 
                onClick={handleLogout}
                className="bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded text-xs transition-colors"
              >
                Logout
              </button>
            </div>
          </nav>
        )}

        <main className="flex-grow container mx-auto px-6 py-8 max-w-[1500px]">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard activeAppointment={activeAppointment} setAppointment={setAppointment} /> : <Navigate to="/login" />} />
            <Route path="/book/:serviceId" element={user ? <AppointmentBooking onBook={setAppointment} /> : <Navigate to="/login" />} />
            <Route path="/status" element={user ? <StatusTracker appointment={activeAppointment} appointments={appointments} setAppointment={setAppointment} /> : <Navigate to="/login" />} />
            <Route path="/appointments" element={user ? <AppointmentsList appointments={appointments} /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>

        <footer className="bg-white border-t p-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} XYZ Bank Advisory System. Official demo for secure visit planning.
        </footer>
      </div>
    </Router>
  );
};

export default App;