import { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, Settings2 } from 'lucide-react';
import type { BudgetScenario, Income, FixedCost, ExceptionalCost, Investment } from './types';
import { simulateBudget } from './utils/calculations';
import { generateId, formatCurrency } from './utils/helpers';
import { createSampleScenario, createEmptyScenario } from './data/sampleData';
import IncomeSection from './components/IncomeSection';
import FixedCostsSection from './components/FixedCostsSection';
import ExceptionalCostsSection from './components/ExceptionalCostsSection';
import InvestmentsSection from './components/InvestmentsSection';
import SummaryCards from './components/SummaryCards';
import Charts from './components/Charts';
import MonthlyTable from './components/MonthlyTable';
import ScenarioPanel from './components/ScenarioPanel';

const STORAGE_KEY = 'budgetPlanner_scenarios';

function loadSavedScenarios(): BudgetScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [scenario, setScenario] = useState<BudgetScenario>(createSampleScenario);
  const [savedScenarios, setSavedScenarios] = useState<BudgetScenario[]>(loadSavedScenarios);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [mobileView, setMobileView] = useState<'input' | 'dashboard'>('input');

  const result = useMemo(() => simulateBudget(scenario), [scenario]);

  const comparisonScenarios = useMemo(
    () => savedScenarios.filter((s) => comparisonIds.includes(s.id)),
    [savedScenarios, comparisonIds],
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedScenarios));
  }, [savedScenarios]);

  const updateField = <K extends keyof BudgetScenario>(field: K, value: BudgetScenario[K]) => {
    setScenario((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (name: string) => {
    const toSave: BudgetScenario = { ...scenario, id: generateId(), name };
    setSavedScenarios((prev) => [...prev, toSave]);
  };

  const handleLoad = (sc: BudgetScenario) => {
    setScenario({ ...sc, id: generateId() });
  };

  const handleDelete = (id: string) => {
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
    setComparisonIds((prev) => prev.filter((cid) => cid !== id));
  };

  const handleReset = () => {
    setScenario(createEmptyScenario());
  };

  const handleToggleComparison = (id: string) => {
    setComparisonIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-[1600px] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Budget Planner Pro</h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Proiezione annuale &middot; Patrimonio:{' '}
                <span className="font-semibold text-indigo-600">
                  {formatCurrency(result.finalWealth)}
                </span>
              </p>
            </div>
          </div>

          {/* Starting liquidity */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Liquidità iniziale</label>
              <input
                type="number"
                value={scenario.startingLiquidity || ''}
                onChange={(e) => updateField('startingLiquidity', Number(e.target.value))}
                className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Mobile toggle */}
            <div className="flex sm:hidden rounded-lg bg-slate-100 p-0.5">
              <button
                onClick={() => setMobileView('input')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  mobileView === 'input'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMobileView('dashboard')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  mobileView === 'dashboard'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="mx-auto max-w-[1600px] p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left panel — Inputs */}
          <div
            className={`w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 space-y-3 ${
              mobileView !== 'input' ? 'hidden lg:block' : ''
            }`}
          >
            {/* Mobile starting liquidity */}
            <div className="sm:hidden rounded-xl bg-white p-4 shadow-sm border border-slate-100">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Liquidità iniziale
              </label>
              <input
                type="number"
                value={scenario.startingLiquidity || ''}
                onChange={(e) => updateField('startingLiquidity', Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <IncomeSection
              incomes={scenario.incomes}
              onChange={(incomes: Income[]) => updateField('incomes', incomes)}
            />
            <FixedCostsSection
              costs={scenario.fixedCosts}
              onChange={(fixedCosts: FixedCost[]) => updateField('fixedCosts', fixedCosts)}
            />
            <ExceptionalCostsSection
              costs={scenario.exceptionalCosts}
              onChange={(exceptionalCosts: ExceptionalCost[]) =>
                updateField('exceptionalCosts', exceptionalCosts)
              }
            />
            <InvestmentsSection
              investments={scenario.investments}
              onChange={(investments: Investment[]) => updateField('investments', investments)}
            />
            <ScenarioPanel
              currentScenario={scenario}
              savedScenarios={savedScenarios}
              result={result}
              onSave={handleSave}
              onLoad={handleLoad}
              onDelete={handleDelete}
              onReset={handleReset}
              comparisonIds={comparisonIds}
              onToggleComparison={handleToggleComparison}
            />
          </div>

          {/* Right panel — Dashboard */}
          <div
            className={`flex-1 min-w-0 space-y-4 ${
              mobileView !== 'dashboard' ? 'hidden lg:block' : ''
            }`}
          >
            <SummaryCards result={result} />
            <Charts result={result} investments={scenario.investments} comparisonScenarios={comparisonScenarios} />
            <MonthlyTable result={result} investments={scenario.investments} />
          </div>
        </div>
      </div>
    </div>
  );
}
