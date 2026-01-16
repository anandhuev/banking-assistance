
/**
 * Smart Bank Visit Assistant - Visit Orchestration Script
 * Purpose: Provide rule-based AI guidance for all physical bank services.
 */

import { BANK_SERVICES, NEARBY_BRANCHES, TIME_SLOTS } from './constants';
import { Branch, CrowdLevel, VisitGuidance, ServiceType } from './types';

console.log("SmartBank Assistant Core Active");

// Initialize random crowd map once per session to remain stable
const initialCrowdMap: Record<string, Record<string, CrowdLevel>> = {};
NEARBY_BRANCHES.forEach(branch => {
  initialCrowdMap[branch.id] = {};
  TIME_SLOTS.forEach(slot => {
    const rand = Math.random();
    let level: CrowdLevel = 'Low';
    if (rand > 0.65) level = 'Medium';
    if (rand > 0.85) level = 'High';
    initialCrowdMap[branch.id][slot] = level;
  });
});

const state = {
  currentPage: 'login',
  selectedServiceId: null as ServiceType | null,
  selectedBranchId: NEARBY_BRANCHES[0].id,
  selectedSlot: null as string | null,
  docStates: {} as Record<string, boolean | undefined>,
  slotCrowdMap: initialCrowdMap,
  guidance: {
    'Identity Proof (Aadhar/Passport)': 'Required to satisfy AML/KYC regulations for legal identity verification.',
    'Address Proof': 'Used to verify local residency; utility bills or lease agreements are preferred.',
    '2 Passport Photos': 'Necessary for physical record-keeping and ledger verification.',
    'Initial Deposit': 'A minimum balance is required for account activation and transactional readiness.',
    'PAN Card': 'Mandatory for high-value transactions and tax compliance oversight.',
    'Latest Electricity Bill': 'Serves as an official proof of address from a utility provider.',
    'Physical Passbook': 'Original passbook required for manual ledger entry and printing.',
    'Income Proof': 'Essential for evaluating creditworthiness and debt-to-income ratios.',
    'Property/Vehicle Papers': 'Required for lien placement and physical asset valuation.',
    'Trade License': 'Verifies the legal existence and operation of your business entity.',
    'GST Returns': 'Used to verify business cashflow and tax filing regularity.'
  } as Record<string, string>,
  visitGuidance: null as VisitGuidance | null,
  isAnalyzing: false
};

/**
 * Retrieves the stored random crowd level
 */
const getCrowdLevel = (branchId: string, slot: string): CrowdLevel => {
  return state.slotCrowdMap[branchId]?.[slot] || 'Low';
};

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (!root) return;

  const navigateTo = (page: string) => {
    state.currentPage = page;
    if (page === 'appointment') state.selectedSlot = null;
    render();
    window.scrollTo(0, 0);
  };

  const render = () => {
    // Force light mode
    document.documentElement.classList.remove('dark');
    document.body.className = 'light-mode';

    const header = `
      <nav class="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center mb-8 transition-all">
        <div id="logo-home" class="flex items-center space-x-2 cursor-pointer hover:opacity-80">
          <i class="fas fa-university text-2xl"></i>
          <span class="font-bold text-xl tracking-tight">SmartBank Assistant</span>
        </div>
        <div class="flex items-center gap-4">
          ${state.currentPage !== 'login' ? `
            <button id="btn-logout" class="bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded text-xs">Logout</button>
          ` : ''}
        </div>
      </nav>
    `;

    if (state.currentPage === 'login') {
      root.innerHTML = `
        ${header}
        <div class="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
          <div class="text-center mb-8">
            <i class="fas fa-shield-halved text-5xl text-blue-900 mb-4"></i>
            <h1 class="text-2xl font-bold">Visit Planning Portal</h1>
            <p class="text-gray-500 text-sm">Advisor Access</p>
          </div>
          <form id="form-login" class="space-y-6">
            <input type="text" placeholder="Username" class="w-full px-4 py-2 border rounded-lg">
            <input type="password" placeholder="Password" class="w-full px-4 py-2 border rounded-lg">
            <button type="submit" class="w-full bg-blue-900 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-800 transition-colors">Launch Assistant</button>
          </form>
        </div>
      `;
      document.getElementById('form-login')?.addEventListener('submit', (e) => { e.preventDefault(); navigateTo('dashboard'); });

    } else if (state.currentPage === 'dashboard') {
      root.innerHTML = `
        ${header}
        <div class="max-w-6xl mx-auto px-4 pb-12">
          <div class="mb-10 text-center">
            <h2 class="text-4xl font-black tracking-tight">Services Requiring In-Branch Visit</h2>
            <p class="text-gray-500 mt-2">AI-guided preparation for physical banking activities.</p>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${BANK_SERVICES.map(service => `
              <div class="nav-card p-6 bg-white rounded-2xl shadow-xl border-2 border-transparent hover:border-blue-400 cursor-pointer transition-all group" data-id="${service.id}">
                <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i class="fas ${service.icon} text-xl"></i>
                </div>
                <h3 class="font-bold text-lg mb-1">${service.label}</h3>
                <p class="text-xs text-gray-500 mb-4">${service.description}</p>
                <div class="flex justify-between items-center text-[10px] font-black uppercase text-blue-600 tracking-wider">
                  <span>~${service.averageTime} MINS</span>
                  <i class="fas fa-arrow-right"></i>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      document.querySelectorAll('.nav-card').forEach(c => c.addEventListener('click', () => {
        state.selectedServiceId = c.getAttribute('data-id') as ServiceType;
        navigateTo('service-prep');
      }));

    } else if (state.currentPage === 'service-prep') {
      const service = BANK_SERVICES.find(s => s.id === state.selectedServiceId);
      if (!service) return navigateTo('dashboard');

      root.innerHTML = `
        ${header}
        <div class="max-w-4xl mx-auto px-4 pb-12">
          <div class="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all">
            <div class="flex items-center gap-4 mb-8">
              <button id="btn-back" class="text-gray-400 hover:text-gray-600"><i class="fas fa-arrow-left text-xl"></i></button>
              <h2 class="text-2xl font-bold">${service.label} Preparation</h2>
            </div>
            <div class="space-y-4 mb-8">
              ${service.requiredDocuments.map(doc => {
                const isAvail = state.docStates[doc] === true;
                const isNotAvail = state.docStates[doc] === false;
                return `
                  <div class="p-4 bg-gray-50 rounded-xl border border-transparent transition-all">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium">${doc}</span>
                      <div class="flex gap-2">
                        <button class="doc-btn-available px-3 py-1.5 rounded-lg text-[10px] font-bold border ${isAvail ? 'bg-green-600 text-white border-green-600' : 'bg-white border-gray-200 text-gray-500'}" data-doc="${doc}">Available</button>
                        <button class="doc-btn-not-available px-3 py-1.5 rounded-lg text-[10px] font-bold border ${isNotAvail ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200 text-gray-500'}" data-doc="${doc}">Not Available</button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <button id="btn-goto-booking" class="w-full py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 shadow-lg">Proceed to Smart Booking</button>
          </div>
        </div>
      `;
      document.getElementById('btn-back')?.addEventListener('click', () => navigateTo('dashboard'));
      document.querySelectorAll('.doc-btn-available').forEach(b => b.addEventListener('click', () => { state.docStates[b.getAttribute('data-doc')!] = true; render(); }));
      document.querySelectorAll('.doc-btn-not-available').forEach(b => b.addEventListener('click', () => { state.docStates[b.getAttribute('data-doc')!] = false; render(); }));
      document.getElementById('btn-goto-booking')?.addEventListener('click', () => navigateTo('appointment'));

    } else if (state.currentPage === 'appointment') {
      const slotsData = TIME_SLOTS.map(s => ({
        slot: s,
        crowd: getCrowdLevel(state.selectedBranchId, s)
      }));

      // Logic: Prefer Low, then Medium
      let recSlot = slotsData.find(s => s.crowd === 'Low');
      if (!recSlot) recSlot = slotsData.find(s => s.crowd === 'Medium');
      if (!recSlot) recSlot = slotsData[0];

      root.innerHTML = `
        ${header}
        <div class="max-w-6xl mx-auto px-4 pb-12">
          <div class="flex flex-col md:flex-row gap-8">
            <!-- LEFT COLUMN: BRANCHES -->
            <div class="md:w-1/3">
              <h3 class="text-lg font-bold mb-4 uppercase tracking-wider text-gray-500">Nearby Branches</h3>
              <div class="space-y-4">
                ${NEARBY_BRANCHES.map(branch => `
                  <div class="branch-card p-5 bg-white rounded-2xl border-2 cursor-pointer transition-all ${state.selectedBranchId === branch.id ? 'border-blue-500 bg-blue-50/50' : 'border-transparent hover:border-blue-300'}" data-id="${branch.id}">
                    <div class="flex justify-between items-center">
                      <span class="font-bold">${branch.name}</span>
                      <span class="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">${branch.distance} km</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- RIGHT COLUMN: RECOMMENDATION & ALL SLOTS -->
            <div class="md:w-2/3 space-y-8">
              <!-- TOP: AI RECOMMENDATION -->
              <div class="ai-recommendation-box p-8 bg-blue-900 text-white rounded-3xl shadow-2xl relative overflow-hidden">
                <div class="absolute -right-10 -bottom-10 opacity-10">
                  <i class="fas fa-robot text-9xl"></i>
                </div>
                <span class="text-xs font-black uppercase tracking-[0.2em] mb-4 block text-blue-300">AI Recommended Slot</span>
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                  <div>
                    <h2 class="text-5xl font-black mb-1">${recSlot.slot}</h2>
                    <p class="text-blue-100 text-sm">Optimal visit time with <span class="font-bold uppercase">${recSlot.crowd}</span> crowd level.</p>
                  </div>
                  <button class="rec-book-btn bg-white text-blue-900 px-8 py-4 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl" data-slot="${recSlot.slot}">
                    Book Now
                  </button>
                </div>
              </div>

              <!-- BOTTOM: ALL SLOTS -->
              <div>
                <h3 class="text-lg font-bold mb-4 uppercase tracking-wider text-gray-500">All Available Slots</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  ${slotsData.map(item => {
                    let crowdClass = 'slot-low';
                    if (item.crowd === 'Medium') crowdClass = 'slot-medium';
                    if (item.crowd === 'High') crowdClass = 'slot-high';
                    const isSelected = state.selectedSlot === item.slot;
                    const isRecommended = item.slot === recSlot.slot;

                    return `
                      <button class="slot-tile p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${crowdClass} ${isSelected ? 'selected-slot' : ''} ${isRecommended ? 'border-dashed border-blue-400' : ''}" data-slot="${item.slot}">
                        ${isRecommended ? '<span class="text-[8px] font-black text-blue-600 absolute -top-2 bg-white px-2 rounded-full border border-blue-400">AI BEST</span>' : ''}
                        <span class="text-sm font-black">${item.slot}</span>
                        <span class="text-[9px] uppercase font-bold opacity-60">${item.crowd} CROWD</span>
                      </button>
                    `;
                  }).join('')}
                </div>
                <div class="mt-8 flex justify-end">
                   <button id="btn-confirm-booking" class="px-12 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all" ${!state.selectedSlot ? 'disabled' : ''}>
                     Confirm Appointment
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.querySelectorAll('.branch-card').forEach(b => b.addEventListener('click', () => { state.selectedBranchId = b.getAttribute('data-id')!; state.selectedSlot = null; render(); }));
      document.querySelectorAll('.slot-tile').forEach(b => b.addEventListener('click', () => { state.selectedSlot = b.getAttribute('data-slot')!; render(); }));
      document.querySelector('.rec-book-btn')?.addEventListener('click', (e) => { 
        state.selectedSlot = (e.currentTarget as HTMLElement).getAttribute('data-slot')!; 
        document.getElementById('btn-confirm-booking')?.click(); 
      });
      document.getElementById('btn-confirm-booking')?.addEventListener('click', () => {
        alert(`Visit Confirmed! Slot: ${state.selectedSlot} at ${NEARBY_BRANCHES.find(b => b.id === state.selectedBranchId)?.name}`);
        navigateTo('dashboard');
      });
    }

    document.getElementById('logo-home')?.addEventListener('click', () => { if (state.currentPage !== 'login') navigateTo('dashboard'); });
    document.getElementById('btn-logout')?.addEventListener('click', () => navigateTo('login'));
  };

  render();
});