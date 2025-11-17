import { FireCalculator } from '../domain/fireCalculator.js';
import { buildFinancialProfile } from '../data/financialProfile.js';
import { createProjectionReport } from '../analytics/projectionReport.js';
import { toggleIncomeInput, toggleTaxationInput } from './viewToggles.js';
import { renderReport } from './renderers.js';

function collectFormValues(form) {
  const formData = new FormData(form);
  const values = {};

  formData.forEach((value, key) => {
    values[key] = value;
  });

  values.taxation = form.querySelector('#taxation').checked;
  values.interestRate = Number(values.interestRate || 0) / 100;

  return values;
}

function handleCalculation({ form, resultContainer, calculator }) {
  const rawValues = collectFormValues(form);
  const profile = buildFinancialProfile(rawValues);

  if (!profile.retirementYears) {
    resultContainer.innerHTML = '<p>请提供有效的退休年数。</p>';
    return;
  }

  const { projection } = calculator.projectPlan({
    currentSavings: profile.currentSavings,
    interestRate: profile.interestRate,
    retirementYears: profile.retirementYears,
    annualIncome: profile.annualIncome,
    annualSpending: profile.annualSpending,
    startYear: new Date().getFullYear()
  });

  const report = createProjectionReport({
    projection,
    annualSpending: profile.annualSpending,
    interestRate: profile.interestRate,
    contributions: profile.contributions
  });

  renderReport(resultContainer, report);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('financeForm');
  const resultContainer = document.getElementById('result');
  const incomeTypeSelect = document.getElementById('incomeType');
  const annualIncomeContainer = document.getElementById('annualIncomeInput');
  const monthlyIncomeContainer = document.getElementById('monthlyIncomeInput');
  const taxationCheckbox = document.getElementById('taxation');
  const taxContainer = document.getElementById('taxInputs');

  const calculator = new FireCalculator();

  toggleIncomeInput({
    incomeTypeSelect,
    annualContainer: annualIncomeContainer,
    monthlyContainer: monthlyIncomeContainer
  });

  toggleTaxationInput({ taxationCheckbox, taxContainer });

  incomeTypeSelect.addEventListener('change', () => {
    toggleIncomeInput({
      incomeTypeSelect,
      annualContainer: annualIncomeContainer,
      monthlyContainer: monthlyIncomeContainer
    });
  });

  taxationCheckbox.addEventListener('change', () => {
    toggleTaxationInput({ taxationCheckbox, taxContainer });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleCalculation({ form, resultContainer, calculator });
  });
});

