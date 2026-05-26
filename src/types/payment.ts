export type PaymentStatus =
  | 'Fully Paid'
  | 'With Balance'
  | 'Partial'
  | 'Overpaid'
  | 'Overdue'
  | 'Upcoming';

export type ParticularName =
  | 'Tuition Fees'
  | 'Books'
  | 'Miscellaneous Fees';

export type BalanceFilter =
  | 'all'
  | 'hasBalance'
  | 'overdue'
  | 'fullyPaid'
  | 'overpaid';

export type StudentSortKey =
  | 'highestBalance'
  | 'lowestBalance'
  | 'highestPaid'
  | 'highestOverpayment'
  | 'yearLevel';

export type OverdueSortKey = 'highestAmount' | 'oldestDueDate' | 'mostDaysOverdue';

export interface SheetHeader {
  key: string;
  label: string;
}

export interface SourceSheet<Row> {
  sheetName: string;
  headers: SheetHeader[];
  rows: Row[];
}

export interface TotalRow {
  yearLevel?: string;
  code?: string;
  name?: string;
  scheme?: string;
  unearnedIncomeTuitionFees?: number;
  books?: number;
  unearnedIncomeMiscellaneousFees?: number;
  totalDiscount?: number;
  [key: string]: unknown;
}

export interface PaymentRow {
  yearLevel?: string;
  code?: string;
  name?: string;
  scheme?: string;
  date?: string;
  particulars?: string;
  amountPaid?: number;
  [key: string]: unknown;
}

export interface PaymentData {
  sourceWorkbook: string;
  sheets: {
    totals?: SourceSheet<TotalRow>;
    paymentsAndBalances?: SourceSheet<PaymentRow>;
    payments?: SourceSheet<PaymentRow>;
    balances?: SourceSheet<Record<string, unknown>>;
    [key: string]: SourceSheet<Record<string, unknown>> | undefined;
  };
}

export interface Filters {
  search: string;
  yearLevel: string;
  scheme: string;
  status: string;
  particular: string;
  balanceFilter: BalanceFilter;
}

export interface PaymentTransaction {
  studentCode: string;
  studentName: string;
  yearLevel: string;
  scheme: string;
  date?: string;
  rawParticular: string;
  particular: ParticularName;
  amountPaid: number;
}

export interface StudentFinance {
  code: string;
  name: string;
  yearLevel: string;
  scheme: string;
  expectedByParticular: Record<ParticularName, number>;
  paidByParticular: Record<ParticularName, number>;
  unpaidByParticular: Record<ParticularName, number>;
  totalExpected: number;
  totalPaid: number;
  currentBalance: number;
  overpayment: number;
  paymentStatus: PaymentStatus;
  nextDueDate?: string;
  upcomingPayables: string[];
  overdueAmount: number;
  daysOverdue: number;
  transactions: PaymentTransaction[];
}

export interface RevenueBreakdown {
  particular: ParticularName;
  expectedRevenue: number;
  collectedAmount: number;
  remainingBalance: number;
  overpayment: number;
  collectionRate: number;
}

export interface DashboardMetrics {
  totalExpectedRevenue: number;
  totalCollectedAmount: number;
  totalRemainingBalance: number;
  totalOverpayment: number;
  collectionRate: number;
  fullyPaidStudents: number;
  studentsWithBalance: number;
  studentsWithOverdue: number;
  totalOverdueAmount: number;
  totalUnpaidAmount: number;
  highestIndividualBalance: number;
}

export interface DistributionDatum {
  name: string;
  value: number;
}

export interface UnpaidRecord {
  studentCode: string;
  studentName: string;
  yearLevel: string;
  scheme: string;
  unpaidParticular: ParticularName;
  dueDate?: string;
  amountDue: number;
  daysOverdue: number;
  paymentStatus: PaymentStatus;
}
