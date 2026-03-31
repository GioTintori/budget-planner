import {
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  Landmark,
  PiggyBank,
  Banknote,
  AlertTriangle,
  Crown,
} from 'lucide-react';
import type { SimulationResult } from '../types';
import { formatCurrency } from '../utils/helpers';

interface Props {
  result: SimulationResult;
}

interface CardData {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function SummaryCards({ result }: Props) {
  const negativeMonths = result.monthlyData.filter((m) => m.isNegative).length;

  const cards: CardData[] = [
    {
      label: 'Entrate annuali',
      value: result.totalAnnualIncome,
      icon: <ArrowUpCircle className="h-5 w-5" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Costi fissi annuali',
      value: -result.totalAnnualFixedCosts,
      icon: <ArrowDownCircle className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Costi eccezionali',
      value: -result.totalAnnualExceptionalCosts,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Investiti (contributi)',
      value: -result.totalAnnualInvestmentContributions,
      icon: <PiggyBank className="h-5 w-5" />,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      label: 'Cash flow annuale',
      value: result.annualCashFlow,
      icon: <Banknote className="h-5 w-5" />,
      color: result.annualCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: result.annualCashFlow >= 0 ? 'bg-emerald-50' : 'bg-red-50',
    },
    {
      label: 'Liquidità finale',
      value: result.finalLiquidity,
      icon: <Landmark className="h-5 w-5" />,
      color: result.finalLiquidity >= 0 ? 'text-sky-600' : 'text-red-600',
      bgColor: result.finalLiquidity >= 0 ? 'bg-sky-50' : 'bg-red-50',
    },
    {
      label: 'Valore investimenti',
      value: result.finalInvestmentValue,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      label: 'Patrimonio totale',
      value: result.finalWealth,
      icon: <Crown className="h-5 w-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white p-4 shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgColor} ${card.color}`}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-1">{card.label}</p>
            <p
              className={`text-lg font-bold ${card.value < 0 ? 'text-red-600' : 'text-slate-800'}`}
            >
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      {negativeMonths > 0 && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">Attenzione:</span>{' '}
            {negativeMonths} {negativeMonths === 1 ? 'mese' : 'mesi'} con liquidità negativa.
            Rivedi il budget o riduci i costi.
          </p>
        </div>
      )}
    </div>
  );
}
