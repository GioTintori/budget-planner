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

export function getTotalAnnualContributions(investment: Investment): number {
  let total = 0;
  for (let m = 1; m <= 12; m++) {
    total += getContributionForMonth(investment, m);
  }
  return total;
}

export function getInvestmentGain(investment: Investment): number {
  const totalInvested = investment.amountInvested + getTotalAnnualContributions(investment);
  return investment.currentValue - totalInvested;
}

export function getInvestmentReturn(investment: Investment): number {
  const totalInvested = investment.amountInvested + getTotalAnnualContributions(investment);
  if (totalInvested === 0) return 0;
  return ((investment.currentValue / totalInvested) - 1) * 100;
}

export function getTotalAccountBalance(scenario: BudgetScenario): number {
  return scenario.accounts.reduce((sum, acc) => sum + acc.balance, 0);
}

export function simulateBudget(scenario: BudgetScenario): SimulationResult {
  const monthlyData: MonthlyRow[] = [];
  let currentLiquidity = getTotalAccountBalance(scenario);

  const investmentValues: Record<string, number> = {};
  const investmentGainPerMonth: Record<string, number> = {};

  for (const inv of scenario.investments) {
    investmentValues[inv.id] = inv.amountInvested;
    const gain = getInvestmentGain(inv);
    investmentGainPerMonth[inv.id] = gain / 12;
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

    const override = scenario.monthlyOverrides.find((o) => o.month === month);
    const extraIncome = override?.extraIncome ?? 0;
    const extraCosts = override?.extraCosts ?? 0;
    const notes = override?.notes ?? '';

    const totalIncome = monthlyIncome + extraIncome;

    const totalExceptionalCosts = scenario.exceptionalCosts
      .filter((cost) => cost.month === month)
      .reduce((sum, cost) => sum + cost.amount, 0);

    let totalInvestmentContributions = 0;
    for (const inv of scenario.investments) {
      const contribution = getContributionForMonth(inv, month);
      totalInvestmentContributions += contribution;
      investmentValues[inv.id] += contribution + investmentGainPerMonth[inv.id];
    }

    const cashFlow =
      totalIncome - monthlyFixedCosts - totalExceptionalCosts - extraCosts - totalInvestmentContributions;
    currentLiquidity = startingLiquidity + cashFlow;

    const totalInvestments = Object.values(investmentValues).reduce((a, b) => a + b, 0);

    monthlyData.push({
      month,
      monthName: MONTH_NAMES[month - 1],
      totalIncome,
      totalFixedCosts: monthlyFixedCosts,
      totalExceptionalCosts,
      totalInvestmentContributions,
      extraIncome,
      extraCosts,
      cashFlow,
      startingLiquidity,
      endingLiquidity: currentLiquidity,
      investmentValues: { ...investmentValues },
      totalInvestments,
      totalWealth: currentLiquidity + totalInvestments,
      isNegative: currentLiquidity < 0,
      notes,
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
