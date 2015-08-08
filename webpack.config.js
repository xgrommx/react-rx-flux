var path = require('path');
var webpack = require('webpack');

module.exports = {
    cache: false,
    target: 'web',
    debug: true,
    watch: true,
    devtool: '#inline-source-map',
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        './src/index'
    ],

    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.js',
        publicPath: '/static/'
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],

    module: {
        loaders: [{
            test: function (filename) {
                if (filename.indexOf('node_modules') !== -1) {
                    return false;
                } else {
                    return /\.js$/.test(filename) !== -1;
                }
            },
            loaders: ['react-hot', 'babel']
        }]
    }
};