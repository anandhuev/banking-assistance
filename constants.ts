import { BankService, Branch } from './types';

export const BANK_SERVICES: BankService[] = [
  {
    id: 'open_account',
    label: 'Open Savings Account',
    description: 'Start your financial journey with a new savings account.',
    requiredDocuments: ['Identity Proof (Aadhar/Passport)', 'Address Proof', '2 Passport Photos', 'Initial Deposit'],
    averageTime: 45
  },
  {
    id: 'kyc_update',
    label: 'KYC Update',
    description: 'Update your Know Your Customer details for continued service.',
    requiredDocuments: ['Identity Proof (Aadhar/Passport)', 'PAN Card', 'Latest Electricity Bill'],
    averageTime: 20
  },
  {
    id: 'passbook_update',
    label: 'Passbook / Statement Update',
    description: 'Get your physical passbook printed or request a formal statement.',
    requiredDocuments: ['Physical Passbook', 'Identity Proof'],
    averageTime: 10
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