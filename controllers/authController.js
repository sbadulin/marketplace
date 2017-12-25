const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Вход не удался',
  successRedirect: '/',
  successFlash: 'Вы вошли в систему'
});
