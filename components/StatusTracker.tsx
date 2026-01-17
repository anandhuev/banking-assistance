
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Appointment } from '../types';
import { BANK_SERVICES } from '../constants';

interface StatusTrackerProps {
  appointment: Appointment | null;
  appointments: Appointment[];
  setAppointment: (app: Appointment | null) => void;
}

const StatusTracker: React.FC<StatusTrackerProps> = ({ appointment, appointments, setAppointment }) => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  
  // Use a ref to keep track of the appointment even when the prop becomes null (due to status being 'Completed')
  const persistedAppRef = useRef<Appointment | null>(null);

  useEffect(() => {
    if (appointment && appointment.status !== 'Completed' && appointment.status !== 'Cancelled') {
      persistedAppRef.current = appointment;
    }
  }, [appointment]);

  const activeApp = appointment || persistedAppRef.current;

  // Calculate wait time based on appointments created BEFORE the active one that are not finalized
  const estimatedWaitTime = useMemo(() => {
    if (!activeApp || activeApp.status === 'Completed' || activeApp.status === 'Cancelled') return 0;

    const ahead = appointments.filter(a => 
      a.id !== activeApp.id && 
      a.status !== 'Completed' && 
      a.status !== 'Cancelled' && 
      a.createdAt < activeApp.createdAt
    );

    return ahead.reduce((total, a) => {
      const srv = BANK_SERVICES.find(s => s.id === a.serviceId);
      return total + (srv?.averageTime || 0);
    }, 0);
  }, [activeApp, appointments]);

  /**
   * System-Triggered Logic for State Transitions
   * Moves Arrived -> In Progress and In Progress -> Completed automatically.
   */
  useEffect(() => {
    if (!appointment || appointment.status === 'Completed' || appointment.status === 'Cancelled' || isCancelled) {
      return;
    }

    if (appointment.status === 'Scheduled') {
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev >= 10) {
          const nextStatusMap: Record<string, Appointment['status']> = {
            'Arrived': 'In Progress',
            'In Progress': 'Completed'
          };
          
          const nextStatus = nextStatusMap[appointment.status];
          if (nextStatus) {
            // Update the persisted ref before triggering global change
            if (nextStatus === 'Completed') {
              persistedAppRef.current = { ...appointment, status: 'Completed' };
              setShowCompletionPopup(true);
              // Auto-dismiss popup after 3 seconds
              setTimeout(() => {
                setShowCompletionPopup(false);
              }, 3000);
            }
            setAppointment({ ...appointment, status: nextStatus });
          }
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [appointment, setAppointment, isCancelled]);

  if (!activeApp) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm">
        <i className="fas fa-calendar-times text-6xl text-gray-200 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-800">No active appointment</h2>
        <p className="text-gray-500 mb-8">You haven't booked any services yet.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-blue-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const service = BANK_SERVICES.find(s => s.id === activeApp.serviceId);
  const statuses: Appointment['status'][] = ['Scheduled', 'Arrived', 'In Progress', 'Completed'];
  const currentIndex = statuses.indexOf(activeApp.status);

  const handleMarkArrival = () => {
    setAppointment({ ...activeApp, status: 'Arrived' });
    setSeconds(0);
  };

  const handleConfirmCancel = () => {
    setIsCancelled(true);
    setShowCancelModal(false);
    setAppointment(null);
  };

  const handleConfirmReschedule = () => {
    setShowRescheduleModal(false);
    navigate(`/book/${activeApp.serviceId}`);
  };

  const canCheckIn = activeApp.status === 'Scheduled';

  return (
    <div className="max-w-2xl mx-auto space-y-6 relative">
      {/* Completion Popup (Toast) */}
      {showCompletionPopup && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-green-500">
            <div className="bg-white/20 p-2 rounded-full">
              <i className="fas fa-check text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-base leading-none">Visit Completed</h4>
              <p className="text-xs text-green-50 mt-1">Your bank visit has been successfully completed.</p>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Appointment?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your visit at <span className="font-bold text-blue-900">{activeApp.timeSlot}</span>?
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleConfirmCancel}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Cancel Appointment
              </button>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Don't Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rescheduling Confirmation Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reschedule Visit?</h3>
            <p className="text-gray-600 mb-6">
              Do you want to change your time slot for <span className="font-bold text-blue-900">{activeApp.timeSlot}</span>?
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleConfirmReschedule}
                className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors"
              >
                Yes, Reschedule
              </button>
              <button 
                onClick={() => setShowRescheduleModal(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Keep Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Status Card */}
      <div className={`bg-white p-8 rounded-xl shadow-lg border border-gray-100 overflow-hidden relative transition-all duration-500 ${isCancelled ? 'opacity-50 grayscale pointer-events-none' : ''} ${activeApp.status === 'Completed' ? 'border-green-200' : ''}`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <i className="fas fa-clock text-9xl"></i>
        </div>

        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${activeApp.status === 'Completed' ? 'text-green-600 bg-green-50 border-green-100' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
              {activeApp.status === 'Completed' ? 'Visit Finalized' : 'Live Tracker'}
            </span>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">{activeApp.id}</h2>
            <p className="text-gray-500 font-medium">{service?.label}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-400">Scheduled Time</p>
            <p className="text-xl font-bold text-gray-800">{activeApp.timeSlot}</p>
          </div>
        </div>

        {/* Dynamic Progress Timeline */}
        <div className="relative mb-12 mt-16 px-4">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2"></div>
          <div 
            className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 transition-all duration-1000 ${activeApp.status === 'Completed' ? 'bg-green-600' : 'bg-blue-900'}`}
            style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
          ></div>

          <div className="relative flex justify-between">
            {statuses.map((s, idx) => (
              <div key={s} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-20 border-4 transition-all duration-500 ${
                  idx < currentIndex ? (activeApp.status === 'Completed' ? 'bg-green-600 border-green-50' : 'bg-blue-900 border-blue-50') :
                  idx === currentIndex ? (activeApp.status === 'Completed' ? 'bg-green-600 border-green-50' : 'bg-blue-900 border-blue-50') :
                  'bg-white border-gray-100 text-gray-300'
                } ${idx <= currentIndex ? 'text-white' : ''}`}>
                  {idx < currentIndex ? (
                    <i className="fas fa-check text-[8px]"></i>
                  ) : (
                    <span className="text-[8px] font-bold">{idx + 1}</span>
                  )}
                </div>
                <span className={`absolute top-10 text-[9px] font-black uppercase whitespace-nowrap tracking-tighter transition-colors duration-500 ${
                  idx <= currentIndex ? (activeApp.status === 'Completed' ? 'text-green-700' : 'text-blue-900') : 'text-gray-300'
                }`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Status Detail Box */}
        <div className={`mt-20 p-6 rounded-2xl border shadow-inner transition-colors duration-500 ${activeApp.status === 'Completed' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              activeApp.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
            } ${activeApp.status === 'Arrived' || activeApp.status === 'In Progress' ? 'animate-pulse' : ''}`}>
              <i className={`fas text-xl ${
                activeApp.status === 'Scheduled' ? 'fa-calendar' : 
                activeApp.status === 'Arrived' ? 'fa-user-check' :
                activeApp.status === 'In Progress' ? 'fa-spinner fa-spin' : 'fa-check-circle'
              }`}></i>
            </div>
            <div className="flex-grow">
              <h4 className={`font-extrabold tracking-tight ${activeApp.status === 'Completed' ? 'text-green-900' : 'text-gray-800'}`}>
                {activeApp.status === 'Scheduled' && "Your visit is scheduled"}
                {activeApp.status === 'Arrived' && "Check-in Confirmed"}
                {activeApp.status === 'In Progress' && "Now Serving..."}
                {activeApp.status === 'Completed' && "Visit Completed Successfully"}
              </h4>
              <p className={`text-sm mt-1 leading-relaxed ${activeApp.status === 'Completed' ? 'text-green-700' : 'text-gray-500'}`}>
                {activeApp.status === 'Scheduled' && `Please mark your arrival when you reach the branch at ${activeApp.timeSlot}.`}
                {activeApp.status === 'Arrived' && "Arrival recorded. System is assigning your request to a bank executive."}
                {activeApp.status === 'In Progress' && `Your request is currently being processed. Estimated completion in ${service?.averageTime} minutes.`}
                {activeApp.status === 'Completed' && "Thank you for using SmartBank Assistant. You can now view this in your visit history."}
              </p>

              {/* Queue Estimation UI */}
              {activeApp.status !== 'Completed' && (
                <div className="mt-4 pt-4 border-t border-gray-200/50">
                  <div className="flex items-center gap-2 text-blue-900">
                    <i className="fas fa-hourglass-half text-xs"></i>
                    <span className="text-xs font-bold uppercase tracking-tight">Estimated Waiting Time: ~{estimatedWaitTime} minutes</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5 italic">(Based on current appointments and service duration)</p>
                </div>
              )}
              
              {canCheckIn && (
                <button
                  onClick={handleMarkArrival}
                  className="mt-5 bg-blue-900 text-white px-7 py-2.5 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-200 flex items-center gap-2 transform active:scale-95"
                >
                  <i className="fas fa-map-marker-alt"></i>
                  Mark Arrival
                </button>
              )}

              {activeApp.status === 'Completed' && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-5 bg-green-600 text-white px-7 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200 flex items-center gap-2 transform active:scale-95 animate-in fade-in slide-in-from-bottom-2"
                >
                  <i className="fas fa-home"></i>
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>

        {!isCancelled && activeApp.status !== 'Completed' && activeApp.status !== 'Scheduled' && (
          <div className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-70">
            System Update in {11 - seconds}s...
          </div>
        )}
      </div>

      {/* Control Actions */}
      <div className="grid grid-cols-1 gap-4">
        {!isCancelled && activeApp.status !== 'Completed' && (
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setShowRescheduleModal(true)}
              disabled={activeApp.status === 'In Progress'}
              className={`bg-white border border-gray-200 text-gray-600 py-3.5 rounded-xl font-bold transition-all shadow-sm ${
                activeApp.status === 'In Progress' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              Reschedule Visit
            </button>
            <button 
              onClick={() => setShowCancelModal(true)}
              disabled={activeApp.status === 'In Progress'}
              className={`bg-red-50 text-red-600 border border-red-100 py-3.5 rounded-xl font-bold transition-all shadow-sm ${
                activeApp.status === 'In Progress' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-100 active:bg-red-200'
              }`}
            >
              Cancel Visit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusTracker;
