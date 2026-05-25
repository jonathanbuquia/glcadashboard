export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCurrencyPrecise(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number): string {
  return `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-PH').format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value?: string): string {
  if (!value) {
    return 'No due date';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

export function formatPaymentScheme(value: string): string {
  const schemes: Record<string, string> = {
    A: 'Annual',
    Q: 'Quarterly',
    M: 'Monthly',
    S: 'Semi-Annual',
  };

  return schemes[value] ?? value;
}

export function formatStudentInitials(name: string): string {
  const parts = name
    .replace(/,/g, ' ')
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return 'N/A';
  }

  return parts.map((part) => `${part.charAt(0).toUpperCase()}.`).join(' ');
}
