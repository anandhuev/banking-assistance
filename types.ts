
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

export interface Branch {
  id: string;
  name: string;
  address: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  crowdTag?: string;
}

export interface Appointment {
  id: string;
  serviceId: ServiceType;
  branchId: string;
  userName: string;
  visitDate: string; // Format: YYYY-MM-DD
  timeSlot: string;
  status: 'Scheduled' | 'Arrived' | 'In Progress' | 'Completed' | 'Cancelled' | 'Missed' | 'Expired';
  createdAt: number;
}

export interface DocumentGuidance {
  document: string;
  reason: string;
  procurementMethod: string;
  estimatedWait: string;
}
