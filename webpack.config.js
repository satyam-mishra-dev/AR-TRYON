const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.(wasm)|(bin)|(obj)$/i,
        include: [path.resolve(__dirname, 'node_modules/deepar/')],
        type: 'asset/resource',
      },
    ],
  },
  performance: {
    maxEntrypointSize: 1000000,
    maxAssetSize: 10000000,
  },
  devServer: {
    static: [
      { directory: path.join(__dirname, 'public') },
      {
        directory: path.join(__dirname, 'node_modules/deepar'),
        publicPath: '/deepar-resources',
      },
    ],
    compress: true,
    port: 9000,
    host: '0.0.0.0',
    allowedHosts: 'all',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.DEEPAR_LICENSE_KEY': JSON.stringify(process.env.DEEPAR_LICENSE_KEY || ''),
    }),
  ],
};
