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
import type { SimulationResult, BudgetScenario, Investment } from '../types';
import { formatCurrency } from '../utils/helpers';
import { simulateBudget } from '../utils/calculations';

interface Props {
  result: SimulationResult;
  investments: Investment[];
  comparisonScenarios?: BudgetScenario[];
}

const COLORS = {
  liquidity: '#6366f1',
  investments: '#10b981',
  wealth: '#8b5cf6',
  positive: '#22c55e',
  negative: '#ef4444',
};

const PIE_COLORS = ['#6366f1', '#f59e0b', '#8b5cf6', '#ec4899'];
const INVESTMENT_COLORS = ['#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];
const COMPARISON_COLORS = ['#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 backdrop-blur-sm p-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-semibold">{formatCurrency(entry.value)}</span>
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
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function Charts({ result, investments, comparisonScenarios = [] }: Props) {
  // --- Data for Wealth Evolution (stacked area + patrimonio line) ---
  const wealthData = result.monthlyData.map((m) => ({
    name: m.monthName.substring(0, 3),
    'Liquidità': Math.round(m.endingLiquidity),
    'Investimenti': Math.round(m.totalInvestments),
    'Patrimonio Totale': Math.round(m.totalWealth),
  }));

  // --- Data for Cash Flow bars ---
  const cashFlowData = result.monthlyData.map((m) => ({
    name: m.monthName.substring(0, 3),
    'Cash Flow': Math.round(m.cashFlow),
  }));

  // --- Data for Pie Chart (annual expense breakdown) ---
  const totalExpenses =
    result.totalAnnualFixedCosts +
    result.totalAnnualExceptionalCosts +
    result.totalAnnualInvestmentContributions;

  const pieData = [
    { name: 'Costi Fissi', value: Math.round(result.totalAnnualFixedCosts), percent: result.totalAnnualFixedCosts / totalExpenses },
    { name: 'Costi Eccezionali', value: Math.round(result.totalAnnualExceptionalCosts), percent: result.totalAnnualExceptionalCosts / totalExpenses },
    { name: 'Contrib. Investimenti', value: Math.round(result.totalAnnualInvestmentContributions), percent: result.totalAnnualInvestmentContributions / totalExpenses },
  ].filter((d) => d.value > 0);

  // --- Data for Individual Investment Growth ---
  const investmentGrowthData = result.monthlyData.map((m) => {
    const row: Record<string, string | number> = { name: m.monthName.substring(0, 3) };
    investments.forEach((inv) => {
      row[inv.name || inv.id] = Math.round(m.investmentValues[inv.id] ?? 0);
    });
    return row;
  });

  // --- Data for Scenario Comparison ---
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
      {/* Row 1: Wealth Evolution + Expense Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Evoluzione Patrimonio</h3>
          <p className="text-xs text-slate-400 mb-4">Liquidita e investimenti mese per mese</p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={wealthData}>
              <defs>
                <linearGradient id="gradLiquidity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.liquidity} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS.liquidity} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradInvestments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.investments} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS.investments} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} />
              <Area
                type="monotone"
                dataKey="Liquidità"
                stackId="stack"
                stroke={COLORS.liquidity}
                fill="url(#gradLiquidity)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Investimenti"
                stackId="stack"
                stroke={COLORS.investments}
                fill="url(#gradInvestments)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Patrimonio Totale"
                stroke={COLORS.wealth}
                strokeWidth={2.5}
                dot={false}
                strokeDasharray="6 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Expense Breakdown */}
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Distribuzione Uscite</h3>
          <p className="text-xs text-slate-400 mb-4">Ripartizione annuale delle spese</p>
          {totalExpenses > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderPieLabel}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-500">Totale uscite</span>
                  <span className="font-bold text-slate-900">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">Nessuna uscita inserita</p>
          )}
        </div>
      </div>

      {/* Row 2: Cash Flow + Investment Growth */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Cash Flow Bar Chart */}
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Cash Flow Mensile</h3>
          <p className="text-xs text-slate-400 mb-4">Entrate meno uscite per ogni mese</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                tickFormatter={(v) => `${v >= 0 ? '+' : ''}${v}`}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
              <Bar dataKey="Cash Flow" radius={[6, 6, 0, 0]}>
                {cashFlowData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry['Cash Flow'] >= 0 ? COLORS.positive : COLORS.negative}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Individual Investment Growth */}
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Crescita Investimenti</h3>
          <p className="text-xs text-slate-400 mb-4">Andamento di ogni portafoglio nel tempo</p>
          {investments.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={investmentGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} />
                {investments.map((inv, i) => (
                  <Line
                    key={inv.id}
                    type="monotone"
                    dataKey={inv.name || inv.id}
                    stroke={INVESTMENT_COLORS[i % INVESTMENT_COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: INVESTMENT_COLORS[i % INVESTMENT_COLORS.length] }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">Nessun investimento inserito</p>
          )}
        </div>
      </div>

      {/* Row 3: Scenario Comparison (only if comparing) */}
      {comparisonData && (
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-1">Confronto Scenari</h3>
          <p className="text-xs text-slate-400 mb-4">Patrimonio totale a confronto tra scenari diversi</p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8} />
              <Area
                type="monotone"
                dataKey="Scenario attuale"
                stroke={COLORS.wealth}
                fill={COLORS.wealth}
                fillOpacity={0.1}
                strokeWidth={2.5}
              />
              {comparisonScenarios.map((sc, i) => (
                <Area
                  key={sc.id}
                  type="monotone"
                  dataKey={sc.name}
                  stroke={COMPARISON_COLORS[i % COMPARISON_COLORS.length]}
                  fill="none"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
