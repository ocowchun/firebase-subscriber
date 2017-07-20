var path = require('path');
var webpack = require('webpack');

var config = {
  devtool: false,
  entry: [
    './src/index'
  ],
  externals: ['firebase'],
  resolve: {
    modules: [ 'node_modules', 'bower_components' ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'FirebaseSubscriber',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: __dirname
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
};

module.exports = config;

