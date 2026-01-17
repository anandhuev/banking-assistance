import { BankService, Branch } from './types';

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

export const STATE_CITY_DATA: Record<string, string[]> = {
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada", "Anantapur", "Kadapa"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Pasighat", "Ziro"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah", "Begusarai", "Katihar", "Munger"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur", "Ambikapur"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Silvassa", "Diu"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Gurugram (NCR)", "Noida (NCR)"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Palampur", "Kullu", "Una"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Kalaburagi", "Davanagere", "Ballari", "Vijayapura", "Shivamogga"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Kannur", "Alappuzha", "Kottayam", "Palakkad"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Rewa", "Satna", "Ratlam", "Dewas"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Navi Mumbai", "Kolhapur", "Akola", "Jalgaon"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur"],
  "Meghalaya": ["Shillong", "Tura", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
  "Puducherry": ["Puducherry", "Karaikal", "Ozhukarai"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Sikar", "Pali"],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Thanjavur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Ambassa"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Prayagraj", "Ghaziabad", "Meerut", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh"],
  "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Howrah", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur"]
};

export const BANK_BRANCHES: Branch[] = []; 

export const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];