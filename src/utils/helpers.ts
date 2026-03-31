import type { Frequency, MonthlyRow } from '../types';

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return formatCurrency(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  monthly: 'Mensile',
  quarterly: 'Trimestrale',
  annual: 'Annuale',
  'one-off': 'Una tantum',
};

export const MONTH_OPTIONS = [
  { value: 1, label: 'Gennaio' },
  { value: 2, label: 'Febbraio' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Aprile' },
  { value: 5, label: 'Maggio' },
  { value: 6, label: 'Giugno' },
  { value: 7, label: 'Luglio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Settembre' },
  { value: 10, label: 'Ottobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Dicembre' },
];

export const RISK_LABELS = {
  low: 'Basso',
  medium: 'Medio',
  high: 'Alto',
} as const;

export const RISK_COLORS = {
  low: 'text-emerald-600 bg-emerald-50',
  medium: 'text-amber-600 bg-amber-50',
  high: 'text-red-600 bg-red-50',
} as const;

export function exportToCSV(monthlyData: MonthlyRow[], filename: string): void {
  const headers = [
    'Mese',
    'Entrate',
    'Costi Fissi',
    'Costi Eccezionali',
    'Contributi Investimenti',
    'Cash Flow',
    'Liquidità Iniziale',
    'Liquidità Finale',
    'Valore Investimenti',
    'Patrimonio Totale',
  ];

  const rows = monthlyData.map((row) => [
    row.monthName,
    row.totalIncome.toFixed(2),
    row.totalFixedCosts.toFixed(2),
    row.totalExceptionalCosts.toFixed(2),
    row.totalInvestmentContributions.toFixed(2),
    row.cashFlow.toFixed(2),
    row.startingLiquidity.toFixed(2),
    row.endingLiquidity.toFixed(2),
    row.totalInvestments.toFixed(2),
    row.totalWealth.toFixed(2),
  ]);

  const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
