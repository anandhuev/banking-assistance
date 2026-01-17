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
  
  const persistedAppRef = useRef<Appointment | null>(null);

  useEffect(() => {
    if (appointment && !['Completed', 'Cancelled', 'Expired'].includes(appointment.status)) {
      persistedAppRef.current = appointment;
    }
  }, [appointment]);

  const activeApp = appointment || persistedAppRef.current;

  // Helper for crowd labels and colors consistent with booking logic
  const getQualitativeLoad = (percent: number) => {
    if (percent <= 25) return { label: 'Low', colorClass: 'text-green-600 bg-green-50' };
    if (percent <= 60) return { label: 'Moderate', colorClass: 'text-orange-600 bg-orange-50' };
    if (percent <= 85) return { label: 'High', colorClass: 'text-red-600 bg-red-50' };
    return { label: 'Very High', colorClass: 'text-red-800 bg-red-100' };
  };

  // Helper to parse time slot to Date
  const getSlotTime = (dateStr: string, slotStr: string) => {
    const [time, period] = slotStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Check for Expiry or Missed status
  useEffect(() => {
    if (!activeApp || ['Completed', 'Cancelled', 'Expired'].includes(activeApp.status)) return;

    const checkTime = () => {
      const now = new Date();
      const slotTime = getSlotTime(activeApp.visitDate, activeApp.timeSlot);
      const bankEndTime = new Date(activeApp.visitDate);
      bankEndTime.setHours(17, 0, 0, 0); // 5:00 PM

      // Automatic Expiry: End of bank day or past date
      if (now > bankEndTime && activeApp.status !== 'In Progress') {
        setAppointment({ ...activeApp, status: 'Expired' });
        return;
      }

      // Missed: Past slot time but before end of day
      if (now > slotTime && activeApp.status === 'Scheduled') {
        setAppointment({ ...activeApp, status: 'Missed' });
        return;
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [activeApp, setAppointment]);

  const { waitTime, confidence } = useMemo(() => {
    if (!activeApp || ['Completed', 'Cancelled', 'Expired', 'Missed'].includes(activeApp.status)) return { waitTime: 0, confidence: "Medium" };

    const ahead = appointments.filter(a => 
      a.id !== activeApp.id && 
      !['Completed', 'Cancelled', 'Expired'].includes(a.status) &&
      a.visitDate === activeApp.visitDate &&
      a.createdAt < activeApp.createdAt
    );

    const totalWorkload = ahead.reduce((total, a) => {
      const srv = BANK_SERVICES.find(s => s.id === a.serviceId);
      return total + (srv?.averageTime || 25);
    }, 0);

    const COUNTERS = 4;
    const SMOOTHING = 0.65;
    const rawWait = (totalWorkload / COUNTERS) * SMOOTHING;

    // Crowd-aware multiplier for live status
    const sameSlotCount = appointments.filter(a => 
      !['Completed', 'Cancelled', 'Expired'].includes(a.status) &&
      a.visitDate === activeApp.visitDate &&
      a.timeSlot === activeApp.timeSlot
    ).length;

    const slotPercent = (sameSlotCount / 8) * 100;
    const densityLabel = getQualitativeLoad(slotPercent).label;
    
    let multiplier = 1.0;
    if (densityLabel === 'Low') multiplier = 0.7;
    else if (densityLabel === 'Moderate') multiplier = 1.0;
    else if (densityLabel === 'High') multiplier = 1.3;
    else if (densityLabel === 'Very High') multiplier = 1.6;

    const adjustedWait = rawWait * multiplier;

    return {
      waitTime: Math.max(5, Math.min(60, Math.round(adjustedWait))),
      confidence: ahead.length < 5 ? "High" : "Medium"
    };
  }, [activeApp, appointments]);

  useEffect(() => {
    if (!appointment || ['Completed', 'Cancelled', 'Expired', 'Scheduled', 'Missed'].includes(appointment.status) || isCancelled) {
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
            if (nextStatus === 'Completed') {
              persistedAppRef.current = { ...appointment, status: 'Completed' };
              setShowCompletionPopup(true);
              setTimeout(() => setShowCompletionPopup(false), 3000);
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

  if (isCancelled) {
    return (
      <div className="max-w-[1500px] mx-auto bg-white p-12 rounded-2xl shadow-xl text-center border border-red-100 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
          <i className="fas fa-calendar-times text-4xl"></i>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Appointment Cancelled</h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">
          Your visit for <span className="font-bold text-red-600">{activeApp ? BANK_SERVICES.find(s => s.id === activeApp.serviceId)?.label : 'your bank service'}</span> has been successfully cancelled.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-blue-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-xl hover:shadow-blue-200 transform active:scale-95"
        >
          Go back to Dashboard
        </button>
      </div>
    );
  }

  if (!activeApp) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm max-w-[1500px] mx-auto">
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

  if (activeApp.status === 'Expired') {
    return (
      <div className="max-w-[1500px] mx-auto bg-white p-12 rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-clock text-4xl"></i>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Appointment Expired</h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">
          The bank day ended at 5 PM. Please book a new appointment to continue.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-blue-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-xl"
        >
          Book New Appointment
        </button>
      </div>
    );
  }

  const service = BANK_SERVICES.find(s => s.id === activeApp.serviceId);
  const statuses: Appointment['status'][] = ['Scheduled', 'Arrived', 'In Progress', 'Completed'];
  const currentIndex = statuses.includes(activeApp.status) ? statuses.indexOf(activeApp.status) : 0;

  const handleMarkArrival = () => {
    setAppointment({ ...activeApp, status: 'Arrived' });
    setSeconds(0);
  };

  const formattedDate = new Date(activeApp.visitDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 relative">
      {showCompletionPopup && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-green-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-green-500">
            <div className="bg-white/20 p-2 rounded-full"><i className="fas fa-check text-xl"></i></div>
            <div>
              <h4 className="font-bold text-lg leading-none">Visit Completed</h4>
              <p className="text-sm text-green-50 mt-1">Thank you for visiting XYZ Bank today.</p>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Appointment?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your visit for <span className="font-bold text-blue-900">{activeApp.timeSlot}</span>?
            </p>
            <div className="space-y-3">
              <button onClick={() => { setIsCancelled(true); setAppointment(null); setShowCancelModal(false); }} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">Cancel Appointment</button>
              <button onClick={() => setShowCancelModal(false)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">Don't Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reschedule Visit?</h3>
            <p className="text-gray-600 mb-6">Do you want to change your appointment for {activeApp.visitDate}?</p>
            <div className="space-y-3">
              <button onClick={() => { setShowRescheduleModal(false); navigate(`/book/${activeApp.serviceId}`); }} className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors">Yes, Reschedule</button>
              <button onClick={() => setShowRescheduleModal(false)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">Keep Appointment</button>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-white p-12 rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative transition-all duration-500 ${isCancelled ? 'opacity-50 grayscale pointer-events-none' : ''} ${activeApp.status === 'Completed' ? 'border-green-200' : ''}`}>
        <div className="absolute top-0 right-0 p-8 opacity-5"><i className="fas fa-university text-[200px]"></i></div>

        <div className="flex justify-between items-start mb-12 relative z-10">
          <div>
            <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${
              activeApp.status === 'Completed' ? 'text-green-600 bg-green-50 border-green-100' : 
              activeApp.status === 'Missed' ? 'text-orange-600 bg-orange-50 border-orange-100' : 
              'text-blue-600 bg-blue-50 border-blue-100'
            }`}>
              {activeApp.status === 'Completed' ? 'Visit Finalized' : activeApp.status === 'Missed' ? 'Missed Slot' : 'Official XYZ Tracker'}
            </span>
            <h2 className="text-4xl font-black text-gray-900 mt-4">{activeApp.id}</h2>
            <p className="text-lg font-bold text-gray-500 mt-1">{service?.label}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Scheduled Slot</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{activeApp.timeSlot}</p>
            <p className="text-sm font-bold text-gray-500">{activeApp.visitDate}</p>
          </div>
        </div>

        {['Scheduled', 'Arrived', 'In Progress', 'Completed'].includes(activeApp.status) && (
          <div className="relative mb-20 mt-24 px-12">
            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 -translate-y-1/2 rounded-full"></div>
            <div className={`absolute top-1/2 left-0 h-1.5 -translate-y-1/2 transition-all duration-1000 rounded-full ${activeApp.status === 'Completed' ? 'bg-green-600' : 'bg-blue-900'}`} style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}></div>
            <div className="relative flex justify-between">
              {statuses.map((s, idx) => (
                <div key={s} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-20 border-[6px] transition-all duration-500 shadow-sm ${idx <= currentIndex ? (activeApp.status === 'Completed' ? 'bg-green-600 border-green-50' : 'bg-blue-900 border-blue-50') : 'bg-white border-gray-100 text-gray-300'} ${idx <= currentIndex ? 'text-white' : ''}`}>
                    {idx < currentIndex ? <i className="fas fa-check text-xs"></i> : <span className="text-xs font-black">{idx + 1}</span>}
                  </div>
                  <span className={`absolute top-14 text-[10px] font-black uppercase whitespace-nowrap tracking-widest transition-colors duration-500 ${idx <= currentIndex ? (activeApp.status === 'Completed' ? 'text-green-700' : 'text-blue-900') : 'text-gray-300'}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`mt-24 p-10 rounded-3xl border shadow-inner transition-colors duration-500 ${
          activeApp.status === 'Completed' ? 'bg-green-50 border-green-100' : 
          activeApp.status === 'Missed' ? 'bg-orange-50 border-orange-100' : 
          'bg-gray-50 border-gray-100'
        }`}>
          <div className="flex items-start space-x-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-md ${
              activeApp.status === 'Completed' ? 'bg-green-100 text-green-600' : 
              activeApp.status === 'Missed' ? 'bg-orange-100 text-orange-600' : 
              'bg-blue-100 text-blue-600'
            } ${['Arrived', 'In Progress'].includes(activeApp.status) ? 'animate-pulse' : ''}`}>
              <i className={`fas text-2xl ${
                activeApp.status === 'Scheduled' ? 'fa-calendar' : 
                activeApp.status === 'Arrived' ? 'fa-user-check' :
                activeApp.status === 'In Progress' ? 'fa-spinner fa-spin' : 
                activeApp.status === 'Missed' ? 'fa-exclamation-triangle' : 'fa-check-circle'
              }`}></i>
            </div>
            <div className="flex-grow">
              <h4 className={`text-2xl font-black tracking-tight ${activeApp.status === 'Completed' ? 'text-green-900' : activeApp.status === 'Missed' ? 'text-orange-900' : 'text-gray-900'}`}>
                {activeApp.status === 'Scheduled' && "Scheduled Branch Visit"}
                {activeApp.status === 'Arrived' && "Formal Check-in Recorded"}
                {activeApp.status === 'In Progress' && "Service in Progress..."}
                {activeApp.status === 'Completed' && "Service Finalized"}
                {activeApp.status === 'Missed' && "Scheduled Window Missed"}
              </h4>
              <p className={`text-lg mt-2 leading-relaxed font-medium ${activeApp.status === 'Completed' ? 'text-green-700' : activeApp.status === 'Missed' ? 'text-orange-700' : 'text-gray-500'}`}>
                {activeApp.status === 'Scheduled' && `Your appointment is confirmed for ${formattedDate}.`}
                {activeApp.status === 'Arrived' && "Welcome to XYZ Bank. Your token has been prioritized in the system."}
                {activeApp.status === 'In Progress' && `Our officer is currently processing your request.`}
                {activeApp.status === 'Completed' && "Thank you for using XYZ Bank Smart Advisory."}
                {activeApp.status === 'Missed' && "The scheduled time for your visit has passed. Please check in if you are at the branch, or reschedule via the portal."}
              </p>

              {!['Completed', 'Expired', 'Missed'].includes(activeApp.status) && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 text-blue-900">
                      <i className="fas fa-hourglass-half text-sm"></i>
                      <span className="text-lg font-black uppercase tracking-tight">
                        Estimated Average Waiting Time: ~{waitTime} minutes
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700/60 ml-6">
                      <i className="fas fa-shield-halved text-xs"></i>
                      <span className="text-xs font-bold uppercase tracking-widest">Confidence Rating: {confidence}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {(activeApp.status === 'Scheduled' || activeApp.status === 'Missed') && (
                <button onClick={handleMarkArrival} className="mt-8 bg-blue-900 text-white px-10 py-4 rounded-xl font-black text-lg hover:bg-blue-800 transition-all shadow-2xl flex items-center gap-3 transform active:scale-95">
                  <i className="fas fa-map-marker-alt"></i> Confirm Arrival at Branch
                </button>
              )}

              {activeApp.status === 'Completed' && (
                <button onClick={() => navigate('/dashboard')} className="mt-8 bg-green-600 text-white px-10 py-4 rounded-xl font-black text-lg hover:bg-green-700 transition-all shadow-2xl flex items-center gap-3 transform active:scale-95">
                  <i className="fas fa-home"></i> Return to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-6 ${isCancelled || ['Completed', 'Expired'].includes(activeApp.status) ? 'hidden' : ''}`}>
        <button 
          onClick={() => setShowRescheduleModal(true)}
          disabled={activeApp.status === 'In Progress'}
          className={`bg-white border-2 border-gray-200 text-gray-700 py-5 rounded-2xl font-black text-lg transition-all shadow-md ${activeApp.status === 'In Progress' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-blue-300'}`}
        >
          Reschedule Official Visit
        </button>
        <button 
          onClick={() => setShowCancelModal(true)}
          disabled={activeApp.status === 'In Progress'}
          className={`bg-red-50 text-red-600 border-2 border-red-100 py-5 rounded-2xl font-black text-lg transition-all shadow-md ${activeApp.status === 'In Progress' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-100'}`}
        >
          Cancel Appointment
        </button>
      </div>
    </div>
  );
};

export default StatusTracker;
