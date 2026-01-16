
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BANK_SERVICES } from '../constants';
import { BankService, DocumentGuidance } from '../types';
import { getMissingDocumentGuidance } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<BankService | null>(null);
  const [docStates, setDocStates] = useState<Record<string, boolean | undefined>>({});
  const [guidance, setGuidance] = useState<Record<string, DocumentGuidance | 'loading'>>({});

  const handleServiceSelect = (service: BankService) => {
    setSelectedService(service);
    const initialDocs: Record<string, boolean | undefined> = {};
    service.requiredDocuments.forEach(d => initialDocs[d] = undefined);
    setDocStates(initialDocs);
    setGuidance({});
  };

  const setDocAvailability = async (doc: string, isAvailable: boolean) => {
    setDocStates(prev => ({ ...prev, [doc]: isAvailable }));
    if (!isAvailable && !guidance[doc]) {
      setGuidance(prev => ({ ...prev, [doc]: 'loading' }));
      const g = await getMissingDocumentGuidance(doc);
      setGuidance(prev => ({ ...prev, [doc]: g }));
    }
  };

  const allReady = selectedService?.requiredDocuments.every(doc => docStates[doc] === true) ?? false;

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">What can we help you with today?</h2>
          <p className="text-gray-600 dark:text-gray-400">Select a service to see required documents and prepare for your visit.</p>
        </div>
        <button 
          onClick={() => navigate('/loan-assistant')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <i className="fas fa-hand-holding-usd"></i> Loan Guidance Assistant
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BANK_SERVICES.map(service => (
          <button
            key={service.id}
            onClick={() => handleServiceSelect(service)}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              selectedService?.id === service.id 
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md scale-[1.02]' 
              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] hover:border-blue-200 dark:hover:border-blue-800'
            }`}
          >
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <i className={`fas ${service.id === 'open_account' ? 'fa-user-plus' : service.id === 'kyc_update' ? 'fa-id-card' : 'fa-book-open'}`}></i>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">{service.label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{service.description}</p>
          </button>
        ))}
      </div>

      {selectedService && (
        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 animate-in fade-in duration-500 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Document Preparation</h3>
            <span className="text-sm bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400">
              Est. Service Time: {selectedService.averageTime} mins
            </span>
          </div>
          
          <div className="space-y-6">
            {selectedService.requiredDocuments.map(doc => (
              <div key={doc} className="border-b dark:border-slate-700 pb-6 last:border-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <span className={`text-lg font-medium ${docStates[doc] === true ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                    {doc}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDocAvailability(doc, true)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border ${
                        docStates[doc] === true 
                        ? 'bg-green-600 border-green-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-green-300 dark:hover:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      <i className="fas fa-check"></i> Available
                    </button>
                    <button
                      onClick={() => setDocAvailability(doc, false)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border ${
                        docStates[doc] === false 
                        ? 'bg-orange-600 border-orange-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-orange-300 dark:hover:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                      }`}
                    >
                      <i className="fas fa-times"></i> Not Available
                    </button>
                  </div>
                </div>

                {docStates[doc] === false && guidance[doc] && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                    {guidance[doc] === 'loading' ? (
                      <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-500 animate-pulse">
                        <i className="fas fa-robot"></i>
                        <span className="text-sm">AI is finding official guidance...</span>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <p className="text-yellow-900 dark:text-yellow-400 font-semibold flex items-center gap-2">
                           <i className="fas fa-lightbulb"></i> Official Advisory
                        </p>
                        <p className="text-yellow-800 dark:text-yellow-500"><strong>Requirement:</strong> {(guidance[doc] as DocumentGuidance).reason}</p>
                        <p className="text-yellow-800 dark:text-yellow-500"><strong>How to obtain:</strong> {(guidance[doc] as DocumentGuidance).procurementMethod}</p>
                        <p className="text-yellow-700 dark:text-yellow-600 italic">Est. collection time: {(guidance[doc] as DocumentGuidance).estimatedWait}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <i className={`fas ${allReady ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-gray-400 dark:text-gray-600'}`}></i>
              <span className={allReady ? 'text-green-700 dark:text-green-500 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                {allReady ? "Excellent! You have all required documents." : "Please mark all items as Available to book."}
              </span>
            </div>
            <button
              onClick={() => navigate(`/book/${selectedService.id}`)}
              className={`px-8 py-3 rounded-lg font-bold shadow-lg transition-all ${allReady ? 'bg-blue-900 dark:bg-blue-700 text-white hover:bg-blue-800 dark:hover:bg-blue-600 transform hover:-translate-y-0.5' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'}`}
              disabled={!allReady}
            >
              Book Smart Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
