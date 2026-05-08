function generateNotes(statements, meta) {
  const { entity_name, period_end, currency } = meta;
  const bs = statements.balance_sheet;
  const is = statements.income_statement;
  const kpis = statements.kpis;

  const periodYear = period_end ? new Date(period_end).getFullYear() : new Date().getFullYear();
  const fmtAmt = n => `${currency} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const notes = [
    {
      id: 'note_1',
      title: '1. Reporting Entity',
      content: `<p>${entity_name || 'The Company'} (the "Company") is incorporated and operates in its jurisdiction of incorporation. These financial statements cover the reporting period ended ${period_end || periodYear}.</p>`,
    },
    {
      id: 'note_2',
      title: '2. Basis of Preparation',
      content: `<p>These financial statements have been prepared in accordance with International Financial Reporting Standards (IFRS) as issued by the International Accounting Standards Board (IASB). They are presented in ${currency} and rounded to the nearest dollar.</p><p>The financial statements have been prepared on the historical cost basis, except where otherwise indicated.</p>`,
    },
    {
      id: 'note_3',
      title: '3. Significant Accounting Policies',
      content: `<p><strong>Revenue Recognition:</strong> Revenue is recognised when control of goods or services is transferred to the customer at an amount that reflects the consideration to which the Company expects to be entitled.</p><p><strong>Property, Plant and Equipment:</strong> PPE is stated at cost less accumulated depreciation and impairment losses. Depreciation is calculated on a straight-line basis over the estimated useful lives of the assets.</p><p><strong>Inventories:</strong> Inventories are measured at the lower of cost and net realisable value using the weighted average cost formula.</p><p><strong>Financial Instruments:</strong> Financial assets and liabilities are recognised when the Company becomes party to the contractual provisions of the instrument.</p>`,
    },
    {
      id: 'note_4',
      title: '4. Revenue',
      content: buildRevenueNote(is, fmtAmt),
    },
    {
      id: 'note_5',
      title: '5. Operating Expenses',
      content: buildOpexNote(is, fmtAmt),
    },
    {
      id: 'note_6',
      title: '6. Property, Plant and Equipment',
      content: buildPPENote(bs, fmtAmt),
    },
    {
      id: 'note_7',
      title: '7. Trade and Other Receivables',
      content: buildReceivablesNote(bs, fmtAmt),
    },
    {
      id: 'note_8',
      title: '8. Trade and Other Payables',
      content: buildPayablesNote(bs, fmtAmt),
    },
    {
      id: 'note_9',
      title: '9. Borrowings',
      content: buildBorrowingsNote(bs, fmtAmt),
    },
    {
      id: 'note_10',
      title: '10. Capital and Reserves',
      content: `<p>Total equity as at ${period_end || periodYear} amounts to <strong>${fmtAmt(kpis.total_equity)}</strong>, comprising share capital, retained earnings and other reserves as detailed in the Statement of Changes in Equity.</p>`,
    },
    {
      id: 'note_11',
      title: '11. Contingent Liabilities and Commitments',
      content: `<p>The Company had no material contingent liabilities or capital commitments outstanding as at the reporting date, other than those already recognised in these financial statements.</p>`,
    },
    {
      id: 'note_12',
      title: '12. Related Party Transactions',
      content: `<p>Transactions between the Company and its related parties, if any, are conducted on terms equivalent to those that prevail in arm's length transactions. Details of any material related party transactions are disclosed in accordance with IAS 24.</p>`,
    },
    {
      id: 'note_13',
      title: '13. Events After the Reporting Period',
      content: `<p>The directors are not aware of any material events that have occurred after the reporting date that would require adjustment to or disclosure in these financial statements.</p>`,
    },
  ];

  return notes;
}

// sections is now a dict: { 'Category Name': { items: [{label, amount}], total } }
function findSection(stmtSections, catName) {
  const sec = stmtSections?.[catName];
  return sec || null;
}

function buildRevenueNote(is, fmtAmt) {
  const revSection = findSection(is?.sections, 'Revenue');
  if (!revSection || !revSection.items || !revSection.items.length) {
    return `<p>Revenue comprises sales of goods and services rendered during the period.</p>`;
  }
  let rows = '';
  for (const item of revSection.items) {
    rows += `<tr><td>${item.label}</td><td style="text-align:right">${fmtAmt(item.amount)}</td></tr>`;
  }
  return `<p>Revenue for the period is analysed as follows:</p><table border="1" cellpadding="4" style="border-collapse:collapse;width:100%"><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>${rows}<tr><td><strong>Total Revenue</strong></td><td style="text-align:right"><strong>${fmtAmt(revSection.total)}</strong></td></tr></tbody></table>`;
}

function buildOpexNote(is, fmtAmt) {
  const opex = findSection(is?.sections, 'Operating Expenses');
  if (!opex || !opex.items || !opex.items.length) {
    return `<p>Operating expenses are incurred in the ordinary course of business.</p>`;
  }
  let rows = '';
  for (const item of opex.items) {
    rows += `<tr><td>${item.label}</td><td style="text-align:right">${fmtAmt(item.amount)}</td></tr>`;
  }
  return `<table border="1" cellpadding="4" style="border-collapse:collapse;width:100%"><thead><tr><th>Expense Category</th><th>Amount</th></tr></thead><tbody>${rows}<tr><td><strong>Total Operating Expenses</strong></td><td style="text-align:right"><strong>${fmtAmt(opex.total)}</strong></td></tr></tbody></table>`;
}

function buildPPENote(bs, fmtAmt) {
  const nca = findSection(bs?.sections, 'Non-Current Assets');
  if (!nca) return `<p>There were no property, plant and equipment items recognised in the period.</p>`;
  const ppeItems = nca.items.filter(i => /plant|equipment|ppe|property/i.test(i.label));
  const deprItems = nca.items.filter(i => /depreciat/i.test(i.label));
  if (!ppeItems.length) return `<p>There were no property, plant and equipment items recognised in the period.</p>`;
  const cost = ppeItems.reduce((s, i) => s + i.amount, 0);
  const accDepr = Math.abs(deprItems.reduce((s, i) => s + i.amount, 0));
  const nbv = cost - accDepr;
  return `<table border="1" cellpadding="4" style="border-collapse:collapse;width:100%"><thead><tr><th></th><th>Cost</th><th>Acc. Depreciation</th><th>Net Book Value</th></tr></thead><tbody><tr><td>PPE</td><td style="text-align:right">${fmtAmt(cost)}</td><td style="text-align:right">(${fmtAmt(accDepr)})</td><td style="text-align:right">${fmtAmt(nbv)}</td></tr></tbody></table>`;
}

function buildReceivablesNote(bs, fmtAmt) {
  const ca = findSection(bs?.sections, 'Current Assets');
  if (!ca) return `<p>There were no trade receivables outstanding at the reporting date.</p>`;
  const arItems = ca.items.filter(i => /receivab|debtor/i.test(i.label));
  if (!arItems.length) return `<p>There were no trade receivables outstanding at the reporting date.</p>`;
  const total = arItems.reduce((s, i) => s + i.amount, 0);
  return `<p>Trade receivables of <strong>${fmtAmt(total)}</strong> represent amounts due from customers in the ordinary course of business. The Company applies a simplified expected credit loss model in accordance with IFRS 9.</p>`;
}

function buildPayablesNote(bs, fmtAmt) {
  const cl = findSection(bs?.sections, 'Current Liabilities');
  if (!cl) return `<p>There were no trade payables outstanding at the reporting date.</p>`;
  const apItems = cl.items.filter(i => /payab|creditor/i.test(i.label));
  if (!apItems.length) return `<p>There were no trade payables outstanding at the reporting date.</p>`;
  const total = apItems.reduce((s, i) => s + i.amount, 0);
  return `<p>Trade payables of <strong>${fmtAmt(Math.abs(total))}</strong> represent amounts due to suppliers in the ordinary course of business. The carrying amount approximates fair value.</p>`;
}

function buildBorrowingsNote(bs, fmtAmt) {
  const cl  = findSection(bs?.sections, 'Current Liabilities');
  const ncl = findSection(bs?.sections, 'Non-Current Liabilities');
  const stbItems = cl?.items?.filter(i => /borrow|loan|credit facilit|overdraft/i.test(i.label)) || [];
  const ltbItems = ncl?.items?.filter(i => /borrow|loan|credit facilit/i.test(i.label)) || [];
  if (!stbItems.length && !ltbItems.length) return `<p>The Company had no outstanding borrowings at the reporting date.</p>`;
  let rows = '';
  const stbTotal = stbItems.reduce((s, i) => s + i.amount, 0);
  const ltbTotal = ltbItems.reduce((s, i) => s + i.amount, 0);
  if (stbItems.length) rows += `<tr><td>Short-term borrowings (current)</td><td style="text-align:right">${fmtAmt(Math.abs(stbTotal))}</td></tr>`;
  if (ltbItems.length) rows += `<tr><td>Long-term borrowings (non-current)</td><td style="text-align:right">${fmtAmt(Math.abs(ltbTotal))}</td></tr>`;
  rows += `<tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${fmtAmt(Math.abs(stbTotal + ltbTotal))}</strong></td></tr>`;
  return `<table border="1" cellpadding="4" style="border-collapse:collapse;width:100%"><thead><tr><th>Facility</th><th>Carrying Amount</th></tr></thead><tbody>${rows}</tbody></table>`;
}

module.exports = { generateNotes };
