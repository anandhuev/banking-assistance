
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BANK_SERVICES } from '../constants';
import { BankService, ServiceType } from '../types';

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
    whyPhysical: 'Complex issues often require a face-to-face meeting with a branch manager for resolution.',
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<BankService | null>(null);
  const [docStates, setDocStates] = useState<Record<string, boolean | undefined>>({});

  const handleServiceSelect = (service: BankService) => {
    setSelectedService(service);
    const initialDocs: Record<string, boolean | undefined> = {};
    service.requiredDocuments.forEach(d => initialDocs[d] = undefined);
    setDocStates(initialDocs);
  };

  const setDocAvailability = (doc: string, isAvailable: boolean) => {
    setDocStates(prev => ({ ...prev, [doc]: isAvailable }));
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
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">What can we help you with today?</h2>
        <p className="text-gray-600">Select a service to verify your documents and book a priority visit.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{service.description}</p>
          </button>
        ))}
      </div>

      {selectedService && (
        <div id="preparation-panel" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
          
          {/* General Service AI Guidance Box */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
            <h4 className="text-blue-900 font-bold flex items-center gap-2 mb-4">
              <i className="fas fa-robot text-lg"></i>
              AI Visit Strategy: {selectedService.label}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
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
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">
              Est. Service Time: {selectedService.averageTime} mins
            </span>
          </div>
          
          <div className="space-y-6">
            {selectedService.requiredDocuments.map(doc => {
              const info = getGuidance(doc);
              return (
                <div key={doc} className="border-b pb-6 last:border-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <span className={`text-lg font-medium ${docStates[doc] === true ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
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
                          <p className="text-yellow-900 font-bold mb-1"><i className="fas fa-info-circle mr-2"></i>Why it's needed</p>
                          <p className="text-yellow-800 leading-relaxed">{info.reason}</p>
                        </div>
                        <div>
                          <p className="text-yellow-900 font-bold mb-1"><i className="fas fa-clock mr-2"></i>Delay Reason</p>
                          <p className="text-yellow-800 leading-relaxed">{info.delay}</p>
                        </div>
                        <div>
                          <p className="text-yellow-900 font-bold mb-1"><i className="fas fa-tools mr-2"></i>How to obtain</p>
                          <p className="text-yellow-800 leading-relaxed">{info.how}</p>
                        </div>
                        <div>
                          <p className="text-yellow-900 font-bold mb-1"><i className="fas fa-hourglass-half mr-2"></i>Typical wait time</p>
                          <p className="text-yellow-800 leading-relaxed">{info.time}</p>
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
              <span className={allReady ? 'text-green-700 font-medium' : 'text-gray-500'}>
                {allReady ? "Ready! All documents verified." : "Please prepare all documents to continue."}
              </span>
            </div>
            <button
              onClick={() => navigate(`/book/${selectedService.id}`)}
              className={`px-8 py-3 rounded-lg font-bold shadow-lg transition-all ${allReady ? 'bg-blue-900 text-white hover:bg-blue-800 transform hover:-translate-y-0.5' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
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
