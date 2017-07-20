var path = require('path');
var webpack = require('webpack');

var config = {
  devtool: false,
  entry: [
    './src/index'
  ],
  externals: ['firebase'],
  resolve: {
    root: [ __dirname ],
    modulesDirectories: [ 'node_modules', 'bower_components' ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'FirebaseSubscriber',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        include: __dirname
      }
    ]
  },
  devServer: {
    contentBase: './example',
    hot: true
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
};

module.exports = config;

