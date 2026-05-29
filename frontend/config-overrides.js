const webpack = require('webpack');

module.exports = {
  webpack: function (config, env) {
    config.resolve = {
      ...config.resolve,
      fallback: {
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        http2: false,
        util: require.resolve('util/'),
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url/'),
        crypto: require.resolve('crypto-browserify'),
        assert: require.resolve('assert/'),
        net: false,
        tls: false,
        buffer: require.resolve('buffer/'),
      },
    };
    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser.js',
      }),
    ];
    return config;
  },
};
