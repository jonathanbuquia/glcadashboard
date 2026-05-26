import type { StudentFinance } from '../types/payment';
import {
  formatCurrency,
  formatPaymentScheme,
  formatStudentInitials,
} from '../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface StudentPaymentTableProps {
  students: StudentFinance[];
}

export function StudentPaymentTable({ students }: StudentPaymentTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/70">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 to-slate-800 p-4">
        <h2 className="text-base font-black text-white">Student Payment Monitoring</h2>
        <p className="mt-1 text-sm text-slate-300">
          Consolidated expected, collected, balance, overpayment, and payable details.
        </p>
      </div>
      <div className="max-h-[640px] overflow-auto">
        <table className="min-w-[1180px] divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 text-left text-xs font-black uppercase tracking-wide text-slate-600 shadow-sm">
            <tr>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Year Level</th>
              <th className="px-4 py-3">Scheme</th>
              <th className="px-4 py-3 text-right">Expected</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-right">Balance</th>
              <th className="px-4 py-3 text-right">Overpayment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Upcoming Payables</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-slate-500" colSpan={10}>
                  No student records match the current filters.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.code} className="transition hover:bg-teal-50/50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-slate-600">
                    {student.code}
                  </td>
                  <td className="min-w-56 px-4 py-3 font-semibold text-slate-950">
                    {formatStudentInitials(student.name)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{student.yearLevel}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatPaymentScheme(student.scheme)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {formatCurrency(student.totalExpected)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                    {formatCurrency(student.totalPaid)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums text-amber-700">
                    {formatCurrency(student.currentBalance)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-sky-700">
                    {formatCurrency(student.overpayment)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={student.paymentStatus} />
                  </td>
                  <td className="min-w-72 px-4 py-3 text-slate-600">
                    {student.upcomingPayables.length > 0 ? (
                      <div className="space-y-1">
                        {student.upcomingPayables.map((payable) => (
                          <div key={payable}>{payable}</div>
                        ))}
                      </div>
                    ) : (
                      'No open payables'
                    )}
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
