import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BANK_SERVICES, TIME_SLOTS, STATE_CITY_DATA } from '../constants';
import { Appointment, Branch } from '../types';
import { getSmartTimeRecommendation, getDailyLoadInsight } from '../services/geminiService';

interface AppointmentBookingProps {
  onBook: (app: Appointment) => void;
}

const getWorkingDays = () => {
  const days = [];
  let current = new Date();
  while (days.length < 10) {
    if (current.getDay() !== 0) {
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const getSessionBookings = (branchId: string, dateKey: string): Record<string, number> => {
  const key = `bank_bookings_${branchId}_${dateKey}`;
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  
  const initial: Record<string, number> = {};
  TIME_SLOTS.forEach(slot => {
    initial[slot] = Math.floor(Math.random() * 8);
  });
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

const updateSessionBookings = (branchId: string, dateKey: string, slot: string) => {
  const key = `bank_bookings_${branchId}_${dateKey}`;
  const saved = localStorage.getItem(key);
  const bookings = saved ? JSON.parse(saved) : {};
  bookings[slot] = (bookings[slot] || 0) + 1;
  localStorage.setItem(key, JSON.stringify(bookings));
};

const getQualitativeLoad = (percent: number): { label: string; colorClass: string } => {
  if (percent <= 25) return { label: 'Low', colorClass: 'text-green-600 bg-green-50' };
  if (percent <= 60) return { label: 'Moderate', colorClass: 'text-orange-600 bg-orange-50' };
  if (percent <= 85) return { label: 'High', colorClass: 'text-red-600 bg-red-50' };
  return { label: 'Very High', colorClass: 'text-red-800 bg-red-100' };
};

const CROWD_TAGS = ["Standard Load", "Formal Traffic", "Efficient Processing", "Optimal Turnaround"];

// Programmatic branch generation helper
const generateBranchesForCity = (city: string, state: string): Branch[] => {
  const patterns = ['Main Branch', 'City Center', 'Strategic Hub', 'Digital Branch', 'Retail Center'];
  return patterns.slice(0, 4).map((suffix, index) => ({
    id: `br-${city.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    name: `XYZ Bank ${city} ${suffix}`,
    state: state,
    city: city,
    address: `${index + 120}, Business Towers, ${city}`,
    lat: 0,
    lng: 0,
    crowdTag: CROWD_TAGS[index % CROWD_TAGS.length]
  }));
};

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ onBook }) => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = BANK_SERVICES.find(s => s.id === serviceId);
  const workingDays = useMemo(() => getWorkingDays(), []);
  
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date>(workingDays[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(true);
  
  const [precomputedWaitTimes, setPrecomputedWaitTimes] = useState<Record<string, number>>({});
  const [precomputedConfidence, setPrecomputedConfidence] = useState<Record<string, string>>({});
  const [dailyAiInsight, setDailyAiInsight] = useState<string>("");

  const dateKey = selectedDate.toISOString().split('T')[0];

  const states = useMemo(() => Object.keys(STATE_CITY_DATA).sort(), []);
  const cities = useMemo(() => selectedState ? STATE_CITY_DATA[selectedState].sort() : [], [selectedState]);
  
  const filteredBranches = useMemo(() => {
    if (!selectedCity || !selectedState) return [];
    return generateBranchesForCity(selectedCity, selectedState);
  }, [selectedCity, selectedState]);

  const { slotDensities, recommendedSlot, averageCrowdPercent } = useMemo(() => {
    if (!selectedBranch) return { slotDensities: {}, recommendedSlot: null, averageCrowdPercent: 0 };
    const bookings = getSessionBookings(selectedBranch.id, dateKey);
    const densities: Record<string, string> = {};
    let totalCount = 0;
    TIME_SLOTS.forEach(slot => {
      const count = bookings[slot] || 0;
      totalCount += count;
      const slotPercent = (count / 8) * 100;
      densities[slot] = getQualitativeLoad(slotPercent).label;
    });
    
    let recommended = TIME_SLOTS.find(s => densities[s] === 'Low');
    if (!recommended) recommended = TIME_SLOTS.find(s => densities[s] === 'Moderate');
    if (!recommended) recommended = TIME_SLOTS[0];
    
    const avg = Math.min(100, Math.round((totalCount / (TIME_SLOTS.length * 8)) * 100));
    return { slotDensities: densities, recommendedSlot: recommended, averageCrowdPercent: avg };
  }, [selectedBranch, dateKey]);

  useEffect(() => {
    if (!service || !selectedBranch) return;

    const runPrecomputation = async () => {
      setLoadingAi(true);
      const bookings = getSessionBookings(selectedBranch.id, dateKey);
      const waitMap: Record<string, number> = {};
      const confMap: Record<string, string> = {};
      let cumulativeAhead = 0;
      const COUNTERS = 4;
      const SMOOTHING = 0.65;
      const AVG_SERVICE_TIME = 25;
      
      TIME_SLOTS.forEach(slot => {
        const workloadAhead = cumulativeAhead * AVG_SERVICE_TIME;
        const baseWait = (workloadAhead / COUNTERS) * SMOOTHING;
        
        // Crowd-aware wait time adjustment
        const slotCount = bookings[slot] || 0;
        const slotPercent = (slotCount / 8) * 100;
        const densityLabel = getQualitativeLoad(slotPercent).label;
        
        let multiplier = 1.0;
        if (densityLabel === 'Low') multiplier = 0.7;
        else if (densityLabel === 'Moderate') multiplier = 1.0;
        else if (densityLabel === 'High') multiplier = 1.3;
        else if (densityLabel === 'Very High') multiplier = 1.6;

        const adjustedWait = baseWait * multiplier;
        waitMap[slot] = Math.max(5, Math.min(60, Math.round(adjustedWait)));
        confMap[slot] = cumulativeAhead < 6 ? "High" : "Medium";
        cumulativeAhead += slotCount;
      });
      setPrecomputedWaitTimes(waitMap);
      setPrecomputedConfidence(confMap);

      const [recs, insight] = await Promise.all([
        getSmartTimeRecommendation(service.label, averageCrowdPercent, dateKey),
        getDailyLoadInsight(service.label, averageCrowdPercent)
      ]);
      
      setRecommendations(recs);
      setDailyAiInsight(insight);
      setLoadingAi(false);
    };

    runPrecomputation();
  }, [service, selectedBranch, averageCrowdPercent, dateKey]);

  const isPastSlot = (slot: string) => {
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    if (!isToday) return false;

    const [time, period] = slot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const slotTime = new Date(selectedDate);
    slotTime.setHours(hours, minutes, 0, 0);

    return slotTime < now;
  };

  if (!service) return <div>Service not found</div>;

  const handleBook = () => {
    if (!selectedSlot || !selectedBranch) return;
    updateSessionBookings(selectedBranch.id, dateKey, selectedSlot);
    const newApp: Appointment = {
      id: `XYZ-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceId: service.id as any,
      branchId: selectedBranch.id,
      userName: localStorage.getItem('bank_user') || 'Valued Customer',
      visitDate: dateKey,
      timeSlot: selectedSlot.split(/[–-]/)[0].trim(),
      status: 'Scheduled',
      createdAt: Date.now()
    };
    onBook(newApp);
    navigate('/status');
  };

  const renderSlot = (slot: string) => {
    const density = slotDensities[slot];
    const isSelected = selectedSlot === slot;
    const isRecommended = slot === recommendedSlot;
    const isDisabled = isPastSlot(slot);
    
    let colorClass = 'text-gray-600';
    if (isSelected) {
      colorClass = 'text-white opacity-90';
    } else if (isDisabled) {
      colorClass = 'text-gray-300';
    } else {
      if (density === 'Low') colorClass = 'text-green-600';
      else if (density === 'Moderate') colorClass = 'text-orange-600';
      else if (density === 'High') colorClass = 'text-red-600';
      else if (density === 'Very High') colorClass = 'text-red-800';
    }

    return (
      <button
        key={slot}
        disabled={isDisabled}
        onClick={() => setSelectedSlot(slot)}
        className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col gap-1 relative ${
          isDisabled
          ? 'bg-gray-100 border-gray-100 cursor-not-allowed opacity-60'
          : isSelected 
            ? 'bg-blue-900 text-white border-blue-900 shadow-lg ring-4 ring-blue-100' 
            : isRecommended 
              ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 ring-4 ring-blue-50 ring-offset-1'
              : 'border-gray-100 bg-white hover:border-blue-300 hover:bg-blue-50'
        }`}
      >
        {isRecommended && !isDisabled && (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm whitespace-nowrap z-10">
            AI Recommended
          </span>
        )}
        <span className={`text-sm font-bold ${isSelected ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
          {slot.split(/[–-]/)[0].trim()}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${colorClass}`}>
          {isDisabled ? 'Passed' : `${density} Traffic`}
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
      const isPM = slot.includes('PM');
      let absoluteHour = hourPart;
      if (isPM && hourPart !== 12) absoluteHour += 12;
      if (!isPM && hourPart === 12) absoluteHour = 0;
      if (absoluteHour >= 10 && absoluteHour < 13) morning.push(slot);
      else if (absoluteHour >= 14 && absoluteHour < 15.5) afternoon.push(slot);
      else if (absoluteHour >= 15.5 && absoluteHour < 17) evening.push(slot);
    });
    return { morning, afternoon, evening };
  }, []);

  const branchLoad = getQualitativeLoad(averageCrowdPercent);

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 pb-12">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-center space-x-4 mb-10">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <i className="fas fa-arrow-left text-2xl"></i>
          </button>
          <h2 className="text-3xl font-black text-gray-800">Schedule Your Official Visit</h2>
        </div>

        <section className="mb-12 space-y-6">
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Branch Selection</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Select State / UT</label>
              <select 
                value={selectedState}
                onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); setSelectedBranch(null); }}
                className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none appearance-none bg-white text-gray-900 font-bold shadow-sm"
              >
                <option value="">Choose State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Select City / District</label>
              <select 
                value={selectedCity}
                disabled={!selectedState}
                onChange={(e) => { setSelectedCity(e.target.value); setSelectedBranch(null); }}
                className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-300 bg-white text-gray-900 font-bold shadow-sm"
              >
                <option value="">Choose City</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {selectedCity && filteredBranches.length > 0 && (
            <div className="pt-6 space-y-4">
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Available XYZ Bank Branches</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredBranches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => { setSelectedBranch(branch); setSelectedSlot(null); }}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      selectedBranch?.id === branch.id 
                      ? 'border-blue-900 bg-blue-50 ring-8 ring-blue-50 shadow-inner' 
                      : 'border-gray-100 bg-white hover:border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedBranch?.id === branch.id ? 'bg-blue-900 text-white' : 'bg-gray-50 text-gray-400'}`}>
                      <i className="fas fa-university text-lg"></i>
                    </div>
                    <div>
                      <h5 className="font-black text-gray-900 text-sm mb-1">{branch.name}</h5>
                      {branch.crowdTag && (
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-2 italic">
                          {branch.crowdTag}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{branch.address}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {selectedBranch && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-12">
            <div>
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Appointment Date</h4>
              <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
                {workingDays.map((date) => {
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                  const dateDisplay = date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                      className={`flex-shrink-0 w-24 py-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        isSelected 
                        ? 'bg-blue-900 border-blue-900 text-white shadow-2xl scale-105' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-900'
                      }`}
                    >
                      <span className="text-[11px] font-black uppercase tracking-widest">{dayName}</span>
                      <span className="text-lg font-black">{dateDisplay}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between p-8 bg-blue-50 rounded-2xl border border-blue-100 shadow-inner">
              <div>
                <p className="text-[11px] text-blue-600 uppercase font-black tracking-widest mb-1">Target Service</p>
                <h3 className="text-2xl font-black text-blue-900">{service.label}</h3>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-blue-600 uppercase font-black tracking-widest mb-1">Expected Branch Load</p>
                <h3 className={`text-2xl font-black ${branchLoad.colorClass.split(' ')[0]}`}>{branchLoad.label}</h3>
              </div>
            </div>

            <div className="space-y-10">
              {selectedSlot && (
                <div className="p-8 rounded-3xl border-4 border-dashed bg-blue-50 border-blue-100 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-start gap-6">
                    <div className="bg-blue-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <i className="fas fa-bolt text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 text-xl">XYZ AI Analysis: {selectedSlot}</h4>
                      <div className="mt-2">
                        <p className="text-2xl font-black text-blue-900">
                          Estimated Wait: ~{precomputedWaitTimes[selectedSlot] ?? 0} minutes
                        </p>
                        <p className="text-sm font-bold text-blue-700/60 flex items-center gap-2 mt-1">
                          <i className="fas fa-shield-halved"></i>
                          Confidence Rating: {precomputedConfidence[selectedSlot] ?? "Medium"}
                        </p>
                      </div>
                      {dailyAiInsight && (
                        <p className="text-sm text-gray-600 mt-4 font-bold italic border-l-4 border-blue-200 pl-4">
                          "{dailyAiInsight}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <section>
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">AI Optimized Recommendations</h4>
                {loadingAi ? (
                  <div className="h-20 flex items-center justify-center bg-gray-50 rounded-2xl animate-pulse border-2 border-dashed border-gray-200">
                    <span className="text-gray-400 font-bold">Recalculating optimal flow...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {recommendations.filter(slot => !isPastSlot(slot)).map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-5 rounded-2xl border-2 text-base font-black transition-all flex flex-col items-center ${
                            selectedSlot === slot 
                            ? 'border-blue-600 bg-blue-900 text-white shadow-2xl scale-105' 
                            : 'border-green-100 bg-green-50 text-green-700 hover:border-green-300'
                          }`}
                        >
                          <span>{slot.split(/[–-]/)[0].trim()}</span>
                          <span className="text-[9px] uppercase tracking-widest font-black opacity-80 mt-1">Prime Slot</span>
                        </button>
                      ))}
                      {recommendations.filter(slot => !isPastSlot(slot)).length === 0 && (
                        <p className="col-span-full text-sm text-gray-400 font-bold italic">No optimized recommendations available for the remaining day.</p>
                      )}
                    </div>
                  </>
                )}
              </section>

              <section className="space-y-10 pt-8 border-t border-gray-100">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Complete Schedule Flow</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div>
                    <h5 className="text-[11px] uppercase tracking-widest text-gray-400 font-black mb-6 flex items-center gap-3">
                      <i className="fas fa-sun text-yellow-500"></i> Morning Sequence
                    </h5>
                    <div className="grid grid-cols-2 gap-3">{groupedSlots.morning.map(renderSlot)}</div>
                  </div>
                  <div>
                    <h5 className="text-[11px] uppercase tracking-widest text-gray-400 font-black mb-6 flex items-center gap-3">
                      <i className="fas fa-cloud-sun text-orange-400"></i> Afternoon Sequence
                    </h5>
                    <div className="grid grid-cols-2 gap-3">{groupedSlots.afternoon.map(renderSlot)}</div>
                  </div>
                  <div>
                    <h5 className="text-[11px] uppercase tracking-widest text-gray-400 font-black mb-6 flex items-center gap-3">
                      <i className="fas fa-moon text-blue-400"></i> Evening Sequence
                    </h5>
                    <div className="grid grid-cols-2 gap-3">{groupedSlots.evening.map(renderSlot)}</div>
                  </div>
                </div>
              </section>
            </div>

            <button
              onClick={handleBook}
              disabled={!selectedSlot}
              className={`w-full mt-16 py-6 rounded-2xl font-black text-xl transition-all shadow-2xl ${
                selectedSlot
                ? 'bg-blue-900 text-white hover:bg-blue-800 hover:-translate-y-1' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              Finalize XYZ Bank Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;
