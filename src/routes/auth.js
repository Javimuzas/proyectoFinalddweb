const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { requireGuest, requireAuth } = require('../middleware/auth');
const { registerSchema, loginSchema, getFirstError } = require('../validators');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiados intentos de login. Espera un minuto.'
});

router.get('/register', requireGuest, (req, res) => {
  res.render('auth/register', { title: 'Registro' });
});

router.post('/register', requireGuest, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    req.session.flash = { type: 'error', message: getFirstError(parsed) };
    return res.redirect('/register');
  }

  const { username, email, password } = parsed.data;

  const exists = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?')
    .get(email.toLowerCase(), username);

  if (exists) {
    req.session.flash = { type: 'error', message: 'Ese usuario o email ya existe.' };
    return res.redirect('/register');
  }

  const hash = await bcrypt.hash(password, 12);
  const result = db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(username, email.toLowerCase(), hash, 'user');

  req.session.user = {
    id: result.lastInsertRowid,
    username,
    email: email.toLowerCase(),
    role: 'user'
  };

  req.session.flash = { type: 'success', message: 'Cuenta creada correctamente.' };
  res.redirect('/');
});

router.get('/login', requireGuest, (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.post('/login', requireGuest, loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    req.session.flash = { type: 'error', message: getFirstError(parsed) };
    return res.redirect('/login');
  }

  const { email, password } = parsed.data;

  const user = db.prepare('SELECT id, username, email, password_hash, role FROM users WHERE email = ?')
    .get(email.toLowerCase());

  if (!user) {
    req.session.flash = { type: 'error', message: 'Credenciales incorrectas.' };
    return res.redirect('/login');
  }

  const ok = await bcrypt.compare(password, user.password_hash);

  if (!ok) {
    req.session.flash = { type: 'error', message: 'Credenciales incorrectas.' };
    return res.redirect('/login');
  }

  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).render('error', {
        title: 'Error',
        message: 'No se pudo iniciar sesión.'
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    req.session.flash = { type: 'success', message: 'Has iniciado sesión.' };
    res.redirect('/');
  });
});

router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('top3.sid');
    res.redirect('/login');
  });
});

router.get('/privacy', (req, res) => {
  res.render('privacy', { title: 'Política de privacidad' });
});

router.post('/account/delete', requireAuth, (req, res) => {
  const userId = req.session.user.id;

  db.prepare('DELETE FROM users WHERE id = ?').run(userId);

  req.session.destroy(() => {
    res.clearCookie('top3.sid');
    res.redirect('/');
  });
});

module.exports = router;