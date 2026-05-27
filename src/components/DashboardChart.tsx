import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ReactNode } from 'react';
import type { DistributionDatum } from '../types/payment';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

const COLORS = ['#0F766E', '#2563EB', '#D97706', '#7C3AED', '#DC2626', '#475569'];
const RADIAN = Math.PI / 180;

interface ChartShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

function ChartShell({ title, description, children }: ChartShellProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 p-5 shadow-xl shadow-slate-200/70">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-sky-500 to-amber-400" />
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
        <h2 className="text-base font-black tracking-normal text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.12)]" />
      </div>
      <div className="h-[26rem] min-h-[26rem]">{children}</div>
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
              cy="76%"
              innerRadius={132}
              outerRadius={176}
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
        <div className="pointer-events-none absolute inset-x-0 top-[50%] px-6 text-center">
          <p className="text-5xl font-bold leading-none text-slate-950">
            {formatPercent(collectionRate)}
          </p>
          <p className="mt-4 text-base font-semibold leading-6 text-slate-600">
            {formatCurrency(collected)} collected
          </p>
          <p className="mt-2 text-sm leading-5 text-slate-500">
            Target: {formatCurrency(expected)}
          </p>
        </div>
        <div className="absolute inset-x-8 bottom-5 flex items-center justify-between text-xs font-semibold text-slate-500">
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
      description="Collected progress against expected revenue target by fee category"
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

              <div className="relative h-8 overflow-hidden rounded-lg bg-slate-200 ring-1 ring-inset ring-slate-300">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r from-teal-600 to-sky-500 shadow-sm"
                  style={{ width: `${collectionRate}%` }}
                  aria-label={`${item.particular} collection progress`}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-semibold">
                  <span className="text-white drop-shadow-sm">
                    {formatCurrency(item.collectedAmount)}
                  </span>
                  <span className="text-slate-600">
                    Target {formatCurrency(item.expectedRevenue)}
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

export function StudentCountBarChart({ title, data }: DistributionChartProps) {
  const sortedData = [...data].sort((left, right) => {
    const countDifference = right.value - left.value;

    return countDifference === 0
      ? left.name.localeCompare(right.name)
      : countDifference;
  });

  return (
    <ChartShell title={title}>
      {sortedData.length === 0 ? (
        <div className="grid h-full place-items-center text-sm text-slate-500">
          No records match the current filters.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 12, right: 48, bottom: 12, left: 10 }}
          >
            <CartesianGrid horizontal={false} stroke="#E2E8F0" />
            <XAxis
              type="number"
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12, fontWeight: 700 }}
              tickFormatter={(value) => formatNumber(Number(value))}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={52}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#334155', fontSize: 13, fontWeight: 900 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(15, 118, 110, 0.08)' }}
              formatter={(value) => [`${formatNumber(Number(value))} students`, 'Count']}
            />
            <Bar dataKey="value" fill="#5F8F3E" radius={[0, 7, 7, 0]} maxBarSize={28}>
              <LabelList
                dataKey="value"
                position="right"
                formatter={(value) => formatNumber(Number(value ?? 0))}
                fill="#475569"
                fontSize={12}
                fontWeight={800}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
}

export function DistributionChart({ title, data }: DistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const getShare = (value: number) =>
    total > 0 ? formatPercent((value / total) * 100) : formatPercent(0);

  return (
    <ChartShell title={title}>
      {data.length === 0 ? (
        <div className="grid h-full place-items-center text-sm text-slate-500">
          No records match the current filters.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 18, right: 62, bottom: 18, left: 62 }}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="48%"
              outerRadius="78%"
              paddingAngle={2}
              label={renderDistributionLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toLocaleString()} students (${getShare(Number(value))})`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartShell>
  );
}

interface DistributionLabelProps {
  cx?: number | string;
  cy?: number | string;
  midAngle?: number;
  name?: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  percent?: number;
}

function renderDistributionLabel({
  cx,
  cy,
  midAngle,
  name,
  innerRadius,
  outerRadius,
  percent,
}: DistributionLabelProps) {
  const share = Number(percent ?? 0);

  if (share <= 0) {
    return null;
  }

  const centerX = Number(cx);
  const centerY = Number(cy);
  const inner = Number(innerRadius);
  const outer = Number(outerRadius);
  const angle = Number(midAngle);

  if (![centerX, centerY, inner, outer, angle].every(Number.isFinite)) {
    return null;
  }

  const sin = Math.sin(-angle * RADIAN);
  const cos = Math.cos(-angle * RADIAN);
  const percentRadius = inner + (outer - inner) * 0.58;
  const percentX = centerX + percentRadius * cos;
  const percentY = centerY + percentRadius * sin;
  const startX = centerX + outer * cos;
  const startY = centerY + outer * sin;
  const bendX = centerX + (outer + 16) * cos;
  const bendY = centerY + (outer + 16) * sin;
  const isRightSide = cos >= 0;
  const endX = bendX + (isRightSide ? 24 : -24);
  const textX = endX + (isRightSide ? 6 : -6);
  const outsideLabel = name ?? '';

  return (
    <g>
      <path
        d={`M${startX},${startY} L${bendX},${bendY} L${endX},${bendY}`}
        fill="none"
        stroke="#64748B"
        strokeWidth={1.4}
      />
      <circle cx={startX} cy={startY} r={2.6} fill="#64748B" />
      <text
        x={textX}
        y={bendY}
        fill="#334155"
        textAnchor={isRightSide ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={14}
        fontWeight={900}
        paintOrder="stroke"
        stroke="#FFFFFF"
        strokeWidth={1.5}
      >
        {outsideLabel}
      </text>
      <text
        x={percentX}
        y={percentY}
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        paintOrder="stroke"
        stroke="rgba(15, 23, 42, 0.42)"
        strokeWidth={2}
      >
        {formatPercent(share * 100)}
      </text>
    </g>
  );
}
