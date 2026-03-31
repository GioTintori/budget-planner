import { Plus, Trash2, Receipt } from 'lucide-react';
import type { FixedCost, Frequency } from '../types';
import { generateId, FREQUENCY_LABELS } from '../utils/helpers';

interface Props {
  costs: FixedCost[];
  onChange: (costs: FixedCost[]) => void;
}

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors';

export default function FixedCostsSection({ costs, onChange }: Props) {
  const add = () => {
    onChange([...costs, { id: generateId(), name: '', amount: 0, frequency: 'monthly' }]);
  };

  const update = (id: string, field: keyof FixedCost, value: string | number) => {
    onChange(costs.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const remove = (id: string) => {
    onChange(costs.filter((c) => c.id !== id));
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <Receipt className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-800">Costi Fissi</h3>
        </div>
        <button
          onClick={add}
          className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Aggiungi
        </button>
      </div>

      {costs.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">
          Nessun costo fisso inserito.
        </p>
      )}

      <div className="space-y-2">
        {costs.map((cost) => (
          <div
            key={cost.id}
            className="grid grid-cols-[1fr_100px_120px_32px] gap-2 items-end"
          >
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nome</label>
              <input
                type="text"
                value={cost.name}
                onChange={(e) => update(cost.id, 'name', e.target.value)}
                placeholder="es. Affitto"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Importo</label>
              <input
                type="number"
                value={cost.amount || ''}
                onChange={(e) => update(cost.id, 'amount', Number(e.target.value))}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Frequenza</label>
              <select
                value={cost.frequency}
                onChange={(e) => update(cost.id, 'frequency', e.target.value as Frequency)}
                className={inputClass}
              >
                {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => remove(cost.id)}
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
