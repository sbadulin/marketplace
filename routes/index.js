const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// деструктуризация объекта errorHandlers, берем из него только метод catchErrors
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', catchErrors(storeController.getStores));
router.get('/stores', storeController.getStores);
router.get('/stores/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/add', storeController.addStore);
// оборачиваем асинхроннное сохранение компании в обработчик ошибок
router.post(
  '/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
router.post(
  '/add/:id',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);
// id возьмем из адресной строки
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

module.exports = router;
