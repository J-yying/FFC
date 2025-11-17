export function createProjectionReport({
  projection,
  annualSpending,
  interestRate,
  contributions = {}
}) {
  const housingFund = contributions.housingFund || 0;
  const socialSecurity = contributions.socialSecurity || 0;
  const tax = contributions.tax || 0;

  const rows = projection.map((entry) => ({
    year: entry.year,
    startOfYear: entry.startOfYear,
    endOfYear: entry.endOfYear,
    interestEarned: entry.interestEarned,
    annualIncome: entry.annualIncome,
    annualSpending: entry.annualSpending,
    inflationRate: entry.inflationRate,
    housingFund,
    socialSecurity,
    tax
  }));

  const finalSavings = projection.length ? projection[projection.length - 1].endOfYear : 0;
  const retirementInterestIncome = finalSavings * interestRate;
  const latestSpending = projection.length ? projection[projection.length - 1].annualSpending : annualSpending;
  const meetsFire = retirementInterestIncome >= latestSpending;

  const conclusion = {
    retirementInterestIncome,
    annualSpending: latestSpending,
    meetsFire
  };

  return {
    rows,
    conclusion
  };
}
