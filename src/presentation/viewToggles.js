export function toggleIncomeInput({ incomeTypeSelect, annualContainer, monthlyContainer }) {
  if (!incomeTypeSelect || !annualContainer || !monthlyContainer) {
    return;
  }

  const isAnnual = incomeTypeSelect.value === 'annual';
  annualContainer.style.display = isAnnual ? 'block' : 'none';
  monthlyContainer.style.display = isAnnual ? 'none' : 'block';
}

export function toggleTaxationInput({ taxationCheckbox, taxContainer }) {
  if (!taxationCheckbox || !taxContainer) {
    return;
  }

  taxContainer.style.display = taxationCheckbox.checked ? 'block' : 'none';
}

