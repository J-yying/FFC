function formatCurrency(value) {
  return Number(value || 0).toFixed(2);
}

export function renderReport(container, report) {
  if (!container) {
    return;
  }

  if (!report.rows.length) {
    container.innerHTML = '<p>请输入有效的计算参数。</p>';
    return;
  }

  const headerHtml = `
    <tr>
      <th>年份</th>
      <th>年初存款总额</th>
      <th>年末存款总额</th>
      <th>年利息（收入）</th>
      <th>税后年收入（收入）</th>
      <th>年使用金额（支出）</th>
      <th>社保</th>
      <th>公积金</th>
      <th>个税</th>
    </tr>
  `;

  const rowsHtml = report.rows.map((row) => `
    <tr>
      <td>${row.year}</td>
      <td>${formatCurrency(row.startOfYear)}</td>
      <td>${formatCurrency(row.endOfYear)}</td>
      <td>${formatCurrency(row.interestEarned)}</td>
      <td>${formatCurrency(row.annualIncome)}</td>
      <td>${formatCurrency(row.annualSpending)}</td>
      <td>${formatCurrency(row.socialSecurity)}</td>
      <td>${formatCurrency(row.housingFund)}</td>
      <td>${formatCurrency(row.tax)}</td>
    </tr>
  `).join('');

  const { retirementInterestIncome, annualSpending, meetsFire } = report.conclusion;
  const conclusionHtml = `
    <p>
      退休当年的年利息所得: ${formatCurrency(retirementInterestIncome)}<br>
      预计年支出: ${formatCurrency(annualSpending)}<br>
      ${meetsFire ? '年利息所得可以覆盖年支出，达到财务自由。' : '年利息所得无法覆盖年支出，还需继续积累资金。'}
    </p>
  `;

  container.innerHTML = `<table>${headerHtml}${rowsHtml}</table>${conclusionHtml}`;
}

