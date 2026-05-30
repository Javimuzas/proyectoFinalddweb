const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', requireAdmin, (req, res) => {
  const stats = {
    users: db.prepare('SELECT COUNT(*) as total FROM users').get().total,
    topics: db.prepare('SELECT COUNT(*) as total FROM topics').get().total,
    replies: db.prepare('SELECT COUNT(*) as total FROM replies').get().total
  };

  const latestUsers = db.prepare('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10').all();
  res.render('admin', { title: 'Administración', stats, latestUsers });
});

module.exports = router;
