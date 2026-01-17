
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BANK_SERVICES, TIME_SLOTS } from '../constants';
import { Appointment } from '../types';
import { getSmartTimeRecommendation } from '../services/geminiService';

interface AppointmentBookingProps {
  onBook: (app: Appointment) => void;
}

// Persistent slot booking simulation helper
const getSessionBookings = (): Record<string, number> => {
  const saved = localStorage.getItem('bank_slot_bookings');
  if (saved) return JSON.parse(saved);
  
  // Seed initial data for a realistic starting state
  const initial: Record<string, number> = {};
  TIME_SLOTS.forEach(slot => {
    // Random seed between 0 and 7
    initial[slot] = Math.floor(Math.random() * 8);
  });
  localStorage.setItem('bank_slot_bookings', JSON.stringify(initial));
  return initial;
};

const updateSessionBookings = (slot: string) => {
  const current = getSessionBookings();
  current[slot] = (current[slot] || 0) + 1;
  localStorage.setItem('bank_slot_bookings', JSON.stringify(current));
};

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ onBook }) => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = BANK_SERVICES.find(s => s.id === serviceId);
  
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(true);

  // Derive crowd densities and recommendation from persistent counts
  const { slotDensities, recommendedSlot, averageCrowdPercent } = useMemo(() => {
    const bookings = getSessionBookings();
    const densities: Record<string, 'Low' | 'Medium' | 'High'> = {};
    let totalCount = 0;

    TIME_SLOTS.forEach(slot => {
      const count = bookings[slot] || 0;
      totalCount += count;
      if (count <= 2) densities[slot] = 'Low';
      else if (count <= 5) densities[slot] = 'Medium';
      else densities[slot] = 'High';
    });

    // Find a Low density slot for internal fallback recommendation
    let recommended = TIME_SLOTS.find(s => densities[s] === 'Low');
    if (!recommended) recommended = TIME_SLOTS.find(s => densities[s] === 'Medium');
    if (!recommended) recommended = TIME_SLOTS[0];

    // Calculate average crowd percentage (cap at 100)
    const avg = Math.min(100, Math.round((totalCount / (TIME_SLOTS.length * 8)) * 100));

    return { slotDensities: densities, recommendedSlot: recommended, averageCrowdPercent: avg };
  }, []);

  // AI uses the derived average crowd level
  useEffect(() => {
    if (!service) return;
    
    const fetchRecs = async () => {
      setLoadingAi(true);
      // AI receives the actual calculated current load
      const recs = await getSmartTimeRecommendation(service.label, averageCrowdPercent);
      setRecommendations(recs);
      setLoadingAi(false);
    };

    fetchRecs();
  }, [service, averageCrowdPercent]);

  if (!service) return <div>Service not found</div>;

  const handleBook = () => {
    if (!selectedSlot) return;

    // Increment booking count for the persistent simulation
    updateSessionBookings(selectedSlot);

    const newApp: Appointment = {
      id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: service.id as any,
      userName: localStorage.getItem('bank_user') || 'Customer',
      timeSlot: selectedSlot.split(/[–-]/)[0].trim(),
      status: 'Scheduled',
      createdAt: Date.now()
    };

    onBook(newApp);
    navigate('/status');
  };

  const getDensityColor = (level: 'Low' | 'Medium' | 'High', isSelected: boolean) => {
    if (isSelected) return 'text-white opacity-90';
    switch (level) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-orange-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  const renderSlot = (slot: string) => {
    const density = slotDensities[slot];
    const isSelected = selectedSlot === slot;
    const isRecommended = slot === recommendedSlot;
    
    return (
      <button
        key={slot}
        onClick={() => setSelectedSlot(slot)}
        className={`p-2 rounded-xl border text-center transition-all flex flex-col gap-1 relative ${
          isSelected 
          ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-100' 
          : isRecommended 
            ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-50 ring-offset-1'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
        }`}
      >
        {isRecommended && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm whitespace-nowrap z-10">
            AI Recommended
          </span>
        )}
        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
          {slot.split(/[–-]/)[0].trim()}
        </span>
        <span className={`text-[9px] font-black uppercase tracking-tighter ${getDensityColor(density, isSelected)}`}>
          {density} Crowd
        </span>
      </button>
    );
  };

  const groupedSlots = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    TIME_SLOTS.forEach(slot => {
      const parts = slot.split(':');
      const hourPart = parseInt(parts[0]);
      const minutePart = parseInt(parts[1].split(' ')[0]);
      const isPM = slot.includes('PM');
      
      let absoluteHour = hourPart;
      if (isPM && hourPart !== 12) absoluteHour += 12;
      if (!isPM && hourPart === 12) absoluteHour = 0;

      if (absoluteHour >= 10 && absoluteHour < 13) {
        morning.push(slot);
      } else if (absoluteHour === 14 || (absoluteHour === 15 && minutePart < 30)) {
        afternoon.push(slot);
      } else if ((absoluteHour === 15 && minutePart >= 30) || absoluteHour === 16) {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Schedule Your Visit</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-8">
          <div>
            <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">Service Selected</p>
            <h3 className="text-lg font-bold text-blue-900">{service.label}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">Estimated Duration</p>
            <h3 className="text-lg font-bold text-blue-900">{service.averageTime} mins</h3>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700">Priority Arrival Times</h4>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <i className="fas fa-users"></i> Global Crowd Load: {averageCrowdPercent}%
              </span>
            </div>
            {loadingAi ? (
              <div className="h-14 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse border border-dashed border-gray-200">
                <span className="text-gray-400 text-sm">Analyzing current bookings...</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {recommendations.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 rounded-lg border-2 text-sm font-bold transition-all flex flex-col items-center ${
                      selectedSlot === slot 
                      ? 'border-blue-600 bg-blue-900 text-white shadow-md' 
                      : 'border-green-100 bg-green-50 text-green-700 hover:border-green-300'
                    }`}
                  >
                    <span>{slot.split(/[–-]/)[0].trim()}</span>
                    <span className="text-[10px] uppercase opacity-75">Smart Choice</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <h4 className="font-semibold text-gray-700 mb-1 border-b pb-2">Working Hours (10 AM - 5 PM)</h4>
            
            <div>
              <h5 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3 flex items-center gap-2">
                <i className="fas fa-sun text-yellow-500"></i> Morning Preferred
              </h5>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {groupedSlots.morning.map(renderSlot)}
              </div>
            </div>

            <div className="py-4">
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-3 flex items-center justify-center gap-3 text-gray-400 select-none">
                <i className="fas fa-utensils"></i>
                <span className="text-xs font-bold uppercase tracking-wider">Lunch Break (1 PM - 2 PM)</span>
              </div>
            </div>

            <div>
              <h5 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3 flex items-center gap-2">
                <i className="fas fa-cloud-sun text-orange-400"></i> Afternoon Preferred
              </h5>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {groupedSlots.afternoon.map(renderSlot)}
              </div>
            </div>

            <div>
              <h5 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3 flex items-center gap-2">
                <i className="fas fa-moon text-blue-400"></i> Evening Preferred
              </h5>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {groupedSlots.evening.map(renderSlot)}
              </div>
            </div>
          </section>
        </div>

        <button
          onClick={handleBook}
          disabled={!selectedSlot}
          className={`w-full mt-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl ${
            selectedSlot 
            ? 'bg-blue-900 text-white hover:bg-blue-800 hover:-translate-y-1' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Confirm Appointment
        </button>
      </div>
    </div>
  );
};

export default AppointmentBooking;
