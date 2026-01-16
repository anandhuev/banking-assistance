
export type ServiceType = 
  | 'open_account' 
  | 'kyc_update' 
  | 'passbook_update'
  | 'complex_loans'
  | 'kyc_corrections'
  | 'account_mods'
  | 'security_requests'
  | 'business_banking'
  | 'grievance_resolution'
  | 'locker_services'
  | 'senior_banking';

export type CrowdLevel = 'Low' | 'Medium' | 'High';

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
  icon: string;
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

export interface VisitGuidance {
  serviceId: ServiceType;
  complexityReason: string;
  mandatoryDocs: string[];
  conditionalDocs: string[];
  delayDocs: string[];
  readinessScore: number;
  visitDuration: string;
  deskSuggestion: string;
  bestTimeReason: string;
  explanation: string;
}

export interface LoanInput {
  purpose: string;
  amountRange: string;
  employmentType: string;
  hasCoApplicant: boolean;
  hasCollateral: boolean;
  availableDocs: string[];
}

// Added missing LoanRecommendation interface to support complex loan preparation features
export interface LoanRecommendation {
  recommendedLoan: string;
  complexityReason: string;
  mandatoryDocs: string[];
  conditionalDocs: string[];
  delayDocs: string[];
  readinessScore: number;
  visitDuration: string;
  deskSuggestion: string;
  explanation: string;
}
