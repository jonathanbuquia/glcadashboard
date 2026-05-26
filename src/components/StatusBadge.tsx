import type { PaymentStatus } from '../types/payment';

interface StatusBadgeProps {
  status: PaymentStatus;
}

const statusStyles: Record<PaymentStatus, string> = {
  'Fully Paid': 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  'With Balance': 'bg-amber-100 text-amber-800 ring-amber-200',
  Partial: 'bg-slate-100 text-slate-800 ring-slate-200',
  Overdue: 'bg-rose-100 text-rose-800 ring-rose-200',
  Overpaid: 'bg-sky-100 text-sky-800 ring-sky-200',
  Upcoming: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black shadow-sm ring-1 ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
