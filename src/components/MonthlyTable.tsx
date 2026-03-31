import type { SimulationResult, Investment } from '../types';
import { formatCurrency } from '../utils/helpers';

interface Props {
  result: SimulationResult;
  investments: Investment[];
}

export default function MonthlyTable({ result, investments }: Props) {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Dettaglio Mensile</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap sticky left-0 bg-slate-50 z-10">
                Mese
              </th>
              <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap text-right">
                Entrate
              </th>
              <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap text-right">
                Costi Fissi
              </th>
              <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap text-right">
                C. Eccezionali
              </th>
              <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap text-right">
                Contrib. Invest.
              </th>
              <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap text-right">
                Cash Flow
              </th>
              <th className="px-4 py-3 font-medium text-slate-600 whitespace-nowrap text-right">
                Liquidità
              </th>
              {investments.map((inv) => (
                <th
                  key={inv.id}
                  className="px-4 py-3 font-medium text-violet-600 whitespace-nowrap text-right"
                >
                  {inv.name || 'Investimento'}
                </th>
              ))}
              <th className="px-4 py-3 font-medium text-indigo-600 whitespace-nowrap text-right">
                Patrimonio
              </th>
            </tr>
          </thead>
          <tbody>
            {result.monthlyData.map((row) => (
              <tr
                key={row.month}
                className={`border-t border-slate-50 transition-colors ${
                  row.isNegative
                    ? 'bg-red-50/50 hover:bg-red-50'
                    : 'hover:bg-slate-50'
                }`}
              >
                <td
                  className={`px-4 py-2.5 font-medium whitespace-nowrap sticky left-0 z-10 ${
                    row.isNegative ? 'bg-red-50/80 text-red-700' : 'bg-white text-slate-800'
                  }`}
                >
                  {row.monthName}
                </td>
                <td className="px-4 py-2.5 text-right text-emerald-600 whitespace-nowrap">
                  {formatCurrency(row.totalIncome)}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap">
                  -{formatCurrency(row.totalFixedCosts)}
                </td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  {row.totalExceptionalCosts > 0 ? (
                    <span className="text-amber-600">-{formatCurrency(row.totalExceptionalCosts)}</span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  {row.totalInvestmentContributions > 0 ? (
                    <span className="text-violet-600">
                      -{formatCurrency(row.totalInvestmentContributions)}
                    </span>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-medium whitespace-nowrap ${
                    row.cashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {row.cashFlow >= 0 ? '+' : ''}
                  {formatCurrency(row.cashFlow)}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-medium whitespace-nowrap ${
                    row.endingLiquidity >= 0 ? 'text-slate-800' : 'text-red-600 font-bold'
                  }`}
                >
                  {formatCurrency(row.endingLiquidity)}
                </td>
                {investments.map((inv) => (
                  <td key={inv.id} className="px-4 py-2.5 text-right text-violet-600 whitespace-nowrap">
                    {formatCurrency(row.investmentValues[inv.id] ?? 0)}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-right font-bold text-indigo-600 whitespace-nowrap">
                  {formatCurrency(row.totalWealth)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
              <td className="px-4 py-3 sticky left-0 bg-slate-50 z-10">Totale annuo</td>
              <td className="px-4 py-3 text-right text-emerald-600">
                {formatCurrency(result.totalAnnualIncome)}
              </td>
              <td className="px-4 py-3 text-right text-slate-600">
                -{formatCurrency(result.totalAnnualFixedCosts)}
              </td>
              <td className="px-4 py-3 text-right text-amber-600">
                -{formatCurrency(result.totalAnnualExceptionalCosts)}
              </td>
              <td className="px-4 py-3 text-right text-violet-600">
                -{formatCurrency(result.totalAnnualInvestmentContributions)}
              </td>
              <td
                className={`px-4 py-3 text-right ${
                  result.annualCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {result.annualCashFlow >= 0 ? '+' : ''}
                {formatCurrency(result.annualCashFlow)}
              </td>
              <td className="px-4 py-3 text-right">{formatCurrency(result.finalLiquidity)}</td>
              {investments.map((inv) => (
                <td key={inv.id} className="px-4 py-3 text-right text-violet-600">
                  {formatCurrency(
                    result.monthlyData[11]?.investmentValues[inv.id] ?? 0,
                  )}
                </td>
              ))}
              <td className="px-4 py-3 text-right text-indigo-600">
                {formatCurrency(result.finalWealth)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
