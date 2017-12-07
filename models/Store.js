const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // используем промисы es6
const slug = require('slugs'); // понятные адреса

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
    tags: [String]
});

storeSchema.pre('save', function(next) {
    if (!this.isModified('name')){
        next();
        return;
    }
    this.slug = slug.apply(this.name);
    next();
});

module.exports = mongoose.model('Store', storeSchema);