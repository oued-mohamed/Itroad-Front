export interface Transaction {
  id: string;
  propertyId: string;
  agentId: string;
  clientId: string;
  type: 'sale' | 'purchase' | 'rental' | 'lease';
  status: TransactionStatus;
  timeline: TransactionTimeline;
  financial: TransactionFinancial;
  parties: TransactionParties;
  documents: string[]; // Document IDs
  milestones: TransactionMilestone[];
  notes: TransactionNote[];
  createdAt: Date;
  updatedAt: Date;
  closingDate?: Date;
  commissionPaid: boolean;
}

export type TransactionStatus = 
  | 'pending'
  | 'under-contract'
  | 'inspection'
  | 'appraisal'
  | 'financing'
  | 'final-walkthrough'
  | 'closing'
  | 'closed'
  | 'cancelled'
  | 'expired';

export interface TransactionTimeline {
  contractDate?: Date;
  inspectionDate?: Date;
  inspectionDeadline?: Date;
  appraisalDate?: Date;
  loanApprovalDate?: Date;
  finalWalkthroughDate?: Date;
  closingDate?: Date;
  possessionDate?: Date;
}

export interface TransactionFinancial {
  salePrice: number;
  listPrice?: number;
  downPayment?: number;
  loanAmount?: number;
  commission: {
    rate: number;
    amount: number;
    split?: number; // percentage for this agent
  };
  expenses: TransactionExpense[];
  earnestMoney?: number;
  closingCosts?: number;
}

export interface TransactionParties {
  buyer: {
    name: string;
    email: string;
    phone: string;
    agent?: string;
  };
  seller: {
    name: string;
    email: string;
    phone: string;
    agent?: string;
  };
  lender?: {
    name: string;
    contact: string;
    loanOfficer: string;
  };
  title?: {
    company: string;
    contact: string;
  };
  inspector?: {
    name: string;
    contact: string;
  };
  appraiser?: {
    name: string;
    contact: string;
  };
}

export interface TransactionMilestone {
  id: string;
  name: string;
  status: 'pending' | 'completed' | 'overdue';
  dueDate: Date;
  completedDate?: Date;
  description?: string;
  responsible: string; // who is responsible
}

export interface TransactionNote {
  id: string;
  content: string;
  agentId: string;
  createdAt: Date;
  type: 'general' | 'important' | 'issue' | 'reminder';
}

export interface TransactionExpense {
  id: string;
  description: string;
  amount: number;
  paidBy: 'buyer' | 'seller' | 'agent' | 'brokerage';
  category: 'commission' | 'marketing' | 'legal' | 'inspection' | 'other';
  date: Date;
}

export interface TransactionFilter {
  status?: TransactionStatus[];
  type?: Transaction['type'][];
  agentId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minAmount?: number;
  maxAmount?: number;
}