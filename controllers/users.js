const User = require('../models/user');
const {
  validationError, serverError, castError, notFound,
} = require('../utils/constants');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(serverError).send({ message: 'На сервере произошла ошибка при загрузке пользователей' }));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(validationError).send({ message: 'Переданы некорректные данные для создания пользователя' });
      } else {
        res.status(serverError).send({ message: 'На сервере произошла ошибка при создании пользователя' });
      }
    });
};

module.exports.getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(new Error('NotValidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(castError).send({ message: 'Переданы некорректные данные' });
      } else if (err.message === 'NotValidId') {
        res.status(notFound).send({ message: 'Пользователя нет в базе' });
      } else {
        res.status(serverError).send({ message: 'На сервере произошла ошибка при поиске пользователя' });
      }
    });
};

module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body;
  if (req.body.name && req.body.about) {
    User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
      .orFail(new Error('NotValidId'))
      .then((user) => res.send({ data: user }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          res.status(validationError).send({ message: 'Переданы некорректные данные для обновления профиля' });
        }
        if (err.name === 'CastError') {
          res.status(castError).send({ message: 'Пользователь не найден' });
        } else if (err.message === 'NotValidId') {
          res.status(notFound).send({ message: 'Пользователя нет в базе' });
        } else {
          res.status(serverError).send({ message: 'На сервере произошла ошибка при обновлении профиля' });
        }
      });
  } else {
    res.status(validationError).send({ message: 'Переданы некорректные данные для обновления профиля' });
  }
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  if (req.body.avatar) {
    User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
      .orFail(new Error('NotValidId'))
      .then((user) => res.send({ data: user }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          res.status(validationError).send({ message: 'Переданы некорректные данные для обновления аватара пользователя' });
        }
        if (err.name === 'CastError') {
          res.status(castError).send({ message: 'Пользователь не найден' });
        } else if (err.message === 'NotValidId') {
          res.status(notFound).send({ message: 'Пользователя нет в базе' });
        } else {
          res.status(serverError).send({ message: 'На сервере произошла ошибка при обновлении аватара пользователя' });
        }
      });
  } else {
    res.status(validationError).send({ message: 'Переданы некорректные данные для обновления аватара пользователя' });
  }
};
