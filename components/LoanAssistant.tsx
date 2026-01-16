
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoanInput, LoanRecommendation } from '../types';
import { getLoanRecommendation } from '../services/geminiService';

const LoanAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<LoanRecommendation | null>(null);
  
  const [inputs, setInputs] = useState<LoanInput>({
    purpose: '',
    incomeRange: '< 25,000',
    employmentType: 'salaried',
    amount: '',
    duration: 'short'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await getLoanRecommendation(inputs);
    setRecommendation(result);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-[#1e293b] p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Loan Guidance Assistant</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
          <i className="fas fa-info-circle mr-2 text-blue-500"></i>
          This is an AI-powered advisory tool. Recommendations are based on general banking rules and do not guarantee final approval or specific interest rates.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose of Loan</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg outline-none"
                value={inputs.purpose}
                onChange={(e) => setInputs({...inputs, purpose: e.target.value})}
                required
              >
                <option value="">Select Purpose</option>
                <option value="Education / Higher Studies">Education / Higher Studies</option>
                <option value="Vehicle / Car / Bike">Vehicle / Car / Bike</option>
                <option value="Home Purchase / Renovation">Home Purchase / Renovation</option>
                <option value="Personal / Travel / Wedding">Personal / Travel / Wedding</option>
                <option value="Business Expansion">Business Expansion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Income Range</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg outline-none"
                value={inputs.incomeRange}
                onChange={(e) => setInputs({...inputs, incomeRange: e.target.value})}
              >
                <option value="< 25,000">Less than 25k</option>
                <option value="25,000 - 50,000">25k - 50k</option>
                <option value="50,000 - 100,000">50k - 100k</option>
                <option value="> 100,000">Above 100k</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employment Type</label>
              <select 
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg outline-none"
                value={inputs.employmentType}
                onChange={(e) => setInputs({...inputs, employmentType: e.target.value as any})}
              >
                <option value="student">Student</option>
                <option value="salaried">Salaried Professional</option>
                <option value="self-employed">Self-Employed / Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approx. Amount Required</label>
              <input 
                type="text"
                placeholder="e.g. 5,00,000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg outline-none"
                value={inputs.amount}
                onChange={(e) => setInputs({...inputs, amount: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Repayment Duration</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setInputs({...inputs, duration: 'short'})}
                className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all ${inputs.duration === 'short' ? 'bg-blue-900 dark:bg-blue-700 border-blue-900 dark:border-blue-700 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'}`}
              >
                Short-term (< 3 yrs)
              </button>
              <button
                type="button"
                onClick={() => setInputs({...inputs, duration: 'long'})}
                className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all ${inputs.duration === 'long' ? 'bg-blue-900 dark:bg-blue-700 border-blue-900 dark:border-blue-700 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400'}`}
              >
                Long-term (5+ yrs)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-900 dark:bg-blue-700 text-white rounded-xl font-bold text-lg hover:bg-blue-800 dark:hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Analyzing Profiles...</>
            ) : (
              <><i className="fas fa-magic"></i> Generate Guidance</>
            )}
          </button>
        </form>

        {recommendation && !loading && (
          <div className="mt-12 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30 animate-in slide-in-from-bottom duration-500">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <i className="fas fa-chart-line text-blue-500"></i> AI Advisory Result
            </h3>
            
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 p-4 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                  <p className="text-[10px] uppercase font-black tracking-widest text-blue-500 mb-1">Recommended</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{recommendation.recommendedLoan}</p>
                </div>
                {recommendation.alternativeLoan && (
                  <div className="flex-1 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm opacity-80">
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Alternative</p>
                    <p className="text-lg font-bold text-gray-600 dark:text-gray-300">{recommendation.alternativeLoan}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <p className="font-bold text-sm text-blue-900 dark:text-blue-300 mb-2">Reasoning & Advisory:</p>
                <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed italic">
                  "{recommendation.explanation}"
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline"
                >
                  Return to Main Dashboard <i className="fas fa-chevron-right ml-1"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanAssistant;
