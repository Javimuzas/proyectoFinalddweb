const db = require('../db');

function requireTopicOwnerOrAdmin(req, res, next) {
    const topic = db.prepare('SELECT * FROM topics WHERE id = ?').get(req.params.id);

    if (!topic) {
        return res.status(404).render('error', {
            title: 'No encontrado',
            message: 'El tema no existe.'
        });
    }

    if (topic.user_id !== req.session.user.id && req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
            title: 'Acceso denegado',
            message: 'No puedes modificar este tema.'
        });
    }

    req.topic = topic;
    next();
}

function requireReplyOwnerOrAdmin(req, res, next) {
    const reply = db.prepare('SELECT * FROM replies WHERE id = ?').get(req.params.id);

    if (!reply) {
        return res.status(404).render('error', {
            title: 'No encontrado',
            message: 'La respuesta no existe.'
        });
    }

    if (reply.user_id !== req.session.user.id && req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
            title: 'Acceso denegado',
            message: 'No puedes borrar esta respuesta.'
        });
    }

    req.reply = reply;
    next();
}

module.exports = { requireTopicOwnerOrAdmin, requireReplyOwnerOrAdmin };