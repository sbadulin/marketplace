const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
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
  req.body.author = req.user._id;
  const store = await new Store(req.body).save();
  req.flash(
    'success',
    `Карточка компании <strong>${store.name}</strong> успешно создана!`
  );
  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = page * limit - limit;
  const storesPromise = Store.find()
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });
  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);

  const pages = Math.ceil(count / limit);
  if (!stores.length && skip) {
    req.flash(
      'info',
      `Страницы, которую вы запросили, не существует. Открываем страницу ${pages}`
    );
    res.redirect(`/stores/page/${pages}`);
    return;
  }
  res.render('stores', { title: 'Компании', stores, page, pages, count });
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    'author reviews'
  );
  if (!store) {
    return next();
  }
  res.render('store', { store, title: store.name });
};

const confirmOwner = (store, user) => {
  // карточку могут редактировать автор или админ
  if (!store.author.equals(user._id) || user.level < 10) {
    throw Error(
      'Необходимо быть владельцем компании для редактирования карточки'
    );
  }
};

exports.editStore = async (req, res) => {
  // Находим компанию по id - он находится в params
  const store = await Store.findOne({ _id: req.params.id });
  // Убедиться, что пользователь это хозяин компании
  confirmOwner(store, req.user);
  // Отображаем форму редактирования
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

exports.getStoreByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tag', { tags, title: 'Метки', tag, stores });
};

exports.searchStores = async (req, res) => {
  const stores = await Store
    // Ищем компании
    .find(
      {
        $text: {
          $search: req.query.q
        }
      },
      {
        score: { $meta: 'textScore' }
      }
      // Сортируем их
    )
    .sort({
      score: { $meta: 'textScore' }
    })
    // Получаем 5 лучших результатов
    .limit(5);
  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 // на расстоянии 10 км
      }
    }
  };

  const stores = await Store.find(q)
    .select('name slug description location photo')
    .limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render('map', { title: 'Карта компаний' });
};

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User.findOneAndUpdate(
    req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new: true }
  );
  res.json(user);
};

exports.getHearts = async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  });
  res.render('stores', { title: 'Понравившиеся компании', stores });
};
exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();
  res.render('topStores', { stores, title: 'Рейтинг компаний' });
};
