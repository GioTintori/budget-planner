import { CalendarDays, MessageSquare } from 'lucide-react';
import type { SimulationResult, MonthlyOverride } from '../types';
import { formatCurrency } from '../utils/helpers';

interface Props {
  result: SimulationResult;
  overrides: MonthlyOverride[];
  onChange: (overrides: MonthlyOverride[]) => void;
}

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors';

export default function MonthlyView({ result, overrides, onChange }: Props) {
  const getOverride = (month: number): MonthlyOverride =>
    overrides.find((o) => o.month === month) ?? { month, extraIncome: 0, extraCosts: 0, notes: '' };

  const updateOverride = (month: number, field: keyof MonthlyOverride, value: string | number) => {
    const existing = overrides.find((o) => o.month === month);
    if (existing) {
      const updated = overrides.map((o) => (o.month === month ? { ...o, [field]: value } : o));
      const clean = updated.filter((o) => o.extraIncome !== 0 || o.extraCosts !== 0 || o.notes !== '');
      onChange(clean);
    } else {
      const newOverride: MonthlyOverride = { month, extraIncome: 0, extraCosts: 0, notes: '', [field]: value };
      if (newOverride.extraIncome !== 0 || newOverride.extraCosts !== 0 || newOverride.notes !== '') {
        onChange([...overrides, newOverride]);
      }
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <CalendarDays className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Vista Mensile</h3>
            <p className="text-xs text-slate-400">Modifica entrate e costi extra per ogni mese</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0">
        {result.monthlyData.map((row) => {
          const ov = getOverride(row.month);
          const hasOverride = ov.extraIncome !== 0 || ov.extraCosts !== 0 || ov.notes !== '';

          return (
            <div
              key={row.month}
              className={`p-4 border-b border-r border-slate-100 ${
                row.isNegative ? 'bg-red-50/30' : ''
              } ${hasOverride ? 'ring-1 ring-inset ring-indigo-200 bg-indigo-50/20' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-semibold ${row.isNegative ? 'text-red-700' : 'text-slate-800'}`}>
                  {row.monthName}
                </h4>
                <span
                  className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                    row.cashFlow >= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {row.cashFlow >= 0 ? '+' : ''}{formatCurrency(row.cashFlow)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Entrate</span>
                  <span className="text-emerald-600 font-medium">{formatCurrency(row.totalIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Costi fissi</span>
                  <span className="text-slate-600 font-medium">-{formatCurrency(row.totalFixedCosts)}</span>
                </div>
                {row.totalExceptionalCosts > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">C. eccezionali</span>
                    <span className="text-amber-600 font-medium">-{formatCurrency(row.totalExceptionalCosts)}</span>
                  </div>
                )}
                {row.totalInvestmentContributions > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Investimenti</span>
                    <span className="text-violet-600 font-medium">-{formatCurrency(row.totalInvestmentContributions)}</span>
                  </div>
                )}
                <div className="col-span-2 border-t border-slate-100 pt-1 mt-1 flex justify-between">
                  <span className="text-slate-500 font-medium">Liquidita</span>
                  <span className={`font-bold ${row.isNegative ? 'text-red-600' : 'text-slate-800'}`}>
                    {formatCurrency(row.endingLiquidity)}
                  </span>
                </div>
                <div className="col-span-2 flex justify-between">
                  <span className="text-slate-500 font-medium">Patrimonio</span>
                  <span className="font-bold text-indigo-600">{formatCurrency(row.totalWealth)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-emerald-600 mb-0.5">
                      + Entrate extra
                    </label>
                    <input
                      type="number"
                      value={ov.extraIncome || ''}
                      onChange={(e) => updateOverride(row.month, 'extraIncome', Number(e.target.value))}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-red-500 mb-0.5">
                      + Costi extra
                    </label>
                    <input
                      type="number"
                      value={ov.extraCosts || ''}
                      onChange={(e) => updateOverride(row.month, 'extraCosts', Number(e.target.value))}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="relative">
                  <MessageSquare className="absolute left-2.5 top-2 h-3 w-3 text-slate-300" />
                  <input
                    type="text"
                    value={ov.notes}
                    onChange={(e) => updateOverride(row.month, 'notes', e.target.value)}
                    placeholder="Note..."
                    className={inputClass + ' pl-7 text-xs'}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
