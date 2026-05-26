import type { Filters, ParticularName, StudentSortKey } from '../types/payment';
import { formatPaymentScheme } from '../utils/formatters';
import { PARTICULARS } from '../utils/paymentCalculations';

interface FilterPanelProps {
  filters: Filters;
  sortKey: StudentSortKey;
  yearLevels: string[];
  schemes: string[];
  statuses: string[];
  mode?: 'full' | 'schemeOnly';
  onFilterChange: (filters: Filters) => void;
  onSortChange: (sortKey: StudentSortKey) => void;
}

const sortOptions: { value: StudentSortKey; label: string }[] = [
  { value: 'highestBalance', label: 'Highest balance' },
  { value: 'lowestBalance', label: 'Lowest balance' },
  { value: 'highestPaid', label: 'Highest paid amount' },
  { value: 'highestOverpayment', label: 'Highest overpayment' },
  { value: 'yearLevel', label: 'By year level' },
];

export function FilterPanel({
  filters,
  sortKey,
  yearLevels,
  schemes,
  statuses,
  mode = 'full',
  onFilterChange,
  onSortChange,
}: FilterPanelProps) {
  const updateFilter = <Key extends keyof Filters>(key: Key, value: Filters[Key]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-xl shadow-slate-200/70">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Select
          label="Payment Scheme"
          value={filters.scheme}
          options={schemes}
          getOptionLabel={formatPaymentScheme}
          onChange={(value) => updateFilter('scheme', value)}
        />

        {mode === 'full' ? (
          <>
            <Select
              label="Year Level"
              value={filters.yearLevel}
              options={yearLevels}
              onChange={(value) => updateFilter('yearLevel', value)}
            />

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </span>
              <input
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                placeholder="Student name or ID"
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
              />
            </label>

            <Select
              label="Payment Status"
              value={filters.status}
              options={statuses}
              onChange={(value) => updateFilter('status', value)}
            />

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Particular
              </span>
              <select
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                value={filters.particular}
                onChange={(event) =>
                  updateFilter('particular', event.target.value as ParticularName | 'all')
                }
              >
                <option value="all">All particulars</option>
                {PARTICULARS.map((particular) => (
                  <option value={particular} key={particular}>
                    {particular}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sort Students
              </span>
              <select
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                value={sortKey}
                onChange={(event) => onSortChange(event.target.value as StudentSortKey)}
              >
                {sortOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}
      </div>
    </section>
  );
}

interface SelectProps {
  label: string;
  value: string;
  options: string[];
  getOptionLabel?: (value: string) => string;
  onChange: (value: string) => void;
}

function Select({ label, value, options, getOptionLabel = (option) => option, onChange }: SelectProps) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
