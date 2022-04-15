const path = require('path'); // for more effective workflow with paths
const HTMLWebpackPlugin = require('html-webpack-plugin'); // compile src html to docs with auto adding script tags
const {CleanWebpackPlugin} = require('clean-webpack-plugin'); // clean docs directory from old files after each compilation
const CopyWebpackPlugin = require('copy-webpack-plugin'); // to copy static files from src to docs
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // this plugin extracts CSS into separate files
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // optimize and minify CSS
const TerserWebpackPlugin = require('terser-webpack-plugin'); // optimize and uglify(minify) JS

const isDev = process.env.NODE_ENV === 'development' // if node tackles keyword 'development' then it is set to 'true'
console.log('IS DEV:', isDev);

const isProd = !isDev // reverse logic

// export default optimization settings as usual
const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all' // NB! split jQuery library code into one vendor file instead of attaching it to every .js file that has jQuery library import
        }
    }
    // export minified optimization settings only when in production mode
    if (isProd) {
        config.minimizer = [
            new CssMinimizerPlugin(),
            new TerserWebpackPlugin()
        ]
    }
    return config;
}

// return js presets
const babelOptions = preset => {
    const options = {
        presets: [
            '@babel/preset-env', // ...is a smart preset that allows us to use the latest JavaScript without needing to micromanage which syntax transforms are needed by our target environment(s).
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties' // helps transform some JS classes
        ]
    }
    // if we have another preset, for example .ts then this goes in as an argument preset
    if (preset) {
        options.presets.push(preset)
    }
    return options
}

// return css loaders
const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader
        }, 'css-loader' // specific loaders (webpack reads from right to left, starting with css-loader)
    ] // MiniCssExtractPlugin lets us carry css to specific file (needs plugin to be added)
    // if we have another loader, for example .scss then this goes in as an argument extra
    if (extra) {
        loaders.push(extra)
    }
    return loaders
}

// return html pages
const htmlPages = newPage => {
    const page = {
        filename: `html/${newPage}`,
        template: `./html/${newPage}`, // custom html file location
        minify: {
            collapseWhitespace: isProd // minify HTML if we are in production mode
        }
    }
    return page
}

module.exports = {
    context: path.resolve(__dirname, 'src'), // webpack knows to look only into src folder
    mode: 'development',
    entry: { // entry files (where to start)
        main: ['core-js/stable', 'regenerator-runtime/runtime', './index.js']
        // main: ['@babel/polyfill', './index.js'] @babel/polyfill is deprecated
    },
    resolve: {
        extensions: ['.js', '.json', '.png', '.svg'], // if we don't specify extensions while importing files, we can set webpack to figure them out itself, by giving extension names here
        alias: {
            '@': path.resolve(__dirname, 'src'), // root alias
            '@JS': path.resolve(__dirname, 'src/js'), // JS path
            '@scss': path.resolve(__dirname, 'src/sass') // SCSS path
        }
        // one way to think about aliases is that they are like pre-written path holders that we can attach while importing a file into 'index.js'
    },
    // output file (where to store)
    output: {
        filename: 'js/[name].bundle.js', // bundled file (name refers to entry file names)
        // filename also contains pattern [contenthash] which can be used instead of bundle to generate hashed file names
        path: path.resolve(__dirname, '../docs') // path will point to docs folder
    },
    optimization: optimization(),
    // while dev server is running, all the docs content is saved in local memory, to ensure faster running
    devServer: {
        port: 8080,
        hot: isDev, // activate devServer only if isDev === true,
        static: {
            directory: path.resolve(__dirname, '../docs/html/') // where to look for content
        },
        devMiddleware: {
            writeToDisk: true
        }
    },
    devtool: isDev ? 'source-map' : false, // if we are in development mode add source-maps, otherwise "stay silent"
    plugins: [
        // adding HTMLWebpackPlugin
        new HTMLWebpackPlugin(htmlPages('index.html')),
        // adding CleanWebpackPlugin
        new CleanWebpackPlugin(),
        // adding MiniCssExtractPlugin
        new MiniCssExtractPlugin({
            filename: 'css/[name].css', // bundled css file (name refers to entry file names)
            // filename also contains pattern [contenthash] which can be used instead of bundle to generate hashed file names
        })
    ],
    // loaders are used to give webpack extra functionality to work with files other than .js
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: 'html-loader', // used to load src and other attributes from html
                options: {
                    sources: true,
                    esModule: false
                },
            },
            {
                test: /\.css$/, // if webpack comes across .css extension, then use specific loaders
                use: cssLoaders()
            },
            {
                test: /\.(sass|scss)$/, // if webpack comes across .sass or .scss extension, then use specific loaders
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/images/[name][ext]',
                }
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/font/[name][ext]',
                }
            },
            {
                test: /\.xml$/,
                use: ['xml-loader']
            },
            {
                test: /\.csv$/,
                use: ['csv-loader']
                // if error drops saying: Cannot find module 'papaparse', then "npm i -D papaparse"
            },
            {
                test: /\.js$/, // JavaScript compiler
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: babelOptions()
                }
            }
        ]
    }
}