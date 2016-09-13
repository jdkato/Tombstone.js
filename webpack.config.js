var webpack = require('webpack')
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
var path = require('path')
var env = require('yargs').argv.mode

var libraryName = 'tombstone'
var plugins = []
var outputFile

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }))
  outputFile = libraryName + '.min.js'
} else {
  outputFile = libraryName + '.js'
}

var config = {
  entry: [path.join(__dirname, '/src/main.js')],
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/lib'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /(node_modules|bower_components)/
      }
    ]
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js']
  },
  plugins: plugins
}

module.exports = config
