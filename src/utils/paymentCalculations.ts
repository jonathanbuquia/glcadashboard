import type {
  DashboardMetrics,
  DistributionDatum,
  Filters,
  ParticularName,
  PaymentData,
  PaymentRow,
  PaymentStatus,
  PaymentTransaction,
  RevenueBreakdown,
  StudentFinance,
  StudentSortKey,
  TotalRow,
  UnpaidRecord,
} from '../types/payment';
import { formatCurrencyPrecise } from './formatters';

export const PARTICULARS: ParticularName[] = [
  'Tuition Fees',
  'Books',
  'Miscellaneous Fees',
];

const EMPTY_PARTICULARS: Record<ParticularName, number> = {
  'Tuition Fees': 0,
  Books: 0,
  'Miscellaneous Fees': 0,
};

const EPSILON = 0.01;

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function cleanText(value: unknown, fallback = 'Unspecified'): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function cloneParticulars() {
  return { ...EMPTY_PARTICULARS };
}

function normalizeParticular(value: unknown): ParticularName {
  const text = cleanText(value, '').toLowerCase();

  if (text === 'b' || text.includes('book')) {
    return 'Books';
  }

  if (text === 'm' || text.includes('misc')) {
    return 'Miscellaneous Fees';
  }

  return 'Tuition Fees';
}

function getExpectedByParticular(row: TotalRow): Record<ParticularName, number> {
  const tuition = toNumber(row.unearnedIncomeTuitionFees);
  const discount = toNumber(row.totalDiscount);

  return {
    // The Excel Totals summary uses TBM less total discounts, so discounts must
    // reduce the expected revenue total even when they exceed tuition alone.
    'Tuition Fees': tuition - discount,
    Books: Math.max(toNumber(row.books), 0),
    'Miscellaneous Fees': Math.max(toNumber(row.unearnedIncomeMiscellaneousFees), 0),
  };
}

function sumParticulars(values: Record<ParticularName, number>): number {
  return PARTICULARS.reduce((total, particular) => total + values[particular], 0);
}

function getPaymentStatus(
  balance: number,
  overpayment: number,
  totalPaid: number,
  overdueAmount: number,
): PaymentStatus {
  if (overdueAmount > EPSILON) {
    return 'Overdue';
  }

  if (overpayment > EPSILON) {
    return 'Overpaid';
  }

  if (balance <= EPSILON) {
    return 'Fully Paid';
  }

  return totalPaid > EPSILON ? 'Partial' : 'With Balance';
}

function parseDate(value?: string): number {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const time = new Date(`${value}T00:00:00`).getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

function matchesParticular(student: StudentFinance, particular: string): boolean {
  if (particular === 'all') {
    return true;
  }

  const selected = particular as ParticularName;
  return (
    student.expectedByParticular[selected] > EPSILON ||
    student.paidByParticular[selected] > EPSILON ||
    student.unpaidByParticular[selected] > EPSILON
  );
}

function createTransactions(rows: PaymentRow[] = []): PaymentTransaction[] {
  return rows
    .map((row) => ({
      studentCode: cleanText(row.code, 'No ID'),
      studentName: cleanText(row.name, 'Unnamed Student'),
      yearLevel: cleanText(row.yearLevel),
      scheme: cleanText(row.scheme),
      date: typeof row.date === 'string' ? row.date : undefined,
      rawParticular: cleanText(row.particulars, 'Tuition Fees'),
      particular: normalizeParticular(row.particulars),
      amountPaid: Math.max(toNumber(row.amountPaid), 0),
    }))
    .filter((payment) => payment.amountPaid > EPSILON);
}

export function buildStudentFinances(data: PaymentData): StudentFinance[] {
  const totals = data.sheets.totals?.rows ?? [];
  const payments = createTransactions(
    data.sheets.paymentsAndBalances?.rows ?? data.sheets.payments?.rows ?? [],
  );
  const paymentsByCode = new Map<string, PaymentTransaction[]>();

  payments.forEach((payment) => {
    const existing = paymentsByCode.get(payment.studentCode) ?? [];
    existing.push(payment);
    paymentsByCode.set(payment.studentCode, existing);
  });

  return totals.map((row) => {
    const code = cleanText(row.code, 'No ID');
    const transactions = paymentsByCode.get(code) ?? [];
    const expectedByParticular = getExpectedByParticular(row);
    const paidByParticular = cloneParticulars();

    transactions.forEach((payment) => {
      paidByParticular[payment.particular] += payment.amountPaid;
    });

    const unpaidByParticular = PARTICULARS.reduce(
      (accumulator, particular) => {
        accumulator[particular] = Math.max(
          expectedByParticular[particular] - paidByParticular[particular],
          0,
        );

        return accumulator;
      },
      cloneParticulars(),
    );
    const totalExpected = sumParticulars(expectedByParticular);
    const totalPaid = sumParticulars(paidByParticular);
    const currentBalance = Math.max(totalExpected - totalPaid, 0);
    const overpayment = Math.max(totalPaid - totalExpected, 0);
    const overdueAmount = 0;
    const paymentStatus = getPaymentStatus(
      currentBalance,
      overpayment,
      totalPaid,
      overdueAmount,
    );
    const upcomingPayables = PARTICULARS.filter(
      (particular) => unpaidByParticular[particular] > EPSILON,
    ).map(
      (particular) =>
        `${particular}: ${formatCurrencyPrecise(unpaidByParticular[particular])}`,
    );

    return {
      code,
      name: cleanText(row.name, 'Unnamed Student'),
      yearLevel: cleanText(row.yearLevel),
      scheme: cleanText(row.scheme),
      expectedByParticular,
      paidByParticular,
      unpaidByParticular,
      totalExpected,
      totalPaid,
      currentBalance,
      overpayment,
      paymentStatus,
      upcomingPayables,
      overdueAmount,
      daysOverdue: 0,
      transactions,
    };
  });
}

export function filterStudents(
  students: StudentFinance[],
  filters: Filters,
): StudentFinance[] {
  const query = filters.search.trim().toLowerCase();

  return students.filter((student) => {
    const queryMatches =
      query.length === 0 ||
      student.name.toLowerCase().includes(query) ||
      student.code.toLowerCase().includes(query);
    const yearMatches =
      filters.yearLevel === 'all' || student.yearLevel === filters.yearLevel;
    const schemeMatches = filters.scheme === 'all' || student.scheme === filters.scheme;
    const statusMatches =
      filters.status === 'all' || student.paymentStatus === filters.status;
    const particularMatches = matchesParticular(student, filters.particular);
    const balanceMatches =
      filters.balanceFilter === 'all' ||
      (filters.balanceFilter === 'hasBalance' && student.currentBalance > EPSILON) ||
      (filters.balanceFilter === 'overdue' && student.overdueAmount > EPSILON) ||
      (filters.balanceFilter === 'fullyPaid' && student.paymentStatus === 'Fully Paid') ||
      (filters.balanceFilter === 'overpaid' && student.overpayment > EPSILON);

    return (
      queryMatches &&
      yearMatches &&
      schemeMatches &&
      statusMatches &&
      particularMatches &&
      balanceMatches
    );
  });
}

export function sortStudents(
  students: StudentFinance[],
  sortKey: StudentSortKey,
): StudentFinance[] {
  const sorted = [...students];

  sorted.sort((left, right) => {
    switch (sortKey) {
      case 'lowestBalance':
        return left.currentBalance - right.currentBalance;
      case 'highestPaid':
        return right.totalPaid - left.totalPaid;
      case 'highestOverpayment':
        return right.overpayment - left.overpayment;
      case 'studentName':
        return left.name.localeCompare(right.name);
      case 'upcomingDueDate':
        return parseDate(left.nextDueDate) - parseDate(right.nextDueDate);
      case 'mostOverdue':
        return right.daysOverdue - left.daysOverdue;
      case 'highestBalance':
      default:
        return right.currentBalance - left.currentBalance;
    }
  });

  return sorted;
}

export function getMetrics(students: StudentFinance[]): DashboardMetrics {
  const totalExpectedRevenue = students.reduce(
    (total, student) => total + student.totalExpected,
    0,
  );
  const totalCollectedAmount = students.reduce(
    (total, student) => total + student.totalPaid,
    0,
  );
  const totalRemainingBalance = students.reduce(
    (total, student) => total + student.currentBalance,
    0,
  );
  const totalOverpayment = students.reduce(
    (total, student) => total + student.overpayment,
    0,
  );
  const totalOverdueAmount = students.reduce(
    (total, student) => total + student.overdueAmount,
    0,
  );

  return {
    totalExpectedRevenue,
    totalCollectedAmount,
    totalRemainingBalance,
    totalOverpayment,
    collectionRate:
      totalExpectedRevenue > EPSILON
        ? (totalCollectedAmount / totalExpectedRevenue) * 100
        : 0,
    // Fully paid means the account has no remaining collectible balance.
    // Overpaid accounts are counted here too, then separately reported as overpayment.
    fullyPaidStudents: students.filter((student) => student.currentBalance <= EPSILON)
      .length,
    studentsWithBalance: students.filter((student) => student.currentBalance > EPSILON)
      .length,
    studentsWithOverdue: students.filter((student) => student.overdueAmount > EPSILON)
      .length,
    totalOverdueAmount,
    totalUnpaidAmount: totalRemainingBalance,
    highestIndividualBalance: Math.max(
      0,
      ...students.map((student) => student.currentBalance),
    ),
  };
}

export function getRevenueBreakdown(
  students: StudentFinance[],
): RevenueBreakdown[] {
  return PARTICULARS.map((particular) => {
    const expectedRevenue = students.reduce(
      (total, student) => total + student.expectedByParticular[particular],
      0,
    );
    const collectedAmount = students.reduce(
      (total, student) => total + student.paidByParticular[particular],
      0,
    );
    const remainingBalance = Math.max(expectedRevenue - collectedAmount, 0);
    const overpayment = Math.max(collectedAmount - expectedRevenue, 0);

    return {
      particular,
      expectedRevenue,
      collectedAmount,
      remainingBalance,
      overpayment,
      collectionRate:
        expectedRevenue > EPSILON ? (collectedAmount / expectedRevenue) * 100 : 0,
    };
  });
}

export function getDistribution(
  students: StudentFinance[],
  key: 'yearLevel' | 'scheme',
): DistributionDatum[] {
  const counts = new Map<string, number>();

  students.forEach((student) => {
    counts.set(student[key], (counts.get(student[key]) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);
}

export function getUnpaidRecords(students: StudentFinance[]): UnpaidRecord[] {
  return students.flatMap((student) =>
    PARTICULARS.filter((particular) => student.unpaidByParticular[particular] > EPSILON).map(
      (particular) => ({
        studentCode: student.code,
        studentName: student.name,
        yearLevel: student.yearLevel,
        scheme: student.scheme,
        unpaidParticular: particular,
        amountDue: student.unpaidByParticular[particular],
        daysOverdue: student.daysOverdue,
        paymentStatus: student.overdueAmount > EPSILON ? 'Overdue' : 'With Balance',
      }),
    ),
  );
}

export function getUniqueOptions(
  students: StudentFinance[],
  key: 'yearLevel' | 'scheme' | 'paymentStatus',
): string[] {
  return [...new Set(students.map((student) => student[key]))].sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true }),
  );
}
