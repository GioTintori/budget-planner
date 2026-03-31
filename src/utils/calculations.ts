import type { Frequency, BudgetScenario, MonthlyRow, SimulationResult, Investment } from '../types';

const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

export function normalizeToMonthly(amount: number, frequency: Frequency): number {
  switch (frequency) {
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'annual':
      return amount / 12;
    case 'one-off':
      return 0;
  }
}

export function getContributionForMonth(investment: Investment, month: number): number {
  switch (investment.contributionFrequency) {
    case 'monthly':
      return investment.periodicContribution;
    case 'quarterly':
      return month % 3 === 1 ? investment.periodicContribution : 0;
    case 'annual':
      return month === 1 ? investment.periodicContribution : 0;
    default:
      return 0;
  }
}

export function annualToMonthlyRate(annualPercent: number): number {
  return Math.pow(1 + annualPercent / 100, 1 / 12) - 1;
}

export function simulateBudget(scenario: BudgetScenario): SimulationResult {
  const monthlyData: MonthlyRow[] = [];
  let currentLiquidity = scenario.startingLiquidity;

  const investmentValues: Record<string, number> = {};
  for (const inv of scenario.investments) {
    investmentValues[inv.id] = inv.initialCapital;
  }

  const monthlyIncome = scenario.incomes.reduce(
    (sum, inc) => sum + normalizeToMonthly(inc.amount, inc.frequency),
    0,
  );

  const monthlyFixedCosts = scenario.fixedCosts.reduce(
    (sum, cost) => sum + normalizeToMonthly(cost.amount, cost.frequency),
    0,
  );

  for (let month = 1; month <= 12; month++) {
    const startingLiquidity = currentLiquidity;

    const totalExceptionalCosts = scenario.exceptionalCosts
      .filter((cost) => cost.month === month)
      .reduce((sum, cost) => sum + cost.amount, 0);

    let totalInvestmentContributions = 0;
    for (const inv of scenario.investments) {
      const contribution = getContributionForMonth(inv, month);
      totalInvestmentContributions += contribution;

      const monthlyRate = annualToMonthlyRate(inv.expectedReturn);
      investmentValues[inv.id] = investmentValues[inv.id] * (1 + monthlyRate) + contribution;
    }

    const cashFlow =
      monthlyIncome - monthlyFixedCosts - totalExceptionalCosts - totalInvestmentContributions;
    currentLiquidity = startingLiquidity + cashFlow;

    const totalInvestments = Object.values(investmentValues).reduce((a, b) => a + b, 0);

    monthlyData.push({
      month,
      monthName: MONTH_NAMES[month - 1],
      totalIncome: monthlyIncome,
      totalFixedCosts: monthlyFixedCosts,
      totalExceptionalCosts,
      totalInvestmentContributions,
      cashFlow,
      startingLiquidity,
      endingLiquidity: currentLiquidity,
      investmentValues: { ...investmentValues },
      totalInvestments,
      totalWealth: currentLiquidity + totalInvestments,
      isNegative: currentLiquidity < 0,
    });
  }

  const totals = monthlyData.reduce(
    (acc, m) => ({
      income: acc.income + m.totalIncome,
      fixed: acc.fixed + m.totalFixedCosts,
      exceptional: acc.exceptional + m.totalExceptionalCosts,
      invest: acc.invest + m.totalInvestmentContributions,
    }),
    { income: 0, fixed: 0, exceptional: 0, invest: 0 },
  );

  const last = monthlyData[11];

  return {
    monthlyData,
    totalAnnualIncome: totals.income,
    totalAnnualFixedCosts: totals.fixed,
    totalAnnualExceptionalCosts: totals.exceptional,
    totalAnnualInvestmentContributions: totals.invest,
    annualCashFlow: totals.income - totals.fixed - totals.exceptional - totals.invest,
    finalLiquidity: last.endingLiquidity,
    finalInvestmentValue: last.totalInvestments,
    finalWealth: last.totalWealth,
  };
}
