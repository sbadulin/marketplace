const mongoose = require("mongoose");
mongoose.Promise = global.Promise; // используем промисы es6
const slug = require("slug"); // понятные адреса

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Введите название компании!"
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String]
});

storeSchema.pre("save", function(next) {
  // Если запись не менялась, то пропускаем
  if (!this.isModified("name")) {
    next();
    return;
  }
  // Сохраняем алиас страницы
  this.slug = slug(this.name, { lower: true });
  next();
});

module.exports = mongoose.model("Store", storeSchema);
