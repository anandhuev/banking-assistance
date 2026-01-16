import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BANK_SERVICES, TIME_SLOTS, NEARBY_BRANCHES } from '../constants';
import { Appointment, CrowdLevel } from '../types';
import { getSmartTimeRecommendation } from '../services/geminiService';

interface AppointmentBookingProps {
  onBook: (app: Appointment) => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ onBook }) => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = BANK_SERVICES.find(s => s.id === serviceId);
  
  const [selectedBranchId, setSelectedBranchId] = useState<string>(NEARBY_BRANCHES[0].id);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(true);

  const selectedBranch = useMemo(() => {
    const branch = NEARBY_BRANCHES.find(b => b.id === selectedBranchId);
    return branch || NEARBY_BRANCHES[0];
  }, [selectedBranchId]);

  const getCrowdLevel = (branchName: string, slot: string): CrowdLevel => {
    const hash = branchName.length + slot.length + slot.charCodeAt(0);
    const val = hash % 3;
    if (val === 0) return 'Low';
    if (val === 1) return 'Medium';
    return 'Busy';
  };

  useEffect(() => {
    if (!service) return;
    const fetchRecs = async () => {
      setLoadingAi(true);
      try {
        const result = await getSmartTimeRecommendation(service.label, selectedBranch.name);
        setRecommendations(result.slots);
        setAiExplanation(result.explanation);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAi(false);
      }
    };
    fetchRecs();
    setSelectedSlot(null);
  }, [service, selectedBranchId, selectedBranch.name]);

  if (!service) return <div className="dark:text-white">Service not found</div>;

  const handleBook = () => {
    if (!selectedSlot || !selectedBranch) return;
    const newApp: Appointment = {
      id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: service.id as any,
      userName: localStorage.getItem('bank_user') || 'Customer',
      branchName: selectedBranch.name,
      timeSlot: selectedSlot,
      status: 'Scheduled',
      createdAt: Date.now()
    };
    onBook(newApp);
    navigate('/status');
  };

  const getCrowdColorClass = (level: CrowdLevel, isSelected: boolean) => {
    if (isSelected) return 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600';
    switch (level) {
      case 'Low': return 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 hover:border-green-400';
      case 'Medium': return 'border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 hover:border-yellow-400';
      case 'Busy': return 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 hover:border-red-400';
      default: return 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-[#1e293b] p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Schedule Your Visit</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 space-y-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-blue-500"></i> Nearby Branches
            </h4>
            <div className="space-y-2">
              {NEARBY_BRANCHES.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedBranchId === branch.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20' 
                    : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  <p className={`font-bold text-sm ${selectedBranchId === branch.id ? 'text-blue-900 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {branch.name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    <i className="fas fa-location-arrow mr-1"></i> {branch.distance} km away
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:w-2/3 space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex justify-between items-center border border-blue-100 dark:border-blue-900/30">
              <div>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-black tracking-widest">Service</p>
                <h3 className="font-bold text-blue-900 dark:text-blue-300">{service.label}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-black tracking-widest">Branch</p>
                <h3 className="font-bold text-blue-900 dark:text-blue-300">{selectedBranch.name}</h3>
              </div>
            </div>

            <section>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">AI Recommendation</h4>
                {loadingAi ? (
                   <div className="flex items-center gap-2 text-xs text-blue-500 animate-pulse">
                     <i className="fas fa-robot"></i> Thinking...
                   </div>
                ) : (
                  <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
                    SMART PICK
                  </span>
                )}
              </div>
              
              {!loadingAi && aiExplanation && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <i className="fas fa-magic mt-0.5"></i>
                  <span>{aiExplanation}</span>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-3">
                {loadingAi ? (
                  [1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>)
                ) : (
                  recommendations.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`relative py-3 rounded-xl border-2 text-sm font-black transition-all overflow-hidden ${
                        selectedSlot === slot 
                        ? 'border-blue-600 bg-blue-900 dark:bg-blue-700 text-white shadow-lg scale-105 z-10' 
                        : 'border-blue-100 dark:border-blue-900 bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 hover:border-blue-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">All Slots</h4>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2 h-2 bg-green-400 rounded-full"></span> Low</span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2 h-2 bg-yellow-400 rounded-full"></span> Mid</span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2 h-2 bg-red-400 rounded-full"></span> Busy</span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map(slot => {
                  const level = getCrowdLevel(selectedBranch.name, slot);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 rounded-lg border-2 text-xs font-bold transition-all flex flex-col items-center justify-center ${getCrowdColorClass(level, isSelected)}`}
                    >
                      <span>{slot}</span>
                      <span className="text-[8px] opacity-70 mt-0.5">{level}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between pt-6 border-t dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedSlot ? (
              <>Selected <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedSlot}</span></>
            ) : (
              "Select a time slot"
            )}
          </p>
          <button
            onClick={handleBook}
            disabled={!selectedSlot}
            className={`px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl ${
              selectedSlot 
              ? 'bg-blue-900 dark:bg-blue-700 text-white hover:bg-blue-800 dark:hover:bg-blue-600 transform hover:-translate-y-1' 
              : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            Confirm Visit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;