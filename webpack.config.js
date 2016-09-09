var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
  styles: path.join(__dirname, 'app/styles'),
  scripts: path.join(__dirname, 'app/scripts'),
  json: path.join(__dirname, 'app/json'),
}

module.exports = {
  entry: [
    path.resolve(PATHS.scripts, 'main.js'),
  ],
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: "style!css!sass"
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
    ]
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Energy Sight"
    })
  ]
};
