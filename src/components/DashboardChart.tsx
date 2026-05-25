import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { ReactNode } from 'react';
import type { DistributionDatum } from '../types/payment';
import { formatCurrency, formatPercent } from '../utils/formatters';

const COLORS = ['#0F766E', '#2563EB', '#D97706', '#7C3AED', '#DC2626', '#475569'];

interface ChartShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

function ChartShell({ title, description, children }: ChartShellProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="h-80 min-h-80">{children}</div>
    </section>
  );
}

interface RevenueComparisonChartProps {
  expected: number;
  collected: number;
}

export function RevenueComparisonChart({
  expected,
  collected,
}: RevenueComparisonChartProps) {
  const collectionRate = expected > 0 ? (collected / expected) * 100 : 0;
  const cappedCollected = Math.min(collected, expected);
  const remaining = Math.max(expected - cappedCollected, 0);
  const data = [
    { name: 'Collected', amount: cappedCollected, color: '#0F766E' },
    { name: 'Remaining', amount: remaining, color: '#E2E8F0' },
  ];

  return (
    <ChartShell
      title="Collection Meter"
      description="Collected amount as progress against total expected revenue"
    >
      <div className="relative h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              startAngle={180}
              endAngle={0}
              cx="50%"
              cy="68%"
              innerRadius={88}
              outerRadius={126}
              paddingAngle={1}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 top-[44%] text-center">
          <p className="text-4xl font-bold text-slate-950">
            {formatPercent(collectionRate)}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            {formatCurrency(collected)} collected
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Target: {formatCurrency(expected)}
          </p>
        </div>
        <div className="absolute inset-x-8 bottom-2 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{formatCurrency(0)}</span>
          <span>{formatCurrency(expected)}</span>
        </div>
      </div>
    </ChartShell>
  );
}

interface RevenueBreakdownChartProps {
  data: {
    particular: string;
    expectedRevenue: number;
    collectedAmount: number;
    remainingBalance: number;
  }[];
}

export function RevenueBreakdownChart({ data }: RevenueBreakdownChartProps) {
  return (
    <ChartShell
      title="Revenue by Particular"
      description="Collected progress against expected revenue capacity by fee category"
    >
      <div className="flex h-full flex-col justify-center gap-5">
        {data.map((item) => {
          const collectionRate =
            item.expectedRevenue > 0
              ? Math.min((item.collectedAmount / item.expectedRevenue) * 100, 100)
              : 0;

          return (
            <div key={item.particular}>
              <div className="mb-2 flex items-end justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-950">{item.particular}</p>
                  <p className="text-xs text-slate-500">
                    {formatCurrency(item.collectedAmount)} collected of{' '}
                    {formatCurrency(item.expectedRevenue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-950">
                    {formatPercent(collectionRate)}
                  </p>
                  <p className="text-xs text-amber-700">
                    {formatCurrency(item.remainingBalance)} remaining
                  </p>
                </div>
              </div>

              <div className="relative h-7 rounded-md bg-slate-200 ring-1 ring-inset ring-slate-300">
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-teal-600 shadow-sm"
                  style={{ width: `${collectionRate}%` }}
                  aria-label={`${item.particular} collection progress`}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-semibold">
                  <span className="text-white drop-shadow-sm">
                    {formatCurrency(item.collectedAmount)}
                  </span>
                  <span className="text-slate-600">
                    Capacity {formatCurrency(item.expectedRevenue)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartShell>
  );
}

interface DistributionChartProps {
  title: string;
  data: DistributionDatum[];
}

export function DistributionChart({ title, data }: DistributionChartProps) {
  return (
    <ChartShell title={title}>
      {data.length === 0 ? (
        <div className="grid h-full place-items-center text-sm text-slate-500">
          No records match the current filters.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={104}
              paddingAngle={2}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
}
