import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  detail?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  icon?: LucideIcon;
}

const toneStyles = {
  neutral: {
    card: 'border-slate-200 bg-white',
    icon: 'bg-slate-100 text-slate-700',
  },
  success: {
    card: 'border-emerald-200 bg-emerald-50/60',
    icon: 'bg-emerald-100 text-emerald-700',
  },
  warning: {
    card: 'border-amber-200 bg-amber-50/70',
    icon: 'bg-amber-100 text-amber-700',
  },
  danger: {
    card: 'border-rose-200 bg-rose-50/70',
    icon: 'bg-rose-100 text-rose-700',
  },
  info: {
    card: 'border-sky-200 bg-sky-50/70',
    icon: 'bg-sky-100 text-sky-700',
  },
};

export function KPICard({
  label,
  value,
  detail,
  tone = 'neutral',
  icon: Icon,
}: KPICardProps) {
  return (
    <article className={`rounded-lg border p-4 shadow-sm ${toneStyles[tone].card}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {Icon ? (
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${toneStyles[tone].icon}`}
            aria-hidden="true"
          >
            <Icon size={19} strokeWidth={2.2} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
      {detail ? <p className="mt-2 text-sm text-slate-600">{detail}</p> : null}
    </article>
  );
}
