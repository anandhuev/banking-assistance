
export type ServiceType = 'open_account' | 'kyc_update' | 'passbook_update';

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
  status: 'Scheduled' | 'Not Arrived' | 'In Progress' | 'Completed';
  createdAt: number;
}

export interface DocumentGuidance {
  document: string;
  reason: string;
  procurementMethod: string;
  estimatedWait: string;
}
