function formatCurrency(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function createInsightPreviewAgent({ coordinator }) {
  const target = document.querySelector('[data-goal-preview]');
  if (!target) {
    return null;
  }

  const targetField = target.querySelector('[data-preview="target"]');
  const withdrawField = target.querySelector('[data-preview="withdraw"]');
  const confidenceField = target.querySelector('[data-preview="confidence"]');

  function updateView(payload = {}) {
    const { targetAmount = 0, mode } = payload;
    const safeWithdrawal = targetAmount * 0.04;
    if (targetField) {
      targetField.textContent = formatCurrency(targetAmount || 0);
    }
    if (withdrawField) {
      withdrawField.textContent = `${formatCurrency(safeWithdrawal)} / 年`;
    }
    if (confidenceField) {
      if (!targetAmount) {
        confidenceField.textContent = '请先输入目标';
      } else if (mode === 'direct') {
        confidenceField.textContent = '经验输入 · 建议验证基础数据';
      } else if (targetAmount > 3000000) {
        confidenceField.textContent = '雄心勃勃 · 需 50%+ 储蓄率';
      } else {
        confidenceField.textContent = '稳健目标 · 建议 35%+ 储蓄率';
      }
    }
  }

  coordinator.subscribe('goal:preview', updateView);
  coordinator.subscribe('goal:set', updateView);
  updateView();

  return {
    updateView
  };
}
