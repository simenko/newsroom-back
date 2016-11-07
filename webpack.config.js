const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
  context: path.resolve('./src'),
  devtool: 'cheap-module-source-map',
  entry: {
    app: ['./index.js']
  },
  output: {
    path: './public',
    filename: 'bundle-[hash:4].js'
  },
  module: {
     loaders: [{
        test: /\.js$/,
        loader: 'ng-annotate!babel?presets[]=es2015&presets[]=stage-0',
        exclude: /node_modules/
      },
      // { test: /\.pug$/, loader: 'pug-html' },
      {
        test: /\.html$/,
        loader: 'html?conservativeCollapse'
      }, {
        test: /\.less/,
        loader: ExtractTextPlugin.extract({
          loader: 'css!less?sourceMap'
        })
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          loader: 'css'
        })
      }, {
        test: /\.(png|jpe?g|.gif)$/,
        loader: 'file?name=[path][name].[ext]'
      }, {
        test: /\.(woff2?|ttf|eot|svg)(.*)?$/,
        loader: 'file?name=fonts/[name].[ext]'
      }
    ]
  },
  plugins: [
    new CleanPlugin(['public']),
    new ExtractTextPlugin('[name]-[hash].css'),
    // new webpack.optimize.DedupePlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body'
    }),
    new webpack.DefinePlugin({
      // put an actual server's IP address here
      SERVER: JSON.stringify('http://192.168.0.107:3001/api'),
      SOCKET: JSON.stringify('http://192.168.0.107:3001/')
    }),

  ]
};
