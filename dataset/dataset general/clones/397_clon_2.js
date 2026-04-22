// Establish a file system utility for directory operations
var fileLocator = require('path');

// Include the primary module bundling framework
var packager = require('webpack');

// Export the comprehensive build configuration
module.exports = {

  // Enable asset caching to speed up subsequent builds
  useCache: true,

  // Specify the primary input files for the application
  inputFiles: {
    // The main entry point for the client-side application
    mainApplication: "./source/mainApp.jsx"
  },

  // Configuration for the bundled output files
  buildOutput: {
    // The absolute path where compiled assets will be placed
    destinationDirectory: fileLocator.join(__dirname),

    // The public URL base path for all generated assets
    assetBaseUri: '/',

    // Pattern for naming the main output bundles
    bundleNameTemplate: '[name].js',

    // Pattern for naming dynamically loaded code chunks
    asyncModuleNameTemplate: '[chunkhash].js'
  },

  // Define rules for processing different types of modules
  processingInstructions: {
    // An array of handlers for various file extensions
    resourceHandlers: [
      {
        // Rule to match standard JavaScript files
        regexMatcher: /\.js$/,
        // The processor to apply for these files, enabling harmony features
        processorModule: 'jsx-loader?harmony'
      },
      {
        // Rule to match JSX (React) files
        regexMatcher: /\.jsx$/,
        // The processor with React.DOM pragma and harmony support
        processorModule: 'jsx-loader?insertPragma=React.DOM&harmony'
      }
    ]
  },

  // A collection of plugins to enhance the bundling process
  augmentationModules: [
    // Plugin to eliminate duplicate modules from the output bundle
    new packager.optimize.DedupePlugin(),

    // Plugin to minify and optimize JavaScript code for deployment
    new packager.optimize.UglifyJsPlugin(),

    // Plugin to define global variables for the application at compile time
    new packager.DefinePlugin({
      "runtime.environment": { // Set environment variables for client-side code
        // Signal the current operational environment, e.g., 'production' or 'development'
        EXECUTION_MODE: JSON.stringify("production")
      }
    })
  ]
};