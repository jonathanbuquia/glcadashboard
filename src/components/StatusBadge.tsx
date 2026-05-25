import type { PaymentStatus } from '../types/payment';

interface StatusBadgeProps {
  status: PaymentStatus;
}

const statusStyles: Record<PaymentStatus, string> = {
  'Fully Paid': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'With Balance': 'bg-amber-50 text-amber-700 ring-amber-200',
  Partial: 'bg-slate-100 text-slate-700 ring-slate-200',
  Overdue: 'bg-rose-50 text-rose-700 ring-rose-200',
  Overpaid: 'bg-sky-50 text-sky-700 ring-sky-200',
  Upcoming: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
