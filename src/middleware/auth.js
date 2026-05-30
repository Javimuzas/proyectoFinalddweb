function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

function requireGuest(req, res, next) {
  if (req.session.user) return res.redirect('/');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', { title: 'Acceso denegado', message: 'No autorizado.' });
  }
  next();
}

module.exports = { requireAuth, requireGuest, requireAdmin };
