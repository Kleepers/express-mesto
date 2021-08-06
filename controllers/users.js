const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BadRequestError = require('../errors/bad-request-err');
const UnauthorizedError = require('../errors/unauth-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');

const { JWT_SECRET = 'crimson group' } = process.env;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    })
      .then((user) => res.send({
          data: {
              email: user.email,
              about: user.about,
              name: user.name,
              avatar: user.avatar,
              _id: user._id
          }
      }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          throw new BadRequestError('Переданы некорректные данные для создания пользователя');
        }
        if (err.name === 'MongoError' && err.code === 11000) {
          throw new ConflictError('Адрес электронной почты уже используется.');
        }
      }))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.send({ user });
    })
    .catch((err) => {
      if (err.statusCode === 404 || err.statusCode === 403) {
        throw err;
      }
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные для получения информации о пользователе');
      }
    })
    .catch(next);
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  if (req.body.name && req.body.about) {
    User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
      .then((user) => {
        if (!user) {
          throw new NotFoundError('Пользователь не найден');
        }
        res.send({ user });
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          throw new BadRequestError('Переданы некорректные данные для обновления профиля');
        }
        if (err.name === 'CastError') {
          throw new BadRequestError('Переданы некорректные данные для обновления профиля');
        }
      })
      .catch(next);
  } else {
    throw new BadRequestError('Переданы некорректные данные для обновления профиля');
  }
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  if (req.body.avatar) {
    User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
      .then((user) => {
        if (!user) {
          throw new NotFoundError('Пользователь не найден');
        }
        res.send({ user });
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          throw new BadRequestError('Переданы некорректные данные для обновления аватара пользователя');
        }
        if (err.name === 'CastError') {
          throw new BadRequestError('Переданы некорректные данные для обновления аватара пользователя');
        }
      })
      .catch(next);
  } else {
    throw new BadRequestError('Переданы некорректные данные для обновления аватара пользователя');
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
          httpOnly: true,
        })
        .send({ message: 'Логин прошел успешно' });
    })
    .catch(() => { throw new UnauthorizedError('Неправильные почта или пароль'); })
    .catch(next);
};

module.exports.getAuthUser = (req, res, next) => {
  const authUserId = req.user._id;
  return User.findById(authUserId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.send({ user });
    })
    .catch((err) => {
      if (err.statusCode === 404 || err.statusCode === 403) {
        throw err;
      }
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные');
      }
    })
    .catch(next);
};
