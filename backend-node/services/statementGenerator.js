const { CHART } = require('./chartOfAccounts');

function fmt(n) { return Math.round(n * 100) / 100; }

function generateStatements(mappings, tbRecords, meta) {
  // Build lookup: account_code -> balance
  const balanceMap = {};
  for (const r of tbRecords) {
    balanceMap[r.account_code] = r.balance;
    if (!balanceMap['__name__' + r.account_name]) balanceMap['__name__' + r.account_name] = r.balance;
  }

  // Group by statement -> category -> list of {label, amount}
  const grouped = {};
  for (const m of mappings) {
    if (m.statement === 'unmapped') continue;
    const stmt = m.statement || 'balance_sheet';
    const cat  = m.category  || 'Current Assets';
    if (!grouped[stmt]) grouped[stmt] = {};
    if (!grouped[stmt][cat]) grouped[stmt][cat] = [];

    const balance = balanceMap[m.account_code] ?? balanceMap['__name__' + m.account_name] ?? 0;
    const sign    = m.sign || 1;
    grouped[stmt][cat].push({ label: m.account_name, amount: fmt(balance * sign) });
  }

  // Unmapped accounts
  const unmapped = mappings.filter(m => m.statement === 'unmapped');

  // Helper: build a section dict for one statement
  function buildSections(stmt, categoryOrder) {
    const sections = {};
    const available = grouped[stmt] || {};
    // Put in preferred order first, then any extras
    const allCats = [...new Set([...categoryOrder, ...Object.keys(available)])];
    for (const cat of allCats) {
      const items = available[cat];
      if (!items || !items.length) continue;
      sections[cat] = {
        items,
        total: fmt(items.reduce((a, b) => a + b.amount, 0)),
      };
    }
    return sections;
  }

  // ── Balance Sheet ───────────────────────────────────────────
  const bsSections = buildSections('balance_sheet', [
    'Current Assets','Non-Current Assets',
    'Current Liabilities','Non-Current Liabilities','Equity',
  ]);

  let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;
  for (const [cat, sec] of Object.entries(bsSections)) {
    if (['Current Assets','Non-Current Assets'].includes(cat))         totalAssets      += sec.total;
    else if (['Current Liabilities','Non-Current Liabilities'].includes(cat)) totalLiabilities += sec.total;
    else if (cat === 'Equity')                                          totalEquity      += sec.total;
  }
  totalAssets      = fmt(totalAssets);
  totalLiabilities = fmt(totalLiabilities);
  totalEquity      = fmt(totalEquity);

  const balance_sheet = {
    sections: bsSections,
    total_assets:               totalAssets,
    total_liabilities:          totalLiabilities,
    total_equity:               totalEquity,
    total_liabilities_and_equity: fmt(totalLiabilities + totalEquity),
    balance_check:              fmt(totalAssets - (totalLiabilities + totalEquity)),
  };

  // ── Income Statement ────────────────────────────────────────
  const isSections = buildSections('income_statement', [
    'Revenue','Cost of Sales','Operating Expenses','Finance Costs','Income Tax',
  ]);

  const revenue  = isSections['Revenue']?.total             || 0;
  const cogs     = isSections['Cost of Sales']?.total       || 0;
  const opex     = isSections['Operating Expenses']?.total  || 0;
  const finCost  = isSections['Finance Costs']?.total       || 0;
  const tax      = isSections['Income Tax']?.total          || 0;

  const grossProfit = fmt(revenue - cogs);
  const ebit        = fmt(grossProfit - opex);
  const ebt         = fmt(ebit - finCost);
  const netIncome   = fmt(ebt - tax);

  const income_statement = {
    sections: isSections,
    revenue, gross_profit: grossProfit, ebit, ebt, net_income: netIncome,
  };

  // ── Cash Flow ───────────────────────────────────────────────
  const cfSections = buildSections('cash_flow', [
    'Operating Activities','Investing Activities','Financing Activities',
  ]);

  let operating = cfSections['Operating Activities']?.total || 0;
  let investing = cfSections['Investing Activities']?.total || 0;
  let financing = cfSections['Financing Activities']?.total || 0;

  // If no CF data mapped, derive operating from net income (indirect method)
  if (!Object.keys(cfSections).length) {
    cfSections['Operating Activities'] = {
      items: [{ label: 'Net Income (Indirect Method)', amount: netIncome }],
      total: netIncome,
    };
    operating = netIncome;
    cfSections['Investing Activities']  = { items: [], total: 0 };
    cfSections['Financing Activities']  = { items: [], total: 0 };
  }

  const cash_flow = {
    sections: cfSections,
    net_change_in_cash: fmt(operating + investing + financing),
  };

  // ── Equity Statement ────────────────────────────────────────
  const openingEquity = fmt(totalEquity - netIncome);
  const equity_statement = {
    opening_equity:  openingEquity,
    net_income:      netIncome,
    dividends:       0,
    other_movements: 0,
    closing_equity:  totalEquity,
  };

  // ── KPIs ────────────────────────────────────────────────────
  const kpis = {
    total_assets:      totalAssets,
    total_liabilities: totalLiabilities,
    total_equity:      totalEquity,
    revenue:           fmt(revenue),
    gross_profit:      fmt(grossProfit),
    net_income:        fmt(netIncome),
    net_cash_flow:     fmt(operating + investing + financing),
    gross_margin:      revenue ? fmt((grossProfit / revenue) * 100) : 0,
    net_margin:        revenue ? fmt((netIncome   / revenue) * 100) : 0,
  };

  return {
    balance_sheet,
    income_statement,
    cash_flow,
    equity_statement,
    kpis,
    unmapped,
    entity_name: meta?.entity_name || '',
    period_end:  meta?.period_end  || '',
    currency:    meta?.currency    || 'USD',
  };
}

module.exports = { generateStatements };
