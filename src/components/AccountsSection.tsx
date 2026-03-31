import { Plus, Trash2, Landmark } from 'lucide-react';
import type { Account, AccountType } from '../types';
import { generateId, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_COLORS, formatCurrency } from '../utils/helpers';

interface Props {
  accounts: Account[];
  onChange: (accounts: Account[]) => void;
}

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors';

export default function AccountsSection({ accounts, onChange }: Props) {
  const total = accounts.reduce((s, a) => s + a.balance, 0);

  const add = () => {
    onChange([...accounts, { id: generateId(), name: '', balance: 0, type: 'checking' }]);
  };

  const update = (id: string, field: keyof Account, value: string | number) => {
    onChange(accounts.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const remove = (id: string) => {
    onChange(accounts.filter((a) => a.id !== id));
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
            <Landmark className="h-4 w-4 text-sky-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Conti</h3>
            <p className="text-xs text-slate-400">
              Totale: <span className="font-semibold text-sky-600">{formatCurrency(total)}</span>
            </p>
          </div>
        </div>
        <button
          onClick={add}
          className="flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Aggiungi
        </button>
      </div>

      {accounts.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">
          Nessun conto inserito. Aggiungi i tuoi conti per calcolare la liquidita iniziale.
        </p>
      )}

      <div className="space-y-2">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="grid grid-cols-[1fr_100px_120px_32px] gap-2 items-end"
          >
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nome</label>
              <input
                type="text"
                value={acc.name}
                onChange={(e) => update(acc.id, 'name', e.target.value)}
                placeholder="es. Conto Intesa"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Saldo</label>
              <input
                type="number"
                value={acc.balance || ''}
                onChange={(e) => update(acc.id, 'balance', Number(e.target.value))}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
              <select
                value={acc.type}
                onChange={(e) => update(acc.id, 'type', e.target.value as AccountType)}
                className={inputClass}
              >
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => remove(acc.id)}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {accounts.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
          {accounts.map((acc) => (
            <span
              key={acc.id}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${ACCOUNT_TYPE_COLORS[acc.type]}`}
            >
              {acc.name || ACCOUNT_TYPE_LABELS[acc.type]}: {formatCurrency(acc.balance)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
