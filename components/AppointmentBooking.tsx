
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BANK_SERVICES, TIME_SLOTS } from '../constants';
import { Appointment } from '../types';
import { getSmartTimeRecommendation } from '../services/geminiService';

interface AppointmentBookingProps {
  onBook: (app: Appointment) => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ onBook }) => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = BANK_SERVICES.find(s => s.id === serviceId);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(true);
  const [crowdLevel, setCrowdLevel] = useState(Math.floor(Math.random() * 60) + 20);

  // Generate dummy crowd density for all slots once per page load and determine recommended slot
  const { slotDensities, recommendedSlot } = useMemo(() => {
    const levels = ['Low', 'Medium', 'High'] as const;
    const densities: Record<string, 'Low' | 'Medium' | 'High'> = {};
    
    TIME_SLOTS.forEach(slot => {
      densities[slot] = levels[Math.floor(Math.random() * 3)];
    });

    // AI Recommendation Logic: Prefer Low, else Medium, avoid High
    let recommended = TIME_SLOTS.find(s => densities[s] === 'Low');
    if (!recommended) {
      recommended = TIME_SLOTS.find(s => densities[s] === 'Medium');
    }
    // Fallback if all are high
    if (!recommended) {
      recommended = TIME_SLOTS[0];
    }

    return { slotDensities: densities, recommendedSlot: recommended };
  }, []);

  useEffect(() => {
    if (!service) return;
    
    const fetchRecs = async () => {
      setLoadingAi(true);
      const recs = await getSmartTimeRecommendation(service.label, crowdLevel);
      setRecommendations(recs);
      setLoadingAi(false);
    };

    fetchRecs();
  }, [service, crowdLevel]);

  if (!service) return <div>Service not found</div>;

  const handleBook = () => {
    if (!selectedSlot) return;

    const newApp: Appointment = {
      id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: service.id as any,
      userName: localStorage.getItem('bank_user') || 'Customer',
      timeSlot: selectedSlot,
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
              <h4 className="font-semibold text-gray-700">Priority Slots</h4>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <i className="fas fa-users"></i> Average Crowd: {crowdLevel}%
              </span>
            </div>
            {loadingAi ? (
              <div className="h-14 flex items-center justify-center bg-gray-50 rounded-lg animate-pulse border border-dashed border-gray-200">
                <span className="text-gray-400 text-sm">Analyzing branch traffic...</span>
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
                    <span>{slot}</span>
                    <span className="text-[10px] uppercase opacity-75">Smart Choice</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <h4 className="font-semibold text-gray-700 mb-3">All Available Slots</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {TIME_SLOTS.map(slot => {
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
                      {slot}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${getDensityColor(density, isSelected)}`}>
                      {density} Crowd
                    </span>
                  </button>
                );
              })}
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
