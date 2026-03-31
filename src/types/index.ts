export type Frequency = 'monthly' | 'quarterly' | 'annual' | 'one-off';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Income {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
}

export interface FixedCost {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
}

export interface ExceptionalCost {
  id: string;
  name: string;
  amount: number;
  month: number;
}

export interface Investment {
  id: string;
  name: string;
  initialCapital: number;
  periodicContribution: number;
  contributionFrequency: Frequency;
  expectedReturn: number;
  riskLevel: RiskLevel;
}

export interface MonthlyRow {
  month: number;
  monthName: string;
  totalIncome: number;
  totalFixedCosts: number;
  totalExceptionalCosts: number;
  totalInvestmentContributions: number;
  cashFlow: number;
  startingLiquidity: number;
  endingLiquidity: number;
  investmentValues: Record<string, number>;
  totalInvestments: number;
  totalWealth: number;
  isNegative: boolean;
}

export interface SimulationResult {
  monthlyData: MonthlyRow[];
  totalAnnualIncome: number;
  totalAnnualFixedCosts: number;
  totalAnnualExceptionalCosts: number;
  totalAnnualInvestmentContributions: number;
  annualCashFlow: number;
  finalLiquidity: number;
  finalInvestmentValue: number;
  finalWealth: number;
}

export interface BudgetScenario {
  id: string;
  name: string;
  startingLiquidity: number;
  incomes: Income[];
  fixedCosts: FixedCost[];
  exceptionalCosts: ExceptionalCost[];
  investments: Investment[];
}
