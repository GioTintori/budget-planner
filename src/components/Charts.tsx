import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { SimulationResult, BudgetScenario, Investment, FixedCost } from '../types';
import { formatCurrency, formatAxisValue } from '../utils/helpers';
import { simulateBudget, normalizeToMonthly } from '../utils/calculations';

interface Props {
  result: SimulationResult;
  investments: Investment[];
  fixedCosts: FixedCost[];
  comparisonScenarios?: BudgetScenario[];
}

const COLORS = {
  liquidity: '#6366f1',
  investments: '#10b981',
  wealth: '#8b5cf6',
  positive: '#22c55e',
  negative: '#ef4444',
};

const PIE_COLORS = ['#6366f1', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6'];
const COST_PIE_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6', '#6366f1'];
const INVESTMENT_COLORS = ['#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];
const COMPARISON_COLORS = ['#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 backdrop-blur-sm p-3 shadow-xl text-sm max-w-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-500 truncate">{entry.name}:</span>
          <span className="font-semibold ml-auto">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 backdrop-blur-sm p-3 shadow-xl text-sm">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.payload.fill }} />
        <span className="text-slate-700 font-medium">{entry.name}</span>
      </div>
      <p className="font-bold text-slate-900 mt-1">{formatCurrency(entry.value)}</p>
      <p className="text-slate-400 text-xs">{((entry.payload.percent ?? 0) * 100).toFixed(1)}% del totale</p>
    </div>
  );
}

const RADIAN = Math.PI / 180;
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function Charts({ result, investments, fixedCosts, comparisonScenarios = [] }: Props) {
  const wealthData = result.monthlyData.map((m) => ({
    name: m.monthName.substring(0, 3),
    'Liquidità': Math.round(m.endingLiquidity),
    'Investimenti': Math.round(m.totalInvestments),
    'Patrimonio Totale': Math.round(m.totalWealth),
  }));

  const cashFlowData = result.monthlyData.map((m) => ({
    name: m.monthName.substring(0, 3),
    'Cash Flow': Math.round(m.cashFlow),
  }));

  // Expense category pie
  const totalExpenses =
    result.totalAnnualFixedCosts +
    result.totalAnnualExceptionalCosts +
    result.totalAnnualInvestmentContributions;

  const expensePieData = [
    { name: 'Costi Fissi', value: Math.round(result.totalAnnualFixedCosts), percent: result.totalAnnualFixedCosts / totalExpenses },
    { name: 'Costi Eccezionali', value: Math.round(result.totalAnnualExceptionalCosts), percent: result.totalAnnualExceptionalCosts / totalExpenses },
    { name: 'Contrib. Investimenti', value: Math.round(result.totalAnnualInvestmentContributions), percent: result.totalAnnualInvestmentContributions / totalExpenses },
  ].filter((d) => d.value > 0);

  // Fixed costs breakdown pie
  const costBreakdownData = fixedCosts
    .map((c) => ({
      name: c.name,
      value: Math.round(normalizeToMonthly(c.amount, c.frequency) * 12),
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const costBreakdownTotal = costBreakdownData.reduce((s, d) => s + d.value, 0);
  costBreakdownData.forEach((d) => { (d as any).percent = d.value / costBreakdownTotal; });

  // Monthly stacked bar: income allocation
  const allocationData = result.monthlyData.map((m) => ({
    name: m.monthName.substring(0, 3),
    'Costi Fissi': -Math.round(m.totalFixedCosts),
    'C. Eccezionali': -Math.round(m.totalExceptionalCosts),
    'Investimenti': -Math.round(m.totalInvestmentContributions),
    'Risparmio': Math.round(Math.max(0, m.cashFlow)),
  }));

  // Investment growth
  const investmentGrowthData = result.monthlyData.map((m) => {
    const row: Record<string, string | number> = { name: m.monthName.substring(0, 3) };
    investments.forEach((inv) => {
      row[inv.name || inv.id] = Math.round(m.investmentValues[inv.id] ?? 0);
    });
    return row;
  });

  // Scenario comparison
  const comparisonData =
    comparisonScenarios.length > 0
      ? result.monthlyData.map((m, i) => {
          const row: Record<string, number | string> = {
            name: m.monthName.substring(0, 3),
            'Scenario attuale': Math.round(m.totalWealth),
          };
          comparisonScenarios.forEach((sc) => {
            const sim = simulateBudget(sc);
            row[sc.name] = Math.round(sim.monthlyData[i].totalWealth);
          });
          return row;
        })
      : null;

  return (
    <div className="space-y-4">
      {/* Row 1: Wealth + Expense Category Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Evoluzione Patrimonio</h3>
          <p className="text-xs text-slate-400 mb-4">Liquidita e investimenti mese per mese</p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={wealthData}>
              <defs>
                <linearGradient id="gradLiq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.liquidity} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS.liquidity} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradInv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.investments} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS.investments} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={formatAxisValue} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="Liquidità" stackId="s" stroke={COLORS.liquidity} fill="url(#gradLiq)" strokeWidth={2} />
              <Area type="monotone" dataKey="Investimenti" stackId="s" stroke={COLORS.investments} fill="url(#gradInv)" strokeWidth={2} />
              <Line type="monotone" dataKey="Patrimonio Totale" stroke={COLORS.wealth} strokeWidth={2.5} dot={false} strokeDasharray="6 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Distribuzione Uscite</h3>
          <p className="text-xs text-slate-400 mb-4">Ripartizione annuale</p>
          {totalExpenses > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3} dataKey="value" labelLine={false} label={renderPieLabel}>
                    {expensePieData.map((_e, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {expensePieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-1.5 flex justify-between text-sm">
                  <span className="font-medium text-slate-500">Totale</span>
                  <span className="font-bold text-slate-900">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">Nessuna uscita</p>
          )}
        </div>
      </div>

      {/* Row 2: Fixed Costs Breakdown + Monthly Allocation */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Dettaglio Costi Fissi</h3>
          <p className="text-xs text-slate-400 mb-4">Quanto pesa ogni voce</p>
          {costBreakdownData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={costBreakdownData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2} dataKey="value" labelLine={false} label={renderPieLabel}>
                    {costBreakdownData.map((_e, i) => (<Cell key={i} fill={COST_PIE_COLORS[i % COST_PIE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2 max-h-[140px] overflow-y-auto">
                {costBreakdownData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COST_PIE_COLORS[i % COST_PIE_COLORS.length] }} />
                      <span className="text-slate-600 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 ml-2">{formatCurrency(item.value)}/a</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">Nessun costo fisso</p>
          )}
        </div>

        <div className="xl:col-span-2 rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Allocazione Mensile</h3>
          <p className="text-xs text-slate-400 mb-4">Come viene distribuito il reddito ogni mese</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={allocationData} stackOffset="sign">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={formatAxisValue} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} />
              <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
              <Bar dataKey="Costi Fissi" stackId="a" fill="#6366f1" fillOpacity={0.8} radius={[0, 0, 0, 0]} />
              <Bar dataKey="C. Eccezionali" stackId="a" fill="#f59e0b" fillOpacity={0.8} />
              <Bar dataKey="Investimenti" stackId="a" fill="#8b5cf6" fillOpacity={0.8} />
              <Bar dataKey="Risparmio" stackId="b" fill="#22c55e" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Cash Flow + Investment Growth */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Cash Flow Mensile</h3>
          <p className="text-xs text-slate-400 mb-4">Entrate meno uscite</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={formatAxisValue} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
              <Bar dataKey="Cash Flow" radius={[6, 6, 0, 0]}>
                {cashFlowData.map((entry, index) => (
                  <Cell key={index} fill={entry['Cash Flow'] >= 0 ? COLORS.positive : COLORS.negative} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Crescita Investimenti</h3>
          <p className="text-xs text-slate-400 mb-4">Andamento per portafoglio</p>
          {investments.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={investmentGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={formatAxisValue} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} />
                {investments.map((inv, i) => (
                  <Line key={inv.id} type="monotone" dataKey={inv.name || inv.id} stroke={INVESTMENT_COLORS[i % INVESTMENT_COLORS.length]} strokeWidth={2.5} dot={{ r: 3, fill: INVESTMENT_COLORS[i % INVESTMENT_COLORS.length] }} activeDot={{ r: 5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">Nessun investimento</p>
          )}
        </div>
      </div>

      {/* Scenario Comparison */}
      {comparisonData && (
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Confronto Scenari</h3>
          <p className="text-xs text-slate-400 mb-4">Patrimonio totale a confronto</p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={formatAxisValue} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="Scenario attuale" stroke={COLORS.wealth} fill={COLORS.wealth} fillOpacity={0.1} strokeWidth={2.5} />
              {comparisonScenarios.map((sc, i) => (
                <Area key={sc.id} type="monotone" dataKey={sc.name} stroke={COMPARISON_COLORS[i % COMPARISON_COLORS.length]} fill="none" strokeWidth={2} strokeDasharray="6 3" />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
