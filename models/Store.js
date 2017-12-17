const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // используем промисы es6
const slug = require('slug'); // понятные адреса

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Введите название компании!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [
      {
        type: Number,
        required: 'Введите координаты компании!'
      }
    ],
    address: {
      type: String,
      required: 'Введите адрес!'
    }
  },
  photo: String
});

storeSchema.pre('save', async function(next) {
  // Если запись не менялась, то пропускаем
  if (!this.isModified('name')) {
    next();
    return;
  }
  // Сохраняем алиас страницы
  this.slug = slug(this.name, { lower: true });
  // обеспечиваем уникальность алиаса
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)`, 'i');
  // обращаемся к текущей модели
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});

// Добавляем метод-агрегацию для поиска тегов
storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Store', storeSchema);
