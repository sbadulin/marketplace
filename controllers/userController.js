const mongoose = require('mongoose');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Вход' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Регистрация' });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'Пожалуйста введите имя').notEmpty();
  req.checkBody('email', 'Неправильный адрес email').notEmpty();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Пароль не может быть пустым!').notEmpty();
  req
    .checkBody('password-confirm', 'Повтор пароля не может быть пустым!')
    .notEmpty();
  req
    .checkBody('password-confirm', 'Пароли не совпадают!')
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {
      title: 'Регистрация',
      body: req.body,
      flashes: req.flash()
    });
    return; // если ошибки
  }
  next(); // если всё ок
};
