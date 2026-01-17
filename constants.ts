
import { BankService } from './types';

export const BANK_SERVICES: BankService[] = [
  {
    id: 'open_account',
    label: 'Open New Account',
    description: 'Start your financial journey with a new savings or current account.',
    requiredDocuments: ['Identity Proof (Aadhar/Passport)', 'Address Proof', '2 Passport Photos', 'Initial Deposit'],
    averageTime: 45
  },
  {
    id: 'kyc_update',
    label: 'KYC & Profile Corrections',
    description: 'Update your Know Your Customer details or fix profile errors.',
    requiredDocuments: ['Identity Proof (Aadhar/Passport)', 'PAN Card', 'Latest Electricity Bill'],
    averageTime: 20
  },
  {
    id: 'account_mod',
    label: 'Account Modifications',
    description: 'Change mobile number, update email, or add a nominee.',
    requiredDocuments: ['Identity Proof', 'Request Letter', 'Existing Passbook'],
    averageTime: 30
  },
  {
    id: 'loans',
    label: 'Complex Loan Applications',
    description: 'Apply for home, car, or personal loans with expert guidance.',
    requiredDocuments: ['Identity Proof', 'Income Proof (3 months)', 'Collateral Documents', 'PAN Card'],
    averageTime: 60
  },
  {
    id: 'security',
    label: 'Large Transactions & Security',
    description: 'Authorize high-value transfers or report security concerns.',
    requiredDocuments: ['Identity Proof', 'Special Authorization Form', 'Transaction Slip'],
    averageTime: 40
  },
  {
    id: 'business',
    label: 'Business / MSME Banking',
    description: 'Dedicated services for businesses, startups, and entrepreneurs.',
    requiredDocuments: ['Trade License', 'GST Certificate', 'Business Address Proof', 'Identity Proof of Proprietor'],
    averageTime: 50
  },
  {
    id: 'locker',
    label: 'Locker Services',
    description: 'Rent, access, or manage your secure safe deposit locker.',
    requiredDocuments: ['Identity Proof', '2 Photos', 'Locker Agreement'],
    averageTime: 30
  },
  {
    id: 'grievance',
    label: 'Grievance & Issue Resolution',
    description: 'Formal complaints or resolving complex banking issues.',
    requiredDocuments: ['Grievance Form', 'Support Evidence', 'Identity Proof'],
    averageTime: 25
  },
  {
    id: 'senior',
    label: 'Senior Citizen / Assisted Banking',
    description: 'Priority services and assistance for our senior customers.',
    requiredDocuments: ['Identity Proof (showing age)', 'Address Proof'],
    averageTime: 30
  }
];

export const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];
