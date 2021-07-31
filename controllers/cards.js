const Card = require('../models/card');
const {
  validationError, serverError, notFound, castError,
} = require('../utils/constants');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(serverError).send({ message: 'Произошла ошибка при загрузке карточек' }));
};

module.exports.createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(validationError).send({ message: 'Переданы некорректные данные для создания карточки' });
      } else {
        res.status(serverError).send({ message: 'На сервере произошла ошибка при создании карточки' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndDelete(cardId)
    .orFail(new Error('NotValidId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(castError).send({ message: 'Переданы некорректные данные' });
      } else if (err.message === 'NotValidId') {
        res.status(notFound).send({ message: 'Карточка не найдена' });
      } else {
        res.status(serverError).send({ message: 'На сервере произошла ошибка при удалении карточки' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail(new Error('NotValidId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(castError).send({ message: 'Переданы некорректные данные' });
      } else if (err.message === 'NotValidId') {
        res.status(notFound).send({ message: 'Карточка не найдена' });
      } else {
        res.status(serverError).send({ message: 'На сервере произошла ошибка при лайке карточки' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail(new Error('NotValidId'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(castError).send({ message: 'Переданы некорректные данные' });
      } else if (err.message === 'NotValidId') {
        res.status(notFound).send({ message: 'Карточка не найдена' });
      } else {
        res.status(serverError).send({ message: 'На сервере произошла ошибка при лайке карточки' });
      }
    });
};
