const Fuse = require('fuse.js');
const { CHART } = require('./chartOfAccounts');

function buildCandidates() {
  const candidates = [];
  for (const [statement, sections] of Object.entries(CHART)) {
    for (const [category, subcats] of Object.entries(sections)) {
      for (const [subcategory, keywords] of Object.entries(subcats)) {
        candidates.push({ statement, category, subcategory, keywords });
      }
    }
  }
  return candidates;
}

const CANDIDATES = buildCandidates();

function inferSign(statement, category) {
  if (statement === 'income_statement') {
    if (category === 'Revenue') return -1;
    return 1;
  }
  if (statement === 'balance_sheet') {
    if (['Current Liabilities','Non-Current Liabilities','Equity'].includes(category)) return -1;
    return 1;
  }
  return 1;
}

function mapAccount(accountCode, accountName) {
  const nameLower = String(accountName || '').toLowerCase().trim();

  // Direct keyword match first
  let bestScore = 0;
  let bestMatch = null;
  for (const c of CANDIDATES) {
    for (const kw of c.keywords) {
      if (nameLower.includes(kw)) {
        const score = kw.length / nameLower.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = c;
        }
      }
    }
  }

  if (bestMatch && bestScore > 0.05) {
    return {
      account_code: accountCode,
      account_name: accountName,
      suggested_statement: bestMatch.statement,
      suggested_category: bestMatch.category,
      suggested_subcategory: bestMatch.subcategory,
      confidence: Math.min(0.99, 0.6 + bestScore * 0.4),
      sign: inferSign(bestMatch.statement, bestMatch.category),
    };
  }

  // Fuzzy fallback using fuse.js on keyword strings
  const fuseItems = CANDIDATES.map(c => ({
    ...c,
    searchStr: `${c.subcategory} ${c.keywords.join(' ')}`,
  }));
  const fuse = new Fuse(fuseItems, { keys: ['searchStr'], threshold: 0.5, includeScore: true });
  const results = fuse.search(nameLower);

  if (results.length) {
    const top = results[0];
    const conf = Math.max(0.1, 1 - (top.score || 0.5));
    return {
      account_code: accountCode,
      account_name: accountName,
      suggested_statement: top.item.statement,
      suggested_category: top.item.category,
      suggested_subcategory: top.item.subcategory,
      confidence: Math.round(conf * 100) / 100,
      sign: inferSign(top.item.statement, top.item.category),
    };
  }

  return {
    account_code: accountCode,
    account_name: accountName,
    suggested_statement: 'balance_sheet',
    suggested_category: 'Current Assets',
    suggested_subcategory: 'Other Current Assets',
    confidence: 0.1,
    sign: 1,
  };
}

function mapAccounts(records) {
  return records.map(r => mapAccount(r.account_code, r.account_name));
}

// ── External mapping file resolver ───────────────────────────────────────────
// Infer internal statement key from raw string like "BS1105-Cash and bank" or "Balance Sheet"
function resolveStatement(stmtRaw) {
  const s = String(stmtRaw || '').toLowerCase().trim();
  if (!s) return null;
  if (/^bs|balance sheet/.test(s))                  return 'balance_sheet';
  if (/^is|income stat|profit.*loss|p&l|^pl/.test(s)) return 'income_statement';
  if (/^cf|cash flow/.test(s))                      return 'cash_flow';
  if (/^eq|equity/.test(s))                         return 'equity';
  return null;
}

// Fuzzy-match a mapping category string (e.g. "Cash and bank") to our CHART subcategory
function resolveCategory(mappingCategory, statement) {
  const q = String(mappingCategory || '').toLowerCase().trim();
  if (!q) return null;

  // Strip leading codes like "BS1105-" to get the plain name
  const clean = q.replace(/^[a-z]{2}\d+[-–]\s*/i, '').trim();

  // Try direct keyword match across CHART
  let bestScore = 0, bestMatch = null;
  for (const c of CANDIDATES) {
    if (statement && c.statement !== statement) continue;
    for (const kw of c.keywords) {
      if (clean.includes(kw) || kw.includes(clean)) {
        const score = Math.min(clean.length, kw.length) / Math.max(clean.length, kw.length);
        if (score > bestScore) { bestScore = score; bestMatch = c; }
      }
    }
    // Also match against subcategory name itself
    const subLower = c.subcategory.toLowerCase();
    if (subLower.includes(clean) || clean.includes(subLower.split(' ')[0])) {
      const score = 0.5;
      if (score > bestScore) { bestScore = score; bestMatch = c; }
    }
  }
  if (bestMatch && bestScore > 0.2) return bestMatch;

  // Fuse fallback
  const fuseItems = CANDIDATES
    .filter(c => !statement || c.statement === statement)
    .map(c => ({ ...c, searchStr: `${c.subcategory} ${c.keywords.join(' ')}` }));
  const fuse = new Fuse(fuseItems, { keys: ['searchStr'], threshold: 0.6, includeScore: true });
  const results = fuse.search(clean);
  if (results.length) return results[0].item;
  return null;
}

// Apply external mapping file to trial balance records
// externalMappings: array of { account_code, account_name, mapping_category, statement_raw }
// tbRecords: array of { account_code, account_name, balance }
function applyExternalMapping(tbRecords, externalMappings) {
  // Build lookup by account_code (and name fallback)
  const byCode = {};
  const byName = {};
  for (const em of externalMappings) {
    if (em.account_code) byCode[em.account_code] = em;
    if (em.account_name) byName[em.account_name.toLowerCase()] = em;
  }

  return tbRecords.map(r => {
    const ext = byCode[r.account_code] || byName[(r.account_name || '').toLowerCase()];

    if (ext) {
      // We have an explicit mapping — resolve statement and category
      const statement = resolveStatement(ext.statement_raw) || resolveStatement(ext.mapping_category) || 'balance_sheet';
      const resolved  = resolveCategory(ext.mapping_category || ext.statement_raw, statement);
      const category    = resolved?.category    || 'Current Assets';
      const subcategory = resolved?.subcategory || 'Other Current Assets';
      return {
        account_code:        r.account_code,
        account_name:        r.account_name,
        suggested_statement: statement,
        suggested_category:  category,
        suggested_subcategory: subcategory,
        confidence:          0.99,   // explicitly mapped = highest confidence
        sign:                inferSign(statement, category),
        source:              'mapping_file',
      };
    }

    // Fallback to AI mapping for unmapped accounts
    return { ...mapAccount(r.account_code, r.account_name), source: 'ai' };
  });
}

function getStatements() {
  return Object.keys(CHART);
}

function getCategories(statement) {
  return statement && CHART[statement] ? Object.keys(CHART[statement]) : [];
}

function getSubcategories(statement, category) {
  return statement && category && CHART[statement]?.[category]
    ? Object.keys(CHART[statement][category])
    : [];
}

module.exports = { mapAccounts, mapAccount, applyExternalMapping, getStatements, getCategories, getSubcategories, inferSign };
