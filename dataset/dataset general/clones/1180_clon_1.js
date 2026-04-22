/*
 * This is a Webpack configuration file for the 'anno' project.
 * It defines how various modules are processed and bundled.
 *
 * This configuration ensures that Literate CoffeeScript files (.litcoffee)
 * are correctly handled and that jQuery is treated as an external dependency.
 */

// Import the core Webpack module.
var webpack = require('webpack') ;

// Export the main Webpack configuration object.
module.exports =
{
    // The primary entry point for our application.
    // This is where Webpack will start bundling.
    entry: './src/anno.litcoffee' ,

    // Defines how the output bundle should be generated.
    output:
    {
        // The filename for the bundled output.
        // It will be placed in the 'dist' directory.
        filename: './dist/anno.js' ,

        // Specifies the library target. 'umd' makes the bundle
        // compatible with CommonJS, AMD, and global script environments.
        libraryTarget: 'umd'
    } ,

    // Defines external dependencies that should not be bundled by Webpack.
    // Instead, they are expected to be available in the environment.
    externals:
    {
        // Maps the 'jquery' module import to the global 'jQuery' variable.
        'jquery' : 'jQuery'
    } ,

    // Configuration for resolving modules.
    resolve:
    {
        // Directories where Webpack should look for modules.
        // This includes standard Node.js modules and Bower components.
        modulesDirectories:
        [
            "./node_modules" ,      // Standard Node.js package directory.
            "./bower_components"    // Directory for Bower-managed components.
        ]
    } ,

    // Rules for how different types of modules are treated.
    // Each rule specifies a test (regex) and a list of loaders.
    module:
    {
        loaders:
        [
            // Rule for processing Literate CoffeeScript files.
            // Files ending with '.litcoffee' will be processed by 'coffee-loader'.
            {
                test: /\.litcoffee$/ ,                                  // Regular expression to match .litcoffee files.
                loaders: [ 'coffee-loader?literate' ]                   // Use 'coffee-loader' with the 'literate' option enabled.
            }
        ]
    }
} ; // End of the module.exports configuration.