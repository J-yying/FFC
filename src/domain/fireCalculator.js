export class FireCalculator {
  projectPlan({
    currentSavings = 0,
    interestRate = 0,
    retirementYears = 0,
    annualIncome = 0,
    annualSpending = 0,
    inflationRate = 0,
    startYear = new Date().getFullYear()
  }) {
    const projection = [];
    let futureSavings = currentSavings;
    let spending = annualSpending;

    for (let i = 0; i < retirementYears; i += 1) {
      const startOfYear = futureSavings;
      const currentSpending = spending;
      futureSavings += futureSavings * interestRate + annualIncome - currentSpending;
      const interestEarned = futureSavings - startOfYear - annualIncome + currentSpending;

      projection.push({
        year: startYear + i,
        startOfYear,
        endOfYear: futureSavings,
        interestEarned,
        annualIncome,
        annualSpending: currentSpending,
        inflationRate
      });

      spending *= 1 + inflationRate;
    }

    return {
      projection,
      finalSavings: futureSavings
    };
  }

  calculateRetirementInterest(finalSavings, interestRate) {
    return finalSavings * interestRate;
  }
}
