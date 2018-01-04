const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // используем промисы es6
const slug = require('slug'); // понятные адреса

const storeSchema = new mongoose.Schema(
  {
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
    photo: String,
    // связь компании и пользователя
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: 'Укажите создателя карточки компании'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtual: true }
  }
);

// создаем индекс для поиска по текстовым полям
storeSchema.index({
  name: 'text',
  description: 'text'
});
// создаем индекс для координат
storeSchema.index({
  location: '2dsphere'
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

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // Ищем компании и добавляем к ним обзоры
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews'
      }
    },
    // Оставляем только с компании с одним и более отзывами
    {
      $match: {
        'reviews.0': { $exists: true }
      }
    },
    // Добавляем поле со средней оценкой
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' }
      }
    },
    // Сортируем по средней оценке
    {
      $sort: {
        averageRating: -1
      }
    },
    // Показываем 10 первых
    { $limit: 10 }
  ]);
};

// Находим отзывы, в которых свойство _id компании равно свойству store отзыва
storeSchema.virtual('reviews', {
  ref: 'Review', // с каокй моделью связываем
  localField: '_id', // какое поле у компании
  foreignField: 'store' // какое поле у отзыва
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);
