const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
// Изменение размера изображений
const jimp = require('jimp');
// Уникальные имена для изображений
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: 'Такой тип файла не поддерживается' }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Добавить компанию' });
};

// Загрузка фото в карточку компании
exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // Проверям если файл для ресайза
  if (!req.file) {
    next(); // переходим к следующему middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // сохранили изображение на диск
  next();
};

exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save();
  req.flash(
    'success',
    `Карточка компании <strong>${store.name}</strong> успешно создана!`
  );
  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', { title: 'Компании', stores });
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  if (!store) {
    return next();
  }
  res.render('store', { store, title: store.name });
};

exports.editStore = async (req, res) => {
  // Находим компанию по id - он находится в params
  const store = await Store.findOne({ _id: req.params.id });
  // Убедиться, что пользователь это хозяин компании
  // Рисуем форму редактирования
  res.render('editStore', { title: `Компания ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // Устанавливаем местоположение в точку
  console.log(req.body);
  req.body.location.type = 'Point';
  // Находим и обновляем магазин
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    // Вернет обновленные данные
    new: true,
    runValidators: true
  }).exec();
  req.flash(
    'success',
    `Карточка компании <strong>${
      store.name
    }</strong> успешно изменена. <a href="/stores/${
      store.slug
    }">Открыть карточку</a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};
