const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Heyy! It works!');
}); 

module.exports = router;
