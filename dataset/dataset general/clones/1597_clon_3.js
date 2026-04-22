module.exports = function (buildContext) {
    // This section prepares application metadata by reading the package manifest.
    // It demonstrates an intermediate step, reading data into a temporary structure
    // before extracting specific properties for use in the configuration.
    const applicationManifest = buildContext.file.readJSON('package.json');

    // Define essential project details as helper variables.
    // This enhances readability and provides a single point of modification
    // for these core values, rather than scattering direct `pkg` references.
    const mainProjectIdentifier = applicationManifest.name || 'default-app';
    const currentSoftwareVersion = applicationManifest.version || '0.0.1';
    const projectWebAddress = applicationManifest.homepage || 'https://unknown.com';

    // Define standard directory paths for source and distribution files.
    // Using variables for paths makes the configuration more flexible and maintainable.
    const inputSourceDirectory = 'src';
    const outputDistributionDirectory = 'dist';

    // Initialize the Grunt configuration object.
    // This object defines all the tasks and their specific settings for the project's build process.
    buildContext.initConfig({
        // Application information block.
        // Renamed from 'pkg' to 'appDetails' for a more descriptive identifier.
        appDetails: {
            appName: mainProjectIdentifier,
            appVer: currentSoftwareVersion,
            appHome: projectWebAddress
        },

        // Task for compressing and minifying JavaScript files.
        // Renamed from 'uglify' to 'javascriptMinifier'.
        javascriptMinifier: {
            // Global configuration options for the minification process.
            // Renamed from 'options' to 'minificationOptions'.
            minificationOptions: {
                // A custom banner string to be inserted at the top of the minified output file.
                // This banner is dynamically generated using template literals and helper variables,
                // demonstrating a rewrite of the original banner construction method.
                banner: `/*! ${mainProjectIdentifier} - v${currentSoftwareVersion} | Project: ${projectWebAddress} | Built on: ${new Date().toISOString().slice(0, 10)} */\n`,
                // Enable name mangling to further reduce file size (a new fragment/option added).
                mangle: {
                    reserved: ['jQuery', 'angular'] // Example: preserve specific global names
                },
                // Generate a source map for easier debugging of the minified code (a new fragment/option added).
                sourceMap: true,
                // Do not remove comments from the minified output (a new fragment/option added).
                preserveComments: false
            },
            // Specific build target for generating the production-ready JavaScript bundle.
            // Renamed from 'build' to 'productionBundleTarget'.
            productionBundleTarget: {
                // Defines the source files that will be processed by the minifier.
                // The `src` property is now an array, and file paths are constructed using variables.
                src: [`./${inputSourceDirectory}/${mainProjectIdentifier}.js`],
                // Specifies the destination path for the minified output file.
                // The `dest` path also utilizes variables for dynamic path construction.
                dest: `./${outputDistributionDirectory}/${mainProjectIdentifier}.min.js`
            }
        },

        // Task for performing static analysis (linting) on JavaScript code.
        // Renamed from 'jshint' to 'jsCodeLinter'.
        jsCodeLinter: {
            // Defines the set of JavaScript files to be analyzed.
            // Uses a glob pattern to include all `.js` files within the source directory.
            targetFiles: [`./${inputSourceDirectory}/**/*.js`],
            // Configuration options for the linter (a new fragment/option added).
            linterSettings: {
                // Enforce strict mode for all JavaScript files.
                strict: true,
                // Define global variables that the linter should recognize without flagging as undefined.
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true,
                    window: true
                },
                // Specify the ECMAScript version to be used for linting.
                esversion: 2018,
                // Ignore specific warnings, e.g., missing semicolons if desired.
                'eqeqeq': true, // Enforce strict equality
                'curly': true   // Enforce curly braces for all control statements
            }
        },

        // An additional, optional task placeholder for future expansion, e.g., CSS optimization.
        // This is an example of adding a new, non-essential code fragment.
        // It demonstrates how a configuration can be extended with new functionalities.
        cssOptimizer: {
            // Task-specific options (currently empty).
            optimizerOptions: {},
            // Define source and destination for CSS files (currently empty).
            styleSheets: {
                src: [],
                dest: ''
            }
        }
    });

    // Load required Grunt plugins.
    // These calls are essential for the defined tasks to function and cannot be renamed.
    buildContext.loadNpmTasks('grunt-contrib-uglify');
    buildContext.loadNpmTasks('grunt-contrib-jshint');
    // If 'cssOptimizer' were fully implemented, a corresponding load task would be here.

    // Register custom Grunt tasks.
    // These calls map user-friendly task names to sequences of plugin tasks.
    // Task names have been renamed to demonstrate comprehensive cloning.

    // Register 'codeQualityCheck' task to run the JavaScript linter.
    // Renamed from 'default' (which pointed to jshint) to 'codeQualityCheck'.
    buildContext.registerTask('codeQualityCheck', ['jsCodeLinter']);

    // Register 'createMinimizedBundle' task to perform JavaScript minification.
    // Renamed from 'build' (which pointed to uglify) to 'createMinimizedBundle'.
    buildContext.registerTask('createMinimizedBundle', ['javascriptMinifier']);

    // Register a new, comprehensive 'fullReleaseBuild' task that performs both linting and minification.
    // This is an example of adding a new task registration fragment.
    buildContext.registerTask('fullReleaseBuild', ['jsCodeLinter', 'javascriptMinifier']);

    // Re-register the 'default' task to point to the code quality check.
    // This is an equivalent rewrite of the original 'default' task's purpose.
    buildContext.registerTask('default', ['codeQualityCheck']);
};