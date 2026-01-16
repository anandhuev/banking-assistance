
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BANK_SERVICES, TIME_SLOTS, NEARBY_BRANCHES } from '../constants';
import { Appointment, CrowdLevel } from '../types';

interface AppointmentBookingProps {
  onBook: (app: Appointment) => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ onBook }) => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = BANK_SERVICES.find(s => s.id === serviceId);
  
  const [selectedBranchId, setSelectedBranchId] = useState<string>(NEARBY_BRANCHES[0].id);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Stable crowd simulation for current session
  const crowdLevels = useMemo(() => {
    const map: Record<string, CrowdLevel> = {};
    TIME_SLOTS.forEach(slot => {
      const rand = Math.random();
      if (rand > 0.65) map[slot] = 'Medium';
      else if (rand > 0.85) map[slot] = 'High';
      else map[slot] = 'Low';
    });
    return map;
  }, [selectedBranchId]);

  const recommendedSlot = useMemo(() => {
    const slots = TIME_SLOTS.map(s => ({ slot: s, level: crowdLevels[s] }));
    let best = slots.find(s => s.level === 'Low');
    if (!best) best = slots.find(s => s.level === 'Medium');
    return best || slots[0];
  }, [crowdLevels]);

  if (!service) return <div className="dark:text-white">Service not found</div>;

  const handleBook = (slot?: string) => {
    const finalSlot = slot || selectedSlot;
    if (!finalSlot) return;
    
    const branch = NEARBY_BRANCHES.find(b => b.id === selectedBranchId) || NEARBY_BRANCHES[0];
    const newApp: Appointment = {
      id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: service.id as any,
      userName: localStorage.getItem('bank_user') || 'Customer',
      branchName: branch.name,
      timeSlot: finalSlot,
      status: 'Scheduled',
      createdAt: Date.now()
    };
    onBook(newApp);
    navigate('/status');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: BRANCHES */}
        <div className="lg:w-1/3 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Nearby Branches</h3>
          {NEARBY_BRANCHES.map(branch => (
            <button
              key={branch.id}
              onClick={() => { setSelectedBranchId(branch.id); setSelectedSlot(null); }}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                selectedBranchId === branch.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                : 'border-transparent dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold dark:text-white">{branch.name}</span>
                <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  {branch.distance} km
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* RIGHT: CONTENT */}
        <div className="lg:w-2/3 space-y-8">
          
          {/* AI RECOMMENDATION BOX */}
          <div className="p-8 bg-blue-900 text-white rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <i className="fas fa-robot text-9xl"></i>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-4">AI Recommended Slot</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div>
                <h2 className="text-5xl font-black mb-1">{recommendedSlot.slot}</h2>
                <p className="text-blue-100 text-xs">
                  Optimal visit strategy: <span className="font-bold uppercase">{recommendedSlot.level}</span> crowd detected.
                </p>
              </div>
              <button 
                onClick={() => handleBook(recommendedSlot.slot)}
                className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl whitespace-nowrap"
              >
                Instant Book
              </button>
            </div>
          </div>

          {/* ALL SLOTS GRID */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border dark:border-slate-700">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">All Available Slots</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {TIME_SLOTS.map(slot => {
                const level = crowdLevels[slot];
                const isSelected = selectedSlot === slot;
                const isRec = slot === recommendedSlot.slot;
                
                let crowdStyle = 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/10 dark:border-green-900 dark:text-green-400';
                if (level === 'Medium') crowdStyle = 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/10 dark:border-yellow-900 dark:text-yellow-400';
                if (level === 'High') crowdStyle = 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/10 dark:border-red-900 dark:text-red-400';

                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected 
                      ? 'bg-blue-900 border-blue-900 text-white shadow-lg scale-105 z-10' 
                      : `${crowdStyle} hover:scale-105`
                    } ${isRec ? 'border-dashed border-blue-500' : ''}`}
                  >
                    {isRec && !isSelected && (
                      <span className="absolute -top-2 bg-white dark:bg-slate-900 text-[8px] font-black px-2 rounded-full border border-blue-500 text-blue-600">BEST</span>
                    )}
                    <span className="text-sm font-black">{slot}</span>
                    <span className="text-[9px] uppercase font-bold opacity-60">{level}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 pt-6 border-t dark:border-slate-700 flex justify-end">
              <button
                onClick={() => handleBook()}
                disabled={!selectedSlot}
                className="px-12 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
