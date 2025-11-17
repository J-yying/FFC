const FACTOR = 25;

function formatCurrency(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0
  }).format(Number(value || 0));
}

function clamp(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function createGoalCalculatorAgent({ coordinator, dataSteward }) {
  const root = document.querySelector('[data-goal-root]');
  if (!root) {
    return null;
  }

  const calculatorPanel = root.querySelector('[data-goal-panel="calculator"]');
  const directPanel = root.querySelector('[data-goal-panel="direct"]');
  const frequencyInputs = root.querySelectorAll('[data-goal-frequency]');
  const amountInput = root.querySelector('[data-goal-amount]');
  const hint = root.querySelector('[data-goal-hint]');
  const output = root.querySelector('[data-goal-output]');
  const directInput = root.querySelector('[data-goal-direct]');
  const switchButtons = root.querySelectorAll('[data-goal-switch]');
  const confirmButton = root.querySelector('[data-goal-confirm]');
  const status = root.querySelector('[data-goal-status]');

  const state = {
    mode: 'calculator',
    frequency: 'monthly',
    amount: clamp(amountInput?.value),
    annualSpending: 0,
    targetAmount: 0,
    submitting: false
  };

  function updatePanels() {
    calculatorPanel?.classList.toggle('is-hidden', state.mode !== 'calculator');
    directPanel?.classList.toggle('is-hidden', state.mode !== 'direct');
  }

  function emitPreview() {
    const annualSpending = state.mode === 'calculator'
      ? state.annualSpending
      : Math.round(state.targetAmount / FACTOR);
    coordinator.emit('goal:preview', {
      targetAmount: state.targetAmount,
      mode: state.mode,
      frequency: state.frequency,
      baseAmount: state.mode === 'calculator' ? state.amount : clamp(directInput?.value),
      sourceType: state.mode === 'calculator' ? `calculator_${state.frequency}` : 'direct',
      annualSpending
    });
    coordinator.emit('goal:spending', { annualSpending });
  }

  function recalcFromCalculator() {
    const spend = clamp(amountInput?.value);
    state.amount = spend;
    const annual = state.frequency === 'monthly' ? spend * 12 : spend;
    state.annualSpending = annual;
    const target = annual * FACTOR;
    state.targetAmount = target;
    if (hint) {
      hint.textContent = state.frequency === 'monthly'
        ? `按月 ${formatCurrency(spend)} ≈ 年度 ${formatCurrency(annual)}`
        : `按年 ${formatCurrency(spend)} ≈ 按月 ${formatCurrency(annual / 12)}`;
    }
    if (output) {
      output.textContent = formatCurrency(target);
    }
    emitPreview();
    updateSubmitState();
  }

  function recalcFromDirect() {
    const value = clamp(directInput?.value);
    state.targetAmount = value;
    state.annualSpending = Math.round(value / FACTOR);
    emitPreview();
    updateSubmitState();
  }

  function updateSubmitState() {
    const disabled = !state.targetAmount || state.submitting;
    if (confirmButton) {
      confirmButton.disabled = disabled;
    }
  }

  frequencyInputs.forEach((input) => {
    input.addEventListener('change', () => {
      state.frequency = input.value;
      recalcFromCalculator();
    });
  });

  amountInput?.addEventListener('input', recalcFromCalculator);
  directInput?.addEventListener('input', recalcFromDirect);

  switchButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetMode = button.dataset.goalSwitch === 'to-direct' ? 'direct' : 'calculator';
      state.mode = targetMode;
      updatePanels();
      if (state.mode === 'calculator') {
        recalcFromCalculator();
      } else {
        recalcFromDirect();
      }
    });
  });

  confirmButton?.addEventListener('click', async () => {
    if (!state.targetAmount || state.submitting) {
      return;
    }
    state.submitting = true;
    updateSubmitState();
    if (status) {
      status.textContent = '正在同步目标...';
    }
    try {
      const payload = {
        targetAmount: state.targetAmount,
        sourceType: state.mode === 'calculator' ? `calculator_${state.frequency}` : 'direct',
        annualSpending: state.mode === 'calculator'
          ? state.annualSpending
          : Math.round(state.targetAmount / FACTOR)
      };
      const result = await dataSteward.saveGoal(payload);
      coordinator.setGoal(result);
      coordinator.updateStage('projection');
      if (status) {
        status.textContent = '已保存目标，继续完善财务画像。';
      }
    } catch (error) {
      if (status) {
        status.textContent = '保存失败，请稍后再试。';
      }
    } finally {
      state.submitting = false;
      updateSubmitState();
    }
  });

  recalcFromCalculator();
  updatePanels();

  return {
    recalcFromCalculator,
    recalcFromDirect
  };
}
