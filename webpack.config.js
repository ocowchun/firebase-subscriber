var path = require('path');
var webpack = require('webpack');

var config = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    './src/index'
  ],
  resolve: {
    root: [ __dirname ],
    modulesDirectories: [ 'node_modules', 'bower_components' ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'sideBlock',
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
  }
};

module.exports = config;
