import type { OverdueSortKey, UnpaidRecord } from '../types/payment';
import {
  formatCurrency,
  formatDate,
  formatPaymentScheme,
  formatStudentInitials,
} from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface OverdueTableProps {
  rows: UnpaidRecord[];
  sortKey: OverdueSortKey;
  onSortChange: (sortKey: OverdueSortKey) => void;
}

const sortOptions: { value: OverdueSortKey; label: string }[] = [
  { value: 'highestAmount', label: 'Highest amount due' },
  { value: 'oldestDueDate', label: 'Oldest due date' },
  { value: 'mostDaysOverdue', label: 'Most days overdue' },
];

export function OverdueTable({ rows, sortKey, onSortChange }: OverdueTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-amber-100 bg-amber-50/70 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950">Overdue / Unpaid Accounts</h2>
          <p className="mt-1 text-sm text-slate-600">
            This view lists unpaid particulars for collection follow-up.
          </p>
        </div>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sort
          </span>
          <select
            className="h-10 w-full rounded-md border border-amber-200 bg-white px-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 md:w-60"
            value={sortKey}
            onChange={(event) => onSortChange(event.target.value as OverdueSortKey)}
          >
            {sortOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="max-h-[640px] overflow-auto">
        <table className="min-w-[940px] divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Year Level</th>
              <th className="px-4 py-3">Scheme</th>
              <th className="px-4 py-3">Unpaid Particular</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 text-right">Amount Due</th>
              <th className="px-4 py-3 text-right">Days Overdue</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={8}>
                  No unpaid records match the current filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={`${row.studentCode}-${row.unpaidParticular}`}
                  className="hover:bg-amber-50/40"
                >
                  <td className="min-w-56 px-4 py-3 font-semibold text-slate-950">
                    {formatStudentInitials(row.studentName)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{row.yearLevel}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatPaymentScheme(row.scheme)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{row.unpaidParticular}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(row.dueDate)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-amber-700">
                    {formatCurrency(row.amountDue)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {row.daysOverdue}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={row.paymentStatus} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
