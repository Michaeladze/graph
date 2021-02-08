const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const dotenv = require('dotenv');

// const argv = process.argv.find(arg => ~arg.indexOf('--env.ENVIRONMENT')).split('=');
// const env = argv[1] || 'development';
//
// // Create the fallback path (the production .env)
// const basePath = `${path.join(__dirname)}/.env.${env}`;
//
// // Set the path parameter in the dotenv config
// const fileEnv = dotenv.config({ path: basePath }).parsed;
//
// // reduce it to a nice object, the same as before (but with the variables from the file)
// const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
//   prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
//   return prev;
// }, {});
//
// console.log(envKeys)

module.exports = {
  entry: ['src/singleSpaEntry.tsx'],
  output: {
    library: 'portfolio-graph',
    libraryTarget: 'umd',
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: [__dirname, 'node_modules']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.tsx$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.js?$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: ['babel-loader', 'eslint-loader']
      },

      {
        test: /\.html$/i,
        loader: 'html-loader'
      },
      {
        test: /\.css|\.scss$/,
        use: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'assets/img/[name].[ext]'
          }
        }]
      },
      {
        test: /\.(svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'assets/svg/[name].[ext]'
          }
        }]
      },
      {
        test: /\.(mp3)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'assets/mp3/[name].[ext]'
          }
        }]

      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
        options: {
          name: 'assets/fonts/[name].[ext]'
        }
      },
      {
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        options: {
          name: 'assets/fonts/[name].[ext]'
        }
      }
    ]
  },
  node: {
    fs: 'empty'
  },
  stats: {
    errorDetails: true, //this does show errors
    // colors: false,
    modules: true,
    reasons: true
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: ['dist']
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new webpack.PrefetchPlugin('react'),
    new webpack.EnvironmentPlugin(['NODE_ENV'])
  ],
  devtool: 'source-map',
  externals: [],
  devServer: {
    historyApiFallback: true,
    writeToDisk: true
  }
};
