import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BANK_SERVICES } from '../constants';
import { BankService, ServiceType, Appointment } from '../types';

interface DashboardProps {
  activeAppointment?: Appointment | null;
  setAppointment?: (app: Appointment | null) => void;
}

interface StaticGuidance {
  reason: string;
  delay: string;
  how: string;
  time: string;
  rec: string;
}

interface ServiceAdvice {
  whyPhysical: string;
  documentsBrief: string;
  commonMistakes: string;
  branchAdvice: string;
}

const SERVICE_ADVICE_DATA: Record<ServiceType, ServiceAdvice> = {
  'open_account': {
    whyPhysical: 'Biometric verification and original document sighting are legally mandated for account security.',
    documentsBrief: 'Original Identity proof, Address proof, and physical passport photos.',
    commonMistakes: 'Bringing expired documents or photocopies without the physical originals.',
    branchAdvice: 'Visit during early morning hours (09:30 AM) for faster biometric processing.'
  },
  'kyc_update': {
    whyPhysical: 'Requires physical signature and real-time document verification against bank records.',
    documentsBrief: 'Aadhar card, PAN card, and a recent utility bill.',
    commonMistakes: 'Addresses on documents not matching the bank record exactly.',
    branchAdvice: 'Mid-week visits are usually the fastest for quick KYC updates.'
  },
  'account_mod': {
    whyPhysical: 'High-security changes like mobile number updates require in-person identity confirmation.',
    documentsBrief: 'Request letter, passbook, and current identification.',
    commonMistakes: 'Signatures on the request letter differing from the account mandate.',
    branchAdvice: 'Pre-fill your request letter at home to save 15 minutes at the desk.'
  },
  'loans': {
    whyPhysical: 'Complex applications involve detailed interviews and document validation for credit assessment.',
    documentsBrief: 'Last 3 months of income proof, identity docs, and collateral evidence.',
    commonMistakes: 'Missing the latest month salary slip or incomplete business registration docs.',
    branchAdvice: 'Book a 2:30 PM slot; loan officers are typically most available then.'
  },
  'security': {
    whyPhysical: 'Large transactions require physical authorization slips to prevent digital fraud.',
    documentsBrief: 'Special authorization form and valid identity proof.',
    commonMistakes: 'Unclear transaction purpose or mismatch in beneficiary details.',
    branchAdvice: 'Morning slots are preferred to ensure same-day processing of high-value funds.'
  },
  'business': {
    whyPhysical: 'Commercial accounts require verification of business premises and entity registration certificates.',
    documentsBrief: 'GST certificate, Trade license, and proprietor identity proofs.',
    commonMistakes: 'Not bringing the official seal or entity-specific tax documents.',
    branchAdvice: 'Tuesday mornings are historically low-traffic for our business desk.'
  },
  'locker': {
    whyPhysical: 'Dual-key systems and physical signature vault access are inherently in-branch activities.',
    documentsBrief: 'Locker agreement, identity proof, and 2 passport photos.',
    commonMistakes: 'Bringing the wrong nominee or missing the secondary key holder.',
    branchAdvice: 'Avoid the lunch hour (1:00 PM - 2:00 PM) as vault access is restricted.'
  },
  'grievance': {
    whyPhysical: 'Complex issues often require a face-to-face meeting with a manager for resolution.',
    documentsBrief: 'Grievance form and all supporting transaction evidence.',
    commonMistakes: 'Not having transaction reference numbers or dates ready.',
    branchAdvice: 'Bring all printed evidence; digital copies can sometimes slow down formal filing.'
  },
  'senior': {
    whyPhysical: 'We provide specialized assisted banking for seniors that requires physical presence.',
    documentsBrief: 'Age proof and current address documentation.',
    commonMistakes: 'Not bringing a local guardian or nominee for joint account updates.',
    branchAdvice: 'Our dedicated senior desk is most active and assisted during the 11 AM hour.'
  }
};

const DOCUMENT_GUIDANCE_DATA: Record<string, StaticGuidance> = {
  'Identity Proof (Aadhar/Passport)': {
    reason: 'Legally required for KYC verification to ensure account security.',
    delay: 'Document expiry or mismatch in demographic details.',
    how: 'Apply online via official government portals or visit a designated center.',
    time: '5 - 10 working days.',
    rec: 'Wait to receive the document before proceeding with the visit.'
  },
  'Address Proof': {
    reason: 'Needed to establish your residential jurisdiction for communication.',
    delay: 'Document is older than 3 months or address is incomplete.',
    how: 'Use latest utility bills (electricity/water) or a rent agreement.',
    time: 'Immediate if bills are available.',
    rec: 'Proceed if you have a digital copy of the latest bill.'
  },
  '2 Passport Photos': {
    reason: 'Used for physical records and account opening forms.',
    delay: 'Photos not meeting standard dimensions or being too old.',
    how: 'Visit any local photo studio.',
    time: '15 - 30 minutes.',
    rec: 'Proceed to branch only after getting these clicked.'
  },
  'Initial Deposit': {
    reason: 'Minimum balance required to activate the account.',
    delay: 'Insufficient funds or technical issues with transfer.',
    how: 'Carry cash or have funds ready in another bank account for transfer.',
    time: 'Instant.',
    rec: 'Ensure you have the required amount ready.'
  },
  'PAN Card': {
    reason: 'Mandatory for financial transactions exceeding certain limits and tax compliance.',
    delay: 'Card lost or verification failure.',
    how: 'Apply via NSDL or UTITSL website.',
    time: '10 - 15 days for physical card.',
    rec: 'Wait if your transaction requires mandatory PAN reporting.'
  },
  'Latest Electricity Bill': {
    reason: 'Acts as valid proof of current residence.',
    delay: 'Bill is older than 2 months.',
    how: 'Download from your electricity provider\'s customer portal.',
    time: 'Instant (Digital).',
    rec: 'Proceed once you have the PDF downloaded.'
  },
  'Existing Passbook': {
    reason: 'Required for entry updates or as a secondary identification.',
    delay: 'Passbook lost or fully printed.',
    how: 'Visit your home branch for a new booklet.',
    time: 'Same-day service.',
    rec: 'Proceed to branch; they can issue a new one.'
  },
  'Request Letter': {
    reason: 'Formal documentation for specific account changes.',
    delay: 'Incomplete information or missing signature.',
    how: 'Handwrite a letter or use the bank\'s standard template.',
    time: '5 minutes.',
    rec: 'Can be written at the branch help desk.'
  },
  'Income Proof (3 months)': {
    reason: 'Required to assess creditworthiness for loan products.',
    delay: 'Salary slips not signed or missing company stamp.',
    how: 'Request from your HR department or download bank statements.',
    time: '1 - 2 days.',
    rec: 'Proceed only after gathering at least 3 months of statements.'
  }
};

const Dashboard: React.FC<DashboardProps> = ({ activeAppointment, setAppointment }) => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<BankService | null>(null);
  const [docStates, setDocStates] = useState<Record<string, boolean | undefined>>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(false);

  const handleServiceSelect = (service: BankService) => {
    setSelectedService(service);
    const initialDocs: Record<string, boolean | undefined> = {};
    service.requiredDocuments.forEach(d => initialDocs[d] = undefined);
    setDocStates(initialDocs);
    setTimeout(() => {
      document.getElementById('preparation-panel')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const setDocAvailability = (doc: string, isAvailable: boolean) => {
    setDocStates(prev => ({ ...prev, [doc]: isAvailable }));
  };

  const handleConfirmCancel = () => {
    if (setAppointment) setAppointment(null);
    setShowCancelModal(false);
    setIsWidgetExpanded(false);
  };

  const handleConfirmReschedule = () => {
    if (activeAppointment) {
      navigate(`/book/${activeAppointment.serviceId}`);
    }
    setShowRescheduleModal(false);
    setIsWidgetExpanded(false);
  };

  const allReady = selectedService?.requiredDocuments.every(doc => docStates[doc] === true) ?? false;

  const getServiceIcon = (id: ServiceType) => {
    const iconMap: Record<ServiceType, string> = {
      'open_account': 'fa-user-plus',
      'kyc_update': 'fa-id-card',
      'account_mod': 'fa-edit',
      'loans': 'fa-hand-holding-usd',
      'security': 'fa-shield-alt',
      'business': 'fa-briefcase',
      'locker': 'fa-key',
      'grievance': 'fa-exclamation-triangle',
      'senior': 'fa-user-friends'
    };
    return iconMap[id] || 'fa-university';
  };

  const getGuidance = (doc: string): StaticGuidance => {
    return DOCUMENT_GUIDANCE_DATA[doc] || {
      reason: 'Required for regulatory compliance.',
      delay: 'Processing delays or verification issues.',
      how: 'Contact relevant authorities or check online portals.',
      time: 'Varies by document.',
      rec: 'Check if an alternative document is acceptable.'
    };
  };

  return (
    <div className="space-y-6 relative pb-20 max-w-[1500px] mx-auto">
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Appointment?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your visit at <span className="font-bold text-blue-900">{activeAppointment?.timeSlot}</span>?
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

      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reschedule Visit?</h3>
            <p className="text-gray-600 mb-6">
              Do you want to change your time slot from <span className="font-bold text-blue-900">{activeAppointment?.timeSlot}</span>?
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
                Don't Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {activeAppointment && (
        <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 ease-in-out ${isWidgetExpanded ? 'w-72 h-auto' : 'w-48 h-10'} bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-blue-50 overflow-hidden`}>
          {!isWidgetExpanded && (
            <div 
              className="w-full h-full flex items-center justify-between px-4 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => setIsWidgetExpanded(true)}
            >
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Live Visit Status
              </span>
              <i className="fas fa-chevron-up text-blue-600 text-[10px]"></i>
            </div>
          )}

          {isWidgetExpanded && (
            <div className="p-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-blue-100">
                  Live Tracker
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate('/status')} 
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-all"
                    title="Maximize Status View"
                  >
                    <i className="fas fa-expand-alt text-[10px]"></i>
                  </button>
                  <button 
                    onClick={() => setIsWidgetExpanded(false)} 
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-all"
                    title="Collapse"
                  >
                    <i className="fas fa-chevron-down text-[10px]"></i>
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="font-extrabold text-gray-900 text-base mb-0.5">{activeAppointment.timeSlot}</h5>
                <p className="text-[11px] text-gray-500 font-medium">XYZ Bank Branch Visit</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-[11px] font-bold text-blue-900 uppercase tracking-tighter">
                    Status: {activeAppointment.status}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowRescheduleModal(true)} 
                  className="flex-1 text-[10px] font-bold py-2 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 hover:bg-white hover:border-blue-200 transition-all shadow-sm"
                >
                  Reschedule
                </button>
                <button 
                  onClick={() => setShowCancelModal(true)} 
                  className="flex-1 text-[10px] font-bold py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 flex items-center gap-4 shadow-sm animate-in fade-in duration-700">
        <div className="bg-blue-900 text-white w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
          <i className="fas fa-bolt text-sm"></i>
        </div>
        <div>
          <h4 className="text-blue-900 font-black text-[10px] uppercase tracking-widest leading-none mb-1">XYZ Smart Assistant Enabled</h4>
          <p className="text-blue-700 text-[12px] font-medium leading-tight">Prepare documents and schedule visits at optimal, low-crowd hours automatically for a seamless branch experience.</p>
        </div>
      </div>

      <header className="mb-8">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Available Banking Services</h2>
        <p className="text-gray-500 font-medium mt-1">Select a service below to begin your XYZ Bank smart planning experience.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BANK_SERVICES.map(service => (
          <button
            key={service.id}
            onClick={() => handleServiceSelect(service)}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              selectedService?.id === service.id 
              ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]' 
              : 'border-gray-200 bg-white hover:border-blue-200'
            }`}
          >
            <div className="bg-blue-100 text-blue-900 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <i className={`fas ${getServiceIcon(service.id)}`}></i>
            </div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{service.label}</h3>
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 font-medium">{service.description}</p>
          </button>
        ))}
      </div>

      {selectedService && (
        <div id="preparation-panel" className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
          <div className="mb-8 p-8 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
            <h4 className="text-blue-900 font-bold flex items-center gap-2 mb-4">
              <i className="fas fa-robot text-lg"></i>
              XYZ AI Visit Strategy: {selectedService.label}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div>
                <p className="text-blue-800 font-semibold mb-1">Why visit the branch?</p>
                <p className="text-blue-700 leading-relaxed">{SERVICE_ADVICE_DATA[selectedService.id].whyPhysical}</p>
              </div>
              <div>
                <p className="text-blue-800 font-semibold mb-1">Common Visit Mistakes</p>
                <p className="text-blue-700 leading-relaxed">{SERVICE_ADVICE_DATA[selectedService.id].commonMistakes}</p>
              </div>
              <div>
                <p className="text-blue-800 font-semibold mb-1">Documents to carry</p>
                <p className="text-blue-700 leading-relaxed">{SERVICE_ADVICE_DATA[selectedService.id].documentsBrief}</p>
              </div>
              <div>
                <p className="text-blue-800 font-semibold mb-1">Best time for this service</p>
                <p className="text-blue-700 leading-relaxed font-bold">{SERVICE_ADVICE_DATA[selectedService.id].branchAdvice}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Checklist: {selectedService.label}</h3>
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-bold">
              Est. Service Time: {selectedService.averageTime} mins
            </span>
          </div>
          
          <div className="space-y-6">
            {selectedService.requiredDocuments.map(doc => {
              const info = getGuidance(doc);
              return (
                <div key={doc} className="border-b pb-6 last:border-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <span className={`text-lg font-bold ${docStates[doc] === true ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {doc}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDocAvailability(doc, true)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border ${
                          docStates[doc] === true 
                          ? 'bg-green-600 border-green-600 text-white shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        <i className="fas fa-check"></i> Available
                      </button>
                      <button
                        onClick={() => setDocAvailability(doc, false)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border ${
                          docStates[doc] === false 
                          ? 'bg-orange-600 border-orange-600 text-white shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        <i className="fas fa-times"></i> Not Available
                      </button>
                    </div>
                  </div>

                  {docStates[doc] === false && (
                    <div className="mt-4 p-5 bg-yellow-50 rounded-xl border border-yellow-200 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-yellow-900 font-bold mb-1">Why it's needed</p>
                          <p className="text-yellow-800 leading-relaxed">{info.reason}</p>
                        </div>
                        <div>
                          <p className="text-yellow-900 font-bold mb-1">How to obtain</p>
                          <p className="text-yellow-800 leading-relaxed">{info.how}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-yellow-200">
                        <p className="text-yellow-900 font-bold flex items-center gap-2">
                          <i className="fas fa-robot"></i> AI Recommendation:
                          <span className="font-normal text-yellow-800">{info.rec}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <i className={`fas ${allReady ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-gray-400'}`}></i>
              <span className={allReady ? 'text-green-700 font-bold' : 'text-gray-500 font-medium'}>
                {allReady ? "Ready! All documents verified." : "Please prepare all documents to continue."}
              </span>
            </div>
            <button
              onClick={() => navigate(`/book/${selectedService.id}`)}
              className={`px-12 py-4 rounded-xl font-black shadow-xl transition-all ${allReady ? 'bg-blue-900 text-white hover:bg-blue-800 transform hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
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