const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
// Валидация email
const validator = require('validator');
// Понятные ошибки от MongoDB
const mongodbErrorHandler = require('mongoose-mongodb-errors');
// авторизация
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Неверный адрес email!'],
    reuired: 'Пожалуйста, введите адрес email'
  },
  name: {
    type: String,
    required: 'Пожалуйста введите имя',
    trim: true
  }
});

// используем email для логина
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
