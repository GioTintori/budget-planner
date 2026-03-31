import type { Frequency, MonthlyRow, BudgetScenario, AccountType } from '../types';

export function generateId(): string {
  return crypto.randomUUID();
}

function groupThousands(n: number): string {
  const abs = Math.abs(Math.round(n));
  const str = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return n < 0 ? '-' + str : str;
}

export function formatCurrency(amount: number): string {
  return groupThousands(amount) + ' €';
}

export function formatNumber(amount: number): string {
  return groupThousands(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatAxisValue(v: number): string {
  return groupThousands(v);
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  monthly: 'Mensile',
  quarterly: 'Trimestrale',
  annual: 'Annuale',
  'one-off': 'Una tantum',
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Conto Corrente',
  savings: 'Conto Risparmio',
  cash: 'Contanti',
  other: 'Altro',
};

export const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  checking: 'text-blue-600 bg-blue-50',
  savings: 'text-emerald-600 bg-emerald-50',
  cash: 'text-amber-600 bg-amber-50',
  other: 'text-slate-600 bg-slate-100',
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
    'Extra Entrate',
    'Extra Costi',
    'Contributi Investimenti',
    'Cash Flow',
    'Liquidità Iniziale',
    'Liquidità Finale',
    'Valore Investimenti',
    'Patrimonio Totale',
    'Note',
  ];

  const rows = monthlyData.map((row) => [
    row.monthName,
    row.totalIncome.toFixed(2),
    row.totalFixedCosts.toFixed(2),
    row.totalExceptionalCosts.toFixed(2),
    row.extraIncome.toFixed(2),
    row.extraCosts.toFixed(2),
    row.totalInvestmentContributions.toFixed(2),
    row.cashFlow.toFixed(2),
    row.startingLiquidity.toFixed(2),
    row.endingLiquidity.toFixed(2),
    row.totalInvestments.toFixed(2),
    row.totalWealth.toFixed(2),
    row.notes,
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

export interface BudgetDataFile {
  version: number;
  exportDate: string;
  currentScenario: BudgetScenario;
  savedScenarios: BudgetScenario[];
}

export function exportToJSON(current: BudgetScenario, saved: BudgetScenario[]): void {
  const data: BudgetDataFile = {
    version: 2,
    exportDate: new Date().toISOString().split('T')[0],
    currentScenario: current,
    savedScenarios: saved,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `budget-planner-${data.exportDate}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<BudgetDataFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as BudgetDataFile;
        if (!data.currentScenario || !Array.isArray(data.savedScenarios)) {
          reject(new Error('Formato file non valido'));
          return;
        }
        const migrateScenario = (sc: any) => {
          if (!sc.accounts) { sc.accounts = []; }
          if (!sc.monthlyOverrides) { sc.monthlyOverrides = []; }
          if (sc.investments) {
            sc.investments = sc.investments.map((inv: any) => {
              if ('initialCapital' in inv && !('amountInvested' in inv)) {
                return {
                  ...inv,
                  amountInvested: inv.initialCapital,
                  currentValue: inv.initialCapital,
                };
              }
              return inv;
            });
          }
        };
        migrateScenario(data.currentScenario);
        for (const sc of data.savedScenarios) {
          migrateScenario(sc);
        }
        resolve(data);
      } catch {
        reject(new Error('Errore nella lettura del file'));
      }
    };
    reader.onerror = () => reject(new Error('Errore nella lettura del file'));
    reader.readAsText(file);
  });
}
