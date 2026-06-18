require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');


const authRoutes = require('./routes/auth');
const topicRoutes = require('./routes/topics');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigin = process.env.APP_ORIGIN || `http://localhost:${PORT}`;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"]
    }
  },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: path.join(__dirname, 'data') }),
  name: 'top3.sid',
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 4
  }
}));


app.use((req, res, next) => {
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return next();
  }

  const origin = req.get('origin');
  const referer = req.get('referer');

  let source = origin;

  if (!source && referer) {
    try {
      source = new URL(referer).origin;
    } catch {
      source = null;
    }
  }

  if (source !== allowedOrigin) {
    return res.status(403).render('error', {
      title: 'Error de Seguridad (CSRF)',
      message: 'La solicitud no proviene de un origen permitido.'
    });
  }

  next();
});

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.use(authRoutes);
app.use(topicRoutes);
app.use(adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Error interno', message: 'Ha ocurrido un error inesperado.' });
});

app.listen(PORT, () => {
  console.log(`Top3 running on http://localhost:${PORT}`);
});
