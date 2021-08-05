const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUser, updateProfile, updateAvatar, getAuthUser,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getAuthUser);

router.get('/:userId', celebrate({
  body: Joi.object().keys({
    userId: Joi.string().pattern(/^[a-f\d]{24}$/i).messages({
      'string.pattern.base': 'Не соответствует _id. Количество символов должно равняться - 24, содержать строчные латинские буквы и цифры.',
    }),
  }, { abortEarly: false }).unknown(true),
}), getUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).messages({
      'string.min': 'Минимальная длина поля "name" - 2',
      'string.max': 'Максимальная длина поля "name" - 30',
      'string.empty': 'Поле "name" должно быть заполнено',
    }),
    about: Joi.string().min(2).max(200).messages({
      'string.min': 'Минимальная длина поля "about" - 2',
      'string.max': 'Максимальная длина поля "about" - 200',
      'string.empty': 'Поле "about" должно быть заполнено',
    }),
  }, { abortEarly: false }),
}), updateProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(/^(https|http):\/\/(www\.)?[A-Za-z0-9-]*\.[A-Za-z0-9]{2}[A-Za-z0-9-._~:\\/?#[\]@!$&'()*+,;=]*#?$/)
      .messages({
        'string.pattern.base': 'Поле "avatar" должно быть ссылкой.',
      }),
  }),
}), updateAvatar);

module.exports = router;
