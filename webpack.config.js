const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const isDev = process.env.NODE_ENV !== 'production'
module.exports = {
  entry: isDev ? './example/index.tsx' : './src/index.ts',
  cache: {
    type: 'filesystem',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    clean: true,
    chunkFilename: 'chunk.[id].[name].js',
    publicPath: 'auto',
    // 库打包补充配置（umd 标准输出，适配 npm 引入）
    library: {
      name: 'ReactflowDag',
      type: 'umd',
    },
    globalObject: 'this'
  },
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'cheap-module-source-map' : false,
  devServer: {
    compress: false,
    hot: true,
    historyApiFallback: {
      disableDotRule: true,
    },
    static: {
      directory: path.join(__dirname, './public'),
      publicPath: '/public',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Method': '*',
      'Access-Control-Allow-Headers': '*',
    },
    client: {
      overlay: false,
    },
    allowedHosts: 'all',
    host: '0.0.0.0',
    port: 3303,
  },
  resolve: {
    extensions: ['.js', '.tsx', '.ts'],
    alias: {
      '@src': path.resolve(__dirname, 'src')
    }
  },
  optimization: {
    minimize: !isDev,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: false,
          },
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    corejs: { version: 3, proposals: true },
                    targets: {
                      edge: '16',
                      ie: '9',
                      chrome: '49',
                    },
                  },
                ],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
              plugins: [
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
                ['@babel/plugin-proposal-private-methods', { loose: true }],
              ].filter(Boolean),
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          // 生产打包库时改用 mini-css-extract-plugin 抽离独立 css 文件
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                auto: /\.module\.css$/,
                localIdentName: '[local]-[hash:5]',
                exportLocalsConvention: 'camelCase',
              },
            },
          },
          'postcss-loader',
        ].filter(Boolean),
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
        generator: {
          filename: 'static/images/[name][ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
        generator: {
          filename: 'static/fonts/[name][ext]',
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
        generator: {
          filename: 'static/media/[name][ext]',
        },
      },
    ],
  },
  // ========== 新增关键 externals 配置 ==========
  externals: isDev
    ? {}
    : {
        react: {
          commonjs: 'react',
          commonjs2: 'react',
          amd: 'react',
          root: 'React',
        },
        'react-dom': {
          commonjs: 'react-dom',
          commonjs2: 'react-dom',
          amd: 'react-dom',
          root: 'ReactDOM',
        },
        antd: 'antd',
        ahooks: 'ahooks',
        '@ant-design/icons': '@ant-design/icons',
        'react-router-dom': 'react-router-dom',
      },
  plugins: [
    // 生产打包抽离独立 css（对应上面 MiniCssExtractPlugin.loader）
    ...(isDev ? [ new HtmlWebpackPlugin({
          template: './example/index.html',
        })] : [new MiniCssExtractPlugin({ filename: 'style.css' })]),
  ].filter(Boolean),
}