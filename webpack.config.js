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
        test: /\.css$/,
        loader: "style!css",
        include: path.join(PATHS.styles, "genericons")
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.csv$/,
        loader: 'dsv-loader'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      },
      {
        test: /\.(png|eot|svg|ttf|woff|gif)$/,
        loader: "url-loader",
        exclude: "node_modules"
      }
    ]
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Music Thermometer"
    })
  ]
};
