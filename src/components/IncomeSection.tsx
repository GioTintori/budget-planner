import { Plus, Trash2, Wallet } from 'lucide-react';
import type { Income, Frequency } from '../types';
import { generateId, FREQUENCY_LABELS } from '../utils/helpers';

interface Props {
  incomes: Income[];
  onChange: (incomes: Income[]) => void;
}

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors';

export default function IncomeSection({ incomes, onChange }: Props) {
  const add = () => {
    onChange([...incomes, { id: generateId(), name: '', amount: 0, frequency: 'monthly' }]);
  };

  const update = (id: string, field: keyof Income, value: string | number) => {
    onChange(incomes.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const remove = (id: string) => {
    onChange(incomes.filter((i) => i.id !== id));
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <Wallet className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-slate-800">Entrate</h3>
        </div>
        <button
          onClick={add}
          className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Aggiungi
        </button>
      </div>

      {incomes.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">
          Nessuna entrata. Clicca "Aggiungi" per iniziare.
        </p>
      )}

      <div className="space-y-2">
        {incomes.map((income) => (
          <div
            key={income.id}
            className="grid grid-cols-[1fr_100px_120px_32px] gap-2 items-end"
          >
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nome</label>
              <input
                type="text"
                value={income.name}
                onChange={(e) => update(income.id, 'name', e.target.value)}
                placeholder="es. Stipendio"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Importo</label>
              <input
                type="number"
                value={income.amount || ''}
                onChange={(e) => update(income.id, 'amount', Number(e.target.value))}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Frequenza</label>
              <select
                value={income.frequency}
                onChange={(e) => update(income.id, 'frequency', e.target.value as Frequency)}
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
            <button
              onClick={() => remove(income.id)}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
