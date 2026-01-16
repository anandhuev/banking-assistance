
export type ServiceType = 'open_account' | 'kyc_update' | 'passbook_update';

export type CrowdLevel = 'Low' | 'Medium' | 'Busy';

export interface Branch {
  id: string;
  name: string;
  distance: number; // in km
}

export interface BankService {
  id: ServiceType;
  label: string;
  description: string;
  requiredDocuments: string[];
  averageTime: number; // minutes
}

export interface Appointment {
  id: string;
  serviceId: ServiceType;
  userName: string;
  branchName: string;
  timeSlot: string;
  status: 'Scheduled' | 'Not Arrived' | 'In Progress' | 'Completed';
  createdAt: number;
}

export interface DocumentGuidance {
  document: string;
  reason: string;
  procurementMethod: string;
  estimatedWait: string;
}

export interface LoanRecommendation {
  recommendedLoan: string;
  alternativeLoan?: string;
  explanation: string;
}

export interface LoanInput {
  purpose: string;
  incomeRange: string;
  employmentType: 'student' | 'salaried' | 'self-employed';
  amount: string;
  duration: 'short' | 'long';
}
