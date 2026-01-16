
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '../types';
import { BANK_SERVICES } from '../constants';

interface StatusTrackerProps {
  appointment: Appointment | null;
  setAppointment: (app: Appointment) => void;
}

const StatusTracker: React.FC<StatusTrackerProps> = ({ appointment, setAppointment }) => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);

  // Simulation: Move through states every 15 seconds for demo
  useEffect(() => {
    if (!appointment || appointment.status === 'Completed') return;

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev >= 14) {
          const nextStatusMap: Record<string, Appointment['status']> = {
            'Scheduled': 'Not Arrived',
            'Not Arrived': 'In Progress',
            'In Progress': 'Completed'
          };
          const nextStatus = nextStatusMap[appointment.status];
          if (nextStatus) {
            setAppointment({ ...appointment, status: nextStatus });
          }
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [appointment, setAppointment]);

  if (!appointment) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm">
        <i className="fas fa-calendar-times text-6xl text-gray-200 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-800">No active appointment</h2>
        <p className="text-gray-500 mb-8">You haven't booked any services yet.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-blue-900 text-white px-8 py-3 rounded-lg font-bold"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const service = BANK_SERVICES.find(s => s.id === appointment.serviceId);
  const statuses: Appointment['status'][] = ['Scheduled', 'Not Arrived', 'In Progress', 'Completed'];
  const currentIndex = statuses.indexOf(appointment.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <i className="fas fa-clock text-9xl"></i>
        </div>

        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Live Status
            </span>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">{appointment.id}</h2>
            <p className="text-gray-500">{service?.label}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-400">Scheduled Time</p>
            <p className="text-xl font-bold text-gray-800">{appointment.timeSlot}</p>
          </div>
        </div>

        <div className="relative mb-12 mt-16 px-4">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-blue-900 -translate-y-1/2 transition-all duration-1000"
            style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
          ></div>

          <div className="relative flex justify-between">
            {statuses.map((s, idx) => (
              <div key={s} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-20 border-4 transition-all duration-500 ${
                  idx <= currentIndex ? 'bg-blue-900 border-blue-100 text-white' : 'bg-white border-gray-100 text-gray-300'
                }`}>
                  {idx < currentIndex ? (
                    <i className="fas fa-check text-xs"></i>
                  ) : (
                    <span className="text-[10px] font-bold">{idx + 1}</span>
                  )}
                </div>
                <span className={`absolute top-10 text-[10px] font-bold uppercase whitespace-nowrap tracking-tighter ${
                  idx <= currentIndex ? 'text-blue-900' : 'text-gray-300'
                }`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 p-6 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce ${
              appointment.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <i className={`fas ${
                appointment.status === 'Scheduled' ? 'fa-calendar' : 
                appointment.status === 'Not Arrived' ? 'fa-walking' :
                appointment.status === 'In Progress' ? 'fa-spinner fa-spin' : 'fa-check-circle'
              }`}></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-800">
                {appointment.status === 'Scheduled' && "Stay ready!"}
                {appointment.status === 'Not Arrived' && "Head to the branch!"}
                {appointment.status === 'In Progress' && "Service in progress..."}
                {appointment.status === 'Completed' && "Service complete!"}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                {appointment.status === 'Scheduled' && `Please arrive at the branch by ${appointment.timeSlot}.`}
                {appointment.status === 'Not Arrived' && "The branch is expecting you. Scan your digital QR at the kiosk upon arrival."}
                {appointment.status === 'In Progress' && `Our executive is processing your ${service?.label}. Total estimated time: ${service?.averageTime} mins.`}
                {appointment.status === 'Completed' && "Thank you for banking with us. We've emailed your service acknowledgement."}
              </p>
            </div>
          </div>
        </div>

        {appointment.status !== 'Completed' && (
          <div className="mt-8 text-center text-[10px] text-gray-400 italic">
            Simulation active: Status will update automatically in {15 - seconds}s...
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">
          Reschedule
        </button>
        <button 
          onClick={() => {
            if(confirm('Cancel this appointment?')) {
              localStorage.removeItem('active_appointment');
              navigate('/dashboard');
              window.location.reload();
            }
          }}
          className="bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
        >
          Cancel Visit
        </button>
      </div>
    </div>
  );
};

export default StatusTracker;
