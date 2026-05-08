const express = require('express');
const path    = require('path');
const fs      = require('fs');

const router = express.Router();
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// POST /notes/save
router.post('/save', (req, res) => {
  try {
    const { session_id, notes } = req.body;
    if (!session_id) return res.status(400).json({ detail: 'session_id required' });

    const dir = path.join(UPLOADS_DIR, session_id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Merge into existing statements.json if present
    const stmtPath = path.join(dir, 'statements.json');
    if (fs.existsSync(stmtPath)) {
      const saved = JSON.parse(fs.readFileSync(stmtPath, 'utf8'));
      saved.notes = notes;
      fs.writeFileSync(stmtPath, JSON.stringify(saved, null, 2));
    }

    // Also write standalone notes
    fs.writeFileSync(path.join(dir, 'notes.json'), JSON.stringify(notes, null, 2));
    res.json({ ok: true, count: notes.length });
  } catch (err) {
    console.error('[notes/save]', err);
    res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
