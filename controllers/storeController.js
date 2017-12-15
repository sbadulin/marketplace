const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Добавить компанию' });
};

exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save();
  req.flash(
    'success',
    `Карточка компании <strong>${store.name}</strong> успешно создана!`
  );
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', { title: 'Компании', stores });
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
