const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
// валидация запросов
const expressValidator = require('express-validator');
const routes = require('./routes/index');
const helpers = require('./helpers');
const errorHandlers = require('./handlers/errorHandlers');
require('./handlers/passport');

// создаем приложение Express
const app = express();

// настройка шаблонизатора
app.set('views', path.join(__dirname, 'views')); // папка для хранения вью-файлов
app.set('view engine', 'pug'); // используем шаблонизатор pug

// статику помещаем в папку public
app.use(express.static(path.join(__dirname, 'public')));

// парсим запросы для req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// валидаторы, активно используются в userController.validateRegister
app.use(expressValidator());

// складываем куки из запроса в req.cookies
app.use(cookieParser());

// храним сесии пользователей, чтобы сохранять их залогиненными и показывать уведомления
app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

// Используем Passport JS для работы с авторизацией
app.use(passport.initialize());
app.use(passport.session());

// промежуточное ПО для работы с уведомлениями, позволяющее передавать сообщение на следущую запрошенную страницу
app.use(flash());

// передает переменные в шаблоны
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// добавляет поддержку промисов для API с коллбэками
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

// настройки маршрутов
app.use('/', routes);

// если ни один из маршрутов не подошел, то направляем пользователя на страницу 404 ошибки
app.use(errorHandlers.notFound);

// отлавливаем ошибки валидации
app.use(errorHandlers.flashValidationErrors);

// если это другая необработанная ошибка
if (app.get('env') === 'development') {
  // в окружении разработки - выводим ошибку
  app.use(errorHandlers.developmentErrors);
}

// обрабатываем ошибку в продакшен окружении
app.use(errorHandlers.productionErrors);

// экспортируем модуль и переходим в start.js
module.exports = app;
