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

    for (let i = 0; i < retirementYears; i += 1) {
      const startOfYear = futureSavings;
      const interestEarned = startOfYear * interestRate;
      const inflationCost = startOfYear * inflationRate;
      const endOfYear = startOfYear + interestEarned + annualIncome - annualSpending - inflationCost;
      futureSavings = endOfYear;

      projection.push({
        year: startYear + i,
        startOfYear,
        endOfYear,
        interestEarned,
        annualIncome,
        annualSpending,
        inflationRate,
        inflationCost
      });
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
