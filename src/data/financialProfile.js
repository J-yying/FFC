import { calculateAnnualIncomeBreakdown } from '../domain/taxation.js';

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildFinancialProfile(rawInputs) {
  const incomeType = rawInputs.incomeType || 'annual';
  const annualIncomeInput = toNumber(rawInputs.annualIncome);
  const monthlyIncome = toNumber(rawInputs.monthlyIncome);
  const totalMonths = toNumber(rawInputs.totalMonths) || 12;

  const baseAnnualIncome = incomeType === 'annual'
    ? annualIncomeInput
    : monthlyIncome * totalMonths;

  const breakdown = calculateAnnualIncomeBreakdown({
    baseAnnualIncome,
    taxation: Boolean(rawInputs.taxation),
    taxDeduction: toNumber(rawInputs.taxDeduction),
    housingFundBase: toNumber(rawInputs.housingFundBase),
    housingFundRate: toNumber(rawInputs.housingFundRate) / 100,
    socialSecurityBase: toNumber(rawInputs.socialSecurityBase),
    socialSecurityRate: toNumber(rawInputs.socialSecurityRate) / 100
  });

  return {
    currentSavings: toNumber(rawInputs.currentSavings),
    interestRate: toNumber(rawInputs.interestRate),
    inflationRate: toNumber(rawInputs.inflationRate),
    retirementYears: Math.max(0, Math.floor(toNumber(rawInputs.retirementYears))),
    annualSpending: toNumber(rawInputs.annualSpending),
    annualIncome: breakdown.netAnnualIncome,
    contributions: {
      housingFund: breakdown.housingFundAnnual,
      socialSecurity: breakdown.socialSecurityAnnual,
      tax: breakdown.tax
    },
    baseAnnualIncome
  };
}
