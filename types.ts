
export type ServiceType = 
  | 'open_account' 
  | 'kyc_update' 
  | 'account_mod' 
  | 'loans' 
  | 'security' 
  | 'business' 
  | 'locker' 
  | 'grievance' 
  | 'senior';

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
  timeSlot: string;
  status: 'Scheduled' | 'Arrived' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: number;
}

export interface DocumentGuidance {
  document: string;
  reason: string;
  procurementMethod: string;
  estimatedWait: string;
}
