const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const userRouter = require('./routes/users.js');
const cardsRouter = require('./routes/cards.js');



const { PORT = 3000, BASE_PATH } = process.env;

const app = express();

app.use((req, res, next) => {
    req.user = {
        _id: '6103e7ec5fde2c4884a8a0d3'
    };

    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});

app.use('/users', userRouter);
app.use('/cards', cardsRouter);

app.listen(PORT, () => {

})

app.use('*', (req,res) => {
    res.status(404).send({ message: 'Запрашиваемый ресурс не найден' })
})