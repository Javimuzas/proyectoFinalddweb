const { z } = require('zod');

const trimmedString = (min, max, fieldName) =>
    z.string({
        required_error: `${fieldName} es obligatorio.`
    })
        .trim()
        .min(min, `${fieldName} debe tener al menos ${min} caracteres.`)
        .max(max, `${fieldName} no puede superar ${max} caracteres.`);

const registerSchema = z.object({
    username: trimmedString(3, 40, 'El usuario'),
    email: z.string({
        required_error: 'El email es obligatorio.'
    }).trim().email('Debes introducir un email válido.'),
    password: z.string({
        required_error: 'La contraseña es obligatoria.'
    }).min(10, 'La contraseña debe tener al menos 10 caracteres.')
});

const loginSchema = z.object({
    email: z.string({
        required_error: 'El email es obligatorio.'
    }).trim().email('Debes introducir un email válido.'),
    password: z.string({
        required_error: 'La contraseña es obligatoria.'
    }).min(1, 'La contraseña es obligatoria.')
});

const topicSchema = z.object({
    title: trimmedString(3, 120, 'El tema'),
    item_one: trimmedString(1, 120, 'El puesto 1'),
    item_two: trimmedString(1, 120, 'El puesto 2'),
    item_three: trimmedString(1, 120, 'El puesto 3')
});

const replySchema = z.object({
    item_one: trimmedString(1, 120, 'El puesto 1'),
    item_two: trimmedString(1, 120, 'El puesto 2'),
    item_three: trimmedString(1, 120, 'El puesto 3')
});

function getFirstError(result) {
    return result.error.issues[0]?.message || 'Datos inválidos.';
}

module.exports = {
    registerSchema,
    loginSchema,
    topicSchema,
    replySchema,
    getFirstError
};