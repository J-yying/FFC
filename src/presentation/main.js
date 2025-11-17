import { FireCalculator } from '../domain/fireCalculator.js';
import { buildFinancialProfile } from '../data/financialProfile.js';
import { createProjectionReport } from '../analytics/projectionReport.js';
import { toggleIncomeInput, toggleTaxationInput } from './viewToggles.js';
import { renderReport } from './renderers.js';
import { createAtlasCoordinator } from '../agents/atlasCoordinator.js';
import { bootstrapOnboardingNarrator } from '../agents/onboardingNarratorAgent.js';
import { createGoalCalculatorAgent } from '../agents/goalCalculatorAgent.js';
import { createWebDataSteward } from '../agents/webDataStewardAgent.js';
import { createInsightPreviewAgent } from '../agents/insightPreviewAgent.js';
import { bootstrapH5ShellAgent } from '../agents/h5ShellAgent.js';
import { bootstrapFlowMirrorAgent } from '../agents/flowMirrorAgent.js';
import { bootstrapH5CaptureAgent } from '../agents/h5CaptureAgent.js';

function collectFormValues(form) {
  const formData = new FormData(form);
  const values = {};

  formData.forEach((value, key) => {
    values[key] = value;
  });

  values.taxation = form.querySelector('#taxation').checked;
  values.interestRate = Number(values.interestRate || 0) / 100;
  values.inflationRate = Number(values.inflationRate || 0) / 100;

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
    inflationRate: profile.inflationRate,
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

function createViewRouter() {
  const views = Array.from(document.querySelectorAll('[data-view]'));
  return (stage) => {
    const target = views.find((view) => view.dataset.view === stage) || views.find((view) => view.dataset.view === 'welcome');
    views.forEach((view) => {
      const isActive = view === target;
      view.classList.toggle('is-active', isActive);
      view.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  };
}

function setupFinanceForm({ coordinator }) {
  const form = document.getElementById('financeForm');
  const resultContainer = document.getElementById('result');
  const incomeTypeSelect = document.getElementById('incomeType');
  const annualIncomeContainer = document.getElementById('annualIncomeInput');
  const monthlyIncomeContainer = document.getElementById('monthlyIncomeInput');
  const taxationCheckbox = document.getElementById('taxation');
  const taxContainer = document.getElementById('taxInputs');

  if (!form || !resultContainer) {
    return;
  }

  const calculator = new FireCalculator();

  toggleIncomeInput({
    incomeTypeSelect,
    annualContainer: annualIncomeContainer,
    monthlyContainer: monthlyIncomeContainer
  });

  toggleTaxationInput({ taxationCheckbox, taxContainer });

  incomeTypeSelect?.addEventListener('change', () => {
    toggleIncomeInput({
      incomeTypeSelect,
      annualContainer: annualIncomeContainer,
      monthlyContainer: monthlyIncomeContainer
    });
  });

  taxationCheckbox?.addEventListener('change', () => {
    toggleTaxationInput({ taxationCheckbox, taxContainer });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleCalculation({ form, resultContainer, calculator });
  });

  coordinator.subscribe('goal:set', (goal) => {
    if (!goal || !goal.targetAmount) {
      return;
    }
    const annualField = form.querySelector('#annualSpending');
    const derived = goal.annualSpending || Math.round(Number(goal.targetAmount) / 25);
    if (annualField && derived) {
      annualField.value = derived;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const coordinator = createAtlasCoordinator();
  const routeView = createViewRouter();
  routeView(coordinator.getState().stage);
  coordinator.subscribe('stage:change', ({ stage }) => routeView(stage));

  bootstrapH5ShellAgent({ coordinator, shell: document.querySelector('[data-shell]') });
  bootstrapFlowMirrorAgent({ coordinator });
  bootstrapH5CaptureAgent();
  bootstrapOnboardingNarrator({ coordinator });

  const dataSteward = createWebDataSteward({ coordinator });
  createInsightPreviewAgent({ coordinator });
  createGoalCalculatorAgent({ coordinator, dataSteward });

  document.querySelector('[data-action="reset-journey"]')?.addEventListener('click', () => {
    coordinator.reset();
  });

  setupFinanceForm({ coordinator });
});
