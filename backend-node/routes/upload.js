const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { v4: uuidv4 } = require('uuid');

const { parseFile, extractTrialBalance, extractArAging, extractApAging, extractFixedAssets, extractMappingFile } = require('../services/dataParser');
const { mapAccounts, applyExternalMapping } = require('../services/accountMapper');

const router  = express.Router();
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.csv','.xlsx','.xls'].includes(ext)) cb(null, true);
    else cb(new Error('Only CSV, XLS and XLSX files are accepted'));
  },
});

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function sessionDir(sid) {
  const dir = path.join(UPLOADS_DIR, sid);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function buildSuggestions(tbRecords, sessionId) {
  const dir = sessionDir(sessionId);
  const mapPath = path.join(dir, 'mapping_file.json');

  let suggestions;
  if (fs.existsSync(mapPath)) {
    // Use external mapping file as source of truth
    const { records: extMappings } = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    suggestions = applyExternalMapping(tbRecords, extMappings);
  } else {
    // AI keyword/fuzzy matching
    suggestions = mapAccounts(tbRecords);
  }

  // Attach actual balances so the frontend can display them
  suggestions.forEach((s, i) => { s.balance = tbRecords[i]?.balance ?? 0; });
  return suggestions;
}

router.post('/', upload.single('file'), (req, res) => {
  try {
    const file      = req.file;
    const fileType  = req.body.file_type || 'trial_balance';
    const sessionId = req.body.session_id || uuidv4();

    if (!file) return res.status(400).json({ detail: 'No file uploaded' });

    const parsed = parseFile(file.buffer, file.originalname);
    const dir    = sessionDir(sessionId);

    let records   = [];
    let extraMeta = {};

    if (fileType === 'trial_balance') {
      records = extractTrialBalance(parsed);
      if (!records.length) return res.status(422).json({ detail: 'Could not extract any accounts from this file. Please ensure it has account name and balance columns.' });
      const suggestions = buildSuggestions(records, sessionId);
      extraMeta.suggestions = suggestions;

    } else if (fileType === 'mapping_file') {
      records = extractMappingFile(parsed);
      if (!records.length) return res.status(422).json({ detail: 'Could not extract mappings from this file. Expected columns: account code, account name, category, statement.' });

      // If trial balance already uploaded for this session, re-generate suggestions
      const tbPath = path.join(dir, 'trial_balance.json');
      if (fs.existsSync(tbPath)) {
        const { records: tbRecords } = JSON.parse(fs.readFileSync(tbPath, 'utf8'));
        // Save mapping file first so buildSuggestions picks it up
        fs.writeFileSync(path.join(dir, 'mapping_file.json'), JSON.stringify({ records, meta: parsed.meta }, null, 2));
        const suggestions = buildSuggestions(tbRecords, sessionId);
        suggestions.forEach((s, i) => { s.balance = tbRecords[i]?.balance ?? 0; });
        extraMeta.suggestions = suggestions;
        extraMeta.tb_reprocessed = true;
      }

    } else if (fileType === 'ar_aging') {
      records = extractArAging(parsed);
    } else if (fileType === 'ap_aging') {
      records = extractApAging(parsed);
    } else if (fileType === 'fixed_assets') {
      records = extractFixedAssets(parsed);
    }

    // Persist to session
    fs.writeFileSync(
      path.join(dir, `${fileType}.json`),
      JSON.stringify({ records, meta: parsed.meta }, null, 2)
    );

    // Build preview (first 10 rows)
    const previewRows = parsed.rows.slice(0, 10).map(r =>
      parsed.headers.map(h => String(r[h] ?? ''))
    );

    res.json({
      session_id:       sessionId,
      file_type:        fileType,
      filename:         file.originalname,
      row_count:        records.length,
      preview:          { columns: parsed.headers, rows: previewRows },
      detected_columns: parsed.meta,
      ...(extraMeta.suggestions ? { suggestions: extraMeta.suggestions } : {}),
      ...(extraMeta.tb_reprocessed ? { tb_reprocessed: true } : {}),
    });
  } catch (err) {
    console.error('[upload]', err);
    res.status(422).json({ detail: err.message });
  }
});

module.exports = router;
