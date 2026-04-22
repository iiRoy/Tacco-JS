/*
 * This is a Webpack configuration file.
 * It defines how our project's assets are processed and bundled.
 * Version: 1.0.0
 * Date: 2023-10-27
 */

// Import the 'path' module for resolving file paths.
var    path     = require  ( 'path' ) ;

// Import the 'webpack' module itself.
var    webpack  = require  ( 'webpack' ) ;


// Export the configuration object for Webpack.
module.exports = {

    // Enable caching for faster rebuilds in development.
    cache : true ,

    // Define the entry points for our application.
    entry : {
        // The main application entry point.
        app : "./example/app.jsx"
    } ,

    // Configure the output settings for the bundled files.
    output : {
        // The output directory for the bundled files.
        path : path.join ( __dirname ) ,

        // The public URL of the output directory when referenced in a browser.
        publicPath : '/' ,

        // The name of the output bundle file.
        filename : '[name].js' ,

        // The filename template for non-initial chunks.
        chunkFilename : '[chunkhash].js'
    } ,

    // Define rules for handling different types of modules.
    module : {
        // Array of loaders (rules) for transforming modules.
        loaders : [
            {
                // Rule for JavaScript files.
                test : /\.js$/ ,

                // Use 'jsx-loader' with 'harmony' preset for ES6 features.
                loader : 'jsx-loader?harmony'
            } ,
            {
                // Rule for JSX files.
                test : /\.jsx$/ ,

                // Use 'jsx-loader' with React.DOM pragma and harmony preset.
                loader : 'jsx-loader?insertPragma=React.DOM&harmony'
            }
        ]
    } ,

    // Define plugins to extend Webpack's capabilities.
    plugins : [
        // Optimize: Deduplicate modules in the bundle.
        new webpack.optimize.DedupePlugin ( ) ,

        // Optimize: Minify JavaScript code for production.
        new webpack.optimize.UglifyJsPlugin ( ) ,

        // Define global constants that can be configured at compile time.
        new webpack.DefinePlugin ( {
            // Environment variables for the build.
            "process.env" : {
                /*
                 * Signal to various JavaScript libraries (like React)
                 * that the code is running in a production environment.
                 * This often enables performance optimizations and disables
                 * development-specific checks.
                 */
                NODE_ENV : JSON.stringify ( "production" )
            }
        } )
    ]

}