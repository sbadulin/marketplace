const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Вход не удался',
  successRedirect: '/',
  successFlash: 'Вы вошли в систему'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Вы успешно вышли из системы');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // проверяем, вошел ли пользователь в систему
  if (req.isAuthenticated()) {
    next(); // продолжаем
    return;
  }
  req.flash('error', 'Сначала вы должны войти в систему');
  res.redirect('/login');
};
