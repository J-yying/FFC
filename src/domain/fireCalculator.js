export class FireCalculator {
  projectPlan({
    currentSavings = 0,
    interestRate = 0,
    retirementYears = 0,
    annualIncome = 0,
    annualSpending = 0,
    startYear = new Date().getFullYear()
  }) {
    const projection = [];
    let futureSavings = currentSavings;

    for (let i = 0; i < retirementYears; i += 1) {
      const startOfYear = futureSavings;
      futureSavings += futureSavings * interestRate + annualIncome - annualSpending;
      const interestEarned = futureSavings - startOfYear - annualIncome + annualSpending;

      projection.push({
        year: startYear + i,
        startOfYear,
        endOfYear: futureSavings,
        interestEarned,
        annualIncome,
        annualSpending
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

