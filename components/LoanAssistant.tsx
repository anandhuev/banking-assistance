
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoanInput, LoanRecommendation } from '../types';
import { getLoanRecommendation } from '../services/geminiService';

const LoanAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<LoanRecommendation | null>(null);
  
  const [inputs, setInputs] = useState<LoanInput>({
    purpose: 'Home Loan',
    amountRange: '25L - 1Cr',
    employmentType: 'salaried',
    hasCoApplicant: false,
    hasCollateral: false,
    availableDocs: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await getLoanRecommendation(inputs);
      setRecommendation(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-[#1e293b] p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Complex Loan Application Prep</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <i className="fas fa-shield-alt mr-2 text-blue-500"></i>
          This guided preparation is for high-value loans requiring mandatory physical verification. 
          Use this tool to ensure you have all documents ready before visiting the branch.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Type</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg outline-none"
                value={inputs.purpose}
                onChange={(e) => setInputs({...inputs, purpose: e.target.value})}
                required
              >
                <option value="Home Loan">Home Loan</option>
                <option value="Vehicle Loan">Vehicle Loan</option>
                <option value="Education Loan">Education Loan</option>
                <option value="Business / MSME Loan">Business / MSME Loan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Amount Range</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg outline-none"
                value={inputs.amountRange}
                onChange={(e) => setInputs({...inputs, amountRange: e.target.value})}
              >
                <option value="< 5L">Below 5 Lakhs</option>
                <option value="5L - 25L">5L - 25 Lakhs</option>
                <option value="25L - 1Cr">25L - 1 Crore</option>
                <option value="> 1Cr">Above 1 Crore</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employment Type</label>
               <select 
                 className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg outline-none"
                 value={inputs.employmentType}
                 onChange={(e) => setInputs({...inputs, employmentType: e.target.value})}
               >
                 <option value="salaried">Salaried Professional</option>
                 <option value="self-employed">Self-Employed / Business</option>
                 <option value="student">Student</option>
               </select>
             </div>
             <div className="flex items-center h-full pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={inputs.hasCoApplicant}
                    onChange={(e) => setInputs({...inputs, hasCoApplicant: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Co-applicant</span>
                </label>
             </div>
             <div className="flex items-center h-full pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={inputs.hasCollateral}
                    onChange={(e) => setInputs({...inputs, hasCollateral: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Collateral involved</span>
                </label>
             </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-900 dark:bg-blue-700 text-white rounded-xl font-bold text-lg hover:bg-blue-800 dark:hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Analyzing Requirements...</>
            ) : (
              <><i className="fas fa-magic"></i> Generate Prep Guide</>
            )}
          </button>
        </form>

        {recommendation && !loading && (
          <div className="mt-12 space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30">
               <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-[10px] font-black tracking-widest text-blue-600 dark:text-blue-400 mb-1 uppercase">Loan Readiness Score</p>
                    <h4 className="text-3xl font-bold text-blue-900 dark:text-blue-200">{recommendation.readinessScore}%</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black tracking-widest text-blue-600 dark:text-blue-400 mb-1 uppercase">Desk Recommendation</p>
                    <h4 className="text-lg font-bold text-blue-900 dark:text-blue-200">{recommendation.deskSuggestion}</h4>
                  </div>
               </div>
               
               <div className="w-full bg-gray-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                    style={{ width: `${recommendation.readinessScore}%` }}
                  ></div>
               </div>
               
               <div className="mt-6 flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-blue-50 dark:border-blue-900/20">
                    <p className="font-bold text-sm text-blue-900 dark:text-blue-300 mb-1">Complexity Analysis:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{recommendation.complexityReason}</p>
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-blue-50 dark:border-blue-900/20">
                    <p className="font-bold text-sm text-blue-900 dark:text-blue-300 mb-1">AI Guidance Summary:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{recommendation.explanation}"</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                <h5 className="font-bold text-sm mb-4 flex items-center gap-2 text-green-600"><i className="fas fa-check-circle"></i> Mandatory</h5>
                <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-400">
                  {recommendation.mandatoryDocs.map(doc => <li key={doc}><i className="fas fa-dot-circle text-[6px] mr-2"></i> {doc}</li>)}
                </ul>
              </div>
              <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                <h5 className="font-bold text-sm mb-4 flex items-center gap-2 text-orange-600"><i className="fas fa-info-circle"></i> Conditional</h5>
                <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-400">
                  {recommendation.conditionalDocs && recommendation.conditionalDocs.length > 0 ? (
                    recommendation.conditionalDocs.map(doc => <li key={doc}><i className="fas fa-dot-circle text-[6px] mr-2"></i> {doc}</li>)
                  ) : <li>None applicable</li>}
                </ul>
              </div>
              <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                <h5 className="font-bold text-sm mb-4 flex items-center gap-2 text-red-600"><i className="fas fa-exclamation-triangle"></i> Watch Out</h5>
                <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-400">
                  {recommendation.delayDocs && recommendation.delayDocs.length > 0 ? (
                    recommendation.delayDocs.map(doc => <li key={doc}><i className="fas fa-dot-circle text-[6px] mr-2"></i> {doc}</li>)
                  ) : <li>No common delays identified</li>}
                </ul>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-slate-900/50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estimated In-Branch Time</p>
                <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{recommendation.visitDuration}</p>
              </div>
              <button 
                onClick={() => navigate('/book/open_account')} // Using open_account as dummy for loan desk
                className="w-full md:w-auto px-10 py-4 bg-blue-900 dark:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:bg-blue-800 dark:hover:bg-blue-600 transition-all transform hover:-translate-y-1"
              >
                Book Appointment for {recommendation.deskSuggestion}
              </button>
            </div>

            <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 italic mt-8">
              Disclaimer: This is an AI-based guidance tool. Final eligibility and approval are decided by the bank based on physical verification of documents and credit assessment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanAssistant;
