import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Banknote,
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  SearchCheck,
  UserRoundCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import rawPaymentData from './data/paymentData.json';
import {
  DistributionChart,
  RevenueBreakdownChart,
  RevenueComparisonChart,
} from './components/DashboardChart';
import { FilterPanel } from './components/FilterPanel';
import { KPICard } from './components/KPICard';
import { OverviewCards } from './components/OverviewCards';
import { StudentPaymentTable } from './components/StudentPaymentTable';
import type {
  Filters,
  OverdueSortKey,
  PaymentData,
  StudentFinance,
  StudentSortKey,
  UnpaidRecord,
} from './types/payment';
import {
  buildStudentFinances,
  filterStudents,
  getDistribution,
  getMetrics,
  getRevenueBreakdown,
  getUniqueOptions,
  getUnpaidRecords,
  sortStudents,
} from './utils/paymentCalculations';
import {
  formatCurrency,
  formatCurrencyPrecise,
  formatNumber,
  formatPaymentScheme,
  formatStudentInitials,
} from './utils/formatters';

const paymentData = rawPaymentData as PaymentData;

const sections = [
  {
    id: 'overview',
    label: 'Executive Finance Summary',
    shortLabel: 'Overview',
    description: 'Revenue position, collection performance, and account health',
    icon: LayoutDashboard,
  },
  {
    id: 'revenue',
    label: 'Revenue Analysis',
    shortLabel: 'Revenue',
    description: 'Collected, remaining, and overpayment totals by year level',
    icon: BarChart3,
  },
  {
    id: 'students',
    label: 'Student Accounts',
    shortLabel: 'Students',
    description: 'Searchable student-level ledger and balance monitoring',
    icon: Users,
  },
  {
    id: 'collections',
    label: 'Collection Follow-Up',
    shortLabel: 'Follow-Up',
    description: 'Unpaid accounts and practical collection priorities',
    icon: ClipboardList,
  },
] satisfies readonly {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
}[];
type DashboardSection = (typeof sections)[number]['id'];

const initialFilters: Filters = {
  search: '',
  yearLevel: 'all',
  scheme: 'all',
  status: 'all',
  particular: 'all',
  balanceFilter: 'all',
};

function App() {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [studentSort, setStudentSort] = useState<StudentSortKey>('highestBalance');
  const [overdueSort] = useState<OverdueSortKey>('highestAmount');

  const students = useMemo(() => buildStudentFinances(paymentData), []);
  const filteredStudents = useMemo(
    () => filterStudents(students, filters),
    [filters, students],
  );
  const revenueFilteredStudents = useMemo(
    () =>
      filterStudents(students, {
        ...initialFilters,
        scheme: filters.scheme,
      }),
    [filters.scheme, students],
  );
  const sortedStudents = useMemo(
    () => sortStudents(filteredStudents, studentSort),
    [filteredStudents, studentSort],
  );
  const dashboardStudents =
    activeSection === 'overview'
      ? students
      : activeSection === 'revenue'
        ? revenueFilteredStudents
        : filteredStudents;
  const metrics = useMemo(() => getMetrics(dashboardStudents), [dashboardStudents]);
  const revenueBreakdown = useMemo(
    () => getRevenueBreakdown(dashboardStudents),
    [dashboardStudents],
  );
  const yearLevelDistribution = useMemo(
    () => getDistribution(dashboardStudents, 'yearLevel'),
    [dashboardStudents],
  );
  const schemeDistribution = useMemo(
    () =>
      getDistribution(dashboardStudents, 'scheme').map((item) => ({
        ...item,
        name: formatPaymentScheme(item.name),
      })),
    [dashboardStudents],
  );
  const unpaidRecords = useMemo(
    () => sortUnpaidRecords(getUnpaidRecords(dashboardStudents), overdueSort),
    [dashboardStudents, overdueSort],
  );
  const yearLevels = useMemo(() => getUniqueOptions(students, 'yearLevel'), [students]);
  const schemes = useMemo(() => getUniqueOptions(students, 'scheme'), [students]);
  const statuses = useMemo(() => getUniqueOptions(students, 'paymentStatus'), [students]);
  const accountsWithBalance = useMemo(
    () =>
      [...dashboardStudents]
        .filter((student) => student.currentBalance > 0.01)
        .sort((a, b) => b.currentBalance - a.currentBalance),
    [dashboardStudents],
  );

  if (!paymentData.sheets.totals || !paymentData.sheets.paymentsAndBalances) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
        <section className="max-w-xl rounded-lg border border-rose-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-950">Payment data unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">
            The dashboard expected `totals` and `paymentsAndBalances` sections in
            `src/data/paymentData.json`.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white text-slate-950 lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:shrink-0 lg:border-b-0 lg:border-r lg:border-slate-800 lg:bg-slate-950 lg:text-white">
          <div className="flex h-full flex-col gap-6 p-5">
            <div>
              <h1 className="text-2xl font-bold tracking-normal">
                GLCA Dashboard
              </h1>
            </div>

            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <button
                    className={`group flex min-w-40 items-center gap-3 rounded-md px-3 py-3 text-left transition lg:min-w-0 ${
                      activeSection === section.id
                        ? 'bg-slate-950 text-white shadow-sm lg:bg-white lg:text-slate-950'
                        : 'text-slate-700 hover:bg-slate-100 lg:text-slate-300 lg:hover:bg-slate-900 lg:hover:text-white'
                    }`}
                    type="button"
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${
                        activeSection === section.id
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-teal-700 group-hover:bg-slate-200 lg:bg-slate-800 lg:text-teal-200 lg:group-hover:bg-slate-700'
                      }`}
                      aria-hidden="true"
                    >
                      <Icon size={19} strokeWidth={2.2} />
                    </span>
                    <span className="block text-sm font-bold">{section.shortLabel}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white px-4 py-5 lg:px-8">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
              <div>
                {activeSection === 'revenue' || activeSection === 'students' ? (
                  <p className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
                    {getSectionHeading(activeSection)}
                  </p>
                ) : (
                  <>
                    <p className="text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
                      {sections.find((section) => section.id === activeSection)?.label}
                    </p>
                    {activeSection !== 'overview' && activeSection !== 'collections' ? (
                      <>
                        <h2 className="mt-2 text-xl font-bold tracking-normal text-slate-950 md:text-2xl">
                          {getSectionHeading(activeSection)}
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                          {getSectionDescription(activeSection)}
                        </p>
                      </>
                    ) : null}
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4 xl:min-w-[560px] lg:hidden">
                <MiniStat label="Students" value={formatNumber(students.length)} />
                <MiniStat
                  label="Payments"
                  value={formatNumber(
                    paymentData.sheets.paymentsAndBalances?.rows.length ?? 0,
                  )}
                />
                <MiniStat label="Filtered" value={formatNumber(filteredStudents.length)} />
                <MiniStat label="Unpaid Items" value={formatNumber(unpaidRecords.length)} />
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-6 px-4 py-6 lg:px-8">
            {activeSection !== 'overview' ? (
              <>
                <FilterPanel
                  filters={filters}
                  sortKey={studentSort}
                  yearLevels={yearLevels}
                  schemes={schemes}
                  statuses={statuses}
                  mode={activeSection === 'revenue' ? 'schemeOnly' : 'full'}
                  onFilterChange={setFilters}
                  onSortChange={setStudentSort}
                />

              </>
            ) : null}

            {activeSection === 'overview' ? (
              <OverviewTab
                metrics={metrics}
                revenueBreakdown={revenueBreakdown}
                yearLevelDistribution={yearLevelDistribution}
                schemeDistribution={schemeDistribution}
              />
            ) : null}

            {activeSection === 'students' ? (
              <StudentsTab metrics={metrics} students={sortedStudents} />
            ) : null}

            {activeSection === 'revenue' ? (
              <ParticularsTab
                metrics={metrics}
                students={revenueFilteredStudents}
                selectedScheme={
                  filters.scheme === 'all'
                    ? 'All payment schemes'
                    : formatPaymentScheme(filters.scheme)
                }
              />
            ) : null}

            {activeSection === 'collections' ? (
              <OverdueTab
                metrics={metrics}
                rows={unpaidRecords}
                accountsWithBalance={accountsWithBalance}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
  dark?: boolean;
}

function MiniStat({ label, value, dark = false }: MiniStatProps) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          dark ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        {label}
      </p>
      <p className={`mt-1 text-lg font-bold ${dark ? 'text-white' : 'text-slate-950'}`}>
        {value}
      </p>
    </div>
  );
}

interface OverviewTabProps {
  metrics: ReturnType<typeof getMetrics>;
  revenueBreakdown: ReturnType<typeof getRevenueBreakdown>;
  yearLevelDistribution: ReturnType<typeof getDistribution>;
  schemeDistribution: ReturnType<typeof getDistribution>;
}

function OverviewTab({
  metrics,
  revenueBreakdown,
  yearLevelDistribution,
  schemeDistribution,
}: OverviewTabProps) {
  return (
    <>
      <CardCategory title="Revenue Health">
        <OverviewCards metrics={metrics} variant="revenue" />
      </CardCategory>
      <CardCategory title="Account Status">
        <OverviewCards metrics={metrics} variant="accounts" />
      </CardCategory>
      <section className="grid gap-4 xl:grid-cols-2">
        <RevenueComparisonChart
          expected={metrics.totalExpectedRevenue}
          collected={metrics.totalCollectedAmount}
        />
        <RevenueBreakdownChart data={revenueBreakdown} />
        <DistributionChart
          title="Student Distribution by Year Level"
          data={yearLevelDistribution}
        />
        <DistributionChart
          title="Student Distribution by Payment Scheme"
          data={schemeDistribution}
        />
      </section>
    </>
  );
}

interface ParticularsTabProps {
  metrics: ReturnType<typeof getMetrics>;
  students: StudentFinance[];
  selectedScheme: string;
}

function ParticularsTab({ metrics, students, selectedScheme }: ParticularsTabProps) {
  const rows = getYearLevelRevenueRows(students);

  return (
    <>
      <CardCategory title="Revenue Summary">
        <KPICard
          label="Expected Revenue"
          value={formatCurrency(metrics.totalExpectedRevenue)}
          detail="Target collectible amount"
          tone="info"
          icon={CircleDollarSign}
        />
        <KPICard
          label="Collected Amount"
          value={formatCurrency(metrics.totalCollectedAmount)}
          detail="Total payments received"
          tone="success"
          icon={Banknote}
        />
        <KPICard
          label="Still Collectible"
          value={formatCurrency(metrics.totalRemainingBalance)}
          detail="Open balance to collect"
          tone="warning"
          icon={WalletCards}
        />
        <KPICard
          label="Overpayment"
          value={formatCurrency(metrics.totalOverpayment)}
          detail="Payments above account target"
          tone="info"
          icon={PiggyBank}
        />
      </CardCategory>
      <YearLevelRevenueSummary
        rows={rows}
        schemeLabel={selectedScheme}
      />
    </>
  );
}

interface YearLevelRevenueRow {
  yearLevel: string;
  collected: number;
  remaining: number;
  overpayment: number;
}

interface YearLevelRevenueSummaryProps {
  rows: YearLevelRevenueRow[];
  schemeLabel: string;
}

function YearLevelRevenueSummary({ rows, schemeLabel }: YearLevelRevenueSummaryProps) {
  const totals = rows.reduce(
    (summary, row) => ({
      collected: summary.collected + row.collected,
      remaining: summary.remaining + row.remaining,
      overpayment: summary.overpayment + row.overpayment,
    }),
    { collected: 0, remaining: 0, overpayment: 0 },
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950">
            Revenue Summary by Year Level
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Filtered by payment scheme: {schemeLabel}
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-600">
          {formatNumber(rows.length)} year levels
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No revenue records match the selected payment scheme.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          <RevenueLedgerBlock
            title="Collected"
            rows={rows}
            valueKey="collected"
            total={totals.collected}
            totalClassName="bg-yellow-200"
          />
          <RevenueLedgerBlock
            title="Total Remaining"
            rows={rows}
            valueKey="remaining"
            total={totals.remaining}
            totalClassName="bg-violet-200"
          />
          <RevenueLedgerBlock
            title="Overpayment"
            rows={rows}
            valueKey="overpayment"
            total={totals.overpayment}
            totalClassName="bg-emerald-200"
          />
        </div>
      )}
    </section>
  );
}

interface RevenueLedgerBlockProps {
  title: string;
  rows: YearLevelRevenueRow[];
  valueKey: 'collected' | 'remaining' | 'overpayment';
  total: number;
  totalClassName: string;
}

function RevenueLedgerBlock({
  title,
  rows,
  valueKey,
  total,
  totalClassName,
}: RevenueLedgerBlockProps) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-300 bg-white">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-50">
            <th className="px-3 py-2 text-left text-base font-bold text-slate-950">
              {title}
            </th>
            <th className="px-3 py-2 text-right text-base font-bold text-slate-950">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-slate-200" key={`${title}-${row.yearLevel}`}>
              <td className="px-3 py-2 font-bold text-slate-950">{row.yearLevel}</td>
              <td className="px-3 py-2 text-right font-medium tabular-nums text-slate-900">
                {formatCurrencyPrecise(row[valueKey])}
              </td>
            </tr>
          ))}
          <tr>
            <td className="px-3 py-3 font-medium text-slate-800">Total</td>
            <td className={`px-3 py-3 text-right font-bold tabular-nums text-slate-950 ${totalClassName}`}>
              {formatCurrencyPrecise(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function getYearLevelRevenueRows(students: StudentFinance[]): YearLevelRevenueRow[] {
  const byYearLevel = new Map<string, YearLevelRevenueRow>();

  students.forEach((student) => {
    const current = byYearLevel.get(student.yearLevel) ?? {
      yearLevel: student.yearLevel,
      collected: 0,
      remaining: 0,
      overpayment: 0,
    };

    current.collected += student.totalPaid;
    current.remaining += student.currentBalance;
    current.overpayment += student.overpayment;
    byYearLevel.set(student.yearLevel, current);
  });

  return [...byYearLevel.values()].sort((left, right) =>
    sortYearLevels(left.yearLevel, right.yearLevel),
  );
}

function sortYearLevels(left: string, right: string) {
  return getYearLevelRank(left) - getYearLevelRank(right);
}

function getYearLevelRank(yearLevel: string) {
  if (yearLevel === 'K2') {
    return 0;
  }

  const match = /^G(\d+)$/i.exec(yearLevel);

  if (match) {
    return Number(match[1]);
  }

  return 999;
}

interface StudentsTabProps {
  metrics: ReturnType<typeof getMetrics>;
  students: ReturnType<typeof buildStudentFinances>;
}

function StudentsTab({ metrics, students }: StudentsTabProps) {
  return (
    <>
      <CardCategory title="Student Account Snapshot">
        <KPICard
          label="Filtered Students"
          value={formatNumber(students.length)}
          detail="Accounts in current view"
          icon={Users}
        />
        <KPICard
          label="Fully Paid"
          value={formatNumber(metrics.fullyPaidStudents)}
          detail="Accounts with no balance"
          tone="success"
          icon={UserRoundCheck}
        />
        <KPICard
          label="With Balance"
          value={formatNumber(metrics.studentsWithBalance)}
          detail="Accounts still collectible"
          tone="warning"
          icon={ReceiptText}
        />
      </CardCategory>
      <StudentPaymentTable students={students} />
    </>
  );
}

interface OverdueTabProps {
  metrics: ReturnType<typeof getMetrics>;
  rows: ReturnType<typeof getUnpaidRecords>;
  accountsWithBalance: StudentFinance[];
}

function OverdueTab({
  metrics,
  rows,
  accountsWithBalance,
}: OverdueTabProps) {
  return (
    <>
      <CardCategory title="Collection Queue">
        <KPICard
          label="Unpaid Particulars"
          value={formatNumber(rows.length)}
          detail="Fee items still unpaid"
          tone="warning"
          icon={ReceiptText}
        />
        <KPICard
          label="Highest Individual Balance"
          value={formatCurrency(metrics.highestIndividualBalance)}
          detail="Largest open student balance"
          tone="warning"
          icon={Gauge}
        />
      </CardCategory>
      <section className="grid gap-4 xl:grid-cols-2">
        <BalanceAccountsPanel accounts={accountsWithBalance} />
        <FollowUpGuidancePanel
          accounts={accountsWithBalance}
          unpaidLineItems={rows.length}
          totalBalance={metrics.totalRemainingBalance}
        />
      </section>
    </>
  );
}

interface BalanceAccountsPanelProps {
  accounts: StudentFinance[];
}

function BalanceAccountsPanel({ accounts }: BalanceAccountsPanelProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Accounts With Balance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Brief list of student accounts with remaining collectible balance.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
            {formatNumber(accounts.length)}
          </span>
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto p-3">
        {accounts.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No accounts currently have a balance.
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((student, index) => (
              <article
                className="rounded-md border border-slate-200 bg-slate-50 p-3"
                key={student.code}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-md bg-slate-900 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-950">
                          {formatStudentInitials(student.name)}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {student.code} | {student.yearLevel} |{' '}
                          {formatPaymentScheme(student.scheme)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-amber-700">
                      {formatCurrency(student.currentBalance)}
                    </p>
                    <p className="text-xs text-slate-500">balance</p>
                  </div>
                </div>

                {student.upcomingPayables.length > 0 ? (
                  <div className="mt-3 grid gap-1 rounded-md bg-white p-2 text-xs text-slate-600">
                    {student.upcomingPayables.map((payable) => (
                      <span key={`${student.code}-${payable}`}>{payable}</span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface FollowUpGuidancePanelProps {
  accounts: StudentFinance[];
  unpaidLineItems: number;
  totalBalance: number;
}

function FollowUpGuidancePanel({
  accounts,
  unpaidLineItems,
  totalBalance,
}: FollowUpGuidancePanelProps) {
  const averageBalance = accounts.length > 0 ? totalBalance / accounts.length : 0;
  const topYearLevel = getTopGroup(accounts, 'yearLevel');
  const topScheme = getTopGroup(accounts, 'scheme');
  const highPriority = accounts.filter(
    (student) => student.currentBalance >= averageBalance && averageBalance > 0,
  ).length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-950">Follow-Up Guidance</h2>
      <p className="mt-1 text-sm text-slate-500">
        Collection focus based on accounts with remaining balances.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <GuidanceMetric label="Accounts to contact" value={formatNumber(accounts.length)} />
        <GuidanceMetric label="Unpaid fee items" value={formatNumber(unpaidLineItems)} />
        <GuidanceMetric label="Total open balance" value={formatCurrency(totalBalance)} />
        <GuidanceMetric label="Average balance" value={formatCurrency(averageBalance)} />
      </div>

      <div className="mt-4 space-y-3">
        <GuidanceCallout
          label="Highest priority"
          value={`${formatNumber(highPriority)} account${highPriority === 1 ? '' : 's'}`}
          detail="Accounts at or above the average open balance."
          tone="warning"
        />
        <GuidanceCallout
          label="Year level focus"
          value={topYearLevel ? `${topYearLevel.name} (${topYearLevel.count})` : 'None'}
          detail="Year level with the most balance accounts."
        />
        <GuidanceCallout
          label="Payment scheme focus"
          value={
            topScheme
              ? `${formatPaymentScheme(topScheme.name)} (${topScheme.count})`
              : 'None'
          }
          detail="Payment scheme with the most balance accounts."
        />
      </div>
    </section>
  );
}

interface GuidanceMetricProps {
  label: string;
  value: string;
}

function GuidanceMetric({ label, value }: GuidanceMetricProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

interface GuidanceCalloutProps {
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'warning';
}

function GuidanceCallout({
  label,
  value,
  detail,
  tone = 'neutral',
}: GuidanceCalloutProps) {
  return (
    <div
      className={`rounded-md border p-3 ${
        tone === 'warning'
          ? 'border-amber-200 bg-amber-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-950">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <p className="shrink-0 text-right text-sm font-bold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function getTopGroup(accounts: StudentFinance[], key: 'yearLevel' | 'scheme') {
  const counts = new Map<string, number>();

  accounts.forEach((account) => {
    counts.set(account[key], (counts.get(account[key]) ?? 0) + 1);
  });

  const [top] = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count);

  return top;
}

interface CardCategoryProps {
  title: string;
  children: ReactNode;
}

function CardCategory({ title, children }: CardCategoryProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">
          {title}
        </h3>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}

interface InsightPanelProps {
  title: string;
  children: ReactNode;
}

function InsightPanel({ title, children }: InsightPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      <div className="mt-4 divide-y divide-slate-100">{children}</div>
    </section>
  );
}

interface InsightRowProps {
  label: string;
  value: string;
  detail?: string;
}

function InsightRow({ label, value, detail }: InsightRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="font-semibold text-slate-800">{label}</p>
        {detail ? <p className="mt-1 text-xs text-slate-500">{detail}</p> : null}
      </div>
      <p className="shrink-0 text-right font-bold text-slate-950">{value}</p>
    </div>
  );
}

function sortUnpaidRecords(rows: UnpaidRecord[], sortKey: OverdueSortKey) {
  return [...rows].sort((left, right) => {
    switch (sortKey) {
      case 'oldestDueDate':
        return (left.dueDate ?? '').localeCompare(right.dueDate ?? '');
      case 'mostDaysOverdue':
        return right.daysOverdue - left.daysOverdue;
      case 'highestAmount':
      default:
        return right.amountDue - left.amountDue;
    }
  });
}

function getSectionHeading(section: DashboardSection) {
  switch (section) {
    case 'revenue':
      return 'Year-Level Revenue Summary';
    case 'students':
      return 'Student Account Ledger';
    case 'collections':
      return 'Collection Follow-Up Queue';
    case 'overview':
    default:
      return 'Institution Finance Overview';
  }
}

function getSectionDescription(section: DashboardSection) {
  switch (section) {
    case 'revenue':
      return 'Review collected, remaining, and overpayment totals by year level for the selected payment scheme.';
    case 'students':
      return 'Review each student account with searchable, sortable balances and payment status.';
    case 'collections':
      return 'Focus on unpaid balances and the student accounts that need collection attention first.';
    case 'overview':
    default:
      return 'A decision-ready summary of expected revenue, collections, balances, and student account distribution.';
  }
}

export default App;
