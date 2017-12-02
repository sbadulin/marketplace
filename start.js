const mongoose = require('mongoose');

// убедимся что используем node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 7 || (major === 7 && minor <= 5)) {
  console.log('Ваша версия node.js не поддерживает Async + Await! Перейдите на nodejs.org для загрузки версии 7.6 или старше');
  process.exit();
}

// импортируем переменные окружения из файла variables.env
require('dotenv').config({ path: 'variables.env' });

// соединяемся с БД и обрабатываем ошибки
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // заставляем mongoose использовать промисы
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});


// запускаем приложение
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});