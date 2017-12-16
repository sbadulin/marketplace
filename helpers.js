/*
  Здесь находятся функции-хелперы, которые мы используем в шаблонах
*/

// встроенный в node модуль, который позволяет читать файлы из системы на которой запущен
const fs = require('fs');

// moment.js это библиотека для отображения дат. Нужна в шаблонах для показа вещей типа "Опубликовано 5 минут назад"
exports.moment = require('moment');

// Dump используем для отладки, наподобие console.log
exports.dump = obj => JSON.stringify(obj, null, 2);

// Этот хелпер упрощает создание карты через Google Static Maps API
exports.staticMap = ([lng, lat]) =>
  `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=800x150&key=${
    process.env.MAP_KEY
  }&markers=${lat},${lng}&scale=2`;

exports.staticMapYandex = ([lng, lat]) =>
  `https://static-maps.yandex.ru/1.x/?l=map&ll=${lng},${lat}&size=650,150&z=14&pt=${lng},${lat},pm2rdl`;

// вставка svg-файлов
exports.icon = name => fs.readFileSync(`./public/images/icons/${name}.svg`);

// Подробности о сайте
exports.siteName = `Клиентикс.Компании`;

exports.menu = [
  { slug: '/stores', title: 'Компании', icon: 'store' },
  { slug: '/tags', title: 'Теги', icon: 'tag' },
  { slug: '/top', title: 'Лучшие', icon: 'top' },
  { slug: '/add', title: 'Добавить', icon: 'add' },
  { slug: '/map', title: 'Карта', icon: 'map' }
];
