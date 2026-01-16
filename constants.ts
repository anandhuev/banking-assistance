
import { BankService, Branch } from './types';

export const BANK_SERVICES: BankService[] = [
  {
    id: 'open_account',
    label: 'Open Savings Account',
    description: 'Start your financial journey with a new savings account.',
    requiredDocuments: ['Identity Proof (Aadhar/Passport)', 'Address Proof', '2 Passport Photos', 'Initial Deposit'],
    averageTime: 45,
    icon: 'fa-user-plus'
  },
  {
    id: 'kyc_update',
    label: 'KYC Update',
    description: 'Update your Know Your Customer details for continued service.',
    requiredDocuments: ['Identity Proof (Aadhar/Passport)', 'PAN Card', 'Latest Electricity Bill'],
    averageTime: 20,
    icon: 'fa-id-card'
  },
  {
    id: 'passbook_update',
    label: 'Passbook / Statement Update',
    description: 'Get your physical passbook printed or request a formal statement.',
    requiredDocuments: ['Physical Passbook', 'Identity Proof'],
    averageTime: 10,
    icon: 'fa-book-open'
  },
  {
    id: 'complex_loans',
    label: 'Complex Loan Applications',
    description: 'High-value, collateral-based loans (Home, Business, Vehicle).',
    requiredDocuments: ['Income Proof', 'Identity Proof', 'Property/Vehicle Papers', 'Bank Statements'],
    averageTime: 60,
    icon: 'fa-file-invoice-dollar'
  },
  {
    id: 'kyc_corrections',
    label: 'KYC & Profile Corrections',
    description: 'Correction in Name, DOB, or Signature requiring physical proof.',
    requiredDocuments: ['Gazette Notification/Old ID', 'New ID Proof', 'Physical Application'],
    averageTime: 30,
    icon: 'fa-user-pen'
  },
  {
    id: 'account_mods',
    label: 'Account Modifications',
    description: 'Adding joint holders, account conversion, or closure requests.',
    requiredDocuments: ['Joint Holder KYC', 'Modification Form', 'Unused Cheque Leaves'],
    averageTime: 35,
    icon: 'fa-user-gear'
  },
  {
    id: 'security_requests',
    label: 'Security & Large Transactions',
    description: 'Physical verification for high-value transfers or limit overrides.',
    requiredDocuments: ['Identity Proof', 'Transaction Details', 'Written Consent'],
    averageTime: 25,
    icon: 'fa-shield-halved'
  },
  {
    id: 'business_banking',
    label: 'Business / MSME Requests',
    description: 'Corporate account opening or MSME banking audits.',
    requiredDocuments: ['Trade License', 'GST Returns', 'Partnership Deed', 'Company PAN'],
    averageTime: 50,
    icon: 'fa-briefcase'
  },
  {
    id: 'grievance_resolution',
    label: 'Grievance & Issue Resolution',
    description: 'Escalated disputes or mediation requiring in-person discussion.',
    requiredDocuments: ['Complaint Reference', 'Supporting Evidence', 'Identity Proof'],
    averageTime: 40,
    icon: 'fa-comments'
  },
  {
    id: 'locker_services',
    label: 'Locker Services',
    description: 'Access to lockers, renewals, or safe deposit agreements.',
    requiredDocuments: ['Locker Key', 'Identity Proof', 'Agreement Copy'],
    averageTime: 15,
    icon: 'fa-key'
  },
  {
    id: 'senior_banking',
    label: 'Senior / Assisted Banking',
    description: 'Dedicated priority assistance for seniors and accessibility needs.',
    requiredDocuments: ['Pension Book/ID', 'Identity Proof'],
    averageTime: 30,
    icon: 'fa-hands-helping'
  }
];

export const NEARBY_BRANCHES: Branch[] = [
  { id: 'b1', name: 'Downtown Main Branch', distance: 0.8 },
  { id: 'b3', name: 'Metro Square Hub', distance: 1.2 },
  { id: 'b2', name: 'Westside Business Park', distance: 2.4 },
  { id: 'b4', name: 'Suburban Plaza Branch', distance: 5.1 }
];

export const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
];
