/*
  Файл настройки сборщика webpack
*/

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
/*
  webpack воспринимает каждый файл как модуль.
  Действия над файлами осуществляют лоадеры
  Сборка начинается с входной точки (.js файла) и всего, что импортировано в этот файл
*/

// Это JavaScript правило, которое говорит что делать с .js файлами
const javascript = {
  test: /\.(js)$/, // ищем все файлы оканчивающиеся на `.js`
  use: [{
    loader: 'babel-loader',
    options: { presets: ['env'] } // передаем параметры (один из способов)
  }],
};

/*
  Это лоадер postCSS, который будет использован в следующем лоадере. Отдельной переменной, потому что длинный
*/

const postcss = {
  loader: 'postcss-loader',
  options: {
    plugins() { return [autoprefixer({ browsers: 'last 3 versions' })]; }
  }
};

// лоадер для sass/css. Обрабатывает файлы, в которые импортировано ('что-то.scss')
const styles = {
  test: /\.(scss)$/,
  // передаем опции как параметры запроса, так короче
  // здесь уже не просто передаем массив лоадеров, а пропускаем их через плагин extract, чтобы получить css файл для каждого
  use: ExtractTextPlugin.extract(['css-loader?sourceMap', postcss, 'sass-loader?sourceMap'])
};

// Используем плагин который выкидывает лишнее из js-файлов
const uglify = new webpack.optimize.UglifyJsPlugin({ // eslint-disable-line
  compress: { warnings: false }
});

// Теперь собираем вместе
const config = {
  entry: {
    App: './public/javascripts/marketplace-app.js'
  },
  // используем sourcemaps, который помогут в отладке кода. Здесь указываем какой тип sourcemap использовать 
  devtool: 'source-map',
  // Направляем в файл
  output: {
    // path это встроенный node модуль
    // __dirname это переменная из node, показывает путь директории текущего модуля
    path: path.resolve(__dirname, 'public', 'dist'),
    // можно использовать подстановки вида [name] и [hash]
    // имя будет `App`, т.к. мы его использовали выше, где точка входа
    filename: '[name].bundle.js'
  },

  // Разные лоадеры отвечают за разные типы файлов, здесь мы передаем правила для js и стилей
  module: {
    rules: [javascript, styles]
  },
  // теперь передаем массив плагинов
  plugins: [
    // указываем, что необходимо выводить наш css в отдельный файл
    new ExtractTextPlugin('style.css'),
  ]
};
// Подавляем ошибки от устаревших пакетов
process.noDeprecation = true;

module.exports = config;
