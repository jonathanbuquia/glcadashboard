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
    card: 'border-slate-200/80 bg-white/95 shadow-slate-200/70',
    accent: 'from-slate-500 to-slate-700',
    icon: 'bg-slate-900 text-white shadow-slate-200',
    value: 'text-slate-950',
  },
  success: {
    card: 'border-emerald-200/80 bg-white shadow-emerald-100/80',
    accent: 'from-emerald-500 to-teal-600',
    icon: 'bg-emerald-600 text-white shadow-emerald-200',
    value: 'text-emerald-950',
  },
  warning: {
    card: 'border-amber-200/80 bg-white shadow-amber-100/80',
    accent: 'from-amber-400 to-orange-500',
    icon: 'bg-amber-500 text-white shadow-amber-200',
    value: 'text-amber-950',
  },
  danger: {
    card: 'border-rose-200/80 bg-white shadow-rose-100/80',
    accent: 'from-rose-500 to-red-600',
    icon: 'bg-rose-600 text-white shadow-rose-200',
    value: 'text-rose-950',
  },
  info: {
    card: 'border-sky-200/80 bg-white shadow-sky-100/80',
    accent: 'from-sky-500 to-indigo-600',
    icon: 'bg-sky-600 text-white shadow-sky-200',
    value: 'text-sky-950',
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
    <article
      className={`group relative min-w-0 overflow-hidden rounded-xl border p-4 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl ${toneStyles[tone].card}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${toneStyles[tone].accent}`}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-xs font-semibold uppercase tracking-wide text-slate-500 text-safe">
          {label}
        </p>
        {Icon ? (
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg shadow-md transition duration-200 group-hover:scale-105 ${toneStyles[tone].icon}`}
            aria-hidden="true"
          >
            <Icon size={20} strokeWidth={2.3} />
          </span>
        ) : null}
      </div>
      <p className={`mt-4 text-3xl font-black leading-tight tracking-normal text-safe ${toneStyles[tone].value}`}>
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm leading-5 text-slate-600 text-safe">{detail}</p> : null}
    </article>
  );
}
