import type { BudgetScenario } from '../types';
import { generateId } from '../utils/helpers';

export function createSampleScenario(): BudgetScenario {
  return {
    id: generateId(),
    name: 'Scenario Base',
    accounts: [
      { id: generateId(), name: 'Conto Corrente', balance: 8000, type: 'checking' },
      { id: generateId(), name: 'Conto Risparmio', balance: 5000, type: 'savings' },
      { id: generateId(), name: 'Contanti', balance: 200, type: 'cash' },
    ],
    incomes: [
      { id: generateId(), name: 'Stipendio', amount: 2500, frequency: 'monthly' },
    ],
    fixedCosts: [
      { id: generateId(), name: 'Affitto', amount: 800, frequency: 'monthly' },
      { id: generateId(), name: 'Bollette', amount: 150, frequency: 'monthly' },
      { id: generateId(), name: 'Trasporti', amount: 80, frequency: 'monthly' },
      { id: generateId(), name: 'Spesa alimentare', amount: 350, frequency: 'monthly' },
      { id: generateId(), name: 'Abbonamenti (streaming, palestra)', amount: 50, frequency: 'monthly' },
      { id: generateId(), name: 'Assicurazione auto', amount: 600, frequency: 'annual' },
    ],
    exceptionalCosts: [
      { id: generateId(), name: 'Vacanza estiva', amount: 1500, month: 8 },
      { id: generateId(), name: 'Tasse (saldo + acconto)', amount: 500, month: 6 },
      { id: generateId(), name: 'Regali Natale', amount: 300, month: 12 },
    ],
    investments: [
      {
        id: generateId(),
        name: 'ETF Globale (VWCE)',
        amountInvested: 5000,
        currentValue: 9200,
        periodicContribution: 300,
        contributionFrequency: 'monthly',
        riskLevel: 'medium',
      },
      {
        id: generateId(),
        name: 'Crypto (BTC/ETH)',
        amountInvested: 1000,
        currentValue: 2800,
        periodicContribution: 100,
        contributionFrequency: 'monthly',
        riskLevel: 'high',
      },
    ],
    monthlyOverrides: [],
  };
}

export function createEmptyScenario(): BudgetScenario {
  return {
    id: generateId(),
    name: 'Nuovo Scenario',
    accounts: [],
    incomes: [],
    fixedCosts: [],
    exceptionalCosts: [],
    investments: [],
    monthlyOverrides: [],
  };
}
