
import React, { useState } from 'react';
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
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">What can we help you with today?</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Select a service to see required documents and prepare for your visit.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <i className={`fas ${service.icon || 'fa-file-alt'}`}></i>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">{service.label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Est. time: {service.averageTime} mins</p>
          </button>
        ))}
      </div>

      {selectedService && (
        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 animate-in fade-in duration-500 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Document Preparation</h3>
            <span className="text-sm bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400">
              {selectedService.label}
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
                        ? 'bg-red-600 border-red-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      <i className="fas fa-times"></i> Not Available
                    </button>
                  </div>
                </div>

                {docStates[doc] === false && guidance[doc] && (
                  <div className="mt-4 p-5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/30">
                    {guidance[doc] === 'loading' ? (
                      <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-500 animate-pulse">
                        <i className="fas fa-robot"></i>
                        <span className="text-sm">AI Documentation Advisor is preparing guidance...</span>
                      </div>
                    ) : (
                      <div className="space-y-4 text-xs">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold">
                          <i className="fas fa-magic"></i>
                          <span className="uppercase tracking-wider">Missing Document Advisory</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                          <div>
                            <p className="font-bold text-amber-950 dark:text-amber-200">Why required:</p>
                            <p>{(guidance[doc] as DocumentGuidance).reason}</p>
                          </div>
                          <div>
                            <p className="font-bold text-amber-950 dark:text-amber-200">How to obtain:</p>
                            <p>{(guidance[doc] as DocumentGuidance).procurementMethod}</p>
                          </div>
                          <div>
                            <p className="font-bold text-amber-950 dark:text-amber-200">Common Delay Risks:</p>
                            <p>Application errors, missing endorsements, or expired validation periods.</p>
                          </div>
                          <div>
                            <p className="font-bold text-amber-950 dark:text-amber-200">Typical Wait Time:</p>
                            <p>{(guidance[doc] as DocumentGuidance).estimatedWait || '1-5 Business Days'}</p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-white/50 dark:bg-amber-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                          <p className="font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-2">
                            <i className="fas fa-hand-paper"></i> AI Recommendation
                          </p>
                          <p className="text-amber-950/80 dark:text-amber-300/80">
                            We strongly recommend waiting until you have this document in hand. Proceeding with the visit now will likely result in an incomplete application and a required follow-up visit.
                          </p>
                        </div>
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
