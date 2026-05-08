const XLSX = require('xlsx');

const CODE_KEYS    = ['account code','account no','account number','ledger account','ledger no','ledger account no','gl account','g/l account','gl account no','g/l account no','acct code','acct no','acc code','acc no','gl code','code','no'];
const NAME_KEYS    = ['account name','account description','ledger name','ledger description','g/l account description','gl account description','gl account name','g/l account name','account title','acc name','gl name','description','particulars','name'];
const DEBIT_KEYS   = ['debit','dr','debit amount','debit balance','debits'];
const CREDIT_KEYS  = ['credit','cr','credit amount','credit balance','credits'];
const CLOSING_KEYS = ['closing balance','closing','ending balance','end balance','end bal','close balance','bal close','period end balance','ytd balance','ytd','closing bal'];
const BALANCE_KEYS = ['balance','amount','net balance','net amount','net','bal','movement'];
const HEADER_KW    = ['account','ledger','code','name','debit','credit','balance','amount','description','no','dr','cr','closing','opening'];

const norm = s => String(s || '').trim().toLowerCase();

function findCol(headers, keys) {
  for (const h of headers) if (keys.includes(norm(h))) return h;
  for (const h of headers) for (const k of keys) if (norm(h).includes(k)) return h;
  return null;
}

function toFloat(v) {
  if (v == null || v === '') return 0;
  const s = String(v).replace(/,/g, '').replace(/\$/g, '').replace(/\(([^)]+)\)/, '-$1').trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function detectHeaderRow(rows) {
  let bestScore = 0, bestRow = 0;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const score = rows[i].filter(c => HEADER_KW.some(k => norm(c).includes(k))).length;
    if (score > bestScore) { bestScore = score; bestRow = i; }
    if (score >= 2) break;
  }
  return bestRow;
}

// Returns true if >60% of sampled values look like pure numbers/codes (no letters)
function looksNumeric(rows, col, sampleSize = 10) {
  const sample = rows.slice(0, sampleSize).map(r => String(r[col] || '').trim()).filter(Boolean);
  if (!sample.length) return false;
  const numCount = sample.filter(v => /^[\d\s,.()\-+]+$/.test(v)).length;
  return numCount / sample.length > 0.6;
}

// Returns true if >60% of sampled values contain letters (i.e. real text names)
function looksTextual(rows, col, sampleSize = 10) {
  const sample = rows.slice(0, sampleSize).map(r => String(r[col] || '').trim()).filter(Boolean);
  if (!sample.length) return false;
  const txtCount = sample.filter(v => /[a-zA-Z]/.test(v)).length;
  return txtCount / sample.length > 0.6;
}

function parseFile(buffer, filename) {
  const ext = filename.split('.').pop().toLowerCase();
  let wb;
  if (ext === 'csv') {
    wb = XLSX.read(buffer, { type: 'buffer', raw: false, codepage: 65001 });
  } else {
    wb = XLSX.read(buffer, { type: 'buffer' });
  }

  const ws   = wb.Sheets[wb.SheetNames[0]];
  const raw  = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!raw.length) throw new Error('File is empty');

  const headerRow = detectHeaderRow(raw);
  const headers   = raw[headerRow].map(h => String(h).trim());
  const dataRows  = raw.slice(headerRow + 1).filter(r => r.some(c => c !== ''));

  if (!dataRows.length) throw new Error('No data rows found after the header');

  // Build row objects first so we can sample values for validation
  const rows = dataRows.map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i] ?? ''; });
    return obj;
  });

  // ── Step 1: keyword-based detection ──────────────────────────
  let codeCol = findCol(headers, CODE_KEYS);
  const nameHeaders = headers.filter(h => h !== codeCol);
  let nameCol = findCol(nameHeaders, NAME_KEYS);

  // ── Step 2: data-driven validation & correction ───────────────
  // Rule: account name must contain text. If detected nameCol looks numeric,
  // find the first column with actual text and use that instead.
  if (nameCol && looksNumeric(rows, nameCol)) {
    const textCol = headers.find(h => h !== codeCol && looksTextual(rows, h));
    if (textCol) nameCol = textCol;
  }

  // Rule: account code should be numeric/alphanumeric.
  // If detected codeCol looks textual and nameCol looks numeric, swap them.
  if (codeCol && nameCol && looksTextual(rows, codeCol) && looksNumeric(rows, nameCol)) {
    [codeCol, nameCol] = [nameCol, codeCol];
  }

  // Rule: if no codeCol found, use first column that looks numeric
  if (!codeCol) {
    codeCol = headers.find(h => h !== nameCol && looksNumeric(rows, h)) || null;
  }

  // Rule: if no nameCol found, use first column that looks textual
  if (!nameCol) {
    nameCol = headers.find(h => h !== codeCol && looksTextual(rows, h)) || null;
  }

  // ── Step 3: balance columns ───────────────────────────────────
  const nonOpeningHeaders = headers.filter(h => !norm(h).includes('opening'));
  const closingCol = findCol(nonOpeningHeaders, CLOSING_KEYS);
  const balanceCol = closingCol || findCol(nonOpeningHeaders, BALANCE_KEYS);

  const meta = {
    detectedColumns: headers,
    codeCol,
    nameCol,
    debitCol:   findCol(headers, DEBIT_KEYS),
    creditCol:  findCol(headers, CREDIT_KEYS),
    balanceCol,
    rowCount:   dataRows.length,
  };

  return { rows, headers, meta };
}

function extractTrialBalance({ rows, headers, meta }) {
  let { codeCol, nameCol, debitCol, creditCol, balanceCol } = meta;

  // Fallback: first non-numeric-looking column as name
  if (!nameCol) {
    for (const h of headers) {
      const sample = rows.slice(0, 5).map(r => String(r[h] || ''));
      if (sample.some(v => isNaN(parseFloat(v.replace(/,/g,''))))) { nameCol = h; break; }
    }
  }

  const records = [];
  for (const row of rows) {
    const name = String(row[nameCol] || '').trim();
    if (!name || ['nan','none','total',''].includes(name.toLowerCase())) continue;

    let balance = 0;
    if (balanceCol && row[balanceCol] !== '') {
      balance = toFloat(row[balanceCol]);
    } else if (debitCol && creditCol) {
      balance = toFloat(row[debitCol]) - toFloat(row[creditCol]);
    } else {
      // Sum all numeric columns that aren't code/name
      for (const h of headers) {
        if (h === codeCol || h === nameCol) continue;
        balance += toFloat(row[h]);
      }
    }

    records.push({
      account_code: String(row[codeCol] || '').trim(),
      account_name: name,
      balance: Math.round(balance * 100) / 100,
    });
  }
  return records;
}

function extractArAging({ rows, headers, meta }) {
  const nameCol   = meta.nameCol || headers[0];
  const bucketCols = headers.filter(h => /current|30|60|90|120|over|aged/i.test(h));
  const totalCol  = findCol(headers, BALANCE_KEYS);
  return rows
    .map(r => {
      const customer = String(r[nameCol] || '').trim();
      if (!customer || ['nan','none','total'].includes(customer.toLowerCase())) return null;
      const buckets = {};
      bucketCols.forEach(b => { buckets[b] = toFloat(r[b]); });
      const total = totalCol ? toFloat(r[totalCol]) : Object.values(buckets).reduce((a,b)=>a+b,0);
      return { customer, buckets, total: Math.round(total*100)/100 };
    })
    .filter(Boolean);
}

function extractApAging({ rows, headers, meta }) {
  const nameCol   = meta.nameCol || headers[0];
  const bucketCols = headers.filter(h => /current|30|60|90|120|over|aged/i.test(h));
  const totalCol  = findCol(headers, BALANCE_KEYS);
  return rows
    .map(r => {
      const vendor = String(r[nameCol] || '').trim();
      if (!vendor || ['nan','none','total'].includes(vendor.toLowerCase())) return null;
      const buckets = {};
      bucketCols.forEach(b => { buckets[b] = toFloat(r[b]); });
      const total = totalCol ? toFloat(r[totalCol]) : Object.values(buckets).reduce((a,b)=>a+b,0);
      return { vendor, buckets, total: Math.round(total*100)/100 };
    })
    .filter(Boolean);
}

function extractFixedAssets({ rows, headers, meta }) {
  const nameCol = meta.nameCol || findCol(headers, ['asset name','asset description','description']) || headers[0];
  const costCol = findCol(headers, ['cost','original cost','gross cost','gross value','historical cost']);
  const deprCol = findCol(headers, ['accumulated depreciation','acc depr','accum depr','depreciation']);
  const nbvCol  = findCol(headers, ['net book value','nbv','net value','carrying value']);
  return rows
    .map(r => {
      const name = String(r[nameCol] || '').trim();
      if (!name || ['nan','none','total'].includes(name.toLowerCase())) return null;
      const cost = toFloat(r[costCol]);
      const depr = toFloat(r[deprCol]);
      const nbv  = nbvCol ? toFloat(r[nbvCol]) : cost - depr;
      return { asset_name: name, cost, accumulated_depreciation: depr, net_book_value: nbv };
    })
    .filter(Boolean);
}

// ── Mapping file parser ──────────────────────────────────────────────────────
// Reads a file with columns: account code | account name | category/mapping | statement
// Returns array of { account_code, account_name, mapping_category, statement_code }
function extractMappingFile({ rows, headers, meta }) {
  // Detect the four key columns
  const codeCol = meta.codeCol || findCol(headers, CODE_KEYS);
  const nameCol = meta.nameCol || findCol(headers, NAME_KEYS);

  // Mapping category column: contains values like "Cash and bank", "Receivables"
  const MAPPING_KEYS = ['mapping','category','account category','account type','classification','report category','gl category'];
  const mappingCol = findCol(headers, MAPPING_KEYS)
    || headers.find(h => !['account code','account no','ledger account','ledger name','account name','opening balance','closing balance','opening','closing','balance','amount','debit','credit'].some(k => norm(h).includes(k)) && h !== codeCol && h !== nameCol && looksTextual(rows, h));

  // Statement column: contains values like "BS1105-Cash and bank", "Balance Sheet", "P&L"
  const STMT_KEYS = ['financial statement','financial statement items','statement','report','fs item','fs','fs items'];
  const stmtCol = findCol(headers, STMT_KEYS)
    || headers.find(h => {
      const sample = rows.slice(0,5).map(r => norm(String(r[h]||'')));
      return sample.some(v => /^bs|^is|^pl|balance sheet|income|p&l|profit/i.test(v));
    });

  const results = [];
  for (const row of rows) {
    const code = String(row[codeCol] || '').trim();
    const name = String(row[nameCol] || '').trim();
    if (!code && !name) continue;
    if (['total','subtotal','nan','none',''].includes(norm(code)) && ['total','subtotal','nan','none',''].includes(norm(name))) continue;

    const mappingRaw = mappingCol ? String(row[mappingCol] || '').trim() : '';
    const stmtRaw    = stmtCol    ? String(row[stmtCol]    || '').trim() : '';

    results.push({
      account_code:     code,
      account_name:     name,
      mapping_category: mappingRaw,
      statement_raw:    stmtRaw,
    });
  }
  return results;
}

module.exports = { parseFile, extractTrialBalance, extractArAging, extractApAging, extractFixedAssets, extractMappingFile, looksNumeric, looksTextual };
