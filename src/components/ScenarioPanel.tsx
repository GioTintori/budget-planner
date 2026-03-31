import { useState } from 'react';
import { Save, FolderOpen, Trash2, GitCompare, RotateCcw, Download } from 'lucide-react';
import type { BudgetScenario, SimulationResult } from '../types';
import { exportToCSV } from '../utils/helpers';

interface Props {
  currentScenario: BudgetScenario;
  savedScenarios: BudgetScenario[];
  result: SimulationResult;
  onSave: (name: string) => void;
  onLoad: (scenario: BudgetScenario) => void;
  onDelete: (id: string) => void;
  onReset: () => void;
  comparisonIds: string[];
  onToggleComparison: (id: string) => void;
}

const btnBase =
  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors';

export default function ScenarioPanel({
  currentScenario,
  savedScenarios,
  result,
  onSave,
  onLoad,
  onDelete,
  onReset,
  comparisonIds,
  onToggleComparison,
}: Props) {
  const [saveName, setSaveName] = useState(currentScenario.name);

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <Save className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-800">Scenari</h3>
        </div>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Nome scenario"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
          <button
            onClick={() => onSave(saveName)}
            className={`${btnBase} bg-indigo-600 text-white hover:bg-indigo-700`}
          >
            <Save className="h-3.5 w-3.5" />
            Salva
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={onReset}
            className={`${btnBase} bg-slate-100 text-slate-600 hover:bg-slate-200`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            onClick={() => exportToCSV(result.monthlyData, `budget-${currentScenario.name}`)}
            className={`${btnBase} bg-slate-100 text-slate-600 hover:bg-slate-200`}
          >
            <Download className="h-3.5 w-3.5" />
            Esporta CSV
          </button>
        </div>

        {savedScenarios.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Scenari salvati</p>
            <div className="space-y-1.5">
              {savedScenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
                >
                  <span className="flex-1 text-sm text-slate-700 truncate">{sc.name}</span>
                  <button
                    onClick={() => onToggleComparison(sc.id)}
                    className={`${btnBase} ${
                      comparisonIds.includes(sc.id)
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title="Confronta"
                  >
                    <GitCompare className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onLoad(sc)}
                    className={`${btnBase} bg-indigo-50 text-indigo-600 hover:bg-indigo-100`}
                    title="Carica"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(sc.id)}
                    className={`${btnBase} bg-red-50 text-red-500 hover:bg-red-100`}
                    title="Elimina"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
