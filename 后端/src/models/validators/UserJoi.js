const Joi = require('joi')

const schema = Joi.object().keys({
    name: Joi.string().min(3).max(16).required(),
    password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{6,16}$/),
    role: Joi.string().required(),
})
//.with('username', 'birthyear')

module.exports = UserJoi = schema