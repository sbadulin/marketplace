const express = require('express');
const router = express.Router();
const storeCOntroller = require('../controllers/storeController')

router.get('/', storeCOntroller.homepage); 

module.exports = router;
