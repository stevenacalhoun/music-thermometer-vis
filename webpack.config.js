var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRootPlugin = require('html-webpack-react-root-plugin');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
  styles: path.join(__dirname, 'app/styles'),
  scripts: path.join(__dirname, 'app/scripts'),
}

module.exports = {
  entry: [
    path.resolve(PATHS.scripts, 'index.js'),
  ],
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: "style!css!sass"
      },
      {
        test: /\.css$/,
        loader: "style!css"
      },
      {
        test: /\.css$/,
        loader: "style!css",
        include: path.join(PATHS.styles, "genericons")
      },
      {
        test: /\.js?/,
        loader: "babel",
        include: PATHS.scripts,
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
    path: PATHS.build,
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Music Thermometer"
    }),
   new ReactRootPlugin()
  ]
};
