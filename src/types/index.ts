export type Frequency = 'monthly' | 'quarterly' | 'annual' | 'one-off';

export type RiskLevel = 'low' | 'medium' | 'high';

export type AccountType = 'checking' | 'savings' | 'cash' | 'other';

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: AccountType;
}

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

export interface MonthlyOverride {
  month: number;
  extraIncome: number;
  extraCosts: number;
  notes: string;
}

export interface MonthlyRow {
  month: number;
  monthName: string;
  totalIncome: number;
  totalFixedCosts: number;
  totalExceptionalCosts: number;
  totalInvestmentContributions: number;
  extraIncome: number;
  extraCosts: number;
  cashFlow: number;
  startingLiquidity: number;
  endingLiquidity: number;
  investmentValues: Record<string, number>;
  totalInvestments: number;
  totalWealth: number;
  isNegative: boolean;
  notes: string;
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
  accounts: Account[];
  incomes: Income[];
  fixedCosts: FixedCost[];
  exceptionalCosts: ExceptionalCost[];
  investments: Investment[];
  monthlyOverrides: MonthlyOverride[];
}
