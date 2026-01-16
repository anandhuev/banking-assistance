
import React, { useState, useEffect } from 'react';
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white dark:bg-[#1e293b] p-8 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Schedule Your Visit</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-8">
          <div>
            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">Service Selected</p>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">{service.label}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">Estimated Duration</p>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">{service.averageTime} mins</h3>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">AI Recommendations</h4>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <i className="fas fa-users"></i> Crowd Level: {crowdLevel}%
              </span>
            </div>
            {loadingAi ? (
              <div className="h-14 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg animate-pulse border border-dashed border-gray-200 dark:border-slate-700">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Analyzing branch traffic...</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {recommendations.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 rounded-lg border-2 text-sm font-bold transition-all flex flex-col items-center ${
                      selectedSlot === slot 
                      ? 'border-blue-600 bg-blue-900 dark:bg-blue-700 text-white shadow-md' 
                      : 'border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                  >
                    <span>{slot}</span>
                    <span className="text-[10px] uppercase opacity-75">Low Crowd</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">All Slots</h4>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-1 rounded-md border text-xs transition-all ${
                    selectedSlot === slot 
                    ? 'bg-blue-900 dark:bg-blue-700 text-white border-blue-900 dark:border-blue-700' 
                    : recommendations.includes(slot) 
                      ? 'border-green-300 dark:border-green-800 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </section>
        </div>

        <button
          onClick={handleBook}
          disabled={!selectedSlot}
          className={`w-full mt-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl ${
            selectedSlot 
            ? 'bg-blue-900 dark:bg-blue-700 text-white hover:bg-blue-800 dark:hover:bg-blue-600 hover:-translate-y-1' 
            : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
        >
          Confirm Appointment
        </button>
      </div>
    </div>
  );
};

export default AppointmentBooking;
