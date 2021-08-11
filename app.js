const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');


const {
  celebrate, Joi, isCelebrateError,
} = require('celebrate');
const userRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const BadRequestError = require('./errors/bad-request-err');
const NotFoundError = require('./errors/not-found-err');

const { PORT = 3000 } = process.env;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});


const app = express();
app.use(limiter);
app.use(cookieParser());
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }).messages({
      'string.pattern.base': 'В поле "email" нужно ввести электронную почту',
      'string.empty': 'Поле "email" должно быть заполнено',
    }),
    password: Joi.string().required().messages({
      'string.min': 'Минимальная длина поля "password" - 8',
      'string.empty': 'Поле "password" должно быть заполнено',
    }),
  }, { abortEarly: false }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email({ tlds: { allow: false } }).messages({
      'string.pattern.base': 'В поле "email" нужно ввести электронную почту',
      'string.empty': 'Поле "email" должно быть заполнено',
    }),
    password: Joi.string().required().min(8).messages({
      'string.min': 'Минимальная длина поля "password" - 8',
      'string.empty': 'Поле "password" должно быть заполнено',
    }),
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
    avatar: Joi.string().pattern(/^(https|http):\/\/(www\.)?[A-Za-z0-9-]*\.[A-Za-z0-9]{2}[A-Za-z0-9-._~:\\/?#[\]@!$&'()*+,;=]*#?$/)
      .messages({
        'string.pattern.base': 'Поле "avatar" должно быть ссылкой.',
      }),
  }, { abortEarly: false }),
}), createUser);

app.use(auth);
app.use('/users', userRouter);
app.use('/cards', cardsRouter);

app.use(errorLogger);

app.use((req, res, next) => {
  next(new NotFoundError('Ресурс не найден.'));
});
app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    throw new BadRequestError(err.details.get('body').message);
  }
  next(err);
});
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка.'
      : message,
  });
  next();
});

app.listen(PORT, () => {

});
