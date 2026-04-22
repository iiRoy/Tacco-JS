const path = require('path');
const moduleBundlerCore = require('webpack'); // Core module for bundling operations

// Define some configuration constants for better maintainability and clarity
const SOURCE_DIRECTORY = 'source';
const OUTPUT_DIRECTORY = 'dist';
const MAIN_ENTRY_FILE = 'main.lc'; // Changed extension from .litcoffee
const FINAL_BUNDLE_NAME = 'application-bundle.js'; // Renamed output filename
const LIBRARY_EXPORT_FORMAT = 'umd'; // Universal Module Definition remains

// Determine the build environment to set the mode
const CURRENT_BUILD_ENVIRONMENT = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// Log the current environment for debugging purposes (added fragment)
console.log(`Building for environment: ${CURRENT_BUILD_ENVIRONMENT}`);

// Validate the environment variable (added guard clause/validation)
if (!process.env.NODE_ENV) {
  console.warn('Warning: NODE_ENV is not set. Defaulting to development mode.');
}

// The main configuration object for the bundling process
const applicationBundleConfig = {
  // Define the build mode, either 'development' or 'production'
  mode: CURRENT_BUILD_ENVIRONMENT,

  // Entry point(s) for the application
  applicationEntrypoint: path.resolve(__dirname, SOURCE_DIRECTORY, MAIN_ENTRY_FILE),

  // Settings for the bundled output
  bundleOutputSettings: {
    path: path.resolve(__dirname, OUTPUT_DIRECTORY), // Absolute path for the output directory
    filename: FINAL_BUNDLE_NAME,
    libraryTarget: LIBRARY_EXPORT_FORMAT,
  },

  // Configuration for external dependencies that should not be bundled
  externalDependenciesMap: {
    'jquery': 'jQuery', // jQuery is provided externally
    'lodash': '_', // Added another external dependency
  },

  // Options for resolving module requests (e.g., how to find modules)
  moduleResolutionOptions: {
    // Directories where modules should be searched
    lookupDirectories: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'bower_components'),
      './custom_libs' // Added another lookup directory
    ],
    // Automatically resolve these extensions
    extensions: ['.js', '.json', '.lc', '.coffee'] // Added .lc and .coffee
  },

  // Rules for processing different types of modules
  processingRules: {
    ruleSet: [
      {
        fileMatcherRegex: /\.lc$/, // Regex to match .lc files (changed from .litcoffee)
        processorPipeline: [
          // Using object syntax for loaders for more explicit options (updated)
          {
            loader: 'coffee-loader',
            options: {
              literate: true,
              bare: true // Added another option to the loader
            }
          }
        ]
      }
    ]
  },

  // Enable source maps for easier debugging in development (added property)
  devtool: CURRENT_BUILD_ENVIRONMENT === 'development' ? 'eval-source-map' : false,

  // Array of webpack plugins to apply (added new fragment)
  plugins: [
    new moduleBundlerCore.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(CURRENT_BUILD_ENVIRONMENT),
      '__APP_VERSION__': JSON.stringify('1.0.0-beta') // Example of another defined constant
    })
  ]
};

// Export the complete configuration object
module.exports = applicationBundleConfig;