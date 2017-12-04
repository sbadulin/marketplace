/*
  Хэндлеры ошибок

  Вместо использования try{} catch(e) {} в каждом контроллере, обернем функцию в catchErrors(), 
  отловим все возникающие ошибки и передадим их по цепочке промежуточного ПО с помощью next
*/

exports.catchErrors = (fn) => {
  return function(req, res, next) {
    return fn(req, res, next).catch(next);
  };
};

/*
  Not Found Error Handler

  Если перейдем на несуществующий адрес, пометим его как 404 и передадим дальше для отображения ошибки
*/
exports.notFound = (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};

/*
  MongoDB Validation Error Handler

  Detect if there are mongodb validation errors that we can nicely show via flash messages
  Если есть ошибки от валидатора mongodb - отобразим их в виде сообщений
*/

exports.flashValidationErrors = (err, req, res, next) => {
  if (!err.errors) return next(err);
  const errorKeys = Object.keys(err.errors);
  errorKeys.forEach(key => req.flash('error', err.errors[key].message));
  res.redirect('back');
};


/*
  Development Error Handler

  При разработке показем подробные сообщения об ошибках
*/
exports.developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
  };
  res.status(err.status || 500);
  res.format({
    // основано на http заголовке `Accept`
    'text/html': () => {
      res.render('error', errorDetails);
    }, // Отправка формы, перезагрузка страницы
    'application/json': () => res.json(errorDetails) // Ajax запрос, получаем JSON 
  });
};


/*
  Production Error Handler

  В режиме продакшена скрываем все ошибки
*/
exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
};
