const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");

// деструктуризация объекта errorHandlers, берем из него только метод catchErrors
const { catchErrors } = require("../handlers/errorHandlers");

router.get("/", storeController.homePage);
router.get("/add", storeController.addStore);
// оборачиваем асинхроннное сохранение компании в обработчик ошибок
router.post("/add", catchErrors(storeController.createStore));

module.exports = router;
