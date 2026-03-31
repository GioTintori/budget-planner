import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { Investment, Frequency, RiskLevel } from '../types';
import { generateId, FREQUENCY_LABELS, RISK_LABELS, RISK_COLORS, formatCurrency } from '../utils/helpers';
import { getInvestmentGain, getInvestmentReturn, getTotalAnnualContributions } from '../utils/calculations';

interface Props {
  investments: Investment[];
  onChange: (investments: Investment[]) => void;
}

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors';

export default function InvestmentsSection({ investments, onChange }: Props) {
  const add = () => {
    onChange([
      ...investments,
      {
        id: generateId(),
        name: '',
        amountInvested: 0,
        currentValue: 0,
        periodicContribution: 0,
        contributionFrequency: 'monthly',
        riskLevel: 'medium',
      },
    ]);
  };

  const update = (id: string, field: keyof Investment, value: string | number) => {
    onChange(investments.map((inv) => (inv.id === id ? { ...inv, [field]: value } : inv)));
  };

  const remove = (id: string) => {
    onChange(investments.filter((inv) => inv.id !== id));
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
            <TrendingUp className="h-4 w-4 text-violet-600" />
          </div>
          <h3 className="font-semibold text-slate-800">Investimenti</h3>
        </div>
        <button
          onClick={add}
          className="flex items-center gap-1 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Aggiungi
        </button>
      </div>

      {investments.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">
          Nessun investimento inserito.
        </p>
      )}

      <div className="space-y-3">
        {investments.map((inv) => {
          const gain = getInvestmentGain(inv);
          const returnPct = getInvestmentReturn(inv);
          const totalContrib = getTotalAnnualContributions(inv);
          const totalInvested = inv.amountInvested + totalContrib;
          const isPositive = gain >= 0;

          return (
            <div
              key={inv.id}
              className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <input
                    type="text"
                    value={inv.name}
                    onChange={(e) => update(inv.id, 'name', e.target.value)}
                    placeholder="Nome (es. ETF Globale)"
                    className={inputClass + ' font-medium'}
                  />
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${RISK_COLORS[inv.riskLevel]} mr-2`}
                >
                  {RISK_LABELS[inv.riskLevel]}
                </span>
                <button
                  onClick={() => remove(inv.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Capitale investito
                  </label>
                  <input
                    type="number"
                    value={inv.amountInvested || ''}
                    onChange={(e) => update(inv.id, 'amountInvested', Number(e.target.value))}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Valore fine anno
                  </label>
                  <input
                    type="number"
                    value={inv.currentValue || ''}
                    onChange={(e) => update(inv.id, 'currentValue', Number(e.target.value))}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Contributo periodico
                  </label>
                  <input
                    type="number"
                    value={inv.periodicContribution || ''}
                    onChange={(e) => update(inv.id, 'periodicContribution', Number(e.target.value))}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Frequenza</label>
                  <select
                    value={inv.contributionFrequency}
                    onChange={(e) =>
                      update(inv.id, 'contributionFrequency', e.target.value as Frequency)
                    }
                    className={inputClass}
                  >
                    {Object.entries(FREQUENCY_LABELS)
                      .filter(([k]) => k !== 'one-off')
                      .map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Gain/Loss summary */}
              {(inv.amountInvested > 0 || inv.currentValue > 0) && (
                <div className={`rounded-lg px-3 py-2 ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {isPositive ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(gain)} ({isPositive ? '+' : ''}{returnPct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Investito: {formatCurrency(totalInvested)}</span>
                    <span>Valore: {formatCurrency(inv.currentValue)}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <label className="block text-xs font-medium text-slate-500 self-center mr-1">
                  Rischio:
                </label>
                {(['low', 'medium', 'high'] as RiskLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => update(inv.id, 'riskLevel', level)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      inv.riskLevel === level
                        ? RISK_COLORS[level]
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {RISK_LABELS[level]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
