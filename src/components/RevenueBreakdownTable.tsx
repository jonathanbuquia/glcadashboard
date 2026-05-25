import type { RevenueBreakdown } from '../types/payment';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface RevenueBreakdownTableProps {
  rows: RevenueBreakdown[];
}

export function RevenueBreakdownTable({ rows }: RevenueBreakdownTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-base font-bold text-slate-950">Particular Revenue Breakdown</h2>
        <p className="mt-1 text-sm text-slate-500">
          Categories with high remaining balances should be prioritized for follow-up.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Particular</th>
              <th className="px-4 py-3 text-right">Expected Revenue</th>
              <th className="px-4 py-3 text-right">Collected Amount</th>
              <th className="px-4 py-3 text-right">Remaining Balance</th>
              <th className="px-4 py-3 text-right">Overpayment</th>
              <th className="px-4 py-3 text-right">Collection Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.particular} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                  {row.particular}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {formatCurrency(row.expectedRevenue)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {formatCurrency(row.collectedAmount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-amber-700">
                  {formatCurrency(row.remainingBalance)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sky-700">
                  {formatCurrency(row.overpayment)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {formatPercent(row.collectionRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
