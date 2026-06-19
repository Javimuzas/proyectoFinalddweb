const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { requireTopicOwnerOrAdmin, requireReplyOwnerOrAdmin } = require('../middleware/ownership');
const { topicSchema, replySchema, getFirstError } = require('../validators');

const router = express.Router();

router.get('/', (req, res) => {
  const topics = db.prepare(`
    SELECT t.id, t.title, t.item_one, t.item_two, t.item_three, t.created_at, u.username,
    (SELECT COUNT(*) FROM replies r WHERE r.topic_id = t.id) AS reply_count
    FROM topics t
    JOIN users u ON u.id = t.user_id
    ORDER BY t.created_at DESC
  `).all();

  res.render('topics/index', { title: 'Top3', topics });
});

router.get('/topics/new', requireAuth, (req, res) => {
  res.render('topics/new', { title: 'Nuevo tema' });
});

router.post('/topics', requireAuth, (req, res) => {
  const parsed = topicSchema.safeParse(req.body);

  if (!parsed.success) {
    req.session.flash = { type: 'error', message: getFirstError(parsed) };
    return res.redirect('/topics/new');
  }

  const { title, item_one, item_two, item_three } = parsed.data;

  db.prepare('INSERT INTO topics (user_id, title, item_one, item_two, item_three) VALUES (?, ?, ?, ?, ?)')
    .run(req.session.user.id, title, item_one, item_two, item_three);

  req.session.flash = { type: 'success', message: 'Tema creado correctamente.' };
  res.redirect('/');
});

router.get('/topics/:id', (req, res) => {
  const topic = db.prepare(`
    SELECT t.*, u.username
    FROM topics t
    JOIN users u ON u.id = t.user_id
    WHERE t.id = ?
  `).get(req.params.id);

  if (!topic) {
    return res.status(404).render('error', {
      title: 'No encontrado',
      message: 'El tema no existe.'
    });
  }

  const replies = db.prepare(`
    SELECT r.*, u.username
    FROM replies r
    JOIN users u ON u.id = r.user_id
    WHERE r.topic_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.id);

  res.render('topics/show', { title: topic.title, topic, replies });
});

router.get('/topics/:id/edit', requireAuth, requireTopicOwnerOrAdmin, (req, res) => {
  res.render('topics/edit', { title: 'Editar tema', topic: req.topic });
});

router.post('/topics/:id/edit', requireAuth, requireTopicOwnerOrAdmin, (req, res) => {
  const parsed = topicSchema.safeParse(req.body);

  if (!parsed.success) {
    req.session.flash = { type: 'error', message: getFirstError(parsed) };
    return res.redirect(`/topics/${req.params.id}/edit`);
  }

  const { title, item_one, item_two, item_three } = parsed.data;

  db.prepare('UPDATE topics SET title = ?, item_one = ?, item_two = ?, item_three = ? WHERE id = ?')
    .run(title, item_one, item_two, item_three, req.params.id);

  req.session.flash = { type: 'success', message: 'Tema actualizado.' };
  res.redirect(`/topics/${req.params.id}`);
});

router.post('/topics/:id/delete', requireAuth, requireTopicOwnerOrAdmin, (req, res) => {
  db.prepare('DELETE FROM topics WHERE id = ?').run(req.params.id);

  req.session.flash = { type: 'success', message: 'Tema eliminado.' };
  res.redirect('/');
});

router.post('/topics/:id/replies', requireAuth, (req, res) => {
  const topic = db.prepare('SELECT id FROM topics WHERE id = ?').get(req.params.id);

  if (!topic) {
    return res.status(404).render('error', {
      title: 'No encontrado',
      message: 'El tema no existe.'
    });
  }

  const parsed = replySchema.safeParse(req.body);

  if (!parsed.success) {
    req.session.flash = { type: 'error', message: getFirstError(parsed) };
    return res.redirect(`/topics/${req.params.id}`);
  }

  const { item_one, item_two, item_three } = parsed.data;

  db.prepare('INSERT INTO replies (topic_id, user_id, item_one, item_two, item_three) VALUES (?, ?, ?, ?, ?)')
    .run(req.params.id, req.session.user.id, item_one, item_two, item_three);

  req.session.flash = { type: 'success', message: 'Respuesta publicada.' };
  res.redirect(`/topics/${req.params.id}`);
});

router.post('/replies/:id/delete', requireAuth, requireReplyOwnerOrAdmin, (req, res) => {
  const topicId = req.reply.topic_id;

  db.prepare('DELETE FROM replies WHERE id = ?').run(req.params.id);

  req.session.flash = { type: 'success', message: 'Respuesta eliminada.' };
  res.redirect(`/topics/${topicId}`);
});

module.exports = router;