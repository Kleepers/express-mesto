const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);

router.delete('/:cardId', celebrate({
  body: Joi.object().keys({
    cardId: Joi.string().pattern(/^[a-f\d]{24}$/i).messages({
      'string.pattern.base': 'Не соответствует _id. Количество символов должно равняться - 24, содержать строчные латинские буквы и цифры.',
    }),
  }, { abortEarly: false }).unknown(true),
}), deleteCard);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30)
      .messages({
        'any.required': 'Поле "name" должно быть заполнено',
        'string.empty': 'Поле "name" должно быть заполнено',
        'string.min': 'Минимальная длина поля "name" - 2',
        'string.max': 'Максимальная длина поля "name" - 30',
      }),
    link: Joi.string().required()
      .pattern(/^(https|http):\/\/(www\.)?[A-Za-z0-9-]*\.[A-Za-z0-9]{2}[A-Za-z0-9-._~:\\/?#[\]@!$&'()*+,;=]*#?$/)
      .messages({
        'any.required': 'Поле "link" должно быть заполнено',
        'string.pattern.base': 'Поле "link" должно быть ссылкой.',
      }),
  }, { abortEarly: false }),
}), createCard);

router.put('/:cardId/likes', celebrate({
  body: Joi.object().keys({
    cardId: Joi.string().pattern(/^[a-f\d]{24}$/i).messages({
      'string.pattern.base': 'Не соответствует _id. Количество символов должно равняться - 24, содержать строчные латинские буквы и цифры.',
    }),
  }, { abortEarly: false }).unknown(true),
}), likeCard);

router.delete('/:cardId/likes', celebrate({
  body: Joi.object().keys({
    cardId: Joi.string().pattern(/^[a-f\d]{24}$/i).messages({
      'string.pattern.base': 'Не соответствует _id. Количество символов должно равняться - 24, содержать строчные латинские буквы и цифры.',
    }),
  }, { abortEarly: false }).unknown(true),
}), dislikeCard);

module.exports = router;
