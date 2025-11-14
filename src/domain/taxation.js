const BASIC_DEDUCTION = 60000;

const TAX_BRACKETS = [
  { threshold: 36000, rate: 0.03, quickDeduction: 0 },
  { threshold: 144000, rate: 0.1, quickDeduction: 2520 },
  { threshold: 300000, rate: 0.2, quickDeduction: 16920 },
  { threshold: 420000, rate: 0.25, quickDeduction: 31920 },
  { threshold: 660000, rate: 0.3, quickDeduction: 52920 },
  { threshold: 960000, rate: 0.35, quickDeduction: 85920 },
  { threshold: Infinity, rate: 0.45, quickDeduction: 181920 }
];

function calculateProgressiveTax(taxableIncome) {
  if (taxableIncome <= 0) {
    return 0;
  }

  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.threshold) {
      return taxableIncome * bracket.rate - bracket.quickDeduction;
    }
  }

  return 0;
}

export function calculateAnnualIncomeBreakdown({
  baseAnnualIncome = 0,
  taxation = false,
  taxDeduction = 0,
  housingFundBase = 0,
  housingFundRate = 0,
  socialSecurityBase = 0,
  socialSecurityRate = 0
}) {
  let housingFundAnnual = 0;
  let socialSecurityAnnual = 0;
  let tax = 0;
  let netAnnualIncome = baseAnnualIncome;

  if (taxation) {
    const housingFundMonthly = housingFundBase * housingFundRate;
    const socialSecurityMonthly = socialSecurityBase * socialSecurityRate;

    housingFundAnnual = housingFundMonthly * 12;
    socialSecurityAnnual = socialSecurityMonthly * 12;

    const taxableIncome = baseAnnualIncome - housingFundAnnual - socialSecurityAnnual;
    const taxableAfterDeductions = taxableIncome - BASIC_DEDUCTION - (taxDeduction * 12);
    tax = calculateProgressiveTax(taxableAfterDeductions);

    netAnnualIncome = taxableIncome - tax;
  }

  return {
    netAnnualIncome,
    housingFundAnnual,
    socialSecurityAnnual,
    tax
  };
}

